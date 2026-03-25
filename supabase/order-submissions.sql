-- Run in Supabase SQL Editor after menu-pricing tables (same project as site).

create table if not exists public.order_submissions (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  payment_method text not null check (payment_method in ('cod', 'ewallet')),
  line_items jsonb not null default '[]'::jsonb,
  total_pesos int not null check (total_pesos >= 0),
  whatsapp_message text,
  status text not null default 'new',
  source_page text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists order_submissions_created_at_idx on public.order_submissions (created_at desc);

alter table public.order_submissions enable row level security;

drop policy if exists "Allow public insert order_submissions" on public.order_submissions;
create policy "Allow public insert order_submissions"
  on public.order_submissions for insert
  to anon, authenticated
  with check (true);

-- `supabase-js` uses PostgREST schema introspection; without table-level `SELECT`
-- (and a `SELECT` RLS policy), PostgREST may hide the table from the schema cache.
-- We still prevent anon from reading rows via an always-false RLS policy.
grant usage on schema public to anon, authenticated;
grant insert on table public.order_submissions to anon, authenticated;
grant select on table public.order_submissions to anon, authenticated;

drop policy if exists "Deny anon select order_submissions" on public.order_submissions;
create policy "Deny anon select order_submissions"
  on public.order_submissions for select
  to anon, authenticated
  using (false);

-- Refresh Supabase PostgREST schema cache so `supabase-js` can see the table immediately.
NOTIFY pgrst, 'reload schema';
