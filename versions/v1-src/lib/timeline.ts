import type { Boundary, Evaluated, Indicator, Point } from './types';
import { normalise, statusFromN } from './scale';

export const YEAR_MIN = 1950;
export const YEAR_MAX = 2050;

/** Observed history plus the current value, sorted and de-duplicated. */
export function observedSeries(ind: Indicator): Point[] {
  const pts = [...ind.history];
  if (ind.currentValue != null && !pts.some((p) => p.year === ind.year)) {
    pts.push({ year: ind.year, value: ind.currentValue });
  }
  return pts.sort((a, b) => a.year - b.year);
}

export function scenarioSeries(ind: Indicator): Point[] {
  const obs = observedSeries(ind);
  if (ind.scenario2050 == null || obs.length === 0) return [];
  return [obs[obs.length - 1], { year: YEAR_MAX, value: ind.scenario2050 }];
}

function interpolate(points: Point[], year: number): number | null {
  if (points.length === 0) return null;
  if (year <= points[0].year) return points[0].value;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (year <= b.year) return a.value + ((b.value - a.value) * (year - a.year)) / (b.year - a.year);
  }
  return points[points.length - 1].value;
}

/** Value of an indicator in a given year; `null` year means the published baseline. */
export function evaluate(boundary: Boundary, ind: Indicator, year: number | null): Evaluated {
  const lastObserved = observedSeries(ind).at(-1)?.year ?? ind.year;
  const isScenario = year != null && year > lastObserved;

  if (ind.scale === 'qualitative') {
    const quantified = year == null || ind.quantifiedSince == null || year >= ind.quantifiedSince;
    const { n, offScale } = normalise(ind, quantified ? 1 : null);
    return {
      indicator: ind,
      boundary,
      value: null,
      n: quantified ? n : null,
      offScale,
      status: quantified ? ind.status : 'not-quantified',
      isScenario,
    };
  }

  let value: number | null;
  if (year == null) value = ind.currentValue;
  else value = interpolate([...observedSeries(ind), ...scenarioSeries(ind).slice(1)], year);

  const { n, offScale } = normalise(ind, value);
  return { indicator: ind, boundary, value, n, offScale, status: statusFromN(n), isScenario };
}
