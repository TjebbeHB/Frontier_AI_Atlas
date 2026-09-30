import { buildNetworkLayout, dimensions } from '../lib/explore.ts';
import {
  connectionCounts,
  connectionCurve,
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
    assert.equal(n.kind, 'Mechanism', `${n.id}: missing actor location`);
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

const profiles = JSON.parse(
  fs.readFileSync(new URL('../lib/actor-profiles.json', import.meta.url)),
);
const counts = connectionCounts(data.nodes, data.edges);
for (const n of data.nodes) {
  const p = profiles[n.id];
  assert(p, `${n.id}: actor profile exists`);
  if (p.geographic)
    assert(
      n.kind !== 'Mechanism' && n.location && p.city,
      `${n.id}: meaningful physical anchor`,
    );
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
