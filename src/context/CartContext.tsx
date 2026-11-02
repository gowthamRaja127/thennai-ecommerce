import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_LINE, type Product } from '../data/products';
import { quote } from '../lib/pricing';
import { track } from '../lib/analytics';
import { useCatalog } from './CatalogContext';

export interface CartLine {
  key: string;
  productId: string;
  variant: string;
  quantity: number;
}

/** A cart line joined with its live product. */
export interface CartItem extends CartLine {
  product: Product;
  lineTotal: number;
}

type Action =
  | { type: 'add'; productId: string; variant: string; quantity: number }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const key = `${action.productId}::${action.variant}`;
      const existing = state.find((l) => l.key === key);
      if (existing) {
        return state.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY_PER_LINE, l.quantity + action.quantity) } : l));
      }
      return [...state, { key, productId: action.productId, variant: action.variant, quantity: Math.min(MAX_QTY_PER_LINE, action.quantity) }];
    }
    case 'setQty':
      if (action.quantity <= 0) return state.filter((l) => l.key !== action.key);
      return state.map((l) => (l.key === action.key ? { ...l, quantity: Math.min(MAX_QTY_PER_LINE, action.quantity) } : l));
    case 'remove':
      return state.filter((l) => l.key !== action.key);
    case 'clear':
      return [];
  }
}

const STORAGE_KEY = 'th-cart-v2';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((l) => typeof l.productId === 'string' && typeof l.variant === 'string' && Number.isInteger(l.quantity) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

interface AddOptions {
  quantity?: number;
  openDrawer?: boolean;
  /** Where the add happened, for analytics (e.g. "product-page"). */
  source?: string;
}

interface CartState {
  /** Lines whose product (and variant) is currently on sale, joined with product data. */
  items: CartItem[];
  /** Lines dropped because the product or variant is no longer available. */
  unavailable: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  amountToFreeShipping: number;
  freeShippingProgress: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string, variant: string, options?: AddOptions) => void;
  setQty: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { byId, ready } = useCatalog();
  const [lines, dispatch] = useReducer(reducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  // Once the live catalogue is in, quietly drop lines that can no longer be bought.
  const unavailable = useMemo(
    () => (ready ? lines.filter((l) => !byId[l.productId]?.active || !byId[l.productId].variants.includes(l.variant)) : []),
    [lines, byId, ready],
  );
  useEffect(() => {
    unavailable.forEach((l) => dispatch({ type: 'remove', key: l.key }));
  }, [unavailable]);

  const value = useMemo<CartState>(() => {
    const valid = lines.filter((l) => byId[l.productId] && byId[l.productId].variants.includes(l.variant));
    const priced = quote(valid, byId);
    const items = valid.map((l, i) => ({ ...l, product: byId[l.productId], lineTotal: priced.lines[i].lineTotal }));
    return {
      items,
      unavailable,
      itemCount: items.reduce((n, l) => n + l.quantity, 0),
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - priced.subtotal),
      freeShippingProgress: Math.min(100, (priced.subtotal / FREE_SHIPPING_THRESHOLD) * 100),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (productId, variant, { quantity = 1, openDrawer = true, source } = {}) => {
        dispatch({ type: 'add', productId, variant, quantity });
        track('add_to_cart', productId, { variant, quantity, source });
        if (openDrawer) setIsOpen(true);
      },
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [lines, byId, unavailable, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
