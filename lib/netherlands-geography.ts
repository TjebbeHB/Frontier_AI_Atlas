/** The Netherlands detail map uses true [longitude, latitude] city anchors. */
export type NetherlandsCoordinates = [number, number];
export const netherlandsBounds = { west: 3.1, south: 50.65, east: 7.35, north: 53.65 };
export const netherlandsFrame = { width: 880, height: 1020, padding: 34 };
const radians = Math.PI / 180;
const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat * radians / 2)) / radians;
const lowY = mercatorY(netherlandsBounds.south), highY = mercatorY(netherlandsBounds.north);
const scale = Math.min((netherlandsFrame.width - 2 * netherlandsFrame.padding) / (netherlandsBounds.east - netherlandsBounds.west), (netherlandsFrame.height - 2 * netherlandsFrame.padding) / (highY - lowY));
export function inNetherlandsBounds([lon, lat]: NetherlandsCoordinates) {
  return Number.isFinite(lon) && Number.isFinite(lat) && lon >= netherlandsBounds.west && lon <= netherlandsBounds.east && lat >= netherlandsBounds.south && lat <= netherlandsBounds.north;
}
export function projectNetherlands([lon, lat]: NetherlandsCoordinates) {
  return { x: netherlandsFrame.width / 2 + (lon - (netherlandsBounds.west + netherlandsBounds.east) / 2) * scale,
    y: netherlandsFrame.height / 2 - (mercatorY(lat) - (lowY + highY) / 2) * scale };
}
export function unprojectNetherlands(x: number, y: number): NetherlandsCoordinates {
  return [(x - netherlandsFrame.width / 2) / scale + (netherlandsBounds.west + netherlandsBounds.east) / 2,
    (2 * Math.atan(Math.exp(((netherlandsFrame.height / 2 - y) / scale + (lowY + highY) / 2) * radians)) - Math.PI / 2) / radians];
}
export type CityLabel = { name: string; x: number; y: number; anchorX: number; anchorY: number; width: number; height: number };
export const cityLabelPreferences: Record<string, [number, number]> = {
  Amsterdam: [29, -28], Haarlem: [-30, -23], Almere: [27, -22], Utrecht: [28, 15],
  Rotterdam: [-30, 33], 'The Hague': [-30, -29], Delft: [-30, 3], Leiden: [-30, -24],
  Groningen: [27, -24], Leeuwarden: [-27, -28], Arnhem: [30, -23], Nijmegen: [28, 26],
  Wageningen: [-30, 15], Eindhoven: [28, 25], Tilburg: [0, -30], Breda: [-29, 10],
  Enschede: [-30, 24], Zwolle: [28, -24], Maastricht: [27, 3], 'Den Bosch': [27, -22],
};
/** Small screens retain every dot; these landmarks get persistent labels. */
export const mobileCityLabels = new Set(['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Enschede', 'Nijmegen', 'Arnhem', 'Maastricht', 'Zwolle', 'Leeuwarden']);
/** Total roles are unique; a multi-location role is present once per named city. */
export function indexJobsByCity<T extends { id: string }>(jobs: T[], namesForJob: (job: T) => string[], cityNames: string[]) {
  const unique = [...new Map(jobs.map((job) => [job.id, job])).values()];
  const index = new Map(cityNames.map((name) => [name, [] as T[]]));
  const unlocated: T[] = [];
  for (const job of unique) {
    const mapped = [...new Set(namesForJob(job))].filter((name) => index.has(name));
    if (mapped.length === 0) unlocated.push(job);
    for (const name of mapped) index.get(name)!.push(job);
  }
  return { unique, index, unlocated };
}
/** Keep anchors fixed; only labels move, with stems showing their true city dot. */
export function arrangeCityLabels(points: { name: string; x: number; y: number; preference?: [number, number]; priority: number; count?: number }[], labelScale = 1, obstacles: { name: string; x: number; y: number }[] = points): CityLabel[] {
  const placed: CityLabel[] = [];
  const density = new Map(points.map((point) => [point.name, obstacles.reduce((sum, other) => sum + Math.exp(-Math.hypot(point.x - other.x, point.y - other.y) / 65), 0)]));
  for (const point of [...points].sort((a, b) => Number(a.priority < 0) - Number(b.priority < 0) || density.get(b.name)! - density.get(a.name)! || a.name.localeCompare(b.name))) {
    const width = (point.name.length * 8.8 + (point.count ? 36 : 16)) * labelScale, height = 28 * labelScale;
    const candidates: [number, number][] = [point.preference ?? [30, -24]];
    for (const distance of [16, 28, 42, 60, 80, 105, 125]) for (const [dx, dy] of [[1, -1], [-1, -1], [1, 1], [-1, 1], [1, 0], [-1, 0], [0, -1], [0, 1]]) candidates.push([dx * distance * labelScale, dy * distance * labelScale]);
    let best: CityLabel | null = null, bestScore = Infinity;
    for (const [dx, dy] of candidates) {
      const x = Math.max(8, Math.min(netherlandsFrame.width - width - 8, point.x + dx - (dx < 0 ? width : dx === 0 ? width / 2 : 0)));
      const y = Math.max(8, Math.min(netherlandsFrame.height - height - 8, point.y + dy - height / 2));
      const proposal = { name: point.name, x, y, anchorX: point.x, anchorY: point.y, width, height };
      const overlap = placed.filter((label) => x < label.x + label.width + 5 && x + width + 5 > label.x && y < label.y + label.height + 5 && y + height + 5 > label.y).length;
      const dots = obstacles.filter((p) => p.name !== point.name && p.x > x - 10 && p.x < x + width + 10 && p.y > y - 10 && p.y < y + height + 10).length;
      const nearestX = Math.max(x, Math.min(x + width, point.x)), nearestY = Math.max(y, Math.min(y + height, point.y));
      const score = overlap * 10000 + dots * 500 + Math.hypot(nearestX - point.x, nearestY - point.y) + Math.hypot(x + width / 2 - point.x, y + height / 2 - point.y) * .2 + (dx === candidates[0][0] && dy === candidates[0][1] ? -8 : 0);
      if (score < bestScore) { best = proposal; bestScore = score; }
    }
    // Search nearby free space only: distant callouts can misleadingly suggest
    // another city even when a long line still reaches the correct anchor.
    if (bestScore >= 10000) {
      const reach = 135 * labelScale;
      for (let y = Math.max(8, point.y - reach - height); y < Math.min(netherlandsFrame.height - height - 8, point.y + reach); y += 8) for (let x = Math.max(8, point.x - reach - width); x < Math.min(netherlandsFrame.width - width - 8, point.x + reach); x += 8) {
        if (placed.some((label) => x < label.x + label.width + 5 && x + width + 5 > label.x && y < label.y + label.height + 5 && y + height + 5 > label.y)) continue;
        if (obstacles.some((p) => p.name !== point.name && p.x > x - 9 && p.x < x + width + 9 && p.y > y - 9 && p.y < y + height + 9)) continue;
        const nearestX = Math.max(x, Math.min(x + width, point.x)), nearestY = Math.max(y, Math.min(y + height, point.y));
        const score = Math.hypot(nearestX - point.x, nearestY - point.y) + Math.hypot(x + width / 2 - point.x, y + height / 2 - point.y) * .2;
        if (score < bestScore) { best = { name: point.name, x, y, anchorX: point.x, anchorY: point.y, width, height }; bestScore = score; }
      }
    }
    if (best) placed.push(best);
  }
  return placed;
}
