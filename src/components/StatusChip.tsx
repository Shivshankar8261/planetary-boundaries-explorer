import { STATUS_LABEL } from '../lib/scale';
import type { Status } from '../lib/types';

const STYLE: Record<Status, string> = {
  safe: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300',
  'increasing-risk': 'bg-amber-500/15 text-amber-800 ring-amber-500/40 dark:text-amber-300',
  'high-risk': 'bg-rose-500/15 text-rose-700 ring-rose-500/40 dark:text-rose-300',
  'not-quantified': 'bg-slate-500/15 text-slate-600 ring-slate-500/40 dark:text-slate-300',
};
// Shape glyphs carry the status without relying on colour.
const GLYPH: Record<Status, string> = {
  safe: '●',
  'increasing-risk': '▲',
  'high-risk': '◆',
  'not-quantified': '?',
};

export function StatusChip({ status, short }: { status: Status; short?: boolean }) {
  const text = short
    ? { safe: 'Safe', 'increasing-risk': 'Increasing risk', 'high-risk': 'High risk', 'not-quantified': 'Not quantified' }[status]
    : STATUS_LABEL[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STYLE[status]}`}>
      <span aria-hidden="true">{GLYPH[status]}</span>
      {text}
    </span>
  );
}
