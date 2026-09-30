/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG controls also have HTML actor buttons. */
'use client';
import countries from '@/lib/world-countries.json';
import { project, connectionCurve } from '@/lib/geography';
import type { Actor, Stage } from '@/lib/scenario/data';

// Label offsets are display callouts, always connected to the geographic anchor.
export const scenarioLocations: Record<
  string,
  { coordinates: [number, number]; city: string; label: [number, number] }[]
> = {
  eu: [
    {
      coordinates: [4.35, 50.85],
      city: 'Brussels · EU institutions',
      label: [710, 200],
    },
  ],
  compact: [
    {
      coordinates: [4.35, 50.85],
      city: 'Brussels · hypothetical headquarters',
      label: [705, 65],
    },
  ],
  uk: [{ coordinates: [-0.12, 51.51], city: 'London', label: [500, 90] }],
  canada: [{ coordinates: [-75.7, 45.42], city: 'Ottawa', label: [310, 70] }],
  japan: [{ coordinates: [139.69, 35.68], city: 'Tokyo', label: [1105, 240] }],
  korea: [{ coordinates: [126.98, 37.57], city: 'Seoul', label: [985, 100] }],
  australia: [
    { coordinates: [149.13, -35.28], city: 'Canberra', label: [1060, 445] },
  ],
  usgov: [
    { coordinates: [-77.04, 38.9], city: 'Washington, DC', label: [415, 300] },
  ],
  china: [
    {
      coordinates: [116.41, 39.9],
      city: 'Beijing · China representative anchor',
      label: [890, 275],
    },
  ],
  usstates: [
    {
      coordinates: [-121.49, 38.58],
      city: 'Sacramento · California example',
      label: [145, 245],
    },
    {
      coordinates: [-73.75, 42.65],
      city: 'Albany · New York example',
      label: [340, 215],
    },
  ],
};
export default function ScenarioMap({
  actors,
  stage,
  actorId,
  onActor,
  cooperative,
  colors,
}: {
  actors: Actor[];
  stage: Stage;
  actorId: string;
  onActor: (id: string) => void;
  cooperative: boolean;
  colors: Record<string, string>;
}) {
  // Composite labs, evaluators, clouds and affected publics do not have one HQ.
  const distributed = actors.filter(
    (a) => !scenarioLocations[a.id] || (cooperative && a.id === 'china'),
  );
  const points = actors.flatMap((a) => {
    const locations =
      cooperative && a.id === 'china' ? undefined : scenarioLocations[a.id];
    if (locations)
      return locations.map((l, i) => ({
        actor: a,
        key: `${a.id}-${i}`,
        ...project(l.coordinates),
        lx: l.label[0],
        ly: l.label[1],
        city: l.city,
        geographic: true,
      }));
    const x =
      100 +
      distributed.indexOf(a) * (1000 / Math.max(1, distributed.length - 1));
    return [
      {
        actor: a,
        key: a.id,
        x,
        y: 595,
        lx: x,
        ly: 595,
        city: 'Cross-border composite · not a geographic pin',
        geographic: false,
      },
    ];
  });
  return (
    <div className="scenario-map-wrap">
      <svg
        viewBox="0 0 1200 650"
        className="scenario-geo-map"
        role="group"
        aria-label="Scenario interactions on a world map"
      >
        <defs>
          {Object.entries(colors).map(([k, c]) => (
            <marker
              key={k}
              id={`scenario-map-arrow-${k}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10z" fill={c} />
            </marker>
          ))}
        </defs>
        <rect width="1200" height="650" fill="#111e39" />
        <g aria-hidden="true">
          {countries.map((c) => (
            <path
              key={c.name}
              d={c.path}
              fill="#263952"
              stroke="#41516b"
              strokeWidth=".7"
            />
          ))}
        </g>
        <rect x="0" y="515" width="1200" height="135" fill="#182943" />
        <text x="25" y="542" className="scenario-lane-label">
          CROSS-BORDER ACTORS · THIS STRIP HAS NO GEOGRAPHIC LOCATION
        </text>
        {stage.interactions.flatMap((e, i) => {
          const starts = points.filter((p) => p.actor.id === e.from),
            ends = points.filter((p) => p.actor.id === e.to);
          return starts.flatMap((a) =>
            ends.map((b) => {
              const from = { x: a.lx, y: a.ly },
                to = { x: b.lx, y: b.ly };
              const length = Math.hypot(to.x - from.x, to.y - from.y);
              const radius = Math.min(
                88 / Math.max(0.001, Math.abs(to.x - from.x) / length),
                20 / Math.max(0.001, Math.abs(to.y - from.y) / length),
              );
              return (
                <path
                  key={`${i}-${a.key}-${b.key}`}
                  d={connectionCurve(from, to, radius, radius)}
                  stroke={colors[e.kind]}
                  markerEnd={`url(#scenario-map-arrow-${e.kind})`}
                  className={`scenario-edge ${e.from === actorId || e.to === actorId ? 'focused' : ''}`}
                >
                  <title>{`${a.actor.short} → ${b.actor.short}: ${e.label}`}</title>
                </path>
              );
            }),
          );
        })}
        {points.map((p) => {
          const active = stage.interactions.some(
            (e) => e.from === p.actor.id || e.to === p.actor.id,
          );
          const name =
            p.actor.id === 'usstates'
              ? p.key.endsWith('-0')
                ? 'California · example'
                : 'New York · example'
              : p.actor.short;
          return (
            <g
              key={p.key}
              className={`scenario-map-actor ${active ? 'active' : ''} ${actorId === p.actor.id ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Read ${p.actor.name} response — ${p.city}`}
              aria-pressed={actorId === p.actor.id}
              onClick={() => onActor(p.actor.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActor(p.actor.id);
                }
              }}
            >
              <title>{`${p.actor.name} — ${p.city}`}</title>
              {p.geographic && (
                <>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.lx}
                    y2={p.ly}
                    stroke="#9bafce"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={active ? 7 : 5}
                    fill={p.actor.group === 'member' ? '#77d6c2' : '#bdc6ff'}
                    stroke="#111e39"
                    strokeWidth="2"
                  />
                </>
              )}
              <rect
                x={p.lx - 88}
                y={p.ly - 20}
                width="176"
                height="40"
                rx="8"
              />
              <text x={p.lx} y={p.ly + 4} textAnchor="middle">
                {name}
              </text>
            </g>
          );
        })}
        <text x="25" y="496" fill="#a3b5cf" fontSize="11">
          Representative government seats; fictional HQ in Brussels. Boundaries:
          Natural Earth.
        </text>
      </svg>
    </div>
  );
}
