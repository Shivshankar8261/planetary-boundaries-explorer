import { useEffect, useRef, useState } from 'react';
import { YEAR_MAX, YEAR_MIN } from '../lib/timeline';

interface Props {
  year: number;
  todayYear: number;
  onChange: (year: number) => void;
  reducedMotion: boolean;
}

const TICKS = [1950, 1975, 2000, 2025, 2050];

export function TimelineSlider({ year, todayYear, onChange, reducedMotion }: Props) {
  const [playing, setPlaying] = useState(false);
  const yearRef = useRef(year);
  yearRef.current = year;

  useEffect(() => {
    if (!playing) return;
    if (yearRef.current >= YEAR_MAX) onChange(YEAR_MIN);
    const id = setInterval(
      () => {
        const next = yearRef.current + (reducedMotion ? 5 : 1);
        if (next >= YEAR_MAX) {
          onChange(YEAR_MAX);
          setPlaying(false);
        } else onChange(next);
      },
      reducedMotion ? 600 : 90,
    );
    return () => clearInterval(id);
  }, [playing, reducedMotion, onChange]);

  const pct = (y: number) => ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const scenario = year > todayYear;

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="btn"
          aria-label={playing ? 'Pause timeline animation' : 'Play timeline from 1950 to 2050'}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9.5-5.5z" fill="currentColor" /></svg>
          )}
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>
        <button type="button" className="btn" onClick={() => { setPlaying(false); onChange(todayYear); }}>
          Today
        </button>
        <span className="ml-auto text-sm tabular-nums">
          <span className="font-semibold">{year}</span>{' '}
          <span className={scenario ? 'text-amber-600 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'}>
            {scenario ? '· 2050 scenario (SSP2-4.5 / illustrative)' : '· observed / reconstructed'}
          </span>
        </span>
      </div>
      <div className="relative pt-1">
        {/* scenario shading */}
        <div
          className="pointer-events-none absolute top-[11px] h-1.5 rounded-r-full bg-amber-400/30"
          style={{ left: `${pct(todayYear)}%`, right: 0 }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          value={year}
          onChange={(e) => { setPlaying(false); onChange(Number(e.target.value)); }}
          aria-label="Year"
          aria-valuetext={`${year}${scenario ? ', scenario' : ''}`}
          className="timeline-range w-full"
        />
        <div className="relative mt-1 h-4 text-[11px] text-slate-500 dark:text-slate-400" aria-hidden="true">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pct(t)}%` }}>
              {t === todayYear ? 'Today' : t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
