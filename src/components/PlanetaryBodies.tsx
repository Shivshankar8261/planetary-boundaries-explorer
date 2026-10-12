import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cite } from './Cite';
import { Section } from './Section';
import { fmt } from '../lib/format';
import type { LiveData } from '../hooks/useLiveData';

interface Body {
  id: string;
  name: string;
  kind: string;
  radiusKm: number;
  distanceAu: number;
  /** Mean surface temperature, °C. */
  tempC: number;
  tempNote?: string;
  /** Surface pressure, bar. */
  pressureBar: number;
  atmosphere: string;
  water: string;
  /** CSS sphere gradient. */
  gradient: string;
  verdict: string;
  lesson: string;
  boundaries: string[];
  source: string;
}

const BODIES: Body[] = [
  {
    id: 'mercury', name: 'Mercury', kind: 'Planet', radiusKm: 2440, distanceAu: 0.39, tempC: 167,
    tempNote: '−173 °C at night to 427 °C by day', pressureBar: 0, atmosphere: 'Thin exosphere (O, Na, H, He)',
    water: 'Ice only in permanently shadowed polar craters',
    gradient: 'radial-gradient(circle at 32% 30%, #d6d1cb, #8f8a85 45%, #3d3a38 100%)',
    verdict: 'No atmosphere to hold heat',
    lesson: 'Without an atmosphere there is no greenhouse blanket and no buffer: a 600 °C swing between day and night. Earth’s thin air is what makes its climate stable enough to live in.',
    boundaries: ['climate', 'ozone'], source: 'nasa-factsheet',
  },
  {
    id: 'venus', name: 'Venus', kind: 'Planet', radiusKm: 6052, distanceAu: 0.72, tempC: 464, pressureBar: 92,
    atmosphere: '96.5% CO₂, 3.5% N₂, sulphuric-acid clouds', water: 'Almost none: lost in a runaway greenhouse',
    gradient: 'radial-gradient(circle at 32% 30%, #fbe7b5, #e0b25c 45%, #8a5a1c 100%)',
    verdict: 'A runaway greenhouse',
    lesson: 'Venus is Earth’s near-twin in size, but a CO₂ atmosphere 92 times denser than ours traps so much heat that lead would melt on its surface. It is the extreme end of the climate-change boundary.',
    boundaries: ['climate', 'aerosols'], source: 'nasa-factsheet',
  },
  {
    id: 'earth', name: 'Earth', kind: 'Planet', radiusKm: 6371, distanceAu: 1, tempC: 15, pressureBar: 1.01,
    atmosphere: '78% N₂, 21% O₂, CO₂ {co2} ppm', water: 'Liquid oceans cover 71% of the surface',
    gradient: 'radial-gradient(circle at 32% 30%, #bfe6ff, #2f7fd0 42%, #1f6b3f 62%, #0a2140 100%)',
    verdict: 'The only known living world',
    lesson: 'For 10,000 years the Holocene kept Earth in a narrow, stable band of temperature and chemistry. The nine planetary boundaries describe the limits of that safe operating space, and seven are now crossed.',
    boundaries: ['climate', 'novel-entities', 'ozone', 'aerosols', 'ocean', 'biogeochemical', 'freshwater', 'land', 'biosphere'],
    source: 'nasa-factsheet',
  },
  {
    id: 'moon', name: 'Moon', kind: 'Moon of Earth', radiusKm: 1737, distanceAu: 1, tempC: -20,
    tempNote: '−173 °C at night to 127 °C by day', pressureBar: 0, atmosphere: 'Practically none (exosphere)',
    water: 'Ice in shadowed polar craters',
    gradient: 'radial-gradient(circle at 32% 30%, #f1f1ef, #a9a8a4 45%, #4a4946 100%)',
    verdict: 'Same sunlight, no biosphere',
    lesson: 'The Moon gets the same sunlight as Earth, yet has no air, no liquid water and no life. Living systems (the biosphere-integrity boundary) are what turn a rock into a habitable planet.',
    boundaries: ['biosphere', 'land'], source: 'nasa-factsheet',
  },
  {
    id: 'mars', name: 'Mars', kind: 'Planet', radiusKm: 3390, distanceAu: 1.52, tempC: -65, pressureBar: 0.006,
    atmosphere: '95% CO₂, 2.8% N₂, 2% Ar (very thin)', water: 'Polar ice caps and buried ice; ancient river valleys',
    gradient: 'radial-gradient(circle at 32% 30%, #f6b48f, #c1532d 45%, #4f1c10 100%)',
    verdict: 'A world that lost its water',
    lesson: 'Mars once had rivers and lakes. It lost most of its atmosphere, and with it its liquid water. It shows that a planet’s habitability is not permanent, which is why the freshwater boundary matters.',
    boundaries: ['freshwater', 'climate'], source: 'nasa-factsheet',
  },
  {
    id: 'titan', name: 'Titan', kind: 'Moon of Saturn', radiusKm: 2575, distanceAu: 9.5, tempC: -179, pressureBar: 1.5,
    atmosphere: '~95% N₂, ~5% CH₄, orange organic haze', water: 'Water-ice crust; lakes of liquid methane and ethane',
    gradient: 'radial-gradient(circle at 32% 30%, #ffd89a, #d08b2c 45%, #5c3410 100%)',
    verdict: 'Rain and seas, but of methane',
    lesson: 'Titan has weather, rivers and seas, but its chemistry runs on methane at −179 °C. Earth’s life depends on a very particular chemical balance, which is why novel entities and nutrient flows count as boundaries.',
    boundaries: ['novel-entities', 'biogeochemical'], source: 'nasa-titan',
  },
];

const BOUNDARY_NAMES: Record<string, string> = {
  climate: 'Climate change', 'novel-entities': 'Novel entities', ozone: 'Ozone depletion', aerosols: 'Aerosol loading',
  ocean: 'Ocean acidification', biogeochemical: 'Biogeochemical flows', freshwater: 'Freshwater change',
  land: 'Land-system change', biosphere: 'Biosphere integrity',
};

const T_MIN = -200;
const T_MAX = 500;
const tPct = (t: number) => ((t - T_MIN) / (T_MAX - T_MIN)) * 100;

const pressureText = (p: number) => (p === 0 ? '≈ 0' : p < 0.1 ? `${p} bar` : `${fmt(p)} bar`);

interface Props {
  live: LiveData;
  reducedMotion: boolean;
  onBoundary: (id: string) => void;
  onHome: () => void;
}

/** Subpage: Earth compared with its neighbours, to show what the boundaries protect. */
export function PlanetaryBodies({ live, reducedMotion, onBoundary, onHome }: Props) {
  const [selectedId, setSelectedId] = useState('earth');
  const body = BODIES.find((b) => b.id === selectedId)!;
  const co2 = live.co2.latest ? fmt(live.co2.latest.value) : '≈ 427';
  const maxR = Math.max(...BODIES.map((b) => b.radiusKm));

  return (
    <>
      <section aria-labelledby="bodies-h" className="dark relative isolate -mt-[64px] overflow-hidden bg-[#03060f] pt-[64px] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }} className="hover:text-white hover:underline">Home</a>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-slate-200">Planetary Bodies</span>
          </nav>
          <p className="mb-5 mt-8 text-xs font-medium uppercase tracking-[0.3em] text-emerald-300/90">Planetary Bodies</p>
          <h1 id="bodies-h" className="max-w-3xl text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl">
            One <strong className="font-semibold text-emerald-300">living planet</strong> among its neighbours
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-300">
            Venus overheated, Mars dried out, the Moon never held air. Comparing Earth with the bodies around it shows
            what the nine planetary boundaries protect: a narrow, stable state that is rare in the solar system.
          </p>

          {/* Body picker: sphere size is proportional to radius. */}
          <div role="radiogroup" aria-label="Choose a planetary body" className="mt-12 flex flex-wrap items-end gap-x-6 gap-y-8 sm:gap-x-10">
            {BODIES.map((b) => {
              const size = 28 + 76 * (b.radiusKm / maxR);
              const on = b.id === selectedId;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelectedId(b.id)}
                  className="group flex flex-col items-center gap-3 rounded-xl p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <motion.span
                    aria-hidden="true"
                    className="block rounded-full"
                    style={{
                      width: size, height: size, background: b.gradient,
                      boxShadow: on ? '0 0 0 2px #6ee7b7, 0 0 36px rgba(110,231,183,.35)' : '0 0 24px rgba(255,255,255,.06)',
                    }}
                    animate={reducedMotion ? undefined : { scale: on ? 1.08 : 1 }}
                    whileHover={reducedMotion ? undefined : { scale: 1.12 }}
                  />
                  <span className={`text-xs uppercase tracking-[0.2em] transition ${on ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{b.name}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={body.id}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-10 grid gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:grid-cols-[1.1fr_1fr] md:p-8"
              aria-live="polite"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{body.kind}</p>
                <h2 className="mt-1 text-3xl font-light">{body.name}: <strong className="font-semibold">{body.verdict}</strong></h2>
                <p className="mt-4 font-light leading-relaxed text-slate-300">{body.lesson}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {body.id === 'earth' ? 'All nine boundaries' : 'Related boundaries on Earth'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {body.boundaries.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onBoundary(id)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-emerald-300 hover:bg-white/10"
                    >
                      {BOUNDARY_NAMES[id]} →
                    </button>
                  ))}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start text-sm">
                <Stat label="Mean surface temp." value={`${body.tempC > 0 ? '+' : ''}${body.tempC} °C`} note={body.tempNote} />
                <Stat label="Surface pressure" value={pressureText(body.pressureBar)} />
                <Stat label="Radius" value={`${body.radiusKm.toLocaleString('en')} km`} note={`${fmt(body.radiusKm / 6371)} × Earth`} />
                <Stat label="Distance from Sun" value={`${body.distanceAu} AU`} />
                <Stat label="Atmosphere" value={body.atmosphere.replace('{co2}', co2)} wide />
                <Stat label="Water" value={body.water} wide />
                <p className="col-span-2 text-[11px] text-slate-500">Source: <Cite id={body.source} />{body.id === 'earth' && <> · CO₂ <Cite id="noaa-gml" /></>}</p>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Section
        id="bodies-temperature"
        intro="A narrow window"
        title={<>Liquid water needs a <strong className="font-semibold">narrow band</strong> of temperature</>}
        lead="Mean surface temperatures across the six bodies span more than 600 °C. Earth sits inside the small range where water stays liquid, and the climate boundary is about keeping it close to the Holocene average."
      >
        <TemperatureScale selectedId={selectedId} onSelect={setSelectedId} />
      </Section>

      <Section
        id="bodies-compare"
        intro="Side by side"
        title={<>Six bodies, <strong className="font-semibold">one living world</strong></>}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Comparison of planetary bodies</caption>
            <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <tr>
                <th scope="col" className="p-3">Body</th>
                <th scope="col" className="p-3">Mean temp.</th>
                <th scope="col" className="p-3">Pressure</th>
                <th scope="col" className="p-3">Atmosphere</th>
                <th scope="col" className="p-3">Water</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {BODIES.map((b) => (
                <tr key={b.id} className={b.id === 'earth' ? 'bg-emerald-50 dark:bg-emerald-400/5' : undefined}>
                  <th scope="row" className="p-3 font-medium">
                    <button type="button" onClick={() => { setSelectedId(b.id); window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); }} className="flex items-center gap-2 hover:underline">
                      <span aria-hidden="true" className="inline-block h-4 w-4 rounded-full" style={{ background: b.gradient }} />
                      {b.name}
                    </button>
                  </th>
                  <td className="p-3 tabular-nums">{b.tempC > 0 ? '+' : ''}{b.tempC} °C</td>
                  <td className="p-3 tabular-nums">{pressureText(b.pressureBar)}</td>
                  <td className="p-3">{b.atmosphere.replace('{co2}', co2)}</td>
                  <td className="p-3">{b.water}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Values: <Cite id="nasa-factsheet" />, <Cite id="nasa-titan" />. Lunar mean temperature is approximate.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={onHome} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-100">
            ← Back to the planetary boundaries
          </button>
          <a href="#explore" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10">
            Explore the diagram
          </a>
        </div>
      </Section>
    </>
  );
}

function Stat({ label, value, note, wide }: { label: string; value: string; note?: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-light leading-snug">{value}</dd>
      {note && <dd className="text-xs text-slate-500">{note}</dd>}
    </div>
  );
}

function TemperatureScale({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const ticks = [-200, -100, 0, 100, 200, 300, 400, 500];
  const sorted = [...BODIES].sort((a, b) => a.tempC - b.tempC);
  return (
    <figure>
      <div className="overflow-x-auto">
      <div className="relative mx-10 h-[196px] min-w-[600px]" role="img" aria-label={`Mean surface temperatures: ${sorted.map((b) => `${b.name} ${b.tempC} °C`).join(', ')}. Liquid water at 1 bar: 0 to 100 °C.`}>
        <div
          className="absolute top-[88px] h-3 rounded-full bg-sky-400/25 ring-1 ring-sky-400/50"
          style={{ left: `${tPct(0)}%`, width: `${tPct(100) - tPct(0)}%` }}
        />
        <span className="absolute top-[172px] -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-sky-700 dark:text-sky-300" style={{ left: `${tPct(50)}%` }}>
          liquid water (0–100 °C)
        </span>
        <div className="absolute inset-x-0 top-[93px] h-px bg-gradient-to-r from-sky-500 via-emerald-500 to-rose-500 opacity-60" />
        {sorted.map((b, i) => {
          const on = b.id === selectedId;
          const up = i % 2 === 0;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              aria-hidden="true"
              tabIndex={-1}
              className="absolute flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${tPct(b.tempC)}%`, top: up ? 6 : 84 }}
            >
              {!up && <span className="h-6 w-px bg-slate-400 dark:bg-slate-500" />}
              <span
                className="block h-5 w-5 rounded-full"
                style={{ background: b.gradient, boxShadow: on ? '0 0 0 2px #10b981' : undefined }}
              />
              <span className={`mt-1 whitespace-nowrap text-[11px] ${on ? 'font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                {b.name} {b.tempC > 0 ? '+' : ''}{b.tempC}°
              </span>
              {up && <span className="h-[44px] w-px bg-slate-400 dark:bg-slate-500" />}
            </button>
          );
        })}
        <div className="absolute inset-x-0 top-[150px]">
          {ticks.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 text-[10px] tabular-nums text-slate-500" style={{ left: `${tPct(t)}%` }}>
              {t}°C
            </span>
          ))}
        </div>
      </div>
      </div>
      <figcaption className="mt-4 max-w-2xl text-sm font-light text-slate-600 dark:text-slate-300">
        Earth’s average has already risen about 1.3 °C since pre-industrial times. On this scale it is a hair’s width,
        but it is enough to push the climate boundary into the high-risk zone.
      </figcaption>
    </figure>
  );
}
