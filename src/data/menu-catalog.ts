/** Shown when a DB row has no `image_url` and no local fallback for that slug. */
export const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

/** Optional emoji per slug for the order form; unknown slugs use 🍽️ */
export const MENU_ITEM_ICONS: Record<string, string> = {
  burger: '🍔',
  fries: '🍟',
  cheesestick: '🧀',
  hashbrown: '🥔',
  nuggets: '🍗',
};

export function prettifySlug(slug: string): string {
  return slug
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Local defaults; Supabase can add more rows or override these by matching `slug`. */
export type MenuProduct = {
  slug: string;
  name: string;
  price: string;
  img: string;
};

export type MenuCombo = {
  slug: string;
  name: string;
  items: string;
  price: string;
};

export const MENU_PRODUCT_CATALOG: MenuProduct[] = [
  {
    slug: 'burger',
    name: 'Cheesy Burger',
    price: '₱35',
    img: '/images/burger.jpg',
  },
  {
    slug: 'fries',
    name: 'Crispy Fries',
    price: '₱20',
    img: '/images/fries.jpg',
  },
  {
    slug: 'cheesestick',
    name: 'Cheesesticks',
    price: '₱25',
    img: '/images/cheesestick.jpg',
  },
  {
    slug: 'hashbrown',
    name: 'Golden Hashbrown',
    price: '₱20',
    img: '/images/hasbrown.jpg',
  },
  {
    slug: 'nuggets',
    name: 'Chicken Nuggets',
    price: '₱59',
    img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
  },
];

/** Matches `menu_combos.slug` / seed in `supabase/menu-pricing.sql` (sort order when offline). */
export const MENU_COMBO_CATALOG: MenuCombo[] = [
  { slug: 'b1t1', name: 'B1T1 Cheesy Burger', items: '2 Burgers', price: '₱59' },
  { slug: 'c2f', name: 'Combo 2F', items: '2 Burgers + Fries', price: '₱75' },
  { slug: 'c1h', name: 'Combo 1H', items: 'Burger + Hashbrown', price: '₱49' },
  { slug: 'c1f', name: 'Combo 1F', items: 'Burger + Fries', price: '₱49' },
  { slug: 'c2h', name: 'Combo 2H', items: '2 Burgers + Hashbrown', price: '₱75' },
  { slug: 'bc', name: 'Barkada Combo', items: '4 Burgers + 2 Fries + 2 Hashbrown', price: '₱189' },
];

/** @deprecated Use MENU_PRODUCT_CATALOG */
export const LANDING_PRODUCTS = MENU_PRODUCT_CATALOG;
/** @deprecated Use MENU_COMBO_CATALOG */
export const LANDING_COMBOS = MENU_COMBO_CATALOG;
