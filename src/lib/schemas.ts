import { z } from 'zod';
import { ART_NAMES, CATEGORIES, MAX_QTY_PER_LINE, PHOTO_NAMES } from '../data/products.ts';

/*
 * Checkout validation shared by the browser (form feedback) and the server (source of truth).
 */

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;

export const PAYMENT_METHODS = ['razorpay', 'cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const personName = z
  .string()
  .trim()
  .min(2, 'Enter your full name')
  .max(60, 'Keep it under 60 characters')
  .regex(/^[\p{L}][\p{L} .'-]*$/u, 'Use letters, spaces, dots or hyphens only');

/** Accepts "98765 43210", "+91 98765-43210", "09876543210" and normalises to 10 digits. */
const indianMobile = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s()-]/g, '').replace(/^(?:\+91|0091|0)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'));

export const contactSchema = z.object({
  email: z.email('Enter a valid email address').max(254, 'Email is too long'),
  phone: indianMobile,
});

export const addressSchema = z.object({
  fullName: personName,
  line1: z.string().trim().min(5, 'Add your flat, house or building').max(120, 'Keep it under 120 characters'),
  line2: z.string().trim().max(120, 'Keep it under 120 characters'),
  landmark: z.string().trim().max(80, 'Keep it under 80 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'Enter your city')
    .max(60, 'Keep it under 60 characters')
    .regex(/^[\p{L}][\p{L} .'-]*$/u, 'Use letters only'),
  state: z.enum(INDIAN_STATES, { error: 'Select your state' }),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
});

/** Product ids are URL slugs: lowercase letters, digits and single hyphens. */
export const slugSchema = z
  .string()
  .trim()
  .min(2, 'At least 2 characters')
  .max(60, 'Keep it under 60 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only (e.g. mint-grow-tin)');

/** Shape only. Whether the product and variant exist is checked on the server against the live catalogue. */
export const cartLineSchema = z.object({
  productId: slugSchema,
  variant: z.string().trim().min(1).max(60),
  quantity: z.int('Quantity must be a whole number').min(1).max(MAX_QTY_PER_LINE, `At most ${MAX_QTY_PER_LINE} per item`),
});

export const checkoutSchema = z.object({
  contact: contactSchema,
  shipping: addressSchema,
  paymentMethod: z.enum(PAYMENT_METHODS, { error: 'Choose a payment method' }),
  notes: z.string().trim().max(300, 'Keep delivery notes under 300 characters'),
  items: z.array(cartLineSchema).min(1, 'Your cart is empty').max(20, 'Too many items in one order'),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

export const orderIdSchema = z.string().regex(/^TH-[A-Z0-9]{8,12}$/, 'Invalid order reference');

export const verifyPaymentSchema = z.object({
  orderId: orderIdSchema,
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/** Flattens zod issues to `{ "shipping.pincode": "message" }`, keeping the first message per field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/* ---------- Admin: product editor ---------- */

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [string, ...string[]];
const listOfLines = (max: number, label: string) =>
  z.array(z.string().trim().min(1).max(200, `${label} lines must be under 200 characters`)).max(max, `At most ${max} ${label.toLowerCase()} lines`);

export const productMediaSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('photo'), name: z.enum(PHOTO_NAMES), fit: z.enum(['cover', 'contain']).optional() }),
  z.object({ kind: z.literal('art'), name: z.enum(ART_NAMES) }),
  z.object({ kind: z.literal('url'), url: z.url('Must be a valid image URL').max(500), alt: z.string().max(160).optional() }),
]);

export const productSchema = z
  .object({
    id: slugSchema,
    name: z.string().trim().min(3, 'Name is too short').max(90, 'Keep the name under 90 characters'),
    shortName: z.string().trim().min(2, 'Short name is too short').max(30, 'Keep it under 30 characters'),
    category: z.enum(CATEGORY_IDS, { error: 'Choose a category' }),
    badge: z.string().trim().max(40, 'Keep the badge under 40 characters'),
    price: z.int('Whole rupees only').min(1, 'Price must be at least ₹1').max(100000, 'Price looks too high'),
    compareAt: z.int('Whole rupees only').min(1).max(100000).nullable(),
    tagline: z.string().trim().min(10, 'Add a one-line tagline').max(140, 'Keep the tagline under 140 characters'),
    description: z.string().trim().min(20, 'Write at least a sentence').max(2000, 'Keep it under 2000 characters'),
    contents: listOfLines(12, 'Contents'),
    howTo: listOfLines(10, 'How-to'),
    details: listOfLines(10, 'Details'),
    variants: z
      .array(z.string().trim().min(1, 'Variant names cannot be empty').max(60, 'Variant names must be under 60 characters'))
      .min(1, 'Add at least one variant')
      .max(12, 'At most 12 variants')
      .refine((v) => new Set(v.map((x) => x.toLowerCase())).size === v.length, 'Variant names must be unique'),
    media: z.array(productMediaSchema).min(1, 'Add at least one image').max(8, 'At most 8 images'),
    cta: z.string().trim().min(2).max(30, 'Keep the button label under 30 characters'),
    active: z.boolean(),
    sortOrder: z.int().min(0).max(10000),
  })
  .refine((p) => p.compareAt === null || p.compareAt > p.price, {
    message: 'Compare-at price must be higher than the price',
    path: ['compareAt'],
  });

export type ProductInput = z.input<typeof productSchema>;

/* ---------- Analytics ---------- */

export const EVENT_TYPES = ['product_view', 'product_click', 'add_to_cart', 'begin_checkout'] as const;
export type EventType = (typeof EVENT_TYPES)[number] | 'purchase';

export const analyticsBatchSchema = z.object({
  sessionId: z.string().regex(/^[a-z0-9]{16,40}$/),
  events: z
    .array(
      z.object({
        type: z.enum(EVENT_TYPES),
        productId: slugSchema,
        variant: z.string().trim().max(60).optional(),
        quantity: z.int().min(1).max(MAX_QTY_PER_LINE).optional(),
        source: z.string().trim().max(40).optional(),
        at: z.iso.datetime(),
      }),
    )
    .min(1)
    .max(50),
});
