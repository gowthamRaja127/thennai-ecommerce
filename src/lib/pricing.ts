import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, type Product } from '../data/products.ts';

export interface LineInput {
  productId: string;
  variant: string;
  quantity: number;
}

export interface QuotedLine extends LineInput {
  name: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Quote {
  lines: QuotedLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

export type LineProblem = { index: number; field: 'productId' | 'variant'; message: string };

/** Checks each line against the live catalogue: the product must exist, be on sale, and offer the variant. */
export function lineProblems(items: LineInput[], catalog: Record<string, Product>): LineProblem[] {
  const problems: LineProblem[] = [];
  items.forEach((l, index) => {
    const p = catalog[l.productId];
    if (!p || !p.active) problems.push({ index, field: 'productId', message: 'This item is no longer available' });
    else if (!p.variants.includes(l.variant)) problems.push({ index, field: 'variant', message: 'That variant is no longer available' });
  });
  return problems;
}

/**
 * Prices an order from the catalogue. The server calls this on every checkout so the amount
 * charged never depends on prices sent by the browser. Call lineProblems() first. Whole rupees.
 */
export function quote(items: LineInput[], catalog: Record<string, Product>): Quote {
  const lines = items.map((l) => {
    const p = catalog[l.productId];
    return { ...l, name: p.name, unitPrice: p.price, lineTotal: p.price * l.quantity };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
