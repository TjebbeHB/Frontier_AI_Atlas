import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Load local TS/TSX without introducing a separate test runtime dependency.
const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const localRequire = specifier => {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
    const base = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
    if (base.endsWith('.json')) return JSON.parse(fs.readFileSync(base, 'utf8'));
    const target = [base, `${base}.ts`, `${base}.tsx`].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    assert(target, `Cannot resolve ${specifier}`);
    return load(target);
  };
  vm.runInThisContext(`(function(require, module, exports) {${code}\n})`, { filename })(localRequire, module, module.exports);
  return module.exports;
}
const old = load(path.join(root, 'lib/scenario/data.ts'));
const positive = load(path.join(root, 'lib/scenario/cooperative.ts'));
const { default: ScenarioMap, scenarioLocations } = load(path.join(root, 'components/scenario-map.tsx'));
const colors = { evidence: '#23a19c', decision: '#6678ff', pressure: '#e68c54', review: '#d2ba61' };
for (const cooperative of [false, true]) {
  const actors = cooperative ? positive.cooperativeActors : old.actors;
  const stages = cooperative ? positive.cooperativeStages : old.stages;
  const sources = new Set([...old.scenarioSources, ...positive.cooperativeSources].map(s => s.id));
  const ids = new Set(actors.map(a => a.id));
  assert.equal(ids.size, actors.length);
  assert.equal(stages.length, 7);
  for (const a of actors) assert(stages.some(s => s.reactions.some(r => r.actor === a.id)), `No story: ${a.id}`);
  for (const stage of stages) {
    for (const source of stage.sources) assert(sources.has(source), `Missing source: ${source}`);
    for (const reaction of stage.reactions) assert(ids.has(reaction.actor));
    for (const edge of stage.interactions) {
      assert(ids.has(edge.from) && ids.has(edge.to));
      assert.notEqual(edge.from, edge.to);
      assert(edge.kind in colors);
    }
    for (let mask = 0; mask < 16; mask++) {
      const design = Object.fromEntries(Object.keys(old.baseline).map((k, i) => [k, Boolean(mask & (1 << i))]));
      assert.equal(old.stageRepaired(stage, design), stage.needs.every(k => design[k]));
    }
    const html = renderToStaticMarkup(React.createElement(ScenarioMap, { actors, stage, cooperative, actorId: 'compact', onActor() {}, colors }));
    assert(!/NaN|Infinity|d=""/.test(html), `Invalid map geometry: ${stage.title}`);
    const arrows = [...html.matchAll(/class="scenario-edge/g)].length;
    const expected = stage.interactions.reduce((n, e) => n + (e.from === 'usstates' || e.to === 'usstates' ? 2 : 1), 0);
    assert.equal(arrows, expected, `Missing geographic interaction: ${stage.title}`);
    for (const a of actors) assert(html.includes(`Read ${a.name.replaceAll('&', '&amp;')}`), `Actor missing on map: ${a.id}`);
  }
}
assert(positive.cooperativeStages.every(s => old.stageRepaired(s, positive.cooperativeDefault)));
for (const key of Object.keys(old.baseline)) {
  const design = { ...positive.cooperativeDefault, [key]: false };
  assert(positive.cooperativeStages.some(s => !old.stageRepaired(s, design)), `Switch has no effect: ${key}`);
}
assert.equal(old.firstUnresolved(old.baseline), 1);
assert.equal(old.firstUnresolved(positive.cooperativeDefault), 4);
assert.equal(positive.cooperativeActors.find(a => a.id === 'usgov').group, 'external');
assert.equal(scenarioLocations.usstates.length, 2);
assert(!scenarioLocations.labs, 'Composite labs must not be assigned a fake HQ');
console.log('Scenario checks passed: both arcs, 16 design combinations, every actor/source/interaction, and 14 geographic renders.');
