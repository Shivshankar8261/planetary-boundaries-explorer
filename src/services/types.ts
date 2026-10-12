import type { Point } from '../lib/types';

export type LiveState = 'loading' | 'live' | 'cached' | 'fallback' | 'unavailable';

export interface LiveSeries {
  state: LiveState;
  series: Point[];
  latest: Point | null;
  sourceId: string;
  fetchedAt?: number;
  error?: string;
  note?: string;
}

export const emptySeries = (sourceId: string): LiveSeries => ({
  state: 'loading',
  series: [],
  latest: null,
  sourceId,
});
