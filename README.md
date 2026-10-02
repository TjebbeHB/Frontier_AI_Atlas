# Frontier AI Atlas

**[Explore the live atlas](https://ai-governance-map.tjebbe-boersma.com/)** · [Scenario lab](https://ai-governance-map.tjebbe-boersma.com/#scenario) · [Career transitions](https://ai-governance-map.tjebbe-boersma.com/#careers) · [Netherlands AI jobs](https://ai-governance-map.tjebbe-boersma.com/#jobs)

Interactive, source-linked research map of frontier AI governance. The core governance snapshot is dated 14 September 2026; selected location, SAIN community and Netherlands jobs information was checked on 2 October 2026.

## Experience

- Network organised by geography, governance layer, actor type, time horizon or power.
- Interactive globe and flat map with sourced city anchors, regional presets (USA, Europe, Asia), raised logo callouts and traced connections.
- Hover or tap grouped pins to unfold individual organisations. Selecting an actor fits its connected organisations into view and draws animated directional relationships; dotted spokes retain geographic anchors. Open the connection evidence list for sources and entries without a physical location. Reduced-motion preferences disable the animation.
- A northwest Europe zoom moves from the globe to a matching regional map spanning London–the Netherlands and Groningen–Paris, with sourced city anchors and finer Natural Earth geometry. SAIN’s national organisation and confirmed Groningen, Utrecht and Amsterdam chapters are included.
- Authority matrix for requests, compelled disclosure, technical investigation and remedies.
- Entry profiles explain jurisdiction, dates, evidence and distinct authority/capacity gaps.
- Nine-step hypothetical cross-border incident walkthrough.
- Source library distinguishes primary law, institutional claims, research, proposals and opinion.

This is a curated snapshot, not an exhaustive census or live legal tracker. Corporate, voluntary, institutional and legal layers overlap. Location does not imply jurisdiction. A law's powers belong to its named administering actor. Technical capability, legal authority and successful enforcement are different claims.

## Data

`lib/governance-data.json` contains entries, sources and directed relationships. `lib/tutorial.json` holds the walkthrough. All supplied readings are represented; the temporary SSRN PDF was unavailable and the recovered abstract is explicitly marked abstract-only. Dataset and tutorial claims should be reverified when the snapshot date changes.

## Live hosting

The atlas is hosted permanently on Vimexx at https://ai-governance-map.tjebbe-boersma.com/ as of 30 September 2026. Cloudflare proxies the Vimexx origin; no running Mac or tunnel is required. The map, scenario lab and careers section are included; the separate game is excluded.

See [Vimexx deployment instructions](deployment/vimexx/README.md). Build the uploadable static site with `node scripts/build-vimexx.mjs`. The original Vinext build remains available for development.

## Local development commands

Use Node 22.13+ and the pinned npm lockfile.

```sh
npm ci
npm run dev
```

## Verification

```sh
node --experimental-strip-types scripts/validate-data.mjs
node --experimental-strip-types scripts/validate-globe.mjs
node --experimental-strip-types scripts/validate-regional-map.mjs
node --experimental-strip-types scripts/validate-jobs.mjs
npx tsc --noEmit
npx oxlint app lib scripts
npm run build
```

The data check covers source/edge/tutorial integrity, significant date and authority distinctions, and every layout under full, core and regional datasets. Project code lint and TypeScript checks pass. The scaffold-wide `npm run lint` also scans the untouched generated component catalog, which has existing lint findings; those vendored files are preserved.

Browser checks cover regional zoom, grouped actor selection, entry evidence links and map controls. The regional validator checks bounding coordinates, shared city anchors, chapter membership and geometry. The jobs validator checks source/date completeness, filters and deadline expiry. Source research and graph/data integrity are checked independently.

## Visual references

Palette and typography inspired by [Safe AI Netherlands](https://safeainetherlands.org/): navy, orange, cream, League Spartan and Poppins. Independent educational project; the visual reference and use of the SAIN mark do not imply an institutional endorsement. Locally served font licences are in `app/fonts/`. World country geometry is [Natural Earth public-domain data](https://www.naturalearthdata.com/about/terms-of-use/) projected with the same Mercator transform as the markers. Locations are representative city anchors, not jurisdictional boundaries. Mechanisms and distributed bodies appear separately rather than at placeholder coordinates. Marker size uses distinct mapped connections as a transparent influence proxy; it is not a legal-power score. Multi-city groups use neutral counts. Callouts retain stems to true geographic anchors; they do not relocate the organisation. The globe inverse-projects the same country data and draws great-circle connections, clipped behind the Earth. Raised logos are display callouts rather than precise building locations. The inherited low-resolution basemap omits Antarctica and has limited polar detail. Profile and icon provenance is recorded in `lib/actor-profiles.json`; local icons fall back to initials when unavailable.

## Hypothetical scenario lab

Open `/#scenario` for the Democratic AI Response Compact exercise. Seven relative-time stages and fourteen actor arcs stress-test an EU-based coalition without US membership. Four design switches compare reporting, escalation, surge capacity and democratic checks; the non-member jurisdiction limit remains even with every safeguard enabled. The compact, memberships, incidents, deadlines and responses are fictional assumptions, separate from the current-governance dataset. Sources and an authority matrix are embedded in the scenario.

## Scenarios and career transitions

The scenario lab offers two explicitly hypothetical intelligence-explosion exercises: a Democratic AI Response Compact stress test and a cooperative Democratic AI Audit Partnership that funds joint safety audits with willing labs and US states. Timeline controls show actor responses and interactions on a network or world map.

The careers section uses a four-step questionnaire covering background, time, funding, location and work permission to help visitors explore 24 resources. Answers remain in browser memory; they are not submitted to organisations.

## Netherlands AI opportunities

Open `/#jobs` for a filterable, locally saved shortlist of Netherlands AI opportunities. The 2 October 2026 snapshot contains 19 employer listings: 12 paid or PhD roles and 7 volunteer opportunities. This includes all ten advertised SAIN roles, of which three are explicitly paid. Search by keywords and filter by city, field, commitment, working arrangement, relevance or paid status. Known expired deadlines are hidden automatically; rolling vacancies still require checking with the employer.

The filter-and-shortlist format is inspired by [80,000 Hours](https://jobs.80000hours.org/), without affiliation or copying its vacancy database. Listings link to primary employer sources, distinguish broader AI work from safety-focused opportunities, and surface important eligibility restrictions. Work location does not imply visa sponsorship. Saved roles stay in the visitor’s browser. Research notes and current structured listings are in `lib/jobs/`. This is a curated snapshot, not a live hiring feed.

## Static build and local preview

This is the same application deployed on Vimexx. After `npm ci`:

```sh
node scripts/build-vimexx.mjs
python3 -m http.server 4173 --directory outputs/vimexx/upload
```

Open http://localhost:4173. The static build is self-contained and needs no hosting credentials, API keys, database or background server in production.

```sh
node --experimental-strip-types scripts/validate-scenarios.mjs
node --experimental-strip-types scripts/validate-careers.mjs
```

## Repository guide

- `app/` and `components/`: atlas interface, globe and regional map, scenarios, careers and jobs UI.
- `lib/`: source-linked governance dataset, geographic geometry, actor and SAIN chapter profiles, scenario logic, career resources and jobs data.
- `scripts/`: data validators and static deployment build.
- `deployment/vimexx/`: static entry point, fonts and hosting configuration.
- `briefs/`: the shared-safety partnership discussion brief.

The paused game prototype, local deployment records, credentials, generated builds and dependencies are excluded from this repository.

## Attribution and reuse

This is an independent educational project, with styling inspired by Safe AI Netherlands and no implied affiliation or endorsement. Logos belong to their respective organisations. Natural Earth map data is public domain. Local League Spartan and Poppins fonts include their OFL licences in `app/fonts/`; the inherited Geist fonts are from Vercel's Geist font family. Sources retain their own terms. No blanket open-source licence is asserted for third-party materials.
