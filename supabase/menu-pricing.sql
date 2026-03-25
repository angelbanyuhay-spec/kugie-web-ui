-- Run in Supabase SQL Editor. Adjust RLS if you use custom roles.

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text,
  price_display text not null,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_combos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text,
  items_description text,
  price_display text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;
alter table public.menu_combos enable row level security;

drop policy if exists "Allow public read menu_items" on public.menu_items;
create policy "Allow public read menu_items"
  on public.menu_items for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Allow public read menu_combos" on public.menu_combos;
create policy "Allow public read menu_combos"
  on public.menu_combos for select
  to anon, authenticated
  using (active = true);

-- Seed / upsert: aligns with `src/data/menu-catalog.ts` and your live prices.
-- Include `active` so re-running re-publishes rows (anon RLS only selects active = true).
insert into public.menu_items (slug, name, price_display, image_url, sort_order, active) values
  ('burger', 'Cheesy Burger', '₱35', '/images/burger.jpg', 1, true),
  ('cheesestick', 'Cheesesticks', '₱25', '/images/cheesestick.jpg', 2, true),
  ('nuggets', 'Chicken Nuggets', '₱59', null, 3, true),
  ('fries', 'Crispy Fries', '₱20', '/images/fries.jpg', 4, true),
  ('hashbrown', 'Golden Hashbrown', '₱20', '/images/hasbrown.jpg', 5, true)
on conflict (slug) do update set
  name = excluded.name,
  price_display = excluded.price_display,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.menu_combos (slug, name, items_description, price_display, sort_order, active) values
  ('b1t1', 'B1T1 Cheesy Burger', '2 Burgers', '₱59', 1, true),
  ('c2f', 'Combo 2F', '2 Burgers + Fries', '₱75', 2, true),
  ('c1h', 'Combo 1H', 'Burger + Hashbrown', '₱49', 3, true),
  ('c1f', 'Combo 1F', 'Burger + Fries', '₱49', 4, true),
  ('c2h', 'Combo 2H', '2 Burgers + Hashbrown', '₱75', 5, true),
  ('bc', 'Barkada Combo', '4 Burgers + 2 Fries + 2 Hashbrown', '₱189', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  items_description = excluded.items_description,
  price_display = excluded.price_display,
  sort_order = excluded.sort_order,
  active = excluded.active;

-- Add more rows anytime (unique `slug`, `active = true` to show on site).
-- Example new item:
-- insert into public.menu_items (slug, name, price_display, image_url, sort_order, active) values
--   ('iced_coffee', 'Iced Coffee', '₱55', 'https://example.com/photo.jpg', 10, true);
--
-- Example new combo:
-- insert into public.menu_combos (slug, name, items_description, price_display, sort_order, active) values
--   ('family_box', 'Family Box', '2 Burgers + 2 Fries + 2 Drinks', '₱399', 10, true);
--
-- `sort_order` controls display order (lower first). Set `active = false` to hide without deleting.
