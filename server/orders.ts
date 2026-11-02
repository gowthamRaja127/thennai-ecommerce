import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { CheckoutData, PaymentMethod } from '../src/lib/schemas.ts';
import type { QuotedLine } from '../src/lib/pricing.ts';
import { config } from './config.ts';

export type OrderStatus = 'pending_payment' | 'paid' | 'cod_confirmed' | 'payment_failed';

export interface OrderRecord {
  id: string;
  lines: QuotedLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  contact: CheckoutData['contact'];
  address: CheckoutData['shipping'];
  notes: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

/*
 * A small JSON-file order store so the shop works end to end out of the box.
 * Swap this module for a real database before running at volume: it holds every
 * order in memory and rewrites the file on each change.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let cache: Map<string, OrderRecord> | null = null;

function file() {
  return join(config.dataDir, 'orders.json');
}

function load(): Map<string, OrderRecord> {
  if (cache) return cache;
  try {
    const rows = JSON.parse(readFileSync(file(), 'utf8')) as OrderRecord[];
    cache = new Map(rows.map((o) => [o.id, o]));
  } catch {
    cache = new Map();
  }
  return cache;
}

function persist() {
  mkdirSync(config.dataDir, { recursive: true });
  const tmp = `${file()}.tmp`;
  writeFileSync(tmp, JSON.stringify([...load().values()], null, 2));
  renameSync(tmp, file());
}

export function newOrderId(): string {
  const bytes = randomBytes(10);
  let id = 'TH-';
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}

export function saveOrder(order: OrderRecord) {
  load().set(order.id, order);
  persist();
}

export function getOrder(id: string): OrderRecord | undefined {
  return load().get(id);
}

export function updateOrder(id: string, patch: Partial<OrderRecord>): OrderRecord | undefined {
  const current = load().get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  load().set(id, next);
  persist();
  return next;
}

export function findByRazorpayOrderId(razorpayOrderId: string): OrderRecord | undefined {
  for (const o of load().values()) if (o.razorpayOrderId === razorpayOrderId) return o;
  return undefined;
}
