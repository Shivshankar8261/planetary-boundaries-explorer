import { scaleLinear } from 'd3-scale';
import type { Indicator, Status } from './types';

/** Largest normalised value drawn on the ring; anything beyond fades out past the edge. */
export const N_MAX = 3.4;
/** Fixed position for qualitatively-assessed boundaries that are known to be exceeded. */
export const N_QUALITATIVE = N_MAX + 0.4;

/** Ring geometry in SVG user units (centre at 0,0). */
export const GEOMETRY = {
  rCore: 42,
  rBoundary: 150,
  rUpper: 225,
  rMax: 330,
  rFade: 362,
  rLabel: 384,
};

const tf = (ind: Indicator, x: number) => (ind.scale === 'log' ? Math.log10(x) : x);

/**
 * Map a control-variable value onto the piecewise scale used by the diagram:
 *   pre-industrial → 0, boundary → 1, upper end of uncertainty → 2,
 * and continues linearly beyond (one "uncertainty-zone width" per unit), as in
 * Richardson et al. (2023), Fig. 1.
 */
export function normalise(ind: Indicator, value: number | null): { n: number | null; offScale: boolean } {
  if (value == null) return { n: null, offScale: false };
  if (ind.scale === 'qualitative') return { n: N_QUALITATIVE, offScale: true };
  const sign = ind.direction === 'lower-worse' ? -1 : 1;
  const p = tf(ind, ind.preindustrial);
  const tb = (tf(ind, ind.boundaryValue) - p) * sign;
  const tu = (tf(ind, ind.uncertaintyUpper ?? ind.boundaryValue * 2) - p) * sign;
  const tv = (tf(ind, value) - p) * sign;
  let n: number;
  if (tv <= tb) n = Math.max(0, tv / tb);
  else if (tv <= tu) n = 1 + (tv - tb) / (tu - tb);
  else n = 2 + (tv - tu) / (tu - tb);
  return { n: Math.min(n, N_MAX), offScale: n > N_MAX };
}

export function statusFromN(n: number | null): Status {
  if (n == null) return 'not-quantified';
  if (n <= 1) return 'safe';
  if (n <= 2) return 'increasing-risk';
  return 'high-risk';
}

/** Normalised value → radius (piecewise-linear across the three zones). */
const radiusScale = scaleLinear()
  .domain([0, 1, 2, N_MAX])
  .range([GEOMETRY.rCore, GEOMETRY.rBoundary, GEOMETRY.rUpper, GEOMETRY.rMax])
  .clamp(true);

export const radiusFor = (n: number): number => radiusScale(n);

export const isTransgressed = (s: Status) => s === 'increasing-risk' || s === 'high-risk';

export const STATUS_LABEL: Record<Status, string> = {
  safe: 'Safe operating space',
  'increasing-risk': 'Zone of increasing risk',
  'high-risk': 'High risk',
  'not-quantified': 'Not yet quantified',
};

export const worstStatus = (statuses: Status[]): Status => {
  const order: Status[] = ['high-risk', 'increasing-risk', 'safe', 'not-quantified'];
  return order.find((s) => statuses.includes(s)) ?? 'not-quantified';
};
