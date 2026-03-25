import { createClient } from '@supabase/supabase-js';

type OrderLineItem = {
  kind: 'product' | 'combo';
  slug: string;
  label: string;
  qty: number;
  unit_pesos: number;
  line_pesos: number;
};

type SubmitOrderPayload = {
  customer_name: string;
  phone: string;
  address: string;
  payment_method: 'cod' | 'ewallet';
  line_items: OrderLineItem[];
  total_pesos: number;
  whatsapp_message: string;
};

export async function POST({ request }: { request: Request }) {
  let payload: SubmitOrderPayload;
  try {
    payload = (await request.json()) as SubmitOrderPayload;
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Invalid JSON body.' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        error: { message: 'Supabase server env vars missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const insertRow = {
    customer_name: payload.customer_name,
    phone: payload.phone,
    address: payload.address,
    payment_method: payload.payment_method,
    line_items: payload.line_items,
    total_pesos: payload.total_pesos,
    whatsapp_message: payload.whatsapp_message,
    status: 'new',
    source_page: null,
    user_agent: request.headers.get('user-agent'),
  };

  const { error } = await supabaseAdmin.from('order_submissions').insert(insertRow);

  if (error) {
    return new Response(
      JSON.stringify({
        error: { message: error.message },
        debug: {
          supabaseHost: supabaseUrl ? new URL(supabaseUrl).host : null,
        },
      }),
      {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

