import raw from './boundaries.json';
import type { BoundaryData, Source } from '../lib/types';

export const DATA = raw as unknown as BoundaryData;

export const source = (id: string): Source =>
  DATA.sources[id] ?? { short: id, full: id, url: '' };
