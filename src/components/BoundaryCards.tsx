import { arc } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { motion } from 'framer-motion';
import { BoundaryIcon } from './Icons';
import { StatusChip } from './StatusChip';
import { N_MAX, worstStatus } from '../lib/scale';
import { currentDisplay, transgressionText } from '../lib/format';
import { WEDGE } from '../lib/palette';
import type { RingRow } from './PlanetaryRing';

const r = scaleLinear().domain([0, 1, 2, N_MAX]).range([10, 42, 62, 92]).clamp(true);
const arcGen = arc<{ innerRadius: number; outerRadius: number; startAngle: number; endAngle: number }>().cornerRadius(1);
const DEG = Math.PI / 180;

/** Miniature of the full ring with this boundary lit and the others as faint context. */
function MiniRing({ rows, focus }: { rows: RingRow[]; focus: string }) {
  return (
    <svg viewBox="-110 -110 220 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="mini-grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="92">
          <stop offset="0" stopColor={WEDGE.safe} />
          <stop offset={42 / 92} stopColor={WEDGE.safe} />
          <stop offset={42 / 92 + 0.01} stopColor={WEDGE.yellow} />
          <stop offset={62 / 92} stopColor={WEDGE.red} />
          <stop offset="1" stopColor={WEDGE.purple} />
        </radialGradient>
      </defs>
      <circle r="92" fill="#1a1030" opacity="0.6" />
      <circle r="62" fill="#2a2410" opacity="0.7" />
      <circle r="42" fill="#0f2e22" />
      {rows.map((row, i) => {
        const k = row.ring.length;
        const start = i * 40 - 20 + 1.5;
        const w = (37 - 1 * (k - 1)) / k;
        const lit = row.boundary.id === focus;
        return row.ring.map((ev, j) => {
          const a0 = (start + j * (w + 1)) * DEG;
          const nq = ev.n == null;
          return (
            <path
              key={ev.indicator.id}
              d={arcGen({ innerRadius: 10, outerRadius: nq ? 42 : r(ev.n!), startAngle: a0, endAngle: a0 + w * DEG }) ?? ''}
              fill={nq ? '#5b6478' : 'url(#mini-grad)'}
              opacity={lit ? 1 : 0.16}
            />
          );
        });
      })}
      <circle r="42" fill="none" stroke="#fff" strokeDasharray="3 3" strokeWidth="1" opacity="0.8" />
      <circle r="9" fill="#2a6fb0" />
    </svg>
  );
}

export function BoundaryCards({ rows, onSelect, reducedMotion }: { rows: RingRow[]; onSelect: (id: string) => void; reducedMotion: boolean }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, i) => {
        const status = worstStatus(row.ring.map((e) => e.status));
        const lead = row.ring[0];
        return (
          <motion.li
            key={row.boundary.id}
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => onSelect(row.boundary.id)}
              className="group block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#0e1a38,#03060f)]">
                <div className="absolute inset-0 p-3 transition duration-500 group-hover:scale-105">
                  <MiniRing rows={rows} focus={row.boundary.id} />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur">
                  <BoundaryIcon name={row.boundary.icon} size={18} />
                </span>
                <span className="absolute right-3 top-3"><StatusChip status={status} short /></span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-light">
                  {row.boundary.name.split(' ').map((w, k) => (k === 0 ? <strong key={k} className="font-semibold">{w} </strong> : `${w} `))}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {row.ring.map((ev) => `${ev.indicator.name}: ${currentDisplay(ev)}`).join(' · ')}
                </p>
                {lead && transgressionText(lead) && <p className="mt-2 text-sm font-medium">{transgressionText(lead)}</p>}
                <span className="mt-3 inline-block text-sm font-semibold underline-offset-4 group-hover:underline">Explore →</span>
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
