import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Photo } from './Photo';
import { delay } from '../lib/motion';

const SPECS = [
  ['Substrate', '100% Native Coir'],
  ['Varieties', '4 Kitchen Herbs'],
  ['Yield', '10 Litres Fluffy Soil'],
];

export function Hero() {
  const { format } = useCurrency();
  const { add } = useCart();
  const [shift, setShift] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShift(Math.min(window.scrollY, 900)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-[#FAF9F5]">
      {/* Ambient radial gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[80%] w-[55%] rounded-bl-[60%] bg-gradient-to-bl from-[#FBF3DE] via-[#FAF0D0]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 h-[40%] w-[30%] rounded-tr-[50%] bg-gradient-to-tr from-[#EBF2EB]/60 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-[1360px] min-h-[calc(100svh-104px)] grid-cols-1 items-center gap-10 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-2 lg:gap-16">

        {/* Left: product image area */}
        <div className="relative order-2 lg:order-1">
          {/* Vertical pagination */}
          <span data-reveal className="absolute -left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[10px] font-semibold tracking-[0.3em] text-[#6B726F]/50 lg:flex">
            01 / 04
          </span>

          {/* Floating pill image container */}
          <div data-reveal="mask" className="relative mx-auto max-w-[500px]">
            {/* Ambient shadow blob */}
            <div aria-hidden className="absolute -bottom-8 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-[#1A2421]/10 blur-2xl" />

            {/* Image pill */}
            <div className="overflow-hidden rounded-[40px] bg-gradient-to-b from-[#FBF3DE] to-[#F5E8C8] shadow-[0_40px_80px_-20px_rgba(26,36,33,0.25)]">
              <div style={{ transform: `translateY(${shift * 0.06}px) scale(1.06)` }} className="will-change-transform">
                <Photo
                  name="grow-tin"
                  priority
                  alt="The Grow Tin by Thennai, open with coir coins and a basil seed packet"
                  className="aspect-[4/4.2] w-full object-cover"
                />
              </div>
            </div>

            {/* Floating botanical accent blobs */}
            <div aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-[#EBF2EB] blur-xl opacity-80" />
            <div aria-hidden className="absolute -left-4 bottom-12 size-16 rounded-full bg-[#FBF3DE] blur-lg opacity-70" />
          </div>
        </div>

        {/* Right: content */}
        <div className="order-1 lg:order-2">
          <span data-reveal className="inline-flex items-center gap-2 rounded-full border border-[#EBE6DC] bg-[#EBF2EB] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#597E52]">
            🌱 Zero Dirt · Windowsill Herb Studio
          </span>

          <h1 data-reveal style={delay(100)} className="mt-8 font-serif text-[52px] font-normal leading-[1.02] tracking-[-0.02em] text-[#1A2421] sm:text-[64px] xl:text-[76px]">
            The Windowsill<br />
            <em className="text-[#597E52]">Studio.</em>
          </h1>

          <p data-reveal style={delay(220)} className="mt-6 max-w-[30rem] text-[16px] leading-[1.8] text-[#6B726F] sm:text-[17px]">
            Triple-washed low-EC coconut coir coins sourced from native Muthur mills. Zero dirt, zero buckets — just drop, sow, and harvest fresh herbs from your apartment windowsill.
          </p>

          {/* CTA group */}
          <div data-reveal style={delay(340)} className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => add('grow-tin', 'Sweet Italian Basil')}
              className="inline-flex items-center gap-3 rounded-full bg-[#597E52] px-8 py-3.5 text-[13px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(89,126,82,0.6)] transition-all hover:bg-[#4B6F44] hover:shadow-[0_20px_50px_-12px_rgba(75,111,68,0.7)] active:scale-[0.98]"
            >
              <ShoppingBag className="size-4" />
              Add To Cart
            </button>
            <span className="font-serif text-[28px] font-normal text-[#1A2421]">
              {format(199)} <span className="text-[14px] font-sans font-normal text-[#6B726F]">/kit</span>
            </span>
          </div>

          {/* Feature spec strip */}
          <div data-reveal style={delay(460)} className="mt-12 flex flex-wrap items-center gap-0 divide-x divide-[#EBE6DC]">
            {SPECS.map(([k, v]) => (
              <div key={k} className="px-6 first:pl-0 last:pr-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#6B726F]">{k}</p>
                <p className="mt-1.5 font-serif text-[15px] leading-snug text-[#1A2421]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
