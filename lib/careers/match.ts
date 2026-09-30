import type { Opportunity, Profile, Region } from './types';
export const checkedOn = '19 September 2026';
export const trackLabels = {
  technical: 'Technical / engineering',
  governance: 'Governance / policy',
  biology: 'Biology / health',
  operations: 'Operations / other',
};
export const regionLabels: Record<Region, string> = {
  EU: 'EU / EEA',
  UK: 'United Kingdom',
  US: 'United States',
  Other: 'Elsewhere',
};
export const fundingLabels = {
  salary: 'Salary',
  stipend: 'Stipend',
  grant: 'Competitive funding',
  expenses: 'Expenses covered',
  free: 'Free resource',
  varies: 'Support varies',
  unknown: 'Funding unconfirmed',
};
export function likelyWorkRegions(p: Profile): Region[] {
  const rights = new Set<Region>(p.rights.filter((r) => r !== 'EU'));
  if (p.passports.includes('eu') || p.passports.includes('irish'))
    rights.add('EU');
  if (p.passports.includes('british') || p.passports.includes('irish'))
    rights.add('UK');
  if (p.passports.includes('american')) rights.add('US');
  return [...rights];
}
export function opportunityStatus(
  o: Opportunity,
  now = new Date().toISOString(),
) {
  const cutoff =
    o.deadlineAt || (o.deadline ? `${o.deadline}T23:59:59Z` : undefined);
  return cutoff &&
    new Date(now).getTime() > new Date(cutoff).getTime() &&
    o.status === 'open'
    ? 'closed'
    : o.status;
}
export function assess(o: Opportunity, p: Profile) {
  let score = 0;
  const reasons: string[] = [],
    checks: string[] = [...(o.importantChecks || [])],
    conflicts: string[] = [];
  const shared = o.tracks.filter((t) => p.tracks.includes(t));
  if (shared.length) {
    score += 30;
    reasons.push(
      `Relevant to ${shared.map((t) => trackLabels[t].toLowerCase()).join(' and ')}.`,
    );
  } else
    checks.push(
      'An adjacent route; check the experience this programme needs.',
    );
  if (o.format === 'remote') {
    score += 15;
    reasons.push(
      o.travel === 'required'
        ? 'Remote work with a required in-person element.'
        : 'Can start remotely.',
    );
  }
  if (o.minHours !== null && p.hours) {
    if (o.minHours > Number(p.hours)) {
      if (
        o.partTimeException &&
        (!o.minExceptionHours || Number(p.hours) >= o.minExceptionHours)
      )
        checks.push(
          'Normally full-time; a part-time exception needs explicit agreement.',
        );
      else
        conflicts.push(
          `Needs about ${o.minHours}+ hours/week; you selected up to ${p.hours}.`,
        );
    } else {
      score += 12;
      reasons.push(
        'The stated schedule fits your selected time band; confirm actual hours.',
      );
    }
  } else checks.push('Confirm the weekly commitment and timetable.');
  if (p.schedule === 'predictable')
    checks.push(
      'Ask about fixed meeting times, flexibility and care-related support.',
    );
  if (p.travel === 'no' && o.travel === 'required') {
    if (o.format === 'in-person' && p.home && o.regions.includes(p.home)) {
      checks.push(
        'In-person attendance is required; confirm you can commute without a trip or relocation.',
      );
    } else {
      conflicts.push(
        'Requires a trip or residential attendance that conflicts with your no-travel preference; verify any local exception.',
      );
    }
  }
  if (o.format === 'in-person' && p.home && !o.regions.includes(p.home)) {
    if (p.mobility === 'stay')
      conflicts.push(
        'Requires attendance in another region; you want to stay where you are.',
      );
    else if (p.mobility === 'visit' && (!o.weeks || o.weeks > 8))
      conflicts.push(
        'Longer than your short-visit preference (up to eight weeks).',
      );
    else if (p.mobility === 'move')
      reasons.push('Relocation is an option you are willing to consider.');
  } else if (o.format === 'in-person')
    checks.push('Confirm the city, commute and any accommodation needs.');
  if (o.format === 'hybrid' || o.format === 'varies')
    checks.push(
      'Location and remote participation depend on the specific track or role.',
    );
  if (p.experience === 'exploring' && o.level === 'intro') {
    score += 12;
    reasons.push('A practical entry point while exploring the field.');
  }
  if (
    p.experience === 'exploring' &&
    ['experienced', 'founder'].includes(o.level || '')
  ) {
    score -= 18;
    checks.unshift(
      'This route expects an established track record; consider building evidence first.',
    );
  }
  if (o.level === 'founder') {
    checks.unshift(
      'This funds building an initiative over years, not a short personal career break.',
    );
    if (Number(p.hours) < 30) score -= 25;
  }
  const income = ['salary', 'stipend', 'grant'].includes(o.fundingType);
  if (income) {
    score += p.funding === 'self' ? 3 : 12;
    reasons.push(
      `${fundingLabels[o.fundingType]} is described by the provider.`,
    );
  }
  if (p.funding === 'income') {
    if (o.fundingType === 'free' || o.fundingType === 'expenses')
      checks.push(
        'A preparation step, not replacement income; no living stipend is established here.',
      );
    else if (o.fundingType !== 'salary')
      checks.push(
        'Check take-home support, family costs and payment dates before leaving paid work.',
      );
  }
  if (o.fundingType === 'grant')
    checks.push(
      'Funding is competitive; application eligibility is not an award or a salary.',
    );
  if (['varies', 'unknown'].includes(o.fundingType))
    checks.push(
      'Confirm fees, stipend, living costs and what is actually covered.',
    );
  if (
    o.regions.length &&
    o.format !== 'remote' &&
    !o.regions.some((r) => likelyWorkRegions(p).includes(r))
  ) {
    if (o.requiresWorkRights && o.visaStatus === 'none') {
      const message =
        'Existing work permission is required; this programme does not sponsor it. Confirm destination-specific permission before applying.';
      if (p.permission === 'need') conflicts.push(message);
      else checks.push(message);
    } else
      checks.push(
        o.visaStatus === 'support'
          ? 'Visa assistance is described; confirm the correct route and your eligibility.'
          : 'Passport alone does not establish entry or work permission for this programme.',
      );
  }
  if (p.rights.includes('EU') && o.regions.includes('EU'))
    checks.push(
      'A national EU residence/work permit may cover only that country; check the destination.',
    );
  if (o.format === 'remote' && o.travel !== 'none')
    checks.push(
      'Check travel permission for any residency; remote does not always mean no travel.',
    );
  if (o.format === 'remote' && income)
    checks.push(
      'Confirm that the provider can pay or employ you in your country.',
    );
  const status = opportunityStatus(o);
  if (status === 'closed')
    conflicts.push(
      'The listed cohort is closed; keep this for a future round.',
    );
  if (status === 'invite')
    conflicts.push(
      'No open individual application route is established; nomination or invitation is needed.',
    );
  if (status === 'check')
    checks.push('An open application round has not been confirmed.');
  score -= conflicts.length * 50;
  if (status === 'open' || status === 'rolling') score += 8;
  return {
    opportunity: o,
    score,
    reasons,
    checks: [...new Set(checks)],
    conflicts,
    tier: conflicts.length ? 'later' : checks.length ? 'check' : 'fit',
  };
}
