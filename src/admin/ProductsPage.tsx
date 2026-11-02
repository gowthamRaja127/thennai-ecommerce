import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { rowToProduct, type ProductRow } from '../lib/productRow';
import { formatRupees } from '../context/CurrencyContext';
import { CATEGORIES, type Product } from '../data/products';
import { ProductImage } from '../components/ProductImage';
import { usePageTitle } from '../components/PageHeader';
import { SproutLoader } from '../components/Ornaments';

export function ProductsPage() {
  usePageTitle('Admin · Products');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    supabase!
      .from('products')
      .select('*')
      .order('sort_order')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setProducts(((data ?? []) as ProductRow[]).map(rowToProduct));
      });
  }, []);

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (products ?? []).filter((p) => !t || `${p.name} ${p.id} ${p.category}`.toLowerCase().includes(t));
  }, [products, q]);

  const toggleActive = async (p: Product) => {
    setToggling(p.id);
    const { error } = await supabase!.from('products').update({ active: !p.active }).eq('id', p.id);
    setToggling(null);
    if (error) return setError(error.message);
    setProducts((list) => list?.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) ?? null);
  };

  const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">Catalogue</p>
          <h1 className="display mt-2 text-[40px] text-espresso sm:text-[48px]">Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-solid">
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <label className="relative mt-8 block max-w-sm">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-umber" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, slug or category"
          className="h-11 w-full rounded-[2px] border border-line bg-linen pl-10 pr-3 text-[14px] focus:border-espresso focus:outline-none"
        />
      </label>

      {error && <p className="mt-6 border-l-2 border-clay bg-clay-soft/60 px-4 py-3 text-[13px] text-espresso">{error}</p>}

      {products === null ? (
        <SproutLoader label="Loading products…" className="py-32" />
      ) : visible.length === 0 ? (
        <p className="mt-16 text-center font-serif text-[22px] italic text-umber">{q ? 'No products match that search.' : 'No products yet.'}</p>
      ) : (
        <>
          {/* Desktop table */}
          <table className="mt-8 hidden w-full border border-line text-[13px] md:table">
            <thead className="text-[10.5px] uppercase tracking-[0.14em] text-umber">
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-3 py-3 text-left font-medium">Category</th>
                <th className="px-3 py-3 text-right font-medium">Price</th>
                <th className="px-3 py-3 text-right font-medium">Variants</th>
                <th className="px-3 py-3 text-right font-medium">Order</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0 hover:bg-paper/50">
                  <td className="px-5 py-3">
                    <Link to={`/admin/products/${p.id}`} className="flex items-center gap-4">
                      <span className="size-12 shrink-0 overflow-hidden rounded-[2px] bg-paper">
                        <ProductImage product={p} />
                      </span>
                      <span>
                        <span className="block font-serif text-[17px] text-espresso hover:text-pine">{p.name}</span>
                        <span className="text-[12px] text-umber">/{p.id}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-umber">{categoryLabel(p.category)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-espresso">{formatRupees(p.price)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-umber">{p.variants.length}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-umber">{p.sortOrder}</td>
                  <td className="px-5 py-3 text-right">
                    <StatusToggle product={p} busy={toggling === p.id} onToggle={() => toggleActive(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
            {visible.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-4">
                <Link to={`/admin/products/${p.id}`} className="size-16 shrink-0 overflow-hidden rounded-[2px] bg-paper">
                  <ProductImage product={p} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/products/${p.id}`} className="block truncate font-serif text-[17px] text-espresso">
                    {p.name}
                  </Link>
                  <p className="text-[12px] text-umber">
                    {formatRupees(p.price)} · {categoryLabel(p.category)}
                  </p>
                </div>
                <StatusToggle product={p} busy={toggling === p.id} onToggle={() => toggleActive(p)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function StatusToggle({ product, busy, onToggle }: { product: Product; busy: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={product.active}
      aria-label={`${product.name} is ${product.active ? 'live' : 'hidden'}`}
      disabled={busy}
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-50"
    >
      <span className={`relative h-5 w-9 rounded-full transition ${product.active ? 'bg-pine' : 'bg-line'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-linen shadow transition-all ${product.active ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
      <span className={product.active ? 'text-pine' : 'text-umber'}>{product.active ? 'Live' : 'Hidden'}</span>
    </button>
  );
}
