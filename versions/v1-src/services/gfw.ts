import { cached, DAY, fetchText } from './http';
import type { LiveSeries } from './types';

const KEY = import.meta.env.VITE_GFW_API_KEY as string | undefined;
const BASE = 'https://data-api.globalforestwatch.org/dataset/gadm__tcl__iso_change/latest/query';
const SQL =
  'SELECT umd_tree_cover_loss__year AS year, SUM(umd_tree_cover_loss__ha) AS loss ' +
  'FROM data WHERE umd_tree_cover_density_2000__threshold = 30 GROUP BY umd_tree_cover_loss__year ' +
  'ORDER BY umd_tree_cover_loss__year';

/**
 * Global annual tree-cover loss (Mha, ≥30% canopy) from the Global Forest Watch
 * Data API. The API requires a key (VITE_GFW_API_KEY); without one, the app
 * reports the series as unavailable and the land-system wedge keeps using the
 * value in boundaries.json.
 */
export async function getTreeCoverLoss(): Promise<LiveSeries> {
  if (!KEY) {
    return {
      state: 'unavailable',
      series: [],
      latest: null,
      sourceId: 'gfw',
      note: 'Set VITE_GFW_API_KEY to load annual tree-cover loss from Global Forest Watch.',
    };
  }
  try {
    const res = await cached('gfw-tcl-global', 7 * DAY, async () => {
      const text = await fetchText(`${BASE}?sql=${encodeURIComponent(SQL)}`, {
        headers: { 'x-api-key': KEY },
      });
      const json = JSON.parse(text) as { data?: { year: number; loss: number }[] };
      const series = (json.data ?? [])
        .filter((r) => r.year && r.loss)
        .map((r) => ({ year: Number(r.year), value: Number(r.loss) / 1e6 }));
      if (!series.length) throw new Error('Empty GFW response');
      return series;
    });
    return {
      state: res.fromCache ? 'cached' : 'live',
      series: res.data,
      latest: res.data.at(-1) ?? null,
      sourceId: 'gfw',
      fetchedAt: res.fetchedAt,
    };
  } catch (e) {
    return {
      state: 'unavailable',
      series: [],
      latest: null,
      sourceId: 'gfw',
      error: (e as Error).message,
      note: 'Global Forest Watch request failed; showing the bundled forest-cover value.',
    };
  }
}
