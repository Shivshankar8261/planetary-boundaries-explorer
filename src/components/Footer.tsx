import { Cite } from './Cite';
import { fmt } from '../lib/format';
import type { LiveData } from '../hooks/useLiveData';

export function Footer({ live, onTour }: { live: LiveData; onTour: () => void }) {
  const y = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="max-w-md text-2xl font-light leading-snug">
              Making the <strong className="font-semibold">limits of a living planet</strong> visible.
            </p>
            <p className="mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Framework: <Cite id="rockstrom2009" />, <Cite id="steffen2015" />, <Cite id="richardson2023" />. Latest
              assessment: <Cite id="phc2025" />. Visual language after the Stockholm Resilience Centre figures.
            </p>
          </div>
          <nav aria-label="Footer" className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Explore</p>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#explore">The diagram</a></li>
              <li><a className="hover:underline" href="#boundaries">The nine boundaries</a></li>
              <li><a className="hover:underline" href="#societies">Consequences for societies</a></li>
              <li><button type="button" className="hover:underline" onClick={onTour}>Guided tour</button></li>
            </ul>
          </nav>
          <nav aria-label="About the data" className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Data</p>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="#sources">Sources &amp; methods</a></li>
              <li><Cite id="noaa-gml" /></li>
              <li><Cite id="nasa-gistemp" /></li>
              <li><Cite id="gfw" /></li>
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span className="tabular-nums" title="Common Era · Holocene Era · atmospheric CO₂ (NOAA GML)">
            {y} CE · {y + 10000} HE · CO₂ {live.co2.latest ? fmt(live.co2.latest.value) : '—'} ppm
          </span>
          <span>Open data · built for education and research</span>
        </div>
      </div>
    </footer>
  );
}
