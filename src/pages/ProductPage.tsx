import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, Check, Leaf, Sprout, Truck } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { CATEGORIES, FREE_SHIPPING_THRESHOLD, savePercent, type Product } from '../data/products';
import { track } from '../lib/analytics';
import { ProductImage } from '../components/ProductImage';
import { ProductCard } from '../components/ProductCard';
import { QtyStepper } from '../components/CartParts';
import { usePageTitle } from '../components/PageHeader';
import { DoubleRule, Fleuron } from '../components/Ornaments';
import { NotFoundContent } from './NotFoundPage';

export function ProductPage() {
  const { slug = '' } = useParams();
  const { byId, products, ready } = useCatalog();
  const product = byId[slug];
  usePageTitle(product?.name ?? 'Shop');

  if (!product?.active) {
    if (!ready) return <ProductSkeleton />;
    return <NotFoundContent title="This entry is not in the catalogue." />;
  }
  // Keyed so variant/quantity state resets when moving between products.
  return <ProductView key={product.id} product={product} all={products} />;
}

function ProductView({ product, all }: { product: Product; all: Product[] }) {
  const { add } = useCart();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [image, setImage] = useState(0);
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => track('product_view', product.id, { source: 'product-page' }), [product.id]);

  const ordered = useMemo(() => all.filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder), [all]);
  const number = ordered.findIndex((p) => p.id === product.id) + 1;
  const related = ordered.filter((p) => p.id !== product.id).slice(0, 3);
  const category = CATEGORIES.find((c) => c.id === product.category);
  const save = savePercent(product);

  const addToCart = (openDrawer = true) => {
    add(product.id, variant, { quantity: qty, openDrawer, source: 'product-page' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };
  const buyNow = () => {
    addToCart(false);
    navigate('/checkout');
  };

  const sections = [
    { title: 'Description', body: <p>{product.description}</p> },
    product.contents.length > 0 && { title: 'In the box', body: <List items={product.contents} /> },
    product.howTo.length > 0 && { title: 'How to grow', body: <List items={product.howTo} numbered /> },
    product.details.length > 0 && { title: 'Details', body: <List items={product.details} /> },
    {
      title: 'Delivery & payment',
      body: (
        <List
          items={[
            `Free express delivery on orders above ₹${FREE_SHIPPING_THRESHOLD}; ₹49 below that.`,
            'Dispatched from Erode within 24 hours; Pan-India in 3–4 days via Delhivery & Shiprocket.',
            'Pay securely with UPI, cards or NetBanking via Razorpay, or Cash on Delivery where available.',
          ]}
        />
      ),
    },
  ].filter(Boolean) as { title: string; body: ReactNode }[];

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 sm:px-10 lg:pb-32 lg:pt-12">
        <nav aria-label="Breadcrumb" className="text-[10.5px] uppercase tracking-[0.22em] text-umber">
          <Link to="/" className="hover:text-espresso">
            Home
          </Link>
          <span className="mx-2 text-line">/</span>
          <Link to="/shop" className="hover:text-espresso">
            Shop
          </Link>
          {category && (
            <>
              <span className="mx-2 text-line">/</span>
              <Link to={`/shop?category=${category.id}`} className="hover:text-espresso">
                {category.label}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-14">
          {/* ===== Gallery ===== */}
          <div className="lg:col-span-7">
            <div className="arch relative aspect-[4/5] overflow-hidden bg-paper">
              <ProductImage key={image} product={product} index={image} priority className="animate-fade" />
            </div>
            {product.media.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3" role="tablist" aria-label="Product images">
                {product.media.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === image}
                    aria-label={`Image ${i + 1}`}
                    onClick={() => setImage(i)}
                    className={`aspect-square overflow-hidden rounded-[2px] bg-paper ring-offset-2 ring-offset-linen transition ${i === image ? 'ring-1 ring-espresso' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <ProductImage product={product} index={i} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== Buy panel ===== */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="flex items-baseline justify-between text-umber">
                <span className="font-serif text-[16px] italic text-kraft-deep">No. {String(number).padStart(2, '0')}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.24em]">{category?.label}</span>
              </div>
              <DoubleRule className="mt-3" />

              <h1 className="display mt-7 text-[40px] text-espresso sm:text-[52px]">{product.name}</h1>
              <p className="mt-4 font-serif text-[19px] italic leading-snug text-umber">{product.tagline}</p>

              <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-serif text-[34px] tabular-nums text-espresso">{format(product.price)}</span>
                {product.compareAt && <span className="text-[15px] tabular-nums text-umber/60 line-through">{format(product.compareAt)}</span>}
                {save > 0 && <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-clay">Save {save}%</span>}
                <span className="basis-full text-[12px] text-umber">Inclusive of all taxes</span>
              </div>

              {product.variants.length > 1 && (
                <fieldset className="mt-8">
                  <legend className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-umber">
                    Variety · <span className="text-espresso">{variant}</span>
                  </legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <label
                        key={v}
                        className={`cursor-pointer border px-3.5 py-3 text-[13px] transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-kraft ${
                          v === variant ? 'border-espresso bg-espresso text-linen' : 'border-line text-espresso hover:border-espresso'
                        }`}
                      >
                        <input type="radio" name="variant" value={v} checked={v === variant} onChange={() => setVariant(v)} className="sr-only" />
                        {v}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-8 flex gap-3">
                <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} size="md" />
                <button type="button" onClick={() => addToCart()} className={`btn flex-1 ${added ? 'bg-leaf text-linen' : 'btn-solid'}`}>
                  {added ? <Check className="size-4" /> : null}
                  {added ? 'Added to cart' : `${product.cta} · ${format(product.price * qty)}`}
                </button>
              </div>
              <button type="button" onClick={buyNow} className="btn btn-line mt-3 w-full">
                Buy it now <ArrowRight className="size-4" />
              </button>

              <ul className="mt-8 grid gap-3 border-y border-line py-5 text-[13px] text-umber">
                <li className="flex items-center gap-3">
                  <Truck className="size-4 text-pine" strokeWidth={1.25} /> Free express delivery above ₹{FREE_SHIPPING_THRESHOLD}
                </li>
                <li className="flex items-center gap-3">
                  <Leaf className="size-4 text-pine" strokeWidth={1.25} /> Dispatched from Erode within 24 hours
                </li>
                <li className="flex items-center gap-3">
                  <Sprout className="size-4 text-pine" strokeWidth={1.25} /> 100% germination guarantee
                </li>
              </ul>

              <div className="mt-2 divide-y divide-line">
                {sections.map((s, i) => (
                  <details key={s.title} open={i === 0} className="group py-1">
                    <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-baseline gap-3">
                        <span className="text-[10px] tabular-nums text-umber/60">{toRomanLower(i + 1)}.</span>
                        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-espresso">{s.title}</span>
                      </span>
                      <span className="text-umber transition-transform duration-300 group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <div className="pb-5 text-[14.5px] leading-[1.8] text-umber">{s.body}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper/30 py-16 lg:py-24" aria-labelledby="related-heading">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
            <Fleuron className="mx-auto max-w-xs" />
            <h2 id="related-heading" className="display mt-6 text-center text-[36px] text-espresso sm:text-[48px]">
              Also in the <em className="text-pine">catalogue</em>
            </h2>
            <div className="mt-12 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} index={ordered.findIndex((o) => o.id === p.id) + 1} source="related" />
              ))}
              {related.length === 3 && <div className="bg-linen lg:hidden" aria-hidden />}
            </div>
          </div>
        </section>
      )}

      {/* Mobile: price and add-to-cart always within reach */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-linen/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[16px] text-espresso">{product.shortName}</p>
            <p className="text-[13px] tabular-nums text-umber">
              {format(product.price)}
              {product.variants.length > 1 ? ` · ${variant}` : ''}
            </p>
          </div>
          <button type="button" onClick={() => addToCart()} className="btn btn-solid !px-5 !py-3.5">
            {added ? 'Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </>
  );
}

function List({ items, numbered }: { items: string[]; numbered?: boolean }) {
  const Tag = numbered ? 'ol' : 'ul';
  return (
    <Tag className="space-y-2">
      {items.map((t, i) => (
        <li key={t} className="flex gap-3">
          <span className="w-4 shrink-0 font-serif italic text-kraft-deep">{numbered ? `${i + 1}.` : '·'}</span>
          <span>{t}</span>
        </li>
      ))}
    </Tag>
  );
}

function toRomanLower(n: number) {
  return ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'][n - 1] ?? String(n);
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 sm:px-10 lg:pt-12" aria-busy="true" aria-label="Loading product">
      <span className="skeleton block h-3 w-48" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="skeleton aspect-[4/5] lg:col-span-7" />
        <div className="lg:col-span-5">
          <span className="skeleton block h-4 w-24" />
          <span className="skeleton mt-8 block h-12 w-full" />
          <span className="skeleton mt-3 block h-12 w-2/3" />
          <span className="skeleton mt-6 block h-5 w-4/5" />
          <span className="skeleton mt-8 block h-9 w-28" />
          <span className="skeleton mt-10 block h-12 w-full" />
          <span className="skeleton mt-3 block h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
