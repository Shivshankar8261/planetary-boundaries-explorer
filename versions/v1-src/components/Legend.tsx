import { WEDGE } from '../lib/palette';

function Swatch({ fill, pattern }: { fill: string; pattern?: 'risk' | 'high' | 'nq' }) {
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true" className="shrink-0 rounded-sm">
      <defs>
        <pattern id={`lg-${pattern}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={`rotate(${pattern === 'nq' ? -45 : 45})`}>
          <line x1="0" y1="0" x2="0" y2="6" stroke={pattern === 'nq' ? '#8a93a8' : '#fff'} strokeOpacity={pattern === 'nq' ? 1 : 0.5} strokeWidth="1.6" />
          {pattern === 'high' && <line x1="0" y1="0" x2="6" y2="0" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" />}
        </pattern>
      </defs>
      <rect width="28" height="16" fill={fill} />
      {pattern && <rect width="28" height="16" fill={`url(#lg-${pattern})`} />}
    </svg>
  );
}

export function Legend() {
  return (
    <section aria-labelledby="legend-h" className="card">
      <h2 id="legend-h" className="card-title">Legend</h2>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-3"><Swatch fill={WEDGE.safe} />Below boundary — safe operating space</li>
        <li className="flex items-center gap-3">
          <Swatch fill={`${WEDGE.orange}`} pattern="risk" />Zone of increasing risk (uncertainty zone)
        </li>
        <li className="flex items-center gap-3">
          <Swatch fill={WEDGE.purple} pattern="high" />High risk, beyond the zone of uncertainty
        </li>
        <li className="flex items-center gap-3"><Swatch fill="#c3c8d2" pattern="nq" />Boundary not yet quantified</li>
        <li className="flex items-center gap-3">
          <svg width="28" height="16" aria-hidden="true"><line x1="0" y1="8" x2="28" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" /></svg>
          Planetary boundary
        </li>
        <li className="flex items-center gap-3">
          <svg width="28" height="16" aria-hidden="true"><defs><linearGradient id="lg-fade"><stop offset="0" stopColor={WEDGE.deep} /><stop offset="1" stopColor={WEDGE.deep} stopOpacity="0" /></linearGradient></defs><rect width="28" height="16" fill="url(#lg-fade)" /></svg>
          Off the scale (fades past the edge)
        </li>
      </ul>
    </section>
  );
}
