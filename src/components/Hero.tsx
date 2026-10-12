import { EarthGlobe } from './EarthGlobe';
import { Sparkline } from './Sparkline';
import { LiveBadge } from './LiveBadge';
import { Cite } from './Cite';
import { fmt } from '../lib/format';
import { STATUS_COLOR, WEDGE } from '../lib/palette';
import { isTransgressed, worstStatus } from '../lib/scale';
import type { LiveData } from '../hooks/useLiveData';
import type { RingRow } from './PlanetaryRing';
import type { BoundaryData, Status } from '../lib/types';

const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

interface Props {
  rows: RingRow[];
  todayYear: number;
  live: LiveData;
  data: BoundaryData;
  reducedMotion: boolean;
  onExplore: () => void;
  onTour: () => void;
  onSelect: (id: string) => void;
}

/** Full-bleed, always-dark cinematic opening. */
export function Hero({ rows, live, data, reducedMotion, onExplore, onTour, onSelect }: Props) {
  const statuses: Status[] = rows.map((r) => worstStatus(r.ring.map((e) => e.status)));
  const count = statuses.filter(isTransgressed).length;
  const change = data.meta.latestChange;

  return (
    <section aria-labelledby="hero-h" className="dark relative isolate -mt-[64px] overflow-hidden bg-[#03060f] pt-[64px] text-white">
      {/* Globe */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[46%] w-[150vw] max-w-[1300px] -translate-x-1/2 -translate-y-1/2 opacity-90 md:left-[68%] md:w-[95vw]">
          <EarthGlobe speed={reducedMotion ? 0 : 4} className="w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#03060f] via-[#03060f]/80 to-transparent md:via-[#03060f]/55" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#03060f] to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-emerald-300/90">
          Planetary Boundaries Explorer
        </p>
        <h1 id="hero-h" className="max-w-3xl text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          Earth is beyond <strong className="font-semibold text-rose-300">{WORDS[count]} of nine</strong> planetary boundaries
        </h1>
        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-slate-300">
          Cultivating <strong className="font-semibold text-white">planetary awareness</strong> through{' '}
          <strong className="font-semibold text-white">science</strong> and{' '}
          <strong className="font-semibold text-white">data</strong>: see where humanity stands against the limits that keep
          Earth stable.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <button type="button" onClick={onExplore} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-100">
            Explore the boundaries
          </button>
          <button type="button" onClick={onTour} className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
            ▶&nbsp; Take the guided tour
          </button>
        </div>

        <dl className="mt-14 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-6 md:grid-cols-4">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Transgressed</dt>
            <dd className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-light tabular-nums">{count}<span className="text-slate-500">/9</span></span>
              <span className="flex gap-1" aria-hidden="true">
                {statuses.map((s, i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">CO₂ <LiveBadge s={live.co2} /></dt>
            <dd className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-light tabular-nums">{live.co2.latest ? fmt(live.co2.latest.value) : '—'}<span className="ml-1 text-sm text-slate-500">ppm</span></span>
              <span className="text-slate-500"><Sparkline series={live.co2.series} color={WEDGE.orange} reference={350} width={70} height={30} label="CO₂ since 1959" /></span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">Warming <LiveBadge s={live.temperature} /></dt>
            <dd className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-light tabular-nums">{live.temperature.latest ? `+${fmt(live.temperature.latest.value)}` : '—'}<span className="ml-1 text-sm text-slate-500">°C</span></span>
              <span className="text-slate-500"><Sparkline series={live.temperature.series} color={WEDGE.red} reference={0} width={70} height={30} label="Temperature anomaly since 1950" /></span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-slate-400">New in {change.year}</dt>
            <dd className="mt-2">
              <button type="button" className="text-left text-sm font-medium leading-snug hover:underline" onClick={() => onSelect(change.boundary)}>
                {change.text} →
              </button>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-[11px] text-slate-500">
          Sources: <Cite id="richardson2023" /> · <Cite id="phc2025" /> · <Cite id="noaa-gml" /> · <Cite id="nasa-gistemp" />
        </p>
      </div>
    </section>
  );
}
