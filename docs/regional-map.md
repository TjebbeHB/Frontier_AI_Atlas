# Northwest Europe map

The globe's **NW Europe · SAIN** control flies toward western Europe and changes to a flat Mercator map. Returning restores the previous globe camera and keyboard focus. Reduced-motion users move directly between the two views.

The requested London–Netherlands / Groningen–Paris area is shown with modest geographic padding: west −1.2°, east 8°, south 48.45°, north 53.65°. Every map dot and relationship endpoint uses the same projection as the country polygons. Raised logos and labels may be displaced for legibility; the stem ends on the city anchor.

## Geometry and provenance

- [Natural Earth 1:10m administrative country polygons, v5.1.2](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries_lakes.geojson). Public domain; clipped to the regional bounds without invented or hand-drawn outlines.
- [Natural Earth 1:10m lakes, v5.1.2](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson). The country dataset removes boundary lakes but does not remove all inland lakes, so an explicit lake layer preserves IJsselmeer and Markermeer.
- [SAIN's chapter directory](https://safeainetherlands.org/community), checked 2 October 2026. The public directory identifies Groningen, Utrecht and Amsterdam. A generic invitation to propose a chapter does not establish any particular prospective city, so no additional city is inferred.
- Chapter city coordinates and individual source URLs are in `lib/sain.ts`. Existing institutions use the atlas's `lib/actor-profiles.json` city-level anchors. These are representative city bases, not exact offices, meeting venues or legal jurisdictions.

The Groningen community point also represents the national foundation's registered city. Orange community connections describe SAIN's national chapter structure, not regulatory powers or transport links. Contextual institutions are grouped by city; selecting an individual institution reveals only recorded relationships whose endpoints lie within the regional area.

## Rebuild and verify

Run `python3 scripts/build-regional-geography.py` to rebuild the compact country and lake paths. It downloads pinned public-domain upstream files into the ignored `outputs/regional-map-source` cache if needed, then writes `lib/regional-countries.json`.

Run `node --experimental-strip-types scripts/validate-regional-map.mjs` to verify projection roundtrips, city land anchors, chapter data, true relationship endpoints, the North Sea, IJsselmeer and Ameland. Country and lake paths are deterministic and share the same constants as the interactive projection in `lib/regional-geography.ts`.
