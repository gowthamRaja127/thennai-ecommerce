import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupees } from '../context/CurrencyContext';
import type { QuotedLine } from '../lib/pricing';
import { usePageTitle } from '../components/PageHeader';
import { SproutLoader } from '../components/Ornaments';
import { Select } from '../components/Select';

type Status = 'pending_payment' | 'paid' | 'cod_confirmed' | 'payment_failed' | 'shipped' | 'delivered' | 'cancelled';

interface OrderRow {
  id: string;
  status: Status;
  payment_method: 'razorpay' | 'cod';
  lines: QuotedLine[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  contact: { email: string; phone: string };
  address: { fullName: string; line1: string; line2: string; landmark: string; city: string; state: string; pincode: string };
  notes: string;
  razorpay_payment_id: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  cod_confirmed: 'COD confirmed',
  payment_failed: 'Payment failed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Status is shown with its word, never colour alone.
const STATUS_DOT: Record<Status, string> = {
  pending_payment: 'bg-ochre',
  paid: 'bg-pine',
  cod_confirmed: 'bg-pine',
  payment_failed: 'bg-clay',
  shipped: 'bg-espresso',
  delivered: 'bg-espresso',
  cancelled: 'bg-umber',
};

const FILTERS: { id: 'all' | 'to-ship' | 'shipped' | 'problems'; label: string; match: (s: Status) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'to-ship', label: 'To ship', match: (s) => s === 'paid' || s === 'cod_confirmed' },
  { id: 'shipped', label: 'Shipped', match: (s) => s === 'shipped' || s === 'delivered' },
  { id: 'problems', label: 'Unpaid / failed', match: (s) => s === 'pending_payment' || s === 'payment_failed' || s === 'cancelled' },
];

const NEXT_STATUSES: Status[] = ['paid', 'cod_confirmed', 'shipped', 'delivered', 'cancelled'];

export function OrdersPage() {
  usePageTitle('Admin · Orders');
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('to-ship');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setOrders((data ?? []) as OrderRow[]);
      });
  }, []);

  const visible = useMemo(() => (orders ?? []).filter((o) => FILTERS.find((f) => f.id === filter)!.match(o.status)), [orders, filter]);

  const setStatus = async (o: OrderRow, status: Status) => {
    const { error } = await supabase!.from('orders').update({ status }).eq('id', o.id);
    if (error) return setError(error.message);
    setOrders((list) => list?.map((x) => (x.id === o.id ? { ...x, status } : x)) ?? null);
  };

  const date = (s: string) => new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="mx-auto max-w-[1180px]">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">Fulfilment</p>
      <h1 className="display mt-2 text-[40px] text-espresso sm:text-[48px]">Orders</h1>

      <div className="mt-8 flex gap-1 overflow-x-auto border border-line p-1 sm:inline-flex" role="radiogroup" aria-label="Filter orders">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition ${filter === f.id ? 'bg-espresso text-linen' : 'text-umber hover:text-espresso'}`}
          >
            {f.label} <span className="opacity-60">{(orders ?? []).filter((o) => f.match(o.status)).length}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-6 border-l-2 border-clay bg-clay-soft/60 px-4 py-3 text-[13px] text-espresso">{error}</p>}

      {orders === null ? (
        <SproutLoader label="Loading orders…" className="py-32" />
      ) : visible.length === 0 ? (
        <p className="mt-16 text-center font-serif text-[22px] italic text-umber">No orders here.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {visible.map((o) => {
            const isOpen = open === o.id;
            const items = o.lines.reduce((n, l) => n + l.quantity, 0);
            return (
              <li key={o.id}>
                <button type="button" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 text-left sm:grid-cols-[150px_1fr_120px_150px_24px]">
                  <span className="text-[13px] tabular-nums text-espresso">{o.id}</span>
                  <span className="text-right text-[14px] tabular-nums text-espresso sm:order-3">{formatRupees(o.total)}</span>
                  <span className="min-w-0 truncate text-[14px] text-espresso sm:order-2">
                    <span className="font-serif text-[16px]">{o.address.fullName}</span>
                    <span className="text-umber"> · {o.address.city} · {items} item{items === 1 ? '' : 's'}</span>
                  </span>
                  <span className="flex items-center justify-end gap-2 text-[12px] text-umber sm:order-4 sm:justify-start">
                    <span className={`size-2 rounded-full ${STATUS_DOT[o.status]}`} aria-hidden />
                    {STATUS_LABEL[o.status]}
                  </span>
                  <ChevronDown className={`hidden size-4 text-umber transition-transform sm:order-5 sm:block ${isOpen ? 'rotate-180' : ''}`} />
                  <span className="text-[12px] text-umber sm:hidden">{date(o.created_at)}</span>
                </button>

                {isOpen && (
                  <div className="grid gap-6 bg-paper/40 p-5 text-[13px] sm:grid-cols-3">
                    <div>
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">Ship to</p>
                      <p className="mt-2 leading-relaxed text-espresso">
                        {o.address.fullName}
                        <br />
                        {o.address.line1}
                        {o.address.line2 && (
                          <>
                            <br />
                            {o.address.line2}
                          </>
                        )}
                        {o.address.landmark && (
                          <>
                            <br />
                            Near {o.address.landmark}
                          </>
                        )}
                        <br />
                        {o.address.city}, {o.address.state} {o.address.pincode}
                      </p>
                      <p className="mt-3 text-espresso">
                        <a href={`tel:+91${o.contact.phone}`} className="underline-offset-2 hover:underline">
                          +91 {o.contact.phone}
                        </a>
                        <br />
                        <a href={`mailto:${o.contact.email}`} className="underline-offset-2 hover:underline">
                          {o.contact.email}
                        </a>
                      </p>
                      {o.notes && <p className="mt-3 italic text-umber">“{o.notes}”</p>}
                    </div>
                    <div>
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">Items</p>
                      <ul className="mt-2 space-y-1.5 text-espresso">
                        {o.lines.map((l) => (
                          <Fragment key={`${l.productId}-${l.variant}`}>
                            <li className="flex justify-between gap-3">
                              <span>
                                {l.quantity} × {l.name}
                                <span className="block text-[12px] text-umber">{l.variant}</span>
                              </span>
                              <span className="tabular-nums">{formatRupees(l.lineTotal)}</span>
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                      <p className="mt-3 flex justify-between border-t border-line pt-2 text-umber">
                        <span>Delivery</span>
                        <span className="tabular-nums">{o.shipping_fee ? formatRupees(o.shipping_fee) : 'Free'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">Payment</p>
                      <p className="mt-2 text-espresso">{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
                      {o.razorpay_payment_id && <p className="mt-1 break-all text-[12px] text-umber">{o.razorpay_payment_id}</p>}
                      <p className="mt-1 text-[12px] text-umber">Placed {date(o.created_at)}</p>
                      <div className="mt-5">
                        <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">Update status</span>
                        <Select
                          className="mt-2"
                          ariaLabel={`Status of order ${o.id}`}
                          value={o.status}
                          onChange={(v) => setStatus(o, v as Status)}
                          options={[o.status, ...NEXT_STATUSES.filter((s) => s !== o.status)].map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
