import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { analyticsBatchSchema, checkoutSchema, fieldErrors, orderIdSchema, verifyPaymentSchema } from '../src/lib/schemas.ts';
import { lineProblems, quote } from '../src/lib/pricing.ts';
import { config } from './config.ts';
import { findOrderByRazorpayId, getOrder, insertEvents, listProducts, productsForPricing, recordPurchase, saveOrder, transitionOrder } from './db.ts';
import { newOrderId, type OrderRecord } from './orders.ts';
import { createRazorpayOrder, isValidPaymentSignature, isValidWebhookSignature } from './razorpay.ts';

/**
 * Storefront API, mounted at /api by both the Vite dev server and the production server.
 *   GET  /config                 which payment methods are live
 *   GET  /products               live catalogue (active products)
 *   POST /events                 product engagement events (analytics)
 *   POST /checkout               validate, price server-side, create the order (+ Razorpay order)
 *   POST /checkout/verify        verify the Razorpay checkout signature and mark the order paid
 *   POST /checkout/failed        record a failed / abandoned online payment
 *   POST /webhooks/razorpay      server-to-server confirmation from Razorpay
 *   GET  /orders/:id             public order summary for the confirmation page
 */
export function createApi() {
  const api = express();
  api.disable('x-powered-by');

  // Webhooks need the untouched body to verify the signature, so parse them before JSON.
  api.post('/webhooks/razorpay', express.raw({ type: 'application/json', limit: '256kb' }), (req, res, next) => {
    handleWebhook(req, res).catch(next);
  });
  api.use(express.json({ limit: '32kb' }));

  api.get('/config', (_req, res) => {
    res.json({
      razorpay: config.razorpayEnabled,
      cod: config.codEnabled,
      razorpayKeyId: config.razorpayEnabled ? config.razorpayKeyId : null,
    });
  });

  api.get('/products', async (_req, res, next) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
      res.json({ products: await listProducts() });
    } catch (err) {
      next(err);
    }
  });

  api.post('/events', rateLimit(120, 60_000), async (req, res) => {
    const parsed = analyticsBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid events' });
      return;
    }
    const { sessionId, events } = parsed.data;
    try {
      await insertEvents(
        events.map((e) => ({
          type: e.type,
          product_id: e.productId,
          variant: e.variant ?? null,
          quantity: e.quantity ?? null,
          source: e.source ?? null,
          session_id: sessionId,
          occurred_at: e.at,
        })),
      );
    } catch (err) {
      console.error('[events]', err); // analytics must never break shopping
    }
    res.status(204).end();
  });

  api.post('/checkout', rateLimit(20, 60_000), async (req, res, next) => {
    try {
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
        return;
      }
      const data = parsed.data;

      if (data.paymentMethod === 'razorpay' && !config.razorpayEnabled) {
        res.status(503).json({ error: 'Online payment is temporarily unavailable. Please choose Cash on Delivery or try again later.' });
        return;
      }
      if (data.paymentMethod === 'cod' && !config.codEnabled) {
        res.status(400).json({ error: 'Cash on Delivery is not available for this order.' });
        return;
      }

      const catalog = await productsForPricing([...new Set(data.items.map((i) => i.productId))]);
      const problems = lineProblems(data.items, catalog);
      if (problems.length) {
        res.status(409).json({
          error: 'Some items in your cart are no longer available. Please review your cart.',
          fields: Object.fromEntries(problems.map((p) => [`items.${p.index}.${p.field}`, p.message])),
        });
        return;
      }

      const priced = quote(data.items, catalog);
      const now = new Date().toISOString();
      const order: OrderRecord = {
        id: newOrderId(),
        lines: priced.lines,
        subtotal: priced.subtotal,
        shippingFee: priced.shipping,
        total: priced.total,
        createdAt: now,
        updatedAt: now,
        status: data.paymentMethod === 'cod' ? 'cod_confirmed' : 'pending_payment',
        paymentMethod: data.paymentMethod,
        contact: data.contact,
        address: data.shipping,
        notes: data.notes,
      };

      if (data.paymentMethod === 'cod') {
        await saveOrder(order);
        await recordPurchase(order).catch((err) => console.error('[events]', err));
        res.status(201).json({ orderId: order.id, status: order.status });
        return;
      }

      const rzp = await createRazorpayOrder(order.total, order.id);
      order.razorpayOrderId = rzp.id;
      await saveOrder(order);
      res.status(201).json({
        orderId: order.id,
        status: order.status,
        razorpay: { keyId: config.razorpayKeyId, orderId: rzp.id, amount: rzp.amount, currency: rzp.currency },
        prefill: { name: data.shipping.fullName, email: data.contact.email, contact: `+91${data.contact.phone}` },
      });
    } catch (err) {
      next(err);
    }
  });

  api.post('/checkout/verify', async (req, res, next) => {
    try {
      const parsed = verifyPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Payment details were incomplete.' });
        return;
      }
      const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
      const order = await getOrder(orderId);
      if (!order || order.razorpayOrderId !== razorpay_order_id) {
        res.status(404).json({ error: 'We could not find that order.' });
        return;
      }
      if (!isValidPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        res.status(400).json({ error: 'We could not verify this payment. If money was deducted, it will be refunded automatically.' });
        return;
      }
      await markPaid(order.id, razorpay_payment_id);
      res.json({ orderId, status: 'paid' });
    } catch (err) {
      next(err);
    }
  });

  api.post('/checkout/failed', async (req, res, next) => {
    try {
      const parsed = z.object({ orderId: orderIdSchema }).safeParse(req.body);
      if (parsed.success) await transitionOrder(parsed.data.orderId, ['pending_payment'], { status: 'payment_failed' });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  api.get('/orders/:id', async (req, res, next) => {
    try {
      const id = orderIdSchema.safeParse(req.params.id);
      const order = id.success ? await getOrder(id.data) : undefined;
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      // Only what the confirmation page needs: no phone number or street address.
      res.json({
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        lines: order.lines,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        shipTo: { name: order.address.fullName, city: order.address.city, state: order.address.state, pincode: order.address.pincode },
        email: maskEmail(order.contact.email),
      });
    } catch (err) {
      next(err);
    }
  });

  api.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  api.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[api]', err);
    res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  });

  return api;
}

/** Marks a pending/failed order paid exactly once and records the purchase for analytics. */
async function markPaid(orderId: string, paymentId: string | undefined) {
  const updated = await transitionOrder(orderId, ['pending_payment', 'payment_failed'], { status: 'paid', razorpayPaymentId: paymentId });
  if (updated) await recordPurchase(updated).catch((err) => console.error('[events]', err));
}

async function handleWebhook(req: Request, res: Response) {
  const signature = String(req.headers['x-razorpay-signature'] ?? '');
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  if (!isValidWebhookSignature(raw, signature)) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  let body: unknown = {};
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch {
    /* fall through: acknowledged below */
  }
  const event = z
    .object({
      event: z.string(),
      payload: z.object({
        payment: z.object({ entity: z.object({ id: z.string(), order_id: z.string().nullable().optional() }) }).optional(),
        order: z.object({ entity: z.object({ id: z.string() }) }).optional(),
      }),
    })
    .safeParse(body);
  if (!event.success) {
    res.status(200).end(); // acknowledge events we do not handle
    return;
  }

  const { payment, order } = event.data.payload;
  const rzpOrderId = order?.entity.id ?? payment?.entity.order_id ?? '';
  const record = rzpOrderId ? await findOrderByRazorpayId(rzpOrderId) : undefined;
  if (record) {
    if (event.data.event === 'payment.captured' || event.data.event === 'order.paid') {
      await markPaid(record.id, payment?.entity.id ?? record.razorpayPaymentId);
    } else if (event.data.event === 'payment.failed') {
      await transitionOrder(record.id, ['pending_payment'], { status: 'payment_failed' });
    }
  }
  res.status(200).end();
}

/** Small fixed-window limiter per client IP. Good enough for one instance; use a shared store if you scale out. */
function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
      next();
      return;
    }
    if (++entry.count > max) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }
    next();
  };
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}
