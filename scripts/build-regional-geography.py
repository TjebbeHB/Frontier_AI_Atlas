"""Rebuild the small regional basemap from public-domain Natural Earth 5.1.2.

Downloads the pinned upstream GeoJSON only when the local cache is absent.
Clips real geometry to the map bounds; no coastline or lake outline is invented.
Run: python3 scripts/build-regional-geography.py
"""
import json
import math
import sys
from pathlib import Path
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parent.parent
SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries_lakes.geojson'
LAKE_SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson'
CACHE = ROOT / 'outputs/regional-map-source/countries.geojson'
NETHERLANDS = '--netherlands' in sys.argv
BOUNDS = [3.1, 50.65, 7.35, 53.65] if NETHERLANDS else [-1.2, 48.45, 8.0, 53.65]  # west, south, east, north
WIDTH, HEIGHT, PADDING = (880, 1020, 34) if NETHERLANDS else (940, 820, 34)


def mercator(lon, lat):
    return lon, math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


west, south, east, north = BOUNDS
_, ymin = mercator(0, south)
_, ymax = mercator(0, north)
scale = min((WIDTH - 2 * PADDING) / (east - west), (HEIGHT - 2 * PADDING) / (ymax - ymin))


def project(point):
    x, y = mercator(*point[:2])
    return [round(WIDTH / 2 + (x - (west + east) / 2) * scale, 2),
            round(HEIGHT / 2 - (y - (ymin + ymax) / 2) * scale, 2)]


def clip(ring):
    points = [p[:2] for p in ring]
    for axis, limit, greater in [(0, west, True), (0, east, False), (1, south, True), (1, north, False)]:
        old, points = points, []
        if not old:
            break
        a = old[-1]
        ain = (a[axis] >= limit) if greater else (a[axis] <= limit)
        for b in old:
            bin = (b[axis] >= limit) if greater else (b[axis] <= limit)
            if ain != bin:
                t = (limit - a[axis]) / (b[axis] - a[axis])
                points.append([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
            if bin:
                points.append(b)
            a, ain = b, bin
    return points


CACHE.parent.mkdir(parents=True, exist_ok=True)
if not CACHE.exists():
    urlretrieve(SOURCE, CACHE)
features = json.loads(CACHE.read_text())['features']
countries = []


def make_paths(feature):
    geometry = feature['geometry']
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    paths = []
    for polygon in polygons:
        for ring in polygon:
            clipped = clip(ring)
            if len(clipped) < 3:
                continue
            points = [project(p) for p in clipped]
            # Keep source detail, only remove exact projected duplicates.
            compact = [p for i, p in enumerate(points) if i == 0 or p != points[i - 1]]
            if len(compact) >= 3:
                paths.append('M' + 'L'.join(f'{x},{y}' for x, y in compact) + 'Z')
    return ''.join(paths)


for feature in features:
    path = make_paths(feature)
    if path:
        countries.append({'name': feature['properties']['ADMIN'], 'path': path})
lake_cache = CACHE.with_name('lakes.geojson')
if not lake_cache.exists():
    urlretrieve(LAKE_SOURCE, lake_cache)
lakes = []
for feature in json.loads(lake_cache.read_text())['features']:
    path = make_paths(feature)
    if path:
        lakes.append({'name': feature['properties'].get('name') or 'Lake', 'path': path})
output = {'source': SOURCE, 'lakeSource': LAKE_SOURCE, 'attribution': 'Natural Earth · public domain · 1:10m · v5.1.2',
          'bounds': BOUNDS, 'width': WIDTH, 'height': HEIGHT, 'padding': PADDING, 'countries': countries, 'lakes': lakes}
path = ROOT / ('lib/netherlands-countries.json' if NETHERLANDS else 'lib/regional-countries.json')
path.write_text(json.dumps(output, separators=(',', ':')) + '\n')
print(f'{len(countries)} clipped country shapes, {len(lakes)} lakes; {path.stat().st_size:,} bytes')
