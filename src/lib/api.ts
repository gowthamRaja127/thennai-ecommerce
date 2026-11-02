import type { Product } from '../data/products';
import type { CheckoutData, PaymentMethod } from './schemas';
import type { QuotedLine } from './pricing';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError('We could not reach the store. Check your connection and try again.', 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? 'Something went wrong. Please try again.', res.status, body.fields ?? {});
  return body as T;
}

export interface StoreConfig {
  razorpay: boolean;
  cod: boolean;
  razorpayKeyId: string | null;
}

export interface CreatedOrder {
  orderId: string;
  status: 'pending_payment' | 'cod_confirmed';
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
  prefill?: { name: string; email: string; contact: string };
}

export interface OrderSummary {
  id: string;
  status: 'pending_payment' | 'paid' | 'cod_confirmed' | 'payment_failed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: PaymentMethod;
  createdAt: string;
  lines: QuotedLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shipTo: { name: string; city: string; state: string; pincode: string };
  email: string;
}

export const api = {
  config: () => request<StoreConfig>('/config'),
  products: () => request<{ products: Product[] }>('/products').then((r) => r.products),
  createOrder: (data: CheckoutData) => request<CreatedOrder>('/checkout', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (body: { orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<{ orderId: string; status: string }>('/checkout/verify', { method: 'POST', body: JSON.stringify(body) }),
  paymentFailed: (orderId: string) => request<void>('/checkout/failed', { method: 'POST', body: JSON.stringify({ orderId }) }),
  order: (id: string) => request<OrderSummary>(`/orders/${encodeURIComponent(id)}`),
};
