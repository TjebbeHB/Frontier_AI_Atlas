/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG actor controls have keyboard handlers and an equivalent HTML directory. */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- The focusable SVG is a custom two-axis globe with documented keyboard controls; all actions also have HTML buttons. */
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Globe2,
  MapPin,
  Minus,
  Move,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { edges, nodes, type Edge, type Entry } from '@/lib/governance';
import profilesData from '@/lib/actor-profiles.json';
import countries from '@/lib/world-countries.json';
import { connectionCounts, type ActorProfile } from '@/lib/geography';
import RegionalMap from '@/components/regional-map';
import {
  arrangeRaisedPins,
  angularDistance,
  clampLatitude,
  globeFrame,
  globeHeight,
  globePresets,
  globeWidth,
  graticulePath,
  greatCirclePath,
  projectGlobe,
  wrapLongitude,
  type GlobeCamera,
  type LonLat,
} from '@/lib/globe-geometry';

const profiles = profilesData as unknown as Record<string, ActorProfile>;
const degrees = 180 / Math.PI;
const oceanColor = [5, 30, 65];
const radians = Math.PI / 180;
const entriesById = new Map(nodes.map((entry) => [entry.id, entry]));
const connectionTotals = connectionCounts(nodes, edges);
function coordinates(entry: Entry): LonLat | null {
  const profile = profiles[entry.id],
    coords = profile?.coordinates ?? entry.location;
  return profile?.geographic &&
    coords &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    Math.abs(coords[1]) <= 90
    ? coords
    : null;
}
function locationText(entry: Entry) {
  const p = profiles[entry.id] as ActorProfile & { locationLabel?: string };
  return p?.city
    ? `${p.city}${p.locationLabel ? ` · ${p.locationLabel}` : ''}`
    : (p?.locationLabel ?? 'Distributed / no single mapped base');
}
function initials(entry: Entry) {
  return entry.short
    .replace(/[^a-zA-Z ]/g, '')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

/**
 * Real country geometry is rasterized once, then inverse-projected per visible
 * globe pixel. This handles the horizon and antimeridian without folding back
 * polygons onto the front. The original basemap omits Antarctica; no substitute
 * geometry is invented. Texture coordinates use the existing Mercator paths.
 */
let landTexture: ImageData | null = null;
function getLandTexture() {
  if (landTexture) return landTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 2400;
  canvas.height = 1600;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.scale(2, 2);
  context.translate(0, 200);
  context.fillStyle = '#154d7b';
  context.strokeStyle = '#407aa2';
  context.lineWidth = 0.5;
  for (const country of countries) {
    const path = new Path2D(country.path);
    context.fill(path, 'evenodd');
    context.stroke(path);
  }
  landTexture = context.getImageData(0, 0, canvas.width, canvas.height);
  return landTexture;
}
function paintGlobe(canvas: HTMLCanvasElement, camera: GlobeCamera) {
  const texture = getLandTexture(),
    context = canvas.getContext('2d');
  if (!texture || !context) return;
  // Fixed logical resolution avoids device-pixel-ratio-dependent drag costs.
  const width = globeWidth,
    height = globeHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const output = context.createImageData(width, height),
    data = output.data;
  const radius = globeFrame.radius * camera.zoom,
    phi = camera.center[1] * radians;
  const sinPhi = Math.sin(phi),
    cosPhi = Math.cos(phi),
    lon0 = camera.center[0];
  const minY = Math.max(0, Math.floor(globeFrame.y - radius)),
    maxY = Math.min(height, Math.ceil(globeFrame.y + radius));
  for (let y = minY; y < maxY; y++) {
    const py = (globeFrame.y - y - 0.5) / radius;
    const span = Math.sqrt(Math.max(0, 1 - py * py));
    const minX = Math.max(0, Math.floor(globeFrame.x - radius * span)),
      maxX = Math.min(width, Math.ceil(globeFrame.x + radius * span));
    for (let x = minX; x < maxX; x++) {
      const px = (x + 0.5 - globeFrame.x) / radius,
        squared = px * px + py * py;
      if (squared > 1) continue;
      const z = Math.sqrt(1 - squared),
        sinLat = Math.max(
          -0.999999,
          Math.min(0.999999, py * cosPhi + z * sinPhi),
        );
      const lon = wrapLongitude(
        lon0 + Math.atan2(px, z * cosPhi - py * sinPhi) * degrees,
      );
      // log(tan(pi/4 + lat/2)) = atanh(sin(lat)).
      const mx = ((lon + 180) * 2400) / 360;
      const my =
        (510 - (1200 / (4 * Math.PI)) * Math.log((1 + sinLat) / (1 - sinLat))) *
        2;
      const tx = Math.min(2399, Math.max(0, Math.floor(mx))),
        ty = Math.floor(my);
      const index = (ty * texture.width + tx) * 4;
      const alpha =
        ty >= 0 && ty < texture.height ? texture.data[index + 3] / 255 : 0;
      const light = Math.max(0, -0.3 * px + 0.42 * py + 0.86 * z);
      const shade = 0.54 + light * 0.61,
        atmosphere = Math.pow(1 - z, 3) * 12;
      const offset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const ocean = oceanColor[channel];
        const land = alpha ? texture.data[index + channel] : ocean;
        data[offset + channel] =
          (ocean * (1 - alpha) + land * alpha) * shade +
          (channel === 2 ? atmosphere : atmosphere * 0.3);
      }
      data[offset + 3] = Math.min(
        255,
        Math.max(0, (1 - squared) * radius * 255),
      );
    }
  }
  context.putImageData(output, 0, 0);
}

export type GovernanceGlobeProps = {
  entries: Entry[];
  links?: Edge[];
  variant?: 'hero' | 'explorer';
  selectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  onProfile?: (id: string) => void;
  onExpand?: () => void;
  onJobs?: (city?: string) => void;
};

export default function GovernanceGlobe({
  entries,
  links = edges,
  variant = 'explorer',
  selectedId,
  onSelectedChange,
  onProfile,
  onExpand,
  onJobs,
}: GovernanceGlobeProps) {
  const hero = variant === 'hero';
  const [camera, setCamera] = useState<GlobeCamera>(globePresets.Global);
  const [preset, setPreset] = useState('Global');
  const [localSelected, setLocalSelected] = useState<string | null>(
    hero ? 'office' : null,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [anchorMenu, setAnchorMenu] = useState<string[] | null>(null);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set());
  const [dragging, setDragging] = useState(false);
  const [regional, setRegional] = useState(false);
  const [travelling, setTravelling] = useState(false);
  const flightFrame = useRef<number | null>(null);
  const returnCamera = useRef<GlobeCamera>(globePresets.Global);
  const returnPreset = useRef('Global');
  const regionButton = useRef<HTMLButtonElement>(null);
  const restoreRegionFocus = useRef(false);
  const activeId = selectedId === undefined ? localSelected : selectedId;
  const activeEntry = activeId ? entriesById.get(activeId) : undefined;
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    camera: GlobeCamera;
    pointerId: number;
  } | null>(null);
  const prefix = useId().replace(/:/g, '');
  const selectedEdges = useMemo(
    () =>
      activeId
        ? links.filter((edge) => edge.from === activeId || edge.to === activeId)
        : [],
    [activeId, links],
  );
  const relatedIds = useMemo(
    () => new Set(selectedEdges.flatMap((edge) => [edge.from, edge.to])),
    [selectedEdges],
  );
  const shownEntries = useMemo(() => {
    const merged = new Map(entries.map((entry) => [entry.id, entry]));
    for (const id of relatedIds) {
      const entry = entriesById.get(id);
      if (entry) merged.set(id, entry);
    }
    return [...merged.values()];
  }, [entries, relatedIds]);
  const geographicEntries = useMemo(
    () => shownEntries.filter((entry) => coordinates(entry)),
    [shownEntries],
  );
  const distributedEntries = entries.filter((entry) => !coordinates(entry));
  const visibleActors = geographicEntries
    .map((entry) => ({
      entry,
      point: projectGlobe(coordinates(entry)!, camera),
    }))
    .filter(
      ({ point }) =>
        point.visible &&
        point.z > 0.025 &&
        point.x > 34 &&
        point.x < globeWidth - 34 &&
        point.y > 45 &&
        point.y < globeHeight - 85,
    );
  const pins = useMemo(() => {
    const visible = geographicEntries
      .map((entry) => ({
        entry,
        point: projectGlobe(coordinates(entry)!, camera),
      }))
      .filter(
        ({ point }) =>
          point.visible &&
          point.z > 0.06 &&
          point.x > 45 &&
          point.x < globeWidth - 45 &&
          point.y > 50 &&
          point.y < globeHeight - 125,
      );
    visible.sort(
      (a, b) =>
        Number(b.entry.id === activeId) - Number(a.entry.id === activeId) ||
        Number(relatedIds.has(b.entry.id)) -
          Number(relatedIds.has(a.entry.id)) ||
        (connectionTotals[b.entry.id] ?? 0) -
          (connectionTotals[a.entry.id] ?? 0),
    );
    // Always retain selected neighbours; an overview prioritizes geographic
    // diversity so one dense city cannot consume every logo slot.
    const chosen: typeof visible = [];
    for (const actor of visible) {
      const nearExisting = chosen.some(
        (other) =>
          Math.hypot(
            actor.point.x - other.point.x,
            actor.point.y - other.point.y,
          ) < 65,
      );
      if (!activeId && nearExisting) continue;
      if (activeId && !relatedIds.has(actor.entry.id) && nearExisting) continue;
      chosen.push(actor);
      if (chosen.length >= (hero ? 13 : 19)) break;
    }
    const arranged = arrangeRaisedPins(
      chosen.map(({ entry, point }) => ({
        id: entry.id,
        x: point.x,
        y: point.y,
        anchorX: point.x,
        anchorY: point.y,
        radius:
          18 +
          Math.min(10, Math.sqrt(connectionTotals[entry.id] ?? 0) * 2.5) +
          (entry.id === activeId ? 3 : 0),
      })),
    );
    return arranged.map((pin) => ({
      ...pin,
      entry: chosen.find((item) => item.entry.id === pin.id)!.entry,
    }));
  }, [geographicEntries, camera, activeId, relatedIds, hero]);
  const routes = useMemo(
    () =>
      selectedEdges.flatMap((edge, index) => {
        const from = entriesById.get(edge.from),
          to = entriesById.get(edge.to);
        const a = from && coordinates(from),
          b = to && coordinates(to);
        if (!a || !b) return [];
        const path = greatCirclePath(a, b, camera, 0.1 + (index % 3) * 0.012);
        return path
          ? [
              {
                edge,
                index,
                path,
                from: from!,
                to: to!,
                end: projectGlobe(b, camera),
              },
            ]
          : [];
      }),
    [selectedEdges, camera],
  );
  const graticule = useMemo(() => graticulePath(camera), [camera]);
  const hoveredPin = pins.find((pin) => pin.id === hovered);
  const relatedCount = new Set(
    selectedEdges
      .flatMap((edge) => [edge.from, edge.to])
      .filter((id) => id !== activeId),
  ).size;
  const remoteCount = new Set(
    selectedEdges
      .flatMap((edge) => [edge.from, edge.to])
      .filter((id) => id !== activeId && !coordinates(entriesById.get(id)!)),
  ).size;
  const radius = globeFrame.radius * camera.zoom;
  const colocatedCount = selectedEdges.filter((edge) => {
    const a = coordinates(entriesById.get(edge.from)!);
    const b = coordinates(entriesById.get(edge.to)!);
    return a && b && angularDistance(a, b) < 0.00001;
  }).length;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (canvas.current) paintGlobe(canvas.current, camera);
    });
    return () => cancelAnimationFrame(frame);
  }, [camera]);
  useEffect(() => () => {
    if (flightFrame.current !== null) cancelAnimationFrame(flightFrame.current);
  }, []);
  useEffect(() => {
    if (!regional && restoreRegionFocus.current) {
      regionButton.current?.focus({ preventScroll: true });
      restoreRegionFocus.current = false;
    }
  }, [regional]);
  function openRegion() {
    if (travelling) return;
    returnCamera.current = camera;
    returnPreset.current = preset;
    setHovered(null);
    setAnchorMenu(null);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRegional(true);
      return;
    }
    setTravelling(true);
    const start = camera;
    const destination: GlobeCamera = { center: [3.5, 51.15], zoom: 4.4 };
    const longitudeDelta = wrapLongitude(destination.center[0] - start.center[0]);
    const started = performance.now();
    let lastPaint = 0;
    const frame = (now: number) => {
      const progress = Math.min(1, (now - started) / 1050);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      if (now - lastPaint > 35 || progress === 1) {
        setCamera({ center: [wrapLongitude(start.center[0] + longitudeDelta * eased), start.center[1] + (destination.center[1] - start.center[1]) * eased], zoom: start.zoom + (destination.zoom - start.zoom) * eased });
        lastPaint = now;
      }
      if (progress < 1) flightFrame.current = requestAnimationFrame(frame);
      else {
        flightFrame.current = null;
        setRegional(true);
        setTravelling(false);
      }
    };
    flightFrame.current = requestAnimationFrame(frame);
  }
  function closeRegion() {
    restoreRegionFocus.current = true;
    setCamera(returnCamera.current);
    setPreset(returnPreset.current);
    setRegional(false);
  }
  function setSelection(id: string | null) {
    setLocalSelected(id);
    onSelectedChange?.(id);
    setHovered(null);
    setAnchorMenu(null);
  }
  function selectAnchor(id: string) {
    const actor = visibleActors.find((item) => item.entry.id === id);
    if (!actor) return;
    const nearby = visibleActors.filter(
      (item) =>
        Math.hypot(item.point.x - actor.point.x, item.point.y - actor.point.y) <
        16,
    );
    if (nearby.length === 1) selectActor(id);
    else setAnchorMenu(nearby.map((item) => item.entry.id));
  }
  function selectActor(id: string, center = false) {
    setSelection(id);
    const entry = entriesById.get(id),
      coords = entry && coordinates(entry);
    if (center && coords) {
      setCamera((current) => ({
        center: [coords[0], clampLatitude(coords[1])],
        zoom: Math.max(1.25, current.zoom),
      }));
      setPreset('Custom');
    }
  }
  function choosePreset(name: string) {
    setCamera(globePresets[name]);
    setPreset(name);
    setHovered(null);
    setAnchorMenu(null);
    if (name !== 'Global') onExpand?.();
  }
  function zoom(factor: number) {
    setCamera((current) => ({
      ...current,
      zoom: Math.max(0.8, Math.min(2.7, current.zoom * factor)),
    }));
  }
  function reset() {
    setCamera(globePresets.Global);
    setPreset('Global');
    setHovered(null);
  }
  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  if (regional) return <RegionalMap entries={entries} links={links} compact={hero} onBack={closeRegion} onProfile={onProfile} onJobs={onJobs}/>;

  return (
    <section
      className={`governance-globe governance-globe--${variant}${travelling ? ' is-travelling' : ''}`}
      aria-label="Interactive governance globe"
    >
      <style>{globeStyles}</style>
      <div className="globe-toolbar">
        <div className="globe-presets" aria-label="Globe region">
          {Object.keys(globePresets).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={preset === name}
              onClick={() => choosePreset(name)}
            >
              {name === 'Global' && <Globe2 size={13} />}
              {name}
            </button>
          ))}
          <button ref={regionButton} type="button" className="globe-local-button" onClick={openRegion} disabled={travelling} aria-label="Zoom to Northwest Europe and SAIN chapters"><MapPin size={12}/> NW Europe · SAIN</button>
        </div>
        {!hero && (
          <span className="globe-count">
            {entries.filter((entry) => coordinates(entry)).length} mapped bases
          </span>
        )}
      </div>
      {travelling && <div className="globe-flight-label" role="status">Zooming to Northwest Europe…</div>}
      <div className={`globe-stage${dragging ? ' is-dragging' : ''}`}>
        <div className="globe-aura" aria-hidden="true" />
        <canvas
          ref={canvas}
          className="globe-earth"
          width={globeWidth}
          height={globeHeight}
          aria-hidden="true"
        />
        <svg
          className="globe-svg"
          viewBox={`0 0 ${globeWidth} ${globeHeight}`}
          role="application"
          aria-roledescription="interactive globe"
          tabIndex={0}
          aria-label="Rotate the governance globe with arrow keys. Plus and minus zoom, Home resets. Select an actor to trace documented relationships."
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const move: Record<string, [number, number]> = {
              ArrowLeft: [-12, 0],
              ArrowRight: [12, 0],
              ArrowUp: [0, 8],
              ArrowDown: [0, -8],
            };
            if (move[event.key]) {
              event.preventDefault();
              const [lon, lat] = move[event.key];
              setCamera((current) => ({
                ...current,
                center: [
                  wrapLongitude(current.center[0] + lon),
                  clampLatitude(current.center[1] + lat),
                ],
              }));
              setPreset('Custom');
            } else if (event.key === '+' || event.key === '=') {
              event.preventDefault();
              zoom(1.2);
            } else if (event.key === '-') {
              event.preventDefault();
              zoom(1 / 1.2);
            } else if (event.key === 'Home') {
              event.preventDefault();
              reset();
            } else if (event.key === 'Escape') setSelection(null);
          }}
          onPointerDown={(event) => {
            if ((event.target as Element).closest('[data-globe-pin]')) return;
            if (event.button !== 0) return;
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              camera,
              pointerId: event.pointerId,
            };
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drag.current || drag.current.pointerId !== event.pointerId)
              return;
            const start = drag.current,
              rect = event.currentTarget.getBoundingClientRect();
            const scale = globeWidth / rect.width / start.camera.zoom;
            setCamera({
              ...start.camera,
              center: [
                wrapLongitude(
                  start.camera.center[0] -
                    (event.clientX - start.x) * scale * 0.18,
                ),
                clampLatitude(
                  start.camera.center[1] +
                    (event.clientY - start.y) * scale * 0.18,
                ),
              ],
            });
            setPreset('Custom');
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={() => {
            drag.current = null;
            setDragging(false);
          }}
        >
          <defs>
            <radialGradient id={`${prefix}-ocean`} cx="36%" cy="28%">
              <stop stopColor="#174974" />
              <stop offset="1" stopColor="#051d46" />
            </radialGradient>
            <radialGradient id={`${prefix}-halo`}>
              <stop offset="75%" stopColor="#1c71a5" stopOpacity="0" />
              <stop offset="91%" stopColor="#388ad2" stopOpacity=".11" />
              <stop offset="100%" stopColor="#0d3871" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${prefix}-stem`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#ff8656" />
              <stop offset="1" stopColor="#ff6025" stopOpacity=".3" />
            </linearGradient>
            <filter
              id={`${prefix}-route-glow`}
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="3.3" />
            </filter>
            <filter
              id={`${prefix}-pin-shadow`}
              x="-80%"
              y="-80%"
              width="260%"
              height="280%"
            >
              <feDropShadow
                dx="0"
                dy="7"
                stdDeviation="7"
                floodColor="#000d28"
                floodOpacity=".65"
              />
            </filter>
            <marker
              id={`${prefix}-arrow`}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path
                d="M0 1L8 5L0 9"
                fill="none"
                stroke="#ffa875"
                strokeWidth="1.4"
              />
            </marker>
            {pins.map((pin) => (
              <clipPath key={pin.id} id={`${prefix}-logo-${pin.id}`}>
                <circle r={pin.radius - 6} />
              </clipPath>
            ))}
          </defs>
          <g aria-hidden="true" className="globe-surface-decoration">
            <circle
              cx={globeFrame.x}
              cy={globeFrame.y}
              r={radius * 1.11}
              fill={`url(#${prefix}-halo)`}
            />
            <circle
              cx={globeFrame.x}
              cy={globeFrame.y}
              r={radius}
              fill="none"
              stroke="#71a6cf"
              strokeOpacity=".24"
              strokeWidth="1.2"
            />
            <path
              d={graticule}
              fill="none"
              stroke="#76a0c4"
              strokeOpacity=".095"
              strokeWidth=".6"
            />
            <ellipse
              cx={globeFrame.x}
              cy={globeFrame.y + radius + 39}
              rx={radius * 0.74}
              ry="15"
              fill="#000e2e"
              opacity=".24"
            />
          </g>
          <g aria-label="Documented connections" className="globe-routes">
            {routes.map(({ edge, index, path, from, to, end }) => (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <title>
                  {from.short} → {to.short}: {edge.label}
                </title>
                <path
                  d={path}
                  fill="none"
                  stroke="#ff6025"
                  strokeWidth="6"
                  opacity=".37"
                  filter={`url(#${prefix}-route-glow)`}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#ff8952"
                  strokeWidth="1.35"
                  opacity=".88"
                  markerEnd={end.visible ? `url(#${prefix}-arrow)` : undefined}
                />
                <path
                  className="globe-route-flow"
                  d={path}
                  fill="none"
                  stroke="#ffe2c5"
                  strokeWidth="2"
                  strokeDasharray="3 48"
                  style={{ animationDelay: `${index * -0.37}s` }}
                  opacity=".9"
                />
              </g>
            ))}
          </g>
          <g className="globe-anchors" aria-label="True geographic anchors">
            {visibleActors.map(({ entry, point }) => (
              <g
                key={entry.id}
                data-globe-pin={`anchor-${entry.id}`}
                role="button"
                tabIndex={0}
                className="globe-anchor"
                aria-label={`Explore ${entry.short} and nearby bases, ${locationText(entry)}`}
                onClick={() => selectAnchor(entry.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    selectAnchor(entry.id);
                  }
                }}
              >
                <circle cx={point.x} cy={point.y} r="11" fill="transparent" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={relatedIds.has(entry.id) ? 7 : 4.5}
                  fill="#ff6025"
                  opacity=".13"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={entry.id === activeId ? 3.6 : 2.3}
                  fill={relatedIds.has(entry.id) ? '#ff9d62' : '#d2e7ec'}
                  opacity={activeId && !relatedIds.has(entry.id) ? 0.45 : 0.9}
                />
              </g>
            ))}
          </g>
          <g className="globe-pins">
            {pins.map((pin) => {
              const active = activeId === pin.id,
                related = relatedIds.has(pin.id),
                profile = profiles[pin.id];
              const opacity = activeId && !related && !active ? 0.69 : 1;
              return (
                <g
                  key={pin.id}
                  data-globe-pin={pin.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${pin.entry.short}, ${locationText(pin.entry)}. Trace ${connectionTotals[pin.id] ?? 0} connections.`}
                  aria-pressed={active}
                  className={`globe-pin${active ? ' is-active' : ''}`}
                  onClick={() => selectActor(pin.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      selectActor(pin.id);
                    }
                  }}
                  onMouseEnter={() => setHovered(pin.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(pin.id)}
                  onBlur={() => setHovered(null)}
                  opacity={opacity}
                >
                  <line
                    x1={pin.anchorX}
                    y1={pin.anchorY}
                    x2={pin.x}
                    y2={pin.y}
                    stroke={active || related ? '#ff9d6e' : '#789bb7'}
                    strokeWidth={active ? 1.4 : 0.9}
                    strokeOpacity=".7"
                  />
                  <ellipse
                    cx={pin.anchorX}
                    cy={pin.anchorY}
                    rx={active ? 7 : 4}
                    ry="2.8"
                    fill="#ff6025"
                    opacity=".6"
                  />
                  <g
                    transform={`translate(${pin.x} ${pin.y})`}
                    filter={`url(#${prefix}-pin-shadow)`}
                  >
                    <circle
                      className="globe-pin-focus"
                      r={pin.radius + 7}
                      fill="none"
                      stroke="#ffad78"
                      strokeWidth="1.5"
                      strokeOpacity={active ? 0.75 : 0}
                    />
                    <circle cy="3" r={pin.radius} fill="#ad8f76" />
                    <circle
                      r={pin.radius}
                      fill="#fff7e9"
                      stroke={active ? '#ff6025' : '#e5d9c4'}
                      strokeWidth={active ? 3 : 1.4}
                    />
                    {profile?.logo && !failedLogos.has(pin.id) ? (
                      <image
                        href={profile.logo}
                        x={-pin.radius + 7}
                        y={-pin.radius + 7}
                        width={(pin.radius - 7) * 2}
                        height={(pin.radius - 7) * 2}
                        preserveAspectRatio="xMidYMid meet"
                        clipPath={`url(#${prefix}-logo-${pin.id})`}
                        onError={() =>
                          setFailedLogos(
                            (current) => new Set([...current, pin.id]),
                          )
                        }
                      />
                    ) : (
                      <text
                        y="5"
                        textAnchor="middle"
                        fill="#021c4d"
                        fontSize={pin.radius > 24 ? 13 : 11}
                        fontWeight="750"
                      >
                        {initials(pin.entry)}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
          {hoveredPin && (
            <g
              pointerEvents="none"
              className="globe-pin-tooltip"
              transform={`translate(${Math.max(110, Math.min(890, hoveredPin.x))} ${Math.min(globeHeight - 100, hoveredPin.y + hoveredPin.radius + 23)})`}
            >
              <rect
                x="-118"
                y="-13"
                width="236"
                height="45"
                rx="8"
                fill="#031d45"
                stroke="#7892b0"
                strokeOpacity=".45"
              />
              <text
                textAnchor="middle"
                y="3"
                fill="#fff4df"
                fontSize="13"
                fontWeight="650"
              >
                {hoveredPin.entry.short}
              </text>
              <text textAnchor="middle" y="20" fill="#b4c9d9" fontSize="10.5">
                {profiles[hoveredPin.id]?.city ?? 'Distributed'} ·{' '}
                {connectionTotals[hoveredPin.id] ?? 0} connections
              </text>
            </g>
          )}
        </svg>
        {anchorMenu && (
          <div
            className="globe-anchor-menu"
            role="region"
            aria-label="Organisations near this point"
          >
            <div>
              <strong>
                {anchorMenu.length} actors ·{' '}
                {new Set(anchorMenu.map((id) => profiles[id]?.city)).size}{' '}
                {new Set(anchorMenu.map((id) => profiles[id]?.city)).size === 1 ? 'city' : 'cities'}
              </strong>
              <button
                type="button"
                onClick={() => setAnchorMenu(null)}
                aria-label="Close nearby actors"
              >
                <X size={14} />
              </button>
            </div>
            <p>Each dot keeps its own geographic base.</p>
            {anchorMenu.map((id) => {
              const entry = entriesById.get(id)!;
              return (
                <button type="button" key={id} onClick={() => selectActor(id)}>
                  <strong>{entry.short}</strong>
                  <small>{locationText(entry)}</small>
                </button>
              );
            })}
          </div>
        )}
        <div className="globe-zoom" aria-label="Globe zoom controls">
          <button type="button" onClick={() => zoom(1.2)} aria-label="Zoom in">
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => zoom(1 / 1.2)}
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
          <button type="button" onClick={reset} aria-label="Reset globe">
            <RotateCcw size={15} />
          </button>
        </div>
        <span className="globe-drag-hint">
          <Move size={12} /> Drag to rotate <span>· zoom with + / −</span>
        </span>
        <div className="globe-selection" aria-live="polite">
          {activeEntry ? (
            <>
              <div className="globe-selection-main">
                <span className="globe-live-dot" />
                <div>
                  <strong>{activeEntry.short}</strong>
                  <small>{locationText(activeEntry)}</small>
                </div>
                <button
                  type="button"
                  className="globe-clear"
                  onClick={() => setSelection(null)}
                  aria-label="Clear traced connections"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="globe-selection-actions">
                <span>
                  {relatedCount} connected entries
                  {!hero && ` · ${routes.length} visible geographic links`}
                </span>
                {onProfile && (
                  <button
                    type="button"
                    onClick={() => onProfile(activeEntry.id)}
                  >
                    View profile <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="globe-selection-main">
                <span className="globe-live-dot" />
                <div>
                  <strong>One landscape. Many kinds of power.</strong>
                  <small>
                    Select an organisation to follow its connections.
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {hero && (
        <div className="globe-hero-key">
          City-level bases · recorded relationships · logo size reflects
          connections
        </div>
      )}
      {!hero && (
        <>
          <div className="globe-caption">
            <span>
              <i /> Dots mark documented bases; raised logos are callouts. Logo
              size reflects distinct connections, an influence proxy.
            </span>
            <span>
              Arcs show recorded relationships, not live activity.
              {activeId && remoteCount > 0
                ? ` ${remoteCount} connected entries have no single mapped base.`
                : ''}
              {colocatedCount > 0
                ? ` ${colocatedCount} co-located relationships share an anchor.`
                : ''}
            </span>
          </div>
          <div className="globe-directory-toggle">
            <button
              type="button"
              onClick={() => setDirectoryOpen((current) => !current)}
              aria-expanded={directoryOpen}
            >
              <Globe2 size={15} /> Browse {entries.length} entries{' '}
              <ChevronDown
                size={15}
                className={directoryOpen ? 'is-open' : ''}
              />
            </button>
            <small>Rotate to reveal actors beyond the horizon.</small>
          </div>
          {directoryOpen && (
            <div className="globe-directory">
              <div>
                <h3>Organisations with a mapped base</h3>
                <div className="globe-directory-grid">
                  {entries
                    .filter((entry) => coordinates(entry))
                    .map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => selectActor(entry.id, true)}
                        aria-pressed={entry.id === activeId}
                      >
                        <strong>{entry.short}</strong>
                        <small>{locationText(entry)}</small>
                      </button>
                    ))}
                </div>
              </div>
              {distributedEntries.length > 0 && (
                <div>
                  <h3>Distributed actors &amp; mechanisms</h3>
                  <p>
                    These entries have no single verified base on the globe.
                  </p>
                  <div className="globe-directory-grid">
                    {distributedEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() =>
                          onProfile
                            ? onProfile(entry.id)
                            : selectActor(entry.id)
                        }
                      >
                        <strong>
                          {entry.short} <ArrowUpRight size={12} />
                        </strong>
                        <small>{locationText(entry)}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

const globeStyles = `
.governance-globe{--gg-cream:#fff3dc;--gg-orange:#ff6025;position:relative;color:var(--gg-cream);min-width:0;font-family:inherit}
.governance-globe--explorer{background:radial-gradient(ellipse at 44% 35%,#0c2d57 0%,#021c4d 68%);border-radius:18px;overflow:hidden}.governance-globe button{font:inherit;cursor:pointer}.governance-globe button:focus-visible,.globe-svg:focus-visible,.globe-pin:focus-visible{outline:2px solid #ffac75;outline-offset:4px}
.globe-hero-key{text-align:center;color:#91a9c1;font-size:9px;line-height:1.6;padding:2px 12px 10px}.globe-anchor-menu{position:absolute;z-index:5;right:18px;top:18px;width:min(270px,78%);max-height:70%;overflow:auto;border:1px solid #7993ad6b;border-radius:12px;padding:11px;background:#09234bec;box-shadow:0 12px 45px #000d2990;backdrop-filter:blur(12px)}.globe-anchor-menu>div{display:flex;align-items:center;justify-content:space-between;gap:10px}.globe-anchor-menu>div strong{font-size:12px;color:#fff3dc}.globe-anchor-menu>div button{border:0;background:transparent;color:#b4c9dc;display:grid;place-items:center;padding:3px}.globe-anchor-menu p{font-size:10px;line-height:1.4;color:#9eb6cc;margin:7px 0}.globe-anchor-menu>button{display:block;width:100%;text-align:left;border:0;border-top:1px solid #6783a034;background:transparent;padding:9px 2px;color:#fff3dc}.globe-anchor-menu>button:hover{color:#ff9b6e}.globe-anchor-menu>button strong{display:block;font-size:11px;font-weight:600}.globe-anchor-menu>button small{display:block;font-size:10px;color:#9fb4c8;line-height:1.5;margin-top:3px}
.globe-toolbar{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px 0}
.globe-presets{display:flex;flex-wrap:wrap;align-items:center;gap:4px}.globe-presets button{display:inline-flex;gap:5px;align-items:center;border:1px solid transparent;background:transparent;color:#a8bfd5;padding:7px 10px;border-radius:20px;font-size:11px;line-height:1.2}.globe-presets button[aria-pressed=true]{color:#fff3dc;background:#143c67;border-color:#4b6886}.globe-presets button:hover{color:#fff3dc;background:#153a60}.globe-count{font-size:11px;color:#9eb7cf;white-space:nowrap}
.globe-presets .globe-local-button{border-color:#ff87575e;color:#ffb28b;background:#ff602510;margin-left:4px}.globe-presets .globe-local-button:hover{background:#ff602528;border-color:#ffab7e}.is-travelling .globe-stage,.is-travelling .globe-toolbar{pointer-events:none}.globe-flight-label{position:absolute;z-index:8;top:64px;left:50%;transform:translateX(-50%);font-size:11px;white-space:nowrap;background:#06254def;color:#ffb690;border:1px solid #b28e724c;padding:10px 14px;border-radius:20px}
.globe-stage{position:relative;isolation:isolate;aspect-ratio:1000/740;min-width:0;overflow:hidden}.globe-aura{position:absolute;z-index:-1;inset:7% 14% 8%;border-radius:50%;background:radial-gradient(ellipse,#184d802b 5%,#13477c1a 45%,transparent 70%)}.globe-earth,.globe-svg{position:absolute;inset:0;width:100%;height:100%}.globe-earth{pointer-events:none}.globe-svg{overflow:visible;cursor:grab;touch-action:none}.is-dragging .globe-svg{cursor:grabbing}.globe-surface-decoration{pointer-events:none}
.globe-route-flow{animation:globe-route-flow 11s linear infinite;pointer-events:none}.is-dragging .globe-route-flow{animation-play-state:paused}@keyframes globe-route-flow{to{stroke-dashoffset:-306}}
.globe-anchor{cursor:pointer;outline:none}.globe-anchor:focus-visible circle{stroke:#fff3dc;stroke-width:2}.globe-pin{cursor:pointer;outline:none}.globe-pin:hover .globe-pin-focus,.globe-pin:focus-visible .globe-pin-focus{stroke-opacity:1}.globe-pin:focus-visible>line{stroke:#fff3dc;stroke-width:2}
.globe-zoom{position:absolute;right:19px;top:33%;display:grid;gap:5px}.globe-zoom button{display:grid;place-items:center;width:31px;height:31px;border:1px solid #627a9240;border-radius:8px;background:#071f46c9;color:#d1dfdf}.globe-zoom button:hover{border-color:#ff8b57;color:#ffae7e}
.globe-drag-hint{position:absolute;left:19px;bottom:22px;display:flex;align-items:center;gap:6px;color:#9ab4ce;font-size:10px;pointer-events:none}.globe-drag-hint span{opacity:.7}
.globe-selection{position:absolute;left:50%;bottom:38px;transform:translateX(-50%);width:min(390px,74%);padding:12px 14px;border:1px solid #6683a050;border-radius:13px;background:linear-gradient(120deg,#092954ed,#051d43e8);box-shadow:0 12px 36px #000f2930;backdrop-filter:blur(12px)}.globe-selection-main{display:flex;align-items:center;gap:10px}.globe-live-dot{width:7px;height:7px;flex-shrink:0;border-radius:50%;background:#ff6025;box-shadow:0 0 12px #ff602573}.globe-selection-main>div{min-width:0;flex:1}.globe-selection strong{display:block;font-size:13px;font-weight:650;line-height:1.35;color:#fff3dc}.globe-selection small{display:block;color:#adbfce;font-size:10px;line-height:1.45;margin-top:3px}.globe-clear{border:0;background:transparent;color:#8ea8c1;padding:4px;display:grid;place-items:center}.globe-selection-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 0 17px;padding-top:8px;border-top:1px solid #63829b2e}.globe-selection-actions>span{font-size:10px;line-height:1.4;color:#c0ccd8}.globe-selection-actions>button{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;background:transparent;border:0;padding:0;color:#ff9b6e;font-size:10px}
.globe-caption{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #55718a30;padding:13px 19px;color:#90a9bf;font-size:10px;line-height:1.6}.globe-caption>span{max-width:53%}.globe-caption i{display:inline-block;width:5px;height:5px;background:#ff8952;border-radius:50%;margin-right:5px}.globe-directory-toggle{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 19px}.globe-directory-toggle>button{display:flex;align-items:center;gap:7px;border:1px solid #5b769548;background:#0b2a52;color:#e7e5dd;padding:9px 12px;border-radius:8px;font-size:11px}.globe-directory-toggle small{font-size:10px;color:#8ba4bd}.globe-directory-toggle .is-open{transform:rotate(180deg)}.globe-directory{padding:0 19px 22px;display:grid;gap:24px}.globe-directory h3{font-size:13px;color:#e6e6df;margin:14px 0 12px}.globe-directory p{font-size:11px;color:#9ab0c8;margin:0 0 12px}.globe-directory-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:6px}.globe-directory-grid button{display:block;text-align:left;border:1px solid #56749338;background:#092752aa;border-radius:8px;padding:10px 12px;color:#eeeade}.globe-directory-grid button:hover,.globe-directory-grid button[aria-pressed=true]{border-color:#ff875787;background:#163753}.globe-directory-grid strong{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600}.globe-directory-grid small{display:block;font-size:10px;color:#9db3ca;margin-top:4px;line-height:1.45}
.governance-globe--hero .globe-stage{aspect-ratio:1000/875}.governance-globe--hero .globe-earth,.governance-globe--hero .globe-svg{inset:0 auto auto 50%;transform:translateX(-50%);width:128%;height:auto;aspect-ratio:1000/740}.governance-globe--hero .globe-toolbar{justify-content:center;padding-top:6px}.governance-globe--hero .globe-selection{bottom:24px;max-width:345px}.governance-globe--hero .globe-drag-hint{bottom:4px;left:50%;transform:translateX(-50%);white-space:nowrap}.governance-globe--hero .globe-drag-hint span{display:none}.governance-globe--hero .globe-zoom{right:6px}
@media(max-width:640px){.governance-globe--hero .globe-stage{aspect-ratio:1/1.02}.governance-globe--hero .globe-earth,.governance-globe--hero .globe-svg{width:130%}.globe-toolbar{padding:10px 3px 0;justify-content:center}.globe-presets{gap:0}.globe-presets button{font-size:10px;padding:7px 8px}.globe-count{display:none}.globe-stage{aspect-ratio:1/1.02;margin-top:-2px}.globe-earth,.globe-svg{inset:0 auto auto 50%;transform:translateX(-50%);width:130%;height:auto;aspect-ratio:1000/740}.globe-zoom{right:5px;top:22%}.globe-zoom button{width:29px;height:29px}.globe-selection,.governance-globe--hero .globe-selection{bottom:26px;width:82%;padding:10px 11px}.globe-selection-actions{margin-top:7px;padding-top:7px}.globe-drag-hint,.governance-globe--hero .globe-drag-hint{bottom:5px;left:50%;transform:translateX(-50%);white-space:nowrap}.globe-drag-hint span{display:none}.globe-caption{flex-direction:column;gap:5px;padding:11px}.globe-caption>span{max-width:none}.globe-directory-toggle{padding:11px}.globe-directory-toggle small{display:none}.globe-directory{padding:0 11px 15px}.globe-directory-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){.globe-route-flow{animation:none;stroke-dasharray:none;opacity:.22}}
`;
