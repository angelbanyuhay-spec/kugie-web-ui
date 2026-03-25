import supabase from './client';
import {
  DEFAULT_MENU_IMAGE,
  MENU_COMBO_CATALOG,
  MENU_PRODUCT_CATALOG,
  prettifySlug,
  type MenuCombo,
  type MenuProduct,
} from '../../data/menu-catalog';

export type MenuItemRow = {
  slug: string;
  name: string | null;
  price_display: string | number | null;
  /** If your table uses `price` instead of `price_display`, include it in `.select(...)`. */
  price?: string | number | null;
  image_url: string | null;
};

export type MenuComboRow = {
  slug: string;
  name: string | null;
  items_description: string | null;
  price_display: string | number | null;
};

/** Safe for DB text, numeric prices, or null. */
function asTrimmedText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  return String(v).trim();
}

export function normalizeMenuSlug(v: unknown): string {
  return String(v ?? '').trim();
}

/**
 * - Every active `menu_items` row becomes a product (sorted by `sort_order`).
 * - Rows can use new `slug` values not in the local catalog; missing image uses default or catalog match by slug.
 * - Local catalog entries whose slug is absent from the DB are appended (offline / partial DB / legacy seed).
 * - If the query fails or returns nothing, the local catalog is used alone.
 */
function mergeProducts(rows: MenuItemRow[] | null | undefined): MenuProduct[] {
  if (rows == null || rows.length === 0) {
    return MENU_PRODUCT_CATALOG.map((p) => ({ ...p }));
  }

  const fallbackBySlug = new Map(MENU_PRODUCT_CATALOG.map((p) => [p.slug, p]));

  const fromDb: MenuProduct[] = rows
    .map((row) => {
      const slug = normalizeMenuSlug(row.slug);
      if (!slug) return null;
      const fb = fallbackBySlug.get(slug);
      const nameRaw = asTrimmedText(row.name);
      const name = nameRaw || fb?.name || prettifySlug(slug);
      const price =
        asTrimmedText(row.price_display) ||
        asTrimmedText(row.price) ||
        fb?.price ||
        '—';
      const imgRaw = asTrimmedText(row.image_url);
      const img = imgRaw || fb?.img || DEFAULT_MENU_IMAGE;
      return { slug, name, price, img };
    })
    .filter((x): x is MenuProduct => x != null);

  const dbSlugs = new Set(fromDb.map((p) => p.slug));
  const fromCatalogOnly = MENU_PRODUCT_CATALOG.filter((p) => !dbSlugs.has(p.slug));

  return [...fromDb, ...fromCatalogOnly];
}

function mergeCombos(rows: MenuComboRow[] | null | undefined): MenuCombo[] {
  if (rows == null || rows.length === 0) {
    return MENU_COMBO_CATALOG.map((c) => ({ ...c }));
  }

  const fallbackBySlug = new Map(MENU_COMBO_CATALOG.map((c) => [c.slug, c]));

  const fromDb: MenuCombo[] = rows
    .map((row) => {
      const slug = normalizeMenuSlug(row.slug);
      if (!slug) return null;
      const fb = fallbackBySlug.get(slug);
      const nameRaw = asTrimmedText(row.name);
      const name = nameRaw || fb?.name || prettifySlug(slug);
      const itemsRaw = asTrimmedText(row.items_description);
      const items = itemsRaw || fb?.items || '';
      const price = asTrimmedText(row.price_display) || fb?.price || '—';
      return { slug, name, items, price };
    })
    .filter((x): x is MenuCombo => x != null);

  // When Supabase has any combo rows, use them as the full list. If catalog and
  // DB used disjoint slug sets, appending catalog-only rows would duplicate the section.
  if (fromDb.length > 0) {
    return fromDb;
  }

  return MENU_COMBO_CATALOG.map((c) => ({ ...c }));
}

function safeMerge(
  itemsRes: { data: unknown; error: Error | null },
  combosRes: { data: unknown; error: Error | null },
): { products: MenuProduct[]; combos: MenuCombo[] } {
  try {
    const itemRows =
      itemsRes.error || !Array.isArray(itemsRes.data) ? null : (itemsRes.data as MenuItemRow[]);
    const comboRows =
      combosRes.error || !Array.isArray(combosRes.data) ? null : (combosRes.data as MenuComboRow[]);
    return {
      products: mergeProducts(itemRows),
      combos: mergeCombos(comboRows),
    };
  } catch (e) {
    console.error('[menu pricing] merge failed, using local catalog:', e);
    return {
      products: MENU_PRODUCT_CATALOG.map((p) => ({ ...p })),
      combos: MENU_COMBO_CATALOG.map((c) => ({ ...c })),
    };
  }
}

export async function fetchMenuPricingFromSupabase(): Promise<{
  products: MenuProduct[];
  combos: MenuCombo[];
}> {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[menu pricing] PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY missing — using local catalog only.');
    return {
      products: MENU_PRODUCT_CATALOG.map((p) => ({ ...p })),
      combos: MENU_COMBO_CATALOG.map((c) => ({ ...c })),
    };
  }

  const [itemsRes, combosRes] = await Promise.all([
    supabase
      .from('menu_items')
      .select('slug,name,price_display,image_url')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('menu_combos')
      .select('slug,name,items_description,price_display')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (itemsRes.error) {
    console.warn('[menu pricing] menu_items:', itemsRes.error.message, itemsRes.error);
  } else if (Array.isArray(itemsRes.data) && itemsRes.data.length === 0) {
    console.warn(
      '[menu pricing] menu_items: 0 rows (check table name `menu_items`, RLS SELECT for `anon`, and `active = true`).',
    );
  }

  if (combosRes.error) {
    console.warn('[menu pricing] menu_combos:', combosRes.error.message, combosRes.error);
  } else if (Array.isArray(combosRes.data) && combosRes.data.length === 0) {
    console.warn(
      '[menu pricing] menu_combos: 0 rows (check table name `menu_combos`, RLS SELECT for `anon`, and `active = true`).',
    );
  }

  const itemsRowCount = Array.isArray(itemsRes.data) ? itemsRes.data.length : 0;
  const combosRowCount = Array.isArray(combosRes.data) ? combosRes.data.length : 0;
  if (itemsRes.error) {
    console.warn(
      '[menu pricing] OUR MENU uses catalog prices until `menu_items` loads — fix the error above (RLS, table/column names, or `active`).',
    );
  } else if (itemsRowCount === 0 && combosRowCount > 0) {
    console.warn(
      '[menu pricing] `menu_combos` returned data but `menu_items` returned 0 rows — OUR MENU still shows catalog prices. Set `active = true` on menu rows, confirm table name `menu_items`, and RLS SELECT for role `anon`.',
    );
  } else if (import.meta.env.DEV && itemsRowCount > 0) {
    console.debug('[menu pricing] menu_items:', itemsRowCount, 'row(s) from Supabase → merged for OUR MENU');
  }

  return safeMerge(itemsRes, combosRes);
}
