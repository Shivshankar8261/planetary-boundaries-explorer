import { useMemo } from 'react';

/** Static, seeded star field for the dark theme (purely decorative). */
export function Starfield() {
  const stars = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({ length: 160 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: rnd() * 1.1 + 0.2, o: rnd() * 0.5 + 0.15 }));
  }, []);
  return (
    <svg className="pointer-events-none fixed inset-0 -z-10 hidden h-full w-full dark:block" aria-hidden="true" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#cfe0ff" opacity={s.o} />
      ))}
    </svg>
  );
}
