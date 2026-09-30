/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG map nodes need focusable SVG groups; equivalent HTML buttons exist in Authority view. */
'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Search,
  Globe2,
  Network,
  Scale,
  Play,
  RotateCcw,
  Plus,
  Minus,
  X,
  Check,
  Info,
  Building2,
  FlaskConical,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  nodes,
  edges,
  sources,
  tour,
  type Layer,
  type PowerValue,
} from '@/lib/governance';
import WorldMap, {
  ActorLogo,
  actorProfiles,
  actorConnections,
} from '@/components/world-map';
import { buildNetworkLayout } from '@/lib/explore';
import IntelligenceScenario from '@/components/intelligence-scenario';
import CareerTransition from '@/components/career-transition';
const colors: Record<Layer, string> = {
  Legal: '#3153c8',
  Institutional: '#167765',
  Voluntary: '#9b5d1a',
  Corporate: '#7d52b7',
};
const layers: Layer[] = ['Legal', 'Institutional', 'Voluntary', 'Corporate'];
const powerLabels = [
  'Request information',
  'Compel disclosure',
  'Technical investigation',
  'Require a remedy',
];
const regions = [
  'United States',
  'United Kingdom',
  'European Union',
  'China',
  'Asia-Pacific',
  'International',
  'Canada',
  'Africa',
  'Latin America',
  'Middle East',
];
const powerNames: Record<PowerValue, string> = {
  binding: 'Legal power',
  conditional: 'Conditional legal power',
  internal: 'Own systems only',
  voluntary: 'By agreement',
  research: 'Research role',
  none: 'No such power',
  future: 'Not yet in force',
};

function Citation({ id }: { id: string }) {
  const s = sources.find((s) => s.id === id);
  return s ? (
    <a href={s.url} target="_blank" rel="noreferrer" className="source-link">
      {s.title}
      <ArrowUpRight size={14} />
    </a>
  ) : null;
}
function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="filter-field">
      <label htmlFor={`filter-${label}`}>{label}</label>
      <Select value={value} onValueChange={(v) => onChange(v ?? 'All')}>
        <SelectTrigger
          id={`filter-${label}`}
          aria-label={label}
          className="filter-select"
        >
          <SelectValue>
            {value === 'All' ? `All ${label.toLowerCase()}` : value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {['All', ...options].map((v) => (
            <SelectItem key={v} value={v}>
              {v === 'All' ? `All ${label.toLowerCase()}` : v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function PowerBadge({ value }: { value: PowerValue }) {
  return (
    <span className={`power-badge power-${value}`}>
      {value === 'binding' ? (
        <Check size={12} />
      ) : value === 'none' ? (
        <Minus size={12} />
      ) : null}
      {powerNames[value]}
    </span>
  );
}
function wrap(t: string, max = 22) {
  const lines: string[] = [];
  let l = '';
  for (const w of t.split(' ')) {
    if ((l + ' ' + w).trim().length > max && l) {
      lines.push(l);
      l = w;
    } else l = (l + ' ' + w).trim();
  }
  if (l) lines.push(l);
  return lines;
}
export default function Home() {
  const [view, setView] = useState('world'),
    [group, setGroup] = useState('Geography'),
    [query, setQuery] = useState(''),
    [geo, setGeo] = useState('All'),
    [type, setType] = useState('All'),
    [horizon, setHorizon] = useState('All'),
    [power, setPower] = useState('All'),
    [activeLayers, setLayers] = useState<Layer[]>([...layers]),
    [core, setCore] = useState(true);
  const [selected, setSelected] = useState<string | null>(null),
    [hovered, setHovered] = useState<string | null>(null),
    [zoom, setZoom] = useState(1),
    [page, setPage] = useState('atlas'),
    [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    const syncPage = () => {
      const destination = window.location.hash.slice(1);
      setPage(
        destination === 'scenario' ||
          destination === 'sources' ||
          destination === 'careers'
          ? destination
          : 'atlas',
      );
    };
    syncPage();
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);
  function navigatePage(destination: string) {
    setPage(destination);
    window.history.replaceState(
      null,
      '',
      window.location.pathname +
        window.location.search +
        (destination === 'atlas' ? '' : '#' + destination),
    );
  }
  const filtered = useMemo(
    () =>
      nodes.filter(
        (n) =>
          (!core ||
            n.featured ||
            query ||
            geo !== 'All' ||
            type !== 'All' ||
            horizon !== 'All' ||
            power !== 'All' ||
            activeLayers.length < 4) &&
          activeLayers.includes(n.layer) &&
          (geo === 'All' || n.region === geo) &&
          (type === 'All' || n.type === type) &&
          (horizon === 'All' || n.horizons.includes(horizon)) &&
          (power === 'All' || n.power === power) &&
          (!query ||
            `${n.name} ${n.short} ${n.jurisdiction} ${n.mechanism} ${n.description}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [core, query, geo, type, horizon, power, activeLayers],
  );
  const current = step === null ? null : tour[step];
  const displayed = current
    ? filtered.filter((n) => current.nodes.includes(n.id))
    : filtered;
  const ids = new Set(displayed.map((n) => n.id)),
    visibleEdges = edges.filter((e) => ids.has(e.from) && ids.has(e.to)),
    active = nodes.find((n) => n.id === selected);
  const highlighted = hovered ?? selected,
    connected = new Set(
      edges
        .filter((e) => e.from === highlighted || e.to === highlighted)
        .flatMap((e) => [e.from, e.to]),
    );
  function reset() {
    setQuery('');
    setGeo('All');
    setType('All');
    setHorizon('All');
    setPower('All');
    setLayers([...layers]);
    setCore(true);
    setZoom(1);
  }
  function startTour() {
    reset();
    setCore(false);
    setView('network');
    setGroup('Geography');
    navigatePage('atlas');
    setSelected(null);
    setStep(0);
  }
  const {
    groups,
    positions,
    width: gw,
    height: gh,
  } = buildNetworkLayout(displayed, group);
  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigatePage('atlas')}
          aria-label="Frontier atlas home"
        >
          <span className="brand-dot" />
          <span>
            frontier<span className="brand-light">atlas</span>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={page === 'atlas' ? 'nav-active' : ''}
            onClick={() => navigatePage('atlas')}
          >
            Explore the map
          </button>
          <button
            className={page === 'sources' ? 'nav-active' : ''}
            onClick={() => navigatePage('sources')}
          >
            Sources & method
          </button>
          <button
            className={page === 'careers' ? 'nav-active' : ''}
            onClick={() => navigatePage('careers')}
          >
            Career transitions
          </button>
          <button
            className={page === 'scenario' ? 'nav-active' : ''}
            onClick={() => navigatePage('scenario')}
          >
            Scenario lab
          </button>
        </nav>
        <span className="edition">
          <span />
          14 September 2026 edition
        </span>
      </header>
      {page === 'careers' ? (
        <CareerTransition />
      ) : page === 'scenario' ? (
        <IntelligenceScenario onProfile={setSelected} />
      ) : page === 'atlas' ? (
        <main>
          <div className="intro">
            <div>
              <div className="eyebrow">THE FRONTIER AI GOVERNANCE MAP</div>
              <h1>Who governs the frontier?</h1>
              <p>
                Follow the institutions, the commitments, and the power to act.
              </p>
            </div>
            <button className="tour-launch" onClick={startTour}>
              <span className="play-circle">
                <Play size={16} fill="currentColor" />
              </span>
              <span>
                Follow an incident
                <small>A guided journey through the map</small>
              </span>
              <ArrowRight size={19} />
            </button>
          </div>
          <div className="overview">
            <span>
              <b>{nodes.length}</b> actors & mechanisms
            </span>
            <span>
              <b>{edges.length}</b> mapped relationships
            </span>
            <span>
              <b>4</b> governance layers
            </span>
            <div className="overview-note">
              <Info size={15} />
              Location is not jurisdiction. Select an entry to see its reach.
            </div>
          </div>
          {current && (
            <section className="tutorial" aria-label="Incident walkthrough">
              <div className="tour-top">
                <span className="eyebrow">
                  INCIDENT WALKTHROUGH · {step! + 1} / {tour.length}
                </span>
                <button
                  className="icon-button"
                  aria-label="Close tutorial"
                  onClick={() => setStep(null)}
                >
                  <X size={19} />
                </button>
              </div>
              <div className="tour-body">
                <div>
                  <div className="tour-kicker">{current.kicker}</div>
                  <h2>{current.title}</h2>
                  <p>{current.body}</p>
                  <div className="tour-actors">
                    {current.nodes.map((id) => {
                      const n = nodes.find((n) => n.id === id);
                      return n ? (
                        <button key={id} onClick={() => setSelected(id)}>
                          <span style={{ background: colors[n.layer] }} />
                          {n.short}
                          <ArrowUpRight size={13} />
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="tour-lesson">
                  <strong>{current.gapType}</strong>
                  <p>{current.lesson}</p>
                  <div className="mini-sources">
                    {current.sources.map((id) => (
                      <Citation key={id} id={id} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="tour-footer">
                <div className="step-dots">
                  {tour.map((t, i) => (
                    <button
                      key={t.title}
                      aria-label={`Step ${i + 1}: ${t.title}`}
                      aria-current={step === i ? 'step' : undefined}
                      className={i === step ? 'active' : ''}
                      onClick={() => setStep(i)}
                    />
                  ))}
                </div>
                <div>
                  <button
                    className="text-button"
                    disabled={step === 0}
                    onClick={() => setStep(step! - 1)}
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                  <button
                    className="primary-button"
                    onClick={() =>
                      step === tour.length - 1
                        ? setStep(null)
                        : setStep(step! + 1)
                    }
                  >
                    {step === tour.length - 1
                      ? 'Explore on your own'
                      : 'Next step'}
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
          )}
          <section
            className="workspace"
            aria-label="Interactive governance atlas"
          >
            <aside className="filters">
              <div className="filters-title">
                <span>
                  <SlidersHorizontal size={16} />
                  Explore by
                </span>
                <button
                  title="Reset filters"
                  aria-label="Reset all filters"
                  onClick={reset}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
              <label className="search-field">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find an actor or mechanism"
                  aria-label="Search governance entries"
                />
              </label>
              <Choice
                label="Geographies"
                value={geo}
                options={regions}
                onChange={setGeo}
              />
              <div className="layer-filter">
                <span className="filter-label">Governance layers</span>
                {layers.map((l) => (
                  <label
                    className="layer-choice"
                    htmlFor={`layer-${l}`}
                    key={l}
                  >
                    <Checkbox
                      id={`layer-${l}`}
                      checked={activeLayers.includes(l)}
                      onCheckedChange={(checked) =>
                        setLayers(
                          checked
                            ? [...activeLayers, l]
                            : activeLayers.filter((x) => x !== l),
                        )
                      }
                      aria-label={l}
                    />
                    <span
                      className="legend-dot"
                      style={{ background: colors[l] }}
                    />
                    {l}
                    <span className="layer-count">
                      {nodes.filter((n) => n.layer === l).length}
                    </span>
                  </label>
                ))}
              </div>
              <Choice
                label="Actor types"
                value={type}
                options={Array.from(new Set(nodes.map((n) => n.type)))}
                onChange={setType}
              />
              <Choice
                label="Time horizons"
                value={horizon}
                options={[
                  'Immediate response',
                  'Before release',
                  'Ongoing oversight',
                  'Long-term capacity',
                ]}
                onChange={setHorizon}
              />
              <Choice
                label="Power types"
                value={power}
                options={Array.from(new Set(nodes.map((n) => n.power)))}
                onChange={setPower}
              />
              <label className="core-toggle" htmlFor="core-network">
                <Switch
                  id="core-network"
                  checked={core}
                  onCheckedChange={setCore}
                  aria-label="Show core network"
                />
                <span>
                  Core network<small>Expand with any filter</small>
                </span>
              </label>
              <div className="filter-foot">
                <Shield size={17} />
                <span>
                  Power is scoped, not scored.
                  <br />
                  Every authority has conditions.
                </span>
              </div>
            </aside>
            <div className="visual-area">
              <Tabs value={view} onValueChange={(v) => setView(String(v))}>
                <div className="map-toolbar">
                  <TabsList className="view-tabs">
                    <TabsTrigger value="network">
                      <Network />
                      Network
                    </TabsTrigger>
                    <TabsTrigger value="world">
                      <Globe2 />
                      World
                    </TabsTrigger>
                    <TabsTrigger value="authority">
                      <Scale />
                      Authority
                    </TabsTrigger>
                  </TabsList>
                  {view === 'network' && (
                    <div className="group-control">
                      <span>Organise by</span>
                      <Select
                        value={group}
                        onValueChange={(v) => {
                          setGroup(v ?? 'Geography');
                          setZoom(1);
                        }}
                      >
                        <SelectTrigger aria-label="Organise network by">
                          <SelectValue>{group}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Geography',
                            'Governance layer',
                            'Actor type',
                            'Time horizon',
                            'Power',
                          ].map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="map-caption">
                  <span aria-live="polite">
                    {displayed.length} of {nodes.length} entries ·{' '}
                    {visibleEdges.length} relationships
                  </span>
                  <span>
                    {current
                      ? 'Highlighted: this stage of the incident'
                      : view === 'authority'
                        ? 'Read each scope before comparing powers'
                        : view === 'world'
                          ? 'Select a location to explore its actors'
                          : 'Select a node to trace its relationships'}
                  </span>
                </div>
                {displayed.length === 0 ? (
                  <div className="empty-state">
                    <Search size={30} />
                    <h2>No matching entries</h2>
                    <p>Try another term or reset the filters.</p>
                    <button className="primary-button" onClick={reset}>
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <>
                    <TabsContent value="network">
                      <div className="network-viewport">
                        <svg
                          className="network-svg"
                          width={gw * zoom}
                          height={gh * zoom}
                          viewBox={`0 0 ${gw} ${gh}`}
                          aria-label="Governance relationship network"
                        >
                          <defs>
                            <marker
                              id="arrow"
                              viewBox="0 0 8 8"
                              refX="7"
                              refY="4"
                              markerWidth="5"
                              markerHeight="5"
                              orient="auto-start-reverse"
                            >
                              <path d="M0 0L8 4L0 8" fill="#8793b5" />
                            </marker>
                          </defs>
                          {groups.map((g, i) => (
                            <g key={g}>
                              <rect
                                x={i * 194 + 9}
                                y="10"
                                width="183"
                                height={gh - 20}
                                rx="10"
                                fill={i % 2 === 0 ? '#eef1f977' : '#ffffff44'}
                              />
                              {wrap(g.toUpperCase(), 23).map((t, j) => (
                                <text
                                  key={j}
                                  x={i * 194 + 24}
                                  y={32 + j * 15}
                                  className="group-label"
                                >
                                  {t}
                                </text>
                              ))}
                            </g>
                          ))}
                          {visibleEdges.map((e, i) => {
                            const a = positions[e.from],
                              b = positions[e.to],
                              emph = highlighted
                                ? e.from === highlighted || e.to === highlighted
                                : current
                                  ? current.nodes.includes(e.from) &&
                                    current.nodes.includes(e.to)
                                  : false,
                              same = a.x === b.x,
                              sx = same
                                ? a.x + 157
                                : a.x + (b.x > a.x ? 157 : 0),
                              tx = same
                                ? b.x + 157
                                : b.x + (b.x > a.x ? 0 : 157),
                              sy = a.y + 32,
                              ty = b.y + 32,
                              d = same
                                ? `M${sx},${sy} C${sx + 29},${sy} ${tx + 29},${ty} ${tx},${ty}`
                                : `M${sx},${sy} C${sx + (tx - sx) * 0.48},${sy} ${tx - (tx - sx) * 0.48},${ty} ${tx},${ty}`;
                            return (
                              <path
                                key={i}
                                d={d}
                                fill="none"
                                stroke={emph ? '#3458d1' : '#9faac5'}
                                strokeWidth={emph ? 2 : 1}
                                opacity={
                                  highlighted && !emph ? 0.1 : emph ? 0.9 : 0.4
                                }
                                strokeDasharray={
                                  e.kind === 'legal'
                                    ? undefined
                                    : e.kind === 'control'
                                      ? '3 3'
                                      : '6 5'
                                }
                                markerEnd="url(#arrow)"
                              >
                                <title>{`${e.from} → ${e.to}: ${e.label}`}</title>
                              </path>
                            );
                          })}
                          {displayed.map((n) => {
                            const p = positions[n.id],
                              lit = current?.nodes.includes(n.id),
                              dim =
                                (highlighted &&
                                  !connected.has(n.id) &&
                                  highlighted !== n.id) ||
                                (current && !lit);
                            return (
                              <g
                                key={n.id}
                                transform={`translate(${p.x},${p.y})`}
                                tabIndex={0}
                                role="button"
                                aria-label={`${n.name}. ${n.layer}. Open details`}
                                onClick={() => setSelected(n.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelected(n.id);
                                  }
                                }}
                                onMouseEnter={() => setHovered(n.id)}
                                onMouseLeave={() => setHovered(null)}
                                className="graph-node"
                                opacity={dim ? 0.35 : 1}
                              >
                                <rect
                                  width="159"
                                  height="66"
                                  rx="9"
                                  fill="white"
                                  stroke={
                                    lit || highlighted === n.id
                                      ? '#3458d1'
                                      : '#dce0ed'
                                  }
                                  strokeWidth={
                                    lit || highlighted === n.id ? 2 : 1
                                  }
                                />
                                <rect
                                  y="16"
                                  width="3"
                                  height="34"
                                  rx="1.5"
                                  fill={colors[n.layer]}
                                />
                                <circle
                                  cx="15"
                                  cy="17"
                                  r="3"
                                  fill={colors[n.layer]}
                                />
                                <text x="25" y="21" className="node-type">
                                  {n.layer.toUpperCase()}
                                  {n.status === 'Scheduled' ? ' · FUTURE' : ''}
                                </text>
                                {wrap(n.short, 20)
                                  .slice(0, 2)
                                  .map((l, i) => (
                                    <text
                                      key={i}
                                      x="13"
                                      y={43 + i * 16}
                                      className="node-label"
                                    >
                                      {l}
                                    </text>
                                  ))}
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                      <div className="graph-footer">
                        <div className="line-legend">
                          <span>
                            <i className="solid-line" />
                            Legal authority
                          </span>
                          <span>
                            <i />
                            Access / influence
                          </span>
                          <span>
                            <i className="control-line" />
                            Operational control
                          </span>
                        </div>
                        <div className="zoom-controls">
                          <button
                            aria-label="Zoom out"
                            disabled={zoom <= 0.6}
                            onClick={() =>
                              setZoom((z) =>
                                Math.max(0.6, Math.round((z - 0.1) * 10) / 10),
                              )
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <button
                            aria-label="Reset zoom"
                            onClick={() => setZoom(1)}
                          >
                            {Math.round(zoom * 100)}%
                          </button>
                          <button
                            aria-label="Zoom in"
                            disabled={zoom >= 1.5}
                            onClick={() =>
                              setZoom((z) =>
                                Math.min(1.5, Math.round((z + 0.1) * 10) / 10),
                              )
                            }
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="world">
                      <WorldMap
                        entries={displayed}
                        onSelect={setSelected}
                        onExpand={() => setCore(false)}
                      />
                    </TabsContent>
                    <TabsContent value="authority">
                      <div className="authority-note">
                        These are different powers, not a ranking. For a law or
                        mechanism, powers belong to the administering actor
                        named in its detail. “Conditional” means a legal
                        trigger, scope or procedure applies. Future powers
                        cannot be used in today’s incident.
                      </div>
                      <Table className="authority-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Actor / jurisdiction</TableHead>
                            {powerLabels.map((p) => (
                              <TableHead key={p}>{p}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayed.map((n) => (
                            <TableRow key={n.id}>
                              <TableCell>
                                <button
                                  className="table-actor"
                                  onClick={() => setSelected(n.id)}
                                >
                                  {n.short}
                                  <ArrowUpRight size={14} />
                                </button>
                                <small>{n.jurisdiction}</small>
                              </TableCell>
                              {n.powers.map((p, i) => (
                                <TableCell key={i}>
                                  <PowerBadge value={p.value} />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
          </section>
          <section className="reading-guide">
            <div>
              <span className="eyebrow">HOW TO READ THIS MAP</span>
              <h2>
                Connections do not
                <br />
                all carry the same weight.
              </h2>
            </div>
            <div>
              <Scale size={21} />
              <h3>Authority has a boundary</h3>
              <p>
                A regulator’s reach depends on the law, the actor, the activity
                and the date. Headquarters alone tell you very little.
              </p>
            </div>
            <div>
              <FlaskConical size={21} />
              <h3>Access enables evidence</h3>
              <p>
                An evaluator needs suitable model access. Technical expertise
                does not automatically bring compulsory powers.
              </p>
            </div>
            <div>
              <Building2 size={21} />
              <h3>A gap needs a diagnosis</h3>
              <p>
                Missing authority calls for a different response from missing
                staff, access, expertise or coordination.
              </p>
            </div>
          </section>
        </main>
      ) : (
        <main className="sources-page">
          <div className="eyebrow">EVIDENCE & INTERPRETATION</div>
          <h1>What this map rests on.</h1>
          <p className="sources-intro">
            A curated snapshot as of 14 September 2026. Primary legal and
            institutional sources establish powers; research and commentary
            explain dependencies and gaps.
          </p>
          <div className="method-grid">
            <section>
              <h2>Scope & method</h2>
              <p>
                “Frontier” is a practical focus on highly capable
                general-purpose models. Legal definitions differ: EU GPAI with
                systemic risk, state-law frontier developers and China’s public
                generative AI services are not interchangeable categories.
              </p>
              <p>
                Each entry records an actor or mechanism, primary layer,
                jurisdiction, time horizons and four distinct powers. Locations
                are representative anchors, not territorial boundaries. The
                network is curated, not an exhaustive census of world AI
                governance. Coverage of Africa, Latin America and the Middle
                East remains selective; omissions do not mean an absence of
                governance.
              </p>
              <p>
                World-map marker size counts distinct connected entries in this
                curated dataset; it is an influence proxy, not a measured
                ranking of real-world authority or effectiveness. A numbered
                group uses its most-connected member’s location, size and icon.
                City bases are approximate; distributed bodies and mechanisms
                stay off the map.
              </p>
              <p>
                The four layers overlap. Corporate frameworks can support
                voluntary commitments and legal compliance. Edges show a
                specific relationship, not necessarily institutional
                subordination. Analytical links are labelled in their details.
                Grouping by time uses the first listed horizon; the time filter
                matches all listed horizons.
              </p>
            </section>
            <section>
              <h2>Interpreting power & gaps</h2>
              <p>
                Power types are qualitative, not an effectiveness score. A
                strong mandate does not prove frequent or well-resourced
                enforcement. “No such power” means no general frontier-model
                power in the mapped role, not that the organisation never
                exercises other powers.
              </p>
              <p>
                Gap labels separate authority, staffing, access, expertise and
                coordination. If a source does not measure a capacity deficit,
                the map calls it a dependency or uncertainty rather than
                asserting a shortage. More staff cannot fix an absent legal
                mandate.
              </p>
              <p>
                Time horizons describe when a mechanism is useful. “Scheduled”
                separately labels future legal duties. The tutorial is a
                fictional composite; recommended handoffs are analysis, not
                findings that reporting is legally required in an actual
                incident. This is a dated research snapshot, not a live legal
                tracker.
              </p>
            </section>
          </div>
          <section className="research-lenses">
            <h2>What the supplied readings add</h2>
            <div>
              <article>
                <h3>Evidence and access</h3>
                <p>
                  The AI Safety Report motivates the distinction between
                  scientific uncertainty and information asymmetry. METR’s
                  comparison helps identify recurring policy mechanisms; its
                  historical snapshot is supplemented here with current company
                  frameworks.
                </p>
                <Citation id="report" />
                <Citation id="us-metr-common" />
              </article>
              <article>
                <h3>Politics and priorities</h3>
                <p>
                  Leicht’s political phases are forecasts, not implementation
                  deadlines. Brundage’s triage argument highlights
                  prioritisation under time pressure; the map does not treat his
                  timelines as scientific consensus.
                </p>
                <Citation id="us-leicht" />
                <Citation id="us-brundage" />
              </article>
              <article>
                <h3>International interpretation</h3>
                <p>
                  Carnegie adds context on China’s approach to frontier risk. Ó
                  hÉigeartaigh’s abstract questions how AI-race rhetoric shapes
                  cooperation. The supplied temporary SSRN PDF link could not be
                  used; only the recovered abstract supports this lens.
                </p>
                <Citation id="gl-carnegie" />
                <Citation id="us-ssrn" />
              </article>
            </div>
          </section>
          <section className="source-index">
            <div className="source-heading">
              <h2>Source library</h2>
              <span>
                {sources.length} sources · retrieved 14 September 2026
              </span>
            </div>
            {sources.map((s, i) => (
              <article key={s.id}>
                <span className="source-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="source-kind">
                    {s.kind}
                    {s.supplied ? ' · SUPPLIED READING' : ''}
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                    <ArrowUpRight size={17} />
                  </a>
                  <p>{s.note}</p>
                </div>
              </article>
            ))}
          </section>
          <button
            className="primary-button"
            onClick={() => navigatePage('atlas')}
          >
            Return to the map
            <ArrowRight size={17} />
          </button>
        </main>
      )}
      <footer>
        <span className="footer-brand">
          <span className="brand-dot" />
          frontier atlas
        </span>
        <span>
          Independent educational project · BlueDot-inspired · Not affiliated
        </span>
        <button onClick={() => navigatePage('sources')}>
          Sources & methodology
          <ArrowUpRight size={14} />
        </button>
      </footer>
      <Sheet
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="entry-sheet">
          <SheetHeader>
            <span
              className="entry-layer"
              style={{ color: active ? colors[active.layer] : undefined }}
            >
              {active?.layer} · {active?.kind}
            </span>
            {active && <ActorLogo key={active.id} entry={active} size={52} />}
            <SheetTitle>{active?.name}</SheetTitle>
            <SheetDescription>{active?.description}</SheetDescription>
          </SheetHeader>
          {active && (
            <div className="entry-body">
              <div className="entry-quick-links">
                {actorProfiles[active.id]?.website && (
                  <a
                    href={actorProfiles[active.id].website!}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official website <ArrowUpRight size={14} />
                  </a>
                )}
                <a href="#entry-evidence">Publications & evidence ↓</a>
              </div>
              <div className="entry-map-context">
                <strong>
                  {actorProfiles[active.id]?.geographic
                    ? actorProfiles[active.id]?.city
                    : 'No single geographic base'}
                </strong>
                <p>{actorProfiles[active.id]?.locationNote}</p>
                {actorProfiles[active.id]?.locationSource && (
                  <a
                    href={actorProfiles[active.id].locationSource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Location source <ArrowUpRight size={13} />
                  </a>
                )}
                <span>
                  {actorConnections[active.id]} distinct connections in this
                  atlas · marker-size proxy
                </span>
                {actorProfiles[active.id]?.logoSource && (
                  <a
                    href={actorProfiles[active.id].logoSource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Logo source <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              <div className="entry-facts">
                <div>
                  <span>JURISDICTION / REACH</span>
                  <p>{active.jurisdiction}</p>
                </div>
                <div>
                  <span>POWER TYPE</span>
                  <p>{active.power}</p>
                </div>
                <div>
                  <span>STATUS</span>
                  <p>
                    {active.status} · {active.date}
                  </p>
                </div>
                <div>
                  <span>MECHANISM</span>
                  <p>{active.mechanism}</p>
                </div>
                <div>
                  <span>TIME HORIZON</span>
                  <p>{active.horizons.join(' · ')}</p>
                </div>
              </div>
              <h3>What can it actually do?</h3>
              <div className="powers-list">
                {active.powers.map((p, i) => (
                  <div key={i}>
                    <div>
                      <strong>{powerLabels[i]}</strong>
                      <PowerBadge value={p.value} />
                    </div>
                    <p>{p.detail}</p>
                  </div>
                ))}
              </div>
              <div className="gap-box">
                <h3>Where this can break down</h3>
                {active.gaps.map((g, i) => (
                  <div key={i}>
                    <span>{g.type}</span>
                    <p>{g.detail}</p>
                  </div>
                ))}
              </div>
              <h3>Connected to</h3>
              <div className="connections">
                {edges
                  .filter((e) => e.from === active.id || e.to === active.id)
                  .map((e, i) => {
                    const other = nodes.find(
                      (n) => n.id === (e.from === active.id ? e.to : e.from),
                    );
                    return (
                      <div key={i}>
                        <button onClick={() => setSelected(other!.id)}>
                          {e.from === active.id ? (
                            <ArrowRight size={15} />
                          ) : (
                            <ArrowLeft size={15} />
                          )}
                          <b>{other?.short}</b>
                          <ArrowUpRight size={14} />
                        </button>
                        <p>{e.label}</p>
                        <Citation id={e.source} />
                      </div>
                    );
                  })}
              </div>
              <h3 id="entry-evidence">Evidence & scope</h3>
              <div className="entry-sources">
                {active.sources.map((id) => (
                  <Citation id={id} key={id} />
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
