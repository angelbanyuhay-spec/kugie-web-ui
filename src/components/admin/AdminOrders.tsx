import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { LOGO_URL } from '../../constants';

type OrderLineItem = {
  kind: 'product' | 'combo';
  slug: string;
  label: string;
  qty: number;
  unit_pesos: number;
  line_pesos: number;
};

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: 'cod' | 'ewallet';
  line_items: OrderLineItem[];
  total_pesos: number;
  whatsapp_message: string | null;
  status: string;
  source_page: string | null;
  user_agent: string | null;
};

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPeso(n: number) {
  return `₱${n.toLocaleString('en-PH')}`;
}

export default function AdminOrders() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = `${o.customer_name} ${o.phone} ${o.address} ${o.payment_method} ${o.status} ${o.source_page ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, query, statusFilter]);

  async function loadOrders() {
    setIsLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/orders', { method: 'GET', credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setOrders([]);
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const body = (await res.json()) as { data: OrderRow[] };
      setOrders(body.data ?? []);
      setIsAuthenticated(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setLoadError('');

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = (body && body.error && body.error.message) || 'Incorrect password.';
        setPasswordError(msg);
        setIsAuthenticated(false);
        setOrders([]);
        return;
      }

      setPassword('');
      await loadOrders();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#ebcc8f' }}>
        <section className="scroll-mt-24 py-12 sm:py-16 md:py-20 px-4 sm:px-8 bg-[#ebcc8f]/20">
          <div className="max-w-3xl mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-10 border-b border-gray-100">
              <div className="text-center mb-8">
                <img src={LOGO_URL} alt="Kugiebites" className="w-16 h-16 object-contain mx-auto mb-4" />
                <h1 className="text-3xl sm:text-4xl font-black italic" style={{ color: '#c8994f' }}>
                  ADMIN ORDERS
                </h1>
                <p className="text-gray-600 mt-3">Enter password to view order submissions.</p>
              </div>

              <form onSubmit={onLogin} className="max-w-xl mx-auto">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#f49d03] outline-none transition-all mb-4"
                />
                {passwordError && <p className="text-red-700 text-sm mb-4 font-semibold">{passwordError}</p>}
                {loadError && <p className="text-red-700 text-sm mb-4 font-semibold">{loadError}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
                    !isLoading
                      ? 'bg-[#f49d03] text-white hover:shadow-[#f49d03]/30 hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Checking…' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: '#ebcc8f' }}>
      <section className="scroll-mt-24 py-8 sm:py-12 md:py-16 px-4 sm:px-8 bg-[#ebcc8f]/20">
        <div className="max-w-6xl mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={LOGO_URL} alt="Kugiebites" className="w-14 h-14 object-contain" />
                  <h1 className="text-3xl sm:text-4xl font-black italic" style={{ color: '#c8994f' }}>
                    ADMIN ORDERS
                  </h1>
                </div>
                <p className="text-gray-600">
                  Showing <span className="font-bold text-gray-800">{filtered.length}</span> submissions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => void loadOrders()}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-2xl font-black transition-all shadow-lg ${
                    !isLoading
                      ? 'bg-[#c8994f] text-white hover:shadow-[#c8994f]/30 hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  onClick={() => {
                    void (async () => {
                      try {
                        await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                      } catch {
                        // ignore
                      }
                      setIsAuthenticated(false);
                      setOrders([]);
                      setPassword('');
                      setQuery('');
                      setStatusFilter('all');
                    })();
                  }}
                  className="px-4 py-3 rounded-2xl font-black bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {loadError && <p className="text-red-700 text-sm mb-3 font-semibold">{loadError}</p>}

            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, phone, address, status…"
                className="w-full md:max-w-md px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#f49d03] outline-none transition-all"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#f49d03] outline-none transition-all"
              >
                <option value="all">All statuses</option>
                <option value="new">new</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Created</th>
                    <th className="text-left font-semibold px-4 py-3">Customer</th>
                    <th className="text-left font-semibold px-4 py-3">Contact</th>
                    <th className="text-left font-semibold px-4 py-3">Payment</th>
                    <th className="text-left font-semibold px-4 py-3">Total</th>
                    <th className="text-left font-semibold px-4 py-3">Status</th>
                    <th className="text-left font-semibold px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/60 align-top">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">{formatDateTime(o.created_at)}</div>
                        <div className="text-gray-500 text-xs">{o.source_page ?? '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{o.customer_name}</div>
                        <div className="text-gray-600 text-xs break-all">{o.address}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-800">{o.phone}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-800">{o.payment_method}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800">{formatPeso(o.total_pesos)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">{o.status}</div>
                      </td>
                      <td className="px-4 py-3">
                        <details className="group">
                          <summary className="cursor-pointer select-none text-[#c8994f] font-semibold">View</summary>
                          <div className="mt-2 text-xs text-gray-700 space-y-2">
                            <div>
                              <div className="font-semibold mb-1">Items</div>
                              <div className="max-w-[420px] overflow-x-auto">
                                {o.line_items && o.line_items.length > 0 ? (
                                  <table className="min-w-full">
                                    <thead>
                                      <tr>
                                        <th className="pr-2 text-left">Qty</th>
                                        <th className="pr-2 text-left">Item</th>
                                        <th className="pr-2 text-left">Line</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {o.line_items.map((li, idx) => (
                                        <tr key={`${li.slug}-${idx}`}>
                                          <td className="pr-2">{li.qty}</td>
                                          <td className="pr-2">{li.label}</td>
                                          <td className="pr-2">{formatPeso(li.line_pesos)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-gray-500">—</div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold mb-1">WhatsApp message</div>
                              <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-2 max-w-[520px] overflow-x-auto">
                                {o.whatsapp_message ?? '—'}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                        No orders match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

