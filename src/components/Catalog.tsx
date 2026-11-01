import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { PRODUCTS, SEED_VARIANTS, type Product, type SeedVariant } from '../data/products';
import { TrioArt } from './Illustrations';
import { Photo } from './Photo';
import { delay } from '../lib/motion';

interface CatalogProps {
  tinVariant: SeedVariant;
  onTinVariantChange: (v: SeedVariant) => void;
}

export function Catalog({ tinVariant, onTinVariantChange }: CatalogProps) {
  return (
    <section id="shop" className="overflow-hidden bg-[#FAF9F5] pb-10 lg:pb-12">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        {/* Section header */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-reveal className="eyebrow">The Collection</p>
            <h2 data-reveal style={delay(100)} className="display mt-6 text-[40px] text-[#1A2421] sm:text-[56px]">
              Choose your <em className="text-[#597E52]">windowsill ritual.</em>
            </h2>
          </div>
          <p data-reveal style={delay(200)} className="max-w-sm text-[15px] leading-[1.75] text-[#6B726F] lg:col-span-5 lg:justify-self-end">
            Every kit ships dry and light from Erode, and wakes up with tap water in your kitchen.
          </p>
        </div>

        {/* Product cards — stacked vertically with generous spacing */}
        <div className="mt-14 space-y-12 lg:mt-16 lg:space-y-16">

          {/* Card A — Sage / Matcha */}
          <PillCard
            product={PRODUCTS['grow-tin']}
            variant={tinVariant}
            outerBg="bg-[#EBF2EB]"
            innerBg="bg-white"
            accentBg="bg-[#597E52] hover:bg-[#4B6F44]"
            accentText="text-[#597E52]"
            shadowColor="rgba(89,126,82,0.35)"
            reverse={false}
            media={
              <Photo
                name="grow-tin"
                alt="The Grow Tin with Italian Genovese Basil"
                className="h-full w-full object-cover"
              />
            }
            variantPicker={
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B726F]">Seed variant</span>
                <div className="relative mt-2">
                  <select
                    value={tinVariant}
                    onChange={(e) => onTinVariantChange(e.target.value as SeedVariant)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-[#EBE6DC] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#1A2421] shadow-xs transition hover:border-[#597E52] focus:border-[#597E52] focus:ring-2 focus:ring-[#597E52]/15 focus:outline-none"
                  >
                    {SEED_VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6B726F]" />
                </div>
              </label>
            }
          />

          {/* Card B — Warm Gold / Mustard — reversed */}
          <PillCard
            product={PRODUCTS['kitchen-trio']}
            variant={PRODUCTS['kitchen-trio'].fixedVariant!}
            outerBg="bg-[#FBF0D0]"
            innerBg="bg-white"
            accentBg="bg-[#E5A93C] hover:bg-[#B8851E]"
            accentText="text-[#E5A93C]"
            shadowColor="rgba(229,169,60,0.35)"
            reverse={true}
            media={
              <div className="flex h-full items-center justify-center px-8 pb-4 pt-10">
                <TrioArt className="h-full w-full max-w-[460px]" />
              </div>
            }
          />

          {/* Card C — Terracotta */}
          <PillCard
            product={PRODUCTS['living-soil-kit']}
            variant={PRODUCTS['living-soil-kit'].fixedVariant!}
            outerBg="bg-[#FAE8E0]"
            innerBg="bg-white"
            accentBg="bg-[#DE7A62] hover:bg-[#C4634C]"
            accentText="text-[#DE7A62]"
            shadowColor="rgba(222,122,98,0.35)"
            reverse={false}
            priceNote="Makes 10 Litres of Soil"
            media={
              <Photo
                name="coco-peat-pouch"
                alt="Expand-in-the-bag kraft pouch coco peat kit"
                className="h-full w-full object-cover"
              />
            }
          />
        </div>
      </div>
    </section>
  );
}

interface PillCardProps {
  product: Product;
  variant: string;
  media: ReactNode;
  outerBg: string;
  innerBg: string;
  accentBg: string;
  accentText: string;
  shadowColor: string;
  reverse?: boolean;
  variantPicker?: ReactNode;
  priceNote?: string;
}

function PillCard({ product, variant, media, outerBg, innerBg, accentBg, accentText, shadowColor, reverse, variantPicker, priceNote }: PillCardProps) {
  const { add } = useCart();
  const { format } = useCurrency();
  const [justAdded, setJustAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const onAdd = () => {
    add(product.id, variant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article id={product.id} data-reveal className="relative">
      {/* Outer tinted pill container */}
      <div className={`relative overflow-hidden rounded-[36px] p-6 ${outerBg} sm:p-10 lg:p-12`}>
        <div className={`flex flex-col gap-8 lg:flex-row lg:items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>

          {/* Media — breaks out of inner container, float with shadow */}
          <div className="relative flex-1 lg:flex-[0_0_52%]">
            <div className="overflow-hidden rounded-[28px] shadow-[0_32px_64px_-24px_var(--shadow-color,rgba(0,0,0,0.2))]" style={{ '--shadow-color': shadowColor } as React.CSSProperties}>
              <div className="aspect-[4/3.4] hover:scale-[1.03] transition-transform duration-[1.6s] ease-[cubic-bezier(.2,.7,.2,1)]">
                {media}
              </div>
            </div>
          </div>

          {/* Inner white pill — content */}
          <div className={`flex-1 ${innerBg} rounded-[28px] p-7 shadow-[0_8px_32px_-8px_rgba(26,36,33,0.10)] sm:p-9`} data-reveal style={delay(200)}>
            <span className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${accentText}`}>
              <span className={`size-1.5 rounded-full ${accentBg.split(' ')[0]}`} />
              {product.badge}
            </span>
            <h3 className="display mt-5 text-[28px] leading-[1.1] text-[#1A2421] sm:text-[34px]">{product.name}</h3>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-[#6B726F]">{product.tagline}</p>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-serif text-[30px] text-[#1A2421]">{format(product.price)}</span>
              {product.compareAt && <span className="text-sm text-[#6B726F] line-through">{format(product.compareAt)}</span>}
              {priceNote && <span className={`text-[13px] font-medium ${accentText}`}>{priceNote}</span>}
            </div>

            {variantPicker && <div className="mt-5">{variantPicker}</div>}

            <ul className="mt-5 grid gap-1.5 border-t border-[#EBE6DC] pt-5 sm:grid-cols-2 sm:gap-x-5">
              {product.contents.map((c) => (
                <li key={c} className="flex gap-2 text-[13px] leading-snug text-[#1A2421]">
                  <Check className={`mt-0.5 size-3.5 shrink-0 ${accentText}`} />
                  {c}
                </li>
              ))}
            </ul>

            {showDetails && product.details && (
              <ul className="mt-4 animate-fade space-y-1.5 rounded-2xl bg-[#FAF9F5] p-4 text-[13px] leading-snug text-[#6B726F]">
                {product.details.map((d) => <li key={d}>— {d}</li>)}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onAdd}
                className={`inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-[12px] font-semibold text-white transition-all active:scale-[0.98] ${justAdded ? 'bg-[#3A7A3A]' : accentBg}`}
              >
                {justAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
                {justAdded ? 'Added to cart' : `${product.cta} • ${format(product.price)}`}
              </button>
              {product.details && (
                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  aria-expanded={showDetails}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1A2421]/20 px-7 py-3 text-[12px] font-semibold text-[#1A2421] transition-all hover:border-[#1A2421] hover:bg-[#1A2421] hover:text-white active:scale-[0.98]"
                >
                  {showDetails ? 'Hide details' : 'Details'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

