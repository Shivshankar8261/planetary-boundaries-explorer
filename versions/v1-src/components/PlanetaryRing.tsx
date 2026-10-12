import { forwardRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wedge } from './Wedge';
import { BoundaryIcon } from './Icons';
import { GEOMETRY, isTransgressed, radiusFor, STATUS_LABEL, worstStatus } from '../lib/scale';
import { WEDGE, type Palette } from '../lib/palette';
import { currentDisplay, boundaryDisplay } from '../lib/format';
import type { Boundary, Evaluated, StatusFilter } from '../lib/types';

const { rCore, rBoundary, rUpper, rMax, rFade } = GEOMETRY;
const DEG = Math.PI / 180;
const SECTOR = 40;
const PAD = 1.2;
const GAP = 0.8;

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
  compact: boolean;
  reducedMotion: boolean;
  caption: string;
  onHover: (id: string | null, pos?: { x: number; y: number }) => void;
  onSelect: (boundaryId: string) => void;
}

function matchesFilter(filter: StatusFilter, status: Evaluated['status']) {
  if (filter === 'all') return true;
  if (filter === 'safe') return status === 'safe';
  return isTransgressed(status);
}

export const PlanetaryRing = forwardRef<SVGSVGElement, Props>(function PlanetaryRing(p, ref) {
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const rLabel = p.compact ? rFade + 26 : rFade + 40;
  const viewBox = p.compact ? '-420 -420 840 840' : '-660 -490 1320 1000';

  const layout = useMemo(
    () =>
      p.rows.map((row, i) => {
        const start = i * SECTOR - SECTOR / 2 + PAD;
        const end = (i + 1) * SECTOR - SECTOR / 2 - PAD;
        const k = row.ring.length;
        const w = (end - start - GAP * (k - 1)) / k;
        return {
          row,
          mid: (i * SECTOR) * DEG,
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
      viewBox={viewBox}
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
        <radialGradient id="grad-core" cx="0.35" cy="0.35" r="0.75">
          <stop offset={0} stopColor={p.palette.core[0]} />
          <stop offset={1} stopColor={p.palette.core[1]} />
        </radialGradient>
        <pattern id="pat-risk" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
        </pattern>
        <pattern id="pat-high" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
          <line x1="0" y1="0" x2="9" y2="0" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
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
      </defs>

      <rect x="-1000" y="-1000" width="2000" height="2000" fill={p.palette.bg} />

      {/* Zones */}
      <motion.g
        initial={{ opacity: p.reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        aria-hidden="true"
      >
        <circle r={rMax} fill="url(#grad-zones)" />
        {layout.map(({ mid }, i) => {
          const a = mid - (SECTOR / 2) * DEG;
          return (
            <line
              key={i}
              x1={Math.sin(a) * rCore}
              y1={-Math.cos(a) * rCore}
              x2={Math.sin(a) * rMax}
              y2={-Math.cos(a) * rMax}
              stroke={p.palette.bg}
              strokeWidth={2}
              opacity={0.6}
            />
          );
        })}
        <circle r={rUpper} fill="none" stroke={p.palette.muted} strokeWidth={1} strokeDasharray="2 4" opacity={0.7} />
      </motion.g>

      {/* Wedges */}
      <g>
        {layout.map(({ row, subs }) =>
          subs.map(({ ev, a0, a1 }) => {
            const id = ev.indicator.id;
            const isHovered = p.hoveredId === id;
            const filteredOut = !matchesFilter(p.filter, ev.status);
            const dimmed = filteredOut || (anyHover && !isHovered);
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
        opacity={0.85}
        pointerEvents="none"
      />

      {/* Earth core + year */}
      <g pointerEvents="none">
        <circle r={rCore} fill="url(#grad-core)" stroke={p.palette.bg} strokeWidth={3} />
        <ellipse rx={rCore} ry={rCore * 0.35} fill="none" stroke="#ffffff" strokeOpacity={0.18} />
        <ellipse rx={rCore * 0.35} ry={rCore} fill="none" stroke="#ffffff" strokeOpacity={0.18} />
        <text textAnchor="middle" dy="0.35em" fontSize={p.compact ? 22 : 20} fontWeight={700} fill="#ffffff">
          {p.year}{p.isScenario ? '*' : ''}
        </text>
      </g>

      {/* Labels with leader lines */}
      <g>
        {layout.map(({ row, mid, subs }) => {
          const sx = Math.sin(mid);
          const sy = -Math.cos(mid);
          const ix = sx * rLabel;
          const iy = sy * rLabel;
          const status = worstStatus(subs.map((s) => s.ev.status));
          const dim = anyHover && !subs.some((s) => s.ev.indicator.id === p.hoveredId);
          const side = ix > 20 ? 'start' : ix < -20 ? 'end' : 'middle';
          const tx = side === 'start' ? ix + 24 : side === 'end' ? ix - 24 : ix;
          const lines = row.boundary.labelLines;
          const lineH = 22;
          const blockH = lines.length * lineH + (row.boundary.sublabel ? 18 : 0);
          const ty = side === 'middle' ? iy - 26 - blockH + lineH * 0.8 : iy - blockH / 2 + lineH * 0.75;
          return (
            <g
              key={row.boundary.id}
              opacity={dim ? 0.35 : 1}
              style={{ transition: 'opacity .25s' }}
              className="cursor-pointer"
              onClick={() => p.onSelect(row.boundary.id)}
              aria-hidden="true"
            >
              <line
                x1={sx * (rFade + 4)}
                y1={sy * (rFade + 4)}
                x2={sx * (rLabel - 16)}
                y2={sy * (rLabel - 16)}
                stroke={p.palette.line}
                strokeWidth={1.2}
              />
              <circle
                cx={ix}
                cy={iy}
                r={15}
                fill={p.palette.bg}
                stroke={status === 'not-quantified' ? p.palette.nqStroke : isTransgressed(status) ? WEDGE.red : WEDGE.safe}
                strokeWidth={2}
              />
              <BoundaryIcon inline name={row.boundary.icon} size={18} x={ix} y={iy} color={p.palette.text} />
              {!p.compact && (
                <text x={tx} y={ty} textAnchor={side} fill={p.palette.text}>
                  {lines.map((l, k) => (
                    <tspan key={k} x={tx} dy={k === 0 ? 0 : lineH} fontSize={19} fontWeight={600}>
                      {l}
                    </tspan>
                  ))}
                  {row.boundary.sublabel && (
                    <tspan x={tx} dy={19} fontSize={15} fill={p.palette.muted}>
                      {row.boundary.sublabel}
                    </tspan>
                  )}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {!p.compact && (
        <text x={-640} y={490} fontSize={13} fill={p.palette.muted}>
          {p.caption}
        </text>
      )}
    </svg>
  );
});
