import { N_MAX } from '../lib/scale';
import { STATUS_COLOR } from '../lib/palette';
import type { Status } from '../lib/types';

const MAX = N_MAX + 0.4;
const pct = (n: number) => `${(Math.min(Math.max(n, 0), MAX) / MAX) * 100}%`;

interface Props {
  n: number | null;
  status: Status;
  /** Optional comparison position, drawn as a hollow marker. */
  ghostN?: number | null;
  size?: 'sm' | 'md';
}

/** Horizontal bar of the three zones with a marker at the current position. */
export function ZoneGauge({ n, status, ghostN, size = 'sm' }: Props) {
  const h = size === 'md' ? 'h-2.5' : 'h-1.5';
  const dot = size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <span className={`relative my-1.5 block ${h}`} aria-hidden="true">
      <span className="absolute inset-0 flex overflow-hidden rounded-full">
        <span className="bg-emerald-500/35" style={{ width: pct(1) }} />
        <span className="bg-gradient-to-r from-amber-400/45 to-orange-500/45" style={{ width: `calc(${pct(2)} - ${pct(1)})` }} />
        <span className="flex-1 bg-gradient-to-r from-rose-600/45 to-fuchsia-900/50" />
      </span>
      {n != null && (
        <span
          className="absolute inset-y-0 left-0 rounded-full opacity-90"
          style={{ width: pct(n), background: `linear-gradient(90deg, transparent, ${STATUS_COLOR[status]})` }}
        />
      )}
      <span className="absolute -inset-y-1 w-0.5 rounded bg-slate-900 dark:bg-white" style={{ left: pct(1) }} />
      {ghostN != null && (
        <span
          className={`absolute top-1/2 ${dot} -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-slate-500 dark:border-slate-300`}
          style={{ left: pct(ghostN) }}
        />
      )}
      {n != null ? (
        <span
          className={`absolute top-1/2 ${dot} -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow dark:border-navy-900`}
          style={{ left: pct(n), background: STATUS_COLOR[status] }}
        />
      ) : (
        <span className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(-45deg,#8a93a8_0_2px,transparent_2px_6px)] opacity-60" />
      )}
    </span>
  );
}
