import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BoundaryIcon } from './Icons';
import { StatusChip } from './StatusChip';
import { Cite } from './Cite';
import { LiveBadge } from './LiveBadge';
import { SeriesChart, TrendChart } from './TrendChart';
import { boundaryDisplay, currentDisplay, fmt, uncertaintyDisplay } from '../lib/format';
import { worstStatus } from '../lib/scale';
import { WEDGE, type Palette } from '../lib/palette';
import type { Boundary, Evaluated } from '../lib/types';
import type { LiveData } from '../hooks/useLiveData';

interface Props {
  boundary: Boundary;
  evaluated: Evaluated[];
  year: number;
  palette: Palette;
  live: LiveData;
  onClose: () => void;
}

export function DetailPanel({ boundary, evaluated, year, palette, live, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [boundary.id, onClose]);

  const status = worstStatus(evaluated.filter((e) => e.indicator.onRing).map((e) => e.status));

  return (
    <>
      <motion.div
        className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        key="panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="detail-title"
        initial={reduced ? { opacity: 0 } : { x: '100%' }}
        animate={reduced ? { opacity: 1 } : { x: 0 }}
        exit={reduced ? { opacity: 0 } : { x: '100%' }}
        transition={{ type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[460px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-navy-700 dark:bg-navy-900"
      >
        <header className="flex items-start gap-3 border-b border-slate-200 p-5 dark:border-navy-700">
          <span className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-navy-800 dark:text-slate-200">
            <BoundaryIcon name={boundary.icon} size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="detail-title" className="text-xl font-semibold leading-tight">{boundary.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <StatusChip status={status} />
              <span>in {year}</span>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="btn !p-2" aria-label="Close details">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm leading-relaxed">
          <p className="text-slate-700 dark:text-slate-200">{boundary.description}</p>

          {evaluated.map((ev) => {
            const ind = ev.indicator;
            return (
              <section key={ind.id} aria-labelledby={`h-${ind.id}`} className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 id={`h-${ind.id}`} className="font-semibold">
                    {ind.name}
                    {!ind.onRing && <span className="ml-2 text-xs font-normal text-slate-500">(supplementary)</span>}
                  </h3>
                  <StatusChip status={ev.status} short />
                </div>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{ind.controlVariable}</p>
                <dl className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <Stat label="Boundary" value={boundaryDisplay(ind)} cite={ind.boundarySource} />
                  <Stat label="Uncertainty zone" value={uncertaintyDisplay(ind)} cite={ind.boundarySource} />
                  <Stat
                    label={ev.isScenario ? `Scenario ${year}` : `Value ${year}`}
                    value={currentDisplay(ev)}
                    cite={ev.isScenario ? ind.scenarioSource : year === ind.year || ind.scale === 'qualitative' ? ind.source : ind.historySource}
                    strong
                  />
                </dl>
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Latest published value: <strong>{ind.display ?? fmt(ind.currentValue, ind.unit)}</strong> ({ind.year}) — <Cite id={ind.source} />
                </p>
                {ind.scale === 'qualitative' ? (
                  <p className="rounded-lg bg-slate-100 p-3 text-xs dark:bg-navy-800">
                    Assessed qualitatively: the boundary is zero untested releases, and the rate of production and release of
                    novel entities exceeds society’s capacity to assess them. Not quantified in the 2009 and 2015 assessments;
                    first quantified by <Cite id="persson2022" />.
                  </p>
                ) : (
                  <>
                    <TrendChart indicator={ind} year={year} palette={palette} />
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      History: <Cite id={ind.historySource} />
                      {ind.historyApprox && ' (approximate)'}. 2050: <Cite id={ind.scenarioSource} />.
                      {ind.historyNote && ` ${ind.historyNote}`}
                    </p>
                  </>
                )}
              </section>
            );
          })}

          {boundary.id === 'climate' && (
            <section className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Global temperature anomaly</h3>
                <LiveBadge s={live.temperature} />
              </div>
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Annual mean vs 1951–1980 · latest {live.temperature.latest ? `${fmt(live.temperature.latest.value, '°C')} (${live.temperature.latest.year})` : '—'} —{' '}
                <Cite id="nasa-gistemp" />. Context only; not a boundary control variable.
              </p>
              {live.temperature.series.length > 0 && (
                <SeriesChart series={live.temperature.series} unit="°C" palette={palette} />
              )}
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                CO₂ feed: <LiveBadge s={live.co2} /> — <Cite id="noaa-gml" />
              </p>
            </section>
          )}

          {boundary.id === 'land' && (
            <section className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Annual tree-cover loss</h3>
                <LiveBadge s={live.treeCoverLoss} />
              </div>
              {live.treeCoverLoss.series.length > 0 ? (
                <>
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    Global, ≥30% canopy, million hectares per year — <Cite id="gfw" />
                  </p>
                  <SeriesChart series={live.treeCoverLoss.series} unit="Mha" palette={palette} color={WEDGE.orange} />
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {live.treeCoverLoss.note} The forest-cover wedge uses the value in boundaries.json (<Cite id="richardson2023" />).
                </p>
              )}
            </section>
          )}

          <section>
            <h3 className="mb-2 font-semibold">Key drivers</h3>
            <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
              {boundary.drivers.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 font-semibold">Consequences for societies</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-200">
              {boundary.consequences.map((c) => (
                <li key={c.text} className="border-l-2 border-rose-400/60 pl-3">
                  {c.text} <span className="text-xs">— <Cite id={c.source} /></span>
                </li>
              ))}
            </ul>
            {boundary.societies && (
              <div className="mt-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  How different societies experience it
                </h4>
                {boundary.societies.map((s) => (
                  <div key={s.place} className="rounded-lg bg-slate-100 p-3 dark:bg-navy-800">
                    <div className="font-semibold">{s.place}</div>
                    <p className="text-slate-700 dark:text-slate-200">{s.text}</p>
                    <p className="mt-1 text-xs"><Cite id={s.source} /></p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.aside>
    </>
  );
}

function Stat({ label, value, cite, strong }: { label: string; value: string; cite: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-2 dark:bg-navy-800">
      <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-[13px] ${strong ? 'font-bold' : 'font-medium'}`}>{value}</dd>
      <dd className="mt-0.5 truncate text-[10px]"><Cite id={cite} /></dd>
    </div>
  );
}
