/** Guided-tour steps. Each step sets the year and highlights boundaries on the ring. */
export interface StoryStep {
  title: string;
  kicker: string;
  body: string;
  year: number | 'today';
  highlight: string[] | null;
  source: string;
}

export const STORY: StoryStep[] = [
  {
    kicker: 'The framework',
    title: 'A safe operating space for humanity',
    body: 'Nine processes regulate the stability of the Earth system. The green centre is the space in which humanity has thrived during the Holocene; the dashed circle marks each planetary boundary.',
    year: 'today',
    highlight: null,
    source: 'rockstrom2009',
  },
  {
    kicker: '1950',
    title: 'Before the Great Acceleration',
    body: 'In 1950 most boundaries were still within the safe space. Land-system change, freshwater and biosphere integrity had already started to be pushed by centuries of land clearing.',
    year: 1950,
    highlight: null,
    source: 'steffen2015',
  },
  {
    kicker: 'Core boundary',
    title: 'Climate change',
    body: 'CO₂ has risen from 311 ppm in 1950 to over 427 ppm, deep into the zone of increasing risk. Total radiative forcing is nearly three times its boundary.',
    year: 'today',
    highlight: ['climate'],
    source: 'noaa-gml',
  },
  {
    kicker: 'Core boundary',
    title: 'Biosphere integrity',
    body: 'Both genetic diversity (extinction rates over 100 per million species-years) and functional integrity (30% of the biosphere’s productivity appropriated) are in the high-risk zone.',
    year: 'today',
    highlight: ['biosphere'],
    source: 'richardson2023',
  },
  {
    kicker: 'Newly crossed · 2025',
    title: 'Ocean acidification',
    body: 'With a revised pre-industrial baseline, the Planetary Health Check 2025 found the surface ocean’s aragonite saturation has dropped below its boundary — the seventh of nine to be transgressed.',
    year: 'today',
    highlight: ['ocean'],
    source: 'phc2025',
  },
  {
    kicker: 'High risk',
    title: 'Fertilisers and novel entities',
    body: 'Nitrogen and phosphorus flows far exceed safe levels, and synthetic chemicals and plastics are released faster than they can be tested.',
    year: 'today',
    highlight: ['biogeochemical', 'novel-entities'],
    source: 'richardson2023',
  },
  {
    kicker: 'A success story',
    title: 'The ozone layer is recovering',
    body: 'Global cooperation under the 1987 Montreal Protocol phased out ozone-depleting substances. Stratospheric ozone is back within its boundary and on course to recover by mid-century.',
    year: 'today',
    highlight: ['ozone', 'aerosols'],
    source: 'wmo2022',
  },
  {
    kicker: 'Looking ahead',
    title: '2050 on a middle-of-the-road path',
    body: 'Under SSP2-4.5 and current trends, every transgressed boundary moves further out. The outline shows today for comparison. Whether wedges shrink back depends on choices made this decade.',
    year: 2050,
    highlight: null,
    source: 'meinshausen2020',
  },
];
