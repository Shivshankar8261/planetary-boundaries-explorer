export type Status = 'safe' | 'increasing-risk' | 'high-risk' | 'not-quantified';
export type StatusFilter = 'all' | 'safe' | 'transgressed';
export type Theme = 'dark' | 'light';

export interface Source {
  short: string;
  full: string;
  url: string;
}

export interface Point {
  year: number;
  value: number;
}

export interface Indicator {
  id: string;
  name: string;
  controlVariable: string;
  unit: string;
  direction: 'higher-worse' | 'lower-worse';
  scale: 'linear' | 'log' | 'qualitative';
  onRing: boolean;
  preindustrial: number;
  boundaryValue: number;
  uncertaintyUpper: number | null;
  boundarySource: string;
  currentValue: number | null;
  display?: string;
  status: Status;
  source: string;
  year: number;
  quantifiedSince?: number;
  history: Point[];
  historySource: string;
  historyApprox: boolean;
  historyNote?: string;
  scenario2050: number | null;
  scenarioSource: string;
}

export interface Cited {
  text: string;
  source: string;
}

export interface Boundary {
  id: string;
  name: string;
  labelLines: string[];
  icon: string;
  sublabel?: string;
  description: string;
  drivers: string[];
  consequences: Cited[];
  societies?: { place: string; text: string; source: string }[];
  indicators: Indicator[];
}

export interface BoundaryData {
  meta: { title: string; baseline: string; lastReviewed: string; todayYear: number };
  sources: Record<string, Source>;
  boundaries: Boundary[];
}

/** An indicator evaluated at a given year. */
export interface Evaluated {
  indicator: Indicator;
  boundary: Boundary;
  value: number | null;
  /** Position on the normalised scale: 0 = pre-industrial, 1 = boundary, 2 = upper end of uncertainty zone. */
  n: number | null;
  offScale: boolean;
  status: Status;
  isScenario: boolean;
}
