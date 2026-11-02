import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PaymentMarks } from './PaymentMarks';
import { CartLineRow, FreeShippingBar, OrderTotals, RefillUpsell } from './CartParts';
import { setScrollLocked } from '../lib/motion';
import { track } from '../lib/analytics';

export function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();
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

  const checkout = () => {
    cart.items.forEach((i) => track('begin_checkout', i.productId, { variant: i.variant, quantity: i.quantity, source: 'drawer' }));
    close();
    navigate('/checkout');
  };

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
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-linen shadow-2xl outline-none transition-transform duration-[500ms] ease-[cubic-bezier(.2,.8,.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-[26px] leading-none text-espresso">
            Your cart <span className="font-sans text-[13px] text-umber">({cart.itemCount})</span>
          </h2>
          <button type="button" onClick={close} className="-mr-2 p-2 text-umber transition hover:text-espresso" aria-label="Close cart">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {cart.items.length > 0 && (
          <div className="border-b border-line px-6 py-4">
            <FreeShippingBar />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <p className="font-serif text-[28px] text-espresso">Your windowsill is waiting.</p>
              <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-umber">Start with a Grow Tin: everything you need, in one hand-sized kit.</p>
              <Link to="/shop" onClick={close} className="btn btn-solid mt-8">
                Browse the shop <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {cart.items.map((item) => (
                  <CartLineRow key={item.key} item={item} onNavigate={close} compact />
                ))}
              </ul>
              <div className="pb-6">
                <RefillUpsell />
              </div>
            </>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-line bg-paper/40 px-6 pb-6 pt-5">
            <OrderTotals subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
            <button type="button" onClick={checkout} className="btn btn-solid mt-5 w-full">
              Checkout <ArrowRight className="size-4" />
            </button>
            <Link to="/cart" onClick={close} className="mt-3 block text-center text-[11px] font-medium uppercase tracking-[0.2em] text-umber underline-offset-4 hover:text-espresso hover:underline">
              View full cart
            </Link>
            <PaymentMarks className="mt-4 justify-center" />
          </div>
        )}
      </div>
    </div>
  );
}
