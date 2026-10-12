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
