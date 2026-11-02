import { Link } from 'react-router';
import { Minus, Plus, Truck, X } from 'lucide-react';
import { useCart, type CartItem } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { useCurrency } from '../context/CurrencyContext';
import { MAX_QTY_PER_LINE, REFILL_ID } from '../data/products';
import { ProductImage } from './ProductImage';

export function QtyStepper({
  value,
  onChange,
  max = MAX_QTY_PER_LINE,
  size = 'sm',
  label = 'Quantity',
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const box = size === 'md' ? 'h-12' : 'h-9';
  const btn = size === 'md' ? 'w-11' : 'w-8';
  return (
    <div className={`inline-flex items-stretch rounded-[2px] border border-line bg-linen ${box}`} role="group" aria-label={label}>
      <button type="button" className={`${btn} grid place-items-center text-umber transition hover:text-espresso disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= 1 && size === 'md'} aria-label="Decrease quantity">
        <Minus className="size-3.5" />
      </button>
      <span className="grid min-w-8 place-items-center text-sm tabular-nums text-espresso" aria-live="polite">
        {value}
      </span>
      <button type="button" className={`${btn} grid place-items-center text-umber transition hover:text-espresso disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function FreeShippingBar() {
  const { amountToFreeShipping, freeShippingProgress } = useCart();
  const { format } = useCurrency();
  return (
    <div>
      <p className="flex items-center gap-2.5 text-[13px] text-espresso" aria-live="polite">
        <Truck className="size-4 shrink-0 text-pine" strokeWidth={1.5} />
        {amountToFreeShipping > 0 ? (
          <span>
            Add <strong className="font-medium">{format(amountToFreeShipping)}</strong> more for free express delivery
          </span>
        ) : (
          <span>Free express delivery unlocked</span>
        )}
      </p>
      <div
        className="mt-3 h-[3px] overflow-hidden bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(freeShippingProgress)}
        aria-label="Progress to free delivery"
      >
        <div className="h-full bg-pine transition-[width] duration-500" style={{ width: `${freeShippingProgress}%` }} />
      </div>
    </div>
  );
}

export function CartLineRow({ item, onNavigate, compact = false }: { item: CartItem; onNavigate?: () => void; compact?: boolean }) {
  const { setQty, remove } = useCart();
  const { format } = useCurrency();
  const multiVariant = item.product.variants.length > 1;
  return (
    <li className="flex gap-4 py-5">
      <Link to={`/shop/${item.productId}`} onClick={onNavigate} className={`${compact ? 'size-20' : 'size-24 sm:size-28'} shrink-0 overflow-hidden rounded-[2px] bg-paper`}>
        <ProductImage product={item.product} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/shop/${item.productId}`} onClick={onNavigate} className="font-serif text-[19px] leading-snug text-espresso hover:text-pine">
              {item.product.name}
            </Link>
            {multiVariant && <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-umber">{item.variant}</p>}
            <p className="mt-1 text-[13px] text-umber">{format(item.product.price)} each</p>
          </div>
          <button type="button" onClick={() => remove(item.key)} className="-mr-1.5 -mt-1 p-1.5 text-umber/70 transition hover:text-clay" aria-label={`Remove ${item.product.name}`}>
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QtyStepper value={item.quantity} onChange={(n) => setQty(item.key, n)} label={`Quantity of ${item.product.name}`} />
          <span className="text-[15px] tabular-nums text-espresso">{format(item.lineTotal)}</span>
        </div>
      </div>
    </li>
  );
}

/** One-tap "add a refill" suggestion, shown when the cart has no refill yet. */
export function RefillUpsell() {
  const { items, add } = useCart();
  const { byId } = useCatalog();
  const { format } = useCurrency();
  const refill = byId[REFILL_ID];
  if (!refill?.active || items.length === 0 || items.some((i) => i.productId === REFILL_ID)) return null;
  return (
    <div className="flex items-center gap-4 border border-line bg-cream/60 p-4">
      <div className="size-14 shrink-0 overflow-hidden rounded-[2px]">
        <ProductImage product={refill} />
      </div>
      <p className="flex-1 text-[13px] leading-snug text-espresso">
        Add a <span className="font-serif text-[16px] italic">{refill.shortName}</span> for {format(refill.price)}
        <span className="block text-umber">Ready for your second sowing.</span>
      </p>
      <button
        type="button"
        onClick={() => add(REFILL_ID, refill.variants[0], { openDrawer: false, source: 'cart-upsell' })}
        className="shrink-0 border border-espresso px-3.5 py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-espresso transition hover:bg-espresso hover:text-linen"
      >
        Add
      </button>
    </div>
  );
}

export function OrderTotals({ subtotal, shipping, total }: { subtotal: number; shipping: number; total: number }) {
  const { format } = useCurrency();
  return (
    <dl className="space-y-2.5 text-[14px]">
      <div className="flex justify-between text-umber">
        <dt>Subtotal</dt>
        <dd className="tabular-nums text-espresso">{format(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-umber">
        <dt>Express delivery</dt>
        <dd className="tabular-nums text-espresso">{shipping === 0 ? 'Free' : format(shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3.5 text-espresso">
        <dt className="text-[15px]">
          Total <span className="text-[12px] text-umber">incl. GST</span>
        </dt>
        <dd className="font-serif text-[26px] tabular-nums">{format(total)}</dd>
      </div>
    </dl>
  );
}
