import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  angularDistance, arrangeRaisedPins, globeFrame, globePresets, greatCirclePath,
  greatCirclePoint, inverseMercatorPoint, mercatorTexturePoint, projectGlobe,
  unprojectGlobe, visibleCurveSegments,
} from '../lib/globe-geometry.ts';

const close = (actual, expected, label, tolerance = 1e-7) => assert(Math.abs(actual - expected) < tolerance, `${label}: ${actual} vs ${expected}`);
const camera = { center: [0, 0], zoom: 1 };
const center = projectGlobe([0, 0], camera);
close(center.x, globeFrame.x, 'Prime meridian at center');
close(center.y, globeFrame.y, 'Equator at center');
close(center.z, 1, 'Center faces viewer');
close(projectGlobe([90, 0], camera).x, globeFrame.x + globeFrame.radius, 'East lies right');
close(projectGlobe([0, 90], camera).y, globeFrame.y - globeFrame.radius, 'North lies up');
assert.equal(projectGlobe([180, 0], camera).visible, false, 'Antipode must be hidden');
assert.equal(unprojectGlobe(-1000, -1000, camera), null, 'Points outside sphere cannot acquire coordinates');
let roundtrips = 0;
for (const view of Object.values(globePresets)) {
  for (let lon = -175; lon <= 180; lon += 10) {
    for (let lat = -85; lat <= 85; lat += 10) {
      const point = projectGlobe([lon, lat], view);
      if (!point.visible || point.z < 1e-6) continue;
      const coordinates = unprojectGlobe(point.x, point.y, view);
      assert(coordinates, 'Visible point has inverse');
      assert(angularDistance([lon, lat], coordinates) < 1e-7, 'Roundtrip preserves exact geographic anchor');
      roundtrips++;
    }
  }
}
close(greatCirclePoint([0, 0], [90, 0], 0.5)[0], 45, 'Great circle midpoint');
for (const [a, b] of [ [[170, 20], [-170, 20]], [[-122.41942, 37.77493], [-0.12574, 51.50853]], [[0, 89], [130, -78]] ]) {
  const midpoint = greatCirclePoint(a, b, 0.5);
  close(angularDistance(a, midpoint) + angularDistance(midpoint, b), angularDistance(a, b), 'Short great-circle distance');
}
assert(greatCirclePoint([-122.41942, 37.77493], [-0.12574, 51.50853], 0.5)[1] > 60, 'Transatlantic route crosses high latitude instead of a flat chord');
assert.equal(greatCirclePath([140, 10], [170, 20], camera), '', 'Wholly rear-side arcs are hidden');
let routeChecks = 0;
for (const view of Object.values(globePresets)) {
  for (let i = 0; i < 100; i++) {
    const a = [(i * 47) % 360 - 180, (i * 23) % 150 - 75];
    const b = [(i * 79 + 33) % 360 - 180, (i * 37 + 13) % 150 - 75];
    const segments = visibleCurveSegments((t) => greatCirclePoint(a, b, t), view, 90, 0.12);
    for (const segment of segments) for (const point of segment) {
      assert(point.z >= -1e-10 && point.visible, 'Arc segments never contain the rear hemisphere');
      assert(Number.isFinite(point.x) && Number.isFinite(point.y), 'Arc coordinates finite');
    }
    assert(!greatCirclePath(a, b, view).includes('NaN'), 'Path contains no NaN');
    routeChecks++;
  }
}
const crossing = visibleCurveSegments((t) => greatCirclePoint([0, 0], [150, 0], t), camera, 50, 0);
assert.equal(crossing.length, 1);
close(crossing[0].at(-1).z, 0, 'Clipping inserts exact horizon');
close(crossing[0].at(-1).x, globeFrame.x + globeFrame.radius, 'Clipped arc ends on sphere limb', 1e-5);
for (const pair of [[0, 0], [0, 89], [-180, 0]]) assert(greatCirclePath(pair, [pair[0] + 180, -pair[1]], camera).match(/NaN|Infinity/) === null, 'Antipodal route is finite');
const coincident = Array.from({ length: 22 }, (_, index) => ({ id: String(index), x: 570, y: 205, anchorX: 570, anchorY: 205, radius: 20 + index % 10 }));
const positioned = arrangeRaisedPins(coincident);
for (let i = 0; i < positioned.length; i++) {
  assert.equal(positioned[i].anchorX, coincident[i].anchorX, 'Displaced logo retains exact anchor x');
  assert.equal(positioned[i].anchorY, coincident[i].anchorY, 'Displaced logo retains exact anchor y');
  for (let j = i + 1; j < positioned.length; j++) assert(Math.hypot(positioned[i].x - positioned[j].x, positioned[i].y - positioned[j].y) > positioned[i].radius + positioned[j].radius + 10, 'Medallions do not overlap');
}
const countries = JSON.parse(fs.readFileSync(new URL('../lib/world-countries.json', import.meta.url)));
let boundaryVertices = 0;
for (const country of countries) for (const match of country.path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)) {
  const x = +match[1], y = +match[2];
  const projected = mercatorTexturePoint(inverseMercatorPoint(x, y));
  if (x !== 1200) close(projected.x, x, 'Country longitude roundtrip', 1e-6);
  close(projected.y, y, 'Country latitude roundtrip', 1e-6);
  boundaryVertices++;
}
const profiles = JSON.parse(fs.readFileSync(new URL('../lib/actor-profiles.json', import.meta.url)));
const dataset = JSON.parse(fs.readFileSync(new URL('../lib/governance-data.json', import.meta.url)));
for (const entry of dataset.nodes) {
  const profile = profiles[entry.id];
  if (!profile?.geographic) continue;
  const anchor = profile.coordinates ?? entry.location;
  assert(anchor && Number.isFinite(anchor[0]) && Number.isFinite(anchor[1]), `${entry.id}: a real anchor is required`);
  const focus = { center: anchor, zoom: 1 };
  close(projectGlobe(anchor, focus).x, globeFrame.x, `${entry.id}: correct focus x`);
  close(projectGlobe(anchor, focus).y, globeFrame.y, `${entry.id}: correct focus y`);
}
console.log(`Globe verified: ${roundtrips} projection roundtrips, ${routeChecks} clipped routes, ${boundaryVertices} real boundary vertices, coincident-pin separation and every mapped actor anchor.`);
