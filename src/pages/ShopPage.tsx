import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Leaf, ShieldCheck, Sprout, Truck } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { CATEGORIES, FREE_SHIPPING_THRESHOLD, type Category } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { usePageTitle } from '../components/PageHeader';
import { DoubleRule, Fleuron, ProductCardSkeleton } from '../components/Ornaments';
import { Select } from '../components/Select';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'name', label: 'A — Z' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

/*
 * The shop as a seed catalogue: a Victorian masthead and numbering, laid on a Swiss
 * modular grid with hairline rules, set in editorial serif type.
 */
export function ShopPage() {
  usePageTitle('Shop');
  const { products, ready } = useCatalog();
  const [params, setParams] = useSearchParams();

  const category = (CATEGORIES.some((c) => c.id === params.get('category')) ? params.get('category') : null) as Category | null;
  const sort = (SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'featured') as SortId;

  const active = useMemo(() => products.filter((p) => p.active), [products]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of active) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [active]);

  // Catalogue numbers follow the featured order and stay fixed whatever the filter or sort.
  const numberOf = useMemo(() => {
    const ordered = [...active].sort((a, b) => a.sortOrder - b.sortOrder);
    return Object.fromEntries(ordered.map((p, i) => [p.id, i + 1]));
  }, [active]);

  const visible = useMemo(() => {
    const list = active.filter((p) => !category || p.category === category);
    if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [active, category, sort]);

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const index: { id: Category | null; label: string; count: number }[] = [
    { id: null, label: 'All', count: active.length },
    ...CATEGORIES.filter((c) => counts[c.id]).map((c) => ({ id: c.id, label: c.label, count: counts[c.id] })),
  ];
  const year = new Date().getFullYear();

  return (
    <>
      {/* ===== Masthead ===== */}
      <header className="mx-auto max-w-[1280px] px-6 pt-8 sm:px-10 lg:pt-12">
        <nav aria-label="Breadcrumb" className="text-[10.5px] uppercase tracking-[0.22em] text-umber">
          <Link to="/" className="hover:text-espresso">
            Home
          </Link>
          <span className="mx-2 text-line">/</span>
          <span className="text-espresso" aria-current="page">
            Shop
          </span>
        </nav>

        <DoubleRule className="mt-8" />
        <div className="grid grid-cols-3 items-center py-3 text-[9.5px] font-medium uppercase tracking-[0.26em] text-umber sm:text-[10.5px]">
          <span>Vol. I</span>
          <span className="text-center">Erode<span className="max-sm:hidden"> · Tamil Nadu</span></span>
          <span className="text-right tabular-nums">{toRoman(year)}</span>
        </div>
        <div className="h-px bg-espresso/70" />

        <div className="py-12 text-center sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.34em] text-kraft-deep">The thennai seed &amp; soil</p>
          <h1 className="display mt-5 text-[52px] text-espresso sm:text-[84px] lg:text-[104px]">
            Catalogue
          </h1>
          <Fleuron className="mx-auto mt-7 max-w-xs" />
          <p className="mx-auto mt-7 max-w-md font-serif text-[18px] italic leading-relaxed text-umber sm:text-[20px]">
            Zero-dirt kits and living coir from the Muthur mills, for the windowsills of the city.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
        {/* ===== Swiss index bar ===== */}
        <div className="grid border-y border-espresso/70 lg:grid-cols-12">
          <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:col-span-9">
            <ol className="flex w-max divide-x divide-line" role="tablist" aria-label="Filter by category">
              {index.map((t, i) => {
                const on = t.id === category;
                return (
                  <li key={t.label}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => set('category', t.id)}
                      className={`group flex items-baseline gap-2.5 whitespace-nowrap px-4 py-4 text-left transition first:pl-0 sm:px-6 ${on ? 'text-espresso' : 'text-umber hover:text-espresso'}`}
                    >
                      <span className="text-[10px] tabular-nums text-umber/70">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`text-[11px] font-medium uppercase tracking-[0.2em] underline-offset-[7px] ${on ? 'underline decoration-kraft' : ''}`}>{t.label}</span>
                      <sup className="text-[10px] tabular-nums text-umber/70">{t.count}</sup>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="flex items-center justify-between gap-6 border-t border-line py-3 lg:col-span-3 lg:justify-end lg:border-l lg:border-t-0 lg:py-0 lg:pl-6">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-umber tabular-nums" aria-live="polite">
              {ready ? `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'}` : '— entries'}
            </p>
            <Select
              size="bare"
              align="right"
              ariaLabel="Sort products"
              value={sort}
              onChange={(v) => set('sort', v === 'featured' ? null : v)}
              options={SORTS.map((s) => ({ value: s.id, label: s.label }))}
            />
          </div>
        </div>

        {/* ===== Catalogue grid ===== */}
        <div className="py-10 lg:py-14">
          {!ready ? (
            <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="border border-line py-24 text-center">
              <p className="font-serif text-[30px] italic text-espresso">This page of the catalogue is blank, for now.</p>
              <button type="button" onClick={() => set('category', null)} className="btn btn-line mt-8">
                See every entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} index={numberOf[p.id]} priority={i < 3} />
              ))}
              {/* Fill the last row so the hairline grid stays unbroken. */}
              {Array.from({ length: (3 - (visible.length % 3)) % 3 }).map((_, i) => (
                <div key={`fill-${i}`} className="hidden bg-linen lg:block" aria-hidden />
              ))}
              {visible.length % 2 === 1 && <div className="bg-linen lg:hidden" aria-hidden />}
            </div>
          )}
        </div>

        <Fleuron className="mx-auto max-w-sm pb-16" />
      </div>

      <TrustStrip />
    </>
  );
}

export function TrustStrip() {
  const items = [
    { icon: Truck, title: 'Free express delivery', body: `On orders above ₹${FREE_SHIPPING_THRESHOLD}. Pan-India in 3–4 days.` },
    { icon: Sprout, title: 'Germination guarantee', body: 'If it does not sprout, we reship your seeds free.' },
    { icon: Leaf, title: 'Ships from Erode', body: 'Packed by hand and dispatched within 24 hours.' },
    { icon: ShieldCheck, title: 'Secure payments', body: 'UPI, cards and NetBanking via Razorpay.' },
  ];
  return (
    <section aria-label="Why shop with us" className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="bg-linen px-6 py-9 sm:px-10">
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-pine" strokeWidth={1.25} />
              <span className="text-[10px] tabular-nums text-umber/60">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <p className="mt-5 font-serif text-[21px] text-espresso">{title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-umber">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}
