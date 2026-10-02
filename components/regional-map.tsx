/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG pins have keyboard handlers and equivalent HTML chapter/city buttons. */
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, MapPin } from 'lucide-react';
import type { ActorProfile } from '@/lib/geography';
import { nodes, type Edge, type Entry } from '@/lib/governance';
import profilesData from '@/lib/actor-profiles.json';
import geography from '@/lib/regional-countries.json';
import { sainChapters } from '@/lib/sain';
import { inRegionalBounds, projectRegion, regionalConnection, regionalFrame, type RegionalCoordinates } from '@/lib/regional-geography';

const profiles = profilesData as unknown as Record<string, ActorProfile>;
const actorById = new Map(nodes.map((entry) => [entry.id, entry]));
const chapterOffsets: Record<string, [number, number]> = {
  'sain-groningen': [0, -32], 'sain-amsterdam': [-38, -33], 'sain-utrecht': [39, -20],
};
function location(entry: Entry): RegionalCoordinates | null {
  const profile = profiles[entry.id];
  const coords = profile?.coordinates ?? entry.location;
  return profile?.geographic && coords && inRegionalBounds(coords) ? coords : null;
}

export default function RegionalMap({ entries, links, onBack, onProfile, onJobs, compact = false }: {
  entries: Entry[]; links: Edge[]; onBack: () => void;
  onProfile?: (id: string) => void; onJobs?: () => void; compact?: boolean;
}) {
  const [selected, setSelected] = useState('sain-groningen');
  const [hovered, setHovered] = useState<string | null>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { backButton.current?.focus({ preventScroll: true }); }, []);
  const prefix = useId().replace(/:/g, '');
  const chapters = sainChapters.filter((chapter) => inRegionalBounds(chapter.coordinates));
  const cities = useMemo(() => {
    const groups = new Map<string, { city: string; coordinates: RegionalCoordinates; entries: Entry[] }>();
    for (const entry of entries) {
      const coords = location(entry);
      if (!coords || entry.id === 'sain' || entry.id.startsWith('sain-')) continue;
      const city = profiles[entry.id]?.city;
      if (!city) continue;
      const group = groups.get(city) ?? { city, coordinates: coords, entries: [] };
      group.entries.push(entry);
      groups.set(city, group);
    }
    return [...groups.values()].sort((a, b) => a.city.localeCompare(b.city));
  }, [entries]);
  const chapter = chapters.find((item) => item.id === selected);
  const city = cities.find((item) => item.city === selected || item.entries.some((entry) => entry.id === selected));
  const actor = actorById.get(selected);
  const prospectiveCount = chapters.filter((item) => item.status === 'prospective').length;
  const selectedLinks = links.filter((edge) => edge.from === selected || edge.to === selected).flatMap((edge) => {
    const from = actorById.get(edge.from), to = actorById.get(edge.to);
    const a = from && location(from), b = to && location(to);
    if (!a || !b || edge.from.startsWith('sain') || edge.to.startsWith('sain') || (a[0] === b[0] && a[1] === b[1])) return [];
    return [{ ...edge, path: regionalConnection(a, b) }];
  });
  const nationalBase = chapters.find((item) => item.id === 'sain-groningen');

  return <section className={`regional-map${compact ? ' regional-map--compact' : ''}`} aria-label="Northwest Europe and the SAIN community">
    <style>{regionalStyles}</style>
    <div className="regional-map-toolbar">
      <button ref={backButton} type="button" onClick={onBack}><ArrowLeft size={14}/> Back to globe</button>
      <span><MapPin size={13}/> Northwest Europe</span>
    </div>
    <div className="regional-map-intro"><div><span className="regional-eyebrow">A CLOSER LOOK</span><h3>Global questions. Local community.</h3></div><p>London to the Netherlands.<br/>Groningen to Paris.</p></div>
    <div className="regional-map-layout">
      <div className="regional-map-stage">
        <svg viewBox={`0 0 ${regionalFrame.width} ${regionalFrame.height}`} role="group" aria-label="City-level map of SAIN chapters and nearby governance actors">
          <defs>
            <radialGradient id={`${prefix}-sea`}><stop stopColor="#103755"/><stop offset="1" stopColor="#061f46"/></radialGradient>
            <linearGradient id={`${prefix}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#16466a"/><stop offset="1" stopColor="#0b3059"/></linearGradient>
            <filter id={`${prefix}-glow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
          </defs>
          <rect width={regionalFrame.width} height={regionalFrame.height} fill={`url(#${prefix}-sea)`}/>
          <g className="regional-graticule" aria-hidden="true">
            {[0, 2, 4, 6, 8].map((lon) => <line key={lon} x1={projectRegion([lon, 48.45]).x} y1="0" x2={projectRegion([lon, 53.65]).x} y2={regionalFrame.height}/>)}
            {[49, 50, 51, 52, 53].map((lat) => <line key={lat} x1="0" y1={projectRegion([-1.2, lat]).y} x2={regionalFrame.width} y2={projectRegion([8, lat]).y}/>)}
          </g>
          <g fill={`url(#${prefix}-land)`} stroke="#4b7793" strokeWidth="1.05" aria-hidden="true">
            {geography.countries.map((country) => <path key={country.name} d={country.path} fillRule="evenodd"/>)}
          </g>
          <g fill="#0b2b4d" stroke="#4b7793" strokeWidth=".8" aria-hidden="true">
            {geography.lakes.map((lake, index) => <path key={`${lake.name}-${index}`} d={lake.path} fillRule="evenodd"/>)}
          </g>
          <g className="regional-country-labels" aria-hidden="true">
            {([['ENGLAND', 0.2, 52.3], ['NETHERLANDS', 6.15, 51.62], ['BELGIUM', 4.6, 50.32], ['FRANCE', 3.7, 49.35], ['GERMANY', 7.1, 51]] as [string, number, number][]).map(([label, lon, lat]) => <text key={label} x={projectRegion([lon, lat]).x} y={projectRegion([lon, lat]).y}>{label}</text>)}
            <text className="regional-sea-label" x={projectRegion([2.4, 52.4]).x} y={projectRegion([2.4, 52.4]).y}>NORTH SEA</text>
          </g>
          <g aria-hidden="true" className="regional-compass" transform="translate(865 73)"><path d="M0 35V0M-5 8 0 0 5 8"/><text x="0" y="-13">N</text></g>
          <g className="regional-community-lines" aria-hidden="true">
            {nationalBase && chapters.filter((item) => item.id !== nationalBase.id).map((item) => <g key={item.id}>
              <path d={regionalConnection(nationalBase.coordinates, item.coordinates)} stroke="#ff6025" strokeOpacity=".25" strokeWidth="8" filter={`url(#${prefix}-glow)`}/>
              <path d={regionalConnection(nationalBase.coordinates, item.coordinates)} stroke="#ff9b69" strokeOpacity={selected.startsWith('sain') ? '.85' : '.35'} strokeWidth="2" strokeDasharray="5 8" className="regional-flow"/>
            </g>)}
            {selectedLinks.map((edge, index) => <path key={`${edge.from}-${edge.to}-${index}`} d={edge.path} stroke="#ffb07c" strokeWidth="2.3" className="regional-flow" strokeDasharray="10 8"/>)}
          </g>
          <g className="regional-city-pins">
            {cities.map((item) => {
              const point = projectRegion(item.coordinates), active = city?.city === item.city;
              const representative = item.entries.find((entry) => entry.id === selected) ?? item.entries.find((entry) => !!profiles[entry.id]?.logo) ?? item.entries[0];
              const logo = profiles[representative.id]?.logo;
              return <g key={item.city} role="button" tabIndex={0} aria-label={`${item.city}: ${item.entries.length} mapped organisations`} aria-pressed={active} className={`regional-pin${active ? ' is-selected' : ''}`} onClick={() => setSelected(item.city)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item.city); } }}>
                <title>{item.city} · {item.entries.map((entry) => entry.short).join(', ')}</title>
                <line x1={point.x} y1={point.y} x2={point.x} y2={point.y - 27} stroke="#99bed6" strokeWidth="1.5"/>
                <circle cx={point.x} cy={point.y} r="4.5" fill="#b3d0df"/>
                <circle cx={point.x} cy={point.y - 43} r="24" fill="#f7f5f2" stroke={active ? '#ff8c59' : '#789bad'} strokeWidth={active ? 4 : 2}/>
                {logo ? <image href={logo} x={point.x - 16} y={point.y - 59} width="32" height="32" preserveAspectRatio="xMidYMid meet"/> : <text x={point.x} y={point.y - 37} textAnchor="middle" fill="#021c4d" fontSize="17">{item.entries.length}</text>}
                {item.entries.length > 1 && <g><circle cx={point.x + 23} cy={point.y - 62} r="13" fill="#123760" stroke="#809cb7"/><text x={point.x + 23} y={point.y - 57} textAnchor="middle" fill="#fff3dc" fontSize="15">{item.entries.length}</text></g>}
                <text className="regional-city-label" x={point.x} y={point.y + 29}>{item.city}</text>
              </g>;
            })}
          </g>
          <g className="regional-chapter-pins">
            {chapters.map((item) => {
              const point = projectRegion(item.coordinates), [dx, dy] = chapterOffsets[item.id] ?? [0, -32];
              const active = selected === item.id || hovered === item.id, x = point.x + dx, y = point.y + dy;
              return <g key={item.id} className={`regional-pin regional-chapter-pin${active ? ' is-selected' : ''}`} role="button" tabIndex={0} aria-label={`${item.name}: ${item.status === 'active' ? 'active' : 'prospective'} SAIN chapter`} aria-pressed={selected === item.id} onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(item.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item.id); } }}>
                <title>{item.name} · city-level chapter base{item.id === 'sain-groningen' ? '; national foundation registered in Groningen' : ''}</title>
                <circle cx={point.x} cy={point.y} r={active ? 17 : 12} fill="#ff6025" fillOpacity=".15"/>
                <line x1={point.x} y1={point.y} x2={x} y2={y} stroke="#ffac79" strokeWidth="1.8"/>
                <circle cx={point.x} cy={point.y} r="5" fill="#ff925c"/>
                <circle cx={x} cy={y} r="26" fill="#f7f5f2" stroke={active ? '#ff9b69' : '#ff6025'} strokeWidth={active ? 4 : 2.5} strokeDasharray={item.status === 'prospective' ? '5 4' : undefined}/>
                <image href="/brand/sain/logo-navy.png" x={x - 21} y={y - 8.65} width="42" height="17.3"/>
                <text className="regional-chapter-label" textAnchor={dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'} x={x + (dx < 0 ? -34 : dx > 0 ? 34 : 0)} y={dx === 0 ? y - 40 : y + 7}>{item.city}</text>
                {item.status === 'prospective' && <text className="regional-prospective-label" x={x} y={y + 45}>PROSPECTIVE</text>}
              </g>;
            })}
          </g>
        </svg>
        <div className="regional-map-key"><span><i/> SAIN community</span><span><i/> Nearby institutions</span>{prospectiveCount > 0 && <span><i className="regional-key-prospective"/> Prospective</span>}</div>
      </div>
      <aside className="regional-map-detail" aria-label="Selected map location">
        <div className="regional-map-detail-content" aria-live="polite">
          {chapter ? <>
            <span className="regional-detail-kicker">{chapter.status === 'active' ? 'SAIN CHAPTER' : 'PROSPECTIVE CHAPTER'}</span>
            <h4>{chapter.city}</h4><p>{chapter.description}</p>
            {chapter.id === 'sain-groningen' && <p className="regional-base-note">Groningen is also the national foundation’s registered base. The dot marks the city, not a meeting venue.</p>}
            <a href={chapter.url} target="_blank" rel="noreferrer">Explore this chapter <ArrowUpRight size={13}/></a>
            {onProfile && <button type="button" className="regional-text-button" onClick={() => onProfile('sain')}>About Safe AI Netherlands <ArrowUpRight size={13}/></button>}
          </> : city ? <>
            <span className="regional-detail-kicker">{actor ? 'MAPPED ORGANISATION' : `${city.entries.length} MAPPED ORGANISATIONS`}</span>
            <h4>{actor?.short ?? city.city}</h4>
            <p>{actor ? profiles[actor.id]?.locationNote : `Explore the actors with a documented ${city.city} base. A shared city does not imply a shared authority or partnership.`}</p>
            {actor && onProfile && <button type="button" className="regional-text-button" onClick={() => onProfile(actor.id)}>Open full profile <ArrowUpRight size={13}/></button>}
            {actor && profiles[actor.id]?.locationSource && <a href={profiles[actor.id].locationSource} target="_blank" rel="noreferrer">Location source <ArrowUpRight size={13}/></a>}
            <div className="regional-actor-list">{city.entries.map((entry) => <button type="button" key={entry.id} onClick={() => setSelected(entry.id)} aria-pressed={selected === entry.id}>{entry.short}<ArrowUpRight size={12}/></button>)}</div>
          </> : null}
        </div>
        <div className="regional-chapter-directory"><strong>Find your community</strong><div>{chapters.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.city}{item.status === 'prospective' && <small>Prospective</small>}</button>)}</div></div>
        {prospectiveCount === 0 && <div className="regional-prospective-callout"><a href="https://safeainetherlands.org/community" target="_blank" rel="noreferrer">Start a chapter in your city <ArrowUpRight size={12}/></a><p>Prospective cities are not yet publicly confirmed.</p></div>}
        {!compact && <div className="regional-city-directory"><strong>Nearby institutions</strong>{cities.map((item) => <button key={item.city} type="button" aria-pressed={city?.city === item.city} onClick={() => setSelected(item.city)}>{item.city}<span>{item.entries.length}</span></button>)}</div>}
        {onJobs && <button type="button" className="regional-jobs-button" onClick={onJobs}><BriefcaseBusiness size={15}/> Find AI jobs in the Netherlands <ArrowUpRight size={14}/></button>}
      </aside>
    </div>
    <div className="regional-map-footer"><p>Dots are city anchors; logos are raised callouts. Orange chapter lines show the SAIN community, not regulatory authority. Other lines appear when you select a connected actor.</p><p><a href="https://safeainetherlands.org/community" target="_blank" rel="noreferrer">Chapter sources</a><span> · </span><a href="https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/" target="_blank" rel="noreferrer">Natural Earth 1:10m</a><span> · </span><a href="https://www.geonames.org/" target="_blank" rel="noreferrer">City coordinates: GeoNames</a></p></div>
  </section>;
}

const regionalStyles = `
.regional-prospective-callout{padding:12px 0 0;margin:11px 0 0;border-top:1px solid #58769738}.regional-prospective-callout>a{font-size:10px;margin:0}.regional-prospective-callout>p{font-size:9px;margin:6px 0 0;color:#89a8c1}.regional-map--compact .regional-prospective-callout{margin:12px 4px 0}
.regional-map{color:#fff3dc;background:radial-gradient(ellipse at 35% 35%,#0d3259,#021c4d 75%);border-radius:16px;overflow:hidden;min-width:0;animation:regional-arrive .6s ease both}.regional-map *{box-sizing:border-box}.regional-map button,.regional-map a{font:inherit}.regional-map button{cursor:pointer}.regional-map button:focus-visible,.regional-map a:focus-visible{outline:2px solid #ffb386;outline-offset:3px}.regional-map-toolbar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #58769738;gap:12px}.regional-map-toolbar>button{display:flex;gap:7px;align-items:center;color:#f7f2e8;background:#16385b;border:1px solid #587b985f;border-radius:4px;font-size:11px;padding:8px 10px}.regional-map-toolbar>button:hover{border-color:#ff8957}.regional-map-toolbar>span{display:flex;align-items:center;gap:6px;font-size:11px;color:#a9c1d1}.regional-map-intro{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:23px 24px 10px}.regional-eyebrow{font-size:9px;letter-spacing:1.7px;color:#ff9c6e;font-weight:600}.regional-map-intro h3{font-family:var(--font-heading),sans-serif;font-size:24px;line-height:1.15;color:#fff3dc;margin:8px 0 0}.regional-map-intro p{color:#a6bfd1;font-size:10px;line-height:1.65;margin:0;white-space:nowrap}.regional-map-layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;align-items:start;padding:8px 18px 16px;gap:18px}.regional-map-stage{position:relative;min-width:0;border:1px solid #4a6c8b47;border-radius:10px;overflow:hidden}.regional-map-stage>svg{display:block;width:100%;height:auto;overflow:visible}.regional-graticule{stroke:#70a0ba;stroke-width:.6;opacity:.13}.regional-country-labels{font-size:16px;letter-spacing:2px;fill:#6c91aa;text-anchor:middle;font-weight:500;pointer-events:none}.regional-sea-label{font-style:italic;letter-spacing:4px;font-size:20px;fill:#71a1ba}.regional-compass{stroke:#7c9caf;fill:none;stroke-width:1.4}.regional-compass text{fill:#a2c0d0;stroke:none;font-size:15px;text-anchor:middle}.regional-community-lines{fill:none;pointer-events:none}.regional-flow{animation:regional-flow 18s linear infinite}.regional-pin{cursor:pointer;outline:none}.regional-pin:focus-visible>circle,.regional-pin:hover>circle{stroke:#ffe5c2;stroke-width:3}.regional-city-label{fill:#c5d7e1;font-size:22px;font-weight:500;text-anchor:middle;paint-order:stroke;stroke:#082449;stroke-width:6;stroke-linejoin:round}.regional-chapter-label{fill:#fff3dc;font-size:22px;font-weight:600;paint-order:stroke;stroke:#0c2b4e;stroke-width:7;stroke-linejoin:round}.regional-prospective-label{fill:#ffb48b;font-size:13px;letter-spacing:1px;text-anchor:middle}.regional-map-key{position:absolute;bottom:13px;left:16px;right:16px;display:flex;flex-wrap:wrap;gap:7px 18px;pointer-events:none;font-size:10px;color:#a9c2d2}.regional-map-key span{display:inline-flex;gap:6px;align-items:center}.regional-map-key i{height:5px;width:5px;border-radius:50%;background:#ff8e59}.regional-map-key span:nth-child(2) i{background:#bdd2df}.regional-map-key .regional-key-prospective{background:transparent;border:1px dashed #ffa06f;width:8px;height:8px}.regional-map-detail{min-width:0}.regional-map-detail-content{padding:19px 17px;background:#0b2c51;border:1px solid #5478974d;border-radius:8px}.regional-detail-kicker{font-size:9px;color:#ff9b69;letter-spacing:1.3px;font-weight:600}.regional-map-detail h4{font-family:var(--font-heading),sans-serif;font-size:28px;line-height:1.1;margin:12px 0;color:#fff3dc}.regional-map-detail p{font-size:11px;line-height:1.7;color:#b1c5d5;margin:0 0 12px}.regional-map-detail .regional-base-note{font-size:10px;color:#8faec6;border-top:1px solid #7890a22c;padding-top:10px}.regional-map-detail a,.regional-text-button{font-size:11px;color:#ffb084;display:flex;align-items:center;gap:5px;text-decoration:none;background:none;border:0;padding:0;margin-top:13px;line-height:1.5;text-align:left}.regional-map-detail a:hover,.regional-text-button:hover{text-decoration:underline}.regional-chapter-directory{margin-top:18px}.regional-chapter-directory>strong,.regional-city-directory>strong{display:block;font-size:10px;letter-spacing:.3px;color:#b8cddb;margin-bottom:9px}.regional-chapter-directory>div{display:flex;flex-wrap:wrap;gap:6px}.regional-chapter-directory button{display:inline-flex;gap:5px;align-items:center;min-height:38px;padding:8px 10px;background:#103453;border:1px solid #56769260;border-radius:4px;color:#cbd8df;font-size:10px}.regional-chapter-directory button[aria-pressed=true]{border-color:#fba074;background:#693e3338;color:#ffd1b4}.regional-chapter-directory small{font-size:8px;color:#e8aa88}.regional-city-directory{margin-top:18px}.regional-city-directory>button{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:11px;color:#aac1d1;background:none;border:0;border-top:1px solid #53749333;padding:10px 0;text-align:left}.regional-city-directory>button[aria-pressed=true]{color:#ffb389}.regional-city-directory>button span{font-size:9px;color:#7c9db4}.regional-actor-list{display:grid;gap:6px;margin-top:14px}.regional-actor-list button{display:flex;gap:6px;align-items:center;justify-content:space-between;background:#163c604f;border:1px solid #5d7e9840;padding:8px 9px;min-height:36px;border-radius:4px;color:#c8d9e4;font-size:10px;text-align:left}.regional-actor-list button[aria-pressed=true]{border-color:#ff9b6980;color:#ffbe98}.regional-jobs-button{margin-top:20px;display:flex;gap:8px;align-items:center;justify-content:space-between;background:#ff6025;border:1px solid #ff6025;color:#fff;font-weight:500;font-size:10px;width:100%;padding:12px;border-radius:4px;line-height:1.5;text-align:left}.regional-jobs-button:hover{background:#e65620}.regional-jobs-button svg{flex-shrink:0}.regional-map-footer{padding:0 23px 19px;color:#829fb8;font-size:9px;line-height:1.6}.regional-map-footer p{margin:6px 0 0}.regional-map-footer a{color:#a5c0d3;text-decoration:underline;text-underline-offset:3px}.regional-map--compact .regional-map-intro{padding:18px 18px 8px}.regional-map--compact .regional-map-intro h3{font-size:21px}.regional-map--compact .regional-map-intro>p{display:none}.regional-map--compact .regional-map-layout{grid-template-columns:minmax(0,1fr);gap:14px;padding:8px 12px 15px}.regional-map--compact .regional-map-detail-content{padding:14px 16px}.regional-map--compact .regional-map-detail h4{font-size:24px;margin:8px 0}.regional-map--compact .regional-map-detail p{font-size:10px;margin-bottom:8px}.regional-map--compact .regional-map-detail .regional-base-note{font-size:9px}.regional-map--compact .regional-map-detail-content a,.regional-map--compact .regional-text-button{font-size:10px;display:inline-flex;margin-top:6px;margin-right:12px}.regional-map--compact .regional-chapter-directory{margin:12px 4px 0}.regional-map--compact .regional-chapter-directory>strong{display:none}.regional-map--compact .regional-map-key{font-size:9px;left:12px;bottom:9px}.regional-map--compact .regional-map-footer{font-size:8px;padding:0 16px 15px}.regional-map--compact .regional-jobs-button{margin-top:13px}.regional-map--compact .regional-map-toolbar{padding:11px 12px}.regional-map--compact .regional-map-toolbar>span{font-size:10px}
@keyframes regional-arrive{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}@keyframes regional-flow{to{stroke-dashoffset:-180}}@media(max-width:760px){.regional-map-layout{grid-template-columns:minmax(0,1fr);gap:14px;padding:8px 12px 16px}.regional-map-intro{padding:19px 17px 10px}.regional-map-intro h3{font-size:23px}.regional-map-intro>p{display:none}.regional-map-key{font-size:9px}.regional-map-detail-content{padding:16px}.regional-chapter-directory>div{gap:7px}.regional-chapter-directory button{min-height:44px;flex:1;justify-content:center}.regional-city-directory{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.regional-city-directory>strong{width:100%;margin-bottom:0}.regional-city-directory>button{width:auto;gap:12px;min-height:38px;border:0}.regional-map-footer{padding:0 16px 18px}.regional-jobs-button{min-height:44px;font-size:11px}}@media(prefers-reduced-motion:reduce){.regional-map{animation:none}.regional-flow{animation:none}}
`;
