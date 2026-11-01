import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { FREE_SHIPPING_THRESHOLD, PRODUCTS, SHIPPING_FEE, type ProductId } from '../data/products';

export interface CartLine {
  key: string;
  productId: ProductId;
  variant: string;
  quantity: number;
}

type Action =
  | { type: 'add'; productId: ProductId; variant: string }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

const MAX_QTY = 10;

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const key = `${action.productId}::${action.variant}`;
      const existing = state.find((l) => l.key === key);
      if (existing) {
        return state.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + 1) } : l));
      }
      return [...state, { key, productId: action.productId, variant: action.variant, quantity: 1 }];
    }
    case 'setQty':
      if (action.quantity <= 0) return state.filter((l) => l.key !== action.key);
      return state.map((l) => (l.key === action.key ? { ...l, quantity: Math.min(MAX_QTY, action.quantity) } : l));
    case 'remove':
      return state.filter((l) => l.key !== action.key);
    case 'clear':
      return [];
  }
}

const STORAGE_KEY = 'th-cart-v1';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l.productId in PRODUCTS && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

interface CartState {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  amountToFreeShipping: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: ProductId, variant: string, openDrawer?: boolean) => void;
  setQty: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const value = useMemo<CartState>(() => {
    const subtotal = lines.reduce((sum, l) => sum + PRODUCTS[l.productId].price * l.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      lines,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (productId, variant, openDrawer = true) => {
        dispatch({ type: 'add', productId, variant });
        if (openDrawer) setIsOpen(true);
      },
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
