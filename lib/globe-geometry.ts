/**
 * Orthographic globe geometry. Coordinates are always [longitude, latitude].
 * Display offsets belong to labels; these functions never alter an actor's base.
 */
export type LonLat = [number, number];
export type GlobeCamera = { center: LonLat; zoom: number };
export type GlobeFrame = { x: number; y: number; radius: number };
export type GlobePoint = { x: number; y: number; z: number; visible: boolean };
export type Vector3 = [number, number, number];
const radians = Math.PI / 180;
const degrees = 180 / Math.PI;
export const globeWidth = 1000;
export const globeHeight = 740;
export const globeFrame: GlobeFrame = { x: 500, y: 365, radius: 292 };
export const globePresets: Record<string, GlobeCamera> = {
  Global: { center: [-27, 26], zoom: 1 },
  USA: { center: [-96, 32], zoom: 1.35 },
  Europe: { center: [9, 49], zoom: 1.9 },
  Asia: { center: [111, 29], zoom: 1.35 },
  Pacific: { center: [146, -20], zoom: 1.1 },
};
export function wrapLongitude(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}
export function clampLatitude(value: number) {
  return Math.max(-75, Math.min(75, value));
}
export function toVector([lon, lat]: LonLat): Vector3 {
  const lambda = lon * radians,
    phi = lat * radians;
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.cos(phi) * Math.sin(lambda),
    Math.sin(phi),
  ];
}
export function fromVector([x, y, z]: Vector3): LonLat {
  return [
    Math.atan2(y, x) * degrees,
    Math.atan2(z, Math.hypot(x, y)) * degrees,
  ];
}
export function projectGlobe(
  coords: LonLat,
  camera: GlobeCamera,
  frame = globeFrame,
): GlobePoint {
  const lambda = (coords[0] - camera.center[0]) * radians;
  const phi = coords[1] * radians,
    phi0 = camera.center[1] * radians;
  const cosPhi = Math.cos(phi),
    sinPhi = Math.sin(phi);
  const z =
    Math.sin(phi0) * sinPhi + Math.cos(phi0) * cosPhi * Math.cos(lambda);
  const radius = frame.radius * camera.zoom;
  return {
    x: frame.x + radius * cosPhi * Math.sin(lambda),
    y:
      frame.y -
      radius *
        (Math.cos(phi0) * sinPhi - Math.sin(phi0) * cosPhi * Math.cos(lambda)),
    z,
    visible: z >= -1e-10,
  };
}
/** Inverse projection maps only the visible disk; returns null outside it. */
export function unprojectGlobe(
  x: number,
  y: number,
  camera: GlobeCamera,
  frame = globeFrame,
): LonLat | null {
  const radius = frame.radius * camera.zoom;
  const px = (x - frame.x) / radius,
    py = (frame.y - y) / radius;
  const square = px * px + py * py;
  if (square > 1 + 1e-10) return null;
  const z = Math.sqrt(Math.max(0, 1 - square)),
    phi = camera.center[1] * radians;
  return [
    wrapLongitude(
      camera.center[0] +
        Math.atan2(px, z * Math.cos(phi) - py * Math.sin(phi)) * degrees,
    ),
    Math.asin(
      Math.max(-1, Math.min(1, py * Math.cos(phi) + z * Math.sin(phi))),
    ) * degrees,
  ];
}
/** Existing country paths use a 1200px Mercator with y=310 at the equator. */
export function mercatorTexturePoint([lon, lat]: LonLat) {
  const latitude = Math.max(-89.99, Math.min(89.99, lat)) * radians;
  return {
    x: ((wrapLongitude(lon) + 180) * 1200) / 360,
    y:
      310 -
      (1200 / (2 * Math.PI)) * Math.log(Math.tan(Math.PI / 4 + latitude / 2)),
  };
}
export function inverseMercatorPoint(x: number, y: number): LonLat {
  return [
    (x * 360) / 1200 - 180,
    (2 * Math.atan(Math.exp(((310 - y) * 2 * Math.PI) / 1200)) - Math.PI / 2) *
      degrees,
  ];
}
export function angularDistance(a: LonLat, b: LonLat) {
  const va = toVector(a),
    vb = toVector(b);
  return Math.acos(
    Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])),
  );
}
/** Spherical interpolation, including a deterministic path for antipodal points. */
export function greatCirclePoint(a: LonLat, b: LonLat, t: number): LonLat {
  if (t <= 0) return [...a];
  if (t >= 1) return [...b];
  const va = toVector(a),
    vb = toVector(b),
    angle = angularDistance(a, b);
  if (angle < 1e-8) return [...a];
  if (Math.PI - angle < 1e-7) {
    const axis: Vector3 = Math.abs(va[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    const dot = va[0] * axis[0] + va[1] * axis[1] + va[2] * axis[2];
    const tangent = axis.map((v, i) => v - dot * va[i]) as Vector3;
    const length = Math.hypot(...tangent);
    return fromVector(
      va.map(
        (v, i) =>
          v * Math.cos(Math.PI * t) +
          (tangent[i] / length) * Math.sin(Math.PI * t),
      ) as Vector3,
    );
  }
  const sa = Math.sin((1 - t) * angle) / Math.sin(angle),
    sb = Math.sin(t * angle) / Math.sin(angle);
  return fromVector(va.map((v, i) => sa * v + sb * vb[i]) as Vector3);
}
const pointString = (p: { x: number; y: number }) =>
  `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
/**
 * Horizon clipping inserts an exact z=0 crossing by bisection. Separate visible
 * runs never receive a joining segment across the back of the globe.
 */
export function visibleCurveSegments(
  pointAt: (t: number) => LonLat,
  camera: GlobeCamera,
  steps = 80,
  elevation = 0,
  frame = globeFrame,
): GlobePoint[][] {
  const result: GlobePoint[][] = [];
  let run: GlobePoint[] = [];
  const sample = (t: number) => {
    const p = projectGlobe(pointAt(t), camera, frame);
    const lift = 1 + elevation * Math.sin(Math.PI * t);
    return {
      ...p,
      x: frame.x + (p.x - frame.x) * lift,
      y: frame.y + (p.y - frame.y) * lift,
    };
  };
  let previous = sample(0);
  if (previous.visible) run.push(previous);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps,
      current = sample(t);
    if (previous.visible !== current.visible) {
      let low = (i - 1) / steps,
        high = t;
      for (let pass = 0; pass < 28; pass++) {
        const mid = (low + high) / 2;
        if (sample(mid).visible === previous.visible) low = mid;
        else high = mid;
      }
      const crossing = { ...sample((low + high) / 2), z: 0, visible: true };
      if (previous.visible) {
        run.push(crossing);
        if (run.length > 1) result.push(run);
        run = [];
      } else run = [crossing];
    }
    if (current.visible) run.push(current);
    previous = current;
  }
  if (run.length > 1) result.push(run);
  return result;
}
export function segmentsPath(segments: GlobePoint[][]) {
  return segments
    .map((points) => `M${points.map(pointString).join('L')}`)
    .join('');
}
export function greatCirclePath(
  a: LonLat,
  b: LonLat,
  camera: GlobeCamera,
  elevation = 0.11,
  frame = globeFrame,
) {
  if (angularDistance(a, b) < 0.00001) return '';
  return segmentsPath(
    visibleCurveSegments(
      (t) => greatCirclePoint(a, b, t),
      camera,
      90,
      elevation,
      frame,
    ),
  );
}
export function graticulePath(camera: GlobeCamera, frame = globeFrame) {
  const paths: string[] = [];
  for (let lat = -60; lat <= 60; lat += 30)
    paths.push(
      segmentsPath(
        visibleCurveSegments(
          (t) => [-180 + t * 360, lat],
          camera,
          180,
          0,
          frame,
        ),
      ),
    );
  for (let lon = -180; lon < 180; lon += 30)
    paths.push(
      segmentsPath(
        visibleCurveSegments((t) => [lon, -90 + t * 180], camera, 90, 0, frame),
      ),
    );
  return paths.join('');
}
export type RaisedPin = {
  id: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  radius: number;
};
/** Resolve display collisions only. Real anchors remain immutable and visible. */
export function arrangeRaisedPins(
  pins: RaisedPin[],
  frame = globeFrame,
): RaisedPin[] {
  const result = pins.map((p) => {
    const dx = p.x - frame.x,
      dy = p.y - frame.y,
      length = Math.hypot(dx, dy) || 1;
    return {
      ...p,
      x: p.x + (dx / length) * 30,
      y: p.y + (dy / length) * 30 - 21,
    };
  });
  for (let pass = 0; pass < 65; pass++) {
    let collision = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i],
          b = result[j];
        const dx = b.x - a.x,
          dy = b.y - a.y,
          length = Math.hypot(dx, dy);
        const gap = a.radius + b.radius + 13;
        if (length >= gap) continue;
        collision = true;
        const angle = i * 2.39996 + j * 1.618,
          ux = length > 0.01 ? dx / length : Math.cos(angle),
          uy = length > 0.01 ? dy / length : Math.sin(angle);
        const shift = (gap - length) * 0.51;
        a.x -= ux * shift;
        a.y -= uy * shift;
        b.x += ux * shift;
        b.y += uy * shift;
      }
      const p = result[i];
      p.x = Math.max(70, Math.min(globeWidth - 70, p.x));
      p.y = Math.max(78, Math.min(globeHeight - 120, p.y));
    }
    if (!collision) break;
  }
  return result;
}
