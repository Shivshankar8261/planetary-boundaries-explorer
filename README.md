# Planetary Boundaries — interactive visualisation

An interactive, accessible web version of the nine-planetary-boundaries diagram
(Rockström et al. 2009 · Steffen et al. 2015 · Richardson et al. 2023), updated with
the **Planetary Health Check 2025** and live NOAA CO₂ data.

Built with React 18, Vite, TypeScript, Tailwind CSS, d3-shape/d3-scale, Framer Motion and Recharts.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build in dist/
npm run preview    # serve the production build
```

Requires Node 18+.

### Optional: Global Forest Watch

The GFW Data API needs a free key. Copy `.env.example` to `.env.local` and set:

```
VITE_GFW_API_KEY=your-key
```

Without it, the land-system panel says the feed is not connected and uses the value in `boundaries.json`.

## Design

The page is a single scrolling story with a dark, cinematic look (inspired by globaia.org):

1. **Hero** — a slowly rotating Earth (Natural Earth land via `world-atlas`, drawn with `d3-geo`), surrounded by the boundary rings, with a live headline and key numbers (boundaries transgressed, CO₂, warming, latest change).
2. **Three lenses** — Seeing / Witnessing / Caring, each linking into the page.
3. **The diagram** — the interactive ring with curved labels, a status rim, an outline for comparing years, a timeline and a guided tour.
4. **The nine boundaries** — a card grid; each card's thumbnail is a mini ring with that boundary lit.
5. **Consequences for societies** — Fiji, India and USA case studies.
6. **Pathways** and a footer with year and CO₂ readouts.

The first version is kept in `versions/v1-src/` for reference.

## Features

- A 9 × 40° radial diagram with green (safe), yellow→orange (increasing risk) and red→purple
  (high risk) zones. The boundary is a dashed circle, wedges that run off the scale fade out,
  and boundaries that weren't quantified are drawn as grey hatched wedges.
- Sub-wedges for biosphere integrity (genetic/functional), freshwater (blue/green) and biogeochemical flows (N/P).
- On load the rings fade in, then the wedges grow outward one after another. Hovering a wedge
  enlarges it, dims the others and shows a tooltip. Clicking opens a side panel with a
  description, trend chart, key drivers, and consequences for societies.
- A timeline slider runs from 1950 to today and on to a 2050 scenario, with a play button.
- A status filter: All / Safe / Transgressed, and "Compare with" to draw another year's outline over the wedges.
- A guided tour in 8 steps that moves the timeline and spotlights boundaries (← → keys, Esc to exit).
- Live data, each with a cache and a fallback: NOAA GML CO₂, NASA GISTEMP temperature, and Global Forest Watch tree-cover loss.
- PNG and SVG export. The exported image includes a source caption.
- Dark navy and light themes, a "How to read this" popover, and a Sources & methods page (`#sources`).
- Responsive: on small screens the ring is simplified (icons only) and a list view is the main view.
- Accessible: wedges can be reached with Tab and opened with Enter or Space, and have ARIA labels.
  Status is also shown by hatching and by shape glyphs (● ▲ ◆ ?), not colour alone.
  `prefers-reduced-motion` is respected.

## Structure

```
src/
  App.tsx                    layout, state (year, filter, hover, selection, theme)
  components/
    PlanetaryRing.tsx        SVG diagram: zones, gradients, patterns, labels, leader lines
    Wedge.tsx                one animated (sub-)wedge
    DetailPanel.tsx          slide-in panel with charts, drivers, consequences
    TrendChart.tsx           Recharts trend + supplementary series charts
    TimelineSlider.tsx       1950 → 2050 slider with play/pause
    Legend.tsx, HowToRead.tsx, ExportMenu.tsx, WedgeList.tsx, SourcesPage.tsx, …
  services/                  http (timeout + memory/localStorage cache), noaa, gistemp, gfw
  hooks/                     useLiveData (+ merge into dataset), useTheme, useMediaQuery
  lib/                       scale (value → radius), timeline (interpolation), export, palette, types
  data/
    boundaries.json          all boundary values, sources, drivers, consequences
    liveSnapshot.json        offline fallback for NOAA and GISTEMP (retrieved 2026-10-12)
```

### Data model (`src/data/boundaries.json`)

Each boundary has one or more `indicators`:

| field | meaning |
|---|---|
| `id`, `name`, `controlVariable`, `unit` | identification |
| `preindustrial`, `boundaryValue`, `uncertaintyUpper` | scale anchors |
| `currentValue`, `year`, `status`, `source` | latest published value and its citation |
| `direction` | `higher-worse` or `lower-worse` |
| `scale` | `linear`, `log` or `qualitative` |
| `onRing` | drawn as a wedge, or shown only in the detail panel |
| `history`, `historySource`, `historyApprox` | timeline anchor points |
| `scenario2050`, `scenarioSource` | 2050 end point |

Every source id points to a full citation in `sources`. The UI shows a citation link next to every number.

## Method notes

- **Radial scale**: pre-industrial → centre, boundary → dashed circle, upper end of the
  uncertainty zone → outer edge of the orange band. Beyond that the scale continues at one
  uncertainty-zone width per step to the edge of the diagram, then fades (after Richardson et al. 2023, Fig. 1).
- **Status** is recomputed from the value at each year.
- **Today** shows the published baseline values. Other years are linearly interpolated.
  CO₂ history is observed: Law Dome for 1950, then NOAA Mauna Loa from 1959. **Most other
  trajectories are approximate reconstructions between published anchor points, there to
  drive the animation.** The UI labels them as approximate. The 2050 values are SSP2-4.5 for
  CO₂ and forcing, and an illustrative continuation of the trend for everything else.
- **Ocean acidification** follows the 2025 Planetary Health Check revision: pre-industrial Ωarag 3.57,
  boundary 2.86, current ≈2.84, so it is transgressed for the first time.
- **NASA GISTEMP** sends no CORS headers. It is proxied through Vite in development. In a static
  production deployment the app falls back to the bundled snapshot unless you add a similar
  proxy (for example a Vercel/Netlify rewrite from `/proxy/gistemp/*` to
  `https://data.giss.nasa.gov/gistemp/tabledata_v4/*`).

## Data citations

- Richardson, K., et al. (2023). Earth beyond six of nine planetary boundaries. *Science Advances* 9(37), eadh2458. https://doi.org/10.1126/sciadv.adh2458
- Sakschewski, B., Caesar, L., et al. (2025). *Planetary Health Check 2025*. PIK. https://www.planetaryhealthcheck.org
- Steffen, W., et al. (2015). Planetary boundaries: Guiding human development on a changing planet. *Science* 347, 1259855.
- Rockström, J., et al. (2009). A safe operating space for humanity. *Nature* 461, 472–475.
- NOAA GML — Mauna Loa CO₂ annual mean. https://gml.noaa.gov/ccgg/trends/
- MacFarling Meure, C., et al. (2006). Law Dome CO₂ record. *GRL* 33, L14810.
- GISTEMP Team — GISS Surface Temperature Analysis v4. https://data.giss.nasa.gov/gistemp/
- Hansen, M. C., et al. (2013). Global forest change. *Science* 342, 850–853 / Global Forest Watch.
- Forster, P. M., et al. (2023). Indicators of Global Climate Change 2022. *ESSD* 15, 2295–2327.
- Persson, L., et al. (2022). Novel entities boundary. *ES&T* 56, 1510–1521.
- Wang-Erlandsson, L., et al. (2022). Green water boundary. *Nat. Rev. Earth Environ.* 3, 380–392.
- Porkka, M., et al. (2024). Freshwater change boundary. *Nature Water* 2, 262–273.
- Krausmann, F., et al. (2013). HANPP doubled in the 20th century. *PNAS* 110, 10324–10329.
- Meinshausen, M., et al. (2020). SSP greenhouse-gas concentrations. *GMD* 13, 3571–3605.
- WMO (2022). Scientific Assessment of Ozone Depletion: 2022.
- Yadav, M. K. (2020). *Planetary Boundaries as Planetary Risks: Consequences for Societies.* LSE (the Fiji / India / USA case studies in the climate panel).

Visual design after the Stockholm Resilience Centre planetary-boundaries figures (credit: Azote for SRC / Richardson et al. 2023).
