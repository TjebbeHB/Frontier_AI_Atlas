import type { Entry } from './governance';
export const dimensions = [
  'Geography',
  'Governance layer',
  'Actor type',
  'Time horizon',
  'Power',
];
export function groupFor(n: Entry, dimension: string): string {
  if (dimension === 'Geography') {
    if (['United States', 'Canada'].includes(n.region)) return 'US / Canada';
    if (['China', 'Asia-Pacific'].includes(n.region))
      return 'China / Asia-Pacific';
    if (n.region === 'Africa') return 'International';
    return n.region;
  }
  if (dimension === 'Governance layer') return n.layer;
  if (dimension === 'Actor type') return n.type;
  if (dimension === 'Time horizon') return n.horizons[0];
  return n.power;
}
export function buildNetworkLayout(entries: Entry[], dimension: string) {
  const present = Array.from(
    new Set(entries.map((n) => groupFor(n, dimension))),
  );
  const preferred =
    dimension === 'Geography'
      ? [
          'US / Canada',
          'United Kingdom',
          'European Union',
          'China / Asia-Pacific',
          'International',
          'Latin America',
          'Middle East',
        ]
      : dimension === 'Governance layer'
        ? ['Legal', 'Institutional', 'Voluntary', 'Corporate']
        : [];
  const groups = [
    ...preferred,
    ...present.filter((g) => !preferred.includes(g)),
  ].filter((g) => present.includes(g));
  const positions: Record<string, { x: number; y: number }> = {};
  const rows = groups.map((g, i) => {
    const groupEntries = entries.filter((n) => groupFor(n, dimension) === g);
    groupEntries.forEach((n, j) => {
      positions[n.id] = { x: i * 194 + 20, y: 64 + j * 86 };
    });
    return groupEntries.length;
  });
  return {
    groups,
    positions,
    width: Math.max(790, groups.length * 194 + 12),
    height: Math.max(535, ...rows.map((r) => r * 86 + 84)),
  };
}
