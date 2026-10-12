import type { Status, Theme } from './types';

/**
 * Explicit colours (not CSS classes) are used inside the SVG so the exported
 * PNG/SVG renders identically outside the app.
 */
export interface Palette {
  bg: string;
  text: string;
  muted: string;
  line: string;
  boundary: string;
  core: [string, string];
  zoneSafe: string;
  zoneRisk: [string, string];
  zoneHigh: [string, string];
  nq: string;
  nqStroke: string;
  chartGrid: string;
}

export const PALETTES: Record<Theme, Palette> = {
  dark: {
    bg: '#0a1228',
    text: '#e6ebf5',
    muted: '#93a0bd',
    line: '#4b5a80',
    boundary: '#ffffff',
    core: ['#3b82c4', '#123a6b'],
    zoneSafe: '#12382a',
    zoneRisk: ['#4a4214', '#4d2a12'],
    zoneHigh: ['#4a1820', '#341634'],
    nq: '#5b6478',
    nqStroke: '#8a93a8',
    chartGrid: '#22305a',
  },
  light: {
    bg: '#ffffff',
    text: '#0f172a',
    muted: '#56627a',
    line: '#9aa5bd',
    boundary: '#0f172a',
    core: ['#6fb3e8', '#1f5d9c'],
    zoneSafe: '#d6efdf',
    zoneRisk: ['#fbf0c4', '#fbdcc0'],
    zoneHigh: ['#f6cdcf', '#ecd2e6'],
    nq: '#c3c8d2',
    nqStroke: '#8a93a8',
    chartGrid: '#e2e6ee',
  },
};

/** Wedge fill stops shared by both themes (radial, from centre outward). */
export const WEDGE = {
  safe: '#2fa863',
  yellow: '#f4c430',
  orange: '#f08a24',
  red: '#d7263d',
  purple: '#8e2a7c',
  deep: '#5a1a5e',
};

export const STATUS_COLOR: Record<Status, string> = {
  safe: WEDGE.safe,
  'increasing-risk': WEDGE.orange,
  'high-risk': WEDGE.red,
  'not-quantified': '#8a93a8',
};
