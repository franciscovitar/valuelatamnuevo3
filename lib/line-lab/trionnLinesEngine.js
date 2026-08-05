import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = 7000;
export const SAFE_X_MIN = 70;
export const SAFE_X_MAX = 930;

export const SAMPLES_PER_SEGMENT = 240;
export const ACTIVE_WORLD_HEIGHT = 720;

export const LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.10)', width: 0.9 },
  middle: { color: 'rgba(204, 202, 204, 0.14)', width: 1.05 },
  inner: { color: 'rgba(214, 211, 214, 0.07)', width: 0.8 },
};

export const HISTORY_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.042)', width: 0.82 },
  middle: { color: 'rgba(204, 202, 204, 0.055)', width: 0.92 },
  inner: { color: 'rgba(214, 211, 214, 0.032)', width: 0.74 },
};

export const ACTIVE_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.10)', width: 0.92 },
  middle: { color: 'rgba(204, 202, 204, 0.14)', width: 1.08 },
  inner: { color: 'rgba(214, 211, 214, 0.07)', width: 0.82 },
};

export const NODE_COLOR = 'rgba(242, 239, 232, 1)';

export const MASTER_ROUTE_COLOR = 'rgba(204, 202, 204, 1)';
export const MASTER_ROUTE_OPACITY = 0.065;

export const HEAD_PROGRESS_END = 0.96;
export const HEAD_Y_OFFSET = { outer: 0, middle: 0, inner: 0 };

export const CAMERA_FOLLOW_SCREEN_Y = 620;
export const CAMERA_MIN = 0;
export const CAMERA_MAX = WORLD_HEIGHT - VIEWPORT_HEIGHT;

export const MERGE_CORE_RADIUS = 0.008;
export const MERGE_RECOVERY_RADIUS = 0.035;

export const CHECKPOINTS = [
  { id: 'P0', progress: 0.0 },
  { id: 'P1', progress: 0.18 },
  { id: 'P2', progress: 0.42 },
  { id: 'P3', progress: 0.70 },
  { id: 'P4', progress: 0.96 },
  { id: 'P5', progress: 1.0 },
];

export const CONVERGENCE_BEATS = [
  { progress: 0.0, x: 790 },
  { progress: 0.96, x: 530 },
];

export const HOME_LINE_COMPOSITION_DESKTOP = [
  { progress: 0.0, section: 'pre-roll', x: 790, headScreenY: 716 },
  { progress: 0.08, section: 'metrics', x: 762, headScreenY: 722 },
  { progress: 0.18, section: 'partners', x: 720, headScreenY: 728 },
  { progress: 0.30, section: 'solutions', x: 589, headScreenY: 734 },
  { progress: 0.42, section: 'why-us', x: 490, headScreenY: 740 },
  { progress: 0.56, section: 'process', x: 640, headScreenY: 746 },
  { progress: 0.70, section: 'regulation', x: 790, headScreenY: 724 },
  { progress: 0.84, section: 'team', x: 680, headScreenY: 714 },
  { progress: 0.90, section: 'referrals-waypoint', x: 601, headScreenY: 690 },
  { progress: 0.96, section: 'contact', x: 530, headScreenY: 748 },
  { progress: 1.0, section: 'contact-end', x: 530, headScreenY: 748 },
];

export const HOME_LINE_COMPOSITION_TABLET = [
  { progress: 0.0, section: 'pre-roll', x: 760, headScreenY: 704 },
  { progress: 0.08, section: 'metrics', x: 736, headScreenY: 710 },
  { progress: 0.18, section: 'partners', x: 700, headScreenY: 716 },
  { progress: 0.30, section: 'solutions', x: 591, headScreenY: 722 },
  { progress: 0.42, section: 'why-us', x: 510, headScreenY: 728 },
  { progress: 0.56, section: 'process', x: 633, headScreenY: 734 },
  { progress: 0.70, section: 'regulation', x: 755, headScreenY: 712 },
  { progress: 0.84, section: 'team', x: 668, headScreenY: 706 },
  { progress: 0.90, section: 'referrals-waypoint', x: 606, headScreenY: 688 },
  { progress: 0.96, section: 'contact', x: 550, headScreenY: 736 },
  { progress: 1.0, section: 'contact-end', x: 550, headScreenY: 736 },
];

export const HOME_LINE_COMPOSITION_MOBILE = [
  { progress: 0.0, section: 'pre-roll', x: 840, headScreenY: 688 },
  { progress: 0.08, section: 'metrics', x: 825, headScreenY: 692 },
  { progress: 0.18, section: 'partners', x: 805, headScreenY: 696 },
  { progress: 0.30, section: 'solutions', x: 763, headScreenY: 700 },
  { progress: 0.42, section: 'why-us', x: 735, headScreenY: 704 },
  { progress: 0.56, section: 'process', x: 795, headScreenY: 708 },
  { progress: 0.70, section: 'regulation', x: 855, headScreenY: 696 },
  { progress: 0.84, section: 'team', x: 815, headScreenY: 692 },
  { progress: 0.90, section: 'referrals-waypoint', x: 786, headScreenY: 674 },
  { progress: 0.96, section: 'contact', x: 760, headScreenY: 716 },
  { progress: 1.0, section: 'contact-end', x: 760, headScreenY: 716 },
];

const LAB_LINE_COMPOSITION = HOME_LINE_COMPOSITION_DESKTOP.map((point) => ({
  ...point,
  headScreenY: CAMERA_FOLLOW_SCREEN_Y,
}));

const PROFILE_CONFIGS = {
  desktop: {
    center: [
      { progress: 0.0, x: 790 },
      { progress: 0.18, x: 720 },
      { progress: 0.42, x: 490 },
      { progress: 0.70, x: 790 },
      { progress: 0.96, x: 530 },
    ],
    spread: [
      { progress: 0.0, value: 0 },
      { progress: 0.06, value: 30 },
      { progress: 0.18, value: 34 },
      { progress: 0.42, value: 42 },
      { progress: 0.70, value: 44 },
      { progress: 0.86, value: 36 },
      { progress: 0.96, value: 0 },
    ],
  },
  tablet: {
    center: [
      { progress: 0.0, x: 760 },
      { progress: 0.18, x: 700 },
      { progress: 0.42, x: 510 },
      { progress: 0.70, x: 755 },
      { progress: 0.96, x: 550 },
    ],
    spread: [
      { progress: 0.0, value: 0 },
      { progress: 0.06, value: 34 },
      { progress: 0.18, value: 38 },
      { progress: 0.42, value: 44 },
      { progress: 0.70, value: 48 },
      { progress: 0.86, value: 40 },
      { progress: 0.96, value: 0 },
    ],
  },
  mobile: {
    center: [
      { progress: 0.0, x: 840 },
      { progress: 0.18, x: 805 },
      { progress: 0.42, x: 735 },
      { progress: 0.70, x: 855 },
      { progress: 0.96, x: 760 },
    ],
    spread: [
      { progress: 0.0, value: 0 },
      { progress: 0.06, value: 48 },
      { progress: 0.18, value: 54 },
      { progress: 0.42, value: 62 },
      { progress: 0.70, value: 66 },
      { progress: 0.86, value: 54 },
      { progress: 0.96, value: 0 },
    ],
  },
};

PROFILE_CONFIGS.lab = PROFILE_CONFIGS.desktop;

export const INTERVAL_DANCE = [
  { startProgress: 0.0, endProgress: 0.18, maxSpread: 34 },
  { startProgress: 0.18, endProgress: 0.42, maxSpread: 42 },
  { startProgress: 0.42, endProgress: 0.70, maxSpread: 44 },
  { startProgress: 0.70, endProgress: 0.96, maxSpread: 44 },
];

const PROFILE_ROUTE_CACHE = new Map();
const CENTER_SAMPLE_COUNT = 961;
const Y_MONOTONIC_TOLERANCE = 0.000001;
const LANE_MULTIPLIERS = {
  outer: 1,
  middle: 0,
  inner: -1,
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
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
  if (
    inputProfileKey === 'desktop'
    || inputProfileKey === 'tablet'
    || inputProfileKey === 'mobile'
    || inputProfileKey === 'lab'
  ) {
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

export function resolveHomeHeadScreenY(progress, profileKey = 'desktop') {
  const profile = resolveProfileKey(profileKey);
  const points = getHomeComposition(profile === 'lab' ? 'desktop' : profile);
  const p = clamp(progress, 0, 1);

  if (p <= points[0].progress) return points[0].headScreenY;
  if (p >= points[points.length - 1].progress) {
    return points[points.length - 1].headScreenY;
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const next = points[index];
    if (p > next.progress) continue;

    const span = next.progress - previous.progress;
    if (span <= 0) return next.headScreenY;
    return lerp(
      previous.headScreenY,
      next.headScreenY,
      (p - previous.progress) / span
    );
  }

  return points[points.length - 1].headScreenY;
}

function buildMonotoneSlopes(keyframes) {
  const count = keyframes.length;
  const h = new Array(count - 1);
  const delta = new Array(count - 1);
  const slopes = new Array(count).fill(0);

  for (let index = 0; index < count - 1; index += 1) {
    h[index] = keyframes[index + 1].progress - keyframes[index].progress;
    delta[index] = (
      keyframes[index + 1].x - keyframes[index].x
    ) / Math.max(h[index], 0.000001);
  }

  slopes[0] = delta[0];
  slopes[count - 1] = delta[delta.length - 1];

  for (let index = 1; index < count - 1; index += 1) {
    const previousDelta = delta[index - 1];
    const nextDelta = delta[index];

    if (previousDelta * nextDelta <= 0) {
      slopes[index] = 0;
      continue;
    }

    const previousH = h[index - 1];
    const nextH = h[index];
    const weightA = 2 * nextH + previousH;
    const weightB = nextH + 2 * previousH;

    slopes[index] = (
      weightA + weightB
    ) / (
      weightA / previousDelta
      + weightB / nextDelta
    );
  }

  return slopes;
}

function createMonotoneInterpolator(keyframes) {
  const slopes = buildMonotoneSlopes(keyframes);

  return (inputProgress) => {
    const progress = clamp(inputProgress, keyframes[0].progress, keyframes[keyframes.length - 1].progress);

    if (progress <= keyframes[0].progress) return keyframes[0].x;
    if (progress >= keyframes[keyframes.length - 1].progress) {
      return keyframes[keyframes.length - 1].x;
    }

    for (let index = 0; index < keyframes.length - 1; index += 1) {
      const start = keyframes[index];
      const end = keyframes[index + 1];
      if (progress > end.progress) continue;

      const interval = end.progress - start.progress;
      const t = (progress - start.progress) / Math.max(interval, 0.000001);
      const t2 = t * t;
      const t3 = t2 * t;

      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;

      const raw = (
        h00 * start.x
        + h10 * interval * slopes[index]
        + h01 * end.x
        + h11 * interval * slopes[index + 1]
      );

      return clamp(raw, Math.min(start.x, end.x), Math.max(start.x, end.x));
    }

    return keyframes[keyframes.length - 1].x;
  };
}

function interpolateSpread(keyframes, progress) {
  const p = clamp(progress, keyframes[0].progress, keyframes[keyframes.length - 1].progress);

  if (p <= keyframes[0].progress) return keyframes[0].value;
  if (p >= keyframes[keyframes.length - 1].progress) {
    return keyframes[keyframes.length - 1].value;
  }

  for (let index = 1; index < keyframes.length; index += 1) {
    const previous = keyframes[index - 1];
    const next = keyframes[index];
    if (p > next.progress) continue;

    const t = smoothstep(
      previous.progress,
      next.progress,
      p
    );
    return lerp(previous.value, next.value, t);
  }

  return keyframes[keyframes.length - 1].value;
}

function buildCenterPoints(profileKey) {
  const config = PROFILE_CONFIGS[profileKey];
  const resolveCenterX = createMonotoneInterpolator(config.center);
  const points = [];

  for (let index = 0; index < CENTER_SAMPLE_COUNT; index += 1) {
    const progress = HEAD_PROGRESS_END * (index / (CENTER_SAMPLE_COUNT - 1));
    points.push([
      clampX(resolveCenterX(progress)),
      progressToWorldY(progress),
    ]);
  }

  return points;
}

function resolveNormal(points, index) {
  const previous = points[Math.max(0, index - 2)];
  const next = points[Math.min(points.length - 1, index + 2)];
  const dx = next[0] - previous[0];
  const dy = next[1] - previous[1];
  const length = Math.max(Math.hypot(dx, dy), 0.000001);

  return [-dy / length, dx / length];
}

function deriveLanePoints(centerPoints, lineKey, profileKey) {
  const multiplier = LANE_MULTIPLIERS[lineKey];
  const config = PROFILE_CONFIGS[profileKey];
  const points = [];
  let previousY = Number.NEGATIVE_INFINITY;

  centerPoints.forEach(([centerX, centerY], index) => {
    const progress = worldYToProgress(centerY);
    const totalSpread = interpolateSpread(config.spread, progress);
    const laneOffset = (totalSpread / 2) * multiplier;
    const [normalX, normalY] = resolveNormal(centerPoints, index);

    const x = clampX(centerX + normalX * laneOffset);
    const rawY = centerY + normalY * laneOffset;
    const y = Math.max(rawY, previousY + Y_MONOTONIC_TOLERANCE);

    points.push([x, y]);
    previousY = y;
  });

  return points;
}

function buildSampleData(points, lineKey) {
  if (process.env.NODE_ENV !== 'production') {
    for (let index = 0; index < points.length; index += 1) {
      const [x, y] = points[index];

      if (x < SAFE_X_MIN - Y_MONOTONIC_TOLERANCE || x > SAFE_X_MAX + Y_MONOTONIC_TOLERANCE) {
        console.warn(`[line-lab] route "${lineKey}" exits SAFE_X at sample ${index} (x=${x}).`);
      }

      if (index > 0 && y < points[index - 1][1] - Y_MONOTONIC_TOLERANCE) {
        console.warn(`[line-lab] route "${lineKey}" is not vertically monotone at sample ${index}.`);
      }
    }
  }

  const distances = [0];

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index][0] - points[index - 1][0];
    const dy = points[index][1] - points[index - 1][1];
    distances.push(distances[index - 1] + Math.hypot(dx, dy));
  }

  const totalLength = distances[distances.length - 1];
  const normalizedDistance = distances.map((distance) => (
    totalLength > 0 ? distance / totalLength : 0
  ));

  return {
    points,
    distances,
    totalLength,
    normalizedDistance,
  };
}

function buildAnchorsFromSamples(samples, profileKey) {
  return PROFILE_CONFIGS[profileKey].center.map(({ progress }) => {
    const index = Math.round(
      (progress / HEAD_PROGRESS_END) * (samples.points.length - 1)
    );
    return samples.points[clamp(index, 0, samples.points.length - 1)];
  });
}

function buildRouteFromSamples(samples, anchors) {
  const segments = [];

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const start = anchors[index];
    const end = anchors[index + 1];

    segments.push({
      cp1: [
        lerp(start[0], end[0], 1 / 3),
        lerp(start[1], end[1], 1 / 3),
      ],
      cp2: [
        lerp(start[0], end[0], 2 / 3),
        lerp(start[1], end[1], 2 / 3),
      ],
      end,
    });
  }

  return {
    start: anchors[0],
    segments,
    samplePoints: samples.points,
  };
}

function buildProfileData(profileKey) {
  const centerPoints = buildCenterPoints(profileKey);
  const samples = {};
  const anchors = {};
  const routes = {};
  const pathD = {};

  LINE_KEYS.forEach((lineKey) => {
    const lanePoints = deriveLanePoints(centerPoints, lineKey, profileKey);
    samples[lineKey] = buildSampleData(lanePoints, lineKey);
    anchors[lineKey] = buildAnchorsFromSamples(samples[lineKey], profileKey);
    routes[lineKey] = buildRouteFromSamples(samples[lineKey], anchors[lineKey]);
    pathD[lineKey] = buildMasterPathD(routes[lineKey]);
  });

  return {
    centerPoints,
    samples,
    anchors,
    routes,
    pathD,
  };
}

function getProfileData(profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);

  if (!PROFILE_ROUTE_CACHE.has(profile)) {
    PROFILE_ROUTE_CACHE.set(profile, buildProfileData(profile));
  }

  return PROFILE_ROUTE_CACHE.get(profile);
}

export function buildBundleAnchors(lineKey, profileKey = 'lab') {
  return getProfileData(profileKey).anchors[lineKey].map((point) => [...point]);
}

export const buildDanceAnchors = buildBundleAnchors;

export function getProfileRouteSamples(profileKey = 'lab', lineKey = null) {
  const samples = getProfileData(profileKey).samples;
  return lineKey ? samples[lineKey] : samples;
}

function buildPolylinePathD(points) {
  if (!points?.length) return '';

  const stride = 2;
  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;

  for (let index = stride; index < points.length; index += stride) {
    d += ` L ${round(points[index][0])} ${round(points[index][1])}`;
  }

  const last = points[points.length - 1];
  d += ` L ${round(last[0])} ${round(last[1])}`;
  return d;
}

export function buildMasterPathD(route) {
  if (Array.isArray(route?.samplePoints) && route.samplePoints.length) {
    return buildPolylinePathD(route.samplePoints);
  }

  if (!route?.start || !Array.isArray(route?.segments)) return '';

  let d = `M ${round(route.start[0])} ${round(route.start[1])}`;

  route.segments.forEach((segment) => {
    d += (
      ` C ${round(segment.cp1[0])} ${round(segment.cp1[1])},`
      + ` ${round(segment.cp2[0])} ${round(segment.cp2[1])},`
      + ` ${round(segment.end[0])} ${round(segment.end[1])}`
    );
  });

  return d;
}

const LAB_PROFILE_DATA = getProfileData('lab');

export const MASTER_ANCHORS = LAB_PROFILE_DATA.anchors;
export const MASTER_ROUTES = LAB_PROFILE_DATA.routes;
export const ROUTE_SAMPLES = LAB_PROFILE_DATA.samples;
export const MASTER_PATH_D = LAB_PROFILE_DATA.pathD;

export function pointAtRouteU(routeSamples, u) {
  if (
    !routeSamples
    || !Array.isArray(routeSamples.points)
    || !routeSamples.points.length
    || !Array.isArray(routeSamples.normalizedDistance)
  ) {
    return [0, 0];
  }

  const { points, normalizedDistance } = routeSamples;
  const target = clamp(u, 0, 1);

  let low = 0;
  let high = normalizedDistance.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;
    if (normalizedDistance[middle] < target) low = middle + 1;
    else high = middle;
  }

  const upperIndex = low;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerU = normalizedDistance[lowerIndex];
  const upperU = normalizedDistance[upperIndex];
  const span = upperU - lowerU;
  const localT = span > 0 ? (target - lowerU) / span : 0;

  const [x0, y0] = points[lowerIndex];
  const [x1, y1] = points[upperIndex];

  return [
    lerp(x0, x1, localT),
    lerp(y0, y1, localT),
  ];
}

export function pointAtWorldY(routeSamples, targetWorldY) {
  const { points, distances, normalizedDistance } = routeSamples;
  const lastIndex = points.length - 1;
  const clampedY = clamp(targetWorldY, points[0][1], points[lastIndex][1]);

  let low = 0;
  let high = lastIndex;

  while (low < high) {
    const middle = (low + high) >> 1;
    if (points[middle][1] < clampedY) low = middle + 1;
    else high = middle;
  }

  const upperIndex = low;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const y0 = points[lowerIndex][1];
  const y1 = points[upperIndex][1];
  const span = y1 - y0;
  const t = span > 0 ? (clampedY - y0) / span : 0;

  return {
    point: [
      lerp(points[lowerIndex][0], points[upperIndex][0], t),
      clampedY,
    ],
    routeU: lerp(
      normalizedDistance[lowerIndex],
      normalizedDistance[upperIndex],
      t
    ),
    cumulativeDistance: lerp(
      distances[lowerIndex],
      distances[upperIndex],
      t
    ),
  };
}

export function sliceRoute(routeSamples, tailU, headU) {
  const { points, normalizedDistance } = routeSamples;
  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);
  const startPoint = pointAtRouteU(routeSamples, from);
  const endPoint = pointAtRouteU(routeSamples, to);
  const orderedPoints = [startPoint];

  for (let index = 0; index < normalizedDistance.length; index += 1) {
    if (
      normalizedDistance[index] > from
      && normalizedDistance[index] < to
    ) {
      orderedPoints.push(points[index]);
    }
  }

  orderedPoints.push(endPoint);

  let d = `M ${round(orderedPoints[0][0])} ${round(orderedPoints[0][1])}`;

  for (let index = 1; index < orderedPoints.length; index += 1) {
    d += ` L ${round(orderedPoints[index][0])} ${round(orderedPoints[index][1])}`;
  }

  return d;
}

export function countTrailPoints(routeSamples, tailU, headU) {
  const { normalizedDistance } = routeSamples;
  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);
  let middleCount = 0;

  for (let index = 0; index < normalizedDistance.length; index += 1) {
    if (
      normalizedDistance[index] > from
      && normalizedDistance[index] < to
    ) {
      middleCount += 1;
    }
  }

  return middleCount + 2;
}

export function resolveHeadWorldY(progress) {
  return progressToWorldY(clamp(progress, 0, HEAD_PROGRESS_END));
}

export function resolveCameraTop(progress, options = {}) {
  const headWorldY = resolveHeadWorldY(progress);
  const desiredHeadScreenY = options.desiredHeadScreenY
    ?? (
      options.mode === 'home'
        ? resolveHomeHeadScreenY(progress, options.profileKey || 'desktop')
        : CAMERA_FOLLOW_SCREEN_Y
    );

  return clamp(
    headWorldY - desiredHeadScreenY,
    CAMERA_MIN,
    CAMERA_MAX
  );
}

export function resolveLineState(progress, lineKey, options = {}) {
  const profileKey = resolveProfileKey(options.profileKey || 'lab');
  const samples = getProfileData(profileKey).samples[lineKey];
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
  const activeStartWorldY = Math.max(
    routeStartWorldY,
    headPoint[1] - activeWorldHeight
  );
  const activeStartResult = pointAtWorldY(samples, activeStartWorldY);
  const activeStartU = Math.min(activeStartResult.routeU, headU);
  const activeTrailD = sliceRoute(samples, activeStartU, headU);
  const activeTrailPointCount = countTrailPoints(
    samples,
    activeStartU,
    headU
  );

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
  const p = clamp(progress, 0, 1);
  const nearest = p < HEAD_PROGRESS_END / 2
    ? CONVERGENCE_BEATS[0]
    : CONVERGENCE_BEATS[CONVERGENCE_BEATS.length - 1];
  const distance = Math.abs(p - nearest.progress);

  let mergeAmount = 0;

  if (distance <= MERGE_CORE_RADIUS) mergeAmount = 1;
  else if (distance < MERGE_RECOVERY_RADIUS) {
    mergeAmount = 1 - smoothstep(
      MERGE_CORE_RADIUS,
      MERGE_RECOVERY_RADIUS,
      distance
    );
  }

  if (p >= HEAD_PROGRESS_END) mergeAmount = 1;

  return {
    nearestProgress: nearest.progress,
    distance,
    mergeAmount,
    isFullyMerged: mergeAmount >= 0.999,
  };
}

export function routesToJson(routes = MASTER_ROUTES, profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);

  if (routes === MASTER_ROUTES) {
    return JSON.stringify(
      {
        profile,
        centerKeyframes: PROFILE_CONFIGS[profile].center,
        spreadKeyframes: PROFILE_CONFIGS[profile].spread,
        anchors: getProfileData(profile).anchors,
      },
      null,
      2
    );
  }

  return JSON.stringify(routes, null, 2);
}

export function createLabScrollController(scrollRoot, onProgress) {
  if (!scrollRoot) return null;

  return ScrollTrigger.create({
    trigger: scrollRoot,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => onProgress(self.progress),
  });
}
