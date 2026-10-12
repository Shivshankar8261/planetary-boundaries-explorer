import { useId } from 'react';
import type { Point } from '../lib/types';

interface Props {
  series: Point[];
  color: string;
  /** Horizontal reference line (e.g. a boundary value). */
  reference?: number;
  width?: number;
  height?: number;
  label: string;
}

export function Sparkline({ series, color, reference, width = 120, height = 36, label }: Props) {
  const id = useId();
  if (series.length < 2) return <svg width={width} height={height} aria-hidden="true" />;
  const xs = series.map((p) => p.year);
  const ys = series.map((p) => p.value).concat(reference ?? []);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const sx = (x: number) => ((x - x0) / (x1 - x0 || 1)) * (width - 4) + 2;
  const sy = (y: number) => height - 3 - ((y - y0) / (y1 - y0 || 1)) * (height - 6);
  const line = series.map((p, i) => `${i ? 'L' : 'M'}${sx(p.year).toFixed(1)},${sy(p.value).toFixed(1)}`).join('');
  const last = series[series.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {reference != null && (
        <line x1="0" x2={width} y1={sy(reference)} y2={sy(reference)} stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 3" />
      )}
      <path d={`${line}L${sx(last.year)},${height}L${sx(series[0].year)},${height}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx={sx(last.year)} cy={sy(last.value)} r="2.8" fill={color} />
    </svg>
  );
}
