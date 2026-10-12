import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STORY } from '../data/story';
import { Cite } from './Cite';

interface Props {
  index: number;
  onChange: (i: number) => void;
  onExit: () => void;
}

/** Card that steps through the guided tour; App applies each step's year and highlight. */
export function StoryTour({ index, onChange, onExit }: Props) {
  const step = STORY[index];
  const last = index === STORY.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !last) onChange(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1);
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, last, onChange, onExit]);

  return (
    <motion.section
      role="region"
      aria-label="Guided tour"
      aria-live="polite"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="glass-strong rounded-2xl p-5 shadow-2xl"
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
        {STORY.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => onChange(i)}
            className={`h-1.5 flex-1 rounded-full transition ${i <= index ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-navy-700'}`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            {index + 1} / {STORY.length} · {step.kicker}
          </p>
          <h2 className="mt-1 text-2xl font-light leading-tight sm:text-3xl">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{step.body}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Source: <Cite id={step.source} /></p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" className="btn" onClick={onExit}>Exit tour</button>
        <span className="ml-auto" />
        <button type="button" className="btn" disabled={index === 0} onClick={() => onChange(index - 1)} aria-label="Previous step">←</button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => (last ? onExit() : onChange(index + 1))}
        >
          {last ? 'Explore freely' : 'Next →'}
        </button>
      </div>
    </motion.section>
  );
}
