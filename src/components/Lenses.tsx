const ICONS = {
  eye: <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  triangle: <path d="M12 3l9.5 17h-19z M12 9v5 M12 17h.01" />,
  diamond: <path d="M12 2l10 10-10 10L2 12z M12 7l5 5-5 5-5-5z" />,
};

interface Props {
  onExplore: () => void;
  onTour: () => void;
  onSocieties: () => void;
}

export function Lenses({ onExplore, onTour, onSocieties }: Props) {
  const items = [
    { icon: 'eye', verb: 'Seeing', title: <>Planetary <strong className="font-semibold">awareness</strong></>, text: 'One diagram, nine processes. See at a glance where humanity is inside the safe operating space and where it has stepped outside.', cta: 'Explore the diagram', onClick: onExplore },
    { icon: 'triangle', verb: 'Witnessing', title: <>Planetary <strong className="font-semibold">emergency</strong></>, text: 'Follow seventy-five years of change since 1950 and a 2050 scenario. A guided tour walks through what the latest science found.', cta: 'Start the tour', onClick: onTour },
    { icon: 'diamond', verb: 'Caring', title: <>Planetary <strong className="font-semibold">stewardship</strong></>, text: 'Crossing a boundary is not abstract. Explore how risks reach economies, coasts, food systems and the people most exposed.', cta: 'Consequences for societies', onClick: onSocieties },
  ] as const;
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
      {items.map((it) => (
        <article key={it.verb}>
          <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-300">
            {ICONS[it.icon]}
          </svg>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{it.verb}</p>
          <h3 className="mt-1 text-2xl font-light">{it.title}</h3>
          <p className="mt-3 font-light leading-relaxed text-slate-600 dark:text-slate-300">{it.text}</p>
          <button type="button" onClick={it.onClick} className="mt-4 text-sm font-semibold underline-offset-4 hover:underline">
            {it.cta} →
          </button>
        </article>
      ))}
    </div>
  );
}
