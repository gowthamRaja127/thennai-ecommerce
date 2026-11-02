import type { SVGProps } from 'react';

/*
 * Hand-drawn ornaments for the Bohemian × Wabi-Sabi language.
 * Strokes are deliberately uneven; nothing here is perfectly symmetrical.
 */

/** Boho block-print sun: a soft disc with uneven rays. */
export function SunMotif(props: SVGProps<SVGSVGElement>) {
  const rays = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden {...props}>
      <circle cx="60" cy="60" r="21" fill="currentColor" opacity="0.9" />
      <circle cx="60" cy="60" r="29" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.6" />
      {rays.map((_, i) => {
        const a = (i / rays.length) * Math.PI * 2;
        const long = i % 2 === 0;
        const r1 = 36 + (i % 3);
        const r2 = long ? 56 - (i % 4) : 46 + (i % 3);
        return (
          <path
            key={i}
            d={`M${60 + Math.cos(a) * r1} ${60 + Math.sin(a) * r1} L${60 + Math.cos(a) * r2} ${60 + Math.sin(a) * r2}`}
            stroke="currentColor"
            strokeWidth={long ? 2.2 : 1.4}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** Layered boho rainbow arcs in earth tones. */
export function RainbowArcs({ className = '' }: { className?: string }) {
  const bands = ['#B9653D', '#C69A42', '#E9CBB4', '#5E6A45'];
  return (
    <svg viewBox="0 0 240 130" className={className} aria-hidden>
      {bands.map((c, i) => {
        const r = 112 - i * 22;
        return <path key={c} d={`M${120 - r} 126 A${r} ${r - 2} 0 0 1 ${120 + r} 126`} fill="none" stroke={c} strokeWidth={17} strokeLinecap="round" />;
      })}
    </svg>
  );
}

/** Kintsugi: a gold seam mending a crack, used as a section divider. */
export function KintsugiSeam({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M0 22 L140 20 L190 26 L260 14 L330 19 L410 17 L455 27 L520 21 L610 22 L660 12 L700 20 L790 18 L860 25 L930 15 L990 21 L1060 19 L1120 24 L1200 20"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M455 27 L470 36 M660 12 L672 4 M930 15 L944 6" stroke="var(--color-gold)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Rough, torn-paper edge. Fill it with the colour of the section it leads into. */
export function TornEdge({ className = '', flip = false, fill = 'currentColor' }: { className?: string; flip?: boolean; fill?: string }) {
  return (
    <svg
      viewBox="0 0 1440 34"
      preserveAspectRatio="none"
      className={`block h-[18px] w-full sm:h-[26px] ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden
    >
      <path
        d="M0 34 L0 18 L38 21 L71 14 L118 19 L162 11 L201 17 L247 13 L290 20 L338 12 L380 18 L426 9 L470 16 L512 14 L561 21 L604 12 L650 17 L697 10 L742 18 L786 13 L833 20 L878 11 L925 16 L968 12 L1014 19 L1060 10 L1105 17 L1150 13 L1196 20 L1240 11 L1287 18 L1330 12 L1378 17 L1410 13 L1440 16 L1440 34 Z"
        fill={fill}
      />
    </svg>
  );
}

/** A loose ink line-drawing of a coconut frond. */
export function FrondSketch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 200" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden {...props}>
      <path d="M78 196 C80 150 74 110 86 64 C92 42 104 26 120 12" strokeWidth="1.6" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const y = 150 - i * 15;
        const x = 79 + i * 4.2;
        return (
          <g key={i} strokeWidth="1.1">
            <path d={`M${x} ${y} C${x - 18} ${y - 4} ${x - 34} ${y + 6} ${x - 46 + i * 3} ${y + 18 - i}`} />
            <path d={`M${x} ${y} C${x + 16} ${y - 10} ${x + 30} ${y - 6} ${x + 42 - i * 3} ${y + 6 - i}`} />
          </g>
        );
      })}
    </svg>
  );
}

/** Wobbly hand-drawn underline. */
export function Scribble({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 18" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M3 12 C40 5 70 15 110 9 C150 3 180 13 217 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 15 C70 10 120 16 190 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Curved hand-drawn arrow for annotations. */
export function HandArrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden>
      <path d="M6 8 C30 6 52 18 64 46" />
      <path d="M54 40 L65 48 L70 34" />
    </svg>
  );
}
