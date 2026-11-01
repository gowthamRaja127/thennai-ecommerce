import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { delay } from '../lib/motion';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (/^\S+@\S+\.\S+$/.test(email)) setJoined(true);
  };

  return (
    <section className="bg-[#FAF9F5] py-16 lg:py-20">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div data-reveal className="rounded-3xl bg-[#EDF3EC] px-8 py-14 text-center sm:px-16 lg:py-16">
          <p data-reveal className="eyebrow justify-center !text-[#597E52]">Weekly Harvest</p>
          <h2 data-reveal style={delay(120)} className="display mt-6 text-[32px] text-[#1A2421] sm:text-[44px]">
            Subscribe for the Weekly<br />
            <em className="text-[#597E52]">Harvest & Care Guides</em>
          </h2>
          <p data-reveal style={delay(220)} className="mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-[#6B726F]">
            A short monthly note on what grows on a city sill, plus early access to new seed drops.
          </p>

          {joined ? (
            <p className="mt-10 inline-flex items-center gap-2 text-[15px] text-[#597E52]">
              <Check className="size-4" /> You're in. See you next sowing season.
            </p>
          ) : (
            <form data-reveal style={delay(320)} onSubmit={join} className="mx-auto mt-10 flex max-w-md overflow-hidden rounded-full bg-white p-2 shadow-[0_4px_24px_-8px_rgba(89,126,82,0.15)]">
              <label htmlFor="newsletter" className="sr-only">Email address</label>
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-5 text-[14px] text-[#1A2421] placeholder:text-[#6B726F]/60 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#597E52] px-6 py-3 text-[12px] font-semibold text-white transition-all hover:bg-[#4B6F44] active:scale-[0.98]"
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
