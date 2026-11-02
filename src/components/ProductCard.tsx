import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { CATEGORIES, savePercent, type Product } from '../data/products';
import { track } from '../lib/analytics';
import { ProductImage } from './ProductImage';
import { Select } from './Select';

interface Props {
  product: Product;
  /** Catalogue number shown as "No. 01". */
  index: number;
  source?: string;
  priority?: boolean;
}

type AddState = 'idle' | 'adding' | 'added';

/**
 * Shop card. The whole card opens the product (one stretched link, one tab stop);
 * the variety picker and the add button sit above that link so they stay usable.
 * Built to sit inside a `gap-px bg-line` grid, so neighbouring cards share hairlines.
 */
export function ProductCard({ product, index, source = 'shop-grid', priority }: Props) {
  const { add } = useCart();
  const { format } = useCurrency();
  const [variant, setVariant] = useState(product.variants[0]);
  const [state, setState] = useState<AddState>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const save = savePercent(product);
  const href = `/shop/${product.id}`;
  const category = CATEGORIES.find((c) => c.id === product.category)?.label ?? '';
  const multi = product.variants.length > 1;
  const badge = product.badge.split('•')[0].trim();

  const onAdd = () => {
    if (state !== 'idle') return;
    setState('adding');
    timers.current.push(
      setTimeout(() => {
        add(product.id, variant, { source: `${source}-card` });
        setState('added');
        timers.current.push(setTimeout(() => setState('idle'), 1800));
      }, 280),
    );
  };

  return (
    <article className="group relative flex flex-col bg-linen p-3 has-[[aria-expanded=true]]:z-20 transition-colors duration-500 hover:bg-[#F9F6F0] sm:p-5 lg:p-6">
      {/* Image */}
      <div className="arch relative aspect-[4/5] overflow-hidden bg-paper">
        <ProductImage product={product} priority={priority} className="transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]" />
        {product.media.length > 1 && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <ProductImage product={product} index={1} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-[3] flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          {badge ? (
            <span className="max-w-[70%] truncate bg-linen/90 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-espresso backdrop-blur max-sm:invisible sm:text-[9.5px]">
              {badge}
            </span>
          ) : (
            <span />
          )}
          {save > 0 && <span className="bg-clay px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-linen sm:text-[9.5px]">−{save}%</span>}
        </div>
      </div>

      {/* Meta + title */}
      <p className="mt-4 flex items-baseline justify-between gap-2 text-umber sm:mt-5">
        <span className="truncate text-[9.5px] font-medium uppercase tracking-[0.2em] sm:text-[10px]">{category}</span>
        <span className="shrink-0 font-serif text-[13px] italic text-kraft-deep">No. {String(index).padStart(2, '0')}</span>
      </p>
      <h3 className="mt-1.5 font-serif text-[18px] leading-[1.15] text-espresso sm:text-[23px]">
        <Link
          to={href}
          onClick={() => track('product_click', product.id, { source })}
          className="outline-none after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:underline group-hover:text-pine"
        >
          {product.name}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-umber max-sm:hidden">{product.tagline}</p>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[16px] tabular-nums text-espresso sm:text-[17px]">{format(product.price)}</span>
        {product.compareAt && <span className="text-[12.5px] tabular-nums text-umber/60 line-through">{format(product.compareAt)}</span>}
      </p>

      <div className="flex-1" />

      {/* Actions sit above the stretched link */}
      <div className="relative z-[2] mt-4 space-y-2">
        {multi && <Select value={variant} onChange={setVariant} options={product.variants} ariaLabel={`Variety of ${product.name}`} />}
        <button
          type="button"
          onClick={onAdd}
          aria-live="polite"
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-[2px] text-[10.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 sm:text-[11px] ${
            state === 'added' ? 'bg-pine text-linen' : 'bg-espresso text-linen hover:bg-pine-deep'
          }`}
        >
          {state === 'adding' ? (
            <span className="size-3.5 animate-spin rounded-full border border-linen/40 border-t-linen" aria-hidden />
          ) : state === 'added' ? (
            <Check className="size-4" />
          ) : (
            <ShoppingBag className="size-3.5" strokeWidth={1.5} />
          )}
          {state === 'adding' ? 'Adding' : state === 'added' ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
