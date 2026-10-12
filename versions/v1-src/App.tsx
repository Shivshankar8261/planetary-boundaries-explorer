import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { DATA } from './data';
import { PlanetaryRing, type RingRow } from './components/PlanetaryRing';
import { DetailPanel } from './components/DetailPanel';
import { TimelineSlider } from './components/TimelineSlider';
import { Legend } from './components/Legend';
import { StatusFilterToggle } from './components/StatusFilterToggle';
import { Tooltip } from './components/Tooltip';
import { WedgeList } from './components/WedgeList';
import { HowToRead } from './components/HowToRead';
import { ExportMenu } from './components/ExportMenu';
import { SourcesPage } from './components/SourcesPage';
import { LiveBadge } from './components/LiveBadge';
import { Cite } from './components/Cite';
import { useLiveData, useMergedData } from './hooks/useLiveData';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import { evaluate } from './lib/timeline';
import { isTransgressed, worstStatus } from './lib/scale';
import { PALETTES } from './lib/palette';
import { fmt } from './lib/format';
import type { StatusFilter } from './lib/types';

type View = 'diagram' | 'sources';
const viewFromHash = (): View => (window.location.hash === '#sources' ? 'sources' : 'diagram');

export default function App() {
  const [theme, setTheme] = useTheme();
  const palette = PALETTES[theme];
  const reducedMotion = useReducedMotion() ?? false;
  const wide = useMediaQuery('(min-width: 768px)');
  const canHover = useMediaQuery('(hover: hover)');

  const live = useLiveData();
  const data = useMergedData(DATA, live);
  const todayYear = data.meta.todayYear;

  const [view, setView] = useState<View>(viewFromHash);
  const [year, setYear] = useState(todayYear);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [hover, setHover] = useState<{ id: string; pos?: { x: number; y: number } } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const on = () => setView(viewFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // At "today" show the published baseline values; other years are interpolated.
  const evalYear = year === todayYear ? null : year;
  const isScenario = year > todayYear;

  const rows: RingRow[] = useMemo(
    () =>
      data.boundaries.map((b) => ({
        boundary: b,
        ring: b.indicators.filter((i) => i.onRing).map((i) => evaluate(b, i, evalYear)),
      })),
    [data, evalYear],
  );

  const transgressed = rows.filter((r) => isTransgressed(worstStatus(r.ring.map((e) => e.status)))).length;
  const hoveredEv = hover ? rows.flatMap((r) => r.ring).find((e) => e.indicator.id === hover.id) ?? null : null;
  const selected = data.boundaries.find((b) => b.id === selectedId) ?? null;

  const onHover = useCallback((id: string | null, pos?: { x: number; y: number }) => {
    setHover(id ? { id, pos } : null);
  }, []);
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    setHover(null);
  }, []);
  const closePanel = useCallback(() => setSelectedId(null), []);

  const caption =
    `Planetary boundaries, ${year}${isScenario ? ' (* scenario projection)' : ''}. Data: Richardson et al. 2023, Science Advances; ` +
    `Planetary Health Check 2025; NOAA GML. Scaling after Richardson et al. 2023.`;

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-navy-800 dark:bg-navy-950/80">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
            <circle cx="16" cy="16" r="15" fill="#d7263d" opacity=".25" />
            <circle cx="16" cy="16" r="9" fill="#2fa863" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeDasharray="2 2" />
          </svg>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-tight sm:text-lg">Planetary Boundaries</div>
            <div className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              The safe operating space for humanity
            </div>
          </div>
          <nav aria-label="Main" className="ml-4 hidden gap-1 md:flex">
            {(['diagram', 'sources'] as const).map((v) => (
              <a
                key={v}
                href={v === 'sources' ? '#sources' : '#'}
                aria-current={view === v ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  view === v
                    ? 'bg-slate-200 text-slate-900 dark:bg-navy-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {v === 'diagram' ? 'Diagram' : 'Sources & methods'}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <HowToRead />
            {view === 'diagram' && <ExportMenu svgRef={svgRef} year={year} />}
            <button
              type="button"
              className="btn !px-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" /></svg>
              )}
            </button>
          </div>
        </div>
        <nav aria-label="Main (mobile)" className="flex gap-1 px-4 pb-2 md:hidden">
          <a href="#" className={`rounded-md px-3 py-1 text-sm ${view === 'diagram' ? 'bg-slate-200 dark:bg-navy-800' : ''}`}>Diagram</a>
          <a href="#sources" className={`rounded-md px-3 py-1 text-sm ${view === 'sources' ? 'bg-slate-200 dark:bg-navy-800' : ''}`}>Sources &amp; methods</a>
        </nav>
      </header>

      <main id="main">
        {view === 'sources' ? (
          <SourcesPage data={data} live={live} />
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-labelledby="summary" className="card min-w-0 self-start !p-4 sm:!p-6">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 id="summary" className="text-xl font-semibold sm:text-2xl">
                    <span className="tabular-nums text-rose-600 dark:text-rose-400">{transgressed}</span> of 9 boundaries
                    transgressed <span className="text-slate-500 dark:text-slate-400">in {year}</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Baseline <Cite id="richardson2023" /> · <Cite id="phc2025" />
                    {isScenario && ' · values after today are scenario projections'}
                  </p>
                </div>
                <StatusFilterToggle value={filter} onChange={setFilter} />
              </div>

              <div className={`relative mx-auto w-full ${wide ? 'aspect-[1320/1000]' : 'aspect-square max-w-md'}`}>
                <PlanetaryRing
                  ref={svgRef}
                  rows={rows}
                  palette={palette}
                  year={year}
                  isScenario={isScenario}
                  filter={filter}
                  hoveredId={hover?.id ?? null}
                  selectedId={selectedId}
                  compact={!wide}
                  reducedMotion={reducedMotion}
                  caption={caption}
                  onHover={onHover}
                  onSelect={onSelect}
                />
              </div>

              <div className="mt-4">
                <TimelineSlider year={year} todayYear={todayYear} onChange={setYear} reducedMotion={reducedMotion} />
              </div>
            </section>

            <aside className="min-w-0 space-y-6" aria-label="Diagram controls and list">
              <section aria-labelledby="list-h" className="card">
                <h2 id="list-h" className="card-title">Boundaries · {year}</h2>
                <WedgeList rows={rows} selectedId={selectedId} onSelect={onSelect} onHover={canHover ? (id) => onHover(id) : undefined} />
              </section>
              <Legend />
              <section aria-labelledby="live-h" className="card text-sm">
                <h2 id="live-h" className="card-title">Live data</h2>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between gap-2">
                    <span>CO₂ (Mauna Loa) {live.co2.latest && <strong className="tabular-nums">{fmt(live.co2.latest.value, 'ppm')}</strong>} {live.co2.latest && <span className="text-xs text-slate-500">{live.co2.latest.year}</span>}</span>
                    <LiveBadge s={live.co2} />
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Temp. anomaly {live.temperature.latest && <strong className="tabular-nums">+{fmt(live.temperature.latest.value, '°C')}</strong>} {live.temperature.latest && <span className="text-xs text-slate-500">{live.temperature.latest.year}</span>}</span>
                    <LiveBadge s={live.temperature} />
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span>Tree-cover loss (GFW)</span>
                    <LiveBadge s={live.treeCoverLoss} />
                  </li>
                </ul>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <Cite id="noaa-gml" /> · <Cite id="nasa-gistemp" /> · <Cite id="gfw" />
                </p>
              </section>
            </aside>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 dark:text-slate-400 sm:px-6">
        Framework: <Cite id="rockstrom2009" />, <Cite id="steffen2015" />, <Cite id="richardson2023" />. Latest assessment:{' '}
        <Cite id="phc2025" />. Visual design after the Stockholm Resilience Centre diagrams. See{' '}
        <a href="#sources" className="underline">Sources &amp; methods</a>.
      </footer>

      {canHover && view === 'diagram' && <Tooltip ev={hoveredEv} pos={hover?.pos ?? null} year={year} />}

      <AnimatePresence>
        {selected && view === 'diagram' && (
          <DetailPanel
            key={selected.id}
            boundary={selected}
            evaluated={selected.indicators.map((i) => evaluate(selected, i, evalYear))}
            year={year}
            palette={palette}
            live={live}
            onClose={closePanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
