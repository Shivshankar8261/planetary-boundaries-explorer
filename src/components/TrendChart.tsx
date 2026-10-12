import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { observedSeries, scenarioSeries, YEAR_MAX, YEAR_MIN } from '../lib/timeline';
import { fmt } from '../lib/format';
import { WEDGE, type Palette } from '../lib/palette';
import type { Indicator, Point } from '../lib/types';

interface Props {
  indicator: Indicator;
  year: number;
  palette: Palette;
}

/** History + scenario for one control variable, with boundary and uncertainty zone shaded. */
export function TrendChart({ indicator: ind, year, palette }: Props) {
  const obs = observedSeries(ind);
  const scen = scenarioSeries(ind);
  const rows = new Map<number, { year: number; observed?: number; scenario?: number }>();
  obs.forEach((p) => rows.set(p.year, { year: p.year, observed: p.value }));
  scen.forEach((p) => rows.set(p.year, { ...(rows.get(p.year) ?? { year: p.year }), scenario: p.value }));
  const data = [...rows.values()].sort((a, b) => a.year - b.year);

  const upper = ind.uncertaintyUpper ?? ind.boundaryValue;
  const values = [ind.boundaryValue, upper, ...obs.map((p) => p.value), ...scen.map((p) => p.value)];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const padding = (hi - lo) * 0.12 || 1;
  const log = ind.scale === 'log';
  const domain: [number, number] = log ? [1, 1000] : [lo - padding, hi + padding];
  const lowerWorse = ind.direction === 'lower-worse';
  const edge = lowerWorse ? domain[0] : domain[1];

  return (
    <div className="h-48 w-full" role="img" aria-label={`Trend of ${ind.controlVariable} from ${YEAR_MIN} to ${YEAR_MAX}`}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            type="number"
            domain={[YEAR_MIN, YEAR_MAX]}
            ticks={[1950, 1975, 2000, 2025, 2050]}
            stroke={palette.muted}
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            domain={domain}
            scale={log ? 'log' : 'auto'}
            allowDataOverflow
            stroke={palette.muted}
            fontSize={11}
            width={48}
            tickLine={false}
            tickFormatter={(v: number) => fmt(v)}
          />
          <ReferenceArea y1={ind.boundaryValue} y2={upper} fill={WEDGE.orange} fillOpacity={0.15} ifOverflow="hidden" />
          <ReferenceArea y1={upper} y2={edge} fill={WEDGE.red} fillOpacity={0.12} ifOverflow="hidden" />
          <ReferenceLine
            y={ind.boundaryValue}
            stroke={palette.boundary}
            strokeDasharray="6 4"
            label={{ value: 'Boundary', position: 'insideTopLeft', fill: palette.muted, fontSize: 10 }}
          />
          <ReferenceLine x={year} stroke={WEDGE.yellow} strokeWidth={1.5} />
          <Tooltip
            contentStyle={{ background: palette.bg, border: `1px solid ${palette.line}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: palette.text }}
            formatter={(v: number, name: string) => [fmt(v, ind.unit), name === 'observed' ? 'Observed' : 'Scenario']}
          />
          <Line type="monotone" dataKey="observed" stroke={palette.text} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
          <Line type="linear" dataKey="scenario" stroke={WEDGE.orange} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Simple line chart for supplementary live series (temperature, tree-cover loss). */
export function SeriesChart({ series, unit, palette, color = WEDGE.red }: { series: Point[]; unit: string; palette: Palette; color?: string }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <ComposedChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" />
          <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke={palette.muted} fontSize={11} tickLine={false} />
          <YAxis stroke={palette.muted} fontSize={11} width={40} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
          <ReferenceLine y={0} stroke={palette.line} />
          <Tooltip
            contentStyle={{ background: palette.bg, border: `1px solid ${palette.line}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: palette.text }}
            formatter={(v: number) => [fmt(v, unit), '']}
          />
          <Line dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
