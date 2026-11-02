import { delay } from '../lib/motion';

const STATS = [
  ['2,500+', 'Apartment Desks'],
  ['5,000+', 'Monthly Gardeners'],
  ['17M+', 'Seeds Harvested'],
];

export function About() {
  return (
    <section id="about" className="py-24 lg:py-36 bg-linen">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 text-center">
        <p data-reveal className="eyebrow justify-center">About</p>
        <h2 data-reveal style={delay(120)} className="display mt-8 text-[38px] text-espresso sm:text-[52px] lg:text-[60px] max-w-3xl mx-auto leading-[1.05]">
          6000+ Window Gardens<br />
          <em className="text-pine">Across Metros</em>
        </h2>

        {/* Stats row — pure floating typography, no borders or cards */}
        <div data-reveal style={delay(240)} className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-3 lg:mt-28">
          {STATS.map(([n, l], i) => (
            <div key={l} data-reveal style={delay(i * 130)} className="flex flex-col items-center gap-3">
              <span className="font-serif text-[72px] font-normal leading-none tracking-[-0.03em] text-espresso sm:text-[84px]">{n}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-umber">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
