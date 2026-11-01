import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'GBP';

// Indicative display rates only. All orders are charged in INR at checkout.
const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number; locale: string }> = {
  INR: { symbol: '₹', rate: 1, locale: 'en-IN' },
  USD: { symbol: '$', rate: 0.012, locale: 'en-US' },
  AED: { symbol: 'AED ', rate: 0.044, locale: 'en-AE' },
  GBP: { symbol: '£', rate: 0.0094, locale: 'en-GB' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (inr: number) => string;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

function readStored(): CurrencyCode {
  try {
    const v = localStorage.getItem('th-currency');
    if (v && v in CURRENCIES) return v as CurrencyCode;
  } catch {
    /* storage unavailable */
  }
  return 'INR';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readStored);

  const value = useMemo<CurrencyState>(() => {
    const { symbol, rate, locale } = CURRENCIES[currency];
    return {
      currency,
      setCurrency: (c) => {
        setCurrencyState(c);
        try {
          localStorage.setItem('th-currency', c);
        } catch {
          /* storage unavailable */
        }
      },
      format: (inr) => {
        const amount = inr * rate;
        const digits = currency === 'INR' ? 0 : 2;
        return symbol + amount.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
      },
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
