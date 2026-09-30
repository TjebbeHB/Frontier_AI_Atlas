'use client';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  MapPin,
  Wallet,
  Search,
  RotateCcw,
  Compass,
  Globe2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { opportunities } from '@/lib/careers/data';
import {
  assess,
  checkedOn,
  fundingLabels,
  opportunityStatus,
  regionLabels,
  trackLabels,
} from '@/lib/careers/match';
import {
  emptyProfile,
  type Kind,
  type Passport,
  type Profile,
  type Region,
  type Track,
} from '@/lib/careers/types';
import CareerWorkRights from './career-work-rights';
const steps = [
  'Your background',
  'Time & commitments',
  'Funding & location',
  'Work permission',
];
const statusLabels = {
  open: 'Applications open',
  rolling: 'Ongoing / rolling route',
  closed: 'Listed round closed',
  check: 'Check next opening',
  resource: 'Resource available',
  invite: 'No public application',
};
const passportOptions: { id: Passport; label: string }[] = [
  { id: 'eu', label: 'EU / EEA / Swiss citizenship (not Irish)' },
  { id: 'irish', label: 'Irish citizenship' },
  { id: 'british', label: 'British citizenship' },
  { id: 'american', label: 'US citizenship' },
  { id: 'other', label: 'Another citizenship' },
  { id: 'unsure', label: 'Prefer not to say / not sure' },
];
function Multi({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`career-multi ${checked ? 'chosen' : ''}`}>
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
function Options<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; title: string; detail?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="career-field">
      <legend>{label}</legend>
      <div className="career-options">
        {options.map((o) => (
          <label key={o.id} className={o.id === value ? 'chosen' : ''}>
            <input
              type="radio"
              name={label}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
            />
            <span>
              <strong>{o.title}</strong>
              {o.detail && <small>{o.detail}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export default function CareerTransition() {
  const [profile, setProfile] = useState<Profile>({ ...emptyProfile });
  const [step, setStep] = useState(0),
    [complete, setComplete] = useState(false);
  const [kind, setKind] = useState<Kind | 'All'>('All'),
    [query, setQuery] = useState(''),
    [showAll, setShowAll] = useState(false);
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }
  function toggleTrack(t: Track) {
    update(
      'tracks',
      profile.tracks.includes(t)
        ? profile.tracks.filter((x) => x !== t)
        : [...profile.tracks, t],
    );
  }
  function togglePassport(v: Passport) {
    update(
      'passports',
      v === 'unsure'
        ? profile.passports.includes(v)
          ? []
          : [v]
        : profile.passports.includes(v)
          ? profile.passports.filter((x) => x !== v)
          : [...profile.passports.filter((x) => x !== 'unsure'), v],
    );
  }
  function toggleRight(r: Region) {
    const rights = profile.rights.includes(r)
      ? profile.rights.filter((x) => x !== r)
      : [...profile.rights, r];
    setProfile((p) => ({
      ...p,
      rights,
      permission: rights.length ? 'listed' : 'unsure',
    }));
  }
  const ready = [
    profile.tracks.length > 0 && !!profile.experience,
    !!profile.hours,
    !!profile.funding && !!profile.mobility && !!profile.home,
    profile.passports.length > 0,
  ][step];
  const ranked = useMemo(
    () =>
      opportunities
        .map((o) => assess(o, profile))
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.opportunity.organisation.localeCompare(
              b.opportunity.organisation,
            ),
        ),
    [profile],
  );
  const visible = ranked.filter(
    (r) =>
      (showAll || !!query.trim() || !r.conflicts.length) &&
      (kind === 'All' || r.opportunity.kind === kind) &&
      `${r.opportunity.organisation} ${r.opportunity.title} ${r.opportunity.summary}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const compatible = ranked.filter((r) => !r.conflicts.length).length;
  return (
    <main className="career-page">
      <div className="career-heading">
        <div>
          <span className="eyebrow">CAREER TRANSITIONS</span>
          <h1>Find your way into AI safety.</h1>
          <p>
            Research, governance, biosecurity and the people who make the work
            happen. Start with what is practical for you.
          </p>
        </div>
        <span className="career-review-date">
          Sources checked
          <br />
          <strong>{checkedOn}</strong>
        </span>
      </div>
      {!complete ? (
        <section
          className="career-questionnaire"
          aria-label="Career transition questionnaire"
        >
          <ol className="career-progress">
            {steps.map((s, i) => (
              <li
                key={s}
                className={i === step ? 'current' : i < step ? 'past' : ''}
                aria-current={i === step ? 'step' : undefined}
              >
                <span>{i < step ? <Check size={16} /> : i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="career-question-content">
            <div className="career-question-intro">
              <span className="eyebrow">STEP {step + 1} OF 4</span>
              <h2>{steps[step]}</h2>
              <p>
                {
                  [
                    'Select the experience you can bring. These are starting points, not fixed career tracks.',
                    'Choose a sustainable commitment. You do not need to tell us whether you have children or other dependants.',
                    'Free learning, living stipends, salaries and project grants solve different needs.',
                    'Citizenship and current work permission are separate. No passport numbers or personal documents are needed.',
                  ][step]
                }
              </p>
            </div>
            <div className="career-question-fields">
              {step === 0 && (
                <>
                  <fieldset className="career-field">
                    <legend>
                      Which backgrounds describe you? Select all that apply.
                    </legend>
                    <div className="career-multi-grid">
                      {(Object.keys(trackLabels) as Track[]).map((t) => (
                        <Multi
                          key={t}
                          label={trackLabels[t]}
                          checked={profile.tracks.includes(t)}
                          onChange={() => toggleTrack(t)}
                        />
                      ))}
                    </div>
                  </fieldset>
                  <Options
                    label="Where are you in the transition?"
                    value={profile.experience}
                    onChange={(v) => update('experience', v)}
                    options={[
                      {
                        id: 'exploring',
                        title: 'Exploring the field',
                        detail: 'I want a manageable first step.',
                      },
                      {
                        id: 'professional',
                        title: 'Bringing experience from another field',
                        detail: 'I want to transfer existing skills.',
                      },
                      {
                        id: 'ai',
                        title: 'Already doing relevant AI work',
                        detail: 'I want a programme, role or next project.',
                      },
                    ]}
                  />
                </>
              )}
              {step === 1 && (
                <>
                  <Options
                    label="How much time could you sustainably commit?"
                    value={profile.hours}
                    onChange={(v) => update('hours', v)}
                    options={[
                      { id: '5', title: 'Up to 5 hours / week' },
                      { id: '15', title: 'Up to 15 hours / week' },
                      { id: '30', title: 'Up to 30 hours / week' },
                      { id: '40', title: 'Full-time (about 40 hours / week)' },
                    ]}
                  />
                  <Options
                    label="What does your schedule need?"
                    value={profile.schedule}
                    onChange={(v) => update('schedule', v)}
                    options={[
                      {
                        id: 'predictable',
                        title: 'Predictable hours',
                        detail: 'For work, care, family or other commitments.',
                      },
                      { id: 'flexible', title: 'I can be flexible' },
                      {
                        id: 'unsure',
                        title: 'I need to discuss the timetable',
                      },
                    ]}
                  />
                  <Options
                    label="Could you attend a required trip or residential event?"
                    value={profile.travel}
                    onChange={(v) => update('travel', v)}
                    options={[
                      { id: 'no', title: 'No required travel' },
                      { id: 'yes', title: 'Yes, with notice' },
                      {
                        id: 'unsure',
                        title: 'It depends on support and duration',
                      },
                    ]}
                  />
                </>
              )}
              {step === 2 && (
                <>
                  <Options
                    label="What funding would make a transition possible?"
                    value={profile.funding}
                    onChange={(v) => update('funding', v)}
                    options={[
                      {
                        id: 'income',
                        title: 'I need replacement income',
                        detail: 'A salary or adequate living stipend matters.',
                      },
                      {
                        id: 'support',
                        title: 'I need financial support',
                        detail: 'A grant or stipend could make it possible.',
                      },
                      {
                        id: 'self',
                        title: 'I can self-fund a defined period',
                        detail: 'I still want to compare funded routes.',
                      },
                      { id: 'unsure', title: 'Not sure yet' },
                    ]}
                  />
                  <Options
                    label="Where are you currently based?"
                    value={profile.home}
                    onChange={(v) => update('home', v)}
                    options={[
                      { id: 'EU', title: 'EU / EEA' },
                      { id: 'UK', title: 'United Kingdom' },
                      { id: 'US', title: 'United States' },
                      { id: 'Other', title: 'Elsewhere / prefer not to say' },
                    ]}
                  />
                  <Options
                    label="How much location flexibility do you have?"
                    value={profile.mobility}
                    onChange={(v) => update('mobility', v)}
                    options={[
                      {
                        id: 'stay',
                        title: 'Stay where I live',
                        detail: 'Remote or a realistic local commute.',
                      },
                      {
                        id: 'visit',
                        title: 'A short stay elsewhere',
                        detail: 'Up to eight weeks; no long-term relocation.',
                      },
                      {
                        id: 'move',
                        title: 'Open to relocating',
                        detail: 'Subject to costs and work permission.',
                      },
                    ]}
                  />
                </>
              )}
              {step === 3 && (
                <>
                  <fieldset className="career-field">
                    <legend>
                      Which citizenships do you hold? Select all that apply.
                    </legend>
                    <div className="career-multi-grid">
                      {passportOptions.map((p) => (
                        <Multi
                          key={p.id}
                          label={p.label}
                          checked={profile.passports.includes(p.id)}
                          onChange={() => togglePassport(p.id)}
                        />
                      ))}
                    </div>
                    <p className="career-field-note">
                      Used only to flag work-permission questions. Irish
                      citizenship has different UK access from other EU
                      citizenship.
                    </p>
                  </fieldset>
                  <fieldset className="career-field">
                    <legend>
                      Where do you already have work permission without new
                      employer sponsorship?
                    </legend>
                    <div className="career-multi-grid">
                      {(['EU', 'UK', 'US'] as Region[]).map((r) => (
                        <Multi
                          key={r}
                          label={
                            r === 'EU'
                              ? 'At least one EU / EEA country'
                              : regionLabels[r]
                          }
                          checked={profile.rights.includes(r)}
                          onChange={() => toggleRight(r)}
                        />
                      ))}
                    </div>
                    <p className="career-field-note">
                      Include citizenship-based rights or a valid status
                      covering the proposed work. A permit for one employer,
                      country or activity may not transfer.
                    </p>
                    <div className="career-permission-actions">
                      <button
                        aria-pressed={profile.permission === 'need'}
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            rights: [],
                            permission: 'need',
                          }))
                        }
                      >
                        I would need permission elsewhere
                      </button>
                      <button
                        aria-pressed={profile.permission === 'unsure'}
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            rights: [],
                            permission: 'unsure',
                          }))
                        }
                      >
                        Not sure / prefer not to say
                      </button>
                    </div>
                  </fieldset>
                </>
              )}
            </div>
          </div>
          <div className="career-question-footer">
            <small>
              Answers stay in this page’s browser memory. They are not saved or
              sent to organisations.
            </small>
            <div>
              <button
                className="career-secondary"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                className="career-primary"
                disabled={!ready}
                onClick={() =>
                  step === 3 ? setComplete(true) : setStep((s) => s + 1)
                }
              >
                {step === 3 ? 'See my options' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="career-profile-summary">
            <div>
              <span className="eyebrow">YOUR STARTING POINT</span>
              <h2>
                {profile.experience === 'exploring'
                  ? 'Start small, build evidence.'
                  : profile.experience === 'professional'
                    ? 'Bring your existing strengths.'
                    : 'Find support for your next step.'}
              </h2>
              <p>
                {profile.tracks.map((t) => trackLabels[t]).join(' · ')} · Up to{' '}
                {profile.hours} hours/week ·{' '}
                {profile.mobility === 'stay'
                  ? 'Staying local'
                  : profile.mobility === 'visit'
                    ? 'Short stays possible'
                    : 'Open to relocating'}
              </p>
              <small>
                Ranked by topic, time, funding and travel. Reasons and
                constraints are shown; this is not an admissions or visa
                eligibility verdict.
              </small>
            </div>
            <div>
              <button
                className="career-secondary"
                onClick={() => {
                  setComplete(false);
                  setStep(0);
                }}
              >
                Edit answers
              </button>
              <button
                className="career-reset"
                onClick={() => {
                  setProfile({ ...emptyProfile });
                  setComplete(false);
                  setStep(0);
                  setKind('All');
                  setQuery('');
                  setShowAll(false);
                }}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </section>
          <div className="career-next-steps">
            <article>
              <Compass size={21} />
              <h3>Make a reversible first move</h3>
              <p>
                {profile.hours === '5'
                  ? 'Start with advice, local community or self-paced learning. Most residential research fellowships need more time.'
                  : profile.tracks.includes('biology')
                    ? 'Use your biology or health experience in biosecurity, AI–bio evaluation or policy. Some routes need additional technical or policy preparation.'
                    : 'Try a course, a small research project or a targeted advice session before making a larger commitment.'}
              </p>
            </article>
            <article>
              <Wallet size={21} />
              <h3>
                {profile.funding === 'self'
                  ? 'Set a runway before you start'
                  : 'Check what the funding covers'}
              </h3>
              <p>
                A free course does not replace income. Compare the total after
                tax with housing, dependants, healthcare, travel and payment
                dates. Grants are not guaranteed offers.
              </p>
            </article>
            <article>
              <Clock size={21} />
              <h3>
                {profile.schedule === 'predictable'
                  ? 'Ask for a workable timetable'
                  : 'Check the actual commitment'}
              </h3>
              <p>
                {profile.schedule === 'predictable'
                  ? 'Ask about meeting times, attendance, part-time arrangements and support for caring responsibilities. No family status is used to rank you.'
                  : '“Remote” may still include a residential event. Confirm weekly hours, time zones, required travel and whether outside employment is permitted.'}
              </p>
            </article>
          </div>
          <CareerWorkRights profile={profile} />
          <section
            className="career-directory"
            aria-label="Career opportunities"
          >
            <div className="career-directory-heading">
              <div>
                <h2>
                  {showAll
                    ? 'Explore the full directory'
                    : 'Options to investigate first'}
                </h2>
                <p>
                  {compatible} of {opportunities.length} resources have no known
                  conflict with your selected constraints. Details still need
                  checking.
                </p>
              </div>
              <label className="career-search">
                <Search size={17} />
                <input
                  aria-label="Search career resources"
                  placeholder="Search organisations or programmes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div className="career-directory-filters">
              <div role="group" aria-label="Opportunity type">
                {(
                  [
                    'All',
                    'Advice',
                    'Course',
                    'Fellowship',
                    'Funding',
                    'Community',
                    'Research',
                    'Jobs',
                  ] as const
                ).map((k) => (
                  <button
                    key={k}
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <Multi
                label="Include closed rounds and options with constraints"
                checked={showAll}
                onChange={() => setShowAll((v) => !v)}
              />
            </div>
            <p className="career-count" aria-live="polite">
              Showing {visible.length}{' '}
              {visible.length === 1 ? 'resource' : 'resources'}. Cohort and
              funding details were checked {checkedOn}; confirm them before
              applying.
            </p>
            {!visible.length && (
              <div className="career-empty">
                <h3>No resources meet these filters.</h3>
                <p>
                  Try a different type, clear the search, or include programmes
                  with constraints to see what would need to change.
                </p>
                <button
                  className="career-secondary"
                  onClick={() => {
                    setKind('All');
                    setQuery('');
                    setShowAll(true);
                  }}
                >
                  Show every resource
                </button>
              </div>
            )}
            <div className="career-card-grid">
              {visible.map(({ opportunity: o, reasons, checks, conflicts }) => (
                <article
                  className={`career-card ${conflicts.length ? 'has-constraints' : ''}`}
                  key={o.id}
                >
                  <div className="career-card-top">
                    <span>{o.kind}</span>
                    <span
                      className={`career-status status-${opportunityStatus(o)}`}
                    >
                      {statusLabels[opportunityStatus(o)]}
                    </span>
                  </div>
                  <h3>
                    <a href={o.url} target="_blank" rel="noreferrer">
                      {o.organisation}
                      <ArrowUpRight size={17} />
                    </a>
                  </h3>
                  <h4>{o.title}</h4>
                  <p>{o.summary}</p>
                  <div className="career-card-facts">
                    <span>
                      <MapPin size={15} />
                      {o.location}
                    </span>
                    <span>
                      <Clock size={15} />
                      {o.time} · {o.duration}
                    </span>
                    <span>
                      <Wallet size={15} />
                      {fundingLabels[o.fundingType]}
                    </span>
                  </div>
                  <div className="career-fit">
                    <strong>
                      {conflicts.length
                        ? 'What would need to change'
                        : 'Why consider this'}
                    </strong>
                    <ul>
                      {(conflicts.length ? conflicts : reasons.slice(0, 3)).map(
                        (r) => (
                          <li key={r}>{r}</li>
                        ),
                      )}
                    </ul>
                  </div>
                  {o.deadline && opportunityStatus(o) === 'open' && (
                    <p className="career-deadline">
                      Apply by {o.deadline} · confirm the provider’s cutoff time
                    </p>
                  )}
                  {!conflicts.length && checks.length > 0 && (
                    <div className="career-key-check">
                      <strong>Check before committing</strong>
                      <p>{checks.slice(0, 2).join(' ')}</p>
                    </div>
                  )}
                  <details>
                    <summary>Funding, eligibility & sources</summary>
                    <dl>
                      <dt>Funding</dt>
                      <dd>{o.funding}</dd>
                      <dt>Who it is for</dt>
                      <dd>{o.entry}</dd>
                      <dt>Visa / work permission</dt>
                      <dd>{o.visa}</dd>
                      <dt>Applications</dt>
                      <dd>{o.statusNote}</dd>
                    </dl>
                    {checks.length > 0 && (
                      <div className="career-checks">
                        <strong>Before committing</strong>
                        <ul>
                          {checks.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="career-source-links">
                      {o.sources.map((s) => (
                        <a
                          key={s.url}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.label}
                          <ArrowUpRight size={13} />
                        </a>
                      ))}
                    </div>
                  </details>
                  <a
                    className="career-provider-link"
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {opportunityStatus(o) === 'closed'
                      ? 'View programme / future rounds'
                      : opportunityStatus(o) === 'invite'
                        ? 'Read access / nomination details'
                        : 'Visit the official page'}
                    <ArrowUpRight size={15} />
                  </a>
                </article>
              ))}
            </div>
          </section>
          <div className="career-method">
            <Globe2 size={19} />
            <p>
              <strong>A starting map, not a promise of admission.</strong>{' '}
              Biology, technical and governance experience can transfer across
              tracks. Current programmes, permanent resources and funders are
              labelled separately. Full-time uses the 40-hour band; actual hours
              may vary. Unknown visa, schedule or funding details remain
              unknown. Inclusion does not imply endorsement or an open role.
            </p>
          </div>
        </>
      )}
    </main>
  );
}
