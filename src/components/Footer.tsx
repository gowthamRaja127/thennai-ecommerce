import { Mail, MapPin, Share2, AtSign } from 'lucide-react';
import { Link } from 'react-router';
import { PaymentMarks } from './PaymentMarks';
import { Logomark } from './Header';

const LINKS: Record<string, [label: string, to: string][]> = {
  Support: [['FAQ', '#'], ['Shipping Policy', '#'], ['Returns', '#'], ['Contact Us', 'mailto:hello@thennai.in']],
  Philosophy: [['Our Roots', '/#about'], ['Low-EC Standard', '/#standards'], ['How it works', '/#how-it-works'], ['Journal', '/#journal']],
  Shop: [['All products', '/shop'], ['The Grow Tin', '/shop/grow-tin'], ['Living Soil Kit', '/shop/living-soil-kit'], ['Kitchen Trio', '/shop/kitchen-trio'], ['Your cart', '/cart']],
  Connect: [['Instagram', '#'], ['Pinterest', '#'], ['Wholesale', 'mailto:hello@thennai.in?subject=Wholesale']],
};

const SOCIAL_ICONS = [Share2, AtSign];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest text-linen">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-12 pt-20 sm:px-8 md:grid-cols-2 lg:grid-cols-12 lg:pt-28">

        {/* Brand column */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Logomark className="size-7 text-sage" />
            <span className="font-serif text-[26px] italic leading-none text-linen">Thennai</span>
          </div>
          <p className="mt-5 max-w-[260px] text-[14px] leading-[1.75] text-linen/60">
            Windowsill herb kits and triple-washed coconut pith coins from Erode, Tamil Nadu.
          </p>
          <p className="mt-5 flex items-center gap-2 text-[13px] text-linen/45">
            <MapPin className="size-4 text-kraft" /> Erode, Tamil Nadu, India
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-linen/45">
            <Mail className="size-4 text-kraft" /> hello@thennai.in
          </p>

          {/* Social buttons */}
          <div className="mt-8 flex gap-3">
            {SOCIAL_ICONS.map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="flex size-10 items-center justify-center rounded-full border border-linen/15 text-linen/60 transition hover:border-linen/40 hover:text-linen"
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
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-linen/40">{section}</p>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              {items.map(([label, to]) => (
                <li key={label}>
                  {to.startsWith('/') ? (
                    <Link to={to} className="text-linen/60 transition hover:text-linen">{label}</Link>
                  ) : (
                    <a href={to} className="text-linen/60 transition hover:text-linen">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Giant watermark */}
      <p aria-hidden className="select-none px-3 text-center font-serif text-[27vw] italic leading-[0.8] tracking-[-0.05em] text-linen/[0.04]">
        thennai
      </p>

      <div className="border-t border-linen/10">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-5 py-6 text-[11.5px] text-linen/40 sm:flex-row sm:px-8">
          <p>© 2026 Thennai. Handcrafted in Erode, Tamil Nadu.</p>
          <PaymentMarks dark />
        </div>
      </div>
    </footer>
  );
}
