import { useEffect, useRef, useState } from 'react';
import { Plant, WoodenMarker } from './Illustrations';
import { scrollToY } from '../lib/motion';

/*
 * Scroll-driven product story. The section is several viewports tall; its inner
 * stage is sticky, and scroll progress (0 → 1) through the section drives every
 * part of the SVG scene: lid opens → coin drops → water pours → coir expands 7× →
 * seeds are sown → basil grows.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CHAPTERS = [
  { at: 0, end: 0.44, kicker: 'Step 1', short: 'Hydrate', title: 'Drop & Hydrate', body: 'Place 1 dry coin in the tin. Pour 5 tablespoons of tap water and watch it expand 7× into airy substrate.' },
  { at: 0.44, end: 0.74, kicker: 'Step 2', short: 'Sow', title: 'Sow & Tuck', body: 'Sprinkle 3–4 seeds into the airy, root-safe coir substrate and gently cover.' },
  { at: 0.74, end: 1.01, kicker: 'Step 3', short: 'Harvest', title: 'Harvest on Your Sill', body: 'Place under indirect natural light. Sprouting occurs in 4–6 days with zero water leakage.' },
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

export function ScrollStory() {
  const [ref, p] = useSectionProgress<HTMLElement>();
  const chapter = CHAPTERS.findIndex((c) => p >= c.at && p < c.end);
  const active = chapter === -1 ? CHAPTERS.length - 1 : chapter;

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    scrollToY(top + total * (CHAPTERS[i].at + 0.02));
  };

  return (
    <section ref={ref} id="how-it-works" className="relative h-[460vh] bg-forest text-linen" aria-label="How it works: from tin to harvest">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-[104px]">
        {/* Soft light pooling behind the scene */}
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[10%] size-[60vw] max-w-[820px] rounded-full bg-[#3E5E4C] opacity-40 blur-[120px]" />

        <div className="relative mx-auto grid w-full max-w-[1360px] flex-1 grid-rows-[minmax(0,1fr)_auto] gap-5 px-5 pb-6 sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pb-10">
          {/* Narrative */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <p className="eyebrow hidden !text-kraft lg:inline-flex">The ritual</p>
            <h2 className="display mt-5 hidden text-[52px] text-linen lg:block">
              From tin to <em className="text-kraft">harvest.</em>
            </h2>

            <div className="relative h-[150px] sm:h-[170px] lg:mt-14 lg:h-[250px]" aria-live="polite">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.title}
                  className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
                    i === active ? 'translate-y-0 opacity-100' : i < active ? 'pointer-events-none -translate-y-6 opacity-0' : 'pointer-events-none translate-y-6 opacity-0'
                  }`}
                  aria-hidden={i !== active}
                >
                  <div className="flex items-end gap-4">
                    <span className="font-serif text-[52px] italic leading-[0.8] text-kraft lg:text-[104px]">0{i + 1}</span>
                    <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-linen/45 lg:pb-3">{c.kicker}</span>
                  </div>
                  <h3 className="display mt-3 text-[28px] text-linen lg:mt-5 lg:text-[40px]">{c.title}</h3>
                  <p className="mt-2 max-w-md text-[14px] leading-[1.7] text-linen/65 lg:mt-4 lg:text-[16px]">{c.body}</p>
                </div>
              ))}
            </div>

            <ol className="mt-4 grid grid-cols-3 gap-2.5 lg:mt-12 lg:gap-4">
              {CHAPTERS.map((c, i) => (
                <li key={c.title}>
                  <button type="button" onClick={() => jump(i)} className="group block w-full text-left" aria-label={`Go to ${c.title}`}>
                    <span className="block h-[2px] overflow-hidden rounded-full bg-linen/12">
                      <span className="block h-full bg-kraft" style={{ width: `${seg(p, c.at, Math.min(1, c.end)) * 100}%` }} />
                    </span>
                    <span className={`mt-3 hidden text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors sm:block ${i === active ? 'text-linen' : 'text-linen/35 group-hover:text-linen/70'}`}>
                      {c.short}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-6 hidden items-center gap-3 text-[11px] tracking-[0.2em] text-linen/40 lg:flex">
              <span className="font-serif text-[15px] italic tracking-normal text-linen/80">0{active + 1}</span>/ 03
              <span className="h-px w-10 bg-linen/20" />
              {p < 0.02 ? 'Scroll to begin' : p > 0.97 ? 'Ready to grow' : 'Keep scrolling'}
            </p>
          </div>

          {/* Scene */}
          <div className="relative order-1 min-h-0 lg:order-2 lg:col-span-7">
            <div className="relative mx-auto aspect-[10/11] h-full max-h-[76svh] max-w-full overflow-hidden rounded-[6px] bg-gradient-to-b from-[#FBF4E8] to-[#EFE2CB] shadow-[0_60px_120px_-50px_rgba(0,0,0,0.7)] lg:h-auto lg:w-full lg:max-w-[600px]">
              <StoryScene p={p} />
              <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-pine backdrop-blur">
                {p < 0.74 ? 'Day 0' : `Day ${Math.max(1, Math.round(seg(p, 0.74, 1) * 21))}`}
              </div>
              {p > 0.44 && p < 0.66 && (
                <div className="absolute right-4 top-4 rounded-full bg-forest px-3.5 py-1.5 font-serif text-sm italic text-linen">
                  {(1 + 6 * ease(seg(p, 0.44, 0.62))).toFixed(1)}× volume
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const RIM_Y = 250;
const RX = 78;
const RY = 19;
const TIN_H = 128;
const CX = 200;

function StoryScene({ p }: { p: number }) {
  const lidT = ease(seg(p, 0.02, 0.13));
  const coinT = seg(p, 0.15, 0.26);
  const jugIn = ease(seg(p, 0.26, 0.31));
  const streamT = seg(p, 0.3, 0.42);
  const jugOut = ease(seg(p, 0.42, 0.47));
  const expT = ease(seg(p, 0.44, 0.62));
  const packT = seg(p, 0.6, 0.74);
  const growT = seg(p, 0.74, 0.98);

  // Lid: lifts, swings right and comes to rest leaning against the tin.
  const lidX = lerp(CX, 330, lidT);
  const lidY = lerp(RIM_Y - 5, 330, lidT) - Math.sin(lidT * Math.PI) * 90;
  const lidRot = lerp(0, 68, lidT);

  // Coin: hops from the table into the tin on a parabola.
  const coinX = lerp(150, CX, coinT);
  const coinY = lerp(398, RIM_Y + 34, coinT) - Math.sin(coinT * Math.PI) * 170;

  // Substrate level inside the tin (0 = empty, 1 = flush with rim) and mound above the rim.
  const level = coinT >= 1 ? 0.15 + 0.85 * expT : 0;
  const mound = Math.max(0, expT - 0.6) / 0.4 * 16;
  const soilY = RIM_Y + 34 * (1 - level);
  const waterAmt = streamT * (1 - expT);

  // Jug: slides in, tilts to pour, then leaves.
  const jugX = lerp(430, 292, jugIn) + jugOut * 160;
  const jugY = 150;
  const jugRot = -48 * ease(seg(p, 0.29, 0.33)) * (1 - jugOut);
  const spout = rotatePoint(-34, -26, jugRot);
  const spoutX = jugX + spout.x;
  const spoutY = jugY + spout.y;
  const pouring = streamT > 0 && streamT < 1 && jugOut === 0;

  // Seed packet tilts over the tin; seeds fall onto the mound.
  const packVisible = packT > 0 && packT < 1;
  const packRot = -70 * ease(seg(packT, 0, 0.35)) * (1 - ease(seg(packT, 0.8, 1)));
  const soilTop = RIM_Y - mound * 0.9;

  const glow = growT;

  return (
    <svg viewBox="0 0 400 440" className="absolute inset-0 size-full" role="img" aria-label="Animated illustration of the Grow Tin being opened, hydrated, sown and growing basil">
      <defs>
        <linearGradient id="st-body" x1="0" x2="1">
          <stop offset="0" stopColor="#9C9D97" />
          <stop offset="0.25" stopColor="#D2D2CC" />
          <stop offset="0.5" stopColor="#E6E5E0" />
          <stop offset="0.8" stopColor="#B5B5AE" />
          <stop offset="1" stopColor="#8F908A" />
        </linearGradient>
        <linearGradient id="st-label" x1="0" x2="1">
          <stop offset="0" stopColor="#E4DDCF" />
          <stop offset="0.5" stopColor="#F5F0E6" />
          <stop offset="1" stopColor="#DDD5C6" />
        </linearGradient>
        <radialGradient id="st-sun" cx="0.85" cy="0.1" r="0.8">
          <stop offset="0" stopColor="#FFE6A8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="st-open">
          <ellipse cx={CX} cy={RIM_Y} rx={RX - 3} ry={RY - 2.5} />
        </clipPath>
      </defs>

      <rect width="400" height="440" fill="url(#st-sun)" opacity={0.25 + glow * 0.75} />

      {/* Table */}
      <rect x="0" y="384" width="400" height="56" fill="#B98154" />
      <rect x="0" y="384" width="400" height="3" fill="#D3A275" />
      <path d="M0 404 Q120 400 220 406 T400 402" stroke="#8A5733" strokeOpacity="0.3" fill="none" />
      <ellipse cx={CX} cy={RIM_Y + TIN_H + 4} rx={RX + 10} ry={RY - 4} fill="#000" opacity="0.13" />

      {/* Tin interior */}
      <ellipse cx={CX} cy={RIM_Y} rx={RX} ry={RY} fill="#CFCFC9" />
      <ellipse cx={CX} cy={RIM_Y} rx={RX - 3} ry={RY - 2.5} fill="#3A3833" />
      <g clipPath="url(#st-open)">
        {level > 0 && (
          <>
            <rect x={CX - RX} y={soilY} width={RX * 2} height={60} fill="#4A3122" />
            <ellipse cx={CX} cy={soilY} rx={RX - 3} ry={RY - 3} fill={waterAmt > 0.05 ? '#3E2A1D' : '#6B4A33'} />
          </>
        )}
        {waterAmt > 0 && <ellipse cx={CX} cy={soilY - 1} rx={(RX - 8) * Math.min(1, waterAmt * 1.5)} ry={(RY - 6) * Math.min(1, waterAmt * 1.5)} fill="#8EC3DE" opacity={0.55} />}
      </g>

      {/* Coin in flight (drawn before the body so the tin wall hides it as it drops in) */}
      {coinT < 1 && (
        <g transform={`translate(${coinX} ${coinY}) rotate(${coinT * 200})`}>
          <path d="M-24 0 L-24 7 A24 8 0 0 0 24 7 L24 0 Z" fill="#5A3B26" />
          <ellipse cx={0} cy={0} rx={24} ry={8} fill="#7A5236" />
        </g>
      )}

      {/* Tin body */}
      <path d={`M${CX - RX} ${RIM_Y} A${RX} ${RY} 0 0 0 ${CX + RX} ${RIM_Y} L${CX + RX} ${RIM_Y + TIN_H} A${RX} ${RY} 0 0 1 ${CX - RX} ${RIM_Y + TIN_H} Z`} fill="url(#st-body)" />
      <path d={`M${CX - RX} ${RIM_Y + 26} A${RX} ${RY} 0 0 0 ${CX + RX} ${RIM_Y + 26} L${CX + RX} ${RIM_Y + 104} A${RX} ${RY} 0 0 1 ${CX - RX} ${RIM_Y + 104} Z`} fill="url(#st-label)" />
      <g fontFamily="Playfair Display, serif" textAnchor="middle">
        <text x={CX} y={RIM_Y + 56} fontSize={7} letterSpacing={2.5} fill="#2E4A3E" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700}>
          THENNAI
        </text>
        <text x={CX} y={RIM_Y + 76} fontSize={15} fill="#20221E" fontWeight={600} letterSpacing={1}>
          THE GROW TIN
        </text>
        <text x={CX} y={RIM_Y + 89} fontSize={6} fill="#5A5D54" fontFamily="Plus Jakarta Sans, sans-serif">
          Ready-to-Grow Micro Indoor Kit
        </text>
      </g>
      <ellipse cx={CX} cy={RIM_Y} rx={RX} ry={RY} fill="none" stroke="#E9E9E4" strokeWidth={2} />

      {/* Expanded coir mound above the rim */}
      {mound > 0 && (
        <g>
          <path d={`M${CX - RX + 4} ${RIM_Y} Q${CX} ${RIM_Y - mound * 2.2} ${CX + RX - 4} ${RIM_Y} A${RX - 4} ${RY - 3} 0 0 1 ${CX - RX + 4} ${RIM_Y} Z`} fill="#6B4A33" />
          {Array.from({ length: 22 }).map((_, i) => (
            <circle key={i} cx={CX + Math.sin(i * 2.1) * (RX - 16)} cy={RIM_Y - Math.abs(Math.cos(i * 1.3)) * mound * 0.9 + (i % 3)} r={1.1} fill="#946B4C" />
          ))}
        </g>
      )}
      {/* Fibres flung out as it expands */}
      {expT > 0 && expT < 1 &&
        Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI - Math.PI;
          const d = 30 + expT * 60;
          return <circle key={i} cx={CX + Math.cos(a) * d} cy={RIM_Y - 6 + Math.sin(a) * d * 0.5} r={1.4} fill="#8A6648" opacity={1 - expT} />;
        })}

      {/* Seeds */}
      {packT > 0.3 &&
        [-14, -4, 6, 15].map((dx, i) => {
          const t = seg(packT, 0.35 + i * 0.08, 0.6 + i * 0.08);
          if (t <= 0 || growT > 0.15) return null;
          return <ellipse key={i} cx={CX + dx * t + 24 * (1 - t)} cy={lerp(150, soilTop - 2, t * t)} rx={2.4} ry={1.6} fill="#2B1E14" />;
        })}

      {/* Growth: sprout first, then basil takes over */}
      {growT > 0 && (
        <g transform={`translate(${CX} ${soilTop})`}>
          <g opacity={1 - seg(growT, 0.35, 0.5)}>
            <Plant kind="sprout" scale={ease(seg(growT, 0, 0.3))} />
          </g>
          {growT > 0.3 && <Plant kind="basil" scale={1.45 * ease(seg(growT, 0.3, 1))} />}
        </g>
      )}
      {growT > 0.6 && (
        <g opacity={seg(growT, 0.6, 0.75)}>
          <WoodenMarker x={CX + 46} y={RIM_Y - 22} rot={8} label="Basil" />
        </g>
      )}

      {/* Lid */}
      <g transform={`translate(${lidX} ${lidY}) rotate(${lidRot})`}>
        <path d={`M${-RX - 2} 0 L${-RX - 2} 11 A${RX + 2} ${RY} 0 0 0 ${RX + 2} 11 L${RX + 2} 0 Z`} fill="#A9AAA4" />
        <ellipse cx={0} cy={0} rx={RX + 2} ry={RY + 1} fill="#C9C9C3" />
        <ellipse cx={0} cy={0} rx={RX - 10} ry={RY - 5} fill="none" stroke="#B3B3AD" strokeWidth={2} />
      </g>

      {/* Remaining coins on the table */}
      <g transform="translate(70 396)">
        <path d="M-20 0 L-20 6 A20 7 0 0 0 20 6 L20 0 Z" fill="#5A3B26" />
        <ellipse cx={0} cy={0} rx={20} ry={7} fill="#7A5236" />
      </g>
      <g transform="translate(112 404) rotate(6)">
        <path d="M-20 0 L-20 6 A20 7 0 0 0 20 6 L20 0 Z" fill="#5A3B26" />
        <ellipse cx={0} cy={0} rx={20} ry={7} fill="#7A5236" />
      </g>

      {/* Water jug + stream */}
      {pouring && (
        <path
          d={`M${spoutX} ${spoutY} Q${spoutX - 22} ${spoutY + 20} ${CX + 6} ${soilY - 2}`}
          stroke="#8EC3DE"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
          strokeDasharray="6 5"
          className="[animation:flow_0.5s_linear_infinite]"
        />
      )}
      {jugIn > 0 && jugOut < 1 && (
        <g transform={`translate(${jugX} ${jugY}) rotate(${jugRot})`}>
          <path d="M-30 -30 L28 -30 L32 40 Q0 48 -32 40 Z" fill="#E7F1F5" fillOpacity={0.75} stroke="#B9CDD6" strokeWidth={1.5} />
          <path d="M-30 -30 L-38 -24 L-30 -18" fill="#E7F1F5" stroke="#B9CDD6" strokeWidth={1.5} />
          <path d={`M-29 ${lerp(0, 18, streamT)} L29 ${lerp(0, 18, streamT)} L31 39 Q0 46 -31 39 Z`} fill="#9CCBE3" opacity={0.7} />
          <path d="M30 -18 C52 -16 52 22 32 24" fill="none" stroke="#B9CDD6" strokeWidth={4} />
          <text x={0} y={-36} textAnchor="middle" fontSize={8} fill="#5A5D54" fontFamily="Plus Jakarta Sans, sans-serif">
            5 tbsp
          </text>
        </g>
      )}

      {/* Seed packet */}
      {packVisible && (
        <g transform={`translate(${lerp(-40, 236, ease(seg(packT, 0, 0.2))) - ease(seg(packT, 0.85, 1)) * 280} 118) rotate(${packRot})`}>
          <rect x={-22} y={-30} width={44} height={60} rx={2} fill="#D7B48A" />
          <rect x={-16} y={-14} width={32} height={26} rx={1} fill="#F3EBDD" />
          <text x={0} y={2} textAnchor="middle" fontSize={5.5} fill="#3B2A1A" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700}>
            BASIL
          </text>
          <text x={0} y={9} textAnchor="middle" fontSize={4} fill="#5C4630" fontFamily="Plus Jakarta Sans, sans-serif">
            SEEDS
          </text>
        </g>
      )}
      <style>{`@keyframes flow { to { stroke-dashoffset: -22 } }`}</style>
    </svg>
  );
}

function rotatePoint(x: number, y: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
}

