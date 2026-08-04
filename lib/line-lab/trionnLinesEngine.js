import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = 7000;
export const SAFE_X_MIN = 70;
export const SAFE_X_MAX = 930;

export const SAMPLES_PER_SEGMENT = 100;

export const LINE_STYLE = {
  outer: { color: 'rgba(128, 151, 178, 0.22)', width: 1.15 },
  middle: { color: 'rgba(137, 161, 188, 0.16)', width: 1 },
  inner: { color: 'rgba(151, 172, 195, 0.11)', width: 0.9 },
};

export const NODE_COLOR = 'rgba(214, 227, 242, 1)';

export const MASTER_ROUTE_COLOR = 'rgba(205, 216, 232, 1)';
export const MASTER_ROUTE_OPACITY = 0.08;

export const HEAD_PROGRESS_END = 0.96;
export const HEAD_Y_OFFSET = { outer: 0, middle: 0, inner: 0 };

export const CAMERA_FOLLOW_SCREEN_Y = 620;
export const CAMERA_MIN = 0;
export const CAMERA_MAX = WORLD_HEIGHT - VIEWPORT_HEIGHT;

export const MERGE_CORE_RADIUS = 0.008;
export const MERGE_RECOVERY_RADIUS = 0.045;

export const CHECKPOINTS = [
  { id: 'P0', progress: 0.0 },
  { id: 'P1', progress: 0.08 },
  { id: 'P2', progress: 0.18 },
  { id: 'P3', progress: 0.3 },
  { id: 'P4', progress: 0.42 },
  { id: 'P5', progress: 0.56 },
  { id: 'P6', progress: 0.7 },
  { id: 'P7', progress: 0.84 },
  { id: 'P8', progress: 0.96 },
  { id: 'P9', progress: 1.0 },
];

export const CONVERGENCE_BEATS = [
  { progress: 0.0, x: 620 },
  { progress: 0.08, x: 690 },
  { progress: 0.18, x: 520 },
  { progress: 0.3, x: 640 },
  { progress: 0.42, x: 460 },
  { progress: 0.56, x: 650 },
  { progress: 0.7, x: 500 },
  { progress: 0.84, x: 630 },
  { progress: 0.96, x: 540 },
];

export const INTERVAL_DANCE = [
  { midFraction: 0.48, centerX: 575, halfSpread: 52, outerFactor: 1.0, innerFactor: 0.84, middleBias: -2 },
  { midFraction: 0.52, centerX: 645, halfSpread: 68, outerFactor: 0.88, innerFactor: 1.04, middleBias: 4 },
  { midFraction: 0.46, centerX: 475, halfSpread: 58, outerFactor: 1.05, innerFactor: 0.9, middleBias: -3 },
  { midFraction: 0.54, centerX: 595, halfSpread: 72, outerFactor: 0.92, innerFactor: 1.08, middleBias: 5 },
  { midFraction: 0.47, centerX: 415, halfSpread: 54, outerFactor: 1.08, innerFactor: 0.88, middleBias: -4 },
  { midFraction: 0.53, centerX: 605, halfSpread: 66, outerFactor: 0.9, innerFactor: 1.03, middleBias: 3 },
  { midFraction: 0.46, centerX: 455, halfSpread: 58, outerFactor: 1.02, innerFactor: 0.92, middleBias: -2 },
  { midFraction: 0.52, centerX: 585, halfSpread: 62, outerFactor: 0.94, innerFactor: 1.05, middleBias: 3 },
];

const ROUTE_CHARACTER = {
  outer: { tangentFactor: 0.38, cp1Fraction: 0.3, cp2Fraction: 0.7 },
  middle: { tangentFactor: 0.36, cp1Fraction: 0.31, cp2Fraction: 0.69 },
  inner: { tangentFactor: 0.37, cp1Fraction: 0.3, cp2Fraction: 0.7 },
};

const Y_MONOTONIC_TOLERANCE = 0.000001;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampX(x) {
  return clamp(x, SAFE_X_MIN, SAFE_X_MAX);
}

export function progressToWorldY(progress) {
  const startY = -250;
  const endY = 6760;
  const normalized = clamp(progress / HEAD_PROGRESS_END, 0, 1);
  return lerp(startY, endY, normalized);
}

export function buildBundleAnchors(lineKey) {
  const anchors = [];
  anchors.push([clampX(CONVERGENCE_BEATS[0].x), progressToWorldY(CONVERGENCE_BEATS[0].progress)]);

  for (let i = 0; i < CONVERGENCE_BEATS.length - 1; i += 1) {
    const startBeat = CONVERGENCE_BEATS[i];
    const endBeat = CONVERGENCE_BEATS[i + 1];
    const dance = INTERVAL_DANCE[i];
    const startY = progressToWorldY(startBeat.progress);
    const endY = progressToWorldY(endBeat.progress);
    const midY = lerp(startY, endY, dance.midFraction);

    const outerX = dance.centerX - dance.halfSpread * dance.outerFactor;
    const middleX = dance.centerX + dance.middleBias;
    const innerX = dance.centerX + dance.halfSpread * dance.innerFactor;

    const midXByLine = {
      outer: outerX,
      middle: middleX,
      inner: innerX,
    };

    anchors.push([clampX(midXByLine[lineKey]), midY]);
    anchors.push([clampX(endBeat.x), endY]);
  }

  return anchors;
}

export const buildDanceAnchors = buildBundleAnchors;

export const MASTER_ANCHORS = {
  outer: buildBundleAnchors('outer'),
  middle: buildBundleAnchors('middle'),
  inner: buildBundleAnchors('inner'),
};

function buildTangentsX(xs, tangentFactor) {
  const n = xs.length;
  const tangents = new Array(n);
  for (let i = 0; i < n; i += 1) {
    if (i === 0) tangents[i] = (xs[1] - xs[0]) * tangentFactor;
    else if (i === n - 1) tangents[i] = (xs[i] - xs[i - 1]) * tangentFactor;
    else tangents[i] = (xs[i + 1] - xs[i - 1]) * tangentFactor;
  }
  return tangents;
}

function buildSegmentsFromAnchors(anchors, lineKey) {
  const character = ROUTE_CHARACTER[lineKey];
  const xs = anchors.map((point) => point[0]);
  const tangentX = buildTangentsX(xs, character.tangentFactor);
  const segments = [];

  for (let i = 0; i < anchors.length - 1; i += 1) {
    const p0 = anchors[i];
    const p3 = anchors[i + 1];
    const dy = p3[1] - p0[1];
    const cp1 = [clampX(p0[0] + tangentX[i] / 3), p0[1] + dy * character.cp1Fraction];
    const cp2 = [clampX(p3[0] - tangentX[i + 1] / 3), p0[1] + dy * character.cp2Fraction];
    segments.push({ cp1, cp2, end: p3 });
  }

  return segments;
}

export const MASTER_ROUTES = LINE_KEYS.reduce((acc, key) => {
  const anchors = MASTER_ANCHORS[key];
  acc[key] = { start: anchors[0], segments: buildSegmentsFromAnchors(anchors, key) };
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

export function buildMasterPathD(route) {
  let d = `M ${round(route.start[0])} ${round(route.start[1])}`;
  route.segments.forEach((segment) => {
    d += ` C ${round(segment.cp1[0])} ${round(segment.cp1[1])}, ${round(segment.cp2[0])} ${round(segment.cp2[1])}, ${round(segment.end[0])} ${round(segment.end[1])}`;
  });
  return d;
}

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
    for (let i = 0; i < points.length; i += 1) {
      if (points[i][0] < SAFE_X_MIN - Y_MONOTONIC_TOLERANCE || points[i][0] > SAFE_X_MAX + Y_MONOTONIC_TOLERANCE) {
        console.warn(`[line-lab] ruta "${lineKey}" sale de SAFE_X en muestra ${i} (x=${points[i][0]}).`);
      }
      if (i > 0 && points[i][1] < points[i - 1][1] - Y_MONOTONIC_TOLERANCE) {
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

export const ROUTE_SAMPLES = LINE_KEYS.reduce((acc, key) => {
  acc[key] = computeRouteSamples(MASTER_ROUTES[key], key);
  return acc;
}, {});

export const MASTER_PATH_D = LINE_KEYS.reduce((acc, key) => {
  acc[key] = buildMasterPathD(MASTER_ROUTES[key]);
  return acc;
}, {});

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

export function countTrailPoints(routeSamples, tailU, headU) {
  const { normalizedDistance } = routeSamples;
  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);
  let middleCount = 0;
  for (let i = 0; i < normalizedDistance.length; i += 1) {
    if (normalizedDistance[i] > from && normalizedDistance[i] < to) middleCount += 1;
  }
  return middleCount + 2;
}

export function resolveHeadWorldY(progress) {
  const headProgress = clamp(progress / HEAD_PROGRESS_END, 0, 1);
  return progressToWorldY(headProgress * HEAD_PROGRESS_END);
}

export function resolveCameraTop(progress) {
  const outerHeadWorldY = resolveHeadWorldY(progress);
  return clamp(outerHeadWorldY - CAMERA_FOLLOW_SCREEN_Y, CAMERA_MIN, CAMERA_MAX);
}

export function resolveLineState(progress, lineKey) {
  const samples = ROUTE_SAMPLES[lineKey];
  const headWorldYTarget = resolveHeadWorldY(progress);
  const headResult = pointAtWorldY(samples, headWorldYTarget);
  const headU = headResult.routeU;
  const headPoint = headResult.point;

  const tailU = 0;
  const tailPoint = pointAtRouteU(samples, tailU);
  const trailD = sliceRoute(samples, tailU, headU);
  const trailPointCount = countTrailPoints(samples, tailU, headU);

  return {
    headU,
    tailU,
    headPoint,
    tailPoint,
    trailD,
    trailPointCount,
    headWorldY: headPoint[1],
    tailWorldY: tailPoint[1],
  };
}

export function resolveConvergenceState(progress) {
  const finalConvergenceProgress = CONVERGENCE_BEATS[CONVERGENCE_BEATS.length - 1].progress;
  if (progress >= finalConvergenceProgress) {
    return {
      nearestProgress: finalConvergenceProgress,
      distance: 0,
      mergeAmount: 1,
      isFullyMerged: true,
    };
  }

  let nearest = CONVERGENCE_BEATS[0];
  let minDistance = Math.abs(progress - nearest.progress);
  for (let i = 1; i < CONVERGENCE_BEATS.length; i += 1) {
    const d = Math.abs(progress - CONVERGENCE_BEATS[i].progress);
    if (d < minDistance) {
      minDistance = d;
      nearest = CONVERGENCE_BEATS[i];
    }
  }

  let mergeAmount;
  if (minDistance <= MERGE_CORE_RADIUS) mergeAmount = 1;
  else if (minDistance >= MERGE_RECOVERY_RADIUS) mergeAmount = 0;
  else mergeAmount = 1 - smoothstep(MERGE_CORE_RADIUS, MERGE_RECOVERY_RADIUS, minDistance);

  return {
    nearestProgress: nearest.progress,
    distance: minDistance,
    mergeAmount,
    isFullyMerged: mergeAmount >= 0.999,
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
