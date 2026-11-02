/* Razorpay Standard Checkout: loads checkout.js on demand and wraps the modal in a promise. */

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (resp: { error?: { description?: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type RazorpayOutcome =
  | { kind: 'success'; response: RazorpaySuccess }
  | { kind: 'dismissed' }
  | { kind: 'failed'; message: string };

export async function openRazorpay(options: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}): Promise<RazorpayOutcome> {
  await loadRazorpay();
  return new Promise((resolve) => {
    let settled = false;
    let lastError = '';
    const done = (o: RazorpayOutcome) => {
      if (!settled) {
        settled = true;
        resolve(o);
      }
    };
    const rzp = new window.Razorpay!({
      key: options.keyId,
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency,
      name: 'thennai',
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#2E2A26' },
      handler: (response: RazorpaySuccess) => done({ kind: 'success', response }),
      modal: {
        // Closing after a failed attempt counts as a failure; closing before trying is a dismissal.
        ondismiss: () => done(lastError ? { kind: 'failed', message: lastError } : { kind: 'dismissed' }),
        confirm_close: true,
      },
    });
    // Razorpay keeps the window open after a failure so the customer can retry with another method.
    rzp.on('payment.failed', (resp) => {
      lastError = resp.error?.description ?? 'The payment did not go through.';
    });
    rzp.open();
  });
}
