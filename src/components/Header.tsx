import { useEffect, useRef, useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { CATALOG, PRODUCTS } from '../data/products';

const NAV = [
  { label: 'Home', href: '#top' },
  { label: 'Varieties', href: '#shop' },
  { label: 'Living Coir', href: '#living-soil-kit' },
  { label: 'Journal', href: '#journal' },
  { label: 'Our Roots', href: '#about' },
];

const SEARCH_EXTRAS = [
  { label: 'How it works — Drop, Sow, Harvest', href: '#how-it-works' },
  { label: 'Low-EC lab standard (<0.5 mS/cm)', href: '#standards' },
  { label: 'Shipping policy & delivery times', href: '#help' },
  { label: 'Wholesale & corporate gifting', href: '#help' },
];

export function Header() {
  const { itemCount, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 460);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-forest px-4 py-2 text-center text-[13px] font-medium leading-snug tracking-[0.01em] text-linen/95">
        <span className="hidden md:inline">
          🌿 Handcrafted in Erode • Free Pan-India Doorstep Express Delivery on orders above ₹499 • 100% Germination Guarantee
        </span>
        <span className="md:hidden">🌿 Free Express Delivery above ₹499 • Handcrafted in Erode</span>
      </div>

      <header className="border-b border-espresso/[0.07] bg-linen/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="-ml-2 rounded-lg p-2 text-espresso lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <a href="#top" className="group flex items-center gap-2.5 leading-none" aria-label="thennai home">
              <Logomark className="size-7 text-pine transition-transform duration-700 group-hover:rotate-[-8deg]" />
              <span className="flex flex-col">
                <span className="font-serif text-[28px] font-normal italic leading-none tracking-[-0.01em] text-espresso">Thennai</span>
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.32em] text-kraft-deep">Estd. Erode</span>
              </span>
            </a>
          </div>

          <nav aria-label="Primary" className="hidden items-center gap-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-espresso/70 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="relative py-1 transition-colors hover:text-pine after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-pine after:transition-transform hover:after:scale-x-100"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2.5 text-espresso transition-colors hover:text-pine"
              aria-label="Search"
            >
              <Search className="size-[18px]" />
            </button>

            <button
              type="button"
              onClick={open}
              className="relative flex items-center rounded-full p-2.5 text-kraft transition hover:text-kraft-deep"
              aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="size-[19px]" />
              <span
                className={`absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-kraft text-[10px] font-bold text-white ring-2 ring-linen ${bump ? 'animate-bump' : ''} ${itemCount === 0 ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                aria-hidden="true"
              >
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile" className="animate-fade border-t border-line bg-linen px-4 pb-5 pt-2 lg:hidden">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-line py-3.5 font-serif text-lg text-espresso"
              >
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { format } = useCurrency();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const term = q.trim().toLowerCase();
  const products = CATALOG.map((id) => PRODUCTS[id]).filter(
    (p) => !term || [p.name, p.tagline, p.badge, ...p.contents].join(' ').toLowerCase().includes(term),
  );
  const extras = SEARCH_EXTRAS.filter((x) => !term || x.label.toLowerCase().includes(term));

  return (
    <div className="fixed inset-0 z-50 animate-fade" role="dialog" aria-modal="true" aria-label="Search the store">
      <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-4 w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl sm:mt-24">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-umber" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tins, coir, basil, gifting…"
            className="h-14 flex-1 bg-transparent text-[15px] text-espresso placeholder:text-umber/70 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-umber hover:bg-sand" aria-label="Close search">
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2" data-lenis-prevent>
          {products.length === 0 && extras.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-umber">No matches for "{q}". Try "basil" or "gift".</p>
          )}
          {products.length > 0 && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-kraft">Products</p>}
          {products.map((p) => (
            <a key={p.id} href={`#${p.id}`} onClick={onClose} className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-sand">
              <span>
                <span className="block font-serif text-[15px] text-espresso">{p.name}</span>
                <span className="block text-xs text-umber">{p.tagline}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-pine">{format(p.price)}</span>
            </a>
          ))}
          {extras.length > 0 && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-kraft">Guides & help</p>}
          {extras.map((x) => (
            <a key={x.label} href={x.href} onClick={onClose} className="block rounded-xl px-3 py-2.5 text-sm text-espresso hover:bg-sand">
              {x.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Logomark({ className = '' }: { className?: string }) {
  // A single coconut frond: the "thennai" (coconut palm) of the Kongu belt.
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M16 30V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 14C13 9 8 7 3 8c4 1 8 3 13 6Z" fill="currentColor" />
      <path d="M16 14c3-5 8-7 13-6-4 1-8 3-13 6Z" fill="currentColor" />
      <path d="M16 14c-2-5-1-9 2-12-1 4-1 8-2 12Z" fill="currentColor" opacity=".55" />
      <path d="M16 14c-4-2-9-1-12 3 4-2 8-3 12-3Z" fill="currentColor" opacity=".55" />
      <path d="M16 14c4-2 9-1 12 3-4-2-8-3-12-3Z" fill="currentColor" opacity=".55" />
      <circle cx="14.6" cy="15.6" r="1.4" fill="#E5A93C" />
      <circle cx="17.4" cy="15.6" r="1.4" fill="#E5A93C" />
    </svg>
  );
}

