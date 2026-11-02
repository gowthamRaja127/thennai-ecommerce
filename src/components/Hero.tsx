import { useEffect, useState } from 'react';
import { ArrowRight, Star, Leaf, Droplets } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { Photo } from './Photo';

export function Hero() {
  const { format } = useCurrency();
  const [shift, setShift] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

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

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#FAF9F5]"
      style={{ minHeight: 'calc(100svh - 104px)' }}
    >
      {/* Organic background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#597E52]/8 blur-[80px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[#E5A93C]/10 blur-[100px]"
      />

      <div className="mx-auto grid max-w-[1340px] items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-0 lg:py-0">

        {/* ── LEFT: product image ── */}
        <div
          className="relative flex items-center justify-center lg:justify-end lg:pr-12"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateX(0)' : 'translateX(-32px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Floating pill / arch frame */}
          <div className="relative">
            {/* Decorative soft ring */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[56px] border border-[#597E52]/15"
            />
            {/* Accent dot top-right */}
            <div
              aria-hidden
              className="absolute -right-3 -top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5A93C] shadow-lg"
            >
              <Leaf className="size-5 text-white" />
            </div>

            {/* Main image pill */}
            <div
              className="relative overflow-hidden rounded-[48px] bg-[#EEE9DF] shadow-[0_24px_80px_rgba(26,36,33,0.13)]"
              style={{ width: 420, maxWidth: '90vw' }}
            >
              <div
                style={{ transform: `translateY(${shift * 0.04}px) scale(1.04)` }}
                className="will-change-transform"
              >
                <Photo
                  name="coco-peat-pouch"
                  priority
                  alt="Thennai enriched coco peat pouch — zero-mess windowsill herb kit"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              {/* Floating badge inside image */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow backdrop-blur-sm">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#597E52]">
                  <Droplets className="size-4 text-white" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#597E52]">
                    Zero-Mess Kit
                  </p>
                  <p className="text-[12px] text-[#6B726F]">
                    Just add water — grows in 48 hrs
                  </p>
                </div>
              </div>
            </div>

            {/* Stats pill floating bottom-left */}
            <div
              className="absolute -bottom-8 -left-8 z-20 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B726F]">
                Yield
              </p>
              <p className="mt-0.5 font-serif text-[22px] font-bold italic text-[#1A2421]">
                10L
              </p>
              <p className="text-[11px] text-[#6B726F]">Huffy soil / disc</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: editorial copy ── */}
        <div
          className="flex flex-col justify-center lg:pl-14"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateX(0)' : 'translateX(32px)',
            transition: 'opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s',
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-[#597E52]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#597E52]">
              Zero Dirt · Windowsill Herb Studio
            </p>
          </div>

          {/* Headline */}
          <h1 className="display mt-6 text-[44px] leading-[1.1] text-[#1A2421] sm:text-[54px] xl:text-[64px]">
            The Windowsill{' '}
            <em className="block font-normal italic text-[#597E52]">Studio.</em>
          </h1>

          {/* Sub-copy */}
          <p className="mt-6 max-w-[28rem] text-[16px] leading-[1.85] text-[#6B726F]">
            Triple-washed low-EC coconut coir coins sourced from Erode's finest mills.
            Zero dirt, zero buckets — just drop, sow, and harvest fresh herbs from
            your apartment windowsill.
          </p>

          {/* Price + CTA */}
          <div
            className="mt-10 flex flex-wrap items-center gap-5"
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.9s ease 0.35s',
            }}
          >
            <a
              href="#shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#597E52] px-7 py-4 text-[13px] font-semibold uppercase tracking-widest text-white shadow-md transition hover:bg-[#4a6b45] hover:shadow-lg"
            >
              Shop Collection
              <ArrowRight className="size-4" />
            </a>

            <div className="flex items-baseline gap-1">
              <span className="font-serif text-[28px] font-bold text-[#1A2421]">
                {format(199)}
              </span>
              <span className="text-[13px] text-[#6B726F]">/kit</span>
            </div>
          </div>

          {/* Star rating */}
          <p
            className="mt-8 flex items-center gap-2 text-[13px] text-[#6B726F]"
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 1s ease 0.5s',
            }}
          >
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="size-3.5 fill-[#E5A93C] text-[#E5A93C]" />
            ))}
            <span className="ml-1">
              <span className="font-semibold text-[#1A2421]">4.9</span> from 5,000+
              windowsill gardens
            </span>
          </p>

          {/* 3-col spec strip */}
          <div
            className="mt-10 grid grid-cols-3 divide-x divide-[#1A2421]/10 border-t border-[#1A2421]/10 pt-6"
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 1s ease 0.6s',
            }}
          >
            {[
              { label: 'Substrate', value: '100% Coir' },
              { label: 'Varieties', value: '4 Herbs' },
              { label: 'Delivered In', value: '2–3 Days' },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 first:pl-0 last:pr-0">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6B726F]">
                  {label}
                </p>
                <p className="mt-1 font-serif text-[15px] font-semibold text-[#1A2421]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
