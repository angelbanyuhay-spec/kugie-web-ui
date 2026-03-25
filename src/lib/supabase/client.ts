import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) {
    console.warn('[supabase] PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY not set.');
  }

  try {
    _client = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.error('[supabase] createClient failed:', e);
    _client = createClient('https://placeholder.supabase.co', 'placeholder', {
      auth: { persistSession: false },
    });
  }

  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default supabase;
