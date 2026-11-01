import type { CSSProperties } from 'react';
import Lenis from 'lenis';

let lenis: Lenis | null = null;

/** Smooth inertial scrolling plus reveal-on-scroll for any element marked `data-reveal`. */
export function initMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  if (!reduce) {
    lenis = new Lenis({ lerp: 0.09, anchors: { offset: -100 } });
    const raf = (t: number) => {
      lenis?.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  const observe = (root: ParentNode) => root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
  observe(document);
  new MutationObserver(() => observe(document)).observe(document.body, { childList: true, subtree: true });

  if (reduce) document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: 'auto' });
}

export function setScrollLocked(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Stagger helper for `data-reveal` elements: `style={delay(120)}`. */
export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
