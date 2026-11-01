import { useId, type SVGProps } from 'react';

export type PlantKind = 'basil' | 'thyme' | 'tomato' | 'coriander' | 'mint' | 'sprout';

export function plantForVariant(variant: string): PlantKind {
  const v = variant.toLowerCase();
  if (v.includes('thyme')) return 'thyme';
  if (v.includes('tomato')) return 'tomato';
  if (v.includes('coriander')) return 'coriander';
  if (v.includes('mint')) return 'mint';
  return 'basil';
}

interface LeafProps {
  x: number;
  y: number;
  rot: number;
  len: number;
  w: number;
  fill: string;
  vein?: boolean;
}

function Leaf({ x, y, rot, len, w, fill, vein = true }: LeafProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0 C${len * 0.25} ${-w} ${len * 0.75} ${-w} ${len} 0 C${len * 0.75} ${w} ${len * 0.25} ${w} 0 0Z`}
        fill={fill}
      />
      {vein && <path d={`M1 0 L${len * 0.85} 0`} stroke="#ffffff" strokeOpacity={0.22} strokeWidth={0.8} />}
    </g>
  );
}

const G = { dark: '#2F5A3C', mid: '#3F7A4D', light: '#5E9B63', pale: '#7DB57A' };

/** Plant drawn with origin at the soil surface centre, growing upward. `scale` 1 ≈ 90px tall. */
export function Plant({ kind, scale = 1 }: { kind: PlantKind; scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
    <g className="origin-bottom animate-sway" style={{ transformBox: 'fill-box' }}>
      {kind === 'basil' && (
        <>
          <path d="M0 0 C-1 -30 1 -55 0 -78" stroke={G.dark} strokeWidth={2.4} fill="none" />
          <path d="M0 -20 C-12 -30 -20 -40 -26 -52" stroke={G.dark} strokeWidth={1.8} fill="none" />
          <path d="M0 -26 C12 -36 20 -46 24 -60" stroke={G.dark} strokeWidth={1.8} fill="none" />
          <Leaf x={0} y={-12} rot={200} len={26} w={11} fill={G.mid} />
          <Leaf x={0} y={-12} rot={-20} len={26} w={11} fill={G.light} />
          <Leaf x={-26} y={-52} rot={210} len={22} w={10} fill={G.light} />
          <Leaf x={-26} y={-52} rot={-60} len={20} w={9} fill={G.mid} />
          <Leaf x={24} y={-60} rot={-30} len={22} w={10} fill={G.mid} />
          <Leaf x={24} y={-60} rot={230} len={20} w={9} fill={G.pale} />
          <Leaf x={0} y={-50} rot={190} len={20} w={9} fill={G.dark} />
          <Leaf x={0} y={-50} rot={-10} len={20} w={9} fill={G.mid} />
          <Leaf x={0} y={-78} rot={-120} len={18} w={8} fill={G.pale} />
          <Leaf x={0} y={-78} rot={-60} len={18} w={8} fill={G.light} />
        </>
      )}
      {kind === 'mint' && (
        <>
          {[-14, 2, 16].map((sx, i) => (
            <g key={sx}>
              <path d={`M${sx} 0 C${sx} -25 ${sx + (i - 1) * 6} -50 ${sx + (i - 1) * 8} -${66 + i * 6}`} stroke={G.dark} strokeWidth={1.8} fill="none" />
              {[18, 38, 56].map((h, j) => (
                <g key={h}>
                  <Leaf x={sx + (i - 1) * (h / 10)} y={-h - i * 3} rot={200 - j * 10} len={15 - j * 2} w={8 - j} fill={j % 2 ? G.pale : G.light} />
                  <Leaf x={sx + (i - 1) * (h / 10)} y={-h - i * 3} rot={-20 + j * 10} len={15 - j * 2} w={8 - j} fill={j % 2 ? G.light : G.pale} />
                </g>
              ))}
            </g>
          ))}
        </>
      )}
      {kind === 'thyme' && (
        <>
          {[-22, -12, -3, 6, 15, 24].map((sx, i) => {
            const top = -50 - (i % 3) * 12;
            const tipX = sx + (sx / 3);
            return (
              <g key={sx}>
                <path d={`M${sx / 3} 0 Q${sx / 2} ${top / 2} ${tipX} ${top}`} stroke="#5B5A3E" strokeWidth={1.1} fill="none" />
                {Array.from({ length: 7 }).map((_, k) => {
                  const t = (k + 1) / 8;
                  const px = sx / 3 + (tipX - sx / 3) * t;
                  const py = top * t;
                  return (
                    <g key={k}>
                      <Leaf x={px} y={py} rot={-150} len={6} w={2.4} fill={k % 2 ? '#5F8A5A' : '#6E9A68'} vein={false} />
                      <Leaf x={px} y={py} rot={-30} len={6} w={2.4} fill={k % 2 ? '#6E9A68' : '#5F8A5A'} vein={false} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </>
      )}
      {kind === 'tomato' && (
        <>
          <path d="M0 0 C2 -30 -2 -60 2 -92" stroke="#3D6B3E" strokeWidth={2.6} fill="none" />
          <path d="M1 -40 C14 -46 24 -52 30 -62" stroke="#3D6B3E" strokeWidth={1.6} fill="none" />
          <path d="M0 -58 C-12 -62 -22 -70 -28 -80" stroke="#3D6B3E" strokeWidth={1.6} fill="none" />
          {[
            [0, -16, 205], [0, -16, -25], [30, -62, -40], [30, -62, 10], [-28, -80, 200], [-28, -80, 250],
            [2, -92, -70], [2, -92, -110], [0, -70, -10], [0, -30, 195],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <Leaf x={x} y={y} rot={r} len={18} w={6} fill={i % 2 ? G.mid : G.dark} />
              <Leaf x={x} y={y} rot={r + 28} len={11} w={4} fill={G.light} vein={false} />
            </g>
          ))}
          <path d="M14 -46 L16 -36 M16 -36 L12 -30 M16 -36 L20 -28 M16 -36 L22 -36" stroke="#3D6B3E" strokeWidth={1} />
          <circle cx={12} cy={-27} r={5.5} fill="#D9452F" />
          <circle cx={21} cy={-25} r={5} fill="#E65B3A" />
          <circle cx={22} cy={-35} r={4.5} fill="#F08A3C" />
          <circle cx={10.5} cy={-28.5} r={1.4} fill="#fff" opacity={0.5} />
        </>
      )}
      {kind === 'coriander' && (
        <>
          {[-20, -10, -2, 8, 18].map((sx, i) => {
            const top = -44 - (i % 2) * 16;
            const tx = sx * 1.3;
            return (
              <g key={sx}>
                <path d={`M${sx / 4} 0 Q${sx / 2} ${top / 2} ${tx} ${top}`} stroke="#4E8A4A" strokeWidth={1.1} fill="none" />
                {[-40, 0, 40].map((r) => (
                  <g key={r} transform={`translate(${tx} ${top}) rotate(${r - 90})`}>
                    <path d="M0 0 C3 -3 9 -6 12 -2 C14 1 12 5 9 5 C11 8 6 10 3 7 C2 5 1 3 0 0Z" fill={r === 0 ? '#6BAA5E' : '#5A9A50'} />
                  </g>
                ))}
              </g>
            );
          })}
        </>
      )}
      {kind === 'sprout' && (
        <>
          <path d="M0 0 C0 -10 0 -18 0 -26" stroke={G.mid} strokeWidth={2} fill="none" />
          <Leaf x={0} y={-26} rot={200} len={14} w={6} fill={G.light} />
          <Leaf x={0} y={-26} rot={-20} len={14} w={6} fill={G.pale} />
        </>
      )}
    </g>
    </g>
  );
}

/** Matte circular alloy tin, rendered in its own coordinate box centred at x=0. Rim sits at y=0. */
export function TinShape({ label = 'THE GROW TIN', sub, width = 120, height = 92 }: { label?: string; sub?: string; width?: number; height?: number }) {
  const rx = width / 2;
  const ry = width * 0.14;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const bodyId = `tin-body-${uid}`;
  const soilId = `tin-soil-${uid}`;
  return (
    <g>
      <defs>
        <linearGradient id={bodyId} x1="0" x2="1">
          <stop offset="0" stopColor="#9C9D97" />
          <stop offset="0.25" stopColor="#CFCFC9" />
          <stop offset="0.5" stopColor="#E2E1DC" />
          <stop offset="0.8" stopColor="#B5B5AE" />
          <stop offset="1" stopColor="#8F908A" />
        </linearGradient>
        <radialGradient id={soilId} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#6B4A33" />
          <stop offset="1" stopColor="#3F2A1C" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={height + 4} rx={rx * 1.05} ry={ry * 0.9} fill="#000" opacity={0.14} />
      <path d={`M${-rx} 0 L${-rx} ${height} A${rx} ${ry} 0 0 0 ${rx} ${height} L${rx} 0 Z`} fill={`url(#${bodyId})`} />
      <rect x={-rx} y={height * 0.3} width={width} height={height * 0.44} fill="#EDE3D1" />
      <rect x={-rx} y={height * 0.3} width={width} height={1} fill="#C88A58" opacity={0.7} />
      <rect x={-rx} y={height * 0.74 - 1} width={width} height={1} fill="#C88A58" opacity={0.7} />
      {width >= 100 && (
        <text x={0} y={height * 0.3 + 13} textAnchor="middle" fontSize={6} letterSpacing={2} fill="#C88A58" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700}>
          THENNAI
        </text>
      )}
      <text x={0} y={height * 0.3 + (width >= 100 ? 26 : 17)} textAnchor="middle" fontSize={10} letterSpacing={1.2} fill="#20221E" fontFamily="Playfair Display, serif" fontWeight={600}>
        {label}
      </text>
      {sub && (
        <text x={0} y={height * 0.3 + 36} textAnchor="middle" fontSize={5.5} fill="#5A5D54" fontFamily="Plus Jakarta Sans, sans-serif">
          {sub}
        </text>
      )}
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#D8D8D2" />
      <ellipse cx={0} cy={0.5} rx={rx - 3} ry={ry - 2.2} fill={`url(#${soilId})`} />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={Math.sin(i * 2.3) * (rx - 10)} cy={Math.cos(i * 1.7) * (ry - 5)} r={0.9} fill="#8A6648" opacity={0.7} />
      ))}
    </g>
  );
}

export function Coin({ x, y, rot = 0, scale = 1 }: { x: number; y: number; rot?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <ellipse cx={0} cy={9} rx={25} ry={8} fill="#000" opacity={0.12} />
      <path d="M-24 0 L-24 7 A24 8 0 0 0 24 7 L24 0 Z" fill="#5A3B26" />
      <ellipse cx={0} cy={0} rx={24} ry={8} fill="#7A5236" />
      <ellipse cx={0} cy={0} rx={18} ry={5.6} fill="none" stroke="#5A3B26" strokeWidth={0.7} opacity={0.6} />
      {[[-10, -2], [6, 2], [12, -3], [-3, 3], [-15, 1]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.9} fill="#A57A55" />
      ))}
    </g>
  );
}

export function SeedPacket({ x, y, rot = 0, label = 'Sweet Italian Basil' }: { x: number; y: number; rot?: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-2} y={4} width={62} height={84} rx={3} fill="#000" opacity={0.1} />
      <rect x={-4} y={0} width={62} height={84} rx={3} fill="#D7B48A" />
      <path d="M-4 10 L58 10" stroke="#B48C60" strokeDasharray="2 2" />
      <rect x={4} y={20} width={46} height={40} rx={2} fill="#F3EBDD" />
      <g transform="translate(27 52)">
        <Plant kind={plantForVariant(label)} scale={0.32} />
      </g>
      <text x={27} y={70} textAnchor="middle" fontSize={5} fill="#3B2A1A" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700} letterSpacing={0.6}>
        {label.toUpperCase().slice(0, 22)}
      </text>
      <text x={27} y={78} textAnchor="middle" fontSize={4} fill="#5C4630" fontFamily="Plus Jakarta Sans, sans-serif">
        SEEDS • ERODE
      </text>
    </g>
  );
}

export function WoodenMarker({ x, y, rot = 0, label }: { x: number; y: number; rot?: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-3 0 L3 0 L3 30 L0 36 L-3 30 Z" fill="#C79A6B" />
      <rect x={-15} y={-14} width={30} height={14} rx={2} fill="#D9B184" />
      <text x={0} y={-4.5} textAnchor="middle" fontSize={5.5} fill="#4A3320" fontFamily="Playfair Display, serif" fontStyle="italic">
        {label}
      </text>
    </g>
  );
}

/** Compact product shot: a single tin with plant. */
export function GrowTinArt({ variant, ...props }: { variant: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-110 -120 220 230" role="img" aria-label={`Grow Tin with ${variant}`} {...props}>
      <g transform="translate(0 -6)">
        <g transform="translate(0 4)">
          <Plant kind={plantForVariant(variant)} scale={1.05} />
        </g>
        <TinShape sub={variant} />
      </g>
      <Coin x={-80} y={92} rot={-6} scale={0.6} />
      <Coin x={78} y={94} rot={8} scale={0.6} />
    </svg>
  );
}

export function TrioArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-170 -120 340 230" role="img" aria-label="Kitchen Trio: Basil, Cherry Tomato and Mint tins in a kraft gift sleeve" {...props}>
      <rect x={-160} y={30} width={320} height={70} rx={8} fill="#D3AE80" />
      <rect x={-160} y={30} width={320} height={6} fill="#B98F5E" />
      <text x={0} y={78} textAnchor="middle" fontSize={11} letterSpacing={4} fill="#5C4126" fontFamily="Playfair Display, serif" fontWeight={600}>
        THE KITCHEN TRIO
      </text>
      <text x={0} y={90} textAnchor="middle" fontSize={5.5} letterSpacing={2.5} fill="#7A5A3A" fontFamily="Plus Jakarta Sans, sans-serif">
        HANDCRAFTED IN ERODE
      </text>
      {([['basil', -100, 'BASIL'], ['tomato', 0, 'TOMATO'], ['mint', 100, 'MINT']] as const).map(([kind, x, label]) => (
        <g key={kind} transform={`translate(${x} -16)`}>
          <g transform="translate(0 2)">
            <Plant kind={kind} scale={0.82} />
          </g>
          <TinShape label={label} width={84} height={62} />
        </g>
      ))}
    </svg>
  );
}

export function SoilPouchArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-120 -120 240 240" role="img" aria-label="Expand-in-the-bag kraft gusset pouch" {...props}>
      <ellipse cx={0} cy={104} rx={82} ry={10} fill="#000" opacity={0.12} />
      <path d="M-66 -96 L66 -96 L72 92 Q0 108 -72 92 Z" fill="#CFA676" />
      <path d="M-66 -96 L66 -96 L68 -78 L-68 -78 Z" fill="#B88D5C" />
      <path d="M-62 -70 L62 -70" stroke="#8E6A42" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M-62 -66 L62 -66" stroke="#8E6A42" strokeWidth={0.6} strokeDasharray="3 2" />
      <path d="M50 -96 L72 92" stroke="#B88D5C" strokeWidth={1} opacity={0.6} />
      <path d="M-50 -96 L-72 92" stroke="#B88D5C" strokeWidth={1} opacity={0.6} />
      <rect x={-44} y={-44} width={88} height={102} rx={4} fill="#F4ECDF" />
      <text x={0} y={-30} textAnchor="middle" fontSize={5} letterSpacing={0.8} fill="#C88A58" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight={700}>
        THENNAI
      </text>
      <text x={0} y={-15} textAnchor="middle" fontSize={11} fill="#20221E" fontFamily="Playfair Display, serif" fontWeight={600}>
        Expand
      </text>
      <text x={0} y={-3} textAnchor="middle" fontSize={11} fill="#20221E" fontFamily="Playfair Display, serif" fontStyle="italic">
        in the Bag
      </text>
      <line x1={-18} x2={18} y1={5} y2={5} stroke="#C88A58" />
      <text x={0} y={18} textAnchor="middle" fontSize={5.5} fill="#5A5D54" fontFamily="Plus Jakarta Sans, sans-serif">
        LIVING SOIL • 650g
      </text>
      <text x={0} y={27} textAnchor="middle" fontSize={5.5} fill="#5A5D54" fontFamily="Plus Jakarta Sans, sans-serif">
        + 3.5L WATER = 10L SOIL
      </text>
      <g transform="translate(0 48)">
        <Plant kind="sprout" scale={0.7} />
      </g>
      <path d="M-28 48 Q0 42 28 48" stroke="#7A5236" strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function CoinRefillArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-40 -24 80 48" role="img" aria-label="Three coir coins" {...props}>
      <Coin x={-12} y={6} rot={-4} scale={0.55} />
      <Coin x={12} y={8} rot={6} scale={0.55} />
      <Coin x={0} y={-4} scale={0.55} />
    </svg>
  );
}
