import { useEffect, useState } from 'react';
import { ArrowRight, Check, ShoppingBag, Sprout, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Photo } from './Photo';
import { delay } from '../lib/motion';

const SPECS = [
  ['Substrate', '100% Native Coir'],
  ['Expansion', '7× in 60 seconds'],
  ['Salinity', 'Low-EC <0.5 mS/cm'],
  ['Harvest', '4–6 Days to Sprout'],
];

export function Hero() {
  const { format } = useCurrency();
  const { add } = useCart();
  const [shift, setShift] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShift(Math.min(window.scrollY, 900)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleAddToCart = () => {
    add('living-soil-kit', '650g • Makes 10L');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <section id="top" className="relative overflow-hidden bg-[#FAF9F5] pt-4 pb-16 lg:pb-24">
      {/* Editorial Luxury Glows & Ambiance */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Warm sunrise organic aura */}
        <div className="absolute -right-24 -top-32 h-[680px] w-[680px] rounded-full bg-gradient-to-br from-[#FBF3DE]/80 via-[#F7E7C4]/40 to-transparent blur-3xl" />
        {/* Fresh herbal matcha ambient glow */}
        <div className="absolute -left-20 top-1/4 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-[#EBF2EB]/90 via-[#DFEBDE]/40 to-transparent blur-3xl" />
        {/* Soft terracotta touch */}
        <div className="absolute right-1/3 bottom-0 h-[380px] w-[380px] rounded-full bg-[#FAE8E0]/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8">
        <div className="grid min-h-[calc(100svh-120px)] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* ================= LEFT COLUMN: Editorial Product Stage ================= */}
          <div className="relative order-2 lg:order-1 lg:col-span-6 flex justify-center">
            {/* Vertical Pagination Bar */}
            <div className="absolute -left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 items-center gap-3 lg:flex">
              <span className="font-serif text-[12px] italic tracking-widest text-[#1A2421]">01</span>
              <span className="h-px w-10 bg-[#1A2421]/25" />
              <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6B726F]">04</span>
            </div>

            <div className="relative w-full max-w-[500px]">
              {/* Outer Tinted Ambient Pill (Muse + Metta aesthetic) */}
              <div className="relative rounded-[44px] bg-gradient-to-b from-[#F5EFE6] via-[#EFE7D8] to-[#E8DEC9]/70 p-4 sm:p-6 shadow-[0_36px_80px_-24px_rgba(26,36,33,0.18)] ring-1 ring-[#EBE6DC]">
                
                {/* Main Product Canvas Frame */}
                <div className="relative overflow-hidden rounded-[34px] bg-white shadow-[0_16px_36px_-12px_rgba(26,36,33,0.12)]">
                  <div style={{ transform: `translateY(${shift * 0.05}px) scale(1.03)` }} className="will-change-transform">
                    <Photo
                      name="coco-peat-pouch"
                      priority
                      alt="Thennai Expand-in-the-Bag Living Soil Pouch with Bio-Booster"
                      className="aspect-[4/4.3] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                    />
                  </div>

                  {/* Gentle gradient vignette overlay on photo bottom */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  
                  {/* Floating in-image capsule pill */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-2.5 backdrop-blur-md shadow-md ring-1 ring-white/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#EBF2EB] text-[#597E52]">
                        <Sprout className="size-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#1A2421] leading-none">Expand-in-Bag 650g</p>
                        <p className="text-[9.5px] text-[#6B726F] mt-0.5">Waterproof Kraft Gusset Pouch</p>
                      </div>
                    </div>
                    <span className="font-serif text-[15px] font-semibold text-[#597E52]">Makes 10L</span>
                  </div>
                </div>

                {/* Floating Pill Counter: 100% Zero-Mess Guarantee */}
                <div className="mt-4 flex items-center justify-between px-2 text-[11px] text-[#6B726F]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#597E52] animate-pulse" />
                    In stock • Dispatched in 24 hrs
                  </span>
                  <span className="font-medium text-[#1A2421]">Arachalur, Erode</span>
                </div>
              </div>

              {/* Botanical Accent Orbs */}
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[#EBF2EB] blur-2xl opacity-75" />
              <div aria-hidden className="pointer-events-none absolute -left-6 -bottom-6 size-24 rounded-full bg-[#FBF3DE] blur-xl opacity-80" />
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Editorial Typography & CTAs ================= */}
          <div className="order-1 lg:order-2 lg:col-span-6 lg:pl-4">
            
            {/* Top pill badge */}
            <div data-reveal className="inline-flex items-center gap-2 rounded-full border border-[#EBE6DC] bg-white/80 px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#597E52] shadow-xs backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#597E52]" />
              Zero Dirt · Windowsill Herb Studio
            </div>

            {/* High-Contrast Editorial Serif Headline */}
            <h1 data-reveal style={delay(100)} className="mt-6 font-serif text-[48px] font-normal leading-[1.04] tracking-[-0.025em] text-[#1A2421] sm:text-[62px] xl:text-[72px]">
              Urban Gardening.<br />
              <em className="text-[#597E52] font-normal italic">Minus the Mud.</em>
            </h1>

            {/* Editorial Body Description */}
            <p data-reveal style={delay(200)} className="mt-6 max-w-[34rem] text-[16px] leading-[1.8] text-[#6B726F] sm:text-[17.5px]">
              Triple-freshwater-washed low-EC coconut coir coins and expand-in-bag living soil kits from native Muthur mills. Add a splash of water, watch it fluff 7×, and harvest fresh herbs right from your windowsill.
            </p>

            {/* CTA Group with Matcha Olive Pill & Adjacent Price */}
            <div data-reveal style={delay(300)} className="mt-9 flex flex-wrap items-center gap-5 sm:gap-6">
              <button
                type="button"
                onClick={handleAddToCart}
                className="group relative inline-flex items-center gap-3 rounded-full bg-[#597E52] px-8 py-4 text-[13px] font-semibold text-white shadow-[0_18px_40px_-12px_rgba(89,126,82,0.65)] transition-all hover:bg-[#4B6F44] hover:shadow-[0_24px_50px_-12px_rgba(75,111,68,0.75)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {justAdded ? (
                  <>
                    <Check className="size-4 animate-scale" />
                    <span>Added To Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4 transition-transform group-hover:scale-110" />
                    <span>Add To Cart</span>
                    <ArrowRight className="size-3.5 opacity-60 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[34px] font-normal tracking-tight text-[#1A2421]">
                  {format(299)}
                </span>
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#6B726F]">/ kit</span>
              </div>
            </div>

            {/* Social Trust Strip */}
            <div data-reveal style={delay(380)} className="mt-7 flex items-center gap-3 text-[13px] text-[#6B726F]">
              <div className="flex text-[#E5A93C]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#1A2421]">4.9/5</span>
              <span className="h-3 w-px bg-[#EBE6DC]" />
              <span>Over 5,000+ windowsill gardens across metros</span>
            </div>

            {/* Meta-Spec Strip with Subtle Dividers */}
            <div data-reveal style={delay(460)} className="mt-10 rounded-2xl bg-white/70 p-4 backdrop-blur-xs ring-1 ring-[#EBE6DC]">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EBE6DC]/80">
                {SPECS.map(([k, v], idx) => (
                  <div key={k} className={`${idx !== 0 ? 'sm:pl-4' : ''} ${idx > 1 ? 'pt-3 sm:pt-0' : ''}`}>
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#6B726F]">{k}</dt>
                    <dd className="mt-1 font-serif text-[14.5px] leading-snug text-[#1A2421]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}




