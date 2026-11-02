import type { Product } from '../data/products.ts';

/* Mapping between the `products` table (snake_case) and the app's Product model. */

export interface ProductRow {
  id: string;
  name: string;
  short_name: string;
  category: Product['category'];
  badge: string;
  price: number;
  compare_at: number | null;
  tagline: string;
  description: string;
  contents: string[];
  how_to: string[];
  details: string[];
  variants: string[];
  media: Product['media'];
  cta: string;
  active: boolean;
  sort_order: number;
}

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    shortName: r.short_name,
    category: r.category,
    badge: r.badge,
    price: r.price,
    compareAt: r.compare_at,
    tagline: r.tagline,
    description: r.description,
    contents: r.contents ?? [],
    howTo: r.how_to ?? [],
    details: r.details ?? [],
    variants: r.variants ?? [],
    media: r.media ?? [],
    cta: r.cta,
    active: r.active,
    sortOrder: r.sort_order,
  };
}

export function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    short_name: p.shortName,
    category: p.category,
    badge: p.badge,
    price: p.price,
    compare_at: p.compareAt,
    tagline: p.tagline,
    description: p.description,
    contents: p.contents,
    how_to: p.howTo,
    details: p.details,
    variants: p.variants,
    media: p.media,
    cta: p.cta,
    active: p.active,
    sort_order: p.sortOrder,
  };
}
