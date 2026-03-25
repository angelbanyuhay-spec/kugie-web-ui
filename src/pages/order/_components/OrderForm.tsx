import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, ReceiptText, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  MENU_PRODUCT_CATALOG,
  MENU_COMBO_CATALOG,
  type MenuProduct,
  type MenuCombo,
} from '../../../data/menu-catalog';
import { submitOrderToSupabase, type OrderLineItem } from '../../../lib/supabase/submit-order';
import { VISIT_US_CONTENT } from '../../../data/visit-us-data';

const EWALLET_NUMBER = VISIT_US_CONTENT.branches[0].phone;
const EWALLET_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
  `GCash/Maya payment to ${EWALLET_NUMBER}`,
)}`;
const COURIER_NOTE =
  'Delivery / courier fee is paid separately to the rider (not included in the total below).';

function pesoToNumber(display: string | number | undefined | null): number {
  if (display == null) return 0;
  if (typeof display === 'number') return Number.isFinite(display) ? Math.round(display) : 0;
  const n = parseInt(String(display).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function formatPeso(n: number) {
  return `₱${n.toLocaleString('en-PH')}`;
}

const INITIAL_PRODUCTS = MENU_PRODUCT_CATALOG.map(p => ({ ...p }));
const INITIAL_COMBOS = MENU_COMBO_CATALOG.map(c => ({ ...c }));

const INITIAL_QTY: Record<string, number> = {};
for (const p of MENU_PRODUCT_CATALOG) INITIAL_QTY[p.slug] = 0;
for (const c of MENU_COMBO_CATALOG) INITIAL_QTY[c.slug] = 0;

export default function OrderForm() {
  const [products, setProducts] = useState<MenuProduct[]>(INITIAL_PRODUCTS);
  const [combos, setCombos] = useState<MenuCombo[]>(INITIAL_COMBOS);
  const [quantities, setQuantities] = useState<Record<string, number>>({ ...INITIAL_QTY });
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<'cod' | 'ewallet'>('cod');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('../../../lib/supabase/menu-pricing')
      .then(mod => mod.fetchMenuPricingFromSupabase())
      .then(data => {
        if (cancelled) return;
        setProducts(data.products);
        setCombos(data.combos);
        setQuantities(prev => {
          const next = { ...prev };
          for (const p of data.products) {
            if (!(p.slug in next)) next[p.slug] = 0;
          }
          for (const c of data.combos) {
            if (!(c.slug in next)) next[c.slug] = 0;
          }
          // Ensure sold-out items never carry quantity.
          next.nuggets = 0;
          return next;
        });
      })
      .catch(e => console.warn('[order] Could not load live pricing, using defaults:', e));
    return () => { cancelled = true; };
  }, []);

  function changeQty(slug: string, delta: number) {
    if (slug === 'nuggets' && delta > 0) return;
    setQuantities(prev => {
      const cur = prev[slug] ?? 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [slug]: next };
    });
  }

  const { productRows, comboRows, subtotal, itemCount } = useMemo(() => {
    const pRows: { label: string; qty: number; unit: number; line: number }[] = [];
    const cRows: { label: string; qty: number; unit: number; line: number }[] = [];
    let sub = 0;
    let count = 0;

    for (const p of products) {
      const qty = quantities[p.slug] ?? 0;
      if (qty < 1) continue;
      const unit = pesoToNumber(p.price);
      const line = qty * unit;
      sub += line;
      count += qty;
      pRows.push({ label: p.name, qty, unit, line });
    }
    for (const c of combos) {
      const qty = quantities[c.slug] ?? 0;
      if (qty < 1) continue;
      const unit = pesoToNumber(c.price);
      const line = qty * unit;
      sub += line;
      count += qty;
      cRows.push({ label: c.name, qty, unit, line });
    }
    return { productRows: pRows, comboRows: cRows, subtotal: sub, itemCount: count };
  }, [products, combos, quantities]);

  const grandTotal = subtotal;

  async function handleSubmit() {
    setFormError(null);
    setSuccessMessage(null);

    const name = customerName.trim();
    const ph = phone.trim();
    const addr = address.trim();

    if (!name || !ph || !addr) {
      setFormError('Please fill in your name, phone number, and delivery address.');
      return;
    }
    if (itemCount === 0) {
      setFormError('Add at least one item to your order.');
      return;
    }

    const lineItems: OrderLineItem[] = [];
    for (const p of products) {
      const qty = quantities[p.slug] ?? 0;
      if (qty < 1) continue;
      const unit = pesoToNumber(p.price);
      lineItems.push({ kind: 'product', slug: p.slug, label: p.name, qty, unit_pesos: unit, line_pesos: qty * unit });
    }
    for (const c of combos) {
      const qty = quantities[c.slug] ?? 0;
      if (qty < 1) continue;
      const unit = pesoToNumber(c.price);
      lineItems.push({ kind: 'combo', slug: c.slug, label: c.name, qty, unit_pesos: unit, line_pesos: qty * unit });
    }

    const payLabel = payment === 'cod' ? 'Cash on Delivery' : 'GCash / Maya';
    const allRows = [...productRows, ...comboRows];
    const msg = [
      '*Kugiebites order*', '',
      `Name: ${name}`, `Phone: ${ph}`, `Address: ${addr}`, `Payment: ${payLabel}`, '',
      '*Items*',
      ...allRows.map(r => `${r.qty}× ${r.label} @ ${formatPeso(r.unit)} = ${formatPeso(r.line)}`),
      '', `Subtotal (food): ${formatPeso(subtotal)}`, `_${COURIER_NOTE}_`,
      `*Total (food only): ${formatPeso(grandTotal)}*`,
    ].join('\n');

    setSubmitting(true);
    try {
      const { error } = await submitOrderToSupabase({
        customer_name: name,
        phone: ph,
        address: addr,
        payment_method: payment,
        line_items: lineItems,
        total_pesos: grandTotal,
        whatsapp_message: msg,
      });

      if (error) {
        console.error('[order]', error);
        setFormError(error.message || 'Could not save your order. Please try again.');
        return;
      }

      setSuccessMessage('Order saved. We will contact you shortly.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#f49d03] outline-none transition-all';

  return (
    <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#ebcc8f' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="text-2xl sm:text-3xl font-black tracking-tighter" style={{ color: '#f49d03' }}>
            KUGIEBITES
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest hover:text-[#c8994f] transition sm:self-auto sm:text-sm"
          >
            <ArrowLeft size={16} />
            Back to menu
          </a>
        </div>
      </nav>

      {/* Order Form */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">

          {/* LEFT: item selector + customer info */}
          <div className="p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h1 className="text-3xl sm:text-4xl font-black italic mb-8" style={{ color: '#c8994f' }}>
              SELECT YOUR BITES
            </h1>

            {/* Products */}
            <div className="space-y-3 mb-6">
              {products.map(item => {
                const qty = quantities[item.slug] ?? 0;
                const soldOut = item.slug === 'nuggets';
                return (
                  <div key={item.slug} className={`flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent transition-all ${soldOut ? 'opacity-75' : 'hover:border-[#f49d03]/30'}`}>
                    <div>
                      <p className="font-black text-gray-800 uppercase text-sm">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[#c8994f] font-bold text-sm">{item.price}</p>
                        {soldOut && (
                          <span className="text-[10px] font-black uppercase tracking-widest rounded-full bg-[#f49d03]/10 text-[#f49d03] px-2 py-1">
                            Sold out
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm">
                      <button
                        type="button"
                        onClick={() => changeQty(item.slug, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-black text-xl w-6 text-center tabular-nums">{qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.slug, 1)}
                        disabled={soldOut}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-white shadow-md transition-all ${
                          soldOut ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#f49d03] hover:scale-105 active:scale-95'
                        }`}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Combos */}
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Combos</p>
            <div className="space-y-3 mb-8">
              {combos.map(combo => {
                const qty = quantities[combo.slug] ?? 0;
                return (
                  <div key={combo.slug} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#f49d03]/30 transition-all">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{combo.name}</p>
                      {combo.items && <p className="text-xs text-gray-500">{combo.items}</p>}
                      <p className="text-[#c8994f] font-bold text-sm">{combo.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm">
                      <button
                        type="button"
                        onClick={() => changeQty(combo.slug, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="font-black text-xl w-6 text-center tabular-nums">{qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(combo.slug, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#f49d03] text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer info */}
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Your details</p>
            <div className="space-y-3">
              <input type="text" placeholder="Full name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputCls} />
              <input type="tel" placeholder="Mobile number" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
              <textarea rows={2} placeholder="Complete delivery address" value={address} onChange={e => setAddress(e.target.value)} className={`${inputCls} resize-none`} />
            </div>

            {/* Payment */}
            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Payment method</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="peer sr-only" />
                  <div className="flex h-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-sm font-bold transition-all peer-checked:border-[#f49d03] peer-checked:bg-[#f49d03]/10">
                    Cash on delivery
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="payment" value="ewallet" checked={payment === 'ewallet'} onChange={() => setPayment('ewallet')} className="peer sr-only" />
                  <div className="flex h-12 items-center justify-center rounded-2xl border-2 border-gray-100 text-sm font-bold transition-all peer-checked:border-[#f49d03] peer-checked:bg-[#f49d03]/10">
                    GCash / Maya
                  </div>
                </label>
              </div>

              {payment === 'ewallet' && (
                <div className="mt-4 rounded-2xl border border-[#f49d03]/25 bg-[#f49d03]/5 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#c8994f] mb-3">GCash / Maya Details</p>
                  <img
                    src={EWALLET_QR_URL}
                    alt="GCash or Maya QR code"
                    className="mx-auto w-44 h-44 rounded-xl border border-gray-200 bg-white"
                    loading="lazy"
                  />
                  <p className="mt-3 text-center text-xs text-gray-500">Scan to pay</p>
                  <p className="text-center text-base font-black text-gray-800 tracking-wide">{EWALLET_NUMBER}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: live receipt */}
          <div className="p-6 sm:p-10 bg-gray-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8 opacity-50">
                <ReceiptText size={20} />
                <h3 className="font-black uppercase tracking-widest text-xs">Order Summary</h3>
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 mb-4">
                  {formError}
                </div>
              )}

              {successMessage && !formError && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 mb-4">
                  {successMessage}
                </div>
              )}

              <div className="space-y-3">
                {[...productRows, ...comboRows].map((row, i) => (
                  <div key={`${row.label}-${i}`} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <span className="text-[#f49d03] font-black mr-1">{row.qty}×</span>
                      {row.label}
                    </span>
                    <span className="font-bold tabular-nums">{formatPeso(row.line)}</span>
                  </div>
                ))}

                {itemCount === 0 && (
                  <p className="text-center py-10 text-gray-400 italic text-sm">
                    No items selected yet.
                  </p>
                )}
              </div>

              {itemCount > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal (food)</span>
                    <span className="font-bold tabular-nums">{formatPeso(subtotal)}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-500">{COURIER_NOTE}</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-6 gap-2">
                <span className="font-bold uppercase text-xs tracking-widest text-gray-400">Food total</span>
                <span className="text-3xl sm:text-4xl font-black text-[#f49d03] tabular-nums">{formatPeso(grandTotal)}</span>
              </div>

              <button
                type="button"
                disabled={submitting || itemCount === 0}
                onClick={handleSubmit}
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl
                  ${itemCount > 0 && !submitting
                    ? 'bg-[#c8994f] text-white hover:shadow-[#c8994f]/30 hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {submitting ? 'Saving order…' : 'PLACE ORDER'}
                <ArrowRight size={20} />
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">Saves to our system, then opens WhatsApp.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
