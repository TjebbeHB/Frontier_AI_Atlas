import assert from 'node:assert/strict';
import fs from 'node:fs';
import { filterJobs, emptyJobFilters, isExpired, isSainJob } from '../lib/jobs/index.ts';
const data = JSON.parse(fs.readFileSync(new URL('../lib/jobs/data.json', import.meta.url)));
const date = data.checkedAt;
const ids = new Set();
for (const job of data.jobs) {
  assert(!ids.has(job.id), 'Duplicate job ID'); ids.add(job.id);
  for (const key of ['id','title','organisation','city','location','category','type','workMode','experience','summary','safetyRelevance','url','sourceUrl','checkedAt','status','compensation']) assert(job[key], `${job.id}: missing ${key}`);
  assert(['paid','volunteer','unknown'].includes(job.compensation));
  assert.equal(new URL(job.url).protocol, 'https:');
  assert.equal(new URL(job.sourceUrl).protocol, 'https:');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(job.checkedAt));
  if(job.deadline) { assert(/^\d{4}-\d{2}-\d{2}$/.test(job.deadline)); assert(job.deadline >= job.checkedAt, `${job.id}: expired at source check`); }
  assert(!isExpired(job, date));
  if (job.type === 'Volunteer') assert.equal(job.compensation, 'volunteer');
}
const run = (filters = {}, saved = [], now = date) => filterJobs(data.jobs,{...emptyJobFilters,...filters},saved,now);
assert.equal(run().length,data.jobs.length);
assert(run({paidOnly:true}).every(job => job.compensation === 'paid'));
assert(run({sainOnly:true}).every(isSainJob));
assert.equal(run({sainOnly:true, paidOnly:true}).length,3,'Three paid SAIN roles, seven volunteer');
assert.equal(run({savedOnly:true}, ['sain-head-projects','unknown-id']).length,1,'Shortlist ignores absent IDs');
assert.equal(run({city:'Amsterdam',query:'SaIn projects'}).length,1,'Case-insensitive terms and city intersect');
assert.equal(run({city:'Nijmegen',query:'SaIn projects'}).length,0,'Incompatible filters return empty');
assert(run({type:'PhD'}).every(job=>job.type === 'PhD'));
assert.equal(run({query:'zz-no-such-listing'}).length,0);
const timed = data.jobs.find(job=>job.deadline);
assert(timed);
assert(!isExpired(timed,timed.deadline), 'Role remains visible on closing day');
assert(isExpired(timed,'2099-01-01'), 'Known passed deadlines expire');
assert(run({},[], '2099-01-01').every(job=>!job.deadline),'Expired roles do not reappear with filters cleared');
for(const id of ['uva-governance-15529','uva-enforcement-15530']) assert(data.jobs.find(job=>job.id===id).eligibility?.includes('12'),'MSCA mobility constraint is retained');
console.log(`Jobs verified: ${ids.size} primary-source listings, compensation, deadlines, eligibility, combined filters, search and shortlist.`);
