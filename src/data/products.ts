export type SeedVariant = 'Sweet Italian Basil' | 'English Thyme' | 'Cherry Tomato' | 'Native Coriander';

export const SEED_VARIANTS: SeedVariant[] = [
  'Sweet Italian Basil',
  'English Thyme',
  'Cherry Tomato',
  'Native Coriander',
];

export type ProductId = 'grow-tin' | 'kitchen-trio' | 'living-soil-kit' | 'coin-refill';

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  badge: string;
  price: number;
  compareAt?: number;
  tagline: string;
  contents: string[];
  cta: string;
  details?: string[];
  hasSeedVariants?: boolean;
  fixedVariant?: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  'grow-tin': {
    id: 'grow-tin',
    name: 'The Windowsill Grow Tin',
    shortName: 'Grow Tin',
    badge: 'Bestseller for Workspaces',
    price: 199,
    compareAt: 249,
    tagline: 'A desk-sized herb studio. Everything you need, in one seamless tin.',
    contents: [
      '1× Seamless Alloy Grow Tin',
      '3× 50mm Muthur Low-EC Coir Coins',
      '1× Seed Packet',
      '1× Handcrafted Wooden Marker',
    ],
    cta: 'Add to Cart',
    details: [
      'Matte, rust-resistant alloy tin with lid, reusable for every sowing',
      'Each coin expands 7× to fill the tin',
      'Germination guaranteed or we reship free',
    ],
    hasSeedVariants: true,
  },
  'kitchen-trio': {
    id: 'kitchen-trio',
    name: 'The Kitchen Trio Herb Garden',
    shortName: 'Kitchen Trio',
    badge: 'Most Popular Gift • Save 20%',
    price: 499,
    compareAt: 599,
    tagline: 'Three tins for the kitchen sill, ready to give.',
    contents: [
      '3× Grow Tins: Basil, Cherry Tomato & Mint',
      '9× Low-EC Coir Coins (3 per tin)',
      'Custom embossed unbleached kraft gift sleeve',
    ],
    cta: 'Claim Trio Kit',
    details: [
      'Gift-ready: arrives sleeved, no extra wrapping needed',
            'Corporate and wholesale gifting available on request',
    ],
    fixedVariant: 'Basil + Cherry Tomato + Mint',
  },
  'living-soil-kit': {
    id: 'living-soil-kit',
    name: 'Expand-In-The-Bag Living Soil Kit (650g)',
    shortName: 'Living Soil Kit',
    badge: 'Zero-Bucket Indoor Potting',
    price: 299,
    tagline: 'Makes 10 litres of soil. No tub, no bucket, no mess.',
    contents: [
      'Heavy-duty 150-micron waterproof kraft gusset pouch',
      'Pour 3.5L water directly into the bag',
      '100g dry vermicompost sachet',
      'Cold-pressed neem cake sachet',
    ],
    cta: 'Add to Cart',
    details: [
      'Unzip, pour 3.5L water to the fill line, wait 20 minutes',
      'Fluff by hand inside the bag, then tip in the bio-booster',
      'Ideal for repotting monsteras, pothos and balcony herbs',
    ],
    fixedVariant: '650g • Makes 10L',
  },
  'coin-refill': {
    id: 'coin-refill',
    name: '3-Coin Refill Pack',
    shortName: 'Coin Refill',
    badge: 'Refill',
    price: 49,
    tagline: 'Three extra 50mm Low-EC coins for your next sowing.',
    contents: ['3× 50mm Muthur Low-EC Coir Coins'],
    cta: 'Add',
    fixedVariant: '3× 50mm coins',
  },
};

export const CATALOG: ProductId[] = ['grow-tin', 'kitchen-trio', 'living-soil-kit'];

export const FREE_SHIPPING_THRESHOLD = 499;
export const SHIPPING_FEE = 49;
