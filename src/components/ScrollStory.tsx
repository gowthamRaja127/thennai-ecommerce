import { useEffect, useRef, useState } from 'react';
import { scrollToY } from '../lib/motion';

/*
 * Scroll-driven product story. The section is several viewports tall; its inner
 * stage is sticky, and scroll progress (0 → 1) through the section scrubs the ritual
 * film: lid opens → water pours → coir expands 7× → seeds are sown → basil grows.
 * The film is encoded with every frame as a keyframe so seeking stays smooth.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const CHAPTERS = [
  { at: 0, end: 0.6, kicker: 'Step 1', short: 'Hydrate', title: 'Drop & Hydrate', body: 'Place 1 dry coin in the tin. Pour 5 tablespoons of tap water and watch it expand 7× into airy substrate.' },
  { at: 0.6, end: 0.78, kicker: 'Step 2', short: 'Sow', title: 'Sow & Tuck', body: 'Sprinkle 3–4 seeds into the airy, root-safe coir substrate and gently cover.' },
  { at: 0.78, end: 1.01, kicker: 'Step 3', short: 'Harvest', title: 'Harvest on Your Sill', body: 'Place under indirect natural light. Sprouting occurs in 4–6 days with zero water leakage.' },
];

function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(total > 0 ? clamp(-r.top / total) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, p] as const;
}

// The first stretch of scroll opens the framed film out to full-bleed; the rest scrubs it.
const OPEN_END = 0.12;

export function ScrollStory() {
  const [ref, p] = useSectionProgress<HTMLElement>();
  const open = ease(seg(p, 0, OPEN_END)); // 0 = framed on linen, 1 = full-bleed
  const film = seg(p, OPEN_END, 1); // film progress, drives video and chapters
  const chapter = CHAPTERS.findIndex((c) => film >= c.at && film < c.end);
  const active = chapter === -1 ? CHAPTERS.length - 1 : chapter;
  const intro = 1 - seg(p, OPEN_END * 0.55, OPEN_END); // title card fades as the frame opens
  const overlay = seg(p, OPEN_END * 0.8, OPEN_END + 0.03); // chapter copy fades in once full-bleed

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    scrollToY(top + total * (OPEN_END + (1 - OPEN_END) * (CHAPTERS[i].at + 0.02)));
  };

  // Framed state: inset below the header with a small margin; opens to the full viewport.
  const k = 1 - open;
  const clip = `inset(calc(${k} * (104px + 5vh)) calc(${k} * 7vw) calc(${k} * 6vh) calc(${k} * 7vw) round ${k * 6}px)`;

  return (
    <section ref={ref} id="how-it-works" className="relative h-[520vh] bg-linen" aria-label="How it works: from tin to harvest">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: clip }}>
          <div className="absolute inset-0" style={{ transform: `scale(${1.06 - open * 0.06})` }}>
            <ScrubVideo progress={film} />
          </div>

          {/* Scrims: a soft floor for the copy, and a gentle wash over the intro card */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1d1a16]/80 via-[#1d1a16]/15 to-transparent" style={{ opacity: overlay }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#1d1a16]/35" style={{ opacity: intro }} />

          {/* Intro title card */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-linen" style={{ opacity: intro }}>
            <p className="text-[11px] font-medium uppercase tracking-[0.36em] text-linen/80">The ritual · 3 steps</p>
            <h2 className="display mt-6 text-[52px] sm:text-[76px] lg:text-[96px]">
              From tin to <em className="text-[#E9D3B4]">harvest.</em>
            </h2>
            <p className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-linen/70">
              <span className="h-8 w-px animate-pulse bg-linen/60" />
              Scroll to begin
            </p>
          </div>

          {/* Day counter, top right below the header */}
          <div
            className="absolute right-6 top-[128px] text-right text-linen sm:right-10"
            style={{ opacity: overlay }}
            aria-hidden
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-linen/70">Day</p>
            <p className="display mt-1 text-[44px] tabular-nums sm:text-[56px]">
              {String(film < 0.78 ? 0 : Math.max(1, Math.round(seg(film, 0.78, 1) * 21))).padStart(2, '0')}
            </p>
            {film > 0.48 && film < 0.62 && (
              <p className="hand mt-1 text-[20px] text-[#E9D3B4]">{(1 + 6 * ease(seg(film, 0.48, 0.6))).toFixed(1)}× volume</p>
            )}
          </div>

          {/* Chapter copy + index */}
          <div className="absolute inset-x-0 bottom-0 text-linen" style={{ opacity: overlay }}>
            <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-6 pb-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:pb-14">
              <div className="relative h-[200px] w-full max-w-xl sm:h-[210px]" aria-live="polite">
                {CHAPTERS.map((c, i) => (
                  <div
                    key={c.title}
                    aria-hidden={i !== active}
                    className={`absolute inset-x-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
                      i === active ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-5 opacity-0' : 'translate-y-5 opacity-0'
                    }`}
                  >
                    <p className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.32em] text-linen/75">
                      <span className="font-serif text-[18px] normal-case italic tracking-normal text-[#E9D3B4]">0{i + 1}</span>
                      <span className="h-px w-8 bg-linen/40" />
                      {c.kicker}
                    </p>
                    <h3 className="display mt-4 text-[40px] sm:text-[56px]">{c.title}</h3>
                    <p className="mt-4 max-w-md text-[15px] leading-[1.75] text-linen/80 sm:text-[16px]">{c.body}</p>
                  </div>
                ))}
              </div>

              <ol className="flex w-full gap-6 lg:w-auto lg:flex-col lg:gap-4">
                {CHAPTERS.map((c, i) => (
                  <li key={c.title} className="flex-1 lg:w-56">
                    <button type="button" onClick={() => jump(i)} className="group block w-full text-left" aria-label={`Go to ${c.title}`}>
                      <span className="flex items-baseline justify-between gap-4">
                        <span className={`text-[10.5px] font-medium uppercase tracking-[0.28em] transition-colors ${i === active ? 'text-linen' : 'text-linen/45 group-hover:text-linen/80'}`}>
                          {c.short}
                        </span>
                        <span className="hidden font-serif text-[14px] italic text-linen/50 lg:inline">0{i + 1}</span>
                      </span>
                      <span className="mt-2.5 block h-px bg-linen/25">
                        <span className="block h-full bg-linen" style={{ width: `${seg(film, c.at, Math.min(1, c.end)) * 100}%` }} />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FILM = '/video/grow-ritual.mp4';

/**
 * Seeks the ritual film to match scroll progress. The file is fetched up front and
 * played from a blob URL so every seek is served from memory, and currentTime eases
 * toward its target so fast scrolls still read as motion rather than jumps.
 */
function ScrubVideo({ progress }: { progress: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const [src, setSrc] = useState(FILM);

  useEffect(() => {
    let url = '';
    let cancelled = false;
    fetch(FILM)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setSrc(url);
      })
      .catch(() => {
        /* fall back to streaming the file directly */
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v && v.duration) target.current = progress * (v.duration - 0.05);
  }, [progress]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.readyState >= 1 && !v.seeking) {
        const diff = target.current - v.currentTime;
        if (Math.abs(diff) > 1 / 48) v.currentTime = v.currentTime + diff * 0.25;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster="/video/grow-ritual-poster.jpg"
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      onLoadedMetadata={(e) => {
        target.current = progress * (e.currentTarget.duration - 0.05);
      }}
      className="absolute inset-0 size-full origin-top scale-[1.08] object-cover"
      aria-label="Film of the Grow Tin being opened, watered, sown and growing basil"
    />
  );
}
