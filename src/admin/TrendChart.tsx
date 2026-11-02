import { useEffect, useMemo, useRef, useState } from 'react';

/*
 * Single-series daily trend (line + 10% area wash, or columns). One hue, one axis, no legend
 * (the card title names the series). Crosshair tooltip on hover/focus; a table view below.
 * Data hue validated with the dataviz palette checks: #A9542E passes lightness, chroma, contrast.
 */
export const DATA_HUE = '#A9542E';
const GRID = '#E4DCCF';
const INK_MUTED = '#7A6F64';

export interface Point {
  day: string; // YYYY-MM-DD
  value: number;
}

interface Props {
  points: Point[];
  kind: 'line' | 'columns';
  format: (n: number) => string;
  label: string;
  height?: number;
}

function niceMax(max: number) {
  if (max <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => (s * pow * 4) >= max)! * pow;
  return step * 4;
}

const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function TrendChart({ points, kind, format, label, height = 200 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { top: 12, right: 12, bottom: 26, left: 44 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = useMemo(() => niceMax(Math.max(...points.map((p) => p.value), 0)), [points]);
  const n = points.length;
  const x = (i: number) => (n <= 1 ? w / 2 : (i / (n - 1)) * w);
  const band = n > 0 ? w / n : w;
  const xBand = (i: number) => i * band + band / 2;
  const y = (v: number) => h - (v / max) * h;
  const ticks = [0, max / 2, max];

  const linePath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const areaPath = n ? `${linePath} L${x(n - 1)} ${h} L${x(0)} ${h} Z` : '';
  const xi = (i: number) => (kind === 'line' ? x(i) : xBand(i));
  const barW = Math.min(24, Math.max(2, band - 2));

  const pick = (clientX: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const px = clientX - rect.left - pad.left;
    const i = kind === 'line' ? Math.round((px / w) * (n - 1)) : Math.floor(px / band);
    setHover(n ? Math.max(0, Math.min(n - 1, i)) : null);
  };

  const hp = hover !== null ? points[hover] : null;
  const labelIdx = n > 2 ? [0, Math.floor((n - 1) / 2), n - 1] : points.map((_, i) => i);

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-kraft/60"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        tabIndex={0}
        role="img"
        aria-label={`${label}: ${n} days. Use the arrow keys to read values.`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
          if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1));
        }}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={height} className="block">
          <g transform={`translate(${pad.left} ${pad.top})`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={w} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                <text x={-10} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK_MUTED} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {format(t)}
                </text>
              </g>
            ))}
            {labelIdx.map((i) => (
              <text key={i} x={xi(i)} y={h + 18} textAnchor={i === 0 && kind === 'line' ? 'start' : i === n - 1 && kind === 'line' ? 'end' : 'middle'} fontSize={11} fill={INK_MUTED}>
                {dayLabel(points[i].day)}
              </text>
            ))}

            {kind === 'line' ? (
              <>
                <path d={areaPath} fill={DATA_HUE} opacity={0.1} />
                <path d={linePath} fill="none" stroke={DATA_HUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </>
            ) : (
              points.map((p, i) => {
                const bh = Math.max(0, h - y(p.value));
                const bx = xBand(i) - barW / 2;
                const r = Math.min(4, barW / 2, bh);
                // Rounded data-end, square at the baseline.
                const d = bh <= 0 ? '' : `M${bx} ${h} V${h - bh + r} Q${bx} ${h - bh} ${bx + r} ${h - bh} H${bx + barW - r} Q${bx + barW} ${h - bh} ${bx + barW} ${h - bh + r} V${h} Z`;
                return <path key={p.day} d={d} fill={DATA_HUE} opacity={hover === null || hover === i ? 1 : 0.55} />;
              })
            )}

            {hp && hover !== null && (
              <g pointerEvents="none">
                <line x1={xi(hover)} x2={xi(hover)} y1={0} y2={h} stroke={INK_MUTED} strokeWidth={1} opacity={0.5} />
                {kind === 'line' && <circle cx={xi(hover)} cy={y(hp.value)} r={4.5} fill={DATA_HUE} stroke="#F5F1EA" strokeWidth={2} />}
              </g>
            )}
          </g>
        </svg>

        {hp && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-[2px] border border-line bg-linen px-3 py-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
            style={{ left: Math.min(width - 150, Math.max(0, pad.left + xi(hover) + 10)) }}
          >
            <p className="text-[15px] font-medium text-espresso">{format(hp.value)}</p>
            <p className="text-[11px] text-umber">{dayLabel(hp.day)}</p>
          </div>
        )}
      </div>

      <details className="mt-3 text-[12px] text-umber">
        <summary className="cursor-pointer select-none uppercase tracking-[0.16em]">View as table</summary>
        <div className="mt-2 max-h-56 overflow-y-auto" data-lenis-prevent>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-1.5 font-medium">Day</th>
                <th className="py-1.5 text-right font-medium">{label}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.day} className="border-b border-line/60">
                  <td className="py-1">{dayLabel(p.day)}</td>
                  <td className="py-1 text-right tabular-nums text-espresso">{format(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
