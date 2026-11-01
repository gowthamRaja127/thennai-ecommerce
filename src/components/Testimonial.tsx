import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const TESTIMONIALS = [
  {
    quote: "I always killed potted plants in my Bangalore flat because of salty soil. Thennai's expand-in-bag coir and basil tin sprouted in 4 days on my work desk with zero mud.",
    name: 'Priya Sundaram',
    title: 'Urban Plant Enthusiast, Bengaluru',
    avatar: 'PS',
    bg: 'bg-[#EBF2EB]',
  },
  {
    quote: "The Kitchen Trio was the perfect Diwali gift. My mom set it up on her Chennai balcony and had fresh coriander within two weeks. Absolutely zero fuss.",
    name: 'Arjun Krishnaswamy',
    title: 'Home Cook & Gifting Enthusiast, Chennai',
    avatar: 'AK',
    bg: 'bg-[#FBF0D0]',
  },
  {
    quote: "Ordered the Living Soil Kit for my monstera. Poured water directly into the bag, mixed in the bio-booster, and got 10 litres of the most beautiful fluffy coir I've ever seen.",
    name: 'Meera Iyer',
    title: 'Plant Parent, Mumbai',
    avatar: 'MI',
    bg: 'bg-[#FAE8E0]',
  },
];

export function Testimonial() {
  const [idx, setIdx] = useState(0);
  const t = TESTIMONIALS[idx];
  const prev = () => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIdx((i) => (i + 1) % TESTIMONIALS.length);

  return (
    <section className="bg-[#FAF9F5] py-24 lg:py-36">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">

          {/* Left: decorative pill frame */}
          <div data-reveal className="relative">
            <div className={`relative overflow-hidden rounded-[40px] ${t.bg} p-10 transition-colors duration-500`} style={{ minHeight: 360 }}>
              {/* Plus grid decoration */}
              <div aria-hidden className="absolute left-4 top-4 grid grid-cols-5 gap-3 opacity-30">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className="text-[12px] font-light text-[#597E52]">+</span>
                ))}
              </div>

              {/* Avatar circle breaking out of bottom */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-[0_16px_40px_-12px_rgba(26,36,33,0.25)] ring-4 ring-white">
                  <span className="font-serif text-2xl font-normal italic text-[#597E52]">{t.avatar}</span>
                </div>
              </div>

              {/* Decorative inner content */}
              <div className="flex h-full items-center justify-center py-8">
                <div className="text-center">
                  <div className="font-serif text-[80px] leading-none text-[#597E52]/20">"</div>
                  <p className="mt-2 max-w-[200px] font-serif text-[18px] italic leading-[1.5] text-[#1A2421]/60">
                    Urban windowsill gardening, simplified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: quote content */}
          <div data-reveal style={{ '--d': '150ms' } as React.CSSProperties}>
            {/* Oversized decorative quote mark */}
            <span aria-hidden className="font-serif text-[120px] leading-none text-[#DE7A62]/30">"</span>

            <blockquote className="-mt-8">
              <p className="font-serif text-[22px] leading-[1.65] text-[#1A2421] sm:text-[26px]">
                {t.quote}
              </p>
              <footer className="mt-8">
                <p className="text-[15px] font-semibold text-[#1A2421]">{t.name}</p>
                <p className="mt-1 text-[13px] text-[#6B726F]">{t.title}</p>
              </footer>
            </blockquote>

            {/* Pagination arrows */}
            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                className="flex size-12 items-center justify-center rounded-full border border-[#EBE6DC] text-[#6B726F] transition-all hover:border-[#1A2421] hover:text-[#1A2421]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="flex size-12 items-center justify-center rounded-full border border-[#EBE6DC] text-[#6B726F] transition-all hover:border-[#1A2421] hover:text-[#1A2421]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="ml-2 text-[11px] font-semibold tracking-[0.2em] text-[#6B726F]">
                {String(idx + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
