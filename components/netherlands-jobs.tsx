/* oxlint-disable next/no-img-element -- Locally cached SAIN logo; no image service. */
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bookmark, Check, ChevronDown, Clock3, List, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import data from '@/lib/jobs/data.json';
import NetherlandsMap from '@/components/netherlands-map';
import { displayDate, emptyJobFilters, filterJobs, isExpired, isSainJob, jobCities, unlocatedCityFilter, type Job, type JobDataset, type JobFilters } from '@/lib/jobs';
import './netherlands-jobs.css';

const dataset = data as JobDataset;
const savedKey = 'frontier-atlas-nl-jobs-saved-v1';
const selectFields = [
  ['city', 'City'], ['category', 'Field of work'], ['type', 'Commitment'], ['workMode', 'Working arrangement'], ['focus', 'AI safety relevance'],
] as const;

export default function NetherlandsJobs({ onCareers, initialCity = '' }: { onCareers: () => void; initialCity?: string }) {
  const [filters, setFilters] = useState<JobFilters>({ ...emptyJobFilters, city: initialCity });
  const [saved, setSaved] = useState<string[]>([]);
  const [storageNotice, setStorageNotice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState('safety');
  const [showMap, setShowMap] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [today, setToday] = useState(dataset.checkedAt);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, []);
  /* oxlint-disable react/react-compiler -- Initialize browser-only storage and local date after SSR; no server-side browser access. */
  useEffect(() => {
    const updateDay = () => setToday(new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date()));
    updateDay();
    const interval = setInterval(updateDay, 60000);
    try {
      const value: unknown = JSON.parse(localStorage.getItem(savedKey) ?? '[]');
      if (Array.isArray(value)) setSaved(value.filter((id): id is string => typeof id === 'string'));
    } catch { /* Browsing and an in-memory shortlist remain available. */ }
    return () => clearInterval(interval);
  }, []);
  /* oxlint-enable react/react-compiler */
  const activeJobs = dataset.jobs.filter(job => !isExpired(job, today));
  const filtered = useMemo(() => {
    const result = filterJobs(dataset.jobs, filters, saved, today);
    return result.sort((a, b) => sort === 'deadline'
      ? (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999') || a.title.localeCompare(b.title)
      : sort === 'organisation'
        ? a.organisation.localeCompare(b.organisation) || a.title.localeCompare(b.title)
        : Number(isSainJob(b)) - Number(isSainJob(a)) || Number(a.type === 'Volunteer') - Number(b.type === 'Volunteer') || ['Direct AI safety', 'AI governance', 'Broader AI'].indexOf(a.safetyRelevance) - ['Direct AI safety', 'AI governance', 'Broader AI'].indexOf(b.safetyRelevance) || a.title.localeCompare(b.title));
  }, [filters, saved, sort, today]);
  const mapJobs = useMemo(() => filterJobs(dataset.jobs, { ...filters, city: '' }, saved, today), [filters, saved, today]);
  const filterCount = Object.values(filters).filter(Boolean).length;
  const savedCurrent = activeJobs.filter(job => saved.includes(job.id)).length;
  function update<K extends keyof JobFilters>(key: K, value: JobFilters[K]) { setFilters(previous => ({ ...previous, [key]: value })); setVisibleCount(12); }
  function resetFilters() { setFilters({ ...emptyJobFilters }); setVisibleCount(12); }
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(savedKey, JSON.stringify(next)); setStorageNotice('Shortlist saved in this browser.'); }
    catch { setStorageNotice('Browser storage is unavailable. Your shortlist will last for this visit.'); }
  }
  return <main className="nl-jobs">
    <section className="jobs-hero" aria-labelledby="jobs-title">
      <div>
        <button className="jobs-back" onClick={onCareers}><ArrowLeft size={14}/> Career transition guide</button>
        <span className="eyebrow">YOUR NEXT CHAPTER · THE NETHERLANDS</span>
        <h1 id="jobs-title" tabIndex={-1} ref={titleRef}>Put your skills<br/>to work on AI.</h1>
        <p>Find a role close to home. Explore AI safety, governance and research, with the practical details up front.</p>
      </div>
      <div className="jobs-hero-note">
        <span className="jobs-orbit" aria-hidden="true"><i/><i/><b/></span>
        <strong>A place to begin.</strong>
        <p>Paid roles and volunteering, from building a local safety community to shaping how AI is developed.</p>
        <span>Curated listings · checked {displayDate(dataset.checkedAt)}</span>
      </div>
    </section>
    <div className="jobs-search-strip">
      <label className="jobs-search"><Search size={20}/><span className="sr-only">Search jobs</span><input type="search" value={filters.query} onChange={event => update('query', event.target.value)} placeholder="Role, organisation or keyword…"/>{filters.query && <button aria-label="Clear search" onClick={() => update('query', '')}><X size={16}/></button>}</label>
      <button className={`jobs-shortlist ${filters.savedOnly ? 'active' : ''}`} aria-pressed={filters.savedOnly} onClick={() => update('savedOnly', !filters.savedOnly)}><Bookmark size={17}/> My shortlist <b>{savedCurrent}</b></button>
    </div>
    <div className="jobs-layout">
      <aside className="jobs-filters" aria-label="Filter vacancies">
        <button className="jobs-mobile-filter" aria-expanded={filtersOpen} aria-controls="job-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> Filter roles {filterCount > 0 && <b>{filterCount}</b>}<ChevronDown size={16}/></button>
        <div id="job-filter-fields" className={filtersOpen ? 'job-filter-fields open' : 'job-filter-fields'}>
          <div className="jobs-filter-title"><h2>Make it fit.</h2><button onClick={resetFilters}>Reset</button></div>
          <fieldset className="jobs-switches"><legend className="sr-only">Quick filters</legend>
            <label><input type="checkbox" checked={filters.sainOnly} onChange={event => update('sainOnly', event.target.checked)}/> SAIN opportunities</label>
            <label><input type="checkbox" checked={filters.paidOnly} onChange={event => update('paidOnly', event.target.checked)}/> Paid roles only</label>
          </fieldset>
          {selectFields.map(([key, label]) => {
            const options = [...new Set(activeJobs.flatMap(job => key === 'city' ? (jobCities(job).length ? jobCities(job) : [unlocatedCityFilter]) : [key === 'focus' ? job.safetyRelevance : job[key]]).concat(key === 'city' && filters.city ? [filters.city] : []))].sort();
            return <label className="jobs-select-field" key={key}><span>{label}</span><select value={filters[key]} onChange={event => update(key, event.target.value)}><option value="">{key === 'city' ? 'All cities' : `Any ${label.toLowerCase()}`}</option>{options.map(option => <option key={option} value={option}>{option === unlocatedCityFilter ? 'City not specified / remote' : option}</option>)}</select></label>;
          })}
          <div className="jobs-filter-foot"><Bookmark size={16}/><p>Your shortlist stays in this browser. No account needed.</p></div>
          <a className="jobs-80k" href="https://jobs.80000hours.org/" target="_blank" rel="noreferrer">Looking worldwide?<br/><strong>80,000 Hours job board <ArrowUpRight size={14}/></strong></a>
        </div>
      </aside>
      <section className="jobs-results" aria-label="Vacancies">
        <fieldset className="jobs-view-switch"><legend className="sr-only">Job board view</legend><button aria-pressed={showMap} onClick={() => setShowMap(true)}><MapIcon size={16}/> Map & jobs</button><button aria-pressed={!showMap} onClick={() => setShowMap(false)}><List size={16}/> List only</button></fieldset>
        {showMap && <div className="jobs-map-wrap"><NetherlandsMap jobs={mapJobs} selectedCity={filters.city} onCitySelect={city => update('city', city)} onJobs={city => { update('city', city ?? ''); requestAnimationFrame(() => { const heading = document.getElementById('jobs-list-heading'); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }); }}/><p className="jobs-map-hint">Map counts follow your search and filters across the Netherlands. Pick a city to narrow the list.</p></div>}
        <div id="jobs-list-heading" tabIndex={-1} className="jobs-results-heading"><output><strong>{filtered.length}</strong> {filtered.length === 1 ? 'opportunity' : 'opportunities'}{filters.city ? ` · ${filters.city === unlocatedCityFilter ? 'city not specified' : filters.city}` : filters.savedOnly ? ' in your shortlist' : ' to explore'}</output><label>Sort by <select aria-label="Sort jobs" value={sort} onChange={event => { setSort(event.target.value); setVisibleCount(12); }}><option value="safety">SAIN & safety first</option><option value="deadline">Closing soon</option><option value="organisation">Organisation</option></select></label></div>
        <p className="jobs-source-note">Links go to the employer. Listings can change after checking; confirm availability and requirements before applying.</p>
        {filters.city && <button className="jobs-city-clear" onClick={() => update('city', '')}><X size={13}/> Clear city filter</button>}
        {filtered.length ? <div className="jobs-list">{filtered.slice(0, visibleCount).map(job => <JobCard key={job.id} job={job} saved={saved.includes(job.id)} onSave={() => toggleSaved(job.id)}/>)}</div> : <div className="jobs-empty"><Search size={28}/><h2>{filters.savedOnly ? 'Your next step starts with a shortlist.' : 'No roles match this combination.'}</h2><p>{filters.savedOnly ? 'Save any role using its bookmark button, then find it here.' : 'Try a broader field, another city or fewer filters.'}</p><button onClick={resetFilters}>Browse all opportunities</button></div>}
        <div className="jobs-pagination"><span>Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} opportunities</span>{visibleCount < filtered.length && <button onClick={() => setVisibleCount(count => count + 12)}>Show 12 more <ChevronDown size={15}/></button>}</div>
        <output className="jobs-storage-note">{storageNotice}</output>
        <section className="jobs-next" aria-labelledby="jobs-next-title"><span className="eyebrow">KEEP EXPLORING</span><h2 id="jobs-next-title">The right role may take a few steps.</h2><p>Build a skill, meet a community or check the next opening. These directories are ongoing resources, separate from the vacancies above.</p><div className="jobs-directory">{dataset.discoveryLinks?.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer"><strong>{link.name}<ArrowUpRight size={16}/></strong><span>{link.description}</span></a>)}</div><button onClick={onCareers}>Find courses, fellowships and transition support <ArrowUpRight size={16}/></button></section>
        <details className="jobs-method"><summary>How this board is curated</summary><p>This independent atlas uses a filter-and-shortlist format inspired by 80,000 Hours. It is not affiliated with their job board. Each listing links to an employer source; this is a checked snapshot, not a live vacancy feed. Listings with a known past deadline are automatically hidden.</p><p>“Direct AI safety”, “AI governance” and “Broader AI” are editorial labels describing the work, not endorsements. Broader AI roles can build relevant skills but do not necessarily reduce frontier AI risk. “Not specified” means the employer source did not establish the detail. Work location is not a promise of visa sponsorship.</p>{dataset.notes.map((note, index) => <p key={index}>{note}</p>)}</details>
      </section>
    </div>
  </main>;
}

function JobCard({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  const sain = isSainJob(job);
  const direct = job.safetyRelevance === 'Direct AI safety';
  return <article className={`job-card ${sain ? 'is-sain' : ''}`}>
    <div className="job-card-top"><div className="job-organisation">{sain ? <span className="job-logo"><img src="/brand/sain/logo-navy.png" alt="" width="52" height="21"/></span> : <span className="job-monogram" aria-hidden="true">{job.organisation.split(/[\s-]/).filter(Boolean).map(word => word[0]).slice(0,3).join('')}</span>}<div><span>{job.organisation}</span><span className={`job-focus ${direct ? 'direct' : ''}`}>{job.safetyRelevance}</span></div></div><button className={`job-save ${saved ? 'saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${job.title}`} aria-pressed={saved} onClick={onSave}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'}/></button></div>
    <h2><a href={job.url} target="_blank" rel="noreferrer">{job.title}<ArrowUpRight size={18}/></a></h2>
    <div className="job-facts"><span><MapPin size={14}/>{job.location}</span><span className={job.type === 'Volunteer' ? 'job-volunteer' : ''}>{job.compensation === 'volunteer' ? 'Volunteer · unpaid' : job.compensation === 'paid' ? (job.type === 'Not specified' ? 'Paid role' : `Paid · ${job.type}`) : job.type}</span>{job.workMode !== 'Not specified' && <span>{job.workMode}</span>}{job.hours && <span><Clock3 size={13}/>{job.hours}</span>}</div>
    <p className="job-summary">{job.summary}</p>
    {job.salary && <p className="job-salary">{job.salary}</p>}
    {job.eligibility && <p className="job-eligibility"><strong>Eligibility:</strong> {job.eligibility}</p>}
    <details className="job-details"><summary>Requirements & source details <ChevronDown size={13}/></summary><dl><div><dt>Experience</dt><dd>{job.experience}</dd></div><div><dt>Working arrangement</dt><dd>{job.workMode}</dd></div><div><dt>Visa sponsorship</dt><dd>{job.sponsorship ?? 'Not confirmed in the checked source; ask the employer.'}</dd></div><div><dt>Source checked</dt><dd>{displayDate(job.checkedAt)} · <a href={job.sourceUrl} target="_blank" rel="noreferrer">Employer listing <ArrowUpRight size={12}/></a></dd></div></dl></details>
    <div className="job-card-bottom"><span>{job.deadline ? <>Apply by <strong>{displayDate(job.deadline)}</strong></> : job.status === 'rolling' ? 'Rolling applications' : 'No closing date stated'}</span><a className="job-apply" href={job.url} target="_blank" rel="noreferrer">View role <ArrowUpRight size={15}/></a></div>
    {saved && <span className="job-saved-caption"><Check size={12}/> In your shortlist</span>}
  </article>;
}
