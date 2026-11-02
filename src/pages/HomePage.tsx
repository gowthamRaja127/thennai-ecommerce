import { useState } from 'react';
import { Hero } from '../components/Hero';
import { ScrollStory } from '../components/ScrollStory';
import { Marquee } from '../components/Marquee';
import { Catalog } from '../components/Catalog';
import { Standards } from '../components/Standards';
import { Testimonial } from '../components/Testimonial';
import { Journal } from '../components/Journal';
import { Newsletter } from '../components/Newsletter';
import { KintsugiSeam } from '../components/Motifs';
import type { SeedVariant } from '../data/products';

export function HomePage() {
  const [tinVariant, setTinVariant] = useState<SeedVariant>('Sweet Italian Basil');

  return (
    <>
      <Hero />
      <Marquee />
      <ScrollStory />
      <Catalog tinVariant={tinVariant} onTinVariantChange={setTinVariant} />
      <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8">
        <KintsugiSeam className="h-6 w-full" />
      </div>
      <Standards />
      <Testimonial />
      <Journal />
      <Newsletter />
    </>
  );
}
