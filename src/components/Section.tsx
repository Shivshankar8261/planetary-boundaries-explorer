import type { ReactNode } from 'react';

interface Props {
  id: string;
  intro: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

/** One idea per section: a small intro line, a large light heading with a short rule, then content. */
export function Section({ id, intro, title, lead, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 border-t border-slate-200/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm text-slate-500 dark:text-slate-400">{intro}</p>
        <h2 id={`${id}-h`} className="mt-2 max-w-3xl text-3xl font-light leading-tight tracking-tight sm:text-5xl">
          {title}
        </h2>
        <div className="mt-5 h-px w-16 bg-slate-900 dark:bg-white" aria-hidden="true" />
        {lead && <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-slate-600 dark:text-slate-300">{lead}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
