# Netherlands jobs map

The Northwest Europe map includes a **Zoom into the Netherlands** control. It opens the same interactive detail map used by the job board. The crop includes the Wadden islands and southern Limburg: west 3.1°, east 7.35°, south 50.65°, north 53.65°. Neighbouring land remains visible as muted context.

## Sources and geography

- The basemap uses the same pinned, public-domain Natural Earth v5.1.2 country and inland-lake datasets as the [regional map](./regional-map.md). Run `python3 scripts/build-regional-geography.py --netherlands` to rebuild its clipped paths.
- Fifty city and town anchors were extracted from the official [GeoNames Netherlands dump](https://download.geonames.org/export/dump/NL.zip), retrieved 2 October 2026. [GeoNames](https://www.geonames.org/) provides these under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Every city in `lib/netherlands-cities.ts` includes its own record URL.
- Ambiguous names are matched to the major city, rather than the smaller homonymous settlement. Almere uses the Almere Stad representative centre. Den Haag and The Hague, and Den Bosch and ’s-Hertogenbosch, resolve to the same respective anchors.
- Twenty-six major cities remain visible without vacancies. Other sourced towns appear when a matching role requires them. City markers are geographic centres, not employer office locations.
- SAIN's Groningen, Utrecht and Amsterdam chapters appear as gold rings on the same city anchors. The layer is optional and links to the official chapter pages.

Labels are callouts with leader lines to true city dots. Only the callouts move; geographic anchors never do. The layout is stable when a user selects another city. Text, badges and label boxes scale together on narrower screens. Small screens retain every city dot and the complete accessible directory, while showing twelve persistent landmark labels plus the selected city. This avoids forcing a dense set of distant callouts into a narrow map. Nearby packing is preferred over distant placements that could make a city appear to be somewhere else.

## Job counts

The component accepts the caller's filtered listing set. `jobCities()` uses explicit city metadata, or the existing multi-city city field where available. One role can count once in each explicitly named city; the headline total counts each unique listing once. Unknown, nationwide and remote-only locations remain in a separate list with no inferred headquarters pin.

The map shows only brief employer-linked job cards; the complete board retains the full eligibility, compensation, work-location and source details. Its source links remain the employer's original listings.

## Verification

Run `node --experimental-strip-types scripts/validate-nl-map.mjs`. It checks all city anchors against Dutch land and the packaged subpixel-rounded boundary, projection roundtrips, north–south bounds, IJsselmeer and Ameland, SAIN coordinate consistency, alias handling, multi-city deduplication, nationwide/remote handling, current dataset counts, and stable non-overlapping desktop/mobile label layouts. Tiny rounding tolerance is used for a point lying on a basemap boundary; it never shifts a city coordinate.
