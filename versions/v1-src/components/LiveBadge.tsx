import type { LiveSeries } from '../services';
import { source } from '../data';

const STYLE = {
  loading: ['bg-slate-400', 'Loading…'],
  live: ['bg-emerald-500 animate-pulse', 'Live'],
  cached: ['bg-emerald-500', 'Live (cached)'],
  fallback: ['bg-amber-500', 'Offline snapshot'],
  unavailable: ['bg-slate-400', 'Not connected'],
} as const;

export function LiveBadge({ s }: { s: LiveSeries }) {
  const [dot, text] = STYLE[s.state];
  const title = [source(s.sourceId).short, s.note, s.error].filter(Boolean).join(' — ');
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400" title={title}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {text}
    </span>
  );
}
