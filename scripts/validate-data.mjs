import { buildNetworkLayout, dimensions } from '../lib/explore.ts';
import {
  connectionCounts,
  connectionCurve,
  clusterCities,
  clusterLabel,
  locationCaption,
  fanPositions,
  separateBubbles,
  mapClusters,
  mapPresets,
  screenPoint,
} from '../lib/geography.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const data = JSON.parse(
  fs.readFileSync(new URL('../lib/governance-data.json', import.meta.url)),
);
const profiles = JSON.parse(
  fs.readFileSync(new URL('../lib/actor-profiles.json', import.meta.url)),
);
const tour = JSON.parse(
  fs.readFileSync(new URL('../lib/tutorial.json', import.meta.url)),
);
const ids = new Set(data.nodes.map((n) => n.id)),
  sourceIds = new Set(data.sources.map((s) => s.id));
assert.equal(ids.size, data.nodes.length, 'Unique entry IDs');
assert.equal(sourceIds.size, data.sources.length, 'Unique source IDs');
const layers = new Set(['Legal', 'Institutional', 'Voluntary', 'Corporate']);
const values = new Set([
  'binding',
  'conditional',
  'internal',
  'voluntary',
  'research',
  'none',
  'future',
]);
const horizons = new Set([
  'Immediate response',
  'Before release',
  'Ongoing oversight',
  'Long-term capacity',
]);
for (const n of data.nodes) {
  assert(layers.has(n.layer), `${n.id}: layer`);
  assert.equal(n.powers.length, 4, `${n.id}: four distinct powers`);
  assert(n.sources.length > 0, `${n.id}: citations required`);
  assert(
    n.horizons.length > 0 && n.horizons.every((h) => horizons.has(h)),
    `${n.id}: horizons`,
  );
  if (n.location === null) {
    assert(
      n.kind === 'Mechanism' ||
        (profiles[n.id]?.locationType === 'distributed' &&
          !profiles[n.id]?.geographic),
      `${n.id}: actors without coordinates must explicitly be distributed`,
    );
  } else {
    assert(
      n.location.length === 2 && n.location.every(Number.isFinite),
      `${n.id}: coordinates`,
    );
    assert(
      n.location[0] >= -180 &&
        n.location[0] <= 180 &&
        n.location[1] >= -90 &&
        n.location[1] <= 90,
      `${n.id}: valid coordinates`,
    );
    assert(
      n.location[0] !== 0 || n.location[1] !== 0,
      `${n.id}: do not use Null Island as a location`,
    );
  }
  n.powers.forEach((p) =>
    assert(values.has(p.value) && p.detail, `${n.id}: scoped power`),
  );
  n.sources.forEach((s) =>
    assert(sourceIds.has(s), `${n.id}: missing source ${s}`),
  );
}
for (const e of data.edges) {
  assert(
    ids.has(e.from) && ids.has(e.to),
    `Missing endpoint: ${e.from} → ${e.to}`,
  );
  assert(sourceIds.has(e.source), `Uncited relationship: ${e.from} → ${e.to}`);
  assert(e.from !== e.to, 'No self loops');
}
for (const s of data.sources) {
  assert(new URL(s.url).protocol === 'https:', `HTTPS source: ${s.id}`);
}
for (const t of tour) {
  t.nodes.forEach((n) => assert(ids.has(n), `Tutorial missing ${n}`));
  t.sources.forEach((s) =>
    assert(sourceIds.has(s), `Tutorial missing source ${s}`),
  );
  assert(
    t.nodes.length > 0 && t.body && t.lesson && t.gapType,
    'Complete tutorial step',
  );
}
const get = (id) => data.nodes.find((n) => n.id === id);
assert(
  get('nyraise').powers.every((p) => p.value === 'future'),
  'NY RAISE is future, not current authority',
);
assert.equal(
  get('caloes').powers[1].value,
  'none',
  'Cal OES intake is not a general compulsion power',
);
for (const id of ['aisi', 'caisi', 'metr'])
  assert.equal(
    get(id).powers[1].value,
    'none',
    `${id}: voluntary access is not compelled disclosure`,
  );
assert.equal(
  get('msit').status,
  'In force; enforcement grace',
  'Korea grace period remains visible',
);
assert(
  data.sources.filter((s) => s.supplied).length >= 10,
  'All supplied readings represented',
);
console.log(
  `Validated ${ids.size} entries, ${data.edges.length} sourced edges, ${sourceIds.size} sources and ${tour.length} tutorial steps.`,
);

for (const dimension of dimensions) {
  for (const entries of [
    data.nodes,
    data.nodes.filter((n) => n.featured),
    ...Array.from(new Set(data.nodes.map((n) => n.region))).map((region) =>
      data.nodes.filter((n) => n.region === region),
    ),
  ]) {
    const layout = buildNetworkLayout(entries, dimension);
    assert.equal(
      Object.keys(layout.positions).length,
      entries.length,
      `Every entry placed for ${dimension}`,
    );
    for (const n of entries) {
      const p = layout.positions[n.id];
      assert(Number.isFinite(p.x) && Number.isFinite(p.y));
      assert(
        p.x + 159 <= layout.width && p.y + 66 <= layout.height,
        `No cropped node ${n.id}`,
      );
    }
    assert.equal(
      new Set(Object.values(layout.positions).map((p) => `${p.x},${p.y}`)).size,
      entries.length,
      `No overlapping cards for ${dimension}`,
    );
  }
}
console.log(
  'All five layouts cover every entry, core subset and regional filter without missing or overlapping positions.',
);

const counts = connectionCounts(data.nodes, data.edges);
for (const n of data.nodes) {
  const p = profiles[n.id];
  assert(p, `${n.id}: actor profile exists`);
  if (p.geographic) {
    assert(
      n.kind !== 'Mechanism' && n.location && p.city,
      `${n.id}: meaningful physical anchor`,
    );
    const coords = p.coordinates ?? n.location;
    assert(
      coords.length === 2 && coords.every(Number.isFinite),
      `${n.id}: finite map coordinates`,
    );
    assert(
      Math.abs(coords[0]) <= 180 && Math.abs(coords[1]) <= 90,
      `${n.id}: valid map coordinates`,
    );
  }
  if (p.locationVerifiedAt) {
    assert(
      p.locationSource && p.locationType && p.locationLabel,
      `${n.id}: location checks include primary source and qualification`,
    );
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(p.locationVerifiedAt),
      `${n.id}: location check date`,
    );
  }
  for (const field of ['locationSource', 'coordinateSource']) {
    if (p[field])
      assert.equal(
        new URL(p[field]).protocol,
        'https:',
        `${n.id}: ${field} provenance`,
      );
  }
  if (p.locationType === 'distributed') {
    assert.equal(
      p.geographic,
      false,
      `${n.id}: distributed actors are not pinned`,
    );
    assert.equal(
      p.city,
      null,
      `${n.id}: no invented city for distributed actor`,
    );
    assert.equal(
      n.location,
      null,
      `${n.id}: no legacy coordinates for distributed actor`,
    );
    assert(
      !p.coordinates,
      `${n.id}: no coordinate override for distributed actor`,
    );
  }
  if (p.logo) {
    assert(
      fs.existsSync(new URL(`../public${p.logo}`, import.meta.url)),
      `${n.id}: local logo exists`,
    );
    assert(
      new URL(p.logoSource).protocol === 'https:',
      `${n.id}: icon provenance`,
    );
  }
}
for (const [name, camera] of Object.entries(mapPresets)) {
  const clusters = mapClusters(data.nodes, profiles, camera, counts);
  const members = clusters.flatMap((c) => c.entries.map((n) => n.id));
  assert.equal(
    new Set(members).size,
    members.length,
    `${name}: each actor appears once`,
  );
  for (const c of clusters) {
    const cities = clusterCities(c, profiles);
    if (camera.scale >= 2)
      assert.equal(
        cities.length,
        1,
        `${name}: regional clusters never merge distinct cities`,
      );
    assert.equal(
      clusterLabel(c, profiles),
      cities.length === 1
        ? cities[0]
        : `${c.entries.length} actors · ${cities.length} cities`,
      `${name}: multi-city clusters use neutral labels`,
    );
    const actual = screenPoint(
      profiles[c.anchor.id].coordinates ?? c.anchor.location,
      camera,
    );
    assert.deepEqual(
      { x: c.x, y: c.y },
      actual,
      `${name}: grouping must never displace its geographic anchor`,
    );
  }
}
const korea = mapClusters(data.nodes, profiles, mapPresets.Asia, counts);
const koreanInstitute = korea.find((c) =>
  c.entries.some((n) => n.id === 'kraisi'),
);
const koreanMinistry = korea.find((c) =>
  c.entries.some((n) => n.id === 'msit'),
);
assert(
  koreanInstitute && koreanMinistry && koreanInstitute !== koreanMinistry,
  'Seongnam and Sejong stay distinct in Asia view',
);
assert.equal(
  profiles.caloes.city,
  'Mather',
  'Cal OES remains in Mather, not Sacramento city',
);
assert.deepEqual(
  profiles.caloes.coordinates,
  [-121.28315, 38.54883],
  'Cal OES uses the sourced Mather city point',
);
assert(
  locationCaption(profiles.xai).includes('Historical'),
  'Historical anchor qualification remains visible',
);
assert(
  locationCaption(profiles.board).includes('Secretariat'),
  'Board map callout identifies secretariat base',
);
assert.equal(
  profiles.panel.locationType,
  'secretariat-base',
  'Scientific Panel anchor represents administrative support, not all experts',
);
assert(
  locationCaption(profiles.panel).includes('AI Office support base') &&
    profiles.panel.locationNote.includes('Joint Research Centre'),
  'Scientific Panel retains the qualification of its shared secretariat',
);
for (const [region, id] of [
  ['USA', 'openai'],
  ['Europe', 'office'],
  ['Asia', 'cac'],
]) {
  assert(
    mapClusters(data.nodes, profiles, mapPresets[region], counts).some((c) =>
      c.entries.some((n) => n.id === id),
    ),
    `${region}: primary actor visible`,
  );
}
assert(
  !mapClusters(data.nodes, profiles, mapPresets.World, counts).some((c) =>
    c.entries.some((n) => ['report', 'internalreport'].includes(n.id)),
  ),
  'Non-geographic mechanisms must not reappear in the Gulf of Guinea',
);
console.log(
  'Map anchors, regional presets, non-geographic exclusions and local logo provenance validated.',
);

// Crowded groups must unfold without losing actors or moving the stored anchor.
for (const count of [2, 7, 14]) {
  for (const [x, y] of [
    [40, 40],
    [600, 320],
    [1160, 600],
  ]) {
    const cluster = {
      entries: data.nodes.slice(0, count),
      anchor: data.nodes[0],
      x,
      y,
      radius: 30,
    };
    const original = JSON.stringify(cluster);
    const pins = fanPositions(cluster);
    assert.equal(new Set(pins.map((p) => p.entry.id)).size, count);
    assert.equal(
      JSON.stringify(cluster),
      original,
      'Unfolding is display-only',
    );
    pins.forEach((p) =>
      assert(
        p.x >= 40 && p.x <= 1160 && p.y >= 40 && p.y <= 600,
        'Unfolded bubbles stay within the map',
      ),
    );
  }
}
const crowded = Array.from({ length: 14 }, (_, id) => ({
  id,
  x: 600,
  y: 320,
  radius: 30,
}));
const separated = separateBubbles(crowded);
for (let i = 0; i < separated.length; i++)
  for (let j = i + 1; j < separated.length; j++) {
    assert(
      Math.hypot(
        separated[i].x - separated[j].x,
        separated[i].y - separated[j].y,
      ) >= 59,
      'Connected bubbles do not overlap',
    );
  }
assert(
  crowded.every((p) => p.x === 600 && p.y === 320),
  'Collision handling does not mutate geographic input',
);
assert.equal(
  connectionCurve({ x: 1, y: 1 }, { x: 1, y: 1 }),
  '',
  'No invalid zero-length curve',
);
assert(
  !/NaN|Infinity/.test(connectionCurve({ x: 100, y: 100 }, { x: 700, y: 350 })),
  'Finite connection geometry',
);
assert.notEqual(
  connectionCurve({ x: 100, y: 100 }, { x: 700, y: 350 }),
  connectionCurve({ x: 700, y: 350 }, { x: 100, y: 100 }),
  'Relationship direction retained',
);
console.log(
  'Hover fan geometry, crowded connection bubbles and directed curves validated.',
);
