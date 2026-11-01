import { Mail, MapPin, Share2, AtSign } from 'lucide-react';
import { PaymentMarks } from './PaymentMarks';
import { Logomark } from './Header';

const LINKS = {
  Support: ['FAQ', 'Shipping Policy', 'Returns', 'Contact Us'],
  Philosophy: ['Our Roots', 'Low-EC Standard', 'Circular Packaging', 'Erode Mills'],
  Products: ['The Grow Tin', 'Living Soil Kit', 'Kitchen Trio', 'Coin Refill'],
  Connect: ['Instagram', 'Pinterest', 'Press Kit', 'Wholesale'],
};

const SOCIAL_ICONS = [Share2, AtSign];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1C2E25] text-[#FAF9F5]">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-12 pt-20 sm:px-8 md:grid-cols-2 lg:grid-cols-12 lg:pt-28">

        {/* Brand column */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Logomark className="size-7 text-[#EBF2EB]" />
            <span className="font-serif text-[26px] italic leading-none text-[#FAF9F5]">Thennai</span>
          </div>
          <p className="mt-5 max-w-[260px] text-[14px] leading-[1.75] text-[#FAF9F5]/60">
            Windowsill herb kits and triple-washed coconut pith coins from Erode, Tamil Nadu.
          </p>
          <p className="mt-5 flex items-center gap-2 text-[13px] text-[#FAF9F5]/45">
            <MapPin className="size-4 text-[#E5A93C]" /> Erode, Tamil Nadu, India
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-[#FAF9F5]/45">
            <Mail className="size-4 text-[#E5A93C]" /> hello@thennai.in
          </p>

          {/* Social buttons */}
          <div className="mt-8 flex gap-3">
            {SOCIAL_ICONS.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-[#FAF9F5]/15 text-[#FAF9F5]/60 transition hover:border-[#FAF9F5]/40 hover:text-[#FAF9F5]"
                aria-label="Social link"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([section, items]) => (
          <div key={section} className="lg:col-span-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#FAF9F5]/40">{section}</p>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              {items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#FAF9F5]/60 transition hover:text-[#FAF9F5]">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Giant watermark */}
      <p aria-hidden className="select-none px-3 text-center font-serif text-[27vw] italic leading-[0.8] tracking-[-0.05em] text-[#FAF9F5]/[0.04]">
        thennai
      </p>

      <div className="border-t border-[#FAF9F5]/10">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-5 py-6 text-[11.5px] text-[#FAF9F5]/40 sm:flex-row sm:px-8">
          <p>© 2026 Thennai. Handcrafted in Erode, Tamil Nadu.</p>
          <PaymentMarks dark />
        </div>
      </div>
    </footer>
  );
}
