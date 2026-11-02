import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { TornEdge } from '../components/Motifs';
import { scrollToId, scrollToTopNow } from '../lib/motion';
import { SproutLoader } from '../components/Ornaments';

/** Shared chrome for every storefront page, plus scroll handling for route and hash changes. */
export function StoreLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait for the target section to render before scrolling to it.
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const attempt = () => {
        if (scrollToId(id) || ++tries > 20) return;
        setTimeout(attempt, 50);
      };
      attempt();
    } else {
      scrollToTopNow();
    }
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main id="main">
        <Suspense fallback={<SproutLoader label="Turning the page…" className="min-h-[70svh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <TornEdge fill="var(--color-forest)" className="-mb-px" />
      <Footer />
      <CartDrawer />
    </>
  );
}
