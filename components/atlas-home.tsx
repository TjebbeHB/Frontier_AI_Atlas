'use client';

import { ArrowRight, ArrowUpRight, Map } from 'lucide-react';
import GovernanceGlobe from '@/components/governance-globe';
import { nodes, edges } from '@/lib/governance';

function Orbit({ variant }: { variant: number }) {
  return <svg className="path-orbit" viewBox="0 0 90 90" fill="none" aria-hidden="true">
    <circle cx="45" cy="45" r="31" />
    <ellipse cx="45" cy="45" rx={variant === 2 ? 15 : 28} ry="33" transform={`rotate(${variant === 3 ? 50 : -25} 45 45)`} />
    {variant === 1 ? <path d="M22 62 63 26M48 26h15v15" /> : variant === 2 ? <path d="m45 29 13 6v12c0 9-13 15-13 15S32 56 32 47V35l13-6Z" /> : <><circle cx="45" cy="36" r="7"/><path d="M31 62v-6a14 14 0 0 1 28 0v6"/></>}
    <circle className="orbit-accent" cx={variant === 1 ? 69 : 24} cy={variant === 1 ? 25 : 64} r="4" />
  </svg>;
}

export default function AtlasHome({ onExplore, onIncident, onNavigate, onProfile }: {
  onExplore: (view?: string) => void;
  onIncident: () => void;
  onNavigate: (destination: string) => void;
  onProfile: (id: string) => void;
}) {
  const paths = [
    { number: '01', title: 'Explore the atlas', body: 'Trace authority, evidence and connections.', action: 'Open the map', click: () => onExplore('globe') },
    { number: '02', title: 'Test a response', body: 'Follow a risk across institutions.', action: 'Choose a scenario', click: () => onNavigate('scenario') },
    { number: '03', title: 'Shape your next step', body: 'Find courses, communities and career paths.', action: 'Explore careers', click: () => onNavigate('careers') },
  ];
  return <main className="atlas-home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-orbits" aria-hidden="true"><i/><i/><i/></div>
      <div className="home-copy">
        <div className="eyebrow">FRONTIER AI GOVERNANCE</div>
        <h1 id="home-title">A shared world.<br/>A connected<br className="wide-break"/> challenge.</h1>
        <p className="home-lede">See who can act, who holds the evidence, and how they depend on each other.</p>
        <div className="home-actions">
          <button className="home-primary" onClick={() => onExplore('globe')}>Explore the globe <ArrowRight size={20}/></button>
          <button className="home-secondary" onClick={onIncident}>Follow an incident <ArrowUpRight size={18}/></button>
        </div>
        <div className="home-facts" aria-label="Atlas coverage">
          <span><b>{nodes.length}</b> actors & mechanisms</span>
          <span><b>{edges.length}</b> sourced relationships</span>
          <span><b>4</b> governance layers</span>
        </div>
        <div className="home-principle">PEOPLE <span/> EVIDENCE <span/> SAFER AI TOGETHER</div>
      </div>
      <div className="home-globe">
        <GovernanceGlobe entries={nodes} variant="hero" onProfile={onProfile}/>
        <div className="home-map-alternative"><span>A location is an anchor, not a jurisdiction.</span><button onClick={() => onExplore('world')}><Map size={14}/> Switch to flat map <ArrowUpRight size={13}/></button></div>
      </div>
    </section>
    <section className="home-paths" aria-labelledby="paths-title">
      <div className="paths-heading"><h2 id="paths-title">Where would you like to begin?</h2><span>Understand the system. Find your place in it.</span></div>
      <div className="path-grid">
        {paths.map((path, i) => <button className="path-card" key={path.number} onClick={path.click}>
          <div className="path-top"><span className="path-number">{path.number}</span><Orbit variant={i + 1}/></div>
          <h3>{path.title}</h3><p>{path.body}</p><span className="path-link">{path.action}<ArrowUpRight size={16}/></span>
        </button>)}
      </div>
    </section>
  </main>;
}
