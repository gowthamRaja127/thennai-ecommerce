import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import { config } from './config.ts';

let client: Razorpay | null = null;

function razorpay(): Razorpay {
  if (!config.razorpayEnabled) throw new Error('Razorpay is not configured');
  client ??= new Razorpay({ key_id: config.razorpayKeyId, key_secret: config.razorpayKeySecret });
  return client;
}

export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  return razorpay().orders.create({
    amount: Math.round(amountRupees * 100), // paise
    currency: 'INR',
    receipt,
    notes: { orderId: receipt },
  });
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Checkout signature: HMAC-SHA256(`${order_id}|${payment_id}`, key_secret). */
export function isValidPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  const expected = createHmac('sha256', config.razorpayKeySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw request body, webhook secret). */
export function isValidWebhookSignature(rawBody: Buffer, signature: string) {
  if (!config.razorpayWebhookSecret || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac('sha256', config.razorpayWebhookSecret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}
