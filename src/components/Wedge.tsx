import { useEffect, useMemo } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { arc } from 'd3-shape';
import { GEOMETRY } from '../lib/scale';
import type { Status } from '../lib/types';
import type { Palette } from '../lib/palette';

const { rCore, rBoundary, rUpper, rMax, rFade } = GEOMETRY;
const arcGen = arc<{ innerRadius: number; outerRadius: number; startAngle: number; endAngle: number }>().cornerRadius(1.5);

const path = (r0: number, r1: number, a0: number, a1: number) =>
  r1 <= r0 + 0.01 ? 'M0,0' : arcGen({ innerRadius: r0, outerRadius: r1, startAngle: a0, endAngle: a1 }) ?? 'M0,0';

export interface WedgeProps {
  id: string;
  startAngle: number;
  endAngle: number;
  /** Target outer radius in SVG units. */
  radius: number;
  status: Status;
  offScale: boolean;
  order: number;
  /** Tween duration (s) for value changes after the intro. */
  tween?: number;
  intro: boolean;
  reducedMotion: boolean;
  hovered: boolean;
  dimmed: boolean;
  selected: boolean;
  palette: Palette;
  ariaLabel: string;
  onHover: (id: string | null, pos?: { x: number; y: number }) => void;
  onSelect: () => void;
}

export function Wedge(p: WedgeProps) {
  const nq = p.status === 'not-quantified';
  const target = nq ? rBoundary : p.radius;
  const r = useMotionValue(rCore);

  useEffect(() => {
    const to = p.hovered ? Math.min(target + 10, rFade) : target;
    const controls = animate(
      r,
      to,
      p.reducedMotion
        ? { duration: 0 }
        : p.intro
          ? { duration: 0.6, delay: 0.3 + p.order * 0.045, ease: [0.16, 1, 0.3, 1] }
          : { duration: p.hovered ? 0.22 : p.tween ?? 0.28, ease: [0.16, 1, 0.3, 1] },
    );
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, p.hovered, p.reducedMotion]);

  const { startAngle: a0, endAngle: a1 } = p;
  const body = useTransform(r, (v) => path(rCore, v, a0, a1));
  const riskBand = useTransform(r, (v) => path(rBoundary, Math.min(v, rUpper), a0, a1));
  const highBand = useTransform(r, (v) => path(rUpper, Math.min(v, rMax), a0, a1));
  const tipOpacity = useTransform(r, (v) => (v >= rMax - 0.5 ? 1 : 0));
  const tip = useMemo(() => path(rMax, rFade, a0, a1), [a0, a1]);

  const transgressed = p.status === 'increasing-risk' || p.status === 'high-risk';
  const filter = transgressed ? (p.hovered || p.selected ? 'url(#glow-strong)' : 'url(#glow)') : undefined;

  const handleFocus = (e: React.FocusEvent<SVGGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    p.onHover(p.id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={p.ariaLabel}
      aria-pressed={p.selected}
      className="wedge cursor-pointer outline-none"
      initial={false}
      animate={{ opacity: p.dimmed ? 0.22 : 1 }}
      transition={{ duration: p.reducedMotion ? 0 : 0.25 }}
      onMouseEnter={(e) => p.onHover(p.id, { x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => p.onHover(p.id, { x: e.clientX, y: e.clientY })}
      onMouseLeave={() => p.onHover(null)}
      onFocus={handleFocus}
      onBlur={() => p.onHover(null)}
      onClick={p.onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          p.onSelect();
        }
      }}
    >
      {nq ? (
        <>
          <motion.path d={body} fill={p.palette.nq} opacity={0.55} />
          <motion.path d={body} fill="url(#pat-nq)" stroke={p.palette.nqStroke} strokeWidth={1} strokeDasharray="3 3" />
        </>
      ) : (
        <>
          {p.offScale && <motion.path d={tip} fill="url(#grad-fade)" style={{ opacity: tipOpacity }} />}
          <motion.path d={body} fill="url(#grad-wedge)" filter={filter} />
          {/* Pattern overlays so status is legible without colour. */}
          <motion.path d={riskBand} fill="url(#pat-risk)" />
          <motion.path d={highBand} fill="url(#pat-high)" />
        </>
      )}
      {/* Visible focus/selection outline */}
      <motion.path
        d={body}
        fill="none"
        stroke={p.palette.text}
        strokeWidth={2.5}
        className="wedge-outline"
        opacity={p.selected ? 0.9 : 0}
      />
    </motion.g>
  );
}
