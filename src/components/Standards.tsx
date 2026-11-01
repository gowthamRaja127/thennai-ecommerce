import { FlaskConical, MapPin, Recycle } from 'lucide-react';
import { delay } from '../lib/motion';

const CARDS = [
  {
    icon: MapPin,
    title: 'Direct from Muthur Mills',
    body: 'Single-origin coconut husk pith sourced directly from the Kangeyam–Erode cluster.',
    color: 'bg-[#EBF2EB]',
    iconColor: 'text-[#597E52]',
  },
  {
    icon: FlaskConical,
    title: 'Lab-Tested Low-EC (<0.5 mS/cm)',
    body: 'Triple freshwater-rinsed and calcium-buffered to eliminate root-burning sodium chloride.',
    color: 'bg-[#FBF0D0]',
    iconColor: 'text-[#E5A93C]',
  },
  {
    icon: Recycle,
    title: '100% Circular Packaging',
    body: 'Reusable rust-resistant alloy tins, unbleached kraft paper, and zero single-use plastic foam.',
    color: 'bg-[#FAE8E0]',
    iconColor: 'text-[#DE7A62]',
  },
];

// Press/partner logos — these are monochrome text logos as styled pill tiles
const PRESS = [
  'The Hindu', 'YourStory', 'Economic Times', 'Scroll.in',
  'India Today', 'Business Standard', 'Forbes India', 'Mint',
];

export function Standards() {
  return (
    <section id="standards" className="bg-[#FAF9F5] pt-4 pb-16 lg:pt-6 lg:pb-24">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">

        {/* Press logos */}
        <div className="text-center mb-14 lg:mb-18">
          <h2 data-reveal className="font-serif text-[30px] text-[#1A2421] sm:text-[40px]">
            Loved by Mindful Homes &amp; Press
          </h2>
          <div data-reveal style={delay(150)} className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
            {PRESS.map((name, i) => (
              <div
                key={name}
                data-reveal
                style={delay(i * 60)}
                className="flex items-center justify-center rounded-[20px] bg-white px-4 py-5 text-center shadow-[0_2px_12px_-4px_rgba(26,36,33,0.10)]"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B726F]">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Standards header */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-reveal className="eyebrow">The Erode Standard</p>
            <h2 data-reveal style={delay(100)} className="display mt-6 text-[40px] text-[#1A2421] sm:text-[52px]">
              Sourcing &amp; <em className="text-[#597E52]">science.</em>
            </h2>
          </div>
          <p data-reveal style={delay(200)} className="max-w-sm text-[15px] leading-[1.75] text-[#6B726F] lg:col-span-5 lg:justify-self-end">
            Cocopeat is only as good as how it's washed. Ours is rinsed until the salts are gone, then tested before it's packed.
          </p>
        </div>

        {/* Standard pill cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CARDS.map(({ icon: Icon, title, body, color, iconColor }, i) => (
            <div
              key={title}
              data-reveal
              style={delay(i * 120)}
              className={`group rounded-[32px] p-8 transition-transform duration-500 hover:-translate-y-1 sm:p-10 ${color}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-serif text-[15px] italic text-[#6B726F]">0{i + 1}</span>
                <Icon className={`size-6 transition-transform duration-500 group-hover:-translate-y-1 ${iconColor}`} strokeWidth={1.25} />
              </div>
              <h3 className="display mt-14 text-[24px] leading-[1.2] text-[#1A2421]">{title}</h3>
              <p className="mt-4 text-[14.5px] leading-[1.75] text-[#6B726F]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

