import { useEffect, useRef, useState } from 'react';
import { Lock, Minus, Plus, ShoppingBag, Sprout, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { FREE_SHIPPING_THRESHOLD, PRODUCTS, type ProductId } from '../data/products';
import { CoinRefillArt, TrioArt } from './Illustrations';
import { Photo } from './Photo';
import { Checkout } from './Checkout';
import { PaymentMarks } from './PaymentMarks';
import { setScrollLocked } from '../lib/motion';

function Thumb({ productId, variant }: { productId: ProductId; variant: string }) {
  const cls = 'h-full w-full';
  switch (productId) {
    case 'grow-tin':
      return <Photo name="grow-tin" alt={`Grow Tin, ${variant}`} className="h-full w-full object-cover" />;
    case 'kitchen-trio':
      return <TrioArt className={cls} />;
    case 'living-soil-kit':
      return <Photo name="coco-peat-pouch" alt="Living Soil Kit" className="h-full w-full object-cover" />;
    case 'coin-refill':
      return <CoinRefillArt className={cls} />;
  }
}

export function CartDrawer() {
  const cart = useCart();
  const { format } = useCurrency();
  const [checkingOut, setCheckingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { isOpen, close } = cart;

  // Body scroll lock, Escape to close, and focus management.
  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setScrollLocked(true);
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      setScrollLocked(false);
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) setCheckingOut(false);
  }, [isOpen]);

  const progress = Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const hasRefill = cart.lines.some((l) => l.productId === 'coin-refill');
  const hasTin = cart.lines.some((l) => l.productId === 'grow-tin' || l.productId === 'kitchen-trio');

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-lenis-prevent
        tabIndex={-1}
        inert={!isOpen}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-linen shadow-2xl outline-none transition-transform duration-[400ms] ease-[cubic-bezier(.2,.8,.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {checkingOut ? (
          <Checkout onBack={() => setCheckingOut(false)} />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2 className="flex items-center gap-2.5 font-serif text-xl text-espresso">
                <ShoppingBag className="size-5 text-pine" />
                Your Cart
                <span className="font-sans text-sm font-medium text-umber">({cart.itemCount})</span>
              </h2>
              <button type="button" onClick={close} className="rounded-full p-2 text-umber transition hover:bg-sand" aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="border-b border-line bg-white px-5 pb-4 pt-1">
              <p className="flex items-center gap-2 text-sm text-espresso" aria-live="polite">
                <Truck className="size-4 shrink-0 text-pine" />
                {cart.amountToFreeShipping > 0 ? (
                  <span>
                    Add <strong className="font-semibold">{format(cart.amountToFreeShipping)}</strong> more to unlock{' '}
                    <strong className="font-semibold">Free Express Delivery!</strong>
                  </span>
                ) : (
                  <span className="font-semibold text-leaf">You’ve unlocked Free Express Delivery! 🎉</span>
                )}
              </p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progress to free delivery">
                <div className="h-full rounded-full bg-gradient-to-r from-pine to-leaf transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-mint text-pine">
                    <Sprout className="size-7" />
                  </span>
                  <p className="mt-4 font-serif text-xl text-espresso">Your windowsill is waiting</p>
                  <p className="mt-1.5 max-w-xs text-sm text-umber">Start with a Grow Tin — it’s everything you need in one hand-sized kit.</p>
                  <a href="#shop" onClick={close} className="mt-6 rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                    Browse the collection
                  </a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.lines.map((line) => {
                    const p = PRODUCTS[line.productId];
                    return (
                      <li key={line.key} className="flex gap-4 rounded-2xl border border-line bg-white p-3.5">
                        <div className={`size-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-b from-[#F6EFE2] to-[#EDE2CF] ${line.productId === 'grow-tin' || line.productId === 'living-soil-kit' ? '' : 'p-1.5'}`}>
                          <Thumb productId={line.productId} variant={line.variant} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-serif text-[15px] leading-snug text-espresso">{p.name}</p>
                              <p className="mt-0.5 text-xs font-medium text-kraft-deep">{line.variant}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => cart.remove(line.key)}
                              className="-mr-1 -mt-1 rounded-lg p-1.5 text-umber/70 transition hover:bg-clay-soft hover:text-clay"
                              aria-label={`Remove ${p.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-lg border border-line">
                              <button type="button" className="p-1.5 text-umber hover:text-pine" onClick={() => cart.setQty(line.key, line.quantity - 1)} aria-label="Decrease quantity">
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-label="Quantity">{line.quantity}</span>
                              <button type="button" className="p-1.5 text-umber hover:text-pine" onClick={() => cart.setQty(line.key, line.quantity + 1)} aria-label="Increase quantity">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-espresso tabular-nums">{format(p.price * line.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* 1-click upsell */}
              {cart.lines.length > 0 && !hasRefill && (
                <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-dashed border-kraft/60 bg-[#FBF3E8] p-3.5">
                  <div className="h-12 w-16 shrink-0">
                    <CoinRefillArt className="h-full w-full" />
                  </div>
                  <p className="flex-1 text-sm leading-snug text-espresso">
                    Add 1× Extra 3-Coin Refill Pack for <strong className="font-semibold">{format(PRODUCTS['coin-refill'].price)}</strong>?
                    {hasTin && <span className="block text-xs text-umber">Perfect for your second sowing.</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => cart.add('coin-refill', PRODUCTS['coin-refill'].fixedVariant!, false)}
                    className="shrink-0 rounded-lg bg-kraft px-3.5 py-2 text-xs font-bold text-white transition hover:bg-kraft-deep"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>

            {cart.lines.length > 0 && (
              <div className="border-t border-line bg-white px-5 pb-5 pt-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-umber">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-espresso">{format(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-umber">
                    <dt>Express delivery</dt>
                    <dd className={`tabular-nums ${cart.shipping === 0 ? 'font-semibold text-leaf' : 'text-espresso'}`}>
                      {cart.shipping === 0 ? 'FREE' : format(cart.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-espresso">
                    <dt>Total <span className="text-xs font-normal text-umber">(incl. GST)</span></dt>
                    <dd className="tabular-nums">{format(cart.total)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setCheckingOut(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pine py-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
                >
                  <Lock className="size-4" />
                  Secure Checkout • {format(cart.total)}
                </button>
                <PaymentMarks className="mt-3 justify-center" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
