// Pure geometry engine for /line-lab: three immutable, vertically-monotone
// "gravity" routes living in a tall world space, observed through a camera
// (SVG viewBox) that follows the falling head. Body coordinates never move.
import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = 7000;

export const SAMPLES_PER_SEGMENT = 100;

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

// Shared Y anchors (world units, strictly increasing) and per-line X dance.
export const WORLD_Y = [-250, 280, 820, 1360, 1900, 2440, 2980, 3520, 4060, 4600, 5140, 5680, 6220, 6760];

const OUTER_X = [780, 390, 820, 1080, 680, 210, -150, 310, 870, 1140, 720, 240, 470, 760];
const MIDDLE_X = [730, 440, 770, 1020, 630, 260, -90, 360, 810, 1080, 660, 290, 520, 710];
const INNER_X = [680, 490, 720, 960, 580, 310, -30, 410, 750, 1020, 600, 340, 570, 660];

export const MASTER_ANCHORS = {
  outer: WORLD_Y.map((y, index) => [OUTER_X[index], y]),
  middle: WORLD_Y.map((y, index) => [MIDDLE_X[index], y]),
  inner: WORLD_Y.map((y, index) => [INNER_X[index], y]),
};

const TANGENT_FACTOR = 0.42;
const CP1_DY_FRACTION = 0.32;
const CP2_DY_FRACTION = 0.68;
const X_CLAMP_MIN = -220;
const X_CLAMP_MAX = 1220;
const Y_MONOTONIC_TOLERANCE = 0.000001;

export const HEAD_PROGRESS_END = 0.9;
export const EXIT_START = 0.9;

export const HEAD_Y_OFFSET = { outer: 0, middle: 28, inner: 56 };
export const BODY_HEIGHT = { outer: 1500, middle: 1420, inner: 1340 };

export const CAMERA_FOLLOW_SCREEN_Y = 620;
export const CAMERA_MIN = 0;
export const CAMERA_MAX = WORLD_HEIGHT - VIEWPORT_HEIGHT;

export const CHECKPOINTS = [
  { id: 'P0', progress: 0.0 },
  { id: 'P1', progress: 0.08 },
  { id: 'P2', progress: 0.18 },
  { id: 'P3', progress: 0.3 },
  { id: 'P4', progress: 0.42 },
  { id: 'P5', progress: 0.56 },
  { id: 'P6', progress: 0.7 },
  { id: 'P7', progress: 0.84 },
  { id: 'P8', progress: 0.92 },
  { id: 'P9', progress: 1.0 },
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampX(x) {
  return clamp(x, X_CLAMP_MIN, X_CLAMP_MAX);
}

// Horizontal tangents only — Y offsets are derived per-segment from dy, never from a tangent.
function buildTangentsX(xs) {
  const n = xs.length;
  const tangents = new Array(n);
  for (let i = 0; i < n; i += 1) {
    if (i === 0) tangents[i] = (xs[1] - xs[0]) * TANGENT_FACTOR;
    else if (i === n - 1) tangents[i] = (xs[i] - xs[i - 1]) * TANGENT_FACTOR;
    else tangents[i] = (xs[i + 1] - xs[i - 1]) * TANGENT_FACTOR;
  }
  return tangents;
}

// Builds 13 cubic segments from 14 anchors, guaranteeing p0.y < cp1.y < cp2.y < p3.y.
function buildSegmentsFromAnchors(anchors) {
  const xs = anchors.map((point) => point[0]);
  const tangentX = buildTangentsX(xs);
  const segments = [];
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const p0 = anchors[i];
    const p3 = anchors[i + 1];
    const dy = p3[1] - p0[1];
    const cp1 = [clampX(p0[0] + tangentX[i] / 3), p0[1] + dy * CP1_DY_FRACTION];
    const cp2 = [clampX(p3[0] - tangentX[i + 1] / 3), p0[1] + dy * CP2_DY_FRACTION];
    segments.push({ cp1, cp2, end: p3 });
  }
  return segments;
}

export const MASTER_ROUTES = LINE_KEYS.reduce((acc, key) => {
  const anchors = MASTER_ANCHORS[key];
  acc[key] = { start: anchors[0], segments: buildSegmentsFromAnchors(anchors) };
  return acc;
}, {});

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

// Static world-space path string. Depends only on the route's own anchors —
// never on progress — so it must be identical for any progress.
export function buildMasterPathD(route) {
  let d = `M ${round(route.start[0])} ${round(route.start[1])}`;
  route.segments.forEach((segment) => {
    d += ` C ${round(segment.cp1[0])} ${round(segment.cp1[1])}, ${round(segment.cp2[0])} ${round(segment.cp2[1])}, ${round(segment.end[0])} ${round(segment.end[1])}`;
  });
  return d;
}

// One-time geometric sampling: ~100 points per segment, cumulative arc-length
// distance, and normalized distance for arc-length-based u lookups.
function computeRouteSamples(route, lineKey) {
  const points = [];
  let prevAnchor = route.start;
  route.segments.forEach((segment) => {
    for (let i = 0; i < SAMPLES_PER_SEGMENT; i += 1) {
      const t = i / (SAMPLES_PER_SEGMENT - 1);
      points.push(cubicBezierPoint(prevAnchor, segment.cp1, segment.cp2, segment.end, t));
    }
    prevAnchor = segment.end;
  });

  if (process.env.NODE_ENV !== 'production') {
    for (let i = 1; i < points.length; i += 1) {
      if (points[i][1] < points[i - 1][1] - Y_MONOTONIC_TOLERANCE) {
        console.warn(
          `[line-lab] ruta "${lineKey}" no es verticalmente monótona en la muestra ${i} (y=${points[i][1]} < y anterior=${points[i - 1][1]}).`
        );
      }
    }
  }

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
  acc[key] = computeRouteSamples(MASTER_ROUTES[key], key);
  return acc;
}, {});

export const MASTER_PATH_D = LINE_KEYS.reduce((acc, key) => {
  acc[key] = buildMasterPathD(MASTER_ROUTES[key]);
  return acc;
}, {});

// Exact coordinate for a normalized arc-length position u (0..1), via binary
// search over precomputed normalized distances.
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

// Since Y is monotonic non-decreasing across all samples, a target world Y
// can be located with a binary search directly on Y instead of arc-length.
export function pointAtWorldY(routeSamples, targetWorldY) {
  const { points, distances, normalizedDistance } = routeSamples;
  const n = points.length;
  const clampedY = clamp(targetWorldY, points[0][1], points[n - 1][1]);

  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid][1] < clampedY) lo = mid + 1;
    else hi = mid;
  }

  const upperIndex = lo;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const y0 = points[lowerIndex][1];
  const y1 = points[upperIndex][1];
  const span = y1 - y0;
  const t = span > 0 ? (clampedY - y0) / span : 0;

  const x0 = points[lowerIndex][0];
  const x1 = points[upperIndex][0];
  const x = x0 + (x1 - x0) * t;

  const routeU = normalizedDistance[lowerIndex] + (normalizedDistance[upperIndex] - normalizedDistance[lowerIndex]) * t;
  const cumulativeDistance = distances[lowerIndex] + (distances[upperIndex] - distances[lowerIndex]) * t;

  return { point: [x, clampedY], routeU, cumulativeDistance };
}

export function routeUAtWorldY(routeSamples, targetWorldY) {
  return pointAtWorldY(routeSamples, targetWorldY).routeU;
}

// Builds the visible [tailU, headU] window as a polyline over the route's own
// immutable samples — every point comes from the master route's sample set.
export function sliceRoute(routeSamples, tailU, headU) {
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
  let d = `M ${round(orderedPoints[0][0])} ${round(orderedPoints[0][1])}`;
  for (let i = 1; i < orderedPoints.length; i += 1) {
    d += ` L ${round(orderedPoints[i][0])} ${round(orderedPoints[i][1])}`;
  }
  return d;
}

// Head advances linearly in world Y across [WORLD_Y[0], WORLD_Y[last]] until
// HEAD_PROGRESS_END, with a small per-line vertical offset (never a direction change).
export function resolveHeadWorldY(progress, lineKey) {
  const headProgress = clamp(progress / HEAD_PROGRESS_END, 0, 1);
  const base = lerp(WORLD_Y[0], WORLD_Y[WORLD_Y.length - 1], headProgress);
  return base - HEAD_Y_OFFSET[lineKey];
}

// Tail trails the head by a roughly constant world-height body length, then
// during the exit phase races toward the route's end so the line shortens away.
export function resolveTailWorldY(progress, headWorldY, lineKey) {
  const baseTailWorldY = headWorldY - BODY_HEIGHT[lineKey];
  const exitT = clamp((progress - EXIT_START) / (1 - EXIT_START), 0, 1);
  const lastWorldY = WORLD_Y[WORLD_Y.length - 1] + 80;
  const tailWorldY = lerp(baseTailWorldY, lastWorldY, exitT);
  return Math.min(tailWorldY, headWorldY);
}

// Pure function of progress only (uses the reference "outer" line) — the
// camera that all three lines and the SVG viewBox share.
export function resolveCameraTop(progress) {
  const headWorldY = resolveHeadWorldY(progress, 'outer');
  return clamp(headWorldY - CAMERA_FOLLOW_SCREEN_Y, CAMERA_MIN, CAMERA_MAX);
}

// Full per-line state for one progress value: head/tail world Y, u values,
// world points, and the visible trail path.
export function resolveLineState(progress, lineKey) {
  const samples = ROUTE_SAMPLES[lineKey];

  const headWorldYTarget = resolveHeadWorldY(progress, lineKey);
  const headResult = pointAtWorldY(samples, headWorldYTarget);
  const headU = headResult.routeU;
  const headPoint = headResult.point;

  const tailWorldYTarget = resolveTailWorldY(progress, headPoint[1], lineKey);
  const tailResult = pointAtWorldY(samples, tailWorldYTarget);
  const tailU = Math.min(tailResult.routeU, headU);
  const tailPoint = pointAtRouteU(samples, tailU);

  const trailD = sliceRoute(samples, tailU, headU);

  return {
    headU,
    tailU,
    headPoint,
    tailPoint,
    trailD,
    headWorldY: headPoint[1],
    tailWorldY: tailPoint[1],
  };
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
