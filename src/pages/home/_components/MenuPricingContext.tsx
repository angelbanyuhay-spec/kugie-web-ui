import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MENU_COMBO_CATALOG, MENU_PRODUCT_CATALOG, type MenuCombo, type MenuProduct } from '../../../data/menu-catalog';
import { fetchMenuPricingFromSupabase } from '../../../lib/supabase/menu-pricing';

type MenuPricingContextValue = {
  products: MenuProduct[];
  combos: MenuCombo[];
  loading: boolean;
  refresh: () => void;
};

const MenuPricingContext = createContext<MenuPricingContextValue>({
  products: MENU_PRODUCT_CATALOG,
  combos: MENU_COMBO_CATALOG,
  loading: true,
  refresh: () => {},
});

export function MenuPricingProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<MenuProduct[]>(() => MENU_PRODUCT_CATALOG.map((p) => ({ ...p })));
  const [combos, setCombos] = useState<MenuCombo[]>(() => MENU_COMBO_CATALOG.map((c) => ({ ...c })));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      const next = await fetchMenuPricingFromSupabase();
      if (signal?.cancelled) return;
      setProducts(next.products);
      setCombos(next.combos);
    } catch (e) {
      console.error('[menu pricing] fetch failed — still showing local catalog:', e);
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const state = { cancelled: false };
    setLoading(true);
    load(state);
    return () => {
      state.cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const state = { cancelled: false };
      load(state);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const refresh = useCallback(() => {
    const state = { cancelled: false };
    setLoading(true);
    void load(state);
  }, [load]);

  const value = useMemo(
    () => ({ products, combos, loading, refresh }),
    [products, combos, loading, refresh],
  );
  return <MenuPricingContext.Provider value={value}>{children}</MenuPricingContext.Provider>;
}

export function useMenuPricing() {
  return useContext(MenuPricingContext);
}
