import type { CSSProperties } from 'react';

/*
 * Victorian catalogue ornaments, drawn as fine engraved lines so they sit quietly in the
 * Swiss grid rather than shouting.
 */

/** A centred fleuron between two hairlines. */
export function Fleuron({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-umber/70 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-current opacity-40" />
      <svg viewBox="0 0 64 16" className="h-4 w-16" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M32 3 L35 8 L32 13 L29 8 Z" fill="currentColor" stroke="none" />
        <path d="M27 8 C22 8 20 4 15 5 C11 6 11 11 15 11 C18 11 18 8 16 8" />
        <path d="M37 8 C42 8 44 4 49 5 C53 6 53 11 49 11 C46 11 46 8 48 8" />
        <path d="M8 8 L2 8 M56 8 L62 8" />
      </svg>
      <span className="h-px flex-1 bg-current opacity-40" />
    </div>
  );
}

/** The engraved double rule of a Victorian catalogue page. */
export function DoubleRule({ className = '' }: { className?: string }) {
  return <div className={`h-[5px] border-y border-espresso/70 ${className}`} aria-hidden />;
}

/** A sprout drawing itself, used as the storefront's loading indicator. */
export function SproutLoader({ label = 'Gathering the catalogue…', className = '' }: { label?: string; className?: string }) {
  const line = (len: number, delay = 0) => ({ '--len': len, '--delay': `${delay}s` }) as CSSProperties;
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-5 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-14 text-pine" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path className="draw" style={line(40)} d="M32 58 C32 46 31 36 32 24" />
        <path className="draw" style={line(34, 0.35)} d="M32 34 C26 34 18 30 15 21 C24 20 30 26 32 34" />
        <path className="draw" style={line(34, 0.55)} d="M32 27 C38 27 46 22 49 13 C40 12 34 18 32 27" />
        <path className="draw" style={line(30, 0)} d="M18 58 L46 58" />
      </svg>
      <p className="font-serif text-[17px] italic text-umber">{label}</p>
    </div>
  );
}

/** Skeleton of a catalogue cell, matching ProductCard's layout so nothing jumps when data arrives. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-linen p-4 sm:p-6 lg:p-8" aria-hidden>
      <div className="flex justify-between">
        <span className="skeleton h-3 w-12" />
        <span className="skeleton h-3 w-16" />
      </div>
      <div className="skeleton mt-4 aspect-[4/5] w-full" />
      <span className="skeleton mt-6 h-6 w-4/5" />
      <span className="skeleton mt-3 h-3.5 w-full" />
      <span className="skeleton mt-2 h-3.5 w-2/3" />
      <div className="mt-6 flex justify-between border-t border-line pt-4">
        <span className="skeleton h-4 w-14" />
        <span className="skeleton h-4 w-10" />
      </div>
    </div>
  );
}
