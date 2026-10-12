import type { StatusFilter } from '../lib/types';

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'safe', label: 'Safe' },
  { value: 'transgressed', label: 'Transgressed' },
];

export function StatusFilterToggle({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) {
  return (
    <div role="radiogroup" aria-label="Show boundaries by status" className="inline-flex rounded-lg bg-slate-200/70 p-1 dark:bg-navy-800">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition ${
            value === o.value
              ? 'bg-white text-slate-900 shadow dark:bg-navy-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
