import snapshot from '../data/liveSnapshot.json';
import { cached, DAY, fetchText } from './http';
import type { LiveSeries } from './types';
import type { Point } from '../lib/types';

// NASA GISS does not send CORS headers: in dev Vite proxies /proxy/gistemp
// (see vite.config.ts). Elsewhere we try the direct URL, which usually fails in
// browsers, and then fall back to the bundled snapshot.
const URLS = [
  '/proxy/gistemp/GLB.Ts+dSST.csv',
  'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv',
];

/** Parse GISTEMP's GLB.Ts+dSST.csv and return complete annual (J-D) means. */
export function parseGistemp(csv: string): Point[] {
  const lines = csv.split('\n');
  const headerIdx = lines.findIndex((l) => l.startsWith('Year,'));
  if (headerIdx < 0) throw new Error('GISTEMP header not found');
  const cols = lines[headerIdx].split(',');
  const jd = cols.indexOf('J-D');
  return lines
    .slice(headerIdx + 1)
    .map((l) => l.split(','))
    .filter((c) => /^\d{4}$/.test(c[0]) && c[jd] && c[jd] !== '***')
    .map((c) => ({ year: Number(c[0]), value: Number(c[jd]) }));
}

/** Global surface temperature anomaly vs 1951–1980 (°C). */
export async function getTemperature(): Promise<LiveSeries> {
  let lastError = '';
  for (const url of URLS) {
    try {
      const res = await cached('gistemp-annual', DAY, async () => {
        const series = parseGistemp(await fetchText(url, {}, 8000)).filter((p) => p.year >= 1950);
        if (series.length < 10) throw new Error('Unexpected GISTEMP response');
        return series;
      });
      return {
        state: res.fromCache ? 'cached' : 'live',
        series: res.data,
        latest: res.data.at(-1) ?? null,
        sourceId: 'nasa-gistemp',
        fetchedAt: res.fetchedAt,
      };
    } catch (e) {
      lastError = (e as Error).message;
    }
  }
  const series = snapshot.gistemp.series;
  return {
    state: 'fallback',
    series,
    latest: series.at(-1) ?? null,
    sourceId: 'nasa-gistemp',
    error: lastError,
    note: `Bundled snapshot retrieved ${snapshot.gistemp.retrieved}`,
  };
}
