import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SEED_PRODUCTS, type Product } from '../src/data/products.ts';
import { rowToProduct, type ProductRow } from '../src/lib/productRow.ts';
import type { EventType } from '../src/lib/schemas.ts';
import { config } from './config.ts';
import * as local from './orders.ts';
import type { OrderRecord } from './orders.ts';

/*
 * Data access for the API. Uses Supabase (service-role key, server only) when configured;
 * otherwise falls back to the bundled catalogue and a local JSON order file so the shop
 * still runs in development without a database.
 */

let client: SupabaseClient | null = null;
function supabase(): SupabaseClient | null {
  if (!config.supabaseEnabled) return null;
  client ??= createClient(config.supabaseUrl, config.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/* ---------- Products ---------- */

let productCache: { at: number; products: Product[] } | null = null;
const PRODUCT_TTL_MS = 30_000;

/** Active products, sorted. Cached briefly so storefront traffic does not hit the database on every request. */
export async function listProducts(): Promise<Product[]> {
  const sb = supabase();
  if (!sb) return SEED_PRODUCTS.filter((p) => p.active);
  if (productCache && Date.now() - productCache.at < PRODUCT_TTL_MS) return productCache.products;
  const { data, error } = await sb.from('products').select('*').eq('active', true).order('sort_order').order('name');
  if (error) throw error;
  const products = (data as ProductRow[]).map(rowToProduct);
  productCache = { at: Date.now(), products };
  return products;
}

/** Bypasses the cache: pricing an order must use the current prices. */
export async function productsForPricing(ids: string[]): Promise<Record<string, Product>> {
  const sb = supabase();
  if (!sb) return Object.fromEntries(SEED_PRODUCTS.filter((p) => ids.includes(p.id)).map((p) => [p.id, p]));
  const { data, error } = await sb.from('products').select('*').in('id', ids);
  if (error) throw error;
  return Object.fromEntries((data as ProductRow[]).map((r) => [r.id, rowToProduct(r)]));
}

/* ---------- Orders ---------- */

function orderToRow(o: OrderRecord) {
  return {
    id: o.id,
    status: o.status,
    payment_method: o.paymentMethod,
    lines: o.lines,
    subtotal: o.subtotal,
    shipping_fee: o.shippingFee,
    total: o.total,
    contact: o.contact,
    address: o.address,
    notes: o.notes,
    razorpay_order_id: o.razorpayOrderId ?? null,
    razorpay_payment_id: o.razorpayPaymentId ?? null,
    created_at: o.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): OrderRecord {
  return {
    id: r.id,
    status: r.status,
    paymentMethod: r.payment_method,
    lines: r.lines,
    subtotal: r.subtotal,
    shippingFee: r.shipping_fee,
    total: r.total,
    contact: r.contact,
    address: r.address,
    notes: r.notes ?? '',
    razorpayOrderId: r.razorpay_order_id ?? undefined,
    razorpayPaymentId: r.razorpay_payment_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const sb = supabase();
  if (!sb) return local.saveOrder(order);
  const { error } = await sb.from('orders').insert(orderToRow(order));
  if (error) throw error;
}

export async function getOrder(id: string): Promise<OrderRecord | undefined> {
  const sb = supabase();
  if (!sb) return local.getOrder(id);
  const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : undefined;
}

export async function findOrderByRazorpayId(razorpayOrderId: string): Promise<OrderRecord | undefined> {
  const sb = supabase();
  if (!sb) return local.findByRazorpayOrderId(razorpayOrderId);
  const { data, error } = await sb.from('orders').select('*').eq('razorpay_order_id', razorpayOrderId).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : undefined;
}

/**
 * Moves an order to a new status only if it is currently in one of `from`. Returns the updated
 * order, or undefined if it had already moved on, which keeps verify + webhook idempotent.
 */
export async function transitionOrder(
  id: string,
  from: OrderRecord['status'][],
  patch: Pick<OrderRecord, 'status'> & Partial<Pick<OrderRecord, 'razorpayPaymentId'>>,
): Promise<OrderRecord | undefined> {
  const sb = supabase();
  if (!sb) {
    const current = local.getOrder(id);
    if (!current || !from.includes(current.status)) return undefined;
    return local.updateOrder(id, patch);
  }
  const row: Record<string, unknown> = { status: patch.status };
  if (patch.razorpayPaymentId) row.razorpay_payment_id = patch.razorpayPaymentId;
  const { data, error } = await sb.from('orders').update(row).eq('id', id).in('status', from).select('*').maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : undefined;
}

/* ---------- Analytics ---------- */

export interface EventRow {
  type: EventType;
  product_id: string;
  variant?: string | null;
  quantity?: number | null;
  amount?: number | null;
  source?: string | null;
  session_id?: string | null;
  order_id?: string | null;
  occurred_at?: string;
}

export async function insertEvents(rows: EventRow[]): Promise<void> {
  const sb = supabase();
  if (!sb || rows.length === 0) return; // analytics needs the database; without it events are dropped
  const { error } = await sb.from('events').insert(rows);
  if (error) throw error;
}

/** One purchase event per order line, recorded when payment is confirmed (or a COD order is placed). */
export async function recordPurchase(order: OrderRecord): Promise<void> {
  await insertEvents(
    order.lines.map((l) => ({
      type: 'purchase' as const,
      product_id: l.productId,
      variant: l.variant,
      quantity: l.quantity,
      amount: l.lineTotal,
      source: order.paymentMethod,
      order_id: order.id,
    })),
  );
}
