import assert from 'node:assert/strict';
import fs from 'node:fs';
import { netherlandsCities, normalizeNetherlandsCity } from '../lib/netherlands-cities.ts';
import { arrangeCityLabels, cityLabelPreferences, inNetherlandsBounds, indexJobsByCity, mobileCityLabels, netherlandsBounds, netherlandsFrame, projectNetherlands, unprojectNetherlands } from '../lib/netherlands-geography.ts';
import { isExpired, jobCities } from '../lib/jobs/index.ts';
import { sainChapters } from '../lib/sain.ts';

const dataset = JSON.parse(fs.readFileSync(new URL('../lib/jobs/data.json', import.meta.url)));
const geometry = JSON.parse(fs.readFileSync(new URL('../lib/netherlands-countries.json', import.meta.url)));
const close = (a, b, label) => assert(Math.abs(a - b) < 1e-8, `${label}: ${a} vs ${b}`);
const cityNames = netherlandsCities.map((city) => city.name);
assert.equal(cityNames.length, new Set(cityNames).size, 'City names are unique');
assert.deepEqual(geometry.bounds, [netherlandsBounds.west, netherlandsBounds.south, netherlandsBounds.east, netherlandsBounds.north]);
assert.equal(geometry.width, netherlandsFrame.width);
assert.equal(geometry.height, netherlandsFrame.height);
assert.equal(geometry.padding, netherlandsFrame.padding);
let roundtrips = 0;
for (let lon = 3.1; lon < 7.35; lon += .1) for (let lat = 50.65; lat < 53.65; lat += .1) {
  const p = projectNetherlands([lon, lat]), back = unprojectNetherlands(p.x, p.y);
  close(back[0], lon, 'Longitude roundtrip'); close(back[1], lat, 'Latitude roundtrip');
  assert(p.x >= 0 && p.x <= netherlandsFrame.width && p.y >= 0 && p.y <= netherlandsFrame.height);
  roundtrips++;
}
function inShapes(coords, shapes) {
  const point = projectNetherlands(coords);
  return shapes.some((shape) => {
    let inside = false;
    for (const ring of shape.path.split('Z').filter(Boolean)) {
      const vertices = [...ring.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((match) => [+match[1], +match[2]]);
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const a = vertices[i], b = vertices[j];
        if ((a[1] > point.y) !== (b[1] > point.y) && point.x < (b[0] - a[0]) * (point.y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
    }
    return inside;
  });
}
const onDutchLand = (coords) => inShapes(coords, geometry.countries.filter((country) => country.name === 'Netherlands')) && !inShapes(coords, geometry.lakes);
function onRoundedDutchBoundary(coords) {
  const point = projectNetherlands(coords);
  for (const country of geometry.countries.filter((item) => item.name === 'Netherlands')) for (const ring of country.path.split('Z').filter(Boolean)) {
    const vertices = [...ring.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((match) => [+match[1], +match[2]]);
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const a = vertices[i], b = vertices[j], dx = b[0] - a[0], dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((point.x - a[0]) * dx + (point.y - a[1]) * dy) / (dx * dx + dy * dy)));
      if (Math.hypot(point.x - (a[0] + t * dx), point.y - (a[1] + t * dy)) < .02) return true;
    }
  }
  return false;
}
for (const city of netherlandsCities) {
  assert(inNetherlandsBounds(city.coordinates), `${city.name} lies in detail bounds`);
  assert(!inNetherlandsBounds([...city.coordinates].reverse()), `${city.name} swapped coordinates must be rejected`);
  assert(onDutchLand(city.coordinates) || onRoundedDutchBoundary(city.coordinates), `${city.name} anchor lies on Dutch land or its subpixel-rounded border`);
  assert(/^https:\/\/www\.geonames\.org\/\d+\//.test(city.coordinateSource), `${city.name} has individual source provenance`);
}
for (const name of ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Enschede', 'Delft', 'Leiden', 'Nijmegen', 'Arnhem', 'Wageningen', 'Maastricht', 'Tilburg', 'Zwolle', 'Leeuwarden', 'Almere', 'Haarlem', 'Breda']) assert(netherlandsCities.find((city) => city.name === name)?.major, `${name} remains visible even without listings`);
assert(onDutchLand([5.75, 53.45]), 'Ameland is retained');
assert(!onDutchLand([5.4, 52.75]), 'IJsselmeer is water');
assert(!onDutchLand([3.5, 52.7]), 'North Sea is water');
const maastricht = netherlandsCities.find((city) => city.name === 'Maastricht');
assert(maastricht && projectNetherlands(maastricht.coordinates).y < netherlandsFrame.height - 34, 'Southern Limburg fits within map');
for (const chapter of sainChapters) assert.deepEqual(netherlandsCities.find((city) => city.name === chapter.city)?.coordinates, chapter.coordinates, `${chapter.city} chapter halo shares true city anchor`);
assert.equal(normalizeNetherlandsCity('Den Haag'), 'The Hague');
assert.equal(normalizeNetherlandsCity("'s-Hertogenbosch"), 'Den Bosch');
assert.equal(normalizeNetherlandsCity('Almere Stad'), 'Almere');

const fixtures = [
  { id: 'multi', city: 'Groningen / Eindhoven', cities: ['Groningen', 'Eindhoven', 'Groningen'] },
  { id: 'single', city: 'Amsterdam' },
  { id: 'remote', city: 'Netherlands / remote', cities: [] },
  { id: 'unspecified', city: 'Netherlands', cities: [] },
  { id: 'unknown', city: 'Unverified city', cities: ['Unverified city'] },
];
const testIndex = indexJobsByCity([...fixtures, fixtures[0]], jobCities, cityNames);
assert.equal(testIndex.unique.length, 5, 'Duplicated input listings count once globally');
assert.equal(testIndex.index.get('Groningen').length, 1, 'Multi-city role counts once in Groningen');
assert.equal(testIndex.index.get('Eindhoven').length, 1, 'Same role also counts once in Eindhoven');
assert.equal(testIndex.index.get('Amsterdam').length, 1, 'Only explicit Amsterdam job gets Amsterdam pin');
assert.equal(testIndex.index.get('Maastricht').length, 0, 'Zero-role cities remain selectable without inventing roles');
assert.deepEqual(testIndex.unlocated.map((job) => job.id).sort(), ['remote', 'unknown', 'unspecified'], 'Remote, unknown and nationwide roles remain separate, without invented city pins');
assert.equal(indexJobsByCity([], jobCities, cityNames).unique.length, 0, 'Empty filters produce zero total');
assert.equal(indexJobsByCity([], jobCities, cityNames).index.size, netherlandsCities.length, 'City landmarks survive empty results');

const jobs = dataset.jobs.filter((job) => !isExpired(job, dataset.checkedAt));
const indexed = indexJobsByCity(jobs, (job) => jobCities(job).map(normalizeNetherlandsCity), cityNames);
for (const job of jobs) for (const city of jobCities(job)) assert(cityNames.includes(normalizeNetherlandsCity(city)), `${job.id}: named job city ${city} needs a verified map anchor`);
for (const [city, roles] of indexed.index) {
  assert.equal(roles.length, new Set(roles.map((job) => job.id)).size, `${city} has no duplicate job counts`);
  assert.equal(roles.length, jobs.filter((job) => jobCities(job).map(normalizeNetherlandsCity).includes(city)).length, `${city} count matches source listings`);
}
assert.equal(indexed.unique.length - indexed.unlocated.length, new Set([...indexed.index.values()].flat().map((job) => job.id)).size, 'Unique map total reconciles with every pin');

let layouts = 0;
const stableLayouts = new Map();
const visibleCities = netherlandsCities.filter((city) => city.major || indexed.index.get(city.name).length);
for (const scale of [1, 1.3, 1.6, 1.85]) for (const selectedCity of ['', ...visibleCities.map((city) => city.name)]) {
  const mobile = scale > 1.25;
  const labelCities = visibleCities.filter((city) => !mobile || mobileCityLabels.has(city.name) || city.name === selectedCity);
  const labels = arrangeCityLabels(labelCities.map((city) => ({ name: city.name, ...projectNetherlands(city.coordinates), preference: cityLabelPreferences[city.name], count: indexed.index.get(city.name).length, priority: mobile && !mobileCityLabels.has(city.name) ? -1 : 10 })), scale, visibleCities.map((city) => ({ name: city.name, ...projectNetherlands(city.coordinates) })));
  assert.equal(labels.length, labelCities.length, 'Every requested landmark receives a label');
  assert(!selectedCity || labels.some((label) => label.name === selectedCity), 'Selecting an unlabelled mobile dot reveals its city name');
  if (mobile) assert(labels.length <= 13, 'Mobile map avoids a dense cloud of displaced labels');
  if (!selectedCity) stableLayouts.set(scale, labels);
  else assert.deepEqual(labels.filter((label) => !mobile || mobileCityLabels.has(label.name)), stableLayouts.get(scale), 'Selecting cities does not shuffle the persistent landmark labels');
  for (let i = 0; i < labels.length; i++) {
    const a = labels[i], city = netherlandsCities.find((item) => item.name === a.name), anchor = projectNetherlands(city.coordinates);
    assert.equal(a.anchorX, anchor.x, 'Label adjustment never moves true longitude');
    assert.equal(a.anchorY, anchor.y, 'Label adjustment never moves true latitude');
    assert(a.x >= 0 && a.y >= 0 && a.x + a.width <= netherlandsFrame.width && a.y + a.height <= netherlandsFrame.height, 'Label box stays visible');
    const leader = Math.hypot(a.anchorX - Math.max(a.x, Math.min(a.x + a.width, a.anchorX)), a.anchorY - Math.max(a.y, Math.min(a.y + a.height, a.anchorY)));
    assert(leader < (scale === 1 ? 120 : 220), `${a.name} callout remains near its true city, not displaced across the country`);
    for (let j = i + 1; j < labels.length; j++) {
      const b = labels[j];
      assert(!(a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y), `Readable labels: ${a.name}/${b.name}, scale ${scale}, selected ${selectedCity}`);
    }
  }
  layouts++;
}
console.log(`Netherlands map verified: ${netherlandsCities.length} sourced land anchors, ${roundtrips} Mercator roundtrips, ${jobs.length} listings reconciled, ${layouts} desktop/mobile label layouts, multi-city deduplication and remote/no-city safeguards.`);
