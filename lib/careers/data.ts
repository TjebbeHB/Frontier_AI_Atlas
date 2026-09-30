import type { Opportunity } from './types';
export const opportunities: Opportunity[] = [
  {
    id: '80k-advice',
    organisation: '80,000 Hours',
    title: 'Personal career advice',
    url: 'https://80000hours.org/speak-with-us/',
    summary:
      'A useful first conversation about transferring your skills into work on pressing problems.',
    tracks: ['technical', 'governance', 'biology', 'operations'],
    kind: 'Advice',
    regions: [],
    format: 'remote',
    location: 'Remote video call',
    minHours: null,
    time: 'One-off call; timing agreed',
    duration: 'Application + advice session',
    fundingType: 'free',
    funding: 'Free advising; no stipend or replacement income.',
    visaStatus: 'na',
    visa: 'No international move required for remote advising.',
    travel: 'none',
    entry:
      'Selective advising for people seriously considering high-impact work, including experienced career changers.',
    status: 'rolling',
    statusNote: 'Advising application available; no published closing date.',
    sources: [
      {
        label: 'Advising and application',
        url: 'https://80000hours.org/speak-with-us/',
      },
      {
        label: 'Career planning resources',
        url: 'https://80000hours.org/start-here/',
      },
    ],
    level: 'intro',
  },
  {
    id: '80k-jobs',
    organisation: '80,000 Hours',
    title: 'Job board',
    url: 'https://jobs.80000hours.org/',
    summary:
      'Explore actual roles alongside training routes, including research, policy and organisational work.',
    tracks: ['technical', 'governance', 'biology', 'operations'],
    kind: 'Jobs',
    regions: [],
    format: 'varies',
    location: 'Worldwide; remote options vary by role',
    minHours: null,
    time: 'Commitment to confirm',
    duration: 'Varies',
    fundingType: 'varies',
    funding:
      'Salary and benefits are role-specific; the board is free to browse.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'optional',
    entry:
      'Requirements, countries, work permission and sponsorship depend on each employer.',
    status: 'resource',
    statusNote: 'Ongoing job-search resource; individual vacancies can expire.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://jobs.80000hours.org/',
      },
    ],
    level: 'intro',
  },
  {
    id: 'sain-course',
    organisation: 'Safe AI Netherlands (SAIN)',
    title: 'AI Safety, Ethics, and Society',
    url: 'https://safeainetherlands.org/get-involved',
    summary:
      'Meet a Dutch learning community through technical or governance discussion groups.',
    tracks: ['technical', 'governance'],
    kind: 'Course',
    regions: ['EU'],
    format: 'in-person',
    location: 'Netherlands · Amsterdam, Groningen, Utrecht',
    minHours: 4,
    time: '4 hours/week',
    duration: '6 weeks',
    fundingType: 'free',
    funding: 'Free course; no living stipend advertised.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'none',
    entry: 'Broad audience; local chapter applications and course tracks vary.',
    status: 'check',
    statusNote:
      'General sign-up available; exact next cohort dates not verified.',
    sources: [
      {
        label: 'Courses and involvement',
        url: 'https://safeainetherlands.org/get-involved',
      },
      {
        label: 'Amsterdam details',
        url: 'https://safeainetherlands.org/chapters/amsterdam',
      },
    ],
    weeks: 6,
    level: 'intro',
  },
  {
    id: 'sain-hub',
    organisation: 'Safe AI Netherlands (SAIN)',
    title: 'Research Hub and community',
    url: 'https://safeainetherlands.org/research',
    summary:
      'Find research mentorship and a local route into technical safety or governance.',
    tracks: ['technical', 'governance'],
    kind: 'Community',
    regions: ['EU'],
    format: 'varies',
    location: 'Netherlands; remote arrangements unconfirmed',
    minHours: null,
    time: 'Commitment to confirm',
    duration: 'Varies',
    fundingType: 'varies',
    funding:
      'Compute and logistical support described; no individual cash stipend verified.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'Emerging researchers matched with supervisors; project and supervisor fit matter.',
    status: 'rolling',
    statusNote:
      'Expressions of interest described; confirm project availability and weekly commitment.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://safeainetherlands.org/research',
      },
    ],
  },
  {
    id: 'pivotal-ai',
    organisation: 'Pivotal Research',
    title: 'AI Safety Research Fellowship',
    url: 'https://www.pivotal-research.org/fellowship',
    summary:
      'Mentored research with technical safety and governance routes for people building a research career.',
    tracks: ['technical', 'governance'],
    kind: 'Fellowship',
    regions: ['UK'],
    format: 'in-person',
    location: 'London · LISA',
    minHours: 40,
    time: 'Full-time; actual hours to confirm',
    duration: '15 weeks',
    fundingType: 'stipend',
    funding:
      '£6,000 standard / £8,000 senior stipend; £2,400 housing contribution for non-London fellows, travel, weekday meals and compute.',
    visaStatus: 'unknown',
    visa: 'Entry requirements are the fellow’s responsibility. Some process help may be offered; sponsorship is not promised.',
    travel: 'required',
    entry:
      '18+; varied backgrounds; apply to at least one mentor. Rare remote exceptions for established researchers.',
    status: 'closed',
    statusNote:
      'Homepage says applications closed; EOI available. Published cohort: 18 Jan–30 Apr 2027. Next opening unconfirmed.',
    sources: [
      {
        label: 'Fellowship terms',
        url: 'https://www.pivotal-research.org/fellowship',
      },
      {
        label: 'Current application status',
        url: 'https://www.pivotal-research.org/',
      },
    ],
    weeks: 15,
  },
  {
    id: 'pivotal-bio',
    organisation: 'Pivotal Research',
    title: 'Frontier Biodefense Fellowship',
    url: 'https://www.pivotal-research.org/fbf',
    summary:
      'Use biological, public-health, ML or policy expertise on defensive biosecurity research.',
    tracks: ['biology', 'technical', 'governance'],
    kind: 'Fellowship',
    regions: ['UK'],
    format: 'in-person',
    location: 'London · LISA',
    minHours: 40,
    time: 'Full-time; actual hours to confirm',
    duration: '9 weeks',
    fundingType: 'stipend',
    funding:
      '£6,000–£8,000 stipend with travel, housing support and weekday meals; extension may be possible.',
    visaStatus: 'unknown',
    visa: 'Fellows handle entry requirements; sponsorship is not promised.',
    travel: 'required',
    entry:
      'Primarily PhD students and early-career professionals; outstanding undergraduates considered; mentor fit required.',
    status: 'closed',
    statusNote:
      '2026 cohort underway: 3 Aug–2 Oct. EOI for future opportunities; no new round confirmed.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.pivotal-research.org/fbf',
      },
    ],
    weeks: 9,
  },
  {
    id: 'govai-uk',
    organisation: 'GovAI',
    title: 'UK Winter Fellowship · Research / Applied',
    url: 'https://www.governance.ai/post/winter-fellowship-2027-research-track',
    summary:
      'Research and applied routes, including policy, communications, operations and programme management.',
    tracks: ['governance', 'operations', 'technical'],
    kind: 'Fellowship',
    regions: ['UK'],
    format: 'in-person',
    location: 'London, UK',
    minHours: 40,
    time: 'Full-time; actual hours to confirm',
    duration: 'About 3 months',
    fundingType: 'salary',
    funding:
      '£12,000 for the fellowship, plus travel support, weekday lunch and desk space.',
    visaStatus: 'support',
    visa: 'GovAI states it can sponsor three-month temporary work visas. Confirm your route and eligibility.',
    travel: 'required',
    entry:
      'No strict degree requirement; research or relevant professional experience helps. Applied track welcomes transferable skills.',
    status: 'closed',
    statusNote:
      'Both UK Winter 2027 tracks closed. Programme: 18 Jan–9 Apr 2027.',
    sources: [
      {
        label: 'Research track',
        url: 'https://www.governance.ai/post/winter-fellowship-2027-research-track',
      },
      {
        label: 'Applied track',
        url: 'https://www.governance.ai/post/winter-fellowship-2027-applied-track',
      },
      {
        label: 'Current opportunities',
        url: 'https://www.governance.ai/opportunities',
      },
    ],
    weeks: 12,
  },
  {
    id: 'govai-us',
    organisation: 'GovAI',
    title: 'DC Winter Fellowship',
    url: 'https://www.governance.ai/post/dc-winter-fellowship-2027',
    summary:
      'A US policy research route for applicants who already have suitable work permission.',
    tracks: ['governance', 'technical'],
    kind: 'Fellowship',
    regions: ['US'],
    format: 'in-person',
    location: 'Washington, DC',
    minHours: 40,
    time: 'Normally full-time',
    duration: 'About 3 months',
    fundingType: 'stipend',
    funding:
      '$21,000 stipend plus travel support and weekday lunch; part-time arrangements may be prorated.',
    visaStatus: 'none',
    visa: 'Existing US work authorisation required; no visa sponsorship.',
    travel: 'required',
    entry:
      'Broad academic and professional backgrounds; research, writing and US policy interest. Some local professionals can discuss part-time participation.',
    status: 'closed',
    statusNote:
      'Winter 2027 applications closed. Programme: 18 Jan–9 Apr 2027.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.governance.ai/post/dc-winter-fellowship-2027',
      },
    ],
    partTimeException: true,
    weeks: 12,
    requiresWorkRights: true,
  },
  {
    id: 'schmidt-ai2050',
    organisation: 'Schmidt Sciences',
    title: 'AI2050 research awards',
    url: 'https://ai2050.schmidtsciences.org/fellows/',
    summary:
      'A research-funding pathway to know about, rather than an open career-change course.',
    tracks: ['technical', 'governance'],
    kind: 'Research',
    regions: [],
    format: 'varies',
    location: 'Global · at researchers’ institutions',
    minHours: null,
    time: 'Commitment to confirm',
    duration: '3-year research project',
    fundingType: 'grant',
    funding:
      'Research award and non-monetary support; no individual award amount verified here.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'Early-career awards target postdoctoral and pre-tenure researchers; separate senior awards. Nomination process, not public applications.',
    status: 'invite',
    statusNote:
      'Closed nomination process. No direct individual application route.',
    sources: [
      {
        label: 'Fellowship and nomination rules',
        url: 'https://ai2050.schmidtsciences.org/fellows/',
      },
      {
        label: 'Programme overview',
        url: 'https://ai2050.schmidtsciences.org/about/',
      },
    ],
    level: 'experienced',
  },
  {
    id: 'schmidt-call',
    organisation: 'Schmidt Sciences',
    title: 'Scaling AI Safety for a Multi-Agent World',
    url: 'https://www.schmidtsciences.org/multi-agent-ai/',
    summary:
      'Project funding for researchers and teams with a substantive technical safety proposal.',
    tracks: ['technical'],
    kind: 'Funding',
    regions: [],
    format: 'varies',
    location: 'Global research projects',
    minHours: null,
    time: 'Commitment to confirm',
    duration: '1–2 years',
    fundingType: 'grant',
    funding:
      'Tier 1 up to $300,000; Tier 2 $300,000–$1m. Project budgets, not personal transition stipends.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'Researchers, teams and institutions with relevant expertise and a proposal.',
    status: 'closed',
    statusNote:
      'Application portal deadline: 9 Aug 2026, 23:59 AoE. Closed despite a stale homepage “open call” label.',
    sources: [
      {
        label: 'Research call',
        url: 'https://www.schmidtsciences.org/multi-agent-ai/',
      },
      {
        label: 'Application portal / deadline',
        url: 'https://schmidtsciences.smapply.io/prog/scaling_ai_safety_for_a_multi_agent_world/',
      },
    ],
    deadline: '2026-08-09',
    level: 'experienced',
  },
  {
    id: 'talos',
    organisation: 'Talos Network',
    title: 'Talos Fellowship',
    url: 'https://www.talosnetwork.org/talos-fellowship',
    summary:
      'European AI governance training, with optional placement or incubation pathways.',
    tracks: ['governance', 'operations'],
    kind: 'Fellowship',
    regions: ['EU'],
    format: 'hybrid',
    location: 'Online training + compulsory Brussels summit',
    minHours: 10,
    time: '~10h/week training; placement full-time',
    duration: '~8-week training; placement adds 6 months',
    fundingType: 'varies',
    funding:
      'No training stipend. Brussels placement: €3,000/month. Incubation support is discretionary, up to €3,000/month for six months. Summit support provided.',
    visaStatus: 'none',
    visa: 'No sponsorship; placement participants need independent European work rights. Training eligibility is separate.',
    travel: 'required',
    entry:
      'Completed undergraduate degree (limited exceptions); strong EU-citizenship preference and demonstrated AI policy interest.',
    status: 'closed',
    statusNote:
      'Autumn 2026 closed. Training underway; summit 3–9 Oct, placements Oct 2026–Mar 2027. EOI for future rounds.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.talosnetwork.org/talos-fellowship',
      },
    ],
  },
  {
    id: 'talos-leaders',
    organisation: 'Talos Network',
    title: 'AI Policy Leaders Programme',
    url: 'https://www.talosnetwork.org/policy-leaders-programme',
    summary:
      'A transition route for experienced professionals bringing established skills into European AI policy.',
    tracks: ['governance', 'operations'],
    kind: 'Fellowship',
    regions: ['EU'],
    format: 'hybrid',
    location: 'Online bootcamp + Brussels summit; placements usually Europe',
    minHours: 10,
    time: '~10h/week training; placement full-time',
    duration: '6-week bootcamp; placement adds 12 months',
    fundingType: 'varies',
    funding:
      'Training unpaid; Brussels placement at least €5,000/month. Summit travel, accommodation and some meals covered.',
    visaStatus: 'none',
    visa: 'No visa sponsorship. Confirm existing permission for the placement country.',
    travel: 'required',
    entry:
      'Placement: 8+ years of experience. Training-only: 12+ years. Exceptional remote placements may be considered.',
    status: 'closed',
    statusNote:
      'Autumn bootcamp underway: 10 Sep–22 Oct 2026; summit 3–9 Oct. EOI available; next opening unconfirmed.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.talosnetwork.org/policy-leaders-programme',
      },
    ],
    level: 'experienced',
  },
  {
    id: 'era',
    organisation: 'ERA Fellowship',
    title: 'Cambridge ERA:AI Fellowship',
    url: 'https://erafellowship.org/fellowship',
    summary:
      'Mentored research across technical safety, governance and technical governance.',
    tracks: ['technical', 'governance'],
    kind: 'Fellowship',
    regions: ['UK'],
    format: 'in-person',
    location: 'Cambridge, UK',
    minHours: 40,
    time: 'Full-time; actual hours to confirm',
    duration: '10 weeks',
    fundingType: 'stipend',
    funding:
      '£10,000 stipend, working-hours meals, travel coverage and visa support. Housing coverage not confirmed for this cohort.',
    visaStatus: 'support',
    visa: 'Visa support is described. Confirm the exact route, eligible activity and costs.',
    travel: 'required',
    entry:
      '18+; worldwide applicants at varied career stages, including professionals from adjacent fields.',
    status: 'closed',
    statusNote:
      'Winter 2027 applications closed. Cohort: 18 Jan–26 Mar 2027; mailing list available.',
    sources: [
      {
        label: 'Programme and funding',
        url: 'https://erafellowship.org/fellowship',
      },
      {
        label: 'Current dates/status',
        url: 'https://erafellowship.org/',
      },
    ],
    weeks: 10,
  },
  {
    id: 'bluedot-grants',
    organisation: 'BlueDot Impact',
    title: 'Career Transition Grants',
    url: 'https://bluedot.org/grants/career-transition',
    summary:
      'Dedicated support for a defined full-time transition into AI safety or biosecurity.',
    tracks: ['technical', 'governance', 'biology', 'operations'],
    kind: 'Funding',
    regions: [],
    format: 'varies',
    location: 'Location agreed with provider; country restrictions apply',
    minHours: 40,
    time: 'Full-time; cannot combine with a job',
    duration: 'Individually agreed',
    fundingType: 'grant',
    funding:
      'Generally $20,000–$200,000; amount and duration follow the plan. Fellowship grant, not salary or employment.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'Recent evidence of relevant ability, a credible plan and milestones, and a link to catastrophic-risk reduction. No prior BlueDot course required. Currently excludes people based in Russia, China and India; sanctions restrictions also apply.',
    status: 'check',
    statusNote:
      'Application process described; no closing date. Confirm current submission availability. Coefficient’s individual transition programme moved here on 4 Sep 2026.',
    sources: [
      {
        label: 'Current grant terms',
        url: 'https://bluedot.org/grants/career-transition',
      },
      {
        label: 'Coefficient handover',
        url: 'https://coefficientgiving.org/funds/global-catastrophic-risks-opportunities/career-development-and-transition-funding/',
      },
    ],
    importantChecks: [
      'Currently cannot fund people based in Russia, China or India. Full-time participation cannot be combined with employment.',
    ],
  },
  {
    id: 'bluedot-governance',
    organisation: 'BlueDot Impact',
    title: 'Frontier AI Governance course',
    url: 'https://bluedot.org/courses/ai-governance',
    summary:
      'A structured introduction to governance before committing to a larger transition.',
    tracks: ['governance', 'operations', 'technical'],
    kind: 'Course',
    regions: [],
    format: 'remote',
    location: 'Online · international cohorts',
    minHours: 7,
    time: '6–7 hours/week',
    duration: '6 weeks; intensive option exists',
    fundingType: 'free',
    funding: 'Free, with optional contribution; no living stipend.',
    visaStatus: 'na',
    visa: 'No international travel required for the online course.',
    travel: 'none',
    entry:
      'No technical qualification or previous BlueDot course required; some AI familiarity helps.',
    status: 'check',
    statusNote:
      'Live page says “Apply by 27 Sep” without a year. Confirm the intended cohort; 40 hours total.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://bluedot.org/courses/ai-governance',
      },
    ],
    weeks: 6,
    level: 'intro',
  },
  {
    id: 'bluedot-bio',
    organisation: 'BlueDot Impact',
    title: 'Biosecurity course',
    url: 'https://bluedot.org/courses/biosecurity',
    summary:
      'Explore biosecurity and how your scientific, policy or professional skills could contribute.',
    tracks: ['biology', 'governance', 'technical', 'operations'],
    kind: 'Course',
    regions: [],
    format: 'remote',
    location: 'Online · international cohorts',
    minHours: 5,
    time: '~5 hours/week',
    duration: '6 weeks; intensive option exists',
    fundingType: 'free',
    funding:
      'Free / optional contribution; no stipend. Separate grants require separate assessment.',
    visaStatus: 'na',
    visa: 'No international travel required for online participation.',
    travel: 'none',
    entry:
      'No biology background required. Useful for scientists, policymakers and other career changers.',
    status: 'check',
    statusNote:
      'Page says “Apply by 27 Sep” but omits year and start dates. Confirm cohort; approximately 30 hours total.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://bluedot.org/courses/biosecurity',
      },
    ],
    weeks: 6,
    level: 'intro',
  },
  {
    id: 'astralis',
    organisation: 'Astralis Foundation',
    title: 'Ecosystem funder to follow',
    url: 'https://astralisfoundation.org/',
    summary:
      'Understand a funder supporting AI safety and governance, including European work.',
    tracks: ['technical', 'governance', 'operations'],
    kind: 'Funding',
    regions: [],
    format: 'varies',
    location: 'Confirm location with provider',
    minHours: null,
    time: 'Commitment to confirm',
    duration: 'Varies',
    fundingType: 'unknown',
    funding: 'No public individual transition award or stipend verified.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'No public career-transition fellowship verified. Do not treat this listing as a grant application invitation.',
    status: 'invite',
    statusNote:
      'Official site does not accept unsolicited funding requests. Included as a requested ecosystem resource.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://astralisfoundation.org/',
      },
    ],
  },
  {
    id: 'tailwind',
    organisation: 'Coefficient Giving',
    title: 'Project Tailwind · founder funding',
    url: 'https://coefficientgiving.org/tailwind/',
    summary:
      'For experienced people building an organisation or major initiative to reduce catastrophic AI risk.',
    tracks: ['technical', 'governance', 'operations'],
    kind: 'Funding',
    regions: [],
    format: 'varies',
    location: 'International initiatives',
    minHours: null,
    time: 'Commitment to confirm',
    duration: 'Pre-seed 9–18 months; longer later stages',
    fundingType: 'grant',
    funding:
      'Pre-seed $200k–$2m; seed $2m–$20m. These are initiative budgets, not personal fellowships; team salaries may be funded.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'unknown',
    entry:
      'Strong relevant track record, credible impact case and substantial multi-year commitment. Pre-seed can fund an individual before incorporation.',
    status: 'rolling',
    statusNote:
      'Launched 9 Sep 2026; EOI invited without fixed deadline, subject to capacity. Distinct from BlueDot’s individual transition route.',
    sources: [
      {
        label: 'Programme',
        url: 'https://coefficientgiving.org/tailwind/',
      },
      {
        label: 'Funding and eligibility',
        url: 'https://coefficientgiving.org/tailwind/faqs/',
      },
      {
        label: 'Expression of interest',
        url: 'https://coefficientgiving.org/tailwind/get-involved/',
      },
    ],
    level: 'founder',
  },
  {
    id: 'elbi',
    organisation: 'Johns Hopkins Center for Health Security',
    title: 'Emerging Leaders in Biosecurity (ELBI)',
    url: 'https://centerforhealthsecurity.org/education-training/emerging-leaders-in-biosecurity-fellowship',
    summary:
      'Part-time biosecurity development and networking alongside your existing work or study.',
    tracks: ['biology', 'governance'],
    kind: 'Fellowship',
    regions: [],
    format: 'hybrid',
    location: 'No relocation; 3 compulsory meetings in USA / Switzerland',
    minHours: null,
    time: 'Part-time; weekly hours unspecified',
    duration: '10 months',
    fundingType: 'expenses',
    funding:
      'Meeting travel, lodging and meals covered; no living stipend advertised.',
    visaStatus: 'unknown',
    visa: 'Visa support not confirmed. Ask about the specific programme and activity.',
    travel: 'required',
    entry:
      'Master’s/doctorate completed, current doctoral enrolment, or 3+ years of relevant experience; country restrictions apply.',
    status: 'open',
    statusNote:
      '2027 applications due 30 Sep 2026, 11:59pm EDT. Three multi-day meetings; check final dates.',
    sources: [
      {
        label: 'Overview and support',
        url: 'https://centerforhealthsecurity.org/education-training/emerging-leaders-in-biosecurity-fellowship',
      },
      {
        label: '2027 eligibility and application',
        url: 'https://centerforhealthsecurity.org/education-training/elbi-fellowship/apply-to-the-elbi-fellowship',
      },
    ],
    deadline: '2026-09-30',
    level: 'experienced',
    deadlineAt: '2026-10-01T03:59:59Z',
  },
  {
    id: 'aixbio',
    organisation: 'ERA + Cambridge Biosecurity Hub',
    title: 'AIxBio Research Fellowship',
    url: 'https://www.aixbiosecurity.com/fellowship',
    summary:
      'Research at the AI–biosecurity intersection, with technical and policy projects.',
    tracks: ['biology', 'technical', 'governance'],
    kind: 'Fellowship',
    regions: ['UK'],
    format: 'in-person',
    location: 'Cambridge, UK; rare remote exceptions',
    minHours: 40,
    time: 'Full-time; actual hours to confirm',
    duration: '10 weeks',
    fundingType: 'salary',
    funding:
      'Published £34,125 annual salary equivalent, prorated for the fellowship; housing, working-hours meals and travel. £34,125 is not the total award.',
    visaStatus: 'support',
    visa: 'Visa support/sponsorship stated; confirm eligibility and route.',
    travel: 'required',
    entry:
      '18+; ML, biology, public-health or policy backgrounds. Prior formal research experience not required.',
    status: 'closed',
    statusNote:
      'Summer 2026 completed (6 Jul–11 Sep). Next dates unannounced; register interest.',
    sources: [
      {
        label: 'Fellowship terms',
        url: 'https://www.aixbiosecurity.com/fellowship',
      },
      {
        label: 'FAQ / visas',
        url: 'https://www.aixbiosecurity.com/faq',
      },
    ],
    weeks: 10,
  },
  {
    id: 'arena',
    organisation: 'ARENA',
    title: 'Alignment Research Engineer Accelerator',
    url: 'https://www.arena.education/',
    summary:
      'Build practical technical AI safety skills in an intensive training setting.',
    tracks: ['technical'],
    kind: 'Course',
    regions: ['UK'],
    format: 'in-person',
    location: 'London · LISA',
    minHours: 40,
    time: 'Full-time intensive; hours to confirm',
    duration: '5 weeks',
    fundingType: 'expenses',
    funding:
      'Travel, visa expenses, accommodation and programme-day meals covered. No replacement salary established.',
    visaStatus: 'support',
    visa: 'Visa expenses covered; this is not a guarantee of sponsorship or entry. Confirm the appropriate category.',
    travel: 'required',
    entry:
      'Strong coding, Python and roughly a year of university-level applied maths recommended.',
    status: 'closed',
    statusNote:
      'ARENA 9.0 applications closed. Runs 5 Oct–6 Nov 2026; EOI for later rounds.',
    sources: [
      {
        label: 'Current programme',
        url: 'https://www.arena.education/',
      },
      {
        label: 'Prerequisites',
        url: 'https://www.arena.education/faqs',
      },
    ],
    weeks: 5,
  },
  {
    id: 'mats',
    organisation: 'MATS',
    title: 'Winter 2027 research programme',
    url: 'https://www.matsprogram.org/program/winter-2027',
    summary:
      'Mentored research across alignment, security, governance, biosecurity and field-building.',
    tracks: ['technical', 'governance', 'biology', 'operations'],
    kind: 'Fellowship',
    regions: ['US', 'UK'],
    format: 'hybrid',
    location: 'Berkeley / London; remote by agreement',
    minHours: 40,
    time: '40 hours/week; some 20h exceptions',
    duration: '12 weeks',
    fundingType: 'stipend',
    funding:
      '$1,600/week ($19,200 for 12 weeks), plus travel, housing and weekday meals. Reduced participation prorated.',
    visaStatus: 'support',
    visa: 'US J-1 support described. London visa support unavailable. US J-1 participants cannot use the part-time exception.',
    travel: 'optional',
    entry:
      '18+; requirements vary by mentor. Remote arrangements depend on mentor and circumstances.',
    status: 'closed',
    statusNote:
      'Winter applications closed 6 Sep 2026. Programme: 19 Jan–10 Apr 2027. Future-round notification available.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.matsprogram.org/program/winter-2027',
      },
    ],
    partTimeException: true,
    weeks: 12,
    deadline: '2026-09-06',
    minExceptionHours: 20,
    importantChecks: [
      'US J-1 assistance requires qualifying full-time participation. London needs an independent visa route; remote and part-time arrangements need approval.',
    ],
  },
  {
    id: 'iaps',
    organisation: 'Institute for AI Policy and Strategy',
    title: 'AI Policy Fellowship · Spring 2027',
    url: 'https://www.iaps.ai/fellowship/',
    summary:
      'Research and applied policy routes for people bringing academic, technical or professional skills.',
    tracks: ['governance', 'technical', 'operations'],
    kind: 'Fellowship',
    regions: ['US', 'UK'],
    format: 'remote',
    location: 'Remote / DC / London; mandatory 2 weeks in DC',
    minHours: 40,
    time: 'Normally full-time; limited exceptions',
    duration: '3 months',
    fundingType: 'stipend',
    funding:
      '$18,000 fellows / $24,000 senior fellows, plus $3,000 for DC or London tracks. Residency travel/accommodation funded.',
    visaStatus: 'none',
    visa: 'No US/UK work visa sponsorship. Remote hiring depends on country; DC residency invitation letters offered, but obtaining entry permission is your responsibility.',
    travel: 'required',
    entry:
      'Varied backgrounds; credible interest in AI policy. In-person tracks need relevant work rights; remote participation does not remove residency requirements.',
    status: 'open',
    statusNote:
      'Apply by 27 Sep 2026. Programme: 22 Feb–14 May 2027; compulsory DC event 22 Feb–5 Mar.',
    sources: [
      {
        label: 'Official programme',
        url: 'https://www.iaps.ai/fellowship/',
      },
      {
        label: 'Deadline and current openings',
        url: 'https://www.iaps.ai/careers',
      },
    ],
    partTimeException: true,
    weeks: 12,
    deadline: '2026-09-27',
    importantChecks: [
      'DC and London work need suitable existing permission; no work-visa sponsorship. Remote hiring depends on your country. Check entry permission for the compulsory DC residency separately.',
    ],
    deadlineAt: '2026-09-28T06:59:59Z',
  },
  {
    id: 'horizon',
    organisation: 'Horizon Institute for Public Service',
    title: 'Horizon Fellowship',
    url: 'https://horizonpublicservice.org/programs/become-a-fellow/',
    summary: 'Move AI or biotechnology expertise into US public-service roles.',
    tracks: ['governance', 'biology', 'technical'],
    kind: 'Fellowship',
    regions: ['US'],
    format: 'in-person',
    location: 'Washington, DC',
    minHours: 40,
    time: 'Full-time placement',
    duration: '6–12 months initially',
    fundingType: 'salary',
    funding:
      '2027 annual base: $78k junior / $130k fellow / $190k+ senior, plus $17k benefits-equivalent support. Payment structure varies by placement.',
    visaStatus: 'none',
    visa: 'Normally needs pre-existing work authorisation independent of employer sponsorship. Narrow programme-specific exceptions; some placements need US citizenship.',
    travel: 'required',
    entry:
      'Relevant AI, biotechnology or emerging-tech expertise. Junior think-tank route accessible earlier; other tracks expect experience or advanced training.',
    status: 'closed',
    statusNote:
      '2027 cohort deadline was 30 Aug 2026. Full-time DC placement follows preparatory training.',
    sources: [
      {
        label: 'Programme / dates',
        url: 'https://horizonpublicservice.org/programs/become-a-fellow/',
      },
      {
        label: 'Eligibility and compensation FAQ',
        url: 'https://horizonpublicservice.org/horizon-fellowship-applicant-faqs/',
      },
    ],
    weeks: 26,
    requiresWorkRights: true,
    deadline: '2026-08-30',
  },
];
