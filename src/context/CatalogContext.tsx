import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SEED_PRODUCTS, indexById, type Product } from '../data/products';
import { api } from '../lib/api';

interface CatalogState {
  products: Product[];
  byId: Record<string, Product>;
  /** True once the live catalogue has loaded (or failed and we kept the bundled one). */
  ready: boolean;
}

const CatalogContext = createContext<CatalogState | null>(null);

/** Live catalogue from /api/products, rendered immediately from the bundled launch catalogue. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .products()
      .then((live) => !cancelled && live.length && setProducts(live))
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ products, byId: indexById(products), ready }), [products, ready]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
