import { useState, type RefObject } from 'react';
import { Popover } from './Popover';
import { exportPng, exportSvg } from '../lib/export';

export function ExportMenu({ svgRef, year }: { svgRef: RefObject<SVGSVGElement>; year: number }) {
  const [error, setError] = useState<string | null>(null);
  const run = async (kind: 'png' | 'svg', close: () => void) => {
    const svg = svgRef.current;
    if (!svg) return;
    setError(null);
    try {
      if (kind === 'svg') exportSvg(svg, `planetary-boundaries-${year}.svg`);
      else await exportPng(svg, `planetary-boundaries-${year}.png`);
      close();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Popover
      ariaLabel="Export diagram"
      width="w-56"
      label={
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="hidden sm:inline">Export</span>
        </>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          <button type="button" className="menu-item" onClick={() => run('png', close)}>Download PNG (2×)</button>
          <button type="button" className="menu-item" onClick={() => run('svg', close)}>Download SVG</button>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      )}
    </Popover>
  );
}
