import { useEffect, useRef } from 'react';
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';

const land = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection);
const graticule = geoGraticule10();

interface Props {
  /** Degrees per second; 0 disables rotation. */
  speed?: number;
  className?: string;
}

/**
 * Slowly rotating orthographic Earth drawn on canvas (Natural Earth land via world-atlas),
 * wrapped in the planetary-boundary rings. Decorative.
 */
export function EarthGlobe({ speed = 5, className = '' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let size = 0;
    let lambda = -20;
    let last = performance.now();
    const projection = geoOrthographic().clipAngle(90).precision(0.4);
    const path = geoPath(projection, ctx);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const c = size / 2;
      const r = size * 0.3;
      ctx.clearRect(0, 0, size, size);

      // Planetary-boundary rings: high-risk haze, uncertainty band, dashed boundary.
      const haze = ctx.createRadialGradient(c, c, r * 1.25, c, c, r * 1.62);
      haze.addColorStop(0, 'rgba(215,38,61,0.0)');
      haze.addColorStop(0.5, 'rgba(215,38,61,0.10)');
      haze.addColorStop(1, 'rgba(142,42,124,0)');
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(c, c, r * 1.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(244,196,48,0.28)';
      ctx.beginPath();
      ctx.arc(c, c, r * 1.42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -lambda * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(c, c, r * 1.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Atmosphere
      const atmo = ctx.createRadialGradient(c, c, r * 0.98, c, c, r * 1.16);
      atmo.addColorStop(0, 'rgba(90,170,255,0.55)');
      atmo.addColorStop(1, 'rgba(90,170,255,0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(c, c, r * 1.16, 0, Math.PI * 2);
      ctx.fill();

      // Ocean
      const ocean = ctx.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
      ocean.addColorStop(0, '#1d4e86');
      ocean.addColorStop(0.7, '#0b2547');
      ocean.addColorStop(1, '#06142a');
      projection.translate([c, c]).scale(r).rotate([lambda, -18]);
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(160,200,255,0.10)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Land
      const landFill = ctx.createLinearGradient(c - r, c - r, c + r, c + r);
      landFill.addColorStop(0, '#5fd08f');
      landFill.addColorStop(1, '#1f7a4c');
      ctx.beginPath();
      path(land);
      ctx.fillStyle = landFill;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(200,255,220,0.35)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Terminator shading for depth
      const shade = ctx.createRadialGradient(c - r * 0.45, c - r * 0.45, r * 0.2, c, c, r * 1.05);
      shade.addColorStop(0, 'rgba(255,255,255,0.08)');
      shade.addColorStop(0.6, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,10,0.55)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (t: number) => {
      lambda += ((t - last) / 1000) * speed;
      last = t;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    if (speed > 0) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [speed]);

  return <canvas ref={ref} className={`aspect-square ${className}`} aria-hidden="true" />;
}
