import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScrollStory } from './components/ScrollStory';
import { Marquee } from './components/Marquee';
// import { About } from './components/About';
import { Catalog } from './components/Catalog';
import { Standards } from './components/Standards';
import { Testimonial } from './components/Testimonial';
import { Journal } from './components/Journal';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import type { SeedVariant } from './data/products';

export default function App() {
  const [tinVariant, setTinVariant] = useState<SeedVariant>('Sweet Italian Basil');

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <ScrollStory />
        {/* <About /> */}
        <Catalog tinVariant={tinVariant} onTinVariantChange={setTinVariant} />
        <Standards />
        <Testimonial />
        <Journal />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
