/*
 * Product model. Products live in Supabase (`products` table) and are edited from /admin.
 * SEED_PRODUCTS is the launch catalogue: it seeds the database (see supabase/migrations) and
 * is what the storefront renders before the live catalogue loads or when no database is configured.
 */

export type Category = 'grow-tins' | 'soil' | 'gifts' | 'refills';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'grow-tins', label: 'Grow Tins' },
  { id: 'soil', label: 'Living Soil' },
  { id: 'gifts', label: 'Gift Sets' },
  { id: 'refills', label: 'Refills' },
];

export const PHOTO_NAMES = ['grow-tin', 'expand-in-bag', 'coco-peat-pouch', 'coin-refill', 'kitchen-trio'] as const;
export const ART_NAMES = ['trio', 'refill'] as const;

/**
 * A bundled photograph, a drawn illustration, or an uploaded image URL (Supabase Storage).
 * `fit: 'contain'` shows a wide photo whole inside portrait frames, over a blurred fill of itself.
 */
export type ProductMedia =
  | { kind: 'photo'; name: (typeof PHOTO_NAMES)[number]; fit?: 'cover' | 'contain' }
  | { kind: 'art'; name: (typeof ART_NAMES)[number] }
  | { kind: 'url'; url: string; alt?: string };

export interface Product {
  /** URL slug and primary key, e.g. "grow-tin". */
  id: string;
  name: string;
  shortName: string;
  category: Category;
  badge: string;
  price: number;
  compareAt: number | null;
  tagline: string;
  description: string;
  contents: string[];
  howTo: string[];
  details: string[];
  /** Selectable variants; the first is the default. Single-variant products still list one. */
  variants: string[];
  media: ProductMedia[];
  cta: string;
  active: boolean;
  sortOrder: number;
}

export type SeedVariant = 'Sweet Italian Basil' | 'English Thyme' | 'Cherry Tomato' | 'Native Coriander';
export const SEED_VARIANTS: SeedVariant[] = ['Sweet Italian Basil', 'English Thyme', 'Cherry Tomato', 'Native Coriander'];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'grow-tin',
    name: 'The Windowsill Grow Tin',
    shortName: 'Grow Tin',
    category: 'grow-tins',
    badge: 'Bestseller for Workspaces',
    price: 199,
    compareAt: 249,
    tagline: 'A desk-sized herb studio. Everything you need, in one seamless tin.',
    description:
      'One matte alloy tin holds the whole ritual: three compressed Muthur coir coins, a packet of seeds and a handcrafted wooden marker. Add a splash of water, sow, and set it on a bright sill. No soil bag, no tray, no mess.',
    contents: ['1× Seamless Alloy Grow Tin', '3× 50mm Muthur Low-EC Coir Coins', '1× Seed Packet', '1× Handcrafted Wooden Marker'],
    howTo: [
      'Place 1 dry coin in the tin and pour 5 tablespoons of tap water.',
      'Wait about 60 seconds while it expands 7× into airy substrate.',
      'Sprinkle 3–4 seeds, cover gently, and keep under indirect light.',
      'Sprouts appear in 4–6 days. Mist lightly when the surface feels dry.',
    ],
    details: [
      'Matte, rust-resistant alloy tin with lid, reusable for every sowing',
      'Each coin expands 7× to fill the tin',
      'Germination guaranteed or we reship free',
    ],
    variants: [...SEED_VARIANTS],
    media: [{ kind: 'photo', name: 'grow-tin' }],
    cta: 'Add to Cart',
    active: true,
    sortOrder: 10,
  },
  {
    id: 'living-soil-kit',
    name: 'Expand-In-The-Bag Living Soil Kit (650g)',
    shortName: 'Living Soil Kit',
    category: 'soil',
    badge: 'Zero-Bucket Indoor Potting',
    price: 299,
    compareAt: null,
    tagline: 'Makes 10 litres of soil. No tub, no bucket, no mess.',
    description:
      'A compressed block of triple-washed Low-EC coir in a heavy waterproof kraft pouch. Pour water straight into the bag, wait, fluff, and stir in the bio-booster. Ten litres of airy living soil, made on your kitchen counter.',
    contents: [
      'Heavy-duty 150-micron waterproof kraft gusset pouch',
      'Pour 3.5L water directly into the bag',
      '100g dry vermicompost sachet',
      'Cold-pressed neem cake sachet',
    ],
    howTo: [
      'Unzip the pouch and pour 3.5L of water to the fill line.',
      'Wait about 20 minutes for the block to expand.',
      'Fluff by hand inside the bag, then tip in the bio-booster sachets.',
      'Use straight from the pouch for repotting or fresh sowing.',
    ],
    details: ['Ideal for repotting monsteras, pothos and balcony herbs'],
    variants: ['650g • Makes 10L'],
    media: [
      { kind: 'photo', name: 'coco-peat-pouch' },
      { kind: 'photo', name: 'expand-in-bag' },
    ],
    cta: 'Add to Cart',
    active: true,
    sortOrder: 20,
  },
  {
    id: 'kitchen-trio',
    name: 'The Kitchen Trio Herb Garden',
    shortName: 'Kitchen Trio',
    category: 'gifts',
    badge: 'Most Popular Gift • Save 20%',
    price: 499,
    compareAt: 599,
    tagline: 'Three tins for the kitchen sill, ready to give.',
    description:
      'Basil, cherry tomato and mint, each in its own Grow Tin with three coir coins, sleeved together in embossed unbleached kraft. A considered gift that keeps growing long after it is unwrapped.',
    contents: ['3× Grow Tins: Basil, Cherry Tomato & Mint', '9× Low-EC Coir Coins (3 per tin)', 'Custom embossed unbleached kraft gift sleeve'],
    howTo: [
      'Hydrate one coin per tin with 5 tablespoons of water.',
      'Sow each tin with its own seed packet and label it with the marker.',
      'Keep the trio together on a bright kitchen sill.',
    ],
    details: ['Gift-ready: arrives sleeved, no extra wrapping needed', 'Corporate and wholesale gifting available on request'],
    variants: ['Basil + Cherry Tomato + Mint'],
    media: [{ kind: 'photo', name: 'kitchen-trio', fit: 'contain' }],
    cta: 'Claim Trio Kit',
    active: true,
    sortOrder: 30,
  },
  {
    id: 'coin-refill',
    name: '3-Coin Refill Pack',
    shortName: 'Coin Refill',
    category: 'refills',
    badge: 'Refill',
    price: 49,
    compareAt: null,
    tagline: 'Three extra 50mm Low-EC coins for your next sowing.',
    description: 'Three compressed Muthur coir coins, sized for the Grow Tin. Keep a pack in the drawer for the next round of herbs.',
    contents: ['3× 50mm Muthur Low-EC Coir Coins'],
    howTo: ['Hydrate one coin with 5 tablespoons of water, then sow as usual.'],
    details: [],
    variants: ['3× 50mm coins'],
    media: [{ kind: 'photo', name: 'coin-refill' }],
    cta: 'Add to Cart',
    active: true,
    sortOrder: 40,
  },
];

export const REFILL_ID = 'coin-refill';

export const FREE_SHIPPING_THRESHOLD = 499;
export const SHIPPING_FEE = 49;
export const MAX_QTY_PER_LINE = 10;

export function indexById(products: Product[]): Record<string, Product> {
  return Object.fromEntries(products.map((p) => [p.id, p]));
}

export const SEED_BY_ID = indexById(SEED_PRODUCTS);

export function savePercent(p: Pick<Product, 'price' | 'compareAt'>): number {
  return p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
}
