import { Check, X } from 'lucide-react';
import { Photo } from './Photo';
import { delay } from '../lib/motion';

const OLD_WAY = [
  ['Heavy 5kg blocks', 'that need a hacksaw, a balcony and a strong back.'],
  ['Messy bathtub expansion', 'with buckets of brown water and clogged drains.'],
  ['Unwashed salts', 'burning tender roots before they can establish.'],
  ['Muddy balcony floors', 'and coir dust tracked through the living room.'],
  ['Dead seedlings after 2 weeks', 'and the guilt that comes with them.'],
];

const OUR_WAY = [
  ['Pocket-sized 50mm coins', 'or expand-in-bag kraft pouches. Lift with one hand.'],
  ['Certified Low-EC (<0.5 mS/cm)', 'triple-rinsed and buffered, so roots stay safe.'],
  ['Zero buckets or tubs', 'just hydrate in the tin or the bag it ships in.'],
  ['Living bio-booster nutrients', 'vermicompost and neem cake in every soil kit.'],
];

export function Comparison() {
  return (
    <section id="compare" className="bg-white py-24 lg:py-36">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-2">
          <div>
            <p data-reveal className="eyebrow">Rethinking the ritual</p>
            <h2 data-reveal style={delay(100)} className="display mt-6 text-[40px] text-espresso sm:text-[56px]">
              The old way vs.
              <br />
              <span className="italic text-pine">the thennai way</span>
            </h2>
          </div>
          <p data-reveal style={delay(200)} className="max-w-sm text-[15px] leading-[1.75] text-umber lg:justify-self-end">
            Pour water straight into the bag it shipped in. Wait. Fluff. Plant. The whole repotting job happens on your kitchen
            counter, without a single bucket.
          </p>
        </div>

        <figure data-reveal="mask" className="relative mt-14 overflow-hidden rounded-[4px]">
          <Photo
            name="expand-in-bag"
            alt="Three stages of the Expand-In-The-Bag kit: sealed pouch, water being poured to the 3.5L fill line, and fully expanded coir with bio-booster"
            className="aspect-[4/3] w-full object-cover sm:aspect-[21/9]"
          />
          <figcaption className="absolute bottom-0 left-0 m-3 flex flex-wrap gap-2 sm:m-5">
            {['1 · Unzip', '2 · Pour 3.5L', '3 · Fluff & feed'].map((s) => (
              <span key={s} className="rounded-full bg-white/85 px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-espresso backdrop-blur">
                {s}
              </span>
            ))}
          </figcaption>
        </figure>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div data-reveal className="rounded-[4px] border border-espresso/10 bg-linen p-8 sm:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-clay">The conventional way</p>
            <ul className="mt-8 space-y-5">
              {OLD_WAY.map(([title, body]) => (
                <li key={title} className="flex gap-3.5">
                  <X className="mt-0.5 size-4 shrink-0 text-clay" strokeWidth={2.5} />
                  <p className="text-[14px] leading-relaxed text-umber">
                    <strong className="font-semibold text-espresso">{title}</strong> {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={delay(120)} className="rounded-[4px] bg-forest p-8 text-linen sm:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft">The thennai way</p>
            <ul className="mt-8 space-y-5">
              {OUR_WAY.map(([title, body]) => (
                <li key={title} className="flex gap-3.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-kraft" strokeWidth={2.5} />
                  <p className="text-[14.5px] leading-[1.7] text-linen/65">
                    <strong className="font-semibold text-linen">{title}</strong> {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
