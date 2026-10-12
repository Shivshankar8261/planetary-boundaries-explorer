/** Minimal 24×24 stroke icons, usable inside the SVG diagram and in HTML. */
const PATHS: Record<string, string> = {
  thermometer: 'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z M11.5 9v8',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3 M7.5 15h9',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
  cloud: 'M7 17h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 8.5 4.25 4.25 0 0 0 7 17z M8 20h.01 M12 20h.01 M16 20h.01',
  wave: 'M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0 M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0 M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  leafDrop: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15z M5 19l8-8',
  droplet: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  tree: 'M12 3l6 8h-3l4 6H5l4-6H6z M12 17v4',
  bird: 'M16 7h.01 M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20 M20 7l2 .5-2 .5 M10 18v3 M14 17.75V21 M7 18a6 6 0 0 0 3.84-10.61',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  /** Render as a bare <g> for embedding in an existing SVG. */
  inline?: boolean;
  x?: number;
  y?: number;
  strokeWidth?: number;
}

export function BoundaryIcon({ name, size = 18, color = 'currentColor', inline, x = 0, y = 0, strokeWidth = 1.8 }: Props) {
  const path = (
    <path
      d={PATHS[name] ?? PATHS.droplet}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  if (inline) {
    const s = size / 24;
    return (
      <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`} aria-hidden="true">
        {path}
      </g>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {path}
    </svg>
  );
}
