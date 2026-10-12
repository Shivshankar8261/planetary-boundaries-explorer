import { AnimatePresence, motion } from 'framer-motion';
import { StatusChip } from './StatusChip';
import { boundaryDisplay, currentDisplay, uncertaintyDisplay } from '../lib/format';
import { source } from '../data';
import type { Evaluated } from '../lib/types';

interface Props {
  ev: Evaluated | null;
  pos: { x: number; y: number } | null;
  year: number;
}

export function Tooltip({ ev, pos, year }: Props) {
  const flipX = pos ? pos.x > window.innerWidth - 320 : false;
  const flipY = pos ? pos.y > window.innerHeight - 260 : false;
  return (
    <AnimatePresence>
      {ev && pos && (
        <motion.div
          key="tt"
          role="tooltip"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="pointer-events-none fixed z-50 w-72 rounded-xl border border-slate-200 bg-white/95 p-3 text-sm shadow-xl backdrop-blur dark:border-navy-700 dark:bg-navy-900/95"
          style={{
            left: flipX ? pos.x - 300 : pos.x + 16,
            top: flipY ? pos.y - 240 : pos.y + 16,
          }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{ev.boundary.name}</div>
          <div className="mb-1 font-semibold text-slate-900 dark:text-white">{ev.indicator.name}</div>
          <div className="mb-2 text-xs text-slate-600 dark:text-slate-300">{ev.indicator.controlVariable}</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-500 dark:text-slate-400">Boundary</dt>
            <dd className="font-medium">{boundaryDisplay(ev.indicator)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">Uncertainty</dt>
            <dd className="font-medium">{uncertaintyDisplay(ev.indicator)}</dd>
            <dt className="text-slate-500 dark:text-slate-400">{ev.isScenario ? `Scenario ${year}` : `Value ${year}`}</dt>
            <dd className="font-semibold">{currentDisplay(ev)}</dd>
          </dl>
          <div className="mt-2 flex items-center justify-between gap-2">
            <StatusChip status={ev.status} short />
            <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {source(ev.isScenario ? ev.indicator.scenarioSource : ev.indicator.source).short}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Click for details</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
