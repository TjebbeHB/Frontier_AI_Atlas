/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG actor controls have matching HTML story buttons. */
'use client';
import { useEffect, useState } from 'react';
import ScenarioMap from './scenario-map';
import {
  cooperativeActors,
  cooperativeDefault,
  cooperativeSafeguards,
  cooperativeSources,
  cooperativeStages,
} from '@/lib/scenario/cooperative';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  Shield,
  FlaskConical,
  Landmark,
} from 'lucide-react';
import {
  actors as originalActors,
  baseline,
  safeguards as originalSafeguards,
  scenarioSources as originalSources,
  stages as originalStages,
  firstUnresolved,
  stageRepaired,
  type Design,
} from '@/lib/scenario/data';
const edgeColors = {
  evidence: '#23a19c',
  decision: '#6678ff',
  pressure: '#e68c54',
  review: '#d2ba61',
};
export default function IntelligenceScenario({
  onProfile,
}: {
  onProfile: (id: string) => void;
}) {
  const [scenario, setScenario] = useState<'stress' | 'cooperative'>('stress');
  const [view, setView] = useState<'network' | 'map'>('network');
  const [playing, setPlaying] = useState(false);
  const cooperative = scenario === 'cooperative';
  const actors = cooperative ? cooperativeActors : originalActors;
  const stages = cooperative ? cooperativeStages : originalStages;
  const safeguards = cooperative ? cooperativeSafeguards : originalSafeguards;
  const scenarioSources = cooperative
    ? [
        ...originalSources.filter((s) =>
          ['reporting', 'surge', 'act'].includes(s.id),
        ),
        ...cooperativeSources,
      ]
    : originalSources;
  const [step, setStep] = useState(0);
  const [design, setDesign] = useState<Design>({ ...baseline });
  const [actorId, setActor] = useState('compact');
  const stage = stages[step],
    repaired = stageRepaired(stage, design);
  const actor = actors.find((a) => a.id === actorId)!;
  const reaction = stage.reactions.find((r) => r.actor === actorId);
  const first = cooperative
    ? stages.findIndex((s) => !stageRepaired(s, design))
    : firstUnresolved(design);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setStep((s) => Math.min(stages.length - 1, s + 1)),
      12000,
    );
    return () => clearInterval(timer);
  }, [playing, stages.length]);
  useEffect(() => {
    if (step === stages.length - 1) setPlaying(false);
  }, [step, stages.length]);
  function chooseScenario(next: 'stress' | 'cooperative') {
    setScenario(next);
    setStep(0);
    setActor('compact');
    setPlaying(false);
    setDesign({ ...(next === 'cooperative' ? cooperativeDefault : baseline) });
  }
  const missing = safeguards.filter(
    (s) => stage.needs.includes(s.id) && !design[s.id],
  );
  function go(index: number) {
    setPlaying(false);
    setStep(index);
    setActor(stages[index].reactions[0].actor);
  }
  return (
    <main className="scenario-page">
      <div
        className="scenario-picker"
        role="group"
        aria-label="Choose scenario"
      >
        <button
          aria-pressed={!cooperative}
          onClick={() => chooseScenario('stress')}
        >
          <span>01 · STRESS TEST</span>
          <strong>When institutions fall behind</strong>
          <small>Find the failures; strengthen the compact.</small>
        </button>
        <button
          aria-pressed={cooperative}
          onClick={() => chooseScenario('cooperative')}
        >
          <span>02 · COOPERATIVE PATH</span>
          <strong>Make safety a shared project</strong>
          <small>Fund joint audits with willing labs and US states.</small>
        </button>
      </div>
      <div className="scenario-heading">
        <div>
          <span className="eyebrow">SCENARIO LAB · HYPOTHETICAL</span>
          <h1>
            {cooperative
              ? 'Make safety a shared project.'
              : 'When intelligence outruns institutions.'}
          </h1>
          <p>
            {cooperative
              ? 'An EU-based coalition helps willing labs and US state agencies respond together. The coalition pays the audit costs.'
              : 'A democratic coalition faces an intelligence explosion—without the United States as a member.'}
          </p>
        </div>
        <span className="scenario-edition">
          Stress test
          <br />
          Not a forecast
        </span>
      </div>
      <div className="scenario-assumption">
        <strong>Scenario assumption</strong>
        <p>
          An intelligence explosion has begun. AI capabilities are accelerating
          faster than institutions can track, competitive dynamics between
          states and labs are intensifying, and power is concentrating. This is
          a world to stress-test, not a claim that these conditions have already
          been established.
        </p>
      </div>
      <section className="scenario-approach">
        <div>
          <span className="eyebrow">
            CHOSEN APPROACH · A SPECIFIC MECHANISM
          </span>
          <h2>
            {cooperative
              ? 'Democratic AI Audit Partnership'
              : 'Democratic AI Response Compact'}
          </h2>
          <p>
            A fictional institution in Brussels, supported by the{' '}
            <b>EU, UK, Canada, Japan, South Korea and Australia</b>. It pools
            evidence and technical capacity, while lawful enforcement stays with
            competent domestic authorities.{' '}
            {cooperative
              ? 'US federal membership is not assumed. Willing labs and US state agencies participate through lawful, voluntary arrangements. The fund covers independent auditors, testing compute and agreed lab engineering time; participation brings practical help, not legal immunity.'
              : 'The US is outside the compact.'}{' '}
            Membership and participation are exercise assumptions, not announced
            agreements.
          </p>
        </div>
        <details>
          <summary>Why this approach?</summary>
          <p>
            This is our own institutional design, informed by IAPS work on
            internal-use reporting and technical surge capacity. It is not an
            IAPS strategic vision or endorsement.
          </p>
          <p>
            AI 2040’s Plan A is a comparator: its proposed international
            agreement includes the US and China. These exercises explore a
            coalition without US federal membership, including a cooperative
            path with willing labs and US state agencies.
          </p>
          <a href="https://ai-2040.com/" target="_blank" rel="noreferrer">
            Read Plan A <ArrowUpRight size={13} />
          </a>
        </details>
      </section>
      <section
        className="scenario-design"
        aria-label="Institutional design choices"
      >
        <div className="scenario-section-heading">
          <div>
            <h2>Build the institution, then stress-test it.</h2>
            <p>
              {cooperative
                ? 'Start with the cooperative supports in place. Switch one off to explore what the positive outcome depends on.'
                : 'Assume these safeguards are prepared before day 0. Switch them on to compare the response.'}
            </p>
          </div>
          <div className="scenario-design-actions">
            <button onClick={() => setDesign({ ...baseline })}>
              Fragile design
            </button>
            <button
              onClick={() =>
                setDesign({
                  reporting: true,
                  escalation: true,
                  reserve: true,
                  checks: true,
                })
              }
            >
              Enable safeguards
            </button>
          </div>
        </div>
        <div className="scenario-switches">
          {safeguards.map((s) => (
            <label key={s.id} className={design[s.id] ? 'enabled' : ''}>
              <input
                type="checkbox"
                checked={design[s.id]}
                onChange={() => setDesign((d) => ({ ...d, [s.id]: !d[s.id] }))}
              />
              <span>
                <strong>{s.title}</strong>
                <small>{s.detail}</small>
              </span>
            </label>
          ))}
        </div>
        <div className="scenario-first-failure">
          <Shield size={18} />
          <span>
            <strong>
              First operational bottleneck:{' '}
              {first < 0
                ? 'none within these procedural checks'
                : `${stages[first].time} — ${stages[first].gap}`}
            </strong>
            <br />
            {cooperative
              ? 'Cooperation improves access and response within the participating group. Nonparticipants remain outside its audit authority; success here is illustrative, not a global safety guarantee.'
              : 'Even with all safeguards, non-member jurisdiction remains a hard limit. No design shown guarantees control of an intelligence explosion.'}
          </span>
        </div>
      </section>
      <section className="scenario-timeline" aria-label="Scenario timeline">
        <div className="scenario-section-heading">
          <h2>Follow the response</h2>
          <span>Relative exercise time · not predicted dates</span>
        </div>
        <div className="scenario-step-buttons">
          {stages.map((s, i) => (
            <button
              key={s.time}
              className={i === step ? 'current' : i < step ? 'past' : ''}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{s.time}</strong>
              <small>{s.title}</small>
            </button>
          ))}
        </div>
        <div className="scenario-timeline-controls">
          <button disabled={step === 0} onClick={() => go(step - 1)}>
            <ArrowLeft size={16} /> Previous
          </button>
          <label>
            Timeline position
            <input
              aria-label="Scenario timeline position"
              type="range"
              min="0"
              max={stages.length - 1}
              value={step}
              onChange={(e) => go(Number(e.target.value))}
            />
          </label>
          <button
            disabled={step === stages.length - 1}
            onClick={() => go(step + 1)}
          >
            Next stage <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              if (!playing && step === stages.length - 1) setStep(0);
              setPlaying((p) => !p);
            }}
            aria-pressed={playing}
          >
            {playing ? 'Pause' : 'Play timeline'}
          </button>
          <button aria-label="Restart scenario timeline" onClick={() => go(0)}>
            <RotateCcw size={16} />
          </button>
        </div>
      </section>
      <div
        className={`scenario-stage ${view === 'map' ? 'with-map' : ''}`}
        aria-live="polite"
      >
        <div className="scenario-narrative">
          <span className="eyebrow">
            {stage.time.toUpperCase()}{' '}
            {stage.first && !cooperative
              ? '· FIRST FAILURE IN THE FRAGILE DESIGN'
              : ''}
          </span>
          <h2>{stage.title}</h2>
          <p>{stage.event}</p>
          {cooperative ? (
            <details className="scenario-failure">
              <summary>Stress test: {stage.gap.toLowerCase()}</summary>
              <p>{stage.failure}</p>
            </details>
          ) : (
            <div className="scenario-failure">
              <span>WHAT BREAKS · {stage.gap}</span>
              <p>{stage.failure}</p>
            </div>
          )}
          <div className="scenario-repair">
            <span>
              {cooperative ? 'HOW COOPERATION WORKS' : 'DESIGN REPAIR'}
            </span>
            <p>{stage.fix}</p>
          </div>
          <div className={`scenario-outcome ${repaired ? 'improved' : ''}`}>
            <strong>
              {repaired
                ? step === 4 && !cooperative
                  ? 'Limited reach, even after repair'
                  : 'With your safeguards'
                : 'With the current design'}
            </strong>
            <p>{repaired ? stage.improved : stage.failure}</p>
            {missing.length > 0 && (
              <small>
                Missing here: {missing.map((s) => s.title).join(' · ')}
              </small>
            )}
          </div>
          {first >= 0 && first < step && (
            <p className="scenario-caveat">
              An earlier bottleneck remains at {stages[first].time}. This later
              scene explores additional pressure; it does not assume that
              failure was overcome.
            </p>
          )}
          <div className="scenario-stage-sources">
            {stage.sources.map((id) => {
              const s = scenarioSources.find((s) => s.id === id)!;
              return (
                <a key={id} href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ArrowUpRight size={12} />
                </a>
              );
            })}
          </div>
        </div>
        <div className="scenario-network-panel">
          <div className="scenario-network-title">
            <div
              className="scenario-view-toggle"
              role="group"
              aria-label="Scenario visualisation"
            >
              <button
                aria-pressed={view === 'network'}
                onClick={() => setView('network')}
              >
                Network
              </button>
              <button
                aria-pressed={view === 'map'}
                onClick={() => setView('map')}
              >
                Map
              </button>
            </div>
            <h3>
              {view === 'map'
                ? `${stage.time} · ${stage.title}`
                : 'Who acts, who depends on whom?'}
            </h3>
            <p>
              {repaired
                ? 'Hypothetical response with safeguards'
                : 'Hypothetical attempted response · actions may fail'}{' '}
              · select any actor
            </p>
          </div>
          {view === 'map' ? (
            <ScenarioMap
              actors={actors}
              stage={stage}
              actorId={actorId}
              onActor={setActor}
              cooperative={cooperative}
              colors={edgeColors}
            />
          ) : (
            <div className="scenario-network-scroll">
              <svg
                viewBox="0 0 1100 620"
                role="group"
                aria-label="Hypothetical coalition response network"
                className="scenario-network"
              >
                <defs>
                  {Object.entries(edgeColors).map(([kind, color]) => (
                    <marker
                      key={kind}
                      id={`scenario-arrow-${kind}`}
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                    </marker>
                  ))}
                </defs>
                <text
                  x="145"
                  y="20"
                  textAnchor="middle"
                  className="scenario-lane-label"
                >
                  COALITION MEMBERS
                </text>
                <text
                  x="545"
                  y="20"
                  textAnchor="middle"
                  className="scenario-lane-label"
                >
                  COORDINATION & RESPONSE
                </text>
                <text
                  x="945"
                  y="20"
                  textAnchor="middle"
                  className="scenario-lane-label"
                >
                  DEVELOPERS & WIDER WORLD
                </text>
                {stage.interactions.map((e, i) => {
                  const a = actors.find((a) => a.id === e.from)!,
                    b = actors.find((a) => a.id === e.to)!;
                  const direction = b.x >= a.x ? 1 : -1;
                  const sx = a.x + direction * 112,
                    tx = b.x - direction * 112;
                  const same = a.x === b.x;
                  const d = same
                    ? `M ${a.x + 112} ${a.y} C ${a.x + 180} ${a.y} ${b.x + 180} ${b.y} ${b.x + 112} ${b.y}`
                    : `M ${sx} ${a.y} C ${(sx + tx) / 2} ${a.y} ${(sx + tx) / 2} ${b.y} ${tx} ${b.y}`;
                  return (
                    <g key={`${e.from}-${e.to}-${i}`}>
                      <path
                        d={d}
                        stroke={edgeColors[e.kind]}
                        className={`scenario-edge ${e.from === actorId || e.to === actorId ? 'focused' : ''}`}
                        markerEnd={`url(#scenario-arrow-${e.kind})`}
                      />
                      <title>
                        {a.short} → {b.short}: {e.label}
                      </title>
                    </g>
                  );
                })}
                {actors.map((a) => {
                  const active = stage.interactions.some(
                    (e) => e.from === a.id || e.to === a.id,
                  );
                  return (
                    <g
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Read ${a.name} response`}
                      aria-pressed={a.id === actorId}
                      onClick={() => setActor(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActor(a.id);
                        }
                      }}
                      className={`scenario-node ${active ? 'active' : ''} ${a.id === actorId ? 'selected' : ''}`}
                    >
                      <rect
                        x={a.x - 112}
                        y={a.y - 29}
                        width="224"
                        height="61"
                        rx="12"
                      />
                      <circle
                        cx={a.x - 92}
                        cy={a.y - 4}
                        r="4"
                        fill={
                          a.group === 'member'
                            ? '#77d6c2'
                            : a.group === 'compact'
                              ? '#adb5ff'
                              : '#e8b17d'
                        }
                      />
                      <text x={a.x - 78} y={a.y} className="scenario-node-name">
                        {a.short}
                      </text>
                      <text
                        x={a.x - 78}
                        y={a.y + 18}
                        className="scenario-node-state"
                      >
                        {a.id === 'compact'
                          ? 'FICTIONAL · EU BASED'
                          : stage.reactions.some((r) => r.actor === a.id)
                            ? 'RESPONSE AT THIS STAGE'
                            : a.group === 'member'
                              ? 'ASSUMED MEMBER'
                              : 'CONTEXT ACTOR'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
          <div className="scenario-network-legend">
            {Object.entries(edgeColors).map(([k, c]) => (
              <span key={k}>
                <i style={{ background: c }} />
                {k}
              </span>
            ))}
            <small>
              {view === 'map'
                ? 'Geographic anchors and a separate cross-border strip. Dotted leaders connect labels to real locations; animated arrows connect actor callouts for this stage.'
                : 'Schematic, not geography. Animation shows relationship direction, not live events.'}{' '}
              {playing && 'Timeline advances every 12 seconds.'}
            </small>
          </div>
          <div
            className="scenario-actor-picker"
            role="group"
            aria-label="Select scenario actor"
          >
            {actors.map((a) => (
              <button
                key={a.id}
                aria-pressed={actorId === a.id}
                onClick={() => setActor(a.id)}
              >
                {a.short}
              </button>
            ))}
          </div>
          <div className="scenario-interactions">
            {stage.interactions.map((e, i) => (
              <button key={i} onClick={() => setActor(e.to)}>
                <b>
                  {actors.find((a) => a.id === e.from)?.short} →{' '}
                  {actors.find((a) => a.id === e.to)?.short}
                </b>
                <span>{e.label}</span>
              </button>
            ))}
          </div>
          <article className="scenario-actor-story">
            <div className="scenario-section-heading">
              <div>
                <span className="eyebrow">ACTOR STORY · HYPOTHETICAL</span>
                <h3>{actor.name}</h3>
                <small>
                  {actor.region} · {actor.role}
                </small>
              </div>
              {actor.atlas && (
                <button onClick={() => onProfile(actor.atlas!)}>
                  Related atlas profile <ArrowUpRight size={14} />
                </button>
              )}
            </div>
            <p>
              {reaction
                ? repaired
                  ? reaction.repaired
                  : reaction.story
                : 'No new action is scripted for this actor at this stage. Its standing role and limits remain below; select another timeline stage to follow the rest of its story.'}
            </p>
            <dl>
              <div>
                <dt>Relevant authority</dt>
                <dd>{actor.mandate}</dd>
              </div>
              <div>
                <dt>Limit that still matters</dt>
                <dd>{actor.limit}</dd>
              </div>
            </dl>
            <details>
              <summary>Follow this actor across the whole timeline</summary>
              {stages.map((s, i) => {
                const r = s.reactions.find((r) => r.actor === actor.id);
                return r ? (
                  <button
                    className="scenario-arc"
                    key={i}
                    onClick={() => {
                      setPlaying(false);
                      setStep(i);
                    }}
                  >
                    <b>{s.time}</b>
                    <span>
                      {stageRepaired(s, design) ? r.repaired : r.story}
                    </span>
                  </button>
                ) : null;
              })}
            </details>
          </article>
        </div>
      </div>
      <section className="scenario-requirements">
        <div className="scenario-section-heading">
          <div>
            <span className="eyebrow">
              DESIGN REQUIREMENTS · {stage.time.toUpperCase()}
            </span>
            <h2>What must exist for this response to work?</h2>
          </div>
        </div>
        <div className="scenario-requirement-grid">
          <article>
            <Landmark size={21} />
            <h3>Authority</h3>
            <p>{stage.authority}</p>
          </article>
          <article>
            <Shield size={21} />
            <h3>Information</h3>
            <p>{stage.information}</p>
          </article>
          <article>
            <FlaskConical size={21} />
            <h3>Capacity</h3>
            <p>{stage.capacity}</p>
          </article>
        </div>
        <div className="scenario-trigger">
          <strong>Escalation or review trigger</strong>
          <p>{stage.trigger}</p>
        </div>
        <div className="scenario-residual">
          <strong>What the fix does not solve</strong>
          <p>{stage.residual}</p>
        </div>
      </section>
      <details className="scenario-authority">
        <summary>
          Who can request, compel, investigate and require a remedy?
        </summary>
        <div className="scenario-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Actor / jurisdiction</th>
                <th>Request information</th>
                <th>Compel disclosure</th>
                <th>Technical investigation</th>
                <th>Require remedy</th>
              </tr>
            </thead>
            <tbody>
              {cooperative && (
                <tr>
                  <th>Willing US state agencies · own jurisdictions</th>
                  <td>
                    By lawful research, contract or procurement arrangement
                  </td>
                  <td>
                    No new compulsory power from participation; existing state
                    powers assessed separately
                  </td>
                  <td>
                    Fund or commission agreed tests with authorised access
                  </td>
                  <td>
                    Control own deployments within their remit; no power to
                    order global lab changes from this partnership
                  </td>
                </tr>
              )}
              <tr>
                <th>
                  {cooperative
                    ? 'Audit partnership · fictional'
                    : 'DARC · fictional compact'}
                </th>
                <td>Yes, by cooperation</td>
                <td>No independent power</td>
                <td>Commission agreed testing</td>
                <td>Recommendations only</td>
              </tr>
              <tr>
                <th>EU Commission / AI Office · EU</th>
                <td>Within applicable GPAI scope</td>
                <td>Scoped legal route under Article 91</td>
                <td>Article 92, subject to conditions</td>
                <td>Article 93, subject to conditions</td>
              </tr>
              <tr>
                <th>Other member authorities · domestic</th>
                <td>By mandate or agreement</td>
                <td>
                  {cooperative
                    ? 'Only under existing applicable law; audit participation creates no new compulsion'
                    : 'Only under applicable domestic law; new compact duties are assumed enacted in the repaired branch'}
                </td>
                <td>Authorised national or commissioned teams</td>
                <td>
                  {cooperative
                    ? 'Only under applicable powers or enforceable agreements; regulators remain separate'
                    : 'Only under applicable powers; the exercise’s new emergency procedure needs domestic authorisation'}
                </td>
              </tr>
              <tr>
                <th>Institutes / independent evaluators</th>
                <td>By agreement</td>
                <td>No power created by this scenario</td>
                <td>Yes, with authorised access and resources</td>
                <td>Advise; control their own tests</td>
              </tr>
              <tr>
                <th>Labs & clouds · own operations</th>
                <td>Own telemetry / contractual access</td>
                <td>No general public-law power</td>
                <td>Own systems, with independence limits</td>
                <td>Can act on their own services; comply with valid orders</td>
              </tr>
              <tr>
                <th>US / other non-members</th>
                <td>Separate domestic mandates</td>
                <td>No obligation merely from partnership or compact rules</td>
                <td>Separate mandates or voluntary joint work</td>
                <td>The coalition cannot issue them a general binding order</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Existing EU powers are a reference point, not a claim that every
          model, internal use or transitional case is covered. Headquarters do
          not determine jurisdiction. All compact-specific powers, memberships,
          thresholds and deadlines are proposed exercise assumptions.
        </p>
        <a
          href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng"
          target="_blank"
          rel="noreferrer"
        >
          EU AI Act: scope, Articles 91–94 and transitional provisions ↗
        </a>
      </details>
      <section className="scenario-source-notes">
        <h2>Evidence, assumptions and interpretation</h2>
        <p>
          The institution, events, actor responses, clock and design choices are
          authored for this exercise. They are not reported incidents,
          commitments by named governments, legislation or predictions.
          Switching safeguards changes illustrative design checks, not a
          calibrated simulation or a probability of success.{' '}
          {cooperative
            ? 'The positive path assumes sustained consent, adequate funding and effective tests. US states are illustrative partners; no named state or lab has committed to this fictional institution.'
            : 'All-on still leaves the non-member perimeter unresolved.'}
        </p>
        <div>
          {scenarioSources.map((s) => (
            <article key={s.id}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
                <ArrowUpRight size={14} />
              </a>
              <p>{s.note}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
