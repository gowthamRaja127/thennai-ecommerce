import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatRupees } from '../context/CurrencyContext';
import { usePageTitle } from '../components/PageHeader';
import { SproutLoader } from '../components/Ornaments';
import { DATA_HUE, TrendChart } from './TrendChart';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

interface EngagementRow {
  product_id: string;
  views: number;
  clicks: number;
  add_to_carts: number;
  checkouts: number;
  orders: number;
  units: number;
  revenue: number;
}

interface DailyRow {
  day: string;
  views: number;
  add_to_carts: number;
  purchases: number;
  revenue: number;
}

type SortKey = 'views' | 'clicks' | 'add_to_carts' | 'checkouts' | 'orders' | 'revenue' | 'cartRate';

const num = (n: number) => n.toLocaleString('en-IN');
const compact = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : num(Math.round(n)));
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const pctLabel = (v: number) => `${v.toFixed(v >= 10 || v === 0 ? 0 : 1)}%`;

export function DashboardPage() {
  usePageTitle('Admin · Engagement');
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<EngagementRow[] | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'views', dir: -1 });

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError('');
    const since = new Date(Date.now() - days * 86400000).toISOString();
    Promise.all([
      supabase!.rpc('product_engagement', { since }),
      supabase!.rpc('engagement_daily', { since }),
      supabase!.from('products').select('id, name'),
    ]).then(([eng, day, prods]) => {
      if (cancelled) return;
      const err = eng.error ?? day.error ?? prods.error;
      if (err) {
        setError(err.message);
        setRows([]);
        return;
      }
      setRows((eng.data as EngagementRow[]).map(numberify));
      setDaily((day.data as DailyRow[]).map(numberify));
      setNames(Object.fromEntries((prods.data as { id: string; name: string }[]).map((p) => [p.id, p.name])));
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const totals = useMemo(() => {
    const t = { views: 0, add_to_carts: 0, orders: 0, revenue: 0 };
    for (const r of rows ?? []) {
      t.views += r.views;
      t.add_to_carts += r.add_to_carts;
      t.revenue += r.revenue;
    }
    t.orders = daily.reduce((s, d) => s + d.purchases, 0);
    return t;
  }, [rows, daily]);

  const series = useMemo(() => fillDays(daily, days), [daily, days]);

  const sorted = useMemo(() => {
    const val = (r: EngagementRow) => (sort.key === 'cartRate' ? pct(r.add_to_carts, r.views) : r[sort.key]);
    return [...(rows ?? [])].sort((a, b) => (val(a) - val(b)) * sort.dir);
  }, [rows, sort]);

  const maxViews = Math.max(1, ...(rows ?? []).map((r) => r.views));
  const leader = [...(rows ?? [])].sort((a, b) => b.views - a.views)[0];
  const bestConverter = [...(rows ?? [])].filter((r) => r.views >= 10).sort((a, b) => pct(b.orders, b.views) - pct(a.orders, a.views))[0];
  const name = (id: string) => names[id] ?? id;

  const header = (key: SortKey, label: string) => (
    <th scope="col" className="px-3 py-3 text-right font-medium" aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))}
        className="inline-flex items-center gap-1 uppercase tracking-[0.14em] hover:text-espresso"
      >
        {label}
        {sort.key === key && (sort.dir === -1 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">Analytics</p>
          <h1 className="display mt-2 text-[40px] text-espresso sm:text-[48px]">Product engagement</h1>
        </div>
        {/* Filters: one row, above the charts */}
        <div className="flex gap-1 border border-line p-1" role="radiogroup" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              role="radio"
              aria-checked={days === r.days}
              onClick={() => setDays(r.days)}
              className={`px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition ${days === r.days ? 'bg-espresso text-linen' : 'text-umber hover:text-espresso'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 border-l-2 border-clay bg-clay-soft/60 px-4 py-3 text-[13px] text-espresso">Could not load analytics: {error}</p>}

      {rows === null ? (
        <SproutLoader label="Tallying the ledger…" className="py-32" />
      ) : (
        <>
          {/* Stat tiles */}
          <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
            {[
              { label: 'Product views', value: compact(totals.views) },
              { label: 'Added to cart', value: compact(totals.add_to_carts), sub: `${pctLabel(pct(totals.add_to_carts, totals.views))} of views` },
              { label: 'Orders', value: compact(totals.orders) },
              { label: 'Revenue', value: formatRupees(totals.revenue) },
            ].map((s) => (
              <div key={s.label} className="bg-linen p-5 sm:p-6">
                <dt className="text-[12px] text-umber">{s.label}</dt>
                <dd className="mt-2 text-[28px] font-medium leading-none text-espresso sm:text-[34px]">{s.value}</dd>
                {s.sub && <dd className="mt-2 text-[12px] text-umber">{s.sub}</dd>}
              </div>
            ))}
          </dl>

          {rows.length > 0 && leader && (
            <p className="mt-6 max-w-3xl font-serif text-[20px] leading-snug text-espresso">
              <em>{name(leader.product_id)}</em> drew the most attention, with {num(leader.views)} views and {num(leader.add_to_carts)} adds to cart
              {bestConverter && bestConverter.product_id !== leader.product_id ? (
                <>
                  . <em>{name(bestConverter.product_id)}</em> converts best, at {pctLabel(pct(bestConverter.orders, bestConverter.views))} of views becoming orders.
                </>
              ) : (
                '.'
              )}
            </p>
          )}

          {/* Trends: two single-series charts rather than one dual-axis chart */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="min-w-0 border border-line p-5 sm:p-6">
              <h2 className="text-[13px] font-medium text-espresso">Product views per day</h2>
              <div className="mt-4">
                <TrendChart points={series.map((d) => ({ day: d.day, value: d.views }))} kind="line" format={compact} label="Views" />
              </div>
            </section>
            <section className="min-w-0 border border-line p-5 sm:p-6">
              <h2 className="text-[13px] font-medium text-espresso">Revenue per day</h2>
              <div className="mt-4">
                <TrendChart points={series.map((d) => ({ day: d.day, value: d.revenue }))} kind="columns" format={(n) => `₹${compact(n)}`} label="Revenue" />
              </div>
            </section>
          </div>

          {/* Funnel by product */}
          <section className="mt-8 border border-line">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-[13px] font-medium text-espresso">Engagement by product</h2>
              <p className="text-[12px] text-umber">Views → clicks → cart → checkout → orders</p>
            </div>
            {rows.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-serif text-[22px] italic text-espresso">No engagement recorded in this period yet.</p>
                <p className="mt-2 text-[13px] text-umber">Events appear here as shoppers browse the storefront.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full min-w-[760px] text-[13px]">
                  <thead className="text-[10.5px] text-umber">
                    <tr className="border-b border-line">
                      <th scope="col" className="px-5 py-3 text-left font-medium uppercase tracking-[0.14em] sm:px-6">
                        Product
                      </th>
                      {header('views', 'Views')}
                      {header('clicks', 'Clicks')}
                      {header('add_to_carts', 'Cart')}
                      {header('checkouts', 'Checkout')}
                      {header('orders', 'Orders')}
                      {header('revenue', 'Revenue')}
                      {header('cartRate', 'View→cart')}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r) => (
                      <tr key={r.product_id} className="border-b border-line/70 last:border-0 hover:bg-paper/50">
                        <th scope="row" className="px-5 py-3.5 text-left font-normal sm:px-6">
                          <Link to={`/admin/products/${r.product_id}`} className="font-serif text-[16px] text-espresso hover:text-pine">
                            {name(r.product_id)}
                          </Link>
                          <div className="mt-1.5 h-1.5 w-full max-w-[220px] rounded-full bg-paper" aria-hidden>
                            <div className="h-full rounded-full" style={{ width: `${(r.views / maxViews) * 100}%`, background: DATA_HUE }} />
                          </div>
                        </th>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{num(r.views)}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{num(r.clicks)}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{num(r.add_to_carts)}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{num(r.checkouts)}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{num(r.orders)}</td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-espresso">{formatRupees(r.revenue)}</td>
                        <td className="px-3 py-3.5 pr-5 text-right tabular-nums text-espresso sm:pr-6">{pctLabel(pct(r.add_to_carts, r.views))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <p className="mt-4 text-[12px] text-umber">
            Views are counted once per product page visit; orders and revenue are recorded when payment is confirmed (or a COD order is placed).
          </p>
        </>
      )}
    </div>
  );
}

// Postgres bigint arrives as string through PostgREST; normalise to numbers.
function numberify<T extends object>(row: T): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : v])) as T;
}

function fillDays(rows: DailyRow[], days: number): DailyRow[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DailyRow[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push(byDay.get(key) ?? { day: key, views: 0, add_to_carts: 0, purchases: 0, revenue: 0 });
  }
  return out;
}

