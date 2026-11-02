import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, Minus, Plus } from 'lucide-react';
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
    <section id="shop" className="pb-28 pt-24 lg:pb-40 lg:pt-32">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
        <div className="max-w-3xl">
          <p data-reveal className="eyebrow">The collection</p>
          <h2 data-reveal style={delay(100)} className="display mt-6 text-[40px] text-espresso sm:text-[54px]">
            Three quiet rituals <em className="font-normal text-pine">for the sill.</em>
          </h2>
        </div>

        <div className="mt-20 divide-y divide-line border-y border-line lg:mt-24">
          <ProductRow
            index="01"
            product={PRODUCTS['grow-tin']}
            variant={tinVariant}
            frame="arch"
            media={<Photo name="grow-tin" alt="The Grow Tin with coir coins and a basil seed packet" className="h-full w-full object-cover" />}
            picker={
              <label className="block max-w-xs">
                <span className="sr-only">Seed variant</span>
                <span className="relative block">
                  <select
                    value={tinVariant}
                    onChange={(e) => onTinVariantChange(e.target.value as SeedVariant)}
                    className="w-full cursor-pointer appearance-none border-b border-line bg-transparent py-2.5 pr-8 font-serif text-[17px] italic text-espresso transition hover:border-espresso focus:border-espresso focus:outline-none"
                  >
                    {SEED_VARIANTS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-umber" />
                </span>
              </label>
            }
          />
          <ProductRow
            index="02"
            product={PRODUCTS['kitchen-trio']}
            variant={PRODUCTS['kitchen-trio'].fixedVariant!}
            frame="arch"
            reverse
            media={
              <div className="flex h-full items-center justify-center bg-butter px-10">
                <TrioArt className="w-full max-w-[420px]" />
              </div>
            }
          />
          <ProductRow
            index="03"
            product={PRODUCTS['living-soil-kit']}
            variant={PRODUCTS['living-soil-kit'].fixedVariant!}
            frame="arch"
            priceNote="makes 10 litres"
            media={<Photo name="coco-peat-pouch" alt="Expand-in-the-bag coco peat kraft pouch with bio-booster sachet" className="h-full w-full object-cover" />}
          />
        </div>
      </div>
    </section>
  );
}

interface ProductRowProps {
  index: string;
  product: Product;
  variant: string;
  media: ReactNode;
  frame: 'arch' | 'wabi' | 'pebble';
  reverse?: boolean;
  picker?: ReactNode;
  priceNote?: string;
}

function ProductRow({ index, product, variant, media, frame, reverse, picker, priceNote }: ProductRowProps) {
  const { add } = useCart();
  const { format } = useCurrency();
  const [justAdded, setJustAdded] = useState(false);
  const [open, setOpen] = useState(false);

  const onAdd = () => {
    add(product.id, variant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article id={product.id} className="grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
      <div className={`lg:col-span-6 ${reverse ? 'lg:order-2 lg:col-start-7' : ''}`}>
        <div
          data-reveal="mask"
          className={`${frame} mx-auto overflow-hidden bg-paper ${'aspect-[4/5] max-w-[460px]'}`}
        >
          <div className="h-full transition-transform duration-[1.8s] ease-[cubic-bezier(.2,.7,.2,1)] hover:scale-[1.04]">{media}</div>
        </div>
      </div>

      <div className={`lg:col-span-5 ${reverse ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-8'}`}>
        <p data-reveal className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-umber">
          <span className="font-serif text-[15px] font-normal normal-case italic tracking-normal text-kraft">No. {index}</span>
          <span className="h-px w-8 bg-line" />
          {product.badge}
        </p>

        <h3 data-reveal style={delay(80)} className="display mt-6 text-[34px] text-espresso sm:text-[42px]">
          {product.name}
        </h3>
        <p data-reveal style={delay(140)} className="mt-4 max-w-sm text-[15px] leading-[1.8] text-umber">
          {product.tagline}
        </p>

        <div data-reveal style={delay(200)} className="mt-7 flex flex-wrap items-baseline gap-x-3">
          <span className="font-serif text-[30px] font-normal text-espresso">{format(product.price)}</span>
          {product.compareAt && <span className="text-[14px] text-umber/70 line-through">{format(product.compareAt)}</span>}
          {priceNote && <span className="font-serif text-[15px] italic text-umber">— {priceNote}</span>}
        </div>

        {picker && (
          <div data-reveal style={delay(240)} className="mt-6">
            {picker}
          </div>
        )}

        <div data-reveal style={delay(280)} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <button type="button" onClick={onAdd} className={`btn active:scale-[0.98] ${justAdded ? 'bg-leaf text-linen' : 'btn-solid'}`}>
            {justAdded ? <Check className="size-4" /> : null}
            {justAdded ? 'Added' : product.cta}
            {!justAdded && <ArrowRight className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-espresso"
          >
            {open ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
            What’s inside
          </button>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-500 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-[14px] text-espresso">
              {[...product.contents, ...(product.details ?? [])].map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="pebble mt-[7px] block size-1.5 shrink-0 bg-pine/70" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
