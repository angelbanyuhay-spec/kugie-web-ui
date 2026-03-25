export type OrderLineItem = {
  kind: 'product' | 'combo';
  slug: string;
  label: string;
  qty: number;
  unit_pesos: number;
  line_pesos: number;
};

export type SubmitOrderPayload = {
  customer_name: string;
  phone: string;
  address: string;
  payment_method: 'cod' | 'ewallet';
  line_items: OrderLineItem[];
  total_pesos: number;
  whatsapp_message: string;
};

export function submitOrderToSupabase(payload: SubmitOrderPayload) {
  // Client-only insert was failing because PostgREST schema cache was missing
  // the `order_submissions` table. Submitting via our own API endpoint avoids that.
  return fetch('/api/submit-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(async res => {
    const raw = await res.text();
    if (!res.ok) {
      let msg = raw;
      try {
        const j = JSON.parse(raw);
        msg = j?.error?.message ?? j?.message ?? raw;
      } catch {
        // ignore
      }

      return {
        data: null,
        error: { message: msg, status: res.status },
      };
    }

    let data: unknown = null;
    try {
      const j = JSON.parse(raw);
      data = j?.data ?? null;
    } catch {
      data = null;
    }

    return { data, error: null };
  });
}
