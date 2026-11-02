import { useEffect, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { Photo } from './Photo';
import { delay } from '../lib/motion';

export function Hero() {
  const { format } = useCurrency();
  const [shift, setShift] = useState(0);

  // Slow parallax drift on the photograph.
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
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-24 pt-14 sm:px-10 lg:min-h-[calc(100svh-104px)] lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="lg:col-span-6">
          <p data-reveal className="eyebrow">Windowsill Herb Studio · Erode</p>

          <h1 data-reveal style={delay(100)} className="display mt-8 text-[44px] text-espresso sm:text-[58px] xl:text-[66px]">
            Urban Gardening.
            <br />
            <em className="font-normal text-kraft">Minus the Mud.</em>
          </h1>

          <p data-reveal style={delay(200)} className="mt-8 max-w-[26rem] text-[16px] leading-[1.85] text-umber sm:text-[17px]">
            Triple-washed coconut coir and seed kits from the Muthur mills of Erode. Add water, watch it rise, harvest on your sill.
          </p>

          <div data-reveal style={delay(300)} className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a href="#shop" className="btn btn-solid">
              Shop the collection
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#how-it-works"
              className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-espresso underline decoration-line decoration-1 underline-offset-[10px] transition hover:decoration-espresso"
            >
              How it works
            </a>
          </div>

          <p data-reveal style={delay(400)} className="mt-14 flex items-center gap-3 text-[13px] text-umber">
            <Star className="size-3.5 fill-ochre text-ochre" />
            <span>
              <span className="font-semibold text-espresso">4.9/5</span> from 5,000+ windowsill gardens
            </span>
          </p>
        </div>

        <figure className="lg:col-span-5 lg:col-start-8">
          <div data-reveal="mask" className="arch overflow-hidden bg-paper">
            <div style={{ transform: `translateY(${shift * 0.06}px) scale(1.06)` }} className="will-change-transform">
              <Photo
                name="grow-tin"
                priority
                alt="The Grow Tin by thennai, open with coir coins and a basil seed packet on a sunlit wooden table"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <figcaption data-reveal style={delay(500)} className="mt-5 flex items-baseline justify-between border-t border-line pt-4 text-[12px] text-umber">
            <span>
              <span className="font-serif italic text-espresso">No. 01</span> — The Grow Tin
            </span>
            <span>from {format(199)}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
