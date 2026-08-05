import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = 7000;
export const SAFE_X_MIN = 70;
export const SAFE_X_MAX = 930;

export const SAMPLES_PER_SEGMENT = 100;
export const ACTIVE_WORLD_HEIGHT = 840;

export const LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.18)', width: 1.15 },
  middle: { color: 'rgba(200, 198, 202, 0.14)', width: 1 },
  inner: { color: 'rgba(214, 211, 214, 0.10)', width: 0.9 },
};

export const HISTORY_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.07)', width: 0.85 },
  middle: { color: 'rgba(200, 198, 202, 0.055)', width: 0.8 },
  inner: { color: 'rgba(214, 211, 214, 0.045)', width: 0.75 },
};

export const ACTIVE_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.16)', width: 1.05 },
  middle: { color: 'rgba(137, 161, 188, 0.17)', width: 1 },
  inner: { color: 'rgba(214, 211, 214, 0.12)', width: 0.95 },
};

export const NODE_COLOR = 'rgba(242, 239, 232, 1)';

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
  { progress: 0.0, x: 640 },
  { progress: 0.08, x: 640 },
  { progress: 0.18, x: 620 },
  { progress: 0.3, x: 560 },
  { progress: 0.42, x: 550 },
  { progress: 0.56, x: 760 },
  { progress: 0.7, x: 620 },
  { progress: 0.84, x: 530 },
  { progress: 0.9, x: 740 },
  { progress: 0.96, x: 560 },
];

export const HOME_LINE_COMPOSITION_DESKTOP = [
  { progress: 0.0, section: 'pre-roll', x: 760, headScreenY: 720 },
  { progress: 0.08, section: 'metrics', x: 760, headScreenY: 720 },
  { progress: 0.18, section: 'partners', x: 700, headScreenY: 730 },
  { progress: 0.3, section: 'solutions', x: 500, headScreenY: 735 },
  { progress: 0.42, section: 'why-us', x: 520, headScreenY: 740 },
  { progress: 0.56, section: 'process', x: 845, headScreenY: 750 },
  { progress: 0.7, section: 'regulation', x: 610, headScreenY: 720 },
  { progress: 0.84, section: 'team', x: 500, headScreenY: 720 },
  { progress: 0.9, section: 'referrals-waypoint', x: 820, headScreenY: 680 },
  { progress: 0.96, section: 'contact', x: 540, headScreenY: 760 },
  { progress: 1, section: 'contact-end', x: 540, headScreenY: 760 },
];

export const HOME_LINE_COMPOSITION_TABLET = [
  { progress: 0.0, section: 'pre-roll', x: 730, headScreenY: 705 },
  { progress: 0.08, section: 'metrics', x: 730, headScreenY: 710 },
  { progress: 0.18, section: 'partners', x: 675, headScreenY: 718 },
  { progress: 0.3, section: 'solutions', x: 520, headScreenY: 724 },
  { progress: 0.42, section: 'why-us', x: 540, headScreenY: 728 },
  { progress: 0.56, section: 'process', x: 785, headScreenY: 736 },
  { progress: 0.7, section: 'regulation', x: 610, headScreenY: 714 },
  { progress: 0.84, section: 'team', x: 520, headScreenY: 710 },
  { progress: 0.9, section: 'referrals-waypoint', x: 760, headScreenY: 690 },
  { progress: 0.96, section: 'contact', x: 550, headScreenY: 742 },
  { progress: 1, section: 'contact-end', x: 550, headScreenY: 742 },
];

export const HOME_LINE_COMPOSITION_MOBILE = [
  { progress: 0.0, section: 'pre-roll', x: 820, headScreenY: 690 },
  { progress: 0.08, section: 'metrics', x: 810, headScreenY: 692 },
  { progress: 0.18, section: 'partners', x: 780, headScreenY: 696 },
  { progress: 0.3, section: 'solutions', x: 760, headScreenY: 702 },
  { progress: 0.42, section: 'why-us', x: 735, headScreenY: 706 },
  { progress: 0.56, section: 'process', x: 865, headScreenY: 712 },
  { progress: 0.7, section: 'regulation', x: 770, headScreenY: 698 },
  { progress: 0.84, section: 'team', x: 725, headScreenY: 694 },
  { progress: 0.9, section: 'referrals-waypoint', x: 850, headScreenY: 674 },
  { progress: 0.96, section: 'contact', x: 740, headScreenY: 720 },
  { progress: 1, section: 'contact-end', x: 740, headScreenY: 720 },
];

const LAB_LINE_COMPOSITION = [
  { progress: 0.0, section: 'pre-roll', x: 640, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.08, section: 'metrics', x: 640, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.18, section: 'partners', x: 620, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.3, section: 'solutions', x: 560, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.42, section: 'why-us', x: 550, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.56, section: 'process', x: 760, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.7, section: 'regulation', x: 620, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.84, section: 'team', x: 530, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.9, section: 'referrals-waypoint', x: 740, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 0.96, section: 'contact', x: 560, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
  { progress: 1, section: 'contact-end', x: 560, headScreenY: CAMERA_FOLLOW_SCREEN_Y },
];

const INTERVAL_DANCE_DESKTOP = [
  { aFraction: 0.33, bFraction: 0.68, aOffset: 10, bOffset: -6, maxSpread: 106 },
  { aFraction: 0.31, bFraction: 0.67, aOffset: -42, bOffset: -12, maxSpread: 110 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -30, bOffset: 24, maxSpread: 98 },
  { aFraction: 0.34, bFraction: 0.69, aOffset: 36, bOffset: 52, maxSpread: 114 },
  { aFraction: 0.3, bFraction: 0.67, aOffset: 22, bOffset: -46, maxSpread: 122 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -26, bOffset: -14, maxSpread: 96 },
  { aFraction: 0.31, bFraction: 0.7, aOffset: 92, bOffset: 148, maxSpread: 108 },
  { aFraction: 0.33, bFraction: 0.69, aOffset: 80, bOffset: -68, maxSpread: 118 },
  { aFraction: 0.3, bFraction: 0.66, aOffset: -48, bOffset: -82, maxSpread: 94 },
];

const INTERVAL_DANCE_TABLET = [
  { aFraction: 0.33, bFraction: 0.68, aOffset: 12, bOffset: -8, maxSpread: 96 },
  { aFraction: 0.31, bFraction: 0.67, aOffset: -36, bOffset: -8, maxSpread: 100 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -24, bOffset: 20, maxSpread: 88 },
  { aFraction: 0.34, bFraction: 0.69, aOffset: 26, bOffset: 40, maxSpread: 102 },
  { aFraction: 0.3, bFraction: 0.67, aOffset: 18, bOffset: -34, maxSpread: 110 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -18, bOffset: -10, maxSpread: 90 },
  { aFraction: 0.31, bFraction: 0.7, aOffset: 76, bOffset: 120, maxSpread: 98 },
  { aFraction: 0.33, bFraction: 0.69, aOffset: 66, bOffset: -52, maxSpread: 104 },
  { aFraction: 0.3, bFraction: 0.66, aOffset: -38, bOffset: -64, maxSpread: 84 },
];

const INTERVAL_DANCE_MOBILE = [
  { aFraction: 0.33, bFraction: 0.68, aOffset: 8, bOffset: -6, maxSpread: 82 },
  { aFraction: 0.31, bFraction: 0.67, aOffset: -24, bOffset: -6, maxSpread: 86 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -14, bOffset: 14, maxSpread: 74 },
  { aFraction: 0.34, bFraction: 0.69, aOffset: 20, bOffset: 28, maxSpread: 90 },
  { aFraction: 0.3, bFraction: 0.67, aOffset: 12, bOffset: -26, maxSpread: 94 },
  { aFraction: 0.32, bFraction: 0.68, aOffset: -12, bOffset: -8, maxSpread: 76 },
  { aFraction: 0.31, bFraction: 0.7, aOffset: 62, bOffset: 98, maxSpread: 86 },
  { aFraction: 0.33, bFraction: 0.69, aOffset: 52, bOffset: -42, maxSpread: 92 },
  { aFraction: 0.3, bFraction: 0.66, aOffset: -30, bOffset: -52, maxSpread: 72 },
];

export const INTERVAL_DANCE = INTERVAL_DANCE_DESKTOP;

const ROUTE_CHARACTER = {
  outer: { tangentFactor: 0.38, cp1Fraction: 0.3, cp2Fraction: 0.7 },
  middle: { tangentFactor: 0.36, cp1Fraction: 0.31, cp2Fraction: 0.69 },
  inner: { tangentFactor: 0.37, cp1Fraction: 0.3, cp2Fraction: 0.7 },
};

const PROFILE_ROUTE_CACHE = new Map();

const LANE_FACTORS = {
  outer: { factor: 0.52, bias: 0 },
  middle: { factor: 0, bias: 0 },
  inner: { factor: 0.5, bias: 0 },
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

export function worldYToProgress(worldY) {
  const startY = -250;
  const endY = 6760;
  const t = clamp((worldY - startY) / (endY - startY), 0, 1);
  return t * HEAD_PROGRESS_END;
}

function resolveProfileKey(inputProfileKey = 'lab') {
  if (inputProfileKey === 'desktop' || inputProfileKey === 'tablet' || inputProfileKey === 'mobile' || inputProfileKey === 'lab') {
    return inputProfileKey;
  }
  return 'lab';
}

function getHomeComposition(profileKey) {
  if (profileKey === 'mobile') return HOME_LINE_COMPOSITION_MOBILE;
  if (profileKey === 'tablet') return HOME_LINE_COMPOSITION_TABLET;
  if (profileKey === 'desktop') return HOME_LINE_COMPOSITION_DESKTOP;
  return LAB_LINE_COMPOSITION;
}

function getIntervalDance(profileKey) {
  if (profileKey === 'mobile') return INTERVAL_DANCE_MOBILE;
  if (profileKey === 'tablet') return INTERVAL_DANCE_TABLET;
  return INTERVAL_DANCE_DESKTOP;
}

function getConvergencePoints(profileKey) {
  const composition = getHomeComposition(profileKey);
  return composition.filter((point) => point.progress <= HEAD_PROGRESS_END);
}

export function resolveHomeHeadScreenY(progress, profileKey = 'desktop') {
  const profile = resolveProfileKey(profileKey);
  const points = getHomeComposition(profile === 'lab' ? 'desktop' : profile);
  const p = clamp(progress, 0, 1);

  if (p <= points[0].progress) return points[0].headScreenY;
  if (p >= points[points.length - 1].progress) return points[points.length - 1].headScreenY;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    if (p > next.progress) continue;
    const span = next.progress - prev.progress;
    if (span <= 0) return prev.headScreenY;
    const t = (p - prev.progress) / span;
    return lerp(prev.headScreenY, next.headScreenY, t);
  }

  return points[points.length - 1].headScreenY;
}

function spreadAtProgress(progress, interval) {
  const start = interval.startProgress;
  const end = interval.endProgress;
  const local = clamp((progress - start) / Math.max(end - start, 0.000001), 0, 1);
  const envelope = Math.pow(Math.sin(Math.PI * local), 1.15);
  return interval.minimumSpread + envelope * interval.maximumSpread;
}

function lanePointFromCenter(centerX, progress, interval, lineKey) {
  const spread = spreadAtProgress(progress, interval);
  const lane = LANE_FACTORS[lineKey];

  const outerX = centerX - spread * LANE_FACTORS.outer.factor;
  const innerX = centerX + spread * LANE_FACTORS.inner.factor;

  if (lineKey === 'outer') return clampX(outerX + lane.bias);
  if (lineKey === 'inner') return clampX(innerX + lane.bias);

  const middleRaw = centerX + interval.middleBias + lane.bias;
  return clampX(clamp(middleRaw, outerX, innerX));
}

export function buildBundleAnchors(lineKey, profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);
  const convergencePoints = getConvergencePoints(profile);
  const dances = getIntervalDance(profile);
  const anchors = [];
  anchors.push([clampX(convergencePoints[0].x), progressToWorldY(convergencePoints[0].progress)]);

  for (let i = 0; i < convergencePoints.length - 1; i += 1) {
    const startBeat = convergencePoints[i];
    const endBeat = convergencePoints[i + 1];
    const dance = dances[i];
    const startY = progressToWorldY(startBeat.progress);
    const endY = progressToWorldY(endBeat.progress);

    const intervalMeta = {
      startProgress: startBeat.progress,
      endProgress: endBeat.progress,
      minimumSpread: 0,
      maximumSpread: Math.min(135, dance.maxSpread),
      middleBias: clamp(dance.middleBias ?? 0, -4, 4),
    };

    const aProgress = lerp(startBeat.progress, endBeat.progress, dance.aFraction);
    const bProgress = lerp(startBeat.progress, endBeat.progress, dance.bFraction);
    const aCenterX = lerp(startBeat.x, endBeat.x, dance.aFraction) + dance.aOffset;
    const bCenterX = lerp(startBeat.x, endBeat.x, dance.bFraction) + dance.bOffset;

    const aX = lanePointFromCenter(clampX(aCenterX), aProgress, intervalMeta, lineKey);
    const bX = lanePointFromCenter(clampX(bCenterX), bProgress, intervalMeta, lineKey);

    anchors.push([aX, lerp(startY, endY, dance.aFraction)]);
    anchors.push([bX, lerp(startY, endY, dance.bFraction)]);
    anchors.push([clampX(endBeat.x), endY]);
  }

  return anchors;
}

export const buildDanceAnchors = buildBundleAnchors;

function buildProfileData(profileKey) {
  const anchors = {
    outer: buildBundleAnchors('outer', profileKey),
    middle: buildBundleAnchors('middle', profileKey),
    inner: buildBundleAnchors('inner', profileKey),
  };

  const routes = LINE_KEYS.reduce((acc, key) => {
    acc[key] = { start: anchors[key][0], segments: buildSegmentsFromAnchors(anchors[key], key) };
    return acc;
  }, {});

  const samples = LINE_KEYS.reduce((acc, key) => {
    acc[key] = computeRouteSamples(routes[key], key);
    return acc;
  }, {});

  const pathD = LINE_KEYS.reduce((acc, key) => {
    acc[key] = buildMasterPathD(routes[key]);
    return acc;
  }, {});

  return { anchors, routes, samples, pathD };
}

function getProfileData(profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);
  if (!PROFILE_ROUTE_CACHE.has(profile)) {
    PROFILE_ROUTE_CACHE.set(profile, buildProfileData(profile));
  }
  return PROFILE_ROUTE_CACHE.get(profile);
}

export function getProfileRouteSamples(profileKey = 'lab', lineKey = null) {
  const samples = getProfileData(profileKey).samples;
  return lineKey ? samples[lineKey] : samples;
}

const LAB_PROFILE_DATA = getProfileData('lab');

export const MASTER_ANCHORS = LAB_PROFILE_DATA.anchors;

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

export const MASTER_ROUTES = LAB_PROFILE_DATA.routes;

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

export const ROUTE_SAMPLES = LAB_PROFILE_DATA.samples;

export const MASTER_PATH_D = LAB_PROFILE_DATA.pathD;

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

export function resolveCameraTop(progress, options = {}) {
  const outerHeadWorldY = resolveHeadWorldY(progress);
  const desiredHeadScreenY = options.desiredHeadScreenY
    ?? (options.mode === 'home' ? resolveHomeHeadScreenY(progress, options.profileKey || 'desktop') : CAMERA_FOLLOW_SCREEN_Y);
  return clamp(outerHeadWorldY - desiredHeadScreenY, CAMERA_MIN, CAMERA_MAX);
}

export function resolveLineState(progress, lineKey, options = {}) {
  const profileKey = resolveProfileKey(options.profileKey || 'lab');
  const profileData = getProfileData(profileKey);
  const samples = profileData.samples[lineKey];
  const headWorldYTarget = resolveHeadWorldY(progress);
  const headResult = pointAtWorldY(samples, headWorldYTarget);
  const headU = headResult.routeU;
  const headPoint = headResult.point;

  const tailU = 0;
  const tailPoint = pointAtRouteU(samples, tailU);
  const historyTrailD = sliceRoute(samples, tailU, headU);
  const trailPointCount = countTrailPoints(samples, tailU, headU);

  const routeStartWorldY = samples.points[0][1];
  const activeWorldHeight = options.activeWorldHeight ?? ACTIVE_WORLD_HEIGHT;
  const activeStartWorldY = Math.max(routeStartWorldY, headPoint[1] - activeWorldHeight);
  const activeStartResult = pointAtWorldY(samples, activeStartWorldY);
  const activeStartU = Math.min(activeStartResult.routeU, headU);
  const activeTrailD = sliceRoute(samples, activeStartU, headU);
  const activeTrailPointCount = countTrailPoints(samples, activeStartU, headU);

  return {
    headU,
    tailU,
    headPoint,
    tailPoint,
    trailD: historyTrailD,
    historyTrailD,
    activeTrailD,
    activeStartU,
    trailPointCount,
    activeTrailPointCount,
    routeStartWorldY,
    activeStartWorldY,
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

export function routesToJson(routes = MASTER_ROUTES, profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);
  const payload = routes === MASTER_ROUTES ? getProfileData(profile).routes : routes;
  return JSON.stringify(payload, null, 2);
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
