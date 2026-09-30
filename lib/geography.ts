import type { Entry, Edge } from './governance';

export type ActorProfile = {
  website?: string | null;
  city?: string | null;
  geographic: boolean;
  locationNote: string;
  coordinates?: [number, number];
  locationSource?: string;
  logo?: string;
  logoSource?: string;
};
export type Camera = { center: [number, number]; scale: number };
export const mapPresets: Record<string, Camera> = {
  World: { center: [0, 18], scale: 1 },
  USA: { center: [-98, 38], scale: 3.4 },
  Europe: { center: [10, 49], scale: 6.4 },
  Asia: { center: [108, 28], scale: 2.5 },
};
export const mapWidth = 1200,
  mapHeight = 640;

// Same Mercator projection as world-countries.json. Coordinates are [lon, lat].
export function project([lon, latitude]: [number, number]) {
  const lat = Math.max(-80, Math.min(80, latitude));
  return {
    x: Number((((lon + 180) * 1200) / 360).toFixed(4)),
    y: Number(
      (
        310 -
        (1200 / (2 * Math.PI)) *
          Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
      ).toFixed(4),
    ),
  };
}
export function screenPoint(coords: [number, number], camera: Camera) {
  const p = project(coords),
    c = project(camera.center);
  return {
    x: mapWidth / 2 + (p.x - c.x) * camera.scale,
    y: mapHeight / 2 + (p.y - c.y) * camera.scale,
  };
}
export function connectionCounts(entries: Entry[], links: Edge[]) {
  return Object.fromEntries(
    entries.map((n) => [
      n.id,
      new Set(
        links
          .filter((e) => e.from === n.id || e.to === n.id)
          .map((e) => (e.from === n.id ? e.to : e.from)),
      ).size,
    ]),
  );
}
export function markerRadius(count: number, sized = true) {
  return sized ? 15 + Math.min(16, 4 * Math.sqrt(count)) : 23;
}
export type MapCluster = {
  entries: Entry[];
  x: number;
  y: number;
  radius: number;
  anchor: Entry;
};

// Display-only offsets: spokes retain the real location when a group unfolds.
export function fanPositions(cluster: MapCluster) {
  const count = cluster.entries.length;
  if (count === 1)
    return [{ entry: cluster.anchor, x: cluster.x, y: cluster.y }];
  const radius = Math.max(85, count * 13);
  const cx = Math.max(radius + 70, Math.min(mapWidth - radius - 70, cluster.x));
  const cy = Math.max(
    radius + 60,
    Math.min(mapHeight - radius - 70, cluster.y),
  );
  return cluster.entries.map((entry, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / count;
    return {
      entry,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function separateBubbles<
  T extends { x: number; y: number; radius: number },
>(pins: T[]): T[] {
  const result = pins.map((p) => ({ ...p }));
  for (let pass = 0; pass < 100; pass++) {
    let moved = false;
    for (let i = 0; i < result.length; i++)
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i],
          b = result[j];
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const gap = a.radius + b.radius + 35;
        if (distance >= gap) continue;
        const ux = distance > 0.01 ? dx / distance : 1,
          uy = distance > 0.01 ? dy / distance : 0;
        const shift = (gap - distance) / 2 + 0.1;
        a.x = Math.max(55, Math.min(mapWidth - 55, a.x - ux * shift));
        a.y = Math.max(85, Math.min(mapHeight - 70, a.y - uy * shift));
        b.x = Math.max(55, Math.min(mapWidth - 55, b.x + ux * shift));
        b.y = Math.max(85, Math.min(mapHeight - 70, b.y + uy * shift));
        moved = true;
      }
    if (!moved) break;
  }
  return result;
}

export function connectionCurve(
  a: { x: number; y: number },
  b: { x: number; y: number },
  fromRadius = 25,
  toRadius = 25,
) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    distance = Math.hypot(dx, dy);
  if (distance < 1) return '';
  const ux = dx / distance,
    uy = dy / distance;
  const bend = Math.min(95, distance * 0.2);
  return `M ${a.x + ux * fromRadius} ${a.y + uy * fromRadius} Q ${(a.x + b.x) / 2 - uy * bend} ${(a.y + b.y) / 2 + ux * bend} ${b.x - ux * (toRadius + 8)} ${b.y - uy * (toRadius + 8)}`;
}
export function mapClusters(
  entries: Entry[],
  profiles: Record<string, ActorProfile>,
  camera: Camera,
  counts: Record<string, number>,
  sized = true,
): MapCluster[] {
  const clusters: MapCluster[] = [];
  const sorted = [...entries].sort(
    (a, b) => counts[b.id] - counts[a.id] || a.id.localeCompare(b.id),
  );
  for (const n of sorted) {
    const profile = profiles[n.id];
    if (
      !profile?.geographic ||
      !n.location ||
      (n.location[0] === 0 && n.location[1] === 0)
    )
      continue;
    const p = screenPoint(profile.coordinates ?? n.location, camera);
    if (p.x < 35 || p.x > mapWidth - 35 || p.y < 40 || p.y > mapHeight - 40)
      continue;
    const radius = markerRadius(counts[n.id], sized);
    const existing = clusters.find(
      (c) => Math.hypot(c.x - p.x, c.y - p.y) < c.radius + radius + 13,
    );
    if (existing) existing.entries.push(n);
    else clusters.push({ entries: [n], ...p, radius, anchor: n });
  }
  return clusters;
}
