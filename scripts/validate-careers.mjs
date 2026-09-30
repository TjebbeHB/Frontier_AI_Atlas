import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const directory=path.resolve(import.meta.dirname,'../lib/careers');
function load(name){
  const module={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(path.join(directory,name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInThisContext(`(function(exports,module){${code}\n})`)(module.exports,module);
  return module.exports;
}
const {opportunities}=load('data');
const {emptyProfile}=load('types');
const {assess,likelyWorkRegions,opportunityStatus}=load('match');
const base={...emptyProfile,tracks:['governance'],experience:'professional',hours:'40',funding:'support',mobility:'move',travel:'yes',home:'EU',passports:['eu'],permission:'need'};
const get=id=>opportunities.find(o=>o.id===id);
const live=id=>({...get(id),status:'rolling',deadline:undefined});
assert.equal(opportunities.length,24);
assert.equal(new Set(opportunities.map(o=>o.id)).size,opportunities.length);
for(const o of opportunities){
  for(const key of ['organisation','title','summary','funding','visa','entry','statusNote']) assert(o[key]?.trim(),`${o.id} missing ${key}`);
  assert(o.sources.length>0);
  for(const url of [o.url,...o.sources.map(s=>s.url)]) assert.equal(new URL(url).protocol,'https:');
  assert(o.tracks.length>0);
  for(const hours of ['5','15','30','40']) for(const mobility of ['stay','visit','move']) for(const travel of ['yes','no','unsure']){
    const result=assess(o,{...base,hours,mobility,travel});
    assert(Number.isFinite(result.score));
    assert(result.reasons.length+result.checks.length+result.conflicts.length>0);
  }
}
for(const name of ['80,000 Hours','Safe AI Netherlands (SAIN)','Pivotal Research','GovAI','Schmidt Sciences','Talos Network','ERA Fellowship','BlueDot Impact','Astralis Foundation','Coefficient Giving']) assert(opportunities.some(o=>o.organisation===name),`Requested organisation missing: ${name}`);
assert.deepEqual(likelyWorkRegions({...base,passports:['eu'],rights:[]}),['EU']);
assert.deepEqual(likelyWorkRegions({...base,passports:['british'],rights:[]}),['UK']);
assert.deepEqual(likelyWorkRegions({...base,passports:['irish'],rights:[]}),['EU','UK']);
assert.deepEqual(likelyWorkRegions({...base,passports:['american'],rights:[]}),['US']);
assert.deepEqual(likelyWorkRegions({...base,passports:['other'],rights:['EU']}),[],'National permission must not establish EU-wide rights');
assert(assess(live('govai-us'),base).conflicts.some(c=>c.includes('permission')),'EU passport alone cannot resolve US work permission');
assert(!assess(live('govai-us'),{...base,passports:['unsure'],permission:'unsure'}).conflicts.length,'Undisclosed permission is unknown, not ineligible');
assert(!assess(live('govai-us'),{...base,rights:['US'],permission:'listed'}).conflicts.length);
assert(assess(live('govai-uk'),base).checks.some(c=>c.includes('Visa assistance')));
assert(!assess(live('govai-uk'),{...base,passports:['irish']}).checks.some(c=>c.includes('Visa assistance')));
assert(assess(live('iaps'),{...base,travel:'no'}).conflicts.some(c=>c.includes('travel')),'Remote IAPS still has required residency');
assert(!assess(live('iaps'),base).conflicts.some(c=>c.includes('permission')),'Remote IAPS must not require blanket US work rights');
assert(assess(live('iaps'),base).checks.some(c=>c.includes('DC and London')));
assert(assess(live('mats'),{...base,hours:'15'}).conflicts.some(c=>c.includes('hours')),'MATS 20-hour exception cannot fit 15 hours');
assert(assess(live('mats'),{...base,hours:'30'}).checks.some(c=>c.includes('part-time exception')));
assert(assess(live('mats'),base).checks.some(c=>c.includes('US J-1')));
assert(assess(live('pivotal-ai'),{...base,home:'EU',mobility:'visit'}).conflicts.some(c=>c.includes('short-visit')));
assert(assess(live('bluedot-grants'),{...base,hours:'5'}).conflicts.some(c=>c.includes('hours')));
assert.equal(get('bluedot-grants').fundingType,'grant');
assert.equal(get('elbi').fundingType,'expenses');
assert(assess(get('bluedot-bio'),{...base,hours:'5',funding:'income',travel:'no'}).checks.some(c=>c.includes('not replacement income')));
assert.equal(assess(live('iaps'),{...base,schedule:'flexible'}).score,assess(live('iaps'),{...base,schedule:'predictable'}).score,'Care needs should not lower the score');
assert.equal(opportunityStatus(get('iaps'),'2026-09-19'),'open');
assert.equal(opportunityStatus(get('iaps'),'2026-09-28T06:00:00Z'),'open');
assert.equal(opportunityStatus(get('elbi'),'2026-10-01T03:00:00Z'),'open');
assert.equal(opportunityStatus(get('iaps'),'2026-09-28T07:00:00Z'),'closed');
assert.equal(opportunityStatus(get('elbi'),'2026-10-01T04:00:00Z'),'closed');
assert.equal(opportunityStatus(get('mats'),'2026-09-19'),'closed');
assert.equal(opportunityStatus(get('astralis')),'invite');
assert.equal(opportunityStatus(get('schmidt-ai2050')),'invite');
assert(assess(get('80k-advice'),{...base,experience:'exploring'}).score>assess(get('80k-advice'),base).score);
console.log('Validated 24 resources, every requested organisation, 864 constraint combinations, work-rights distinctions, funding types and expired deadlines.');
