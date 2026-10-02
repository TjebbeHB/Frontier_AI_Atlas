/** City coordinates and basemap share this Mercator projection, with no pin offsets. */
export type RegionalCoordinates = [number, number];
export const regionalBounds = { west: -1.2, south: 48.45, east: 8, north: 53.65 };
export const regionalFrame = { width: 940, height: 820, padding: 34 };
const radians = Math.PI / 180;
function mercatorY(latitude: number) {
  return Math.log(Math.tan(Math.PI / 4 + latitude * radians / 2)) / radians;
}
const lowY = mercatorY(regionalBounds.south);
const highY = mercatorY(regionalBounds.north);
const scale = Math.min(
  (regionalFrame.width - 2 * regionalFrame.padding) / (regionalBounds.east - regionalBounds.west),
  (regionalFrame.height - 2 * regionalFrame.padding) / (highY - lowY),
);
export function inRegionalBounds([lon, lat]: RegionalCoordinates) {
  return Number.isFinite(lon) && Number.isFinite(lat) && lon >= regionalBounds.west && lon <= regionalBounds.east && lat >= regionalBounds.south && lat <= regionalBounds.north;
}
export function projectRegion([lon, lat]: RegionalCoordinates) {
  return {
    x: regionalFrame.width / 2 + (lon - (regionalBounds.west + regionalBounds.east) / 2) * scale,
    y: regionalFrame.height / 2 - (mercatorY(lat) - (lowY + highY) / 2) * scale,
  };
}
export function unprojectRegion(x: number, y: number): RegionalCoordinates {
  return [
    (x - regionalFrame.width / 2) / scale + (regionalBounds.west + regionalBounds.east) / 2,
    (2 * Math.atan(Math.exp(((regionalFrame.height / 2 - y) / scale + (lowY + highY) / 2) * radians)) - Math.PI / 2) / radians,
  ];
}
/** The curve ends on the geographic dots; it is a relationship, not a transport route. */
export function regionalConnection(a: RegionalCoordinates, b: RegionalCoordinates) {
  const from = projectRegion(a), to = projectRegion(b);
  const dx = to.x - from.x, dy = to.y - from.y;
  return `M${from.x},${from.y}Q${(from.x + to.x) / 2 - dy * 0.16},${(from.y + to.y) / 2 + dx * 0.16} ${to.x},${to.y}`;
}
