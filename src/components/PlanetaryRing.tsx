import { forwardRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wedge } from './Wedge';
import { BoundaryIcon } from './Icons';
import { GEOMETRY, isTransgressed, radiusFor, STATUS_LABEL, worstStatus } from '../lib/scale';
import { STATUS_COLOR, WEDGE, type Palette } from '../lib/palette';
import { currentDisplay, boundaryDisplay } from '../lib/format';
import type { Boundary, Evaluated, StatusFilter } from '../lib/types';

const { rCore, rBoundary, rUpper, rMax, rFade } = GEOMETRY;
const DEG = Math.PI / 180;
const SECTOR = 40;
const PAD = 1.2;
const GAP = 0.8;

const R_RIM = rMax + 8;
const R_SUB = rMax + 24;
const R_NAME = rMax + 52;
const LINE_H = 20;
const CAP = 12;
const R_ICON = rMax + 104;

export interface RingRow {
  boundary: Boundary;
  ring: Evaluated[];
}

interface Props {
  rows: RingRow[];
  palette: Palette;
  year: number;
  isScenario: boolean;
  filter: StatusFilter;
  hoveredId: string | null;
  selectedId: string | null;
  /** Boundary ids to spotlight (guided tour); others are dimmed. */
  highlightIds: string[] | null;
  /** Comparison year values keyed by indicator id, drawn as dashed outlines. */
  compare: Map<string, Evaluated> | null;
  compareYear: number | null;
  compact: boolean;
  reducedMotion: boolean;
  tween: number;
  caption: string;
  onHover: (id: string | null, pos?: { x: number; y: number }) => void;
  onSelect: (boundaryId: string) => void;
}

function matchesFilter(filter: StatusFilter, status: Evaluated['status']) {
  if (filter === 'all') return true;
  if (filter === 'safe') return status === 'safe';
  return isTransgressed(status);
}

const pt = (r: number, a: number) => `${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`;

/** Arc for text: clockwise on the top half, counter-clockwise on the bottom so text stays upright. */
function textArc(r: number, a0: number, a1: number, flip: boolean) {
  return flip ? `M${pt(r, a1)}A${r},${r} 0 0 0 ${pt(r, a0)}` : `M${pt(r, a0)}A${r},${r} 0 0 1 ${pt(r, a1)}`;
}

export const PlanetaryRing = forwardRef<SVGSVGElement, Props>(function PlanetaryRing(p, ref) {
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const view = p.compact ? 400 : 470;

  const layout = useMemo(
    () =>
      p.rows.map((row, i) => {
        const start = i * SECTOR - SECTOR / 2 + PAD;
        const end = (i + 1) * SECTOR - SECTOR / 2 - PAD;
        const k = row.ring.length;
        const w = (end - start - GAP * (k - 1)) / k;
        return {
          row,
          mid: i * SECTOR * DEG,
          s0: start * DEG,
          s1: end * DEG,
          subs: row.ring.map((ev, j) => ({
            ev,
            a0: (start + j * (w + GAP)) * DEG,
            a1: (start + j * (w + GAP) + w) * DEG,
          })),
        };
      }),
    [p.rows],
  );

  const anyHover = p.hoveredId != null;
  let order = 0;

  return (
    <svg
      ref={ref}
      viewBox={`${-view} ${-view} ${view * 2} ${view * 2}`}
      className="h-full w-full select-none"
      role="group"
      aria-labelledby="ring-title ring-desc"
      fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
    >
      <title id="ring-title">Planetary boundaries diagram, {p.year}</title>
      <desc id="ring-desc">
        Nine wedges around a centre. The green circle is the safe operating space; the dashed line marks the boundary.
        Wedges reaching beyond it are transgressed. Use Tab to move between wedges and Enter to open details.
      </desc>

      <defs>
        <radialGradient id="grad-wedge" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={rMax}>
          <stop offset={0} stopColor={WEDGE.safe} />
          <stop offset={rBoundary / rMax} stopColor={WEDGE.safe} />
          <stop offset={rBoundary / rMax + 0.004} stopColor={WEDGE.yellow} />
          <stop offset={(rBoundary + rUpper) / 2 / rMax} stopColor={WEDGE.orange} />
          <stop offset={rUpper / rMax} stopColor={WEDGE.red} />
          <stop offset={0.85} stopColor={WEDGE.purple} />
          <stop offset={1} stopColor={WEDGE.deep} />
        </radialGradient>
        <radialGradient id="grad-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={rFade}>
          <stop offset={rMax / rFade} stopColor={WEDGE.deep} stopOpacity={1} />
          <stop offset={1} stopColor={WEDGE.deep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="grad-zones" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={rMax}>
          <stop offset={0} stopColor={p.palette.zoneSafe} />
          <stop offset={rBoundary / rMax} stopColor={p.palette.zoneSafe} />
          <stop offset={rBoundary / rMax + 0.004} stopColor={p.palette.zoneRisk[0]} />
          <stop offset={rUpper / rMax} stopColor={p.palette.zoneRisk[1]} />
          <stop offset={rUpper / rMax + 0.004} stopColor={p.palette.zoneHigh[0]} />
          <stop offset={1} stopColor={p.palette.zoneHigh[1]} />
        </radialGradient>
        <radialGradient id="grad-core" cx="0.35" cy="0.3" r="0.8">
          <stop offset={0} stopColor={p.palette.core[0]} />
          <stop offset={1} stopColor={p.palette.core[1]} />
        </radialGradient>
        <radialGradient id="grad-atmo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={rCore + 18}>
          <stop offset={rCore / (rCore + 18)} stopColor={p.palette.core[0]} stopOpacity={0.55} />
          <stop offset={1} stopColor={p.palette.core[0]} stopOpacity={0} />
        </radialGradient>
        <pattern id="pat-risk" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
        </pattern>
        <pattern id="pat-high" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="0" y1="0" x2="9" y2="0" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
        </pattern>
        <pattern id="pat-nq" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={p.palette.nqStroke} strokeWidth="2.2" />
        </pattern>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {!p.compact &&
          layout.map(({ row, mid, s0, s1, subs }) => {
            const flip = Math.cos(mid) < -0.2;
            const ext = 0.45;
            return (
              <g key={row.boundary.id}>
                {row.boundary.labelLines.map((_, k) => (
                  <path key={k} id={`lbl-${row.boundary.id}-${k}`} d={textArc(labelRadius(k, row.boundary.labelLines.length, flip), s0 - ext, s1 + ext, flip)} />
                ))}
                {subs.length > 1 &&
                  subs.map(({ ev, a0, a1 }) => (
                    <path key={ev.indicator.id} id={`sub-${ev.indicator.id}`} d={textArc(R_SUB + (flip ? CAP - 2 : 0), a0 - 0.2, a1 + 0.2, flip)} />
                  ))}
              </g>
            );
          })}
      </defs>

      {/* Transparent in the app (the page background shows through); made opaque on export. */}
      <rect data-export-bg x={-1000} y={-1000} width={2000} height={2000} fill={p.palette.bg} opacity={0} />

      {/* Zones */}
      <motion.g
        initial={{ opacity: p.reducedMotion ? 1 : 0, scale: p.reducedMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <circle r={rMax} fill="url(#grad-zones)" />
        {layout.map(({ s0 }, i) => {
          const a = s0 - PAD * DEG;
          return (
            <line
              key={i}
              x1={Math.sin(a) * rCore}
              y1={-Math.cos(a) * rCore}
              x2={Math.sin(a) * rMax}
              y2={-Math.cos(a) * rMax}
              stroke={p.palette.bg}
              strokeWidth={2}
              opacity={0.7}
            />
          );
        })}
        <circle r={rUpper} fill="none" stroke={p.palette.muted} strokeWidth={1} strokeDasharray="1 5" strokeLinecap="round" opacity={0.8} />
        {/* Fine tick ring */}
        <g stroke={p.palette.line} strokeWidth={1} opacity={0.55}>
          {Array.from({ length: 180 }, (_, i) => {
            const a = i * 2 * DEG;
            const len = i % 5 === 0 ? 6 : 3;
            return <line key={i} x1={Math.sin(a) * (rMax + 1)} y1={-Math.cos(a) * (rMax + 1)} x2={Math.sin(a) * (rMax + 1 + len)} y2={-Math.cos(a) * (rMax + 1 + len)} />;
          })}
        </g>
      </motion.g>

      {/* Wedges */}
      <g>
        {layout.map(({ row, subs }) =>
          subs.map(({ ev, a0, a1 }) => {
            const id = ev.indicator.id;
            const isHovered = p.hoveredId === id;
            const filteredOut = !matchesFilter(p.filter, ev.status);
            const outOfSpotlight = p.highlightIds != null && !p.highlightIds.includes(row.boundary.id);
            const dimmed = filteredOut || outOfSpotlight || (anyHover && !isHovered);
            const label =
              `${row.boundary.name}: ${ev.indicator.name}. ${currentDisplay(ev)} in ${p.year}` +
              `${ev.isScenario ? ' (scenario)' : ''}. Boundary ${boundaryDisplay(ev.indicator)}. ` +
              `Status: ${STATUS_LABEL[ev.status]}.`;
            return (
              <Wedge
                key={id}
                id={id}
                startAngle={a0}
                endAngle={a1}
                radius={radiusFor(ev.n ?? 0)}
                status={ev.status}
                offScale={ev.offScale}
                order={order++}
                intro={intro}
                tween={p.tween}
                reducedMotion={p.reducedMotion}
                hovered={isHovered}
                dimmed={dimmed}
                selected={p.selectedId === row.boundary.id}
                palette={p.palette}
                ariaLabel={label}
                onHover={p.onHover}
                onSelect={() => p.onSelect(row.boundary.id)}
              />
            );
          }),
        )}
      </g>

      {/* Boundary line drawn above wedges, like the original figure */}
      <circle
        r={rBoundary}
        fill="none"
        stroke={p.palette.boundary}
        strokeWidth={2}
        strokeDasharray="7 5"
        opacity={0.9}
        pointerEvents="none"
        className="boundary-flow"
      />

      {/* Comparison year: dashed outer edge of each wedge */}
      {p.compare && (
        <g pointerEvents="none" aria-hidden="true">
          {layout.flatMap(({ subs }) =>
            subs.map(({ ev, a0, a1 }) => {
              const c = p.compare!.get(ev.indicator.id);
              if (!c || c.n == null) return null;
              const r = Math.min(radiusFor(c.n), rMax + 2);
              return (
                <motion.path
                  key={ev.indicator.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  d={`M${pt(r, a0)}A${r},${r} 0 0 1 ${pt(r, a1)}`}
                  fill="none"
                  stroke={p.palette.text}
                  strokeWidth={3}
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                />
              );
            }),
          )}
        </g>
      )}

      {/* Earth core + year */}
      <g pointerEvents="none">
        <circle r={rCore + 18} fill="url(#grad-atmo)" />
        <circle r={rCore} fill="url(#grad-core)" stroke={p.palette.bg} strokeWidth={2} />
        <g stroke="#ffffff" strokeOpacity={0.16} fill="none">
          <ellipse rx={rCore} ry={rCore * 0.38} />
          <ellipse rx={rCore * 0.4} ry={rCore} />
          <line x1={-rCore} x2={rCore} />
        </g>
        <text textAnchor="middle" dy="0.36em" fontSize={p.compact ? 22 : 19} fontWeight={700} fill="#ffffff" letterSpacing="0.02em">
          {p.year}
          {p.isScenario ? '*' : ''}
        </text>
      </g>

      {/* Status rim, curved labels, icons */}
      <g>
        {layout.map(({ row, mid, s0, s1, subs }) => {
          const status = worstStatus(subs.map((s) => s.ev.status));
          const dim =
            (anyHover && !subs.some((s) => s.ev.indicator.id === p.hoveredId)) ||
            (p.highlightIds != null && !p.highlightIds.includes(row.boundary.id));
          const rIcon = p.compact ? rMax + 40 : R_ICON;
          const ix = Math.sin(mid) * rIcon;
          const iy = -Math.cos(mid) * rIcon;
          const subNames = row.boundary.sublabel?.split(' · ') ?? [];
          return (
            <g
              key={row.boundary.id}
              opacity={dim ? 0.35 : 1}
              style={{ transition: 'opacity .3s' }}
              className="cursor-pointer"
              onClick={() => p.onSelect(row.boundary.id)}
              aria-hidden="true"
            >
              <path
                d={`M${pt(R_RIM + 6, s0)}A${R_RIM + 6},${R_RIM + 6} 0 0 1 ${pt(R_RIM + 6, s1)}`}
                fill="none"
                stroke={STATUS_COLOR[status]}
                strokeWidth={4}
                strokeLinecap="round"
              />
              {!p.compact && (
                <>
                  {row.boundary.labelLines.map((line, k) => (
                    <text key={k} fill={p.palette.text} fontSize={15.5} fontWeight={600} letterSpacing="0.09em">
                      <textPath href={`#lbl-${row.boundary.id}-${k}`} startOffset="50%" textAnchor="middle">
                        {line.toUpperCase()}
                      </textPath>
                    </text>
                  ))}
                  {subs.length > 1 &&
                    subs.map(({ ev }, j) => (
                      <text key={ev.indicator.id} fill={p.palette.muted} fontSize={11.5} fontWeight={500} letterSpacing="0.06em">
                        <textPath href={`#sub-${ev.indicator.id}`} startOffset="50%" textAnchor="middle">
                          {(subNames[j] ?? ev.indicator.name).toUpperCase()}
                        </textPath>
                      </text>
                    ))}
                </>
              )}
              <circle cx={ix} cy={iy} r={p.compact ? 17 : 15} fill={p.palette.bg} stroke={STATUS_COLOR[status]} strokeWidth={1.8} />
              <BoundaryIcon inline name={row.boundary.icon} size={p.compact ? 19 : 17} x={ix} y={iy} color={p.palette.text} />
            </g>
          );
        })}
      </g>

      {!p.compact && (
        <g fontSize={11} fill={p.palette.muted}>
          <text x={-view + 14} y={view - 30}>{p.caption.split(' | ')[0]}</text>
          <text x={-view + 14} y={view - 14}>{p.caption.split(' | ')[1]}</text>
          {p.compareYear != null && (
            <g transform={`translate(${view - 14} ${view - 18})`}>
              <text textAnchor="end" x={-34}>Outline: {p.compareYear}</text>
              <line x1={-28} x2={0} y1={-4} y2={-4} stroke={p.palette.text} strokeWidth={3} strokeDasharray="5 3" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
});

/** Radius for line k of an n-line curved label; lines read top-to-bottom on both halves. */
function labelRadius(k: number, n: number, flip: boolean) {
  return flip ? R_NAME + CAP + k * LINE_H : R_NAME + (n - 1 - k) * LINE_H;
}
