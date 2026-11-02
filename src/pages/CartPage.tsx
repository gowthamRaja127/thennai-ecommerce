import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { CartLineRow, FreeShippingBar, OrderTotals, RefillUpsell } from '../components/CartParts';
import { PaymentMarks } from '../components/PaymentMarks';
import { usePageTitle } from '../components/PageHeader';
import { DoubleRule, Fleuron, SproutLoader } from '../components/Ornaments';

export function CartPage() {
  usePageTitle('Your cart');
  const cart = useCart();
  const { ready } = useCatalog();

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 sm:px-10 lg:pb-32 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[10.5px] uppercase tracking-[0.22em] text-umber">
        <Link to="/" className="hover:text-espresso">
          Home
        </Link>
        <span className="mx-2 text-line">/</span>
        <span className="text-espresso" aria-current="page">
          Cart
        </span>
      </nav>

      <div className="mt-8 flex items-end justify-between gap-6">
        <h1 className="display text-[48px] text-espresso sm:text-[68px]">
          Your <em className="text-pine">cart</em>
        </h1>
        {cart.items.length > 0 && (
          <p className="pb-2 text-[10.5px] uppercase tracking-[0.22em] text-umber tabular-nums">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
      <DoubleRule className="mt-6" />

      {!ready ? (
        <SproutLoader label="Checking today’s prices…" className="py-28" />
      ) : cart.items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-[30px] italic text-espresso">Nothing on the sill just yet.</p>
          <Fleuron className="mx-auto mt-8 max-w-[14rem]" />
          <Link to="/shop" className="btn btn-solid mt-10">
            Browse the catalogue <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <section className="lg:col-span-7" aria-label="Items">
            <ul className="divide-y divide-line border-b border-line">
              {cart.items.map((item) => (
                <CartLineRow key={item.key} item={item} />
              ))}
            </ul>
            <div className="mt-6">
              <RefillUpsell />
            </div>
            <Link to="/shop" className="mt-8 inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-umber underline-offset-[6px] hover:text-espresso hover:underline">
              ← Continue shopping
            </Link>
          </section>

          <aside className="lg:col-span-5" aria-label="Order summary">
            <div className="border border-line bg-paper/40 p-6 sm:p-8 lg:sticky lg:top-32">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.24em] text-espresso">Summary</h2>
              <div className="mt-5">
                <FreeShippingBar />
              </div>
              <div className="mt-7">
                <OrderTotals subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
              </div>
              <Link to="/checkout" className="btn btn-solid mt-7 w-full">
                Proceed to checkout <ArrowRight className="size-4" />
              </Link>
              <p className="mt-4 text-center text-[12px] text-umber">Shipping address and payment on the next step.</p>
              <PaymentMarks className="mt-5 justify-center" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
