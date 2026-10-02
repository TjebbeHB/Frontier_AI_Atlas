/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG city controls have equivalent HTML directory buttons and keyboard handlers. */
/* oxlint-disable next/no-img-element -- Small locally cached SAIN logo. */
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, MapPin, X } from 'lucide-react';
import { jobCities, type Job } from '@/lib/jobs';
import { netherlandsCities, normalizeNetherlandsCity } from '@/lib/netherlands-cities';
import { arrangeCityLabels, cityLabelPreferences, indexJobsByCity, mobileCityLabels, netherlandsFrame, projectNetherlands } from '@/lib/netherlands-geography';
import geography from '@/lib/netherlands-countries.json';
import { sainChapters } from '@/lib/sain';

export type NetherlandsMapProps = {
  jobs: Job[];
  selectedCity?: string;
  onCitySelect?: (city: string) => void;
  onBack?: () => void;
  onJobs?: (city?: string) => void;
  compact?: boolean;
};

/** One listing can have several city anchors, but never counts twice within a city. */
export function buildCityJobIndex(jobs: Job[]) {
  return indexJobsByCity(jobs, (job) => jobCities(job).map(normalizeNetherlandsCity), netherlandsCities.map((city) => city.name));
}

export default function NetherlandsMap({ jobs, selectedCity, onCitySelect, onBack, onJobs, compact = false }: NetherlandsMapProps) {
  const [localCity, setLocalCity] = useState('');
  const [showSain, setShowSain] = useState(true);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [labelScale, setLabelScale] = useState(1);
  const mapStage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapStage.current) return;
    const observer = new ResizeObserver(([entry]) => setLabelScale(Math.max(1, Math.min(1.85, 560 / Math.max(200, entry.contentRect.width)))));
    observer.observe(mapStage.current);
    return () => observer.disconnect();
  }, []);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { backButton.current?.focus({ preventScroll: true }); }, []);
  const prefix = useId().replace(/:/g, '');
  const activeName = normalizeNetherlandsCity(selectedCity === undefined ? localCity : selectedCity);
  const { unique, index, unlocated } = useMemo(() => buildCityJobIndex(jobs), [jobs]);
  const mapped = unique.length - unlocated.length;
  const active = netherlandsCities.find((city) => city.name === activeName);
  const activeJobs = active ? index.get(active.name) ?? [] : [];
  const activeChapter = sainChapters.find((chapter) => chapter.city === activeName);
  const visibleCities = netherlandsCities.filter((city) => city.major || (index.get(city.name)?.length ?? 0) > 0 || city.name === activeName);
  const chapterCities = new Set(sainChapters.map((chapter) => chapter.city));
  const mobileLabels = labelScale > 1.25;
  const labelCities = visibleCities.filter((city) => !mobileLabels || mobileCityLabels.has(city.name) || city.name === activeName);
  const labels = arrangeCityLabels(labelCities.map((city) => ({ ...projectNetherlands(city.coordinates), name: city.name, preference: cityLabelPreferences[city.name], count: index.get(city.name)?.length ?? 0, priority: mobileLabels && !mobileCityLabels.has(city.name) ? -1 : 10 })), labelScale, visibleCities.map((city) => ({ name: city.name, ...projectNetherlands(city.coordinates) })));
  function selectCity(name: string) {
    setLocalCity(name);
    onCitySelect?.(name);
  }
  function jobCard(job: Job) {
    const details = [job.compensation === 'volunteer' ? 'Volunteer' : job.type, job.workMode].filter((value) => value && !/not specified|unknown/i.test(value));
    return <a className="nl-map-job" key={job.id} href={job.url} target="_blank" rel="noreferrer"><span>{job.organisation}</span><strong>{job.title}<ArrowUpRight size={12}/></strong><small>{details.length ? details.join(' · ') : 'View employer listing'}</small></a>;
  }

  return <section className={`netherlands-map${compact ? ' netherlands-map--compact' : ''}`} aria-label="AI jobs and cities in the Netherlands">
    <style>{styles}</style>
    <div className="nl-map-toolbar">
      {onBack ? <button ref={backButton} type="button" onClick={onBack}><ArrowLeft size={13}/> Northwest Europe</button> : <span><MapPin size={14}/> THE NETHERLANDS</span>}
      <label><input type="checkbox" checked={showSain} onChange={(event) => setShowSain(event.target.checked)}/><i/> SAIN chapters</label>
    </div>
    <div className="nl-map-heading"><div><span>AI CAREERS, CITY BY CITY</span><h3>Find your place in AI.</h3></div><div className="nl-map-totals"><strong>{unique.length}</strong><span>matching roles<br/>{mapped} located on the map</span></div></div>
    {mobileLabels && <p className="nl-map-mobile-hint">Tap a dot to explore more cities.</p>}
    <div className="nl-map-layout">
      <div ref={mapStage} className="nl-map-stage">
        <svg viewBox={`0 0 ${netherlandsFrame.width} ${netherlandsFrame.height}`} role="group" aria-label={`${visibleCities.length} Dutch cities. Orange badges show job counts; gold rings mark SAIN chapters.`}>
          <defs><radialGradient id={`${prefix}-sea`}><stop stopColor="#133c58"/><stop offset="1" stopColor="#061f46"/></radialGradient><linearGradient id={`${prefix}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#205373"/><stop offset="1" stopColor="#103658"/></linearGradient></defs>
          <rect width={netherlandsFrame.width} height={netherlandsFrame.height} fill={`url(#${prefix}-sea)`}/>
          <g stroke="#74a0b8" strokeWidth=".7" opacity=".12" aria-hidden="true">{[4, 5, 6, 7].map((lon) => <line key={lon} x1={projectNetherlands([lon, 51]).x} y1="0" x2={projectNetherlands([lon, 53]).x} y2={netherlandsFrame.height}/>)}{[51, 52, 53].map((lat) => <line key={lat} x1="0" y1={projectNetherlands([4, lat]).y} x2={netherlandsFrame.width} y2={projectNetherlands([7, lat]).y}/>)}</g>
          <g aria-hidden="true">{geography.countries.map((country) => <path key={country.name} d={country.path} fill={country.name === 'Netherlands' ? `url(#${prefix}-land)` : '#102b48'} stroke={country.name === 'Netherlands' ? '#7295ad' : '#3c5b75'} strokeWidth={country.name === 'Netherlands' ? 1.5 : 1} fillRule="evenodd"/>)}{geography.lakes.map((lake, i) => <path key={`${lake.name}-${i}`} d={lake.path} fill="#0e304c" stroke="#6a8fa5" strokeWidth="1" fillRule="evenodd"/>)}</g>
          <g className="nl-map-geographic-labels" aria-hidden="true"><text x="150" y="305" transform="rotate(-19 150 305)">NORTH SEA</text><text x="290" y="809">BELGIUM</text><text x="732" y="723" transform="rotate(90 732 723)">GERMANY</text><text className="nl-map-lake-label" x={projectNetherlands([5.44, 52.78]).x} y={projectNetherlands([5.44, 52.78]).y}>IJsselmeer</text></g>
          <g className="nl-map-compass" transform="translate(784 66)" aria-hidden="true"><text x="0" y="-11">N</text><path d="M0 0V34M-5 8 0 0 5 8"/></g>
          <g className="nl-map-label-stems" aria-hidden="true">{labels.map((label) => {
            const endX = Math.max(label.x + 7, Math.min(label.x + label.width - 7, label.anchorX));
            const endY = Math.max(label.y + 5, Math.min(label.y + label.height - 5, label.anchorY));
            return <line key={label.name} x1={label.anchorX} y1={label.anchorY} x2={endX} y2={endY} stroke={label.name === activeName ? '#ffd0a3' : '#93b5c5'} strokeWidth={label.name === activeName ? 2.5 : 1.3} strokeOpacity={label.name === activeName ? 1 : .78}/>;
          })}</g>
          <g>{visibleCities.map((city) => {
            const point = projectNetherlands(city.coordinates), count = index.get(city.name)?.length ?? 0;
            const radius = count ? Math.min(8.5, 4.5 + Math.sqrt(count)) : 3.5;
            const sain = showSain && chapterCities.has(city.name), chosen = activeName === city.name;
            return <g key={city.name} className={`nl-map-pin${chosen ? ' is-selected' : ''}`} role="button" tabIndex={0} aria-label={`${city.name}: ${count} ${count === 1 ? 'role' : 'roles'}${sain ? ', SAIN chapter' : ''}`} aria-pressed={chosen} onClick={() => selectCity(city.name)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCity(city.name); } }}>
              <title>{city.name} · {count} {count === 1 ? 'role' : 'roles'}{sain ? ' · SAIN chapter' : ''} · city centre, not an office address</title>
              <circle cx={point.x} cy={point.y} r={Math.max(radius + 7, 17)} fill="transparent"/>
              {chosen && <circle cx={point.x} cy={point.y} r={radius + 12} fill="#ff602522" stroke="#ffae76" strokeOpacity=".4"/>}
              {sain && <circle className="nl-sain-ring" cx={point.x} cy={point.y} r={radius + 6} fill="none" stroke="#f9d494" strokeWidth="2.8"/>}
              <circle className="nl-city-dot" cx={point.x} cy={point.y} r={radius} fill={count ? '#ff743d' : '#aac5d1'} stroke={chosen ? '#fff1d8' : '#08254a'} strokeWidth={chosen ? 2.5 : 1.8}/>
            </g>;
          })}</g>
          <g>{labels.map((label) => {
            const count = index.get(label.name)?.length ?? 0;
            return <g key={label.name} className={`nl-map-city-label${label.name === activeName ? ' is-selected' : ''}`} role="button" tabIndex={-1} aria-label={`Select ${label.name}: ${count} roles`} onClick={() => selectCity(label.name)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCity(label.name); } }}>
              <rect x={label.x} y={label.y} width={label.width} height={label.height} rx="4" fill={label.name === activeName ? '#6b432f' : '#072547ed'}/>
              {count > 0 && <><circle cx={label.x + 14 * labelScale} cy={label.y + 14 * labelScale} r={Math.min(12, 9 + Math.sqrt(count) * .65) * labelScale} fill="#ff854f"/><text x={label.x + 14 * labelScale} y={label.y + 18.6 * labelScale} style={{ fontSize: 13.5 * labelScale }} className="nl-map-count">{count}</text></>}
              <text className="nl-map-name" x={label.x + (count ? 31 : 8) * labelScale} y={label.y + 19 * labelScale} style={{ fontSize: 17 * labelScale }}>{label.name}</text>
            </g>;
          })}</g>
        </svg>
        <div className="nl-map-key"><span><i/> Jobs by city</span><span><i/> SAIN chapter</span><span><i/> City</span></div>
      </div>
      <aside className="nl-map-detail" aria-label="Selected city and opportunities">
        <div className="nl-map-selection" aria-live="polite">
          {active ? <><div className="nl-map-selection-top"><span>CITY SPOTLIGHT</span><button type="button" aria-label="Clear selected city" onClick={() => selectCity('')}><X size={14}/></button></div><h4>{active.name}</h4><p className="nl-map-city-count"><b>{activeJobs.length}</b> {activeJobs.length === 1 ? 'matching opportunity' : 'matching opportunities'}</p>
            {activeChapter && showSain && <a className="nl-map-sain" href={activeChapter.url} target="_blank" rel="noreferrer"><img src="/brand/sain/logo-navy.png" alt="SAIN" width="57" height="24"/><span>Meet your local chapter<ArrowUpRight size={12}/></span></a>}
            {activeJobs.length ? <div className="nl-map-job-list">{activeJobs.slice(0, compact ? 3 : 4).map(jobCard)}</div> : <p className="nl-map-empty">No matching listings in this city. Try changing the job filters or explore a nearby city.</p>}
            {onJobs && <button type="button" className="nl-map-view-jobs" onClick={() => onJobs(active.name)}>View {activeJobs.length > 0 ? 'these jobs' : 'city on the job board'} <ArrowUpRight size={13}/></button>}
            <a className="nl-map-coordinate-source" href={active.coordinateSource} target="_blank" rel="noreferrer">City coordinate source <ArrowUpRight size={11}/></a>
          </> : <><span className="nl-map-overline">OPPORTUNITIES, CLOSE TO HOME</span><h4>A city.<br/>A community.<br/>A next step.</h4><p>Choose a city to discover its AI roles and local SAIN community. Every dot stays on its geographic city centre.</p><div className="nl-map-overview-stats"><span><b>{[...index.values()].filter((items) => items.length).length}</b> cities with roles</span><span><b>{unlocated.length}</b> without a map pin</span></div>{onJobs && <button type="button" className="nl-map-view-jobs" onClick={() => onJobs()}><BriefcaseBusiness size={13}/> Browse all roles <ArrowUpRight size={13}/></button>}</>}
        </div>
        {unlocated.length > 0 && <details className="nl-map-unlocated"><summary>{unlocated.length} {unlocated.length === 1 ? 'role' : 'roles'} without a city pin</summary><p>Remote, nationwide or without a verified city. We do not assign these roles to an employer’s headquarters.</p><div className="nl-map-job-list">{unlocated.map(jobCard)}</div></details>}
        <div className="nl-map-directory"><button className="nl-map-directory-toggle" type="button" onClick={() => setDirectoryOpen(!directoryOpen)} aria-expanded={directoryOpen}>Browse all {visibleCities.length} cities <span>{directoryOpen ? '−' : '+'}</span></button>{directoryOpen && <div>{[...visibleCities].sort((a, b) => a.name.localeCompare(b.name)).map((city) => <button key={city.name} type="button" aria-pressed={city.name === activeName} onClick={() => selectCity(city.name)}>{city.name}<span>{index.get(city.name)?.length ?? 0}</span></button>)}</div>}</div>
      </aside>
    </div>
    <footer className="nl-map-footer"><p>Counts follow your job filters. Multi-city listings appear in each named city; the total counts each role once. Labels have leader lines where displaced. A city pin is not an exact workplace.</p><p><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth 1:10m</a><span> · </span><a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a><span> (</span><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a><span>) · </span><a href="https://safeainetherlands.org/community" target="_blank" rel="noreferrer">SAIN chapter sources</a></p></footer>
  </section>;
}

const styles = `
.netherlands-map .nl-map-footer{background:transparent;display:block;border:0;margin:0;width:auto;min-height:0}.nl-map-mobile-hint{font-size:10px;line-height:1.5;color:#b4ccd8;margin:0 17px 13px}
.netherlands-map{background:radial-gradient(ellipse at 35% 30%,#0f3456,#021c4d 78%);border:1px solid #46668155;border-radius:14px;color:#fff3dc;overflow:hidden;min-width:0;animation:nl-map-arrive .55s ease both}.netherlands-map *{box-sizing:border-box}.netherlands-map button,.netherlands-map a,.netherlands-map input{font:inherit}.netherlands-map button{cursor:pointer}.netherlands-map button:focus-visible,.netherlands-map a:focus-visible,.netherlands-map summary:focus-visible,.netherlands-map input:focus-visible{outline:2px solid #ffd1a3;outline-offset:3px}.nl-map-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #6c879d33}.nl-map-toolbar>button{display:flex;align-items:center;gap:7px;background:#173b59;color:#e3e9df;border:1px solid #657d9744;border-radius:4px;padding:8px 10px;font-size:10px}.nl-map-toolbar>span{display:flex;gap:7px;align-items:center;font-size:10px;letter-spacing:1.4px;color:#bdd1dd}.nl-map-toolbar>label{display:flex;align-items:center;gap:7px;font-size:10px;color:#c4d0d5;cursor:pointer}.nl-map-toolbar input{accent-color:#ff8754;width:14px;height:14px;margin:0}.nl-map-toolbar label i{border:1.5px solid #f9d494;width:8px;height:8px;border-radius:50%}.nl-map-heading{padding:22px 24px 15px;display:flex;gap:20px;align-items:center;justify-content:space-between}.nl-map-heading>div>span{font-size:9px;letter-spacing:1.5px;color:#fca574}.nl-map-heading h3{font-family:var(--font-heading),sans-serif;font-size:28px;line-height:1.1;margin:9px 0 0;color:#fff3dc}.nl-map-heading .nl-map-totals{display:flex;gap:10px;align-items:center}.nl-map-totals strong{font-family:var(--font-heading),sans-serif;font-size:40px;color:#fff3dc;line-height:1}.nl-map-heading .nl-map-totals>span{font-size:9px;letter-spacing:0;line-height:1.6;color:#9fb9cc}.nl-map-layout{display:grid;grid-template-columns:minmax(0,1fr) 275px;align-items:start;gap:18px;padding:0 18px 18px}.nl-map-stage{border:1px solid #5b7a9244;border-radius:8px;position:relative;min-width:0;overflow:hidden}.nl-map-stage>svg{display:block;width:100%;height:auto}.nl-map-geographic-labels{fill:#789bb0;font-size:18px;letter-spacing:3px;text-anchor:middle;pointer-events:none}.nl-map-geographic-labels .nl-map-lake-label{font-size:13px;letter-spacing:.5px;fill:#92b0bf;font-style:italic}.nl-map-compass{stroke:#97b3c0;stroke-width:1.4;fill:none}.nl-map-compass text{stroke:none;fill:#97b3c0;font-size:16px;text-anchor:middle}.nl-map-pin{cursor:pointer;outline:none}.nl-map-pin:hover .nl-city-dot,.nl-map-pin:focus-visible .nl-city-dot{stroke:#fff5db;stroke-width:4}.nl-map-count{fill:#052448;font-size:16px;font-weight:700;text-anchor:middle;pointer-events:none}.nl-map-city-label{cursor:pointer}.nl-map-city-label .nl-map-name{font-size:17px;fill:#d6e2e5;font-weight:450;pointer-events:none}.nl-map-city-label.is-selected .nl-map-name{fill:#ffe0bd;font-weight:600}.nl-map-city-label:hover .nl-map-name{fill:#fff3dc}.nl-map-label-stems{pointer-events:none}.nl-map-key{position:absolute;left:16px;right:16px;bottom:15px;display:flex;gap:10px 20px;flex-wrap:wrap;font-size:9px;color:#b1c8d7;pointer-events:none}.nl-map-key span{display:flex;align-items:center;gap:6px}.nl-map-key i{width:7px;height:7px;border-radius:50%;background:#ff804a}.nl-map-key span:nth-child(2) i{background:transparent;border:1.4px solid #f9d494;width:9px;height:9px}.nl-map-key span:nth-child(3) i{width:4px;height:4px;background:#bdd0d9}.nl-map-detail{min-width:0}.nl-map-selection{padding:20px 17px;border:1px solid #58759450;border-radius:8px;background:#0a2c50}.nl-map-selection-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.nl-map-selection-top>span,.nl-map-overline{font-size:9px;letter-spacing:1.2px;color:#ffaa78;font-weight:500}.nl-map-selection-top>button{background:none;border:0;color:#a8c1d4;padding:2px;display:grid;place-items:center}.nl-map-selection h4{font-family:var(--font-heading),sans-serif;font-size:30px;line-height:1.1;color:#fff3dc;margin:13px 0}.nl-map-selection>p{font-size:11px;line-height:1.7;color:#a8c1d2;margin:12px 0}.nl-map-selection>p.nl-map-city-count{font-size:10px;margin:0 0 16px}.nl-map-city-count b{font-weight:600;color:#fbc597}.nl-map-sain{display:flex;gap:11px;align-items:center;padding:10px;border:1px solid #e6b87550;background:#e6b8750b;border-radius:4px;color:#f4d8a6;text-decoration:none;margin-bottom:15px}.nl-map-sain img{width:57px;height:24px;object-fit:contain;background:#f7f5f2;padding:3px;border-radius:2px}.nl-map-sain span{font-size:10px;line-height:1.5;display:flex;gap:5px;align-items:center}.nl-map-job-list{display:grid;gap:8px}.nl-map-job{padding:11px 10px;background:#12385580;border:1px solid #688aa141;border-radius:5px;text-decoration:none;display:block}.nl-map-job:hover{border-color:#f99f7066;background:#153b5a}.nl-map-job>span{display:block;font-size:9px;color:#91b1c5;line-height:1.4}.nl-map-job>strong{display:flex;align-items:start;justify-content:space-between;gap:7px;font-size:11px;font-weight:500;color:#eff0e8;line-height:1.5;margin:5px 0}.nl-map-job strong svg{flex-shrink:0;margin-top:2px;color:#eeb083}.nl-map-job>small{display:block;font-size:9px;line-height:1.4;color:#91adbf}.nl-map-view-jobs{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;margin-top:16px;background:#ff6025;color:#fff;border:1px solid #ff6025;border-radius:4px;min-height:41px;padding:10px;font-size:11px;line-height:1.4;text-align:left}.nl-map-view-jobs:hover{background:#e65620}.nl-map-coordinate-source{display:inline-flex;align-items:center;gap:5px;color:#87a7c0;font-size:9px;text-decoration:none;margin-top:14px}.nl-map-coordinate-source:hover{text-decoration:underline}.nl-map-overview-stats{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #6b829535;margin-top:17px;padding-top:14px;gap:14px}.nl-map-overview-stats span{font-size:9px;color:#93b0c4;line-height:1.6}.nl-map-overview-stats b{display:block;color:#e9dcc0;font-size:24px;font-weight:500}.nl-map-unlocated{margin-top:14px;background:#0a2a4c;border:1px solid #62819740;border-radius:6px;padding:12px}.nl-map-unlocated summary{font-size:10px;color:#b9cbd7;cursor:pointer;line-height:1.5}.nl-map-unlocated>p{font-size:10px;line-height:1.6;color:#8daac0;margin:10px 0}.nl-map-unlocated>.nl-map-job-list{max-height:340px;overflow:auto}.nl-map-directory{margin-top:14px}.nl-map-directory-toggle{display:flex;justify-content:space-between;align-items:center;gap:10px;background:transparent;color:#adbfcd;border:0;border-bottom:1px solid #57799644;width:100%;padding:10px 0;font-size:10px;text-align:left}.nl-map-directory>div{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px;max-height:330px;overflow:auto}.nl-map-directory>div>button{display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:40px;padding:7px;background:#123451;border:1px solid #5b7a963a;border-radius:3px;color:#b7ccd8;font-size:9px;text-align:left}.nl-map-directory>div>button[aria-pressed=true]{color:#ffd8b7;border-color:#fa9e6b90}.nl-map-directory>div>button>span{color:#ffa876}.nl-map-footer{padding:0 22px 16px;color:#819fb6;font-size:9px;line-height:1.65}.nl-map-footer p{margin:5px 0}.nl-map-footer a{color:#a0b8c8;text-underline-offset:3px}.netherlands-map--compact .nl-map-layout{grid-template-columns:1fr;padding:0 12px 14px;gap:12px}.netherlands-map--compact .nl-map-heading{padding:18px 16px 14px}.netherlands-map--compact .nl-map-heading h3{font-size:23px}.netherlands-map--compact .nl-map-heading>div>span{font-size:8px}.netherlands-map--compact .nl-map-totals strong{font-size:34px}.netherlands-map--compact .nl-map-totals>span{display:none}.netherlands-map--compact .nl-map-selection{padding:15px}.netherlands-map--compact .nl-map-selection h4{font-size:26px}.netherlands-map--compact .nl-map-key{left:11px;bottom:10px;font-size:8px;gap:10px}.netherlands-map--compact .nl-map-footer{font-size:8px;padding:0 16px 15px}.netherlands-map--compact .nl-map-toolbar{padding:12px}.netherlands-map--compact .nl-map-toolbar>label{font-size:9px;gap:5px}
@keyframes nl-map-arrive{from{opacity:0;transform:scale(.975)}to{opacity:1;transform:scale(1)}}@media(max-width:760px){.nl-map-layout{grid-template-columns:1fr;padding:0 12px 15px;gap:13px}.nl-map-heading{padding:20px 17px 15px}.nl-map-heading h3{font-size:25px}.nl-map-heading .nl-map-totals{gap:7px}.nl-map-totals strong{font-size:35px}.nl-map-toolbar{padding:12px}.nl-map-toolbar>span{font-size:9px;letter-spacing:.8px}.nl-map-key{font-size:8px;gap:12px;left:10px;bottom:10px}.nl-map-selection{padding:18px}.nl-map-selection h4{font-size:28px}.nl-map-job strong{font-size:12px}.nl-map-view-jobs{min-height:44px}.nl-map-directory>div{grid-template-columns:repeat(3,minmax(0,1fr))}.nl-map-directory>div>button{min-height:44px}.nl-map-footer{padding:0 16px 17px}.nl-map-toolbar>label{font-size:9px}}@media(prefers-reduced-motion:reduce){.netherlands-map{animation:none}}
`;
