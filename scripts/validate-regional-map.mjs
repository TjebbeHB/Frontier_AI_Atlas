import assert from 'node:assert/strict';
import fs from 'node:fs';
import { regionalBounds, regionalFrame, projectRegion, unprojectRegion, inRegionalBounds, regionalConnection } from '../lib/regional-geography.ts';
import { sainChapters } from '../lib/sain.ts';

const geography = JSON.parse(fs.readFileSync(new URL('../lib/regional-countries.json', import.meta.url)));
const close = (a, b, label, tolerance = 1e-8) => assert(Math.abs(a - b) < tolerance, `${label}: ${a} != ${b}`);
assert.deepEqual(geography.bounds, [regionalBounds.west, regionalBounds.south, regionalBounds.east, regionalBounds.north], 'Data and pin projection must use identical geographic bounds');
assert.equal(geography.width, regionalFrame.width);
assert.equal(geography.height, regionalFrame.height);
assert.equal(geography.padding, regionalFrame.padding);
let roundtrips = 0;
for (let lon = -1; lon < 8; lon += .3) for (let lat = 48.5; lat < 53.65; lat += .3) {
  const p = projectRegion([lon, lat]);
  const result = unprojectRegion(p.x, p.y);
  close(result[0], lon, 'Longitude survives projection');
  close(result[1], lat, 'Latitude survives projection');
  assert(p.x > 0 && p.x < regionalFrame.width && p.y > 0 && p.y < regionalFrame.height, 'Requested region fits viewport');
  roundtrips++;
}
const cityAnchors = { London: [-0.12574, 51.50853], Groningen: [6.56667, 53.21917], Utrecht: [5.12222, 52.09083], Amsterdam: [4.88969, 52.37403], Paris: [2.3488, 48.85341], Brussels: [4.34878, 50.85045] };
for (const [city, point] of Object.entries(cityAnchors)) assert(inRegionalBounds(point), `${city} must appear within requested map`);
assert(!inRegionalBounds([-122.4, 37.8]), 'San Francisco is outside regional map');
assert(!inRegionalBounds([NaN, 52]), 'Invalid coordinates cannot get a marker');
assert(projectRegion(cityAnchors.Groningen).y < projectRegion(cityAnchors.Paris).y, 'Groningen is north of Paris');
assert(projectRegion(cityAnchors.London).x < projectRegion(cityAnchors.Amsterdam).x, 'London is west of Netherlands');
assert(projectRegion(cityAnchors.Amsterdam).x < projectRegion(cityAnchors.Utrecht).x, 'Amsterdam is west of Utrecht');
for (const chapter of sainChapters) {
  assert(inRegionalBounds(chapter.coordinates), `${chapter.id} has an in-bounds city anchor`);
  if (cityAnchors[chapter.city]) assert.deepEqual(chapter.coordinates, cityAnchors[chapter.city], 'Chapter anchor must match verified city');
  assert(chapter.coordinateSource.startsWith('https://'), 'Every chapter has a city-coordinate source');
  const path = regionalConnection(cityAnchors.Groningen, chapter.coordinates);
  const target = projectRegion(chapter.coordinates);
  assert(path.endsWith(`${target.x},${target.y}`), 'Community relationship ends on exact geographic anchor');
}
// Ray casting verifies the packaged coastline against real land/water control
// points, catching a mismatched projection and the old coarse Dutch outline.
function inShapes(coords, shapes) {
  const point = projectRegion(coords);
  return shapes.some((country) => {
    let inside = false;
    for (const ring of country.path.split('Z').filter(Boolean)) {
      const vertices = [...ring.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((match) => [+match[1], +match[2]]);
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const a = vertices[i], b = vertices[j];
        if ((a[1] > point.y) !== (b[1] > point.y) && point.x < (b[0] - a[0]) * (point.y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
    }
    return inside;
  });
}
function onLand(coords, countryName) {
  return inShapes(coords, geography.countries.filter((c) => !countryName || c.name === countryName)) && !inShapes(coords, geography.lakes);
}
for (const [city, nation] of [['London', 'United Kingdom'], ['Groningen', 'Netherlands'], ['Utrecht', 'Netherlands'], ['Amsterdam', 'Netherlands'], ['Paris', 'France'], ['Brussels', 'Belgium']]) assert(onLand(cityAnchors[city], nation), `${city} marker is on ${nation} land, not at sea`);
assert(!onLand([2.5, 52.7]), 'North Sea remains water');
assert(!onLand([5.4, 52.75]), 'IJsselmeer remains water instead of filled Dutch land');
assert(onLand([5.75, 53.45], 'Netherlands'), 'Ameland is retained in the detailed coastline');
let vertices = 0;
for (const country of geography.countries) for (const match of country.path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)) {
  const x = +match[1], y = +match[2];
  assert(Number.isFinite(x) && Number.isFinite(y));
  assert(x >= 0 && x <= regionalFrame.width && y >= 0 && y <= regionalFrame.height, 'Country outline is clipped inside regional viewport');
  vertices++;
}
console.log(`Regional map verified: ${roundtrips} Mercator roundtrips, ${vertices} detailed coastline vertices, six correct city land anchors, chapter sources, IJsselmeer and Wadden island controls.`);
