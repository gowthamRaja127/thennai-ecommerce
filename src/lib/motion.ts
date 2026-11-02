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

  // Chrome folds a target's own clip-path into its intersection, so an element masked to
  // nothing (`data-reveal="mask"`) never reports as visible. Watch its parent instead.
  const proxyFor = new Map<Element, Element[]>();
  const watched = new WeakSet<Element>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (proxyFor.get(e.target) ?? [e.target]).forEach((el) => el.classList.add('is-in'));
          proxyFor.delete(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  const observe = (root: ParentNode) =>
    root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
      if (watched.has(el)) return;
      watched.add(el);
      const target = el.getAttribute('data-reveal') === 'mask' && el.parentElement ? el.parentElement : el;
      if (target !== el) proxyFor.set(target, [...(proxyFor.get(target) ?? []), el]);
      io.observe(target);
    });
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
