import { useEffect, useMemo, useState } from 'react';
import { getCO2, getTemperature, getTreeCoverLoss, type LiveSeries } from '../services';
import { emptySeries } from '../services/types';
import { normalise, statusFromN } from '../lib/scale';
import type { BoundaryData } from '../lib/types';

export interface LiveData {
  co2: LiveSeries;
  temperature: LiveSeries;
  treeCoverLoss: LiveSeries;
}

export function useLiveData(): LiveData {
  const [co2, setCo2] = useState<LiveSeries>(emptySeries('noaa-gml'));
  const [temperature, setTemp] = useState<LiveSeries>(emptySeries('nasa-gistemp'));
  const [treeCoverLoss, setTcl] = useState<LiveSeries>(emptySeries('gfw'));

  useEffect(() => {
    let alive = true;
    getCO2().then((r) => alive && setCo2(r));
    getTemperature().then((r) => alive && setTemp(r));
    getTreeCoverLoss().then((r) => alive && setTcl(r));
    return () => {
      alive = false;
    };
  }, []);

  return { co2, temperature, treeCoverLoss };
}

/** Return a copy of the dataset with live CO₂ observations merged in. */
export function useMergedData(base: BoundaryData, live: LiveData): BoundaryData {
  return useMemo(() => {
    const { co2 } = live;
    if (!co2.latest || co2.state === 'loading') return base;
    return {
      ...base,
      boundaries: base.boundaries.map((b) => ({
        ...b,
        indicators: b.indicators.map((ind) => {
          if (ind.id !== 'climate-co2') return ind;
          // Keep pre-Mauna Loa values (Law Dome ice core) and append the NOAA record.
          const firstNoaa = co2.series[0]?.year ?? Infinity;
          const history = [...ind.history.filter((p) => p.year < firstNoaa), ...co2.series];
          const updated = {
            ...ind,
            history,
            currentValue: co2.latest!.value,
            year: co2.latest!.year,
            source: 'noaa-gml',
          };
          return { ...updated, status: statusFromN(normalise(updated, updated.currentValue).n) };
        }),
      })),
    };
  }, [base, live]);
}
