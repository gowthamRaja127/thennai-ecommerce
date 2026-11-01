import type { CartLine } from '../context/CartContext';

export type PaymentMethod = 'upi' | 'rupay' | 'card' | 'netbanking';

export interface ShippingDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
}

export interface OrderRequest {
  lines: CartLine[];
  shipping: ShippingDetails;
  paymentMethod: PaymentMethod;
  totalInr: number;
}

export interface OrderResult {
  orderId: string;
  etaDays: string;
}

/**
 * Integration point for the payment gateway.
 *
 * In production this should POST the order to your backend, which creates a
 * Razorpay / Cashfree / PhonePe PG order (amount in paise, INR) and returns the
 * gateway order id. The client then opens the gateway's hosted checkout with
 * the chosen method pre-selected, and the backend confirms payment via webhook
 * before the order is released to Shiprocket / Delhivery.
 *
 * Until VITE_ORDER_API is configured this resolves a simulated order so the
 * storefront can be demoed end to end.
 */
export async function placeOrder(req: OrderRequest): Promise<OrderResult> {
  const endpoint = import.meta.env.VITE_ORDER_API as string | undefined;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Order failed (${res.status})`);
    return (await res.json()) as OrderResult;
  }

  await new Promise((r) => setTimeout(r, 1100));
  const orderId = `TH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return { orderId, etaDays: '3–4' };
}
