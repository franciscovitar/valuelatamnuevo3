import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = VIEWPORT_HEIGHT;

/*
 * The master route intentionally travels outside the viewport.
 * That lets the same bundle leave the screen and re-enter naturally,
 * instead of disappearing and being replaced by another drawing.
 */
export const SAFE_X_MIN = -520;
export const SAFE_X_MAX = 1520;

export const ACTIVE_WORLD_HEIGHT = 0.014;
export const TRAIL_WORLD_HEIGHT = 0.102;

export const LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.085)', width: 0.78 },
  middle: { color: 'rgba(204, 202, 204, 0.125)', width: 0.98 },
  inner: { color: 'rgba(214, 211, 214, 0.06)', width: 0.7 },
};

export const HISTORY_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.085)', width: 0.78 },
  middle: { color: 'rgba(204, 202, 204, 0.125)', width: 0.98 },
  inner: { color: 'rgba(214, 211, 214, 0.06)', width: 0.7 },
};

export const ACTIVE_LINE_STYLE = {
  outer: { color: 'rgba(204, 180, 135, 0.78)', width: 1.02 },
  middle: { color: 'rgba(242, 239, 232, 0.96)', width: 1.28 },
  inner: { color: 'rgba(221, 200, 161, 0.62)', width: 0.92 },
};

export const NODE_COLOR = 'rgba(242, 239, 232, 1)';
export const MASTER_ROUTE_COLOR = 'rgba(204, 202, 204, 1)';
export const MASTER_ROUTE_OPACITY = 0.06;

export const HEAD_PROGRESS_END = 0.96;
export const HEAD_Y_OFFSET = { outer: 0, middle: 0, inner: 0 };

export const CAMERA_FOLLOW_SCREEN_Y = 0;
export const CAMERA_MIN = 0;
export const CAMERA_MAX = 0;

export const MERGE_CORE_RADIUS = 0.006;
export const MERGE_RECOVERY_RADIUS = 0.03;

/*
 * These are semantic ranges on one continuous traveler.
 * They are not separate SVG paths.
 */
export const GESTURE_WINDOWS = [
  { id: 'opening-fan', start: 0.0, end: 0.16 },
  { id: 'right-drop', start: 0.23, end: 0.38 },
  { id: 'upper-sweep', start: 0.50, end: 0.62 },
  { id: 'final-diagonal', start: 0.72, end: 0.96 },
];

export const CHECKPOINTS = [
  { id: 'START', progress: 0.0 },
  { id: 'DROP', progress: 0.23 },
  { id: 'SWEEP', progress: 0.50 },
  { id: 'FINAL', progress: 0.72 },
  { id: 'END', progress: 0.96 },
];

export const CONVERGENCE_BEATS = [
  { progress: 0.0, x: 0 },
  { progress: 0.38, x: 0 },
  { progress: 0.62, x: 0 },
  { progress: 0.96, x: 0 },
];

export const INTERVAL_DANCE = GESTURE_WINDOWS.map((gesture) => ({
  startProgress: gesture.start,
  endProgress: gesture.end,
}));

/*
 * Route reconstructed from the motion observed in the reference video:
 *
 * 1. Shared origin around the left-middle, opening toward the upper-right.
 * 2. The same traveler moves offscreen and comes down from the upper-right,
 *    converging near the right-center.
 * 3. It leaves the screen, returns from above, and performs another soft
 *    right-side convergence.
 * 4. It enters near the project area and travels diagonally toward a shared
 *    lower-left point.
 *
 * Connectors between visible moments remain outside the 0..1000 viewport.
 */
const DESKTOP_ROUTE = {
  start: [250, 420],
  startProgress: 0.0,
  segments: [
    /* Opening fan: left-middle to upper-right. */
    {
      progress: 0.10,
      cp1: [320, 215],
      cp2: [575, 35],
      end: [760, -60],
    },
    {
      progress: 0.16,
      cp1: [900, -120],
      cp2: [1060, -190],
      end: [1190, -235],
    },

    /* Offscreen connector into the upper-right drop. */
    {
      progress: 0.23,
      cp1: [1370, -300],
      cp2: [1110, -280],
      end: [850, -175],
    },

    /* Right-side downward convergence. */
    {
      progress: 0.31,
      cp1: [850, 25],
      cp2: [850, 255],
      end: [805, 425],
    },
    {
      progress: 0.38,
      cp1: [792, 465],
      cp2: [797, 490],
      end: [810, 505],
    },

    /* Exit fully through the right/bottom edge. */
    {
      progress: 0.43,
      cp1: [980, 540],
      cp2: [1190, 700],
      end: [1320, 930],
    },

    /* Long offscreen repositioning for the next upper sweep. */
    {
      progress: 0.50,
      cp1: [1480, 1260],
      cp2: [1370, -350],
      end: [625, -185],
    },

    /* Upper sweep toward another right-center convergence. */
    {
      progress: 0.57,
      cp1: [640, 20],
      cp2: [720, 225],
      end: [790, 405],
    },
    {
      progress: 0.62,
      cp1: [812, 452],
      cp2: [825, 482],
      end: [832, 505],
    },

    /* Leave the frame through the right/bottom side. */
    {
      progress: 0.67,
      cp1: [1015, 565],
      cp2: [1240, 760],
      end: [1380, 1040],
    },

    /*
     * Stay outside while moving toward the last scene.
     * The visible re-entry occurs from the right, not from nowhere.
     */
    {
      progress: 0.72,
      cp1: [1510, 1300],
      cp2: [1370, 380],
      end: [935, 300],
    },

    /* Final diagonal: project area to the shared lower-left point. */
    {
      progress: 0.82,
      cp1: [805, 360],
      cp2: [635, 485],
      end: [475, 615],
    },
    {
      progress: 0.91,
      cp1: [365, 705],
      cp2: [280, 780],
      end: [220, 835],
    },
    {
      progress: 0.96,
      cp1: [188, 862],
      cp2: [165, 882],
      end: [150, 900],
    },
  ],
};

/*
 * The width behaves like the reference:
 * - opening fan expands from one point;
 * - descending scenes begin wide and converge;
 * - final diagonal begins wide and closes at the lower-left point.
 * Offscreen transitions collapse the bundle before repositioning.
 */
const SPREAD_KEYFRAMES = [
  { progress: 0.0, value: 0 },
  { progress: 0.075, value: 118 },
  { progress: 0.16, value: 92 },
  { progress: 0.205, value: 0 },

  { progress: 0.23, value: 106 },
  { progress: 0.31, value: 78 },
  { progress: 0.38, value: 0 },
  { progress: 0.43, value: 0 },

  { progress: 0.50, value: 98 },
  { progress: 0.57, value: 72 },
  { progress: 0.62, value: 0 },
  { progress: 0.67, value: 0 },

  { progress: 0.72, value: 112 },
  { progress: 0.82, value: 88 },
  { progress: 0.91, value: 42 },
  { progress: 0.96, value: 0 },
];

function scaleRoute(route, profileKey) {
  if (profileKey === 'desktop' || profileKey === 'lab') {
    return route;
  }

  const tablet = profileKey === 'tablet';
  const xScale = tablet ? 0.88 : 0.64;
  const yScale = tablet ? 0.94 : 0.86;
  const xCenter = tablet ? 520 : 760;

  const scalePoint = ([x, y]) => [
    xCenter + (x - 500) * xScale,
    500 + (y - 500) * yScale,
  ];

  return {
    start: scalePoint(route.start),
    startProgress: route.startProgress,
    segments: route.segments.map((segment) => ({
      ...segment,
      cp1: scalePoint(segment.cp1),
      cp2: scalePoint(segment.cp2),
      end: scalePoint(segment.end),
    })),
  };
}

function scaleSpreadKeyframes(profileKey) {
  if (profileKey === 'desktop' || profileKey === 'lab') {
    return SPREAD_KEYFRAMES;
  }

  const scale = profileKey === 'tablet' ? 0.78 : 0.42;

  return SPREAD_KEYFRAMES.map((keyframe) => ({
    ...keyframe,
    value: keyframe.value * scale,
  }));
}

const PROFILE_ROUTES = {
  desktop: DESKTOP_ROUTE,
  tablet: scaleRoute(DESKTOP_ROUTE, 'tablet'),
  mobile: scaleRoute(DESKTOP_ROUTE, 'mobile'),
};

PROFILE_ROUTES.lab = PROFILE_ROUTES.desktop;

const PROFILE_SPREAD = {
  desktop: SPREAD_KEYFRAMES,
  tablet: scaleSpreadKeyframes('tablet'),
  mobile: scaleSpreadKeyframes('mobile'),
};

PROFILE_SPREAD.lab = PROFILE_SPREAD.desktop;

const PROFILE_CACHE = new Map();
const SAMPLES_PER_SEGMENT = 120;

const LANE_FACTORS = {
  outer: -1,
  middle: 0,
  inner: 1,
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, input) {
  if (edge1 <= edge0) return input >= edge1 ? 1 : 0;

  const t = clamp(
    (input - edge0) / (edge1 - edge0),
    0,
    1
  );

  return t * t * (3 - 2 * t);
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
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

function cubicPoint(p0, p1, p2, p3, t) {
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

function resolveSpread(keyframes, progress) {
  const p = clamp(progress, 0, HEAD_PROGRESS_END);

  if (p <= keyframes[0].progress) {
    return keyframes[0].value;
  }

  if (p >= keyframes[keyframes.length - 1].progress) {
    return keyframes[keyframes.length - 1].value;
  }

  for (let index = 1; index < keyframes.length; index += 1) {
    const previous = keyframes[index - 1];
    const next = keyframes[index];

    if (p > next.progress) continue;

    return lerp(
      previous.value,
      next.value,
      smoothstep(
        previous.progress,
        next.progress,
        p
      )
    );
  }

  return keyframes[keyframes.length - 1].value;
}

function sampleCenterRoute(route) {
  const points = [];
  const timelineProgress = [];
  let segmentStart = route.start;
  let segmentStartProgress = route.startProgress;

  route.segments.forEach((segment, segmentIndex) => {
    for (
      let sampleIndex = 0;
      sampleIndex < SAMPLES_PER_SEGMENT;
      sampleIndex += 1
    ) {
      if (segmentIndex > 0 && sampleIndex === 0) {
        continue;
      }

      const t = sampleIndex / (SAMPLES_PER_SEGMENT - 1);

      points.push(
        cubicPoint(
          segmentStart,
          segment.cp1,
          segment.cp2,
          segment.end,
          t
        )
      );

      timelineProgress.push(
        lerp(
          segmentStartProgress,
          segment.progress,
          t
        )
      );
    }

    segmentStart = segment.end;
    segmentStartProgress = segment.progress;
  });

  return {
    points,
    timelineProgress,
  };
}

function normalAt(points, index) {
  const previous = points[Math.max(0, index - 4)];
  const next = points[Math.min(points.length - 1, index + 4)];
  const dx = next[0] - previous[0];
  const dy = next[1] - previous[1];
  const length = Math.max(Math.hypot(dx, dy), 0.000001);

  return [-dy / length, dx / length];
}

function buildLanePoints(
  centerData,
  spreadKeyframes,
  lineKey
) {
  const factor = LANE_FACTORS[lineKey];

  return centerData.points.map((centerPoint, index) => {
    const progress = centerData.timelineProgress[index];
    const spread = resolveSpread(
      spreadKeyframes,
      progress
    );
    const [normalX, normalY] = normalAt(
      centerData.points,
      index
    );

    /*
     * A tiny unequal bias avoids a mechanically perfect CAD ribbon.
     * It is deliberately much smaller than the previous implementation.
     */
    const phase = Math.sin(
      Math.PI * clamp(progress / HEAD_PROGRESS_END, 0, 1)
    );
    const laneBias = lineKey === 'outer'
      ? phase * 3.5
      : lineKey === 'inner'
        ? -phase * 2.5
        : 0;

    return [
      centerPoint[0] + normalX * spread * factor + laneBias,
      centerPoint[1] + normalY * spread * factor,
    ];
  });
}

function buildSampleData(
  points,
  timelineProgress
) {
  const distances = [0];

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index][0] - points[index - 1][0];
    const dy = points[index][1] - points[index - 1][1];

    distances.push(
      distances[index - 1] + Math.hypot(dx, dy)
    );
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
    timelineProgress,
  };
}

function buildPolylinePathD(points) {
  if (!points?.length) return '';

  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;

  for (let index = 2; index < points.length; index += 2) {
    d += ` L ${round(points[index][0])} ${round(points[index][1])}`;
  }

  const lastPoint = points[points.length - 1];

  d += ` L ${round(lastPoint[0])} ${round(lastPoint[1])}`;

  return d;
}

function buildProfileData(profileKey) {
  const centerData = sampleCenterRoute(
    PROFILE_ROUTES[profileKey]
  );
  const samples = {};
  const pathD = {};

  LINE_KEYS.forEach((lineKey) => {
    const points = buildLanePoints(
      centerData,
      PROFILE_SPREAD[profileKey],
      lineKey
    );

    samples[lineKey] = buildSampleData(
      points,
      centerData.timelineProgress
    );
    pathD[lineKey] = buildPolylinePathD(points);
  });

  return {
    samples,
    pathD,
  };
}

function getProfileData(profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);

  if (!PROFILE_CACHE.has(profile)) {
    PROFILE_CACHE.set(
      profile,
      buildProfileData(profile)
    );
  }

  return PROFILE_CACHE.get(profile);
}

function findTimelineIndex(samples, progress) {
  const timeline = samples.timelineProgress;
  const target = clamp(progress, 0, HEAD_PROGRESS_END);

  let low = 0;
  let high = timeline.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (timeline[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
}

function pointAtTimelineProgress(samples, progress) {
  const upperIndex = findTimelineIndex(samples, progress);
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerProgress = samples.timelineProgress[lowerIndex];
  const upperProgress = samples.timelineProgress[upperIndex];
  const span = upperProgress - lowerProgress;
  const t = span > 0
    ? (
      clamp(progress, 0, HEAD_PROGRESS_END)
      - lowerProgress
    ) / span
    : 0;

  return {
    point: [
      lerp(
        samples.points[lowerIndex][0],
        samples.points[upperIndex][0],
        t
      ),
      lerp(
        samples.points[lowerIndex][1],
        samples.points[upperIndex][1],
        t
      ),
    ],
    routeU: lerp(
      samples.normalizedDistance[lowerIndex],
      samples.normalizedDistance[upperIndex],
      t
    ),
  };
}

export function resolveGestureState(progress) {
  const p = clamp(progress, 0, HEAD_PROGRESS_END);
  let gestureIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  GESTURE_WINDOWS.forEach((gesture, index) => {
    const distance = p < gesture.start
      ? gesture.start - p
      : p > gesture.end
        ? p - gesture.end
        : 0;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      gestureIndex = index;
    }
  });

  const gesture = GESTURE_WINDOWS[gestureIndex];

  return {
    gestureIndex,
    gestureId: gesture.id,
    localProgress: clamp(
      (p - gesture.start)
      / Math.max(gesture.end - gesture.start, 0.000001),
      0,
      1
    ),
    /*
     * The traveler never resets. During gaps it is simply outside
     * the clipped viewport.
     */
    opacity: smoothstep(0, 0.012, p),
    inside: true,
    startProgress: gesture.start,
    endProgress: gesture.end,
  };
}

export function getGestureRouteSamples(
  profileKey = 'lab',
  gestureIndex = 0,
  lineKey = null
) {
  const samples = getProfileData(profileKey).samples;

  return lineKey ? samples[lineKey] : samples;
}

export function getProfileRouteSamples(
  profileKey = 'lab',
  lineKey = null
) {
  return getGestureRouteSamples(
    profileKey,
    0,
    lineKey
  );
}

export function pointAtRouteU(routeSamples, u) {
  if (
    !routeSamples
    || !routeSamples.points?.length
    || !routeSamples.normalizedDistance?.length
  ) {
    return [0, 0];
  }

  const { points, normalizedDistance } = routeSamples;
  const target = clamp(u, 0, 1);

  let low = 0;
  let high = normalizedDistance.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (normalizedDistance[middle] < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const upperIndex = low;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerU = normalizedDistance[lowerIndex];
  const upperU = normalizedDistance[upperIndex];
  const span = upperU - lowerU;
  const localT = span > 0
    ? (target - lowerU) / span
    : 0;

  return [
    lerp(
      points[lowerIndex][0],
      points[upperIndex][0],
      localT
    ),
    lerp(
      points[lowerIndex][1],
      points[upperIndex][1],
      localT
    ),
  ];
}

export function pointAtWorldY(routeSamples, target) {
  const routeU = clamp(target, 0, 1);

  return {
    point: pointAtRouteU(routeSamples, routeU),
    routeU,
    cumulativeDistance: (
      routeSamples.totalLength * routeU
    ),
  };
}

export function sliceRoute(routeSamples, tailU, headU) {
  if (!routeSamples?.points?.length) return '';

  const { points, normalizedDistance } = routeSamples;
  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);
  const orderedPoints = [pointAtRouteU(routeSamples, from)];

  for (let index = 0; index < normalizedDistance.length; index += 1) {
    if (
      normalizedDistance[index] > from
      && normalizedDistance[index] < to
    ) {
      orderedPoints.push(points[index]);
    }
  }

  orderedPoints.push(pointAtRouteU(routeSamples, to));

  let d = `M ${round(orderedPoints[0][0])} ${round(orderedPoints[0][1])}`;

  for (let index = 1; index < orderedPoints.length; index += 1) {
    d += ` L ${round(orderedPoints[index][0])} ${round(orderedPoints[index][1])}`;
  }

  return d;
}

export function countTrailPoints(routeSamples, tailU, headU) {
  if (!routeSamples?.normalizedDistance?.length) return 0;

  const from = clamp(Math.min(tailU, headU), 0, 1);
  const to = clamp(Math.max(tailU, headU), 0, 1);
  let count = 2;

  routeSamples.normalizedDistance.forEach((routeU) => {
    if (routeU > from && routeU < to) {
      count += 1;
    }
  });

  return count;
}

export function resolveLineState(
  progress,
  lineKey,
  options = {}
) {
  const profileKey = resolveProfileKey(
    options.profileKey || 'lab'
  );
  const samples = getProfileData(profileKey).samples[lineKey];
  const gestureState = resolveGestureState(progress);
  const headResult = pointAtTimelineProgress(
    samples,
    progress
  );
  const headU = headResult.routeU;
  const trailLength = options.trailLength
    ?? TRAIL_WORLD_HEIGHT;
  const activeLength = options.activeLength
    ?? ACTIVE_WORLD_HEIGHT;
  const tailU = Math.max(0, headU - trailLength);
  const activeStartU = Math.max(
    tailU,
    headU - activeLength
  );

  return {
    gestureIndex: gestureState.gestureIndex,
    gestureId: gestureState.gestureId,
    gestureOpacity: gestureState.opacity,
    headU,
    tailU,
    activeStartU,
    headPoint: headResult.point,
    tailPoint: pointAtRouteU(samples, tailU),
    historyTrailD: sliceRoute(
      samples,
      tailU,
      activeStartU
    ),
    activeTrailD: sliceRoute(
      samples,
      activeStartU,
      headU
    ),
    trailD: sliceRoute(samples, tailU, headU),
    trailPointCount: countTrailPoints(
      samples,
      tailU,
      headU
    ),
    activeTrailPointCount: countTrailPoints(
      samples,
      activeStartU,
      headU
    ),
    routeStartWorldY: 0,
    activeStartWorldY: activeStartU,
    headWorldY: headU,
    tailWorldY: tailU,
  };
}

export function resolveConvergenceState(progress) {
  const state = resolveGestureState(progress);
  const nearestProgress = CONVERGENCE_BEATS.reduce(
    (nearest, beat) => (
      Math.abs(progress - beat.progress)
      < Math.abs(progress - nearest.progress)
        ? beat
        : nearest
    ),
    CONVERGENCE_BEATS[0]
  ).progress;
  const distance = Math.abs(progress - nearestProgress);

  let mergeAmount = 0;

  if (distance <= MERGE_CORE_RADIUS) {
    mergeAmount = 1;
  } else if (distance < MERGE_RECOVERY_RADIUS) {
    mergeAmount = 1 - smoothstep(
      MERGE_CORE_RADIUS,
      MERGE_RECOVERY_RADIUS,
      distance
    );
  }

  return {
    nearestProgress,
    distance,
    mergeAmount,
    isFullyMerged: mergeAmount >= 0.999,
    gestureId: state.gestureId,
  };
}

export function resolveHomeHeadScreenY() {
  return 0;
}

export function progressToWorldY(progress) {
  return clamp(progress, 0, HEAD_PROGRESS_END);
}

export function worldYToProgress(value) {
  return clamp(value, 0, HEAD_PROGRESS_END);
}

export function resolveHeadWorldY(progress) {
  return clamp(progress, 0, HEAD_PROGRESS_END);
}

export function resolveCameraTop() {
  return 0;
}

export function buildMasterPathD(route) {
  if (Array.isArray(route?.samplePoints)) {
    return buildPolylinePathD(route.samplePoints);
  }

  return '';
}

const LAB_DATA = getProfileData('lab');

export const MASTER_ANCHORS = LINE_KEYS.reduce((result, lineKey) => {
  const samples = LAB_DATA.samples[lineKey];

  result[lineKey] = [
    samples.points[0],
    samples.points[samples.points.length - 1],
  ];

  return result;
}, {});

export const MASTER_ROUTES = LINE_KEYS.reduce((result, lineKey) => {
  result[lineKey] = {
    samplePoints: LAB_DATA.samples[lineKey].points,
  };

  return result;
}, {});

export const ROUTE_SAMPLES = LAB_DATA.samples;
export const MASTER_PATH_D = LAB_DATA.pathD;

export function buildBundleAnchors(
  lineKey,
  profileKey = 'lab'
) {
  const samples = getProfileData(profileKey).samples[lineKey];

  return [
    samples.points[0],
    samples.points[samples.points.length - 1],
  ];
}

export const buildDanceAnchors = buildBundleAnchors;

export function routesToJson(profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);

  return JSON.stringify(
    {
      profile,
      route: PROFILE_ROUTES[profile],
      spread: PROFILE_SPREAD[profile],
      semanticWindows: GESTURE_WINDOWS,
    },
    null,
    2
  );
}

export function createLabScrollController(
  scrollRoot,
  onProgress
) {
  if (!scrollRoot) return null;

  return ScrollTrigger.create({
    trigger: scrollRoot,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => onProgress(self.progress),
  });
}
