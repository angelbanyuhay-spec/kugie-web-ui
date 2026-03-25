import { createClient } from '@supabase/supabase-js';

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

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((p) => p.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function decodeJwtRole(token: string): string | null {
  // Decode without verifying signature; used only for a development/config sanity check.
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function GET({ request }: { request: Request }) {
  const cookieHeader = request.headers.get('cookie');

  const expectedToken = import.meta.env.ADMIN_COOKIE_TOKEN ?? 'dev-admin-cookie-token';
  const actualToken = getCookieValue(cookieHeader, 'admin_auth');

  if (!expectedToken || !actualToken || actualToken !== expectedToken) {
    return new Response(JSON.stringify({ error: { message: 'Unauthorized.' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: { message: 'Supabase server env vars missing.' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const jwtRole = decodeJwtRole(serviceRoleKey);
  if (jwtRole !== 'service_role') {
    return new Response(
      JSON.stringify({
        error: {
          message:
            'SUPABASE_SERVICE_ROLE_KEY does not appear to be a service_role key. Check your .env and use the real Supabase Service Role Key (not the anon key).',
          jwtRole,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabaseAdmin
    .from('order_submissions')
    .select(
      'id,created_at,customer_name,phone,address,payment_method,line_items,total_pesos,whatsapp_message,status,source_page,user_agent',
    )
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: { message: error.message } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: (data ?? []) as OrderRow[] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

