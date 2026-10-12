import { Popover } from './Popover';
import { Cite } from './Cite';

export function HowToRead() {
  return (
    <Popover
      ariaLabel="How to read this diagram"
      width="w-96"
      label={
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <span className="hidden whitespace-nowrap sm:inline">How to read this</span>
        </>
      }
    >
      {() => (
        <div className="space-y-2 leading-relaxed text-slate-700 dark:text-slate-200">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">How to read this</h2>
          <p>
            Each of the nine wedges is one planetary boundary. Its length shows the current value of the
            boundary’s <strong>control variable</strong> relative to where the boundary is set.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Green centre</strong> — the safe operating space for humanity.</li>
            <li><strong>Dashed circle</strong> — the planetary boundary itself.</li>
            <li><strong>Yellow → orange band</strong> — the zone of increasing risk (scientific uncertainty).</li>
            <li><strong>Red → purple</strong> — high risk, beyond the uncertainty zone. Wedges that fade out run off the scale.</li>
            <li><strong>Grey hatching</strong> — not quantified for that year.</li>
          </ul>
          <p>
            Split wedges show sub-indicators (e.g. genetic and functional biosphere integrity). Hover or focus a wedge for
            numbers, click for details, and drag the timeline to see change since 1950 and a 2050 scenario.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scaling follows <Cite id="richardson2023" />; values updated with <Cite id="phc2025" />.
          </p>
        </div>
      )}
    </Popover>
  );
}
