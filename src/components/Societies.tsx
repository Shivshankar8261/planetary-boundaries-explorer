import { Cite } from './Cite';
import type { Boundary } from '../lib/types';

/** Case studies of how climate risk lands on different societies (from the user's LSE essay). */
export function Societies({ climate }: { climate: Boundary }) {
  return (
    <div>
      <div className="grid gap-10 md:grid-cols-3">
        {climate.societies?.map((s, i) => (
          <article key={s.place} className="border-l border-slate-300 pl-6 dark:border-white/15">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Case {i + 1}</p>
            <h3 className="mt-1 text-3xl font-light">{s.place}</h3>
            <p className="mt-3 font-light leading-relaxed text-slate-600 dark:text-slate-300">{s.text}</p>
            <p className="mt-3 text-xs"><Cite id={s.source} /></p>
          </article>
        ))}
      </div>
      <blockquote className="mt-16 max-w-3xl text-2xl font-light leading-snug sm:text-3xl">
        “Economically weaker societies tend to suffer similar climate risks in greater intensity, and it affects a large section of their societies.”
        <footer className="mt-3 text-sm text-slate-500 dark:text-slate-400">— <Cite id="yadav2020" /></footer>
      </blockquote>
    </div>
  );
}
