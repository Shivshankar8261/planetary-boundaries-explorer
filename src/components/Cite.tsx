import { source } from '../data';

/** Inline citation link for a source id from boundaries.json. */
export function Cite({ id, prefix = '' }: { id: string; prefix?: string }) {
  const s = source(id);
  const cls = 'text-sky-700 underline decoration-dotted underline-offset-2 hover:text-sky-500 dark:text-sky-300';
  return s.url ? (
    <a href={s.url} target="_blank" rel="noreferrer" className={cls} title={s.full}>
      {prefix}
      {s.short}
    </a>
  ) : (
    <span className="italic" title={s.full}>
      {prefix}
      {s.short}
    </span>
  );
}
