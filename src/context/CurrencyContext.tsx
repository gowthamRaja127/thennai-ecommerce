import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Fixed to Indian Rupees (INR) across the store */
export type CurrencyCode = 'INR';

export const CURRENCY_CODES: CurrencyCode[] = ['INR'];

interface CurrencyState {
  currency: CurrencyCode;
  format: (amountInRupees: number) => string;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

/** Standard Indian Rupee formatter (e.g. ₹199, ₹1,299) */
export function formatRupees(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<CurrencyState>(() => {
    return {
      currency: 'INR',
      format: formatRupees,
    };
  }, []);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/** Global hook to format amounts in Indian Rupees (₹) */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}

