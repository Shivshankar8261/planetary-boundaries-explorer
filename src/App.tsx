import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { DATA } from './data';
import { STORY } from './data/story';
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
import { Hero } from './components/Hero';
import { StoryTour } from './components/StoryTour';
import { Tabs } from './components/Tabs';
import { Starfield } from './components/Starfield';
import { Section } from './components/Section';
import { Lenses } from './components/Lenses';
import { BoundaryCards } from './components/BoundaryCards';
import { Societies } from './components/Societies';
import { Footer } from './components/Footer';
import { useLiveData, useMergedData } from './hooks/useLiveData';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import { evaluate } from './lib/timeline';
import { isTransgressed, worstStatus } from './lib/scale';
import { PALETTES } from './lib/palette';
import { fmt } from './lib/format';
import type { Evaluated, StatusFilter } from './lib/types';

type View = 'diagram' | 'sources';
const viewFromHash = (): View => (window.location.hash === '#sources' ? 'sources' : 'diagram');
const COMPARE_OPTIONS = [1950, 1975, 2000, 2050];
const NAV = [
  { href: '#explore', label: 'Explore' },
  { href: '#boundaries', label: 'Boundaries' },
  { href: '#societies', label: 'Societies' },
  { href: '#sources', label: 'Sources' },
];

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
  const [compareYear, setCompareYear] = useState<number | null>(null);
  const [hover, setHover] = useState<{ id: string; pos?: { x: number; y: number } } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setView(viewFromHash());
    window.addEventListener('hashchange', on);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // When returning from the sources page to an in-page anchor, scroll once it exists.
  useEffect(() => {
    if (view !== 'diagram') {
      window.scrollTo(0, 0);
      return;
    }
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [view]);

  const scrollTo = (id: string) => {
    const go = () => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    if (view !== 'diagram') {
      window.location.hash = id;
    } else go();
  };

  // Apply a tour step: set the year and compare against today where it adds context.
  const step = tourStep != null ? STORY[tourStep] : null;
  useEffect(() => {
    if (!step) return;
    const y = step.year === 'today' ? todayYear : step.year;
    setYear(y);
    setCompareYear(y === todayYear ? null : todayYear);
    setSelectedId(null);
    setFilter('all');
  }, [step, todayYear]);

  const startTour = () => {
    setTourStep(0);
    if (view !== 'diagram') window.location.hash = 'explore';
    requestAnimationFrame(() =>
      ringRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' }),
    );
  };
  const exitTour = useCallback(() => {
    setTourStep(null);
    setCompareYear(null);
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
  // Hero and cards always describe today, independent of the timeline.
  const todayRows: RingRow[] = useMemo(
    () =>
      data.boundaries.map((b) => ({
        boundary: b,
        ring: b.indicators.filter((i) => i.onRing).map((i) => evaluate(b, i, null)),
      })),
    [data],
  );

  const compare = useMemo(() => {
    if (compareYear == null || compareYear === year) return null;
    const m = new Map<string, Evaluated>();
    data.boundaries.forEach((b) =>
      b.indicators.forEach((i) => m.set(i.id, evaluate(b, i, compareYear === todayYear ? null : compareYear))),
    );
    return m;
  }, [data, compareYear, year, todayYear]);

  const transgressed = rows.filter((r) => isTransgressed(worstStatus(r.ring.map((e) => e.status)))).length;
  const hoveredEv = hover ? rows.flatMap((r) => r.ring).find((e) => e.indicator.id === hover.id) ?? null : null;
  const selected = data.boundaries.find((b) => b.id === selectedId) ?? null;
  const climate = data.boundaries.find((b) => b.id === 'climate')!;

  const onHover = useCallback((id: string | null, pos?: { x: number; y: number }) => {
    setHover(id ? { id, pos } : null);
  }, []);
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    setHover(null);
  }, []);
  const closePanel = useCallback(() => setSelectedId(null), []);
  const onYear = useCallback((y: number) => {
    setTourStep(null);
    setYear(y);
  }, []);

  const caption =
    `Planetary boundaries, ${year}${isScenario ? ' (* scenario projection)' : ''}. Scaling after Richardson et al. 2023 (Science Advances). | ` +
    `Data: Richardson et al. 2023; Planetary Health Check 2025; NOAA GML.`;

  const overHero = view === 'diagram' && !scrolled;

  return (
    <div className="relative min-h-screen">
      <Starfield />
      <a href="#main" className="btn sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-30 h-16 transition-colors duration-300 ${
          overHero
            ? 'dark border-b border-transparent bg-transparent text-white'
            : 'border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#03060f]/75'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href="#" onClick={(e) => { e.preventDefault(); history.replaceState(null, '', ' '); setView('diagram'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2.5" aria-label="Planetary Boundaries Explorer, back to top">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
              <circle cx="16" cy="16" r="15" fill="#8e2a7c" opacity=".3" />
              <path d="M16 16 L16 1 A15 15 0 0 1 28.9 8.5Z" fill="#d7263d" />
              <circle cx="16" cy="16" r="9" fill="#2fa863" />
              <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeDasharray="2 2" />
              <circle cx="16" cy="16" r="3.2" fill="#3b82c4" />
            </svg>
            <span className="hidden text-sm font-semibold uppercase tracking-[0.2em] sm:inline">Planetary&nbsp;Boundaries</span>
          </a>
          <nav aria-label="Main" className="ml-6 hidden gap-6 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => {
                  if (n.href !== '#sources') {
                    e.preventDefault();
                    scrollTo(n.href.slice(1));
                  }
                }}
                aria-current={n.href === '#sources' && view === 'sources' ? 'page' : undefined}
                className="text-xs font-medium uppercase tracking-[0.18em] opacity-75 transition hover:opacity-100 aria-[current=page]:opacity-100"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className="btn-primary !rounded-full" onClick={startTour}>
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9.5-5.5z" fill="currentColor" /></svg>
              <span className="hidden sm:inline">Guided tour</span>
              <span className="sm:hidden">Tour</span>
            </button>
            <HowToRead />
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
      </header>

      <main id="main">
        {view === 'sources' ? (
          <SourcesPage data={data} live={live} />
        ) : (
          <>
            <Hero
              rows={todayRows}
              todayYear={todayYear}
              live={live}
              data={data}
              reducedMotion={reducedMotion}
              onExplore={() => scrollTo('explore')}
              onTour={startTour}
              onSelect={onSelect}
            />

            <Section
              id="lenses"
              intro="Seeing, witnessing, caring — three ways in"
              title={<>The planet has <strong className="font-semibold">limits</strong>. Here is where we stand.</>}
            >
              <Lenses onExplore={() => scrollTo('explore')} onTour={startTour} onSocieties={() => scrollTo('societies')} />
            </Section>

            <Section
              id="explore"
              intro="The diagram"
              title={<>Nine boundaries, <strong className="font-semibold">one safe operating space</strong></>}
              lead={
                <>
                  Each wedge is one boundary. Inside the dashed circle is safe; beyond it, risk grows from yellow to deep
                  purple. Hover for numbers, click for the full story, drag the timeline to travel from 1950 to 2050.{' '}
                  <span className="whitespace-nowrap">
                    <strong className="font-semibold text-rose-600 dark:text-rose-300">{transgressed} of 9</strong> transgressed in {year}.
                  </span>
                </>
              }
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="card min-w-0 self-start !p-4 sm:!p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusFilterToggle value={filter} onChange={setFilter} />
                    <label className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span>Compare with</span>
                      <select
                        value={compareYear ?? ''}
                        onChange={(e) => setCompareYear(e.target.value ? Number(e.target.value) : null)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-navy-900"
                      >
                        <option value="">—</option>
                        {[...COMPARE_OPTIONS, todayYear]
                          .sort((a, b) => a - b)
                          .filter((y) => y !== year)
                          .map((y) => (
                            <option key={y} value={y}>{y === todayYear ? `Today (${y})` : y}</option>
                          ))}
                      </select>
                    </label>
                    <ExportMenu svgRef={svgRef} year={year} />
                  </div>

                  <div ref={ringRef} className={`relative mx-auto mt-2 aspect-square w-full ${wide ? 'max-w-[780px]' : 'max-w-md'}`}>
                    <PlanetaryRing
                      ref={svgRef}
                      rows={rows}
                      palette={palette}
                      year={year}
                      isScenario={isScenario}
                      filter={filter}
                      hoveredId={hover?.id ?? null}
                      selectedId={selectedId}
                      highlightIds={step?.highlight ?? null}
                      compare={compare}
                      compareYear={compare ? compareYear : null}
                      compact={!wide}
                      reducedMotion={reducedMotion}
                      tween={step ? 1 : 0.35}
                      caption={caption}
                      onHover={onHover}
                      onSelect={onSelect}
                    />
                  </div>

                  <div className="mt-2">
                    <AnimatePresence mode="wait">
                      {tourStep != null ? (
                        <StoryTour key="tour" index={tourStep} onChange={setTourStep} onExit={exitTour} />
                      ) : (
                        <div key="timeline">
                          <TimelineSlider year={year} todayYear={todayYear} onChange={onYear} reducedMotion={reducedMotion} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <aside className="card min-w-0 self-start" aria-label="Boundary list, legend and live data">
                  <Tabs
                    label="Side panel"
                    tabs={[
                      {
                        id: 'list',
                        label: 'Boundaries',
                        content: (
                          <WedgeList
                            rows={rows}
                            selectedId={selectedId}
                            compare={compare}
                            onSelect={onSelect}
                            onHover={canHover ? (id) => onHover(id) : undefined}
                          />
                        ),
                      },
                      { id: 'legend', label: 'Legend', content: <Legend /> },
                      {
                        id: 'live',
                        label: 'Live data',
                        content: (
                          <div className="space-y-3 text-sm">
                            <LiveRow label="CO₂ · Mauna Loa" value={live.co2.latest ? `${fmt(live.co2.latest.value, 'ppm')} (${live.co2.latest.year})` : '—'} badge={<LiveBadge s={live.co2} />} cite="noaa-gml" />
                            <LiveRow label="Temperature anomaly" value={live.temperature.latest ? `+${fmt(live.temperature.latest.value, '°C')} (${live.temperature.latest.year})` : '—'} badge={<LiveBadge s={live.temperature} />} cite="nasa-gistemp" />
                            <LiveRow label="Tree-cover loss" value={live.treeCoverLoss.latest ? `${fmt(live.treeCoverLoss.latest.value, 'Mha')} (${live.treeCoverLoss.latest.year})` : 'Needs API key'} badge={<LiveBadge s={live.treeCoverLoss} />} cite="gfw" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Each feed is cached for 24 h and falls back to bundled data if the request fails.
                            </p>
                          </div>
                        ),
                      },
                    ]}
                  />
                </aside>
              </div>
            </Section>

            <Section
              id="boundaries"
              intro="The nine processes"
              title={<>Every boundary, <strong className="font-semibold">in detail</strong></>}
              lead="Each card shows where one boundary sits on the full ring today. Open any of them for its control variable, trend since 1950, drivers and consequences."
            >
              <BoundaryCards rows={todayRows} onSelect={onSelect} reducedMotion={reducedMotion} />
            </Section>

            <Section
              id="societies"
              intro="Consequences for societies"
              title={<>Same planet, <strong className="font-semibold">unequal risks</strong></>}
              lead="Climate change shows how a planetary risk lands differently on societies. Exposure, vulnerability, state capacity, insurance and resilience decide who recovers, and who does not."
            >
              <Societies climate={climate} />
            </Section>

            <Section
              id="pathways"
              intro="Envisioning pathways"
              title={<>The way back into the <strong className="font-semibold">safe operating space</strong></>}
              lead={
                <>
                  The ozone layer shows a boundary can be pulled back: after the 1987 Montreal Protocol it returned within
                  its limit (<Cite id="wmo2022" />). The other eight depend on decisions made this decade.
                </>
              }
            >
              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-100" onClick={startTour}>
                  ▶&nbsp; Take the guided tour
                </button>
                <a href="#sources" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10">
                  Sources &amp; methods
                </a>
              </div>
            </Section>
          </>
        )}
      </main>

      <Footer live={live} onTour={startTour} />

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

function LiveRow({ label, value, badge, cite }: { label: string; value: string; badge: React.ReactNode; cite: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        {badge}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs"><Cite id={cite} /></div>
    </div>
  );
}
