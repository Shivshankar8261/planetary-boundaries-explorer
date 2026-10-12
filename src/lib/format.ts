import type { Evaluated, Indicator } from './types';

export function fmt(v: number | null | undefined, unit = ''): string {
  if (v == null || Number.isNaN(v)) return '—';
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  const s = v.toLocaleString('en-GB', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  return unit ? `${s} ${unit}` : s;
}

export function currentDisplay(ev: Evaluated): string {
  const ind = ev.indicator;
  if (ind.scale === 'qualitative') return ev.status === 'not-quantified' ? 'Not quantified' : ind.display ?? '—';
  if (ind.display && ev.value === ind.currentValue) return ind.display;
  return fmt(ev.value, ind.unit);
}

export function boundaryDisplay(ind: Indicator): string {
  const cmp = ind.direction === 'lower-worse' ? '≥' : '≤';
  return `${cmp} ${fmt(ind.boundaryValue, ind.unit)}`;
}

export function uncertaintyDisplay(ind: Indicator): string {
  if (ind.uncertaintyUpper == null) return '—';
  return `${fmt(ind.boundaryValue)} – ${fmt(ind.uncertaintyUpper, ind.unit)}`;
}

/** Plain-language distance from the boundary, e.g. "22% beyond boundary" or "15× the boundary". */
export function transgressionText(ev: Evaluated): string | null {
  const ind = ev.indicator;
  const v = ev.value;
  if (ind.scale === 'qualitative') return ev.status === 'not-quantified' ? null : 'Release exceeds testing capacity';
  if (v == null || ind.boundaryValue === 0) return null;
  if (ind.scale === 'log') {
    const ratio = v / ind.boundaryValue;
    return ratio >= 1 ? `${fmt(ratio)}× the boundary` : `${fmt(1 / ratio)}× below the boundary`;
  }
  const beyond = ind.direction === 'lower-worse' ? (ind.boundaryValue - v) / ind.boundaryValue : (v - ind.boundaryValue) / ind.boundaryValue;
  const pct = Math.abs(beyond * 100);
  if (beyond > 0 && pct >= 100) return `${fmt(1 + beyond)}× the boundary`;
  return `${pct < 1 ? pct.toFixed(1) : Math.round(pct)}% ${beyond > 0 ? 'beyond' : 'inside'} the boundary`;
}
