import { BoundaryIcon } from './Icons';
import { StatusChip } from './StatusChip';
import { N_MAX, worstStatus } from '../lib/scale';
import { currentDisplay } from '../lib/format';
import { STATUS_COLOR } from '../lib/palette';
import type { RingRow } from './PlanetaryRing';

interface Props {
  rows: RingRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/** Text/list view of the ring — the primary view on small screens and an accessible alternative everywhere. */
export function WedgeList({ rows, selectedId, onSelect, onHover }: Props) {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-navy-800" aria-label="Planetary boundaries list">
      {rows.map(({ boundary, ring }) => (
        <li key={boundary.id}>
          <button
            type="button"
            onClick={() => onSelect(boundary.id)}
            onMouseEnter={() => onHover?.(ring[0]?.indicator.id ?? null)}
            onMouseLeave={() => onHover?.(null)}
            aria-current={selectedId === boundary.id}
            className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <span className="mt-0.5 text-slate-600 dark:text-slate-300"><BoundaryIcon name={boundary.icon} size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{boundary.name}</span>
                <StatusChip status={worstStatus(ring.map((e) => e.status))} short />
              </span>
              {ring.map((ev) => (
                <span key={ev.indicator.id} className="mt-1 block">
                  <span className="flex items-baseline justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="min-w-0 truncate">{ev.indicator.name}</span>
                    <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-slate-900 dark:text-white">
                      {currentDisplay(ev)}
                    </span>
                  </span>
                  <MiniBar n={ev.n} color={STATUS_COLOR[ev.status]} />
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function MiniBar({ n, color }: { n: number | null; color: string }) {
  const max = N_MAX + 0.4;
  return (
    <span className="relative mt-1 block h-1.5 rounded-full bg-slate-200 dark:bg-navy-800" aria-hidden="true">
      {n != null && (
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.min(n, max) / max) * 100}%`, background: color }} />
      )}
      <span className="absolute inset-y-[-2px] w-px bg-slate-900 dark:bg-white" style={{ left: `${(1 / max) * 100}%` }} />
      <span className="absolute inset-y-[-2px] w-px bg-slate-400" style={{ left: `${(2 / max) * 100}%` }} />
    </span>
  );
}
