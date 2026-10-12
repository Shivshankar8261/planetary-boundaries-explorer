import snapshot from '../data/liveSnapshot.json';
import { cached, DAY, fetchText } from './http';
import type { LiveSeries } from './types';
import type { Point } from '../lib/types';

const URL = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv';

/** Parse NOAA GML's annual-mean CSV ("year,mean,unc" with # comment lines). */
export function parseNoaaAnnual(csv: string): Point[] {
  return csv
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && /^\d{4},/.test(l))
    .map((l) => {
      const [y, v] = l.split(',');
      return { year: Number(y), value: Number(v) };
    })
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
}

/** Annual-mean CO₂ at Mauna Loa (NOAA GML), falling back to the bundled snapshot. */
export async function getCO2(): Promise<LiveSeries> {
  try {
    const res = await cached('noaa-co2-annual', DAY, async () => {
      const series = parseNoaaAnnual(await fetchText(URL));
      if (series.length < 10) throw new Error('Unexpected NOAA response');
      return series;
    });
    return {
      state: res.fromCache ? 'cached' : 'live',
      series: res.data,
      latest: res.data.at(-1) ?? null,
      sourceId: 'noaa-gml',
      fetchedAt: res.fetchedAt,
    };
  } catch (e) {
    const series = snapshot.co2.series;
    return {
      state: 'fallback',
      series,
      latest: series.at(-1) ?? null,
      sourceId: 'noaa-gml',
      error: (e as Error).message,
      note: `Bundled snapshot retrieved ${snapshot.co2.retrieved}`,
    };
  }
}
