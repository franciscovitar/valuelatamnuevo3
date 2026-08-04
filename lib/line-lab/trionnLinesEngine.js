// Pure geometry engine for the /line-lab prototype: immutable master routes +
// a moving [tailU, headU] window sampled from them (Snake-style trail).
import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const VIEWBOX_SIZE = 1000;

export const SAMPLES_PER_SEGMENT = 120;

export const LINE_STYLE = {
  outer: { color: 'rgba(128, 151, 178, 0.22)', width: 1.15 },
  middle: { color: 'rgba(137, 161, 188, 0.16)', width: 1 },
  inner: { color: 'rgba(151, 172, 195, 0.11)', width: 0.9 },
};

export const NODE_COLOR = {
  outer: 'rgba(128, 151, 178, 1)',
  middle: 'rgba(137, 161, 188, 1)',
  inner: 'rgba(151, 172, 195, 1)',
};

export const MASTER_ROUTE_COLOR = 'rgba(205, 216, 232, 1)';
export const MASTER_ROUTE_OPACITY = 0.08;

// Normalized master routes. Coordinates intentionally range outside [0, 1]
// (approx x: -0.35..1.35, y: -0.20..1.40) so parts of each route travel off-screen.
export const MASTER_ROUTES = {
  outer: {
    start: [-0.22, 0.06],
    segments: [
      { cp1: [0.05, 0.02], cp2: [0.48, 0.0], end: [0.88, 0.14] },
      { cp1: [1.02, 0.2], cp2: [0.98, 0.38], end: [0.84, 0.55] },
      { cp1: [0.73, 0.68], cp2: [0.67, 0.86], end: [0.61, 1.12] },
      { cp1: [0.58, 1.34], cp2: [-0.22, 1.34], end: [-0.2, 0.84] },
      { cp1: [0.02, 0.77], cp2: [0.3, 0.72], end: [0.5, 0.58] },
      { cp1: [0.66, 0.47], cp2: [0.7, 0.27], end: [0.66, 0.12] },
      { cp1: [0.62, -0.04], cp2: [0.93, -0.05], end: [1.2, 0.1] },
    ],
  },
  middle: {
    start: [-0.22, 0.14],
    segments: [
      { cp1: [0.05, 0.1], cp2: [0.42, 0.08], end: [0.76, 0.2] },
      { cp1: [0.89, 0.28], cp2: [0.87, 0.44], end: [0.76, 0.6] },
      { cp1: [0.68, 0.72], cp2: [0.63, 0.88], end: [0.6, 1.12] },
      { cp1: [0.56, 1.31], cp2: [-0.22, 1.31], end: [-0.2, 0.91] },
      { cp1: [0.04, 0.83], cp2: [0.31, 0.76], end: [0.53, 0.62] },
      { cp1: [0.65, 0.53], cp2: [0.68, 0.34], end: [0.65, 0.19] },
      { cp1: [0.62, 0.04], cp2: [0.92, 0.01], end: [1.2, 0.16] },
    ],
  },
  inner: {
    start: [-0.22, 0.22],
    segments: [
      { cp1: [0.04, 0.18], cp2: [0.36, 0.16], end: [0.64, 0.27] },
      { cp1: [0.76, 0.34], cp2: [0.77, 0.5], end: [0.68, 0.64] },
      { cp1: [0.63, 0.75], cp2: [0.6, 0.9], end: [0.59, 1.12] },
      { cp1: [0.54, 1.28], cp2: [-0.2, 1.28], end: [-0.18, 0.98] },
      { cp1: [0.06, 0.9], cp2: [0.34, 0.81], end: [0.56, 0.67] },
      { cp1: [0.66, 0.58], cp2: [0.67, 0.4], end: [0.65, 0.25] },
      { cp1: [0.64, 0.1], cp2: [0.92, 0.07], end: [1.2, 0.22] },
    ],
  },
};

// Per-line remap of global scroll progress into head/tail window positions.
export const HEAD_TAIL_RANGE = {
  outer: { headStart: 0.0, headEnd: 0.9, tailStart: 0.16, tailEnd: 1.0 },
  middle: { headStart: 0.012, headEnd: 0.91, tailStart: 0.175, tailEnd: 1.0 },
  inner: { headStart: 0.024, headEnd: 0.92, tailStart: 0.19, tailEnd: 1.0 },
};

export const CHECKPOINTS = [
  { id: 'P0', progress: 0.0 },
  { id: 'P1', progress: 0.12 },
  { id: 'P2', progress: 0.25 },
  { id: 'P3', progress: 0.38 },
  { id: 'P4', progress: 0.5 },
  { id: 'P5', progress: 0.62 },
  { id: 'P6', progress: 0.75 },
  { id: 'P7', progress: 0.88 },
  { id: 'P8', progress: 1.0 },
];

const HEAD_HIDE_THRESHOLD = 0.002;
const TAIL_HIDE_THRESHOLD = 0.998;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function denormPoint(point, size = VIEWBOX_SIZE) {
  return [point[0] * size, point[1] * size];
}

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

// Static path string for a master route. Depends only on the route's own
// coordinates — never on progress — so it must be identical for any progress.
export function buildMasterPathD(route, size = VIEWBOX_SIZE) {
  const [sx, sy] = denormPoint(route.start, size);
  let d = `M ${round(sx)} ${round(sy)}`;
  route.segments.forEach((segment) => {
    const [c1x, c1y] = denormPoint(segment.cp1, size);
    const [c2x, c2y] = denormPoint(segment.cp2, size);
    const [ex, ey] = denormPoint(segment.end, size);
    d += ` C ${round(c1x)} ${round(c1y)}, ${round(c2x)} ${round(c2y)}, ${round(ex)} ${round(ey)}`;
  });
  return d;
}

// One-time geometric sampling of a route: ~120 points per segment, accumulated
// arc-length distance per sample, and normalized distance for u-based lookup.
function computeRouteSamples(route) {
  const points = [];
  let prevAnchor = route.start;
  route.segments.forEach((segment) => {
    for (let i = 0; i < SAMPLES_PER_SEGMENT; i += 1) {
      const t = i / (SAMPLES_PER_SEGMENT - 1);
      points.push(cubicBezierPoint(prevAnchor, segment.cp1, segment.cp2, segment.end, t));
    }
    prevAnchor = segment.end;
  });

  const distances = [0];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalLength = distances[distances.length - 1];
  const normalizedDistance = distances.map((d) => (totalLength > 0 ? d / totalLength : 0));

  return { points, distances, totalLength, normalizedDistance };
}

// Precomputed once at module load — never resampled when progress changes.
export const ROUTE_SAMPLES = LINE_KEYS.reduce((acc, key) => {
  acc[key] = computeRouteSamples(MASTER_ROUTES[key]);
  return acc;
}, {});

export const MASTER_PATH_D = LINE_KEYS.reduce((acc, key) => {
  acc[key] = buildMasterPathD(MASTER_ROUTES[key]);
  return acc;
}, {});

// Exact coordinate on a route for a normalized arc-length position u (0..1),
// located via binary search over precomputed normalized distances.
export function pointAtRouteU(routeSamples, u) {
  const { points, normalizedDistance } = routeSamples;
  const target = clamp(u, 0, 1);

  let lo = 0;
  let hi = normalizedDistance.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (normalizedDistance[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  const upperIndex = lo;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerU = normalizedDistance[lowerIndex];
  const upperU = normalizedDistance[upperIndex];
  const span = upperU - lowerU;
  const localT = span > 0 ? (target - lowerU) / span : 0;

  const [x0, y0] = points[lowerIndex];
  const [x1, y1] = points[upperIndex];
  return [x0 + (x1 - x0) * localT, y0 + (y1 - y0) * localT];
}

// Builds the visible [tailU, headU] window as a polyline path over the route's
// own immutable samples. No coordinate here is invented or interpolated
// between routes — every point comes from the master route's sample set.
export function sliceRoute(routeSamples, tailU, headU, size = VIEWBOX_SIZE) {
  const { points, normalizedDistance } = routeSamples;
  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);

  const startPoint = pointAtRouteU(routeSamples, from);
  const endPoint = pointAtRouteU(routeSamples, to);

  const middlePoints = [];
  for (let i = 0; i < normalizedDistance.length; i += 1) {
    if (normalizedDistance[i] > from && normalizedDistance[i] < to) {
      middlePoints.push(points[i]);
    }
  }

  const orderedPoints = [startPoint, ...middlePoints, endPoint];
  const [sx, sy] = denormPoint(orderedPoints[0], size);
  let d = `M ${round(sx)} ${round(sy)}`;
  for (let i = 1; i < orderedPoints.length; i += 1) {
    const [x, y] = denormPoint(orderedPoints[i], size);
    d += ` L ${round(x)} ${round(y)}`;
  }
  return d;
}

export function computeHeadU(progress, range) {
  const { headStart, headEnd } = range;
  return clamp((progress - headStart) / (headEnd - headStart), 0, 1);
}

export function computeTailU(progress, range, headU) {
  const { tailStart, tailEnd } = range;
  const rawTailU = clamp((progress - tailStart) / (tailEnd - tailStart), 0, 1);
  return Math.min(rawTailU, headU);
}

// Given a global progress (0..1), returns the head/tail window and the
// visible trail path for one line. Pure function of (progress, lineKey).
export function resolveLineWindow(progress, lineKey) {
  const range = HEAD_TAIL_RANGE[lineKey];
  const headU = computeHeadU(progress, range);
  const tailU = computeTailU(progress, range, headU);
  const trailD = sliceRoute(ROUTE_SAMPLES[lineKey], tailU, headU);
  const headPoint = pointAtRouteU(ROUTE_SAMPLES[lineKey], headU);
  const tailPoint = pointAtRouteU(ROUTE_SAMPLES[lineKey], tailU);
  const hideNode = headU <= HEAD_HIDE_THRESHOLD || tailU >= TAIL_HIDE_THRESHOLD;
  return { headU, tailU, trailD, headPoint, tailPoint, hideNode };
}

export function routesToJson(routes = MASTER_ROUTES) {
  return JSON.stringify(routes, null, 2);
}

export function createLabScrollController(scrollRoot, onProgress) {
  if (!scrollRoot) return null;
  const trigger = ScrollTrigger.create({
    trigger: scrollRoot,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => onProgress(self.progress),
  });
  return trigger;
}
