/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG controls have keyboard handlers and an equivalent HTML actor list. */
/* oxlint-disable next/no-img-element -- Small local institution icons are already resized; no image service is needed. */
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Globe2,
  Minus,
  Plus,
  X,
  Move,
  RotateCcw,
} from 'lucide-react';
import type { Entry } from '@/lib/governance';
import { nodes, edges, sources } from '@/lib/governance';
import profilesData from '@/lib/actor-profiles.json';
import countries from '@/lib/world-countries.json';
import {
  connectionCounts,
  connectionCurve,
  fanPositions,
  separateBubbles,
  markerRadius,
  mapClusters,
  mapHeight,
  mapPresets,
  mapWidth,
  project,
  screenPoint,
  type ActorProfile,
  type Camera,
  type MapCluster,
} from '@/lib/geography';

export const actorProfiles = profilesData as unknown as Record<
  string,
  ActorProfile
>;
export const actorConnections = connectionCounts(nodes, edges);
const layerColors: Record<string, string> = {
  Legal: '#3153c8',
  Institutional: '#167765',
  Voluntary: '#9b5d1a',
  Corporate: '#7d52b7',
};
const countryLabels: [string, number, number][] = [
  ['UNITED STATES', -101, 38],
  ['CANADA', -104, 58],
  ['BRAZIL', -53, -10],
  ['CHINA', 104, 37],
  ['INDIA', 79, 22],
  ['AUSTRALIA', 135, -25],
  ['RUSSIA', 92, 59],
  ['FRANCE', 2, 46],
  ['GERMANY', 10, 51],
  ['SPAIN', -4, 40],
  ['ITALY', 12, 42],
  ['JAPAN', 138, 38],
  ['S. KOREA', 127, 36],
  ['INDONESIA', 118, -4],
  ['SOUTH AFRICA', 25, -30],
];

export function ActorLogo({
  entry,
  size = 34,
}: {
  entry: Entry;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const p = actorProfiles[entry.id];
  return (
    <span
      className="actor-logo"
      style={{
        width: size,
        height: size,
        borderColor: layerColors[entry.layer],
        color: layerColors[entry.layer],
      }}
    >
      {p?.logo && !failed ? (
        <img
          src={p.logo}
          alt=""
          width={size - 10}
          height={size - 10}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {entry.short
            .replace(/[^a-zA-Z ]/g, '')
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 3)}
        </span>
      )}
    </span>
  );
}

export default function WorldMap({
  entries,
  onSelect,
  onExpand,
}: {
  entries: Entry[];
  onSelect: (id: string) => void;
  onExpand: () => void;
}) {
  const [camera, setCamera] = useState<Camera>(mapPresets.World);
  const [preset, setPreset] = useState('World');
  const [sized, setSized] = useState(true);
  const [logos, setLogos] = useState(true);
  const [activeCluster, setActiveCluster] = useState<string[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    },
    [],
  );
  const selectedEntry = nodes.find((n) => n.id === selectedActor);
  const selectedEdges = selectedActor
    ? edges.filter((e) => e.from === selectedActor || e.to === selectedActor)
    : [];
  const relatedIds = new Set([
    ...(selectedActor ? [selectedActor] : []),
    ...selectedEdges.flatMap((e) => [e.from, e.to]),
  ]);
  const tracedEntries = nodes.filter((n) => relatedIds.has(n.id));
  const mapEntries = selectedActor ? tracedEntries : entries;
  function keepExpanded(id: string) {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setExpanded(id);
  }
  function releaseExpanded() {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(null), 300);
  }
  function fitConnections(id: string) {
    const ids = new Set([
      id,
      ...edges
        .filter((e) => e.from === id || e.to === id)
        .flatMap((e) => [e.from, e.to]),
    ]);
    const coords = nodes
      .filter(
        (n) => ids.has(n.id) && actorProfiles[n.id]?.geographic && n.location,
      )
      .map((n) => actorProfiles[n.id].coordinates ?? n.location!);
    if (!coords.length) return;
    const west = Math.min(...coords.map((p) => p[0])),
      east = Math.max(...coords.map((p) => p[0]));
    const south = Math.min(...coords.map((p) => p[1])),
      north = Math.max(...coords.map((p) => p[1]));
    const a = project([west, south]),
      b = project([east, north]);
    const midY = (a.y + b.y) / 2;
    const midLat =
      ((2 * Math.atan(Math.exp(((310 - midY) * 2 * Math.PI) / 1200)) -
        Math.PI / 2) *
        180) /
      Math.PI;
    setCamera({
      center: [(west + east) / 2, midLat],
      scale: Math.max(
        1,
        Math.min(
          6.4,
          760 / Math.max(1, b.x - a.x),
          340 / Math.max(1, a.y - b.y),
        ),
      ),
    });
    setPreset('Custom');
  }
  function selectActor(id: string) {
    setSelectedActor(id);
    setActiveCluster(null);
    setExpanded(null);
    setHovered(null);
    fitConnections(id);
  }

  const drag = useRef<{
    x: number;
    y: number;
    camera: Camera;
    moved: boolean;
  } | null>(null);
  const clusters = useMemo(
    () =>
      mapClusters(mapEntries, actorProfiles, camera, actorConnections, sized),
    [mapEntries, camera, sized],
  );
  const initialPins = clusters.flatMap((c) => {
    const open =
      c.entries.length > 1 && (expanded === c.anchor.id || !!selectedActor);
    return open
      ? fanPositions(c).map((p) => ({
          ...p,
          cluster: c,
          open,
          radius: markerRadius(actorConnections[p.entry.id], sized),
        }))
      : [
          {
            entry: c.anchor,
            x: c.x,
            y: c.y,
            cluster: c,
            open: false,
            radius: c.radius,
          },
        ];
  });
  const displayPins = selectedActor
    ? separateBubbles(initialPins)
    : initialPins;
  const pinById = new Map(displayPins.map((p) => [p.entry.id, p]));
  const drawableEdges = selectedEdges.filter(
    (e) => pinById.has(e.from) && pinById.has(e.to),
  );
  const nonLocatedConnections = tracedEntries.filter(
    (n) => !actorProfiles[n.id]?.geographic && n.id !== selectedActor,
  );
  const visible = clusters
    .flatMap((c) => c.entries)
    .sort((a, b) => actorConnections[b.id] - actorConnections[a.id]);
  const activeEntries = activeCluster
    ? entries
        .filter((n) => activeCluster.includes(n.id))
        .sort((a, b) => actorConnections[b.id] - actorConnections[a.id])
    : [];
  const elsewhere = entries.filter((n) => !actorProfiles[n.id]?.geographic);
  const center = project(camera.center);
  const cHover = clusters.find((c) => c.anchor.id === hovered);
  function choosePreset(name: string) {
    setCamera(mapPresets[name]);
    setPreset(name);
    setActiveCluster(null);
    setShowAll(false);
    if (name !== 'World') onExpand();
  }
  function zoom(factor: number) {
    setCamera((c) => ({
      ...c,
      scale: Math.max(1, Math.min(18, c.scale * factor)),
    }));
    setPreset('Custom');
  }
  function selectCluster(c: MapCluster) {
    if (drag.current?.moved) return;
    if (c.entries.length === 1) selectActor(c.anchor.id);
    else {
      keepExpanded(c.anchor.id);
      setActiveCluster(c.entries.map((n) => n.id));
    }
  }
  function focusCluster() {
    if (!activeEntries.length) return;
    const coords = activeEntries.map(
      (n) => actorProfiles[n.id]?.coordinates ?? n.location!,
    );
    const west = Math.min(...coords.map((p) => p[0])),
      east = Math.max(...coords.map((p) => p[0]));
    const south = Math.min(...coords.map((p) => p[1])),
      north = Math.max(...coords.map((p) => p[1]));
    const a = project([west, south]),
      b = project([east, north]);
    setCamera({
      center: [(west + east) / 2, (south + north) / 2],
      scale: Math.min(
        18,
        Math.max(
          camera.scale,
          Math.min(850 / Math.max(1, b.x - a.x), 440 / Math.max(1, a.y - b.y)),
        ),
      ),
    });
    setPreset('Custom');
  }
  function row(n: Entry) {
    const p = actorProfiles[n.id],
      s = sources.find((s) => s.id === n.sources[0]);
    return (
      <article className="world-actor-card" key={n.id}>
        <button
          className="world-actor-open"
          onClick={() =>
            actorProfiles[n.id]?.geographic ? selectActor(n.id) : onSelect(n.id)
          }
        >
          <ActorLogo
            entry={n}
            size={
              sized
                ? Math.round(
                    32 + Math.min(16, Math.sqrt(actorConnections[n.id]) * 4),
                  )
                : 40
            }
          />
          <span>
            <strong>{n.short}</strong>
            <small>
              {p?.city ?? n.region} · {n.layer}
            </small>
          </span>
          <ArrowUpRight size={16} />
        </button>
        <div className="world-card-links">
          <span>{actorConnections[n.id]} connections</span>
          {p?.website && (
            <a href={p.website} target="_blank" rel="noreferrer">
              Website <ArrowUpRight size={12} />
            </a>
          )}
          {s && (
            <a href={s.url} target="_blank" rel="noreferrer">
              Evidence <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </article>
    );
  }
  return (
    <section className="world-atlas" aria-label="Geographic explorer">
      <div className="world-controls">
        <div className="world-preset-group" aria-label="Zoom to region">
          {Object.keys(mapPresets).map((name) => (
            <button
              key={name}
              onClick={() => choosePreset(name)}
              aria-pressed={preset === name}
            >
              {name === 'World' && <Globe2 size={15} />} {name}
            </button>
          ))}
        </div>
        <div className="world-display-controls">
          <button aria-pressed={sized} onClick={() => setSized((v) => !v)}>
            Size: {sized ? 'influence proxy' : 'equal'}
          </button>
          <button aria-pressed={logos} onClick={() => setLogos((v) => !v)}>
            Logos {logos ? 'on' : 'off'}
          </button>
        </div>
      </div>
      {selectedEntry && (
        <div className="world-trace-banner" aria-live="polite">
          <ActorLogo key={selectedEntry.id} entry={selectedEntry} size={42} />
          <div>
            <strong>{selectedEntry.short}</strong>
            <span>
              {relatedIds.size - 1} connected entries · {drawableEdges.length}{' '}
              relationships visible
            </span>
          </div>
          <button onClick={() => fitConnections(selectedEntry.id)}>
            Fit connections
          </button>
          <button onClick={() => onSelect(selectedEntry.id)}>
            View profile ↗
          </button>
          <button
            aria-label="Clear map connections"
            onClick={() => {
              setSelectedActor(null);
              setExpanded(null);
            }}
          >
            <X size={17} />
          </button>
          <small>
            Showing this actor’s connections across filters. Flow follows each
            recorded relationship’s direction; it is not live activity.
          </small>
        </div>
      )}
      <div className="world-canvas">
        <div className="world-map-heading">
          <span>
            {preset === 'Custom'
              ? 'Your view'
              : preset === 'World'
                ? 'The global landscape'
                : preset}
          </span>
          <small>
            {visible.length} actors · {clusters.length} location groups
          </small>
        </div>
        <svg
          className="world-map-svg"
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          aria-label="World map of governance actors"
          role="group"
          onPointerDown={(e) => {
            if ((e.target as Element).closest('[data-pin]')) return;
            drag.current = { x: e.clientX, y: e.clientY, camera, moved: false };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const d = drag.current;
            const dx =
                ((e.clientX - d.x) * mapWidth) /
                e.currentTarget.getBoundingClientRect().width,
              dy =
                ((e.clientY - d.y) * mapHeight) /
                e.currentTarget.getBoundingClientRect().height;
            if (Math.abs(dx) + Math.abs(dy) < 4) return;
            d.moved = true;
            const p = project(d.camera.center);
            const x = p.x - dx / d.camera.scale,
              y = p.y - dy / d.camera.scale;
            const lat =
              ((2 * Math.atan(Math.exp(((310 - y) * 2 * Math.PI) / 1200)) -
                Math.PI / 2) *
                180) /
              Math.PI;
            setCamera({
              ...d.camera,
              center: [
                Math.max(-165, Math.min(165, (x * 360) / 1200 - 180)),
                Math.max(-55, Math.min(72, lat)),
              ],
            });
            setPreset('Custom');
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <defs>
            <marker
              id="connection-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3457d5" />
            </marker>
            <filter
              id="pin-shadow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#23355d"
                floodOpacity=".16"
              />
            </filter>
          </defs>
          <g
            aria-hidden="true"
            className="map-geography"
            transform={`translate(${mapWidth / 2 - center.x * camera.scale} ${mapHeight / 2 - center.y * camera.scale}) scale(${camera.scale})`}
          >
            {[-60, -30, 0, 30, 60].map((lat) => (
              <line
                key={`lat${lat}`}
                x1="0"
                x2="1200"
                y1={project([0, lat]).y}
                y2={project([0, lat]).y}
                stroke="#dae5ee"
                strokeWidth={0.7 / camera.scale}
              />
            ))}
            {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
              <line
                key={`lon${lon}`}
                x1={project([lon, 0]).x}
                x2={project([lon, 0]).x}
                y1="-200"
                y2="800"
                stroke="#dae5ee"
                strokeWidth={0.7 / camera.scale}
              />
            ))}
            {countries.map((c) => (
              <path
                key={c.name}
                d={c.path}
                fill="#e1e7e5"
                stroke="#fafcfb"
                strokeWidth={1 / camera.scale}
              >
                <title>{c.name}</title>
              </path>
            ))}
          </g>
          {countryLabels
            .filter(
              ([name]) =>
                camera.scale > 1.6 ||
                [
                  'UNITED STATES',
                  'CANADA',
                  'BRAZIL',
                  'CHINA',
                  'AUSTRALIA',
                  'SOUTH AFRICA',
                ].includes(name),
            )
            .map(([name, lon, lat]) => {
              const p = screenPoint([lon, lat], camera);
              return p.x > 30 && p.x < 1170 && p.y > 70 && p.y < 610 ? (
                <text
                  key={name}
                  x={p.x}
                  y={p.y}
                  className="country-name"
                  textAnchor="middle"
                >
                  {name}
                </text>
              ) : null;
            })}
          <g className="map-connections" aria-label="Connected organisations">
            {drawableEdges.map((e, i) => {
              const a = pinById.get(e.from)!,
                b = pinById.get(e.to)!;
              const path = connectionCurve(a, b, a.radius, b.radius);
              return (
                <g key={`${e.from}-${e.to}-${i}`}>
                  <path
                    d={path}
                    className="connection-track"
                    markerEnd="url(#connection-arrow)"
                  />
                  <path
                    d={path}
                    className="connection-flow"
                    style={{ animationDelay: `${-i * 0.23}s` }}
                  />
                  <title>
                    {nodes.find((n) => n.id === e.from)?.short} →{' '}
                    {nodes.find((n) => n.id === e.to)?.short}: {e.label}
                  </title>
                </g>
              );
            })}
          </g>
          <g className="fan-spokes" aria-hidden="true">
            {displayPins
              .filter((p) => p.open || selectedActor)
              .map((p) => {
                const anchor = screenPoint(
                  actorProfiles[p.entry.id].coordinates ?? p.entry.location!,
                  camera,
                );
                return (
                  <g key={`spoke-${p.entry.id}`}>
                    <line x1={anchor.x} y1={anchor.y} x2={p.x} y2={p.y} />
                    <circle cx={anchor.x} cy={anchor.y} r="3" />
                  </g>
                );
              })}
          </g>
          {!selectedActor &&
            clusters
              .filter((c) => c.entries.length > 1 && expanded === c.anchor.id)
              .map((c) => {
                const positions = fanPositions(c);
                const minX = Math.min(c.x, ...positions.map((p) => p.x)) - 48;
                const minY = Math.min(c.y, ...positions.map((p) => p.y)) - 48;
                const maxX = Math.max(c.x, ...positions.map((p) => p.x)) + 48;
                const maxY = Math.max(c.y, ...positions.map((p) => p.y)) + 64;
                return (
                  <rect
                    key={`hover-area-${c.anchor.id}`}
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    fill="transparent"
                    pointerEvents="all"
                    onMouseEnter={() => keepExpanded(c.anchor.id)}
                    onMouseLeave={releaseExpanded}
                  />
                );
              })}
          {displayPins
            .sort((a, b) => Number(a.open) - Number(b.open))
            .map((pin) => {
              const { entry: n, cluster: c, radius: r, x, y, open } = pin;
              const p = actorProfiles[n.id],
                isGroup = !open && c.entries.length > 1;
              const on = selectedActor === n.id || hovered === n.id;
              return (
                <g
                  key={n.id}
                  data-pin={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isGroup
                      ? `Expand ${p.city} group: ${c.entries.length} organisations`
                      : `Show connections for ${n.short}`
                  }
                  aria-pressed={!isGroup && selectedActor === n.id}
                  className={`geo-marker ${open ? 'fan-bubble' : ''} ${on ? 'pin-selected' : ''}`}
                  onClick={() =>
                    isGroup ? selectCluster(c) : selectActor(n.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isGroup) selectCluster(c);
                      else selectActor(n.id);
                    }
                    if (e.key === 'Escape') {
                      setExpanded(null);
                      setSelectedActor(null);
                    }
                  }}
                  onMouseEnter={() => {
                    setHovered(n.id);
                    keepExpanded(c.anchor.id);
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    releaseExpanded();
                  }}
                  onFocus={() => keepExpanded(c.anchor.id)}
                  onBlur={releaseExpanded}
                >
                  <circle cx={x} cy={y} r={r + 12} fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 5}
                    fill={layerColors[n.layer]}
                    opacity={on ? 0.25 : 0.08}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="white"
                    stroke={on ? '#172a9a' : layerColors[n.layer]}
                    strokeWidth={on ? 4 : 2.3}
                    filter="url(#pin-shadow)"
                  />
                  {logos && p.logo ? (
                    <image
                      href={p.logo}
                      x={x - r * 0.65}
                      y={y - r * 0.65}
                      width={r * 1.3}
                      height={r * 1.3}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  ) : (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className="pin-initial"
                      fill={layerColors[n.layer]}
                    >
                      {n.short
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 3)}
                    </text>
                  )}
                  {isGroup && (
                    <g>
                      <circle
                        cx={x + r * 0.8}
                        cy={y - r * 0.7}
                        r="11"
                        fill="#15273c"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={x + r * 0.8}
                        y={y - r * 0.7 + 4}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="700"
                      >
                        {c.entries.length}
                      </text>
                    </g>
                  )}
                  <text
                    x={x}
                    y={y + r + 19}
                    textAnchor="middle"
                    className="pin-city-label"
                  >
                    {open || selectedActor ? n.short : p.city}
                    {isGroup ? ' +' : ''}
                  </text>
                  <title>
                    {`${n.short} — ${p.city}${open ? ' · bubble offset for readability; dotted spoke marks location' : ''}`}
                  </title>
                </g>
              );
            })}
        </svg>
        {cHover && (
          <div className="world-hover" aria-live="polite">
            <strong>
              {actorProfiles[cHover.anchor.id].city}
              {new Set(cHover.entries.map((n) => actorProfiles[n.id].city))
                .size > 1
                ? ' + nearby'
                : ''}
            </strong>
            <span>
              {cHover.entries.length > 1
                ? `${cHover.entries.length} actors · click to explore`
                : cHover.anchor.short}
            </span>
          </div>
        )}
        <div className="world-zoom">
          <button
            aria-label="Zoom out on world map"
            disabled={camera.scale <= 1}
            onClick={() => zoom(1 / 1.4)}
          >
            <Minus size={18} />
          </button>
          <button
            aria-label="Reset world map"
            onClick={() => choosePreset('World')}
          >
            <RotateCcw size={16} />
          </button>
          <button
            aria-label="Zoom in on world map"
            disabled={camera.scale >= 18}
            onClick={() => zoom(1.4)}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="world-map-hint">
          <Move size={13} /> Hover to unfold · select an actor to trace
          connections
        </div>
        <a
          className="world-attribution"
          href="https://www.naturalearthdata.com/about/terms-of-use/"
          target="_blank"
          rel="noreferrer"
        >
          Natural Earth · boundaries are illustrative <ArrowUpRight size={11} />
        </a>
      </div>
      <div className="world-key">
        <div className="world-layer-key">
          {Object.entries(layerColors).map(([l, color]) => (
            <span key={l}>
              <i style={{ background: color }} />
              {l}
            </span>
          ))}
        </div>
        <span className="world-size-key">
          {sized && (
            <>
              <i />
              <i />
              <i />
            </>
          )}
          {sized ? 'More connections → larger marker' : 'Equal marker sizes'}
        </span>
      </div>
      <details className="world-method">
        <summary>What do location, size and logos mean?</summary>
        <p>
          Locations are representative city-level bases, not territorial
          authority. Crowded locations form numbered groups anchored at a
          member’s real location. Hover or tap a group to unfold its actors;
          dotted spokes mark their actual city anchors. Select an actor to trace
          its connections, or open its profile for the evidence. Networks,
          publications and laws appear separately below.
        </p>
        <p>
          Size uses the number of distinct actors or mechanisms connected to an
          entry in this curated atlas. This is a transparent proxy for
          influence, not a measured ranking of real-world power, effectiveness
          or budget. Counts use the whole dataset and stay stable as filters
          change. A group shows the size and logo of its most-connected member,
          with a badge for its actor count. Rings show governance layer.
          Official site icons are used where available; initials are the
          fallback.
        </p>
      </details>
      {selectedEntry && (
        <details className="world-connection-evidence">
          <summary>
            Connection evidence · {selectedEdges.length} relationships
            {nonLocatedConnections.length
              ? ` · ${nonLocatedConnections.length} entries without a map location`
              : ''}
          </summary>
          <p>
            Organisations outside the current view remain in this list. Laws,
            reports and distributed bodies have no geographic line.
          </p>
          {selectedEdges.map((e, i) => {
            const source = sources.find((s) => s.id === e.source);
            const target = nodes.find(
              (n) => n.id === (e.from === selectedActor ? e.to : e.from),
            )!;
            return (
              <article key={i}>
                <button onClick={() => onSelect(target.id)}>
                  {nodes.find((n) => n.id === e.from)?.short} →{' '}
                  {nodes.find((n) => n.id === e.to)?.short}
                </button>
                <span>{e.label}</span>
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                )}
              </article>
            );
          })}
        </details>
      )}
      <div className="world-roster">
        <div className="world-roster-heading">
          <div>
            <span className="eyebrow">
              {activeEntries.length
                ? 'SELECTED LOCATION GROUP'
                : 'EXPLORE THE ACTORS'}
            </span>
            <h3>
              {activeEntries.length
                ? activeEntries
                    .map((n) => actorProfiles[n.id]?.city)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(' · ')
                : 'In this view'}
            </h3>
          </div>
          {activeEntries.length ? (
            <div className="world-roster-actions">
              <button onClick={focusCluster}>
                <Plus size={14} /> Zoom to group
              </button>
              <button
                aria-label="Clear location group"
                onClick={() => setActiveCluster(null)}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <span>{visible.length} actors</span>
          )}
        </div>
        <div className="world-actor-grid">
          {(activeEntries.length
            ? activeEntries
            : showAll
              ? visible
              : visible.slice(0, 6)
          ).map(row)}
        </div>
        {!visible.length && (
          <p className="world-none">
            No located actors in this view. Choose World or adjust the filters.
          </p>
        )}
        {!activeEntries.length && visible.length > 6 && (
          <button
            className="world-show-all"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll
              ? 'Show fewer'
              : `Show all ${visible.length} actors in view`}
          </button>
        )}
      </div>
      {elsewhere.length > 0 && (
        <details className="world-nongeographic">
          <summary>
            <Globe2 size={17} /> Beyond a single location{' '}
            <span>{elsewhere.length}</span>
          </summary>
          <p>
            Distributed actors and governance mechanisms have no single office
            to pin.
          </p>
          <div className="world-actor-grid">{elsewhere.map(row)}</div>
        </details>
      )}
    </section>
  );
}
