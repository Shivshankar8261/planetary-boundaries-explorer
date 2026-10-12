import { BoundaryIcon } from './Icons';
import { StatusChip } from './StatusChip';
import { ZoneGauge } from './ZoneGauge';
import { worstStatus } from '../lib/scale';
import { currentDisplay } from '../lib/format';
import type { Evaluated } from '../lib/types';
import type { RingRow } from './PlanetaryRing';

interface Props {
  rows: RingRow[];
  selectedId: string | null;
  compare?: Map<string, Evaluated> | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/** Text/list view of the ring — the primary view on small screens and an accessible alternative everywhere. */
export function WedgeList({ rows, selectedId, compare, onSelect, onHover }: Props) {
  return (
    <ul className="-mx-2" aria-label="Planetary boundaries list">
      {rows.map(({ boundary, ring }) => (
        <li key={boundary.id}>
          <button
            type="button"
            onClick={() => onSelect(boundary.id)}
            onMouseEnter={() => onHover?.(ring[0]?.indicator.id ?? null)}
            onMouseLeave={() => onHover?.(null)}
            aria-current={selectedId === boundary.id}
            className={`group flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5 ${
              selectedId === boundary.id ? 'bg-slate-100 dark:bg-white/5' : ''
            }`}
          >
            <span className="mt-0.5 rounded-lg bg-slate-100 p-1.5 text-slate-600 transition group-hover:bg-white dark:bg-white/5 dark:text-slate-300">
              <BoundaryIcon name={boundary.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">{boundary.name}</span>
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
                  <ZoneGauge n={ev.n} status={ev.status} ghostN={compare?.get(ev.indicator.id)?.n ?? null} />
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
