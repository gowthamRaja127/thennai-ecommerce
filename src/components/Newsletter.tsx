import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { delay } from '../lib/motion';
import { FrondSketch, SunMotif } from './Motifs';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (/^\S+@\S+\.\S+$/.test(email)) setJoined(true);
  };

  return (
    <section className="bg-linen py-16 lg:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div data-reveal className="wabi relative overflow-hidden bg-sage px-8 py-16 text-center sm:px-16 lg:py-20">
          <SunMotif className="pointer-events-none absolute -right-10 -top-10 size-48 animate-spin-slow text-ochre/40" />
          <FrondSketch className="pointer-events-none absolute -bottom-6 left-4 hidden h-48 text-pine/25 sm:block" />
          <p data-reveal className="eyebrow justify-center !text-pine">Weekly Harvest</p>
          <h2 data-reveal style={delay(120)} className="display mt-6 text-[32px] text-espresso sm:text-[44px]">
            Subscribe for the Weekly<br />
            <em className="text-pine">Harvest & Care Guides</em>
          </h2>
          <p data-reveal style={delay(220)} className="mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-umber">
            A short monthly note on what grows on a city sill, plus early access to new seed drops.
          </p>

          {joined ? (
            <p className="mt-10 inline-flex items-center gap-2 text-[15px] text-pine">
              <Check className="size-4" /> You're in. See you next sowing season.
            </p>
          ) : (
            <form data-reveal style={delay(320)} onSubmit={join} className="relative mx-auto mt-10 flex max-w-md overflow-hidden rounded-[2px] border border-line bg-linen p-1.5 shadow-[0_4px_24px_-8px_rgba(89,126,82,0.15)]">
              <label htmlFor="newsletter" className="sr-only">Email address</label>
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-5 text-[14px] text-espresso placeholder:text-umber/60 focus:outline-none"
              />
              <button
                type="submit"
                className="btn btn-solid shrink-0 !px-6 !py-3"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
