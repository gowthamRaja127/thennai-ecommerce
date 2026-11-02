import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, Check, Clock, X } from 'lucide-react';
import { api, ApiError, type OrderSummary } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { useCatalog } from '../context/CatalogContext';
import { OrderTotals } from '../components/CartParts';
import { ProductImage } from '../components/ProductImage';
import { usePageTitle } from '../components/PageHeader';
import { DoubleRule, Fleuron, SproutLoader } from '../components/Ornaments';
import { NotFoundContent } from './NotFoundPage';

const POLL_MS = 3000;
const MAX_POLLS = 10;

export function OrderPage() {
  const { id = '' } = useParams();
  usePageTitle(`Order ${id}`);
  const { format } = useCurrency();
  const { byId } = useCatalog();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  // A payment can still be confirming (webhook in flight), so poll briefly while pending.
  useEffect(() => {
    let cancelled = false;
    let polls = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = () =>
      api
        .order(id)
        .then((o) => {
          if (cancelled) return;
          setOrder(o);
          if (o.status === 'pending_payment' && ++polls < MAX_POLLS) timer = setTimeout(load, POLL_MS);
        })
        .catch((e: ApiError) => !cancelled && setError(e));
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  if (error?.status === 404) return <NotFoundContent title="We could not find that order." />;
  if (error) return <Message tone="error" title="We could not load your order." body={error.message} />;
  if (!order) return <SproutLoader label="Fetching your order…" className="min-h-[60svh]" />;

  const confirmed = order.status === 'paid' || order.status === 'cod_confirmed' || order.status === 'shipped' || order.status === 'delivered';
  const failed = order.status === 'payment_failed' || order.status === 'cancelled';

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12 sm:px-10 lg:pb-32 lg:pt-16">
      <div className="text-center">
        <span
          className={`mx-auto grid size-14 place-items-center rounded-full border ${confirmed ? 'border-pine text-pine' : failed ? 'border-clay text-clay' : 'border-ochre text-ochre'}`}
        >
          {confirmed ? <Check className="size-6" strokeWidth={1.5} /> : failed ? <X className="size-6" strokeWidth={1.5} /> : <Clock className="size-6" strokeWidth={1.5} />}
        </span>
        <p className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.3em] text-umber">Order {order.id}</p>
        <h1 className="display mt-4 text-[42px] text-espresso sm:text-[56px]">
          {confirmed ? (
            <>
              Thank you, <em className="text-pine">{order.shipTo.name.split(' ')[0]}.</em>
            </>
          ) : failed ? (
            'Payment did not go through.'
          ) : (
            'Confirming your payment…'
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.8] text-umber">
          {confirmed &&
            (order.paymentMethod === 'cod'
              ? `Your order is confirmed for Cash on Delivery. Please keep ${format(order.total)} ready.`
              : 'Your payment is confirmed.')}{' '}
          {confirmed && `We’re packing it in Erode now. Updates will reach ${order.email}.`}
          {failed && 'No money was taken for this order. You can try again from your cart.'}
          {!confirmed && !failed && 'This usually takes a few seconds. You can keep this page open.'}
        </p>
      </div>

      <DoubleRule className="mt-12" />
      <ul className="divide-y divide-line">
        {order.lines.map((l) => (
          <li key={`${l.productId}-${l.variant}`} className="flex items-center gap-4 py-5">
            <div className="size-16 shrink-0 overflow-hidden rounded-[2px] bg-paper">
              {byId[l.productId] ? <ProductImage product={byId[l.productId]} /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[18px] leading-snug text-espresso">{l.name}</p>
              <p className="text-[12px] text-umber">
                {l.variant} · Qty {l.quantity}
              </p>
            </div>
            <p className="text-[15px] tabular-nums text-espresso">{format(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <div className="border-t border-line pt-6">
        <OrderTotals subtotal={order.subtotal} shipping={order.shippingFee} total={order.total} />
      </div>

      <div className="mt-10 grid gap-6 border border-line p-6 text-[14px] sm:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-umber">Shipping to</p>
          <p className="mt-2 text-espresso">
            {order.shipTo.name}
            <br />
            {order.shipTo.city}, {order.shipTo.state} {order.shipTo.pincode}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-umber">Payment</p>
          <p className="mt-2 text-espresso">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (UPI / Card / NetBanking)'}</p>
        </div>
      </div>

      <Fleuron className="mx-auto mt-14 max-w-xs" />
      <div className="mt-10 text-center">
        <Link to={failed ? '/cart' : '/shop'} className="btn btn-solid">
          {failed ? 'Back to cart' : 'Continue shopping'} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function Message({ tone, title, body }: { tone: 'error'; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 text-center">
      <h1 className={`display text-[38px] ${tone === 'error' ? 'text-espresso' : ''}`}>{title}</h1>
      <p className="mt-4 text-umber">{body}</p>
      <Link to="/shop" className="btn btn-line mt-8">
        Back to the shop
      </Link>
    </div>
  );
}
