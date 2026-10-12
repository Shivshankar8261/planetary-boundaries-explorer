import { Cite } from './Cite';
import { StatusChip } from './StatusChip';
import { boundaryDisplay, fmt, uncertaintyDisplay } from '../lib/format';
import type { BoundaryData } from '../lib/types';
import type { LiveData } from '../hooks/useLiveData';
import { LiveBadge } from './LiveBadge';

export function SourcesPage({ data, live }: { data: BoundaryData; live: LiveData }) {
  return (
    <article className="mx-auto max-w-5xl space-y-10 px-4 py-8 text-sm leading-relaxed sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold">Sources &amp; methods</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Baseline: {data.meta.baseline}. Last reviewed {data.meta.lastReviewed}.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Control variables and values</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300">
              <tr>
                <th scope="col" className="p-2">Boundary / indicator</th>
                <th scope="col" className="p-2">Control variable</th>
                <th scope="col" className="p-2">Boundary</th>
                <th scope="col" className="p-2">Uncertainty zone</th>
                <th scope="col" className="p-2">Current</th>
                <th scope="col" className="p-2">Status</th>
                <th scope="col" className="p-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {data.boundaries.flatMap((b) =>
                b.indicators.map((ind) => (
                  <tr key={ind.id} className="align-top">
                    <th scope="row" className="p-2 font-medium">
                      {b.name}
                      <div className="font-normal text-slate-500">{ind.name}{!ind.onRing && ' (supplementary)'}</div>
                    </th>
                    <td className="p-2">{ind.controlVariable}</td>
                    <td className="p-2 whitespace-nowrap">{boundaryDisplay(ind)}<div><Cite id={ind.boundarySource} /></div></td>
                    <td className="p-2 whitespace-nowrap">{uncertaintyDisplay(ind)}</td>
                    <td className="p-2 whitespace-nowrap font-semibold">{ind.display ?? fmt(ind.currentValue, ind.unit)} <span className="font-normal text-slate-500">({ind.year})</span></td>
                    <td className="p-2"><StatusChip status={ind.status} short /></td>
                    <td className="p-2"><Cite id={ind.source} /></td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Methods</h2>
        <p>
          <strong>Radial scale.</strong> Each control variable is mapped onto a piecewise scale: the pre-industrial value sits
          at the centre, the boundary at the dashed circle (1), and the upper end of the zone of uncertainty at the outer
          edge of the orange band (2). Beyond that the scale continues linearly — one “uncertainty-zone width” per step —
          until the edge of the diagram, after which wedges fade out, as in <Cite id="richardson2023" />. Extinction rate
          uses a logarithmic scale; for variables where lower is worse (ozone, forest cover, aragonite saturation) the
          scale is inverted.
        </p>
        <p>
          <strong>Status.</strong> Status is recomputed from the value: below the boundary → safe; within the uncertainty
          zone → increasing risk; beyond it → high risk. Biosphere integrity, freshwater change and biogeochemical flows
          are split into sub-wedges; climate change shows CO₂ concentration on the ring, with radiative forcing (and global
          P flow for biogeochemical flows) shown in the detail panel.
        </p>
        <p>
          <strong>Timeline.</strong> Values between anchor years are linearly interpolated. CO₂ uses the Law Dome ice core
          for 1950 and the NOAA Mauna Loa record from 1959. Most other trajectories are <em>approximate</em>{' '}
          reconstructions between published anchor points and exist to support the animation — they are labelled as such
          wherever they appear. Values after the latest observation move toward a 2050 scenario (SSP2-4.5 for
          CO₂ and forcing; otherwise an illustrative continuation of the current trend). Novel entities appear as “not
          quantified” before 2022, when <Cite id="persson2022" /> first quantified that boundary.
        </p>
        <p>
          <strong>Ocean acidification.</strong> Uses the Planetary Health Check 2025 revision: pre-industrial Ωarag 3.57,
          boundary 2.86 (80%), current ≈2.84. The upper end of the uncertainty zone (2.50, 70% of pre-industrial) follows
          the convention of <Cite id="richardson2023" />.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Live data</h2>
        <ul className="space-y-2">
          <li className="flex flex-wrap items-center gap-2">
            <strong>Atmospheric CO₂</strong> — NOAA GML Mauna Loa annual means, cached for 24 h. Updates the climate wedge.
            <LiveBadge s={live.co2} />
          </li>
          <li className="flex flex-wrap items-center gap-2">
            <strong>Temperature anomaly</strong> — NASA GISTEMP v4 (proxied in development because GISS sends no CORS
            headers). Context in the climate panel. <LiveBadge s={live.temperature} />
          </li>
          <li className="flex flex-wrap items-center gap-2">
            <strong>Tree-cover loss</strong> — Global Forest Watch Data API (requires <code>VITE_GFW_API_KEY</code>).
            Context in the land-system panel. <LiveBadge s={live.treeCoverLoss} />
          </li>
        </ul>
        <p>If any request fails, the app uses the bundled snapshot or the value in <code>boundaries.json</code>.</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">References</h2>
        <ol className="list-decimal space-y-2 pl-5">
          {Object.entries(data.sources)
            .filter(([id]) => id !== 'illustrative')
            .map(([id, s]) => (
              <li key={id}>
                {s.full}{' '}
                {s.url && (
                  <a className="text-sky-700 underline dark:text-sky-300" href={s.url} target="_blank" rel="noreferrer">
                    {s.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </li>
            ))}
        </ol>
      </section>
    </article>
  );
}
