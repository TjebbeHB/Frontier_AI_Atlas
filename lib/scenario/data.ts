export type DesignKey = 'reporting' | 'escalation' | 'reserve' | 'checks';
export type Design = Record<DesignKey, boolean>;
export const baseline: Design = {
  reporting: false,
  escalation: false,
  reserve: false,
  checks: false,
};
export const safeguards = [
  {
    id: 'reporting',
    title: 'Evidence before release',
    detail:
      'Confidential internal-use notices, preserved logs and pre-agreed evaluator access. Requires enforceable domestic duties or contracts; a treaty label alone is insufficient.',
  },
  {
    id: 'escalation',
    title: 'Adaptive escalation',
    detail:
      'A corroborated warning starts a 24-hour review. A competent domestic authority may impose a narrow, reviewable 72-hour measure under a pre-enacted power. These are exercise parameters.',
  },
  {
    id: 'reserve',
    title: 'Ready technical capacity',
    detail:
      'Funded, pre-cleared teams, independent evaluators, reserved compute and rehearsed secure access across time zones. Recruitment during the crisis is too late.',
  },
  {
    id: 'checks',
    title: 'Distributed power & sunset',
    detail:
      'Separate scientific advice from enforcement; rotate leadership, require conflict recusals and independent appeals. Emergency delegation expires at day 30 unless democratically renewed.',
  },
] as const;
export const scenarioSources = [
  {
    id: 'plan',
    title: 'AI 2040: Plan A',
    url: 'https://ai-2040.com/',
    note: 'Comparator: a proposed international deal to slow dangerous scaling, with research transparency. Its narrative includes a US–China agreement; our non-US compact is a different mechanism.',
  },
  {
    id: 'reporting',
    title: 'IAPS · Internal-use risk reporting',
    url: 'https://www.iaps.ai/research/risk-reporting-for-developers-internal-ai-model-use',
    note: 'Inspiration for confidential reporting about models used inside developers, rather than relying only on public releases. This compact is not an IAPS proposal or endorsement.',
  },
  {
    id: 'surge',
    title: 'IAPS · Building AI surge capacity',
    url: 'https://www.iaps.ai/research/building-ai-surge-capacity',
    note: 'US-focused work on mobilising technical talent. We adapt the preparedness idea to a multinational exercise; that extension is our own.',
  },
  {
    id: 'act',
    title: 'EU AI Act · official regulation',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng',
    note: 'Existing legal baseline, especially scope and Articles 91–94. Applicability, transition rules and procedural protections still matter. It does not create the fictional compact.',
  },
  {
    id: 'eval',
    title: 'AI Act · Article 92: evaluations',
    url: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-92',
    note: 'Existing EU evaluation and model-access provisions, subject to their conditions. They do not grant general global inspection rights.',
  },
  {
    id: 'remedy',
    title: 'AI Act · Article 93: measures',
    url: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-93',
    note: 'Existing scoped measures concerning GPAI providers, including mitigation and market restrictions. Not a worldwide power to shut down training.',
  },
];
export type Actor = {
  id: string;
  name: string;
  short: string;
  region: string;
  role: string;
  mandate: string;
  limit: string;
  x: number;
  y: number;
  group: 'member' | 'compact' | 'external';
  atlas?: string;
};
export const actors: Actor[] = [
  {
    id: 'eu',
    name: 'European Union',
    short: 'European Union',
    region: 'EU',
    role: 'Member · Commission & competent authorities',
    mandate:
      'In this exercise, sponsors the compact and assesses action within EU legal scope. Existing AI Act powers remain with their named authorities.',
    limit:
      'Hosting the compact does not transfer EU powers to it or extend EU jurisdiction worldwide.',
    x: 145,
    y: 65,
    group: 'member',
    atlas: 'office',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    short: 'United Kingdom',
    region: 'UK',
    role: 'Member · government + technical institute',
    mandate:
      'Contributes testing and domestic coordination. Any new compulsory internal-use duty or emergency restriction is a scenario assumption requiring domestic enactment.',
    limit:
      'Scientific testing is not a general power to compel another country’s lab. UK-based research does not make a multinational group UK-controlled.',
    x: 145,
    y: 163,
    group: 'member',
    atlas: 'aisi',
  },
  {
    id: 'canada',
    name: 'Canada',
    short: 'Canada',
    region: 'Canada',
    role: 'Member · government + research teams',
    mandate:
      'In the scenario, funds shared evaluations and negotiates domestic access arrangements; keeps a separate national decision maker.',
    limit:
      'Membership does not itself create Canadian inspection or shutdown authority.',
    x: 145,
    y: 261,
    group: 'member',
    atlas: 'caaisi',
  },
  {
    id: 'japan',
    name: 'Japan',
    short: 'Japan',
    region: 'Japan',
    role: 'Member · government + technical institute',
    mandate:
      'In the scenario, provides replication teams and procurement coordination, subject to domestic authorisation.',
    limit:
      'An institute’s technical mandate is not equivalent to an enforcement mandate.',
    x: 145,
    y: 359,
    group: 'member',
    atlas: 'jaisi',
  },
  {
    id: 'korea',
    name: 'South Korea',
    short: 'South Korea',
    region: 'Republic of Korea',
    role: 'Member · government + technical institute',
    mandate:
      'In the scenario, contributes incident analysis and coordinates with domestic operators through competent authorities.',
    limit:
      'No automatic authority over US compute or extraterritorial control of a multinational supplier.',
    x: 145,
    y: 457,
    group: 'member',
    atlas: 'kraisi',
  },
  {
    id: 'australia',
    name: 'Australia',
    short: 'Australia',
    region: 'Australia',
    role: 'Member · government + response teams',
    mandate:
      'In the scenario, maintains an overnight response shift and supports trusted evidence exchange.',
    limit:
      'A shared alert must still pass through a lawful domestic decision and appropriately resourced responders.',
    x: 145,
    y: 555,
    group: 'member',
    atlas: 'auaisi',
  },
  {
    id: 'compact',
    name: 'Democratic AI Response Compact',
    short: 'DARC · Brussels',
    region: 'Brussels, EU · fictional institution',
    role: 'Proposed coalition secretariat',
    mandate:
      'Can request information, pool agreed evidence and commission agreed testing. In the repaired design it authenticates triggers and sends recommendations to competent domestic authorities.',
    limit:
      'No independent subpoena, global licensing, police or worldwide shutdown power. Compulsion requires a specified legal basis in each member jurisdiction.',
    x: 545,
    y: 120,
    group: 'compact',
  },
  {
    id: 'science',
    name: 'Independent evaluation network',
    short: 'Independent evaluators',
    region: 'Distributed across participating states',
    role: 'Technical investigation',
    mandate:
      'Combines public institutes and independent experts. Evaluates authorised model versions in secure environments and records dissent.',
    limit:
      'Access, independence, compute and specialist expertise must be secured; an advisory finding is not an enforcement order.',
    x: 545,
    y: 265,
    group: 'compact',
    atlas: 'metr',
  },
  {
    id: 'cloud',
    name: 'Cloud and compute operators',
    short: 'Cloud / compute',
    region: 'Member and non-member jurisdictions',
    role: 'Operational control and evidence custodians',
    mandate:
      'Can preserve their logs and isolate their own services subject to valid obligations and contracts. National authorities, not DARC, issue enforceable orders.',
    limit:
      'Infrastructure ownership, legal entities and location determine reach. Capacity can move outside coalition territory.',
    x: 545,
    y: 410,
    group: 'compact',
    atlas: 'cloud',
  },
  {
    id: 'oversight',
    name: 'Parliaments, courts and public oversight',
    short: 'Democratic oversight',
    region: 'Each member jurisdiction',
    role: 'Legitimacy, appeal and review',
    mandate:
      'In the repaired design, review emergency powers, hear challenges, scrutinise conflicts and approve or reject renewal.',
    limit:
      'Oversight without independent staff and timely access can become ceremonial.',
    x: 545,
    y: 555,
    group: 'compact',
  },
  {
    id: 'usgov',
    name: 'United States government',
    short: 'US government',
    region: 'United States · non-member',
    role: 'External sovereign actor',
    mandate:
      'Remains outside the compact. Any cooperation is separately negotiated; the compact has no assumed authority to direct US domestic policy.',
    limit:
      'A coalition request does not bind Washington. Responses in this story are hypothetical, not claims about actual policy.',
    x: 945,
    y: 80,
    group: 'external',
  },
  {
    id: 'labs',
    name: 'Frontier model developers',
    short: 'Frontier labs',
    region: 'EU, UK and US corporate operations',
    role: 'Owners of internal models and deployment decisions',
    mandate:
      'Control their own systems and hold the evidence the coalition needs. Fictional composite labs represent differing incentives; no incident is attributed to a real company.',
    limit:
      'Voluntary reports may omit internally deployed versions; market presence does not guarantee access to every offshore research system.',
    x: 945,
    y: 235,
    group: 'external',
  },
  {
    id: 'china',
    name: 'China and other non-member states',
    short: 'Other non-members',
    region: 'China and other jurisdictions',
    role: 'External competitors and potential interlocutors',
    mandate:
      'In the scenario, observe the coalition and consider limited reciprocal assurance rather than joining it.',
    limit:
      'Cooperation, recognition and access are not assumed. The compact cannot claim global democratic representation.',
    x: 945,
    y: 390,
    group: 'external',
    atlas: 'cac',
  },
  {
    id: 'public',
    name: 'Affected communities & civil society',
    short: 'Affected communities',
    region: 'Inside and outside coalition states',
    role: 'Scrutiny, harms and distribution of benefits',
    mandate:
      'In the repaired design, receive intelligible public explanations, challenge restrictions and participate in decisions about public compute and benefits.',
    limit:
      'Member-state democracy alone does not represent people in excluded countries or remove unequal access to AI benefits.',
    x: 945,
    y: 545,
    group: 'external',
  },
];
export type Interaction = {
  from: string;
  to: string;
  label: string;
  kind: 'evidence' | 'decision' | 'pressure' | 'review';
};
export type Reaction = { actor: string; story: string; repaired: string };
export type Stage = {
  time: string;
  title: string;
  event: string;
  first?: boolean;
  gap: string;
  failure: string;
  fix: string;
  needs: DesignKey[];
  improved: string;
  residual: string;
  authority: string;
  information: string;
  capacity: string;
  trigger: string;
  sources: string[];
  reactions: Reaction[];
  interactions: Interaction[];
};
export const stages: Stage[] = [
  {
    time: 'Before day 0',
    title: 'A coalition, without a superpower',
    event:
      'The EU, UK, Canada, Japan, South Korea and Australia establish a coordinating body in Brussels. The United States does not join. For this exercise, the body and its funding already exist before the acceleration begins; they are not built overnight.',
    gap: 'Authority & coordination',
    failure:
      'A declaration of cooperation is mistaken for an operational mandate. Delegates agree on danger but cannot explain who can lawfully obtain evidence or require action.',
    fix: 'Publish a jurisdiction-by-jurisdiction mandate register. Keep enforcement domestic, give the scientific network a separate budget, and rehearse the hand-off before a crisis.',
    needs: ['checks'],
    improved:
      'Members can identify the lawful decision maker and an appeal route before issuing requests.',
    residual:
      'The coalition is neither a world government nor a proxy for all democracies. Non-member cooperation is still optional.',
    authority:
      'DARC coordinates by compact. Member governments must separately authorise participation, funds and any new duties; existing regulators keep their own mandates.',
    information:
      'Contact points, legal-entity maps, model-access agreements and a register of authority gaps.',
    capacity:
      'A standing secretariat, secure evidence rooms and funded national response contacts.',
    trigger:
      'Exercise starts only after the coalition exists. No assumed treaty-making during the first 72 hours.',
    sources: ['plan', 'act'],
    reactions: [
      {
        actor: 'compact',
        story:
          'Announces common principles and opens a voluntary reporting inbox.',
        repaired:
          'Publishes its limits, voting rules, conflict register and domestic authority map.',
      },
      {
        actor: 'eu',
        story:
          'Offers Brussels as a home and is treated as the default decision maker.',
        repaired:
          'Provides premises without absorbing the other members’ votes or domestic powers.',
      },
      {
        actor: 'usgov',
        story:
          'Stays outside the institution and requests bilateral briefings.',
        repaired:
          'Still stays outside; a secure incident channel is offered without a membership claim.',
      },
      {
        actor: 'public',
        story:
          'Receives a communiqué with little opportunity to challenge decisions.',
        repaired:
          'Gets a public-interest forum, complaints channel and a commitment to publish reasons.',
      },
    ],
    interactions: [
      {
        from: 'eu',
        to: 'compact',
        label: 'Hosts proposed secretariat',
        kind: 'decision',
      },
      { from: 'uk', to: 'compact', label: 'Participation', kind: 'decision' },
      { from: 'canada', to: 'compact', label: 'Funding', kind: 'decision' },
      {
        from: 'japan',
        to: 'compact',
        label: 'Technical commitment',
        kind: 'decision',
      },
      {
        from: 'korea',
        to: 'compact',
        label: 'National liaison',
        kind: 'decision',
      },
      {
        from: 'australia',
        to: 'compact',
        label: 'Response coverage',
        kind: 'decision',
      },
    ],
  },
  {
    time: 'Day 0 · 6 hours',
    title: 'The first failure: evidence arrives too late',
    first: true,
    event:
      'Assume an intelligence explosion has begun. A fictional frontier lab’s internal agents sharply accelerate research. Public evaluations lag several internal versions. A confidential warning reaches a participating institute, but the reproducible evidence remains inside the lab.',
    gap: 'Authority + information access',
    failure:
      'The secretariat can ask, but its voluntary inbox cannot compel the internal model, logs or a preserved checkpoint. The lab cites confidentiality and scope. Review starts with yesterday’s model while the next iteration is already in use.',
    fix: 'Pre-arrange protected internal-use notices and evidence preservation, plus secure evaluator access. Impose new duties through domestic law or enforceable contracts where applicable, with specific triggers and protection for reporters.',
    needs: ['reporting'],
    improved:
      'For covered operations, the coalition receives a preserved evidence package and can identify the exact model version. It has not yet proved that the model is safe or dangerous.',
    residual:
      'A US-only internal research system may remain outside the coalition’s reach. The information gap narrows inside the compact but is not eliminated globally.',
    authority:
      'DARC requests and triages. A competent domestic authority—not DARC—compels material only under an applicable legal basis. Uncovered internal use requires a new rule or an agreement.',
    information:
      'Version identifiers, internal-use changes, access permissions, evaluation logs and the chain of custody.',
    capacity:
      'A protected intake route, counsel and engineers able to preserve and interpret evidence immediately.',
    trigger:
      'Assumed trigger: a substantial increase in autonomous R&D capability or a credible serious-control failure initiates a confidential notice and urgent triage.',
    sources: ['reporting', 'act'],
    reactions: [
      {
        actor: 'labs',
        story:
          'Provides an external-release safety summary; internal checkpoint access is deferred.',
        repaired:
          'A covered lab preserves the relevant checkpoint and submits a confidential internal-use notice.',
      },
      {
        actor: 'uk',
        story:
          'Receives the warning but cannot turn a cooperation agreement into a general disclosure order.',
        repaired:
          'Routes evidence to the appropriate domestic authority and the agreed secure evaluation channel.',
      },
      {
        actor: 'compact',
        story:
          'Circulates an alert whose central claim cannot yet be reproduced.',
        repaired:
          'Separates corroborated facts from unknowns and records which jurisdiction can obtain each missing item.',
      },
      {
        actor: 'usgov',
        story:
          'Questions the coalition’s right to inspect a US-based internal model.',
        repaired:
          'Negotiates a limited evidence exchange; refusal remains possible.',
      },
    ],
    interactions: [
      {
        from: 'labs',
        to: 'uk',
        label: 'Confidential warning',
        kind: 'evidence',
      },
      {
        from: 'uk',
        to: 'compact',
        label: 'Incomplete evidence',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'labs',
        label: 'Request internal access',
        kind: 'decision',
      },
      {
        from: 'usgov',
        to: 'compact',
        label: 'Contests offshore reach',
        kind: 'pressure',
      },
    ],
  },
  {
    time: 'Day 1',
    title: 'Access without people is not an investigation',
    event:
      'A covered lab makes an evaluation endpoint available. It differs from the internal deployment environment, and the expert who understands its tools works for a supplier. Several governments ask for reassurance at once.',
    gap: 'Staffing, expertise & operational access',
    failure:
      'The queue grows faster than testing capacity. Teams duplicate tests, cannot reproduce the environment and depend on conflicted experts. A legal right to access data does not produce an independent finding.',
    fix: 'Activate a pre-funded technical reserve, replicate tests across two teams, preserve the environment and use conflict checks. Budget secure compute and interpretation capacity, not only API access.',
    needs: ['reporting', 'reserve'],
    improved:
      'Two independent teams investigate the preserved model under documented conditions, report uncertainty and flag deployment differences.',
    residual:
      'Evaluations may still miss novel capabilities or strategic behaviour. Negative results are not a certificate of general safety.',
    authority:
      'Technical teams investigate by valid access arrangements or appointment. They advise; they do not acquire remedy powers from technical expertise.',
    information:
      'Tool permissions, internal scaffolding, compute limits, deployment context and uncertainty in test results.',
    capacity:
      'Pre-cleared engineers, domain specialists, secure compute, independent replication and continuous shifts.',
    trigger:
      'A credible warning activates the reserve; conflicting results escalate to an independent adjudication team rather than being averaged away.',
    sources: ['surge', 'eval'],
    reactions: [
      {
        actor: 'science',
        story:
          'A small team tries to reproduce a result through a restricted API.',
        repaired:
          'Two teams run independent investigations and publish a confidential disagreement log.',
      },
      {
        actor: 'canada',
        story:
          'Offers researchers who lack clearance for the secure environment.',
        repaired:
          'Deploys a pre-cleared reserve team with compute already budgeted.',
      },
      {
        actor: 'japan',
        story:
          'Repeats tests in parallel without knowing what others have done.',
        repaired: 'Takes a distinct replication task using a shared protocol.',
      },
      {
        actor: 'australia',
        story:
          'Waits for European working hours to receive the evidence package.',
        repaired:
          'Runs the follow-on shift with authorised access and documented hand-over.',
      },
    ],
    interactions: [
      {
        from: 'labs',
        to: 'science',
        label: 'Model and environment access',
        kind: 'evidence',
      },
      {
        from: 'canada',
        to: 'science',
        label: 'Reserve specialists',
        kind: 'decision',
      },
      {
        from: 'japan',
        to: 'science',
        label: 'Independent replication',
        kind: 'evidence',
      },
      {
        from: 'australia',
        to: 'science',
        label: 'Continuous coverage',
        kind: 'decision',
      },
      {
        from: 'science',
        to: 'compact',
        label: 'Findings + uncertainty',
        kind: 'evidence',
      },
    ],
  },
  {
    time: 'Day 3',
    title: 'The decision clock loses to the model clock',
    event:
      'Two tests corroborate a dangerous control failure in the exercise. The lab can iterate again before the next scheduled ministerial meeting. One member fears losing investment and calls for more study.',
    gap: 'Coordination & decision authority',
    failure:
      'Unanimity and fixed meeting schedules turn a shared warning into delayed action. Conversely, an undefined emergency exception invites overreach by the secretariat.',
    fix: 'Use evidence-based escalation, pre-delegated domestic procedures and narrow interim measures. Reassess against new model versions; avoid a fixed benchmark that becomes obsolete.',
    needs: ['reporting', 'reserve', 'escalation'],
    improved:
      'A 24-hour review leads to a reasoned, scoped domestic decision. A temporary restriction on a covered operation can last at most 72 hours without further review in this exercise.',
    residual:
      'No trigger is infallible. False positives impose costs, and members may lawfully disagree. Non-member model development continues.',
    authority:
      'Scientific reviewers authenticate evidence. DARC recommends. Named domestic authorities impose any measure within their jurisdiction, subject to appeal; no secretariat-wide shutdown switch.',
    information:
      'Independent corroboration, severity, deployment exposure and reasons why a less restrictive response is insufficient.',
    capacity:
      'Duty officers, legal review, a model-version tracker and an operational contact able to implement a valid order.',
    trigger:
      'Exercise rule: two independent findings of a severe control failure, or one independently authenticated imminent emergency, start urgent review—not automatic global shutdown.',
    sources: ['eval', 'remedy'],
    reactions: [
      {
        actor: 'compact',
        story: 'Waits for unanimity while evidence becomes stale.',
        repaired:
          'Triggers a time-bounded review and publishes dissent rather than requiring unanimity for every referral.',
      },
      {
        actor: 'eu',
        story: 'Requests another meeting to clarify the scope of action.',
        repaired:
          'Identifies the applicable EU route and issues a scoped decision where its legal conditions are met.',
      },
      {
        actor: 'korea',
        story:
          'Cannot tell whether the alert applies to a model deployed domestically.',
        repaired:
          'Matches the affected version to local operators and uses an authorised domestic response.',
      },
      {
        actor: 'cloud',
        story:
          'Receives informal calls but no authenticated operational instruction.',
        repaired:
          'Verifies the issuing authority and implements a narrowly defined measure on covered services.',
      },
    ],
    interactions: [
      {
        from: 'science',
        to: 'compact',
        label: 'Corroborated warning',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'eu',
        label: 'Escalation referral',
        kind: 'decision',
      },
      {
        from: 'compact',
        to: 'korea',
        label: 'Version-specific alert',
        kind: 'evidence',
      },
      {
        from: 'eu',
        to: 'cloud',
        label: 'Scoped lawful measure',
        kind: 'decision',
      },
      {
        from: 'korea',
        to: 'cloud',
        label: 'Domestic implementation',
        kind: 'decision',
      },
    ],
  },
  {
    time: 'Day 7',
    title: 'The frontier moves outside the perimeter',
    event:
      'A fictional developer relocates a sensitive workload to a non-member jurisdiction. Washington rejects any suggestion that the compact controls US research. Other non-member states interpret the restrictions as a competitive move.',
    gap: 'Jurisdiction & strategic coordination',
    failure:
      'Coalition market access and domestic cloud controls are confused with global control of AI development. Workloads, weights and talent can leave; retaliation can reduce even voluntary evidence exchange.',
    fix: 'Maintain verified incident hotlines, negotiate reciprocal limited disclosure, coordinate lawful procurement conditions and preserve safe service alternatives. State explicitly what remains outside reach.',
    needs: ['reporting', 'escalation'],
    improved:
      'Members reduce exposure in covered deployments and retain a negotiating channel. They can document leakage rather than announce a worldwide pause.',
    residual:
      'This is an unresolved first-order limit: without US and other major non-member cooperation, the compact cannot ensure a global slowdown or prevent an offshore intelligence explosion.',
    authority:
      'Domestic market, procurement or infrastructure measures only where legally available. Cross-border research restrictions need separate consent or a valid legal basis.',
    information:
      'Where compute and legal entities actually sit, which model versions migrate, and whether commitments can be verified.',
    capacity:
      'Diplomatic channels, cross-border legal expertise, independent monitoring and alternative compute access.',
    trigger:
      'A verified migration or access withdrawal prompts a perimeter review; it does not justify assuming extraterritorial powers.',
    sources: ['plan', 'act'],
    reactions: [
      {
        actor: 'usgov',
        story:
          'Treats the compact’s demands as an attempt to direct US research.',
        repaired:
          'Considers limited reciprocal incident disclosure while remaining a non-member.',
      },
      {
        actor: 'labs',
        story:
          'Moves a workload and argues the requested material is outside scope.',
        repaired:
          'Some cooperate to retain coalition customers; others still move offshore.',
      },
      {
        actor: 'china',
        story:
          'Reads the arrangement as containment and withholds information.',
        repaired:
          'Is offered narrowly scoped verification and crisis communication without an assumed agreement.',
      },
      {
        actor: 'cloud',
        story:
          'Customers switch to an offshore service beyond the order’s scope.',
        repaired:
          'Supplies verified information about covered services, while reporting the limits of its visibility.',
      },
    ],
    interactions: [
      {
        from: 'labs',
        to: 'cloud',
        label: 'Workload relocation pressure',
        kind: 'pressure',
      },
      {
        from: 'usgov',
        to: 'compact',
        label: 'Rejects global control claim',
        kind: 'pressure',
      },
      {
        from: 'compact',
        to: 'usgov',
        label: 'Incident hotline proposal',
        kind: 'decision',
      },
      {
        from: 'compact',
        to: 'china',
        label: 'Limited reciprocal assurance',
        kind: 'decision',
      },
    ],
  },
  {
    time: 'Day 14',
    title: 'Safety becomes a route to concentrated power',
    event:
      'A few well-resourced firms can afford the new review process. Small developers lose access to scarce evaluation compute. The compact’s experts depend on the same firms they assess, and affected non-member communities have no vote.',
    gap: 'Independence, access & democratic legitimacy',
    failure:
      'The institution created to resist concentration becomes a bottleneck. Compliance costs protect incumbents, confidential evidence prevents scrutiny and emergency decisions escape meaningful challenge.',
    fix: 'Separate research funding from enforcement, fund shared evaluation access, cap funder influence and publish reasoned summaries. Add representative public-interest review and accessible appeals, including for affected outsiders.',
    needs: ['reserve', 'checks'],
    improved:
      'Smaller providers can contest disproportionate measures and access shared evaluation resources. Conflicted reviewers recuse; oversight can inspect confidential records under safeguards.',
    residual:
      'Distributional disputes persist. Coalition citizens cannot confer democratic legitimacy on decisions affecting everyone else.',
    authority:
      'Member parliaments control budgets and delegation; courts or other independent review bodies hear challenges under their own systems.',
    information:
      'Funding sources, recusals, decision reasons, access denials and the distribution of burdens and benefits.',
    capacity:
      'Independent auditors, funded civil-society participation, appeal support and evaluation capacity outside incumbent labs.',
    trigger:
      'A conflict of interest or credible exclusion complaint triggers independent review without automatically lifting a necessary safety measure.',
    sources: ['plan', 'surge'],
    reactions: [
      {
        actor: 'public',
        story:
          'Sees emergency restrictions but cannot inspect the reasons or challenge unequal access.',
        repaired:
          'Uses a funded challenge route and participates in benefit-distribution deliberation.',
      },
      {
        actor: 'oversight',
        story:
          'Receives a classified briefing too late to influence the decision.',
        repaired:
          'Obtains timely protected access, orders explanations and hears an urgent appeal.',
      },
      {
        actor: 'science',
        story: 'Relies on staff seconded by the lab under investigation.',
        repaired:
          'Separates teams, records conflicts and uses independent replication funding.',
      },
      {
        actor: 'canada',
        story:
          'Worries the largest member and largest funders dominate the institution.',
        repaired:
          'Uses a rotating chair and a balanced voting rule to challenge concentrated control.',
      },
    ],
    interactions: [
      {
        from: 'labs',
        to: 'science',
        label: 'Funding dependence risk',
        kind: 'pressure',
      },
      {
        from: 'public',
        to: 'oversight',
        label: 'Appeal and public scrutiny',
        kind: 'review',
      },
      {
        from: 'oversight',
        to: 'compact',
        label: 'Review reasons and conflicts',
        kind: 'review',
      },
      {
        from: 'canada',
        to: 'compact',
        label: 'Checks on member dominance',
        kind: 'review',
      },
    ],
  },
  {
    time: 'Day 30',
    title: 'An emergency institution meets its sunset',
    event:
      'Acceleration continues. The secretariat asks to retain its exceptional coordinating mandate indefinitely. Some members argue that temporary measures have bought time; others question whether success can be measured at all.',
    gap: 'Accountability & institutional lock-in',
    failure:
      'An emergency declaration renews itself. “The danger continues” substitutes for evidence of necessity, while power and budget become harder to return.',
    fix: 'Make emergency delegation expire by default. Require published reasons, independent review and affirmative democratic renewal for any extension; preserve ordinary monitoring and secure evidence custody.',
    needs: ['checks', 'escalation'],
    improved:
      'The exercise ends with a public, contestable choice: renew narrow powers with conditions, amend them or let them expire. Urgent measures do not silently become permanent.',
    residual:
      'Even the repaired compact buys response capacity rather than guarantees control over superintelligence. A wider agreement, different technical conditions or a more radical institutional change may still be necessary.',
    authority:
      'Renewal belongs to the competent democratic bodies under the hypothetical founding arrangements, not the secretariat alone. Existing lawful duties do not disappear with an emergency sunset.',
    information:
      'A decision log, measures taken, disputed findings, observed harms, leakage and an evaluation of whether powers were actually useful.',
    capacity:
      'Independent review staff and a funded transition plan so ordinary monitoring survives the end of exceptional powers.',
    trigger:
      'Day 30 is an illustrative hard sunset for emergency delegation. Renewal requires reasons, review and an explicit vote; no automatic rollover.',
    sources: ['plan', 'act'],
    reactions: [
      {
        actor: 'compact',
        story:
          'Requests open-ended continuation because it cannot certify that the emergency is over.',
        repaired:
          'Submits its record and relinquishes exceptional powers unless renewal is approved.',
      },
      {
        actor: 'oversight',
        story: 'Treats renewal as a procedural formality.',
        repaired:
          'Tests necessity, proportionality and distribution of power before approving, changing or rejecting renewal.',
      },
      {
        actor: 'eu',
        story:
          'Risks making the EU host the permanent gatekeeper of the coalition.',
        repaired:
          'Accepts rotation, independent review and a published division of institutional powers.',
      },
      {
        actor: 'public',
        story: 'Has no way to tell whether the intervention worked.',
        repaired:
          'Receives a public account of benefits, costs, uncertainty and unresolved global risks.',
      },
    ],
    interactions: [
      {
        from: 'compact',
        to: 'oversight',
        label: 'Renewal request + record',
        kind: 'review',
      },
      {
        from: 'public',
        to: 'oversight',
        label: 'Public-interest challenge',
        kind: 'review',
      },
      {
        from: 'oversight',
        to: 'compact',
        label: 'Renew / amend / sunset',
        kind: 'decision',
      },
      {
        from: 'eu',
        to: 'compact',
        label: 'Ordinary mandate only',
        kind: 'decision',
      },
    ],
  },
];
export function stageRepaired(stage: Stage, design: Design) {
  return stage.needs.every((k) => design[k]);
}
export function firstUnresolved(design: Design) {
  return stages.findIndex(
    (s, i) => i > 0 && (i === 4 || !stageRepaired(s, design)),
  );
}
