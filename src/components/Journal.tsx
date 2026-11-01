import { delay } from '../lib/motion';
import { ArrowRight } from 'lucide-react';
import { Photo } from './Photo';

const ARTICLES = [
  {
    bg: 'bg-[#F4F0E6]',
    arch: 'bg-[#EBF2EB]',
    tag: 'Care Guide',
    title: 'How to Grow Basil on a City Windowsill Without Soil',
    excerpt: 'Everything you need to know about growing fragrant Italian basil in a coir coin — from your kitchen counter.',
    image: 'grow-tin' as const,
  },
  {
    bg: 'bg-[#EAF0F4]',
    arch: 'bg-[#C3D3DB]/60',
    tag: 'Sprout Notes',
    title: 'The Science Behind Low-EC Coir and Why It Matters',
    excerpt: "High salinity is the silent killer of apartment herbs. Here's how triple-washed low-EC coir changes everything.",
    image: 'coco-peat-pouch' as const,
  },
];

export function Journal() {
  return (
    <section id="journal" className="bg-[#FAF9F5] py-24 lg:py-36">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
        <div className="mb-16 text-center lg:mb-20">
          <p data-reveal className="eyebrow justify-center">Our Journal</p>
          <h2 data-reveal style={delay(120)} className="display mt-6 text-[36px] text-[#1A2421] sm:text-[48px]">
            Sprout Notes &amp; <em className="text-[#597E52]">Care Guides</em>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {ARTICLES.map(({ bg, arch, tag, title, excerpt, image }, i) => (
            <article key={title} data-reveal style={delay(i * 160)} className={`group cursor-pointer rounded-[36px] ${bg} overflow-hidden transition-transform duration-500 hover:-translate-y-2`}>
              {/* Arched window visual area */}
              <div className={`relative mx-6 mt-6 overflow-hidden rounded-t-[999px] rounded-b-[20px] ${arch}`} style={{ height: 280 }}>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-[200px] overflow-hidden rounded-[20px] shadow-[0_24px_48px_-12px_rgba(26,36,33,0.20)] transition-transform duration-700 group-hover:scale-105">
                    <Photo name={image} alt={title} className="w-full object-cover aspect-square" />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="p-8 pt-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6B726F]">{tag}</span>
                <h3 className="display mt-3 text-[22px] leading-[1.25] text-[#1A2421] sm:text-[26px]">{title}</h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#6B726F]">{excerpt}</p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-semibold text-[#597E52] transition-all group-hover:gap-3">
                  Read Article <ArrowRight className="size-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
