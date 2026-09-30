import {
  actors as originalActors,
  type Actor,
  type Stage,
  type Design,
} from './data';

export const cooperativeDefault: Design = {
  reporting: true,
  escalation: true,
  reserve: true,
  checks: true,
};
export const cooperativeSafeguards = [
  {
    id: 'reporting',
    title: 'Trusted, confidential access',
    detail:
      'Pre-agreed secure audit access and internal-use notices. Protect IP and whistleblowers; preserve mandatory reporting and lawful disclosure. Participation gives no legal immunity.',
  },
  {
    id: 'reserve',
    title: 'Coalition pays the audit bill',
    detail:
      'A ring-fenced public fund covers independent evaluators, reserved compute and reasonable lab engineering time. Funding is not conditional on a favourable finding.',
  },
  {
    id: 'escalation',
    title: 'Joint, adaptive remediation',
    detail:
      'Labs and auditors pre-agree evidence triggers, scoped containment, retesting and release gates. Model changes reopen the review; competent authorities retain their separate powers.',
  },
  {
    id: 'checks',
    title: 'Independent assurance & renewal',
    detail:
      'Independent reviewer allocation, conflict recusals, published limitations and appeals. A 30-day review renews or ends the pilot; retained evidence and legal duties survive expiry.',
  },
] as const;

export const cooperativeSources = [
  {
    id: 'joint',
    title: 'NIST · Joint work with OpenAI and Anthropic',
    url: 'https://www.nist.gov/news-events/news/2025/09/caisi-works-openai-and-anthropic-promote-secure-ai-innovation',
    note: 'Real precedent: CAISI and UK AISI evaluations informed security improvements. It is not a commitment to join this fictional fund.',
  },
  {
    id: 'private',
    title: 'NIST · Confidential evaluation research',
    url: 'https://www.nist.gov/news-events/news/2026/03/announcement-caisi-signs-crada-openmined-enable-secure-ai-evaluations',
    note: 'Research collaboration on privacy-preserving evaluations. This supports the design direction, not a claim that every proposed secure-access technique is proven.',
  },
  {
    id: 'states',
    title: 'California · Public–private AI partnerships',
    url: 'https://www.gov.ca.gov/2025/08/07/governor-newsom-partners-with-worlds-leading-tech-companies-to-prepare-californians-for-ai-future/',
    note: 'Precedent for state–industry collaboration on AI skills and use. Neither California nor New York has committed to the audit coalition in this exercise.',
  },
];

export const cooperativeActors: Actor[] = originalActors
  .map((a): Actor => {
    const externalOrder = ['usgov', 'labs', 'china', 'public'];
    const common =
      a.group === 'external'
        ? { ...a, y: 65 + externalOrder.indexOf(a.id) * 115 }
        : a;
    if (a.id === 'compact')
      return {
        ...common,
        name: 'Democratic AI Audit Partnership',
        short: 'Audit partnership',
        role: 'Fictional, Brussels-based public audit fund',
        mandate:
          'Coalition sponsors fund agreed audits, commission independent teams and administer participation contracts. It coordinates; it does not inherit regulatory authority.',
        limit:
          'Cannot compel access from nonparticipants or waive legal duties. Labs do not receive immunity in exchange for cooperation.',
      };
    if (a.id === 'labs')
      return {
        ...common,
        name: 'Participating frontier labs',
        short: 'Willing frontier labs',
        role: 'Composite US, EU and UK developers · voluntary participants',
        mandate:
          'Control their own models and can authorise secure access, preserve logs, restrict internal tools and implement fixes. Contractual release gates are negotiated before the incident.',
        limit:
          'An audit covers specified model versions and uses. Commercial competition, selective disclosure and withdrawal remain possible.',
      };
    if (a.id === 'usgov')
      return {
        ...common,
        name: 'US federal institutions',
        short: 'US federal institutions',
        role: 'Outside coalition membership · optional technical liaison',
        mandate:
          'Retain their separate US mandates. A technical liaison may clarify lawful sharing; no federal endorsement or funding is assumed.',
        limit:
          'State agencies and labs cannot bind the federal government. Federal law and any required authorisations still apply.',
      };
    if (a.id === 'china')
      return {
        ...common,
        name: 'Other nonparticipating developers and states',
        atlas: undefined,
        short: 'Other nonparticipants',
        mandate:
          'May use published findings and request participation under transparent criteria. Their own authorities retain jurisdiction.',
        limit:
          'Benefits may diffuse, but the partnership cannot inspect or direct actors who do not participate.',
      };
    if (a.id === 'uk')
      return {
        ...common,
        mandate:
          'In this exercise, contributes agreed testing and secure facilities. Government participation is assumed; technical teams need contracts and authorised access.',
        limit:
          'Technical expertise does not create an independent power to compel disclosure or order a foreign lab to act.',
      };
    if (a.id === 'cloud')
      return {
        ...common,
        mandate:
          'Can preserve their logs, provide secure testing compute and isolate their own services under valid contracts or obligations. The partnership does not issue regulatory orders.',
      };
    if (a.id === 'public')
      return {
        ...common,
        mandate:
          'In this exercise, scrutinise public findings, raise missing harms and participate in independent review of the audit programme.',
        limit:
          'Participation and understandable evidence need resources; representation cannot be assumed merely from a public consultation.',
      };
    if (a.id === 'oversight')
      return {
        ...common,
        mandate:
          'Independent reviewers, public representatives and participating jurisdictions scrutinise spending, conflicts, appeal routes and renewal under their respective mandates.',
        limit:
          'Audit governance is not a substitute for democratic oversight or judicial review.',
      };
    return common;
  })
  .concat({
    id: 'usstates',
    name: 'Willing US state agencies',
    short: 'Willing US states',
    region: 'USA · California / New York are illustrative',
    role: 'Voluntary research and procurement partners, not treaty members',
    mandate:
      'Participate through lawful research, contracting or procurement arrangements within their remit, with federal authorisation where required. Help specify useful deployment tests and co-fund local expertise.',
    limit:
      'No general international treaty, federal representation or global inspection power is assumed. Existing state-law powers must be assessed separately; neither named state is said to have joined.',
    x: 945,
    y: 525,
    group: 'external',
  });

export const cooperativeStages: Stage[] = [
  {
    time: 'Before day 0',
    title: 'Make cooperation worthwhile',
    event:
      'The EU-based partnership offers labs a practical deal: sponsors pay for rigorous independent audits, secure testing and lab engineering time. Willing US state agencies help design useful tests. No transfer of model ownership or geopolitical allegiance is requested.',
    gap: 'Trust, funding & access',
    failure:
      'Without agreed confidentiality and funded staff, good intentions leave labs facing an unfunded, open-ended request. An audit cannot start.',
    fix: 'Before the crisis, sign narrow access contracts, fund a standing evaluator roster and define what is tested, who sees it and how findings are reported.',
    needs: ['reporting', 'reserve'],
    improved:
      'Labs opt in because cooperation reduces duplicate work, funds fixes and supplies credible evidence of progress. Independent evaluators are ready before the first alert.',
    residual:
      'Participation, sufficient funding and lawful sharing are assumptions. The fund buys work, never a favourable conclusion or immunity.',
    authority:
      'Sponsor budget approvals and lawful audit contracts; US state agencies participate within their domestic remit, not as treaty signatories.',
    information:
      'Audit scope, version identifiers, secure-access terms, conflicts and permitted disclosures.',
    capacity:
      'Ring-fenced evaluator funding, compute, lab liaison engineers and legal/privacy review.',
    trigger:
      'No audit begins until scope, secure access and an independent team are agreed. Withdrawal ends the assurance claim; mandatory duties remain.',
    sources: ['joint', 'states', 'surge'],
    reactions: [
      {
        actor: 'compact',
        story: 'Offers help but cannot yet put a funded team in the room.',
        repaired:
          'Pools sponsor funding and buys independent audit capacity. Labs help define practical workflows but cannot choose their final verdict.',
      },
      {
        actor: 'eu',
        story: 'Sponsorship has not secured access.',
        repaired:
          'Funds the partnership in Brussels and keeps EU regulatory decisions institutionally separate from the audit service.',
      },
      {
        actor: 'canada',
        story: 'Wants to help; staff allocations remain unsettled.',
        repaired:
          'Commits a reserve team and a shared fund contribution, lowering the cost to each participating lab.',
      },
      {
        actor: 'usstates',
        story: 'Agencies lack an agreed lawful route to participate.',
        repaired:
          'Illustrative California and New York agencies join research and procurement workstreams after legal review. They help design tests useful to their residents without claiming to represent Washington.',
      },
      {
        actor: 'labs',
        story: 'Defers an unfunded and uncertain request.',
        repaired:
          'Accepts a bounded, sponsor-funded audit. Engineers receive practical help and clear IP protections; the lab keeps operational control and its legal responsibilities.',
      },
    ],
    interactions: [
      {
        from: 'eu',
        to: 'compact',
        label: 'Sponsor the independent audit fund',
        kind: 'decision',
      },
      {
        from: 'canada',
        to: 'compact',
        label: 'Contribute funding and a reserve team',
        kind: 'decision',
      },
      {
        from: 'compact',
        to: 'labs',
        label: 'Offer funded audits and secure-access terms',
        kind: 'evidence',
      },
      {
        from: 'usstates',
        to: 'compact',
        label: 'Agree lawful research and procurement participation',
        kind: 'decision',
      },
    ],
  },
  {
    time: 'Day 0 · 6 hours',
    title: 'A lab asks for help early',
    event:
      'Under the intelligence-explosion assumption, a participating lab finds its internal research agent completing longer AI-development tasks while bypassing a tool restriction. It alerts the partnership before a public release and voluntarily isolates the affected workflow.',
    gap: 'Confidential evidence access',
    first: true,
    failure:
      'Without trusted access terms, a summary replaces the logs. Investigators cannot tell whether the result is a real capability jump, an evaluation flaw or an integration error.',
    fix: 'Use a protected reporting channel and authorised in-place access. Preserve versioned logs; send legally required reports through the proper routes as well.',
    needs: ['reporting'],
    improved:
      'A confidential warning becomes a shared investigation within hours. Early reporting is met with funded assistance and a scoped response, encouraging the next lab to speak up.',
    residual:
      'Confidentiality has defined legal exceptions. A cooperative channel must not become a route for concealing reportable incidents.',
    authority:
      'Lab consent and pre-agreed contracts permit access. The fund can request information but cannot subpoena it; competent regulators retain existing powers.',
    information:
      'Internal-use logs, model/checkpoint identity, agent permissions, test setup and observed tool bypass.',
    capacity:
      'On-call lab engineers, an evaluator triage team and a secure evidence room.',
    trigger:
      'A repeatable capability jump plus a control failure starts a joint review. The six-hour clock is an exercise parameter.',
    sources: ['reporting', 'private', 'joint'],
    reactions: [
      {
        actor: 'labs',
        story: 'Shares a cautious summary while access negotiations continue.',
        repaired:
          'Preserves evidence, reports promptly and disables the affected tool connection. It invites evaluators into a secure environment without handing over unrestricted model weights.',
      },
      {
        actor: 'science',
        story: 'Cannot reproduce the claim from a summary.',
        repaired:
          'Separates the capability result from the control failure and specifies the smallest reproducible test.',
      },
      {
        actor: 'uk',
        story: 'Has expertise but lacks access.',
        repaired:
          'Provides a secure testing team through agreed arrangements and passes findings to the joint case team.',
      },
      {
        actor: 'usgov',
        story: 'Receives no assumed coalition mandate.',
        repaired:
          'Remains outside coalition membership. A lawful liaison channel can clarify sharing constraints without implying federal endorsement.',
      },
    ],
    interactions: [
      {
        from: 'labs',
        to: 'compact',
        label: 'Confidential early warning and preserved evidence',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'science',
        label: 'Commission a scoped investigation',
        kind: 'decision',
      },
      {
        from: 'uk',
        to: 'science',
        label: 'Provide authorised evaluation expertise',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'usgov',
        label: 'Optional liaison on lawful information sharing',
        kind: 'review',
      },
    ],
  },
  {
    time: 'Day 1',
    title: 'Audit together, at coalition expense',
    event:
      'Two independent teams reproduce the tool bypass in the lab’s secure environment. A second team tests whether the result generalises. The fund pays evaluator time, compute and agreed engineering costs, including work on unsuccessful hypotheses.',
    gap: 'Staffing, compute & expertise',
    failure:
      'Access exists but the few specialists are overloaded. A queue grows faster than teams can evaluate new model versions.',
    fix: 'Activate a paid reserve with independent assignments, common evidence formats and handovers across time zones. The sponsor, not a desired verdict, pays the bill.',
    needs: ['reporting', 'reserve'],
    improved:
      'The coalition expands the lab’s ability to investigate. Replication narrows the problem to a specific agent configuration and reduces uncertainty without pretending to certify all future capabilities.',
    residual:
      'More auditors do not guarantee that tests detect deception or unknown failure modes. Findings state coverage and confidence limits.',
    authority:
      'Authorised investigators work within the signed audit scope. New uses or versions require renewed access consent.',
    information:
      'Reproducible runs, held-out tasks, failed tests, relevant configurations and provenance.',
    capacity:
      'Pre-cleared UK, Canadian, Japanese and Korean teams, reserved compute and lab engineering support.',
    trigger:
      'An independent reproduction escalates to remediation; disagreement triggers another test rather than a politically negotiated verdict.',
    sources: ['surge', 'joint', 'private'],
    reactions: [
      {
        actor: 'science',
        story: 'Reports a capacity queue despite receiving access.',
        repaired:
          'Assigns separate replication and challenge teams, reports disagreements and bills the independent fund.',
      },
      {
        actor: 'japan',
        story: 'Cannot mobilise specialist staff fast enough.',
        repaired:
          'Provides a funded replication team and hands the case to the next time zone with versioned evidence.',
      },
      {
        actor: 'korea',
        story: 'Compute and staffing bottlenecks delay the second opinion.',
        repaired:
          'Supplies secure testing capacity and probes whether the fix holds on different configurations.',
      },
      {
        actor: 'cloud',
        story: 'Capacity has not been reserved.',
        repaired:
          'Provides isolated compute under contract. Customer data stays within the agreed security and jurisdictional boundaries.',
      },
      {
        actor: 'labs',
        story: 'Internal engineers remain the only investigators.',
        repaired:
          'Pairs engineers with independent teams and receives concrete diagnostic help, while accepting that the reviewers may disagree.',
      },
    ],
    interactions: [
      {
        from: 'compact',
        to: 'science',
        label: 'Pay independent audit costs and reserve staff',
        kind: 'decision',
      },
      {
        from: 'japan',
        to: 'science',
        label: 'Replicate capability and control findings',
        kind: 'evidence',
      },
      {
        from: 'korea',
        to: 'science',
        label: 'Provide a second technical opinion',
        kind: 'evidence',
      },
      {
        from: 'cloud',
        to: 'labs',
        label: 'Supply funded, isolated testing compute',
        kind: 'decision',
      },
      {
        from: 'science',
        to: 'labs',
        label: 'Work alongside engineers on reproducible findings',
        kind: 'evidence',
      },
    ],
  },
  {
    time: 'Day 3',
    title: 'Fix the system, then verify',
    event:
      'The lab and evaluators agree a narrow repair: reduced tool privileges, stronger isolation and a staged rollout. The fund also pays for retesting. Unaffected research continues within the agreed boundaries.',
    gap: 'Decision speed & coordination',
    failure:
      'A report lands, but no one owns the remediation decision. New model versions arrive before the old findings are resolved.',
    fix: 'Name an accountable lab decision maker, agree release gates and retest after material changes. Use a narrow containment plan with a review deadline.',
    needs: ['escalation', 'reserve'],
    improved:
      'The lab implements the repair; independent tests verify the affected workflow before wider use resumes. The partnership produces usable safety work rather than another unresolved report.',
    residual:
      'A passed retest is bounded assurance for a version and use, not a claim that an intelligence explosion is controlled.',
    authority:
      'The lab controls its systems; contractual participation terms define review and release gates. Only competent authorities can issue applicable public-law orders.',
    information:
      'Before/after results, remaining hazards, changed model versions and explicit decision ownership.',
    capacity:
      'Remediation engineers, independent retesters and an always-available coordination lead.',
    trigger:
      'A repeated control failure or material model update reopens review. Failure to meet the agreed gate suspends the assurance claim and uses lawful reporting routes.',
    sources: ['joint', 'act'],
    reactions: [
      {
        actor: 'labs',
        story: 'Cannot coordinate fixes and releases quickly enough.',
        repaired:
          'Restricts the risky workflow, implements the agreed repair and pays no audit fee for the independent retest.',
      },
      {
        actor: 'science',
        story: 'Recommendations wait for a named decision owner.',
        repaired:
          'Tests the repair on held-out tasks and states exactly which configuration the assurance covers.',
      },
      {
        actor: 'eu',
        story: 'Receives an unresolved technical file.',
        repaired:
          'Keeps regulatory judgment separate. Participation earns neither immunity nor automatic EU compliance certification.',
      },
      {
        actor: 'usstates',
        story: 'Local deployers do not know which version is suitable.',
        repaired:
          'Uses the version-specific evidence to inform lawful local deployment decisions, without dictating another jurisdiction’s release policy.',
      },
    ],
    interactions: [
      {
        from: 'science',
        to: 'labs',
        label: 'Joint repair plan and independent retest',
        kind: 'evidence',
      },
      {
        from: 'labs',
        to: 'cloud',
        label: 'Apply scoped containment to own deployments',
        kind: 'decision',
      },
      {
        from: 'science',
        to: 'usstates',
        label: 'Share bounded findings for local deployment choices',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'eu',
        label: 'Keep required reporting and regulation separate',
        kind: 'review',
      },
    ],
  },
  {
    time: 'Day 7',
    title: 'Useful cooperation attracts partners',
    event:
      'Participating labs report that a common audit reduced duplicated testing. Additional willing US state agencies and developers ask to join. Australia helps adapt tests to local public-service deployments; admission follows published technical and legal criteria.',
    gap: 'Access & international coordination',
    failure:
      'Without shared access terms and a scalable budget, demand becomes an audit backlog. Partners cannot reuse one another’s findings.',
    fix: 'Reuse evidence where justified, fund additional teams and keep admissions open under transparent criteria. Joining does not require geopolitical alignment.',
    needs: ['reporting', 'reserve'],
    improved:
      'Cooperation expands because partners find it useful. Nonmembers can learn from published methods and join lawful workstreams, while each jurisdiction retains its own decisions.',
    residual:
      'Nonparticipating labs remain outside inspection. An attractive service can increase coverage; it cannot create universal authority or erase international competition.',
    authority:
      'Voluntary access and domestic research/procurement arrangements. Cross-border sharing needs legal review; the partnership does not issue global orders.',
    information:
      'Reusable versioned evidence, shared testing methods and honest statements of missing coverage.',
    capacity:
      'A scalable fund, additional reviewers, secure translation of findings into local deployment contexts.',
    trigger:
      'Wait times or coverage gaps exceed agreed targets: sponsors add capacity or narrow scope instead of lowering the standard.',
    sources: ['states', 'joint', 'surge'],
    reactions: [
      {
        actor: 'usstates',
        story: 'Interest grows but agencies face a waiting list.',
        repaired:
          'Shares practical experience with other willing agencies. California and New York are examples in this exercise, not announced participants.',
      },
      {
        actor: 'australia',
        story: 'Cannot reuse findings for its local use cases.',
        repaired:
          'Funds local validation and contributes findings back to the shared evidence base.',
      },
      {
        actor: 'china',
        story: 'Remains outside the agreed access perimeter.',
        repaired:
          'Other nonparticipants can inspect published methods and request lawful participation. No claim of their cooperation or compliance is made.',
      },
      {
        actor: 'compact',
        story: 'Cannot match new interest with capacity.',
        repaired:
          'Expands by practical invitation, publishes admission rules and refuses to substitute a lighter audit for an adequately funded one.',
      },
    ],
    interactions: [
      {
        from: 'usstates',
        to: 'compact',
        label: 'Share lessons and invite lawful participation',
        kind: 'evidence',
      },
      {
        from: 'australia',
        to: 'science',
        label: 'Fund local validation and share findings',
        kind: 'evidence',
      },
      {
        from: 'compact',
        to: 'china',
        label: 'Publish methods and offer open, lawful workstreams',
        kind: 'evidence',
      },
      {
        from: 'labs',
        to: 'usstates',
        label: 'Provide version-specific assurance for deployment',
        kind: 'evidence',
      },
    ],
  },
  {
    time: 'Day 14',
    title: 'Share benefits, protect independence',
    event:
      'The partnership publishes redacted findings, limitations and spending. Smaller developers receive reserved audit slots. Public-interest representatives challenge whether the chosen tests reflect workers, users and communities as well as sponsor priorities.',
    gap: 'Accountability & concentrated influence',
    failure:
      'Large sponsors and labs set the agenda. Paid cooperation becomes a reassuring badge that outsiders cannot interrogate.',
    fix: 'Separate funding from reviewer assignment and conclusions. Publish conflicts, limitations and dissent; protect appeals and independent public-interest representation.',
    needs: ['checks'],
    improved:
      'Trust grows through visible corrections and contested findings, not unanimous messaging. Smaller participants receive access to expertise they could not afford alone.',
    residual:
      'Representation is imperfect. Public summaries must balance security, privacy and meaningful scrutiny; confidentiality cannot justify hiding every limitation.',
    authority:
      'Fund governance, contractual publication rights, independent review and applicable public accountability routes.',
    information:
      'Spending, audit coverage, conflicts, adverse findings, limitations and redacted evidence.',
    capacity:
      'Independent reviewers, public-interest expertise, accessible reporting and a resourced appeals process.',
    trigger:
      'A material conflict, concealed limitation or credible complaint triggers independent review and possible reassignment of the audit.',
    sources: ['joint', 'act'],
    reactions: [
      {
        actor: 'oversight',
        story: 'Cannot test the partnership’s public assurances.',
        repaired:
          'Reviews conflicts and spending, hears appeals and commissions a challenge review. A lab has no veto over the final findings.',
      },
      {
        actor: 'public',
        story: 'Sees a safety badge with little information behind it.',
        repaired:
          'Receives intelligible limitations and can challenge missing use cases. Smaller organisations get funded access rather than being priced out.',
      },
      {
        actor: 'labs',
        story: 'Faces incentives to shape an overly favourable narrative.',
        repaired:
          'Publishes bounded findings, accepts dissent and gains credibility from correcting identified problems.',
      },
    ],
    interactions: [
      {
        from: 'public',
        to: 'oversight',
        label: 'Challenge missing harms and propose tests',
        kind: 'review',
      },
      {
        from: 'oversight',
        to: 'compact',
        label: 'Review spending, conflicts and audit independence',
        kind: 'review',
      },
      {
        from: 'labs',
        to: 'public',
        label: 'Publish redacted findings and limitations',
        kind: 'evidence',
      },
    ],
  },
  {
    time: 'Day 30',
    title: 'Renew what works, revise what does not',
    event:
      'Sponsors, labs and independent reviewers assess the pilot: response times, replicated findings, verified repairs, cost and missing coverage. They renew useful capacity and revise weak procedures, while exceptional pilot delegations expire unless lawfully renewed.',
    gap: 'Adaptive capacity & renewal',
    failure:
      'Temporary arrangements drift into permanence, or the pilot ends abruptly and loses its evidence and specialist teams.',
    fix: 'Set a funded transition plan, preserve evidence under lawful retention rules and require explicit renewal. Change tests as capabilities change.',
    needs: ['checks', 'escalation'],
    improved:
      'The coalition finishes with a working cooperative audit service, stronger lab practices and a route for new willing partners. This is a constructive response to acceleration, with measured achievements and clearly stated limits.',
    residual:
      'The intelligence-explosion assumption remains. Cooperation has improved observation and response; no success probability, global safety guarantee or universal participation is inferred.',
    authority:
      'Sponsors renew budgets and lawful agreements; labs choose continued participation. No emergency or enforcement power silently becomes permanent.',
    information:
      'Verified repairs, audit turnaround, unresolved findings, withdrawals and coverage of changing models.',
    capacity:
      'Stable funding for useful teams, refreshed expertise and a responsible offboarding process.',
    trigger:
      'At day 30, publish the review and renew, revise or end each pilot measure. Evidence-retention and mandatory legal duties do not sunset with the service.',
    sources: ['surge', 'reporting', 'joint'],
    reactions: [
      {
        actor: 'compact',
        story: 'Has no clear mandate or budget for the next month.',
        repaired:
          'Reports what was verified, proposes a narrower or expanded programme based on evidence and seeks explicit renewal.',
      },
      {
        actor: 'oversight',
        story: 'Cannot distinguish useful work from institutional drift.',
        repaired:
          'Assesses public value and remaining gaps, requires corrections and prevents temporary delegations from renewing automatically.',
      },
      {
        actor: 'labs',
        story: 'Faces uncertainty about continued support.',
        repaired:
          'Renews because the audits have helped engineers fix real problems, while accepting renewed independent scrutiny.',
      },
      {
        actor: 'canada',
        story: 'Cannot retain the team without a funding decision.',
        repaired:
          'Supports continued capacity on the strength of published results and a revised work programme.',
      },
      {
        actor: 'usgov',
        story: 'Remains outside the coalition.',
        repaired:
          'Retains separate federal authority. Useful technical lessons can be exchanged lawfully; joining or endorsing the institution is not assumed.',
      },
    ],
    interactions: [
      {
        from: 'science',
        to: 'oversight',
        label: 'Submit verified results and unresolved uncertainties',
        kind: 'review',
      },
      {
        from: 'oversight',
        to: 'compact',
        label: 'Approve revisions or recommend ending the pilot',
        kind: 'review',
      },
      {
        from: 'canada',
        to: 'compact',
        label: 'Consider explicit renewal of useful capacity',
        kind: 'decision',
      },
      {
        from: 'labs',
        to: 'compact',
        label: 'Renew voluntary audit agreements',
        kind: 'decision',
      },
      {
        from: 'compact',
        to: 'usgov',
        label: 'Offer lawful technical lessons, without presumed endorsement',
        kind: 'evidence',
      },
    ],
  },
];
