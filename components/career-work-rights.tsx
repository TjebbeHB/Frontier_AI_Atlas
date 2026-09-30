import { ArrowUpRight, Globe2 } from 'lucide-react';
import type { Profile } from '@/lib/careers/types';
import { likelyWorkRegions } from '@/lib/careers/match';
const links = {
  eu: 'https://europa.eu/youreurope/citizens/work/work-abroad/work-permits/index_en.htm',
  cta: 'https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance',
  ukEu: 'https://www.gov.uk/guidance/the-uks-points-based-immigration-system-information-for-eu-citizens',
  prove: 'https://www.gov.uk/prove-right-to-work',
  abroad: 'https://www.gov.uk/working-abroad',
  skilled: 'https://www.gov.uk/skilled-worker-visa',
  talent: 'https://www.gov.uk/global-talent-researcher-academic',
  us: 'https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html',
  exchange:
    'https://travel.state.gov/content/travel/en/us-visas/study/exchange.html',
};
function Source({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={13} />
    </a>
  );
}
export default function CareerWorkRights({ profile: p }: { profile: Profile }) {
  const rights = likelyWorkRegions(p);
  return (
    <details className="career-rights">
      <summary>
        <Globe2 size={20} />
        <span>
          <strong>Work permission: EU, UK and USA</strong>
          <small>
            {p.passports.includes('irish')
              ? 'Irish citizenship generally provides EU mobility and UK access under the Common Travel Area.'
              : p.passports.includes('eu')
                ? 'An EU passport alone does not give you UK or US work permission.'
                : p.passports.includes('british')
                  ? 'British citizenship provides UK and Irish access, not EU-wide work rights.'
                  : 'Citizenship, existing permission and the programme’s visa support are separate questions.'}
          </small>
        </span>
      </summary>
      <p className="career-rights-intro">
        Planning guidance checked 19 September 2026, not an individual
        immigration assessment. The actual country, role, permitted activity and
        your status matter. “Visa support” never means automatic approval.
      </p>
      <div className="career-rights-grid">
        <article>
          <h3>EU / EEA</h3>
          <b>
            {rights.includes('EU')
              ? 'General citizenship access or existing permission reported'
              : 'Destination-specific route to check'}
          </b>
          <p>
            EU, EEA and Swiss citizens generally have access to work in EU
            countries, subject to destination formalities. A non-EU citizen’s
            permit for one EU country is not an EU-wide work permit. Switzerland
            has separate procedures; Liechtenstein has quotas.
          </p>
          <p>
            British citizens can work in Ireland under the Common Travel Area.
            Other EU destinations normally need their own permission unless
            another status applies.
          </p>
          <Source href={links.eu}>EU work-permit guidance</Source>
          <Source href={links.abroad}>UK → EU guidance</Source>
        </article>
        <article>
          <h3>United Kingdom</h3>
          <b>
            {rights.includes('UK')
              ? 'Citizenship access or existing permission reported'
              : 'Sponsorship or another valid route to check'}
          </b>
          <p>
            British and Irish citizens can work in the UK. Other EU citizenship
            alone is insufficient; settled or pre-settled status may provide
            rights.
          </p>
          <p>
            A Skilled Worker route needs an eligible job, approved sponsor,
            sponsorship certificate and applicable salary and English
            requirements. Global Talent research routes have their own criteria;
            an AI fellowship does not automatically qualify.
          </p>
          <Source href={links.ukEu}>EU → UK guidance</Source>
          <Source href={links.skilled}>Skilled Worker</Source>
          <Source href={links.talent}>Research / Global Talent</Source>
        </article>
        <article>
          <h3>United States</h3>
          <b>
            {rights.includes('US')
              ? 'Citizenship access or existing permission reported'
              : 'Employer or programme-specific route to check'}
          </b>
          <p>
            A typical H-1B route requires an employer petition; many cases face
            an annual cap and selection timetable. Some qualifying research or
            university employers can use cap-exempt routes.
          </p>
          <p>
            J-1 depends on an approved exchange programme and permitted
            activity. O-1 requires evidence meeting extraordinary-ability
            criteria. Neither an AI job title nor a stipend establishes
            eligibility.
          </p>
          <Source href={links.us}>Official worker-visa guidance</Source>
          <Source href={links.exchange}>
            Official exchange-visitor guidance
          </Source>
        </article>
      </div>
      <div className="career-visa-steps">
        <h3>How easy is a move between the EU and UK?</h3>
        <p>
          <strong>With existing rights:</strong> primarily prove valid
          permission and meet local formalities.{' '}
          <strong>If sponsorship is needed:</strong> first find out whether the
          organisation supports the exact role, then check the route, obtain
          documents and align the start date. <strong>For a fellowship:</strong>{' '}
          ask which immigration category covers the actual activity. A small
          organisation or short award may offer less assistance than a
          university or established employer.
        </p>
        <p>
          There is no responsible single “visa difficulty” score. Ask:{' '}
          <em>
            Will you support my route, who pays, how long should we allow, and
            does the permission cover this exact work?
          </em>{' '}
          Remote roles still require lawful hiring/payment arrangements where
          you physically work.
        </p>
        <Source href={links.cta}>British–Irish Common Travel Area</Source>
        <Source href={links.prove}>Prove UK work permission</Source>
      </div>
    </details>
  );
}
