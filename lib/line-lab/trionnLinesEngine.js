import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = VIEWPORT_HEIGHT;
export const SAFE_X_MIN = 35;
export const SAFE_X_MAX = 965;

export const ACTIVE_WORLD_HEIGHT = 0.04;
export const TRAIL_WORLD_HEIGHT = 0.205;

export const LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.10)', width: 0.82 },
  middle: { color: 'rgba(204, 202, 204, 0.15)', width: 1.02 },
  inner: { color: 'rgba(214, 211, 214, 0.075)', width: 0.74 },
};

export const HISTORY_LINE_STYLE = {
  outer: { color: 'rgba(190, 188, 194, 0.11)', width: 0.82 },
  middle: { color: 'rgba(204, 202, 204, 0.15)', width: 1.02 },
  inner: { color: 'rgba(214, 211, 214, 0.075)', width: 0.74 },
};

export const ACTIVE_LINE_STYLE = {
  outer: { color: 'rgba(204, 180, 135, 0.72)', width: 1.08 },
  middle: { color: 'rgba(242, 239, 232, 0.92)', width: 1.34 },
  inner: { color: 'rgba(221, 200, 161, 0.58)', width: 0.98 },
};

export const NODE_COLOR = 'rgba(242, 239, 232, 1)';
export const MASTER_ROUTE_COLOR = 'rgba(204, 202, 204, 1)';
export const MASTER_ROUTE_OPACITY = 0.07;

export const HEAD_PROGRESS_END = 0.96;
export const HEAD_Y_OFFSET = { outer: 0, middle: 0, inner: 0 };

export const CAMERA_FOLLOW_SCREEN_Y = 0;
export const CAMERA_MIN = 0;
export const CAMERA_MAX = 0;

export const MERGE_CORE_RADIUS = 0.006;
export const MERGE_RECOVERY_RADIUS = 0.03;

/*
 * These ranges are no longer separate drawings.
 * They are only semantic checkpoints on one continuous route.
 */
export const GESTURE_WINDOWS = [
  {
    id: 'metrics-partners',
    start: 0.0,
    end: 0.225,
  },
  {
    id: 'solutions-why-us',
    start: 0.225,
    end: 0.47,
  },
  {
    id: 'process-regulation',
    start: 0.47,
    end: 0.745,
  },
  {
    id: 'team-contact',
    start: 0.745,
    end: 0.96,
  },
];

export const CHECKPOINTS = [
  { id: 'START', progress: 0.0 },
  { id: 'G2', progress: 0.225 },
  { id: 'G3', progress: 0.47 },
  { id: 'G4', progress: 0.745 },
  { id: 'END', progress: 0.96 },
];

export const CONVERGENCE_BEATS = [
  { progress: 0.0, x: 0 },
  { progress: 0.225, x: 0 },
  { progress: 0.47, x: 0 },
  { progress: 0.745, x: 0 },
  { progress: 0.96, x: 0 },
];

export const INTERVAL_DANCE = GESTURE_WINDOWS.map((gesture) => ({
  startProgress: gesture.start,
  endProgress: gesture.end,
}));

const DESKTOP_ROUTE = {
  start: [115, 790],
  startProgress: 0.0,
  segments: [
    {
      progress: 0.12,
      cp1: [145, 525],
      cp2: [410, 165],
      end: [720, 125],
    },
    {
      progress: 0.19,
      cp1: [815, 112],
      cp2: [875, 150],
      end: [830, 220],
    },

    /*
     * Former gap between gesture 1 and gesture 2.
     * The line now travels through this connector.
     */
    {
      progress: 0.225,
      cp1: [900, 198],
      cp2: [895, 128],
      end: [835, 110],
    },

    {
      progress: 0.34,
      cp1: [860, 315],
      cp2: [865, 505],
      end: [770, 625],
    },
    {
      progress: 0.435,
      cp1: [715, 692],
      cp2: [690, 615],
      end: [728, 552],
    },

    /*
     * Former reset before Process / Regulation.
     * This long return curve keeps the same moving bundle alive.
     */
    {
      progress: 0.47,
      cp1: [650, 470],
      cp2: [665, 190],
      end: [780, 105],
    },

    {
      progress: 0.58,
      cp1: [820, 315],
      cp2: [645, 438],
      end: [445, 330],
    },
    {
      progress: 0.705,
      cp1: [300, 252],
      cp2: [195, 470],
      end: [300, 650],
    },

    /*
     * Former reset before Team.
     */
    {
      progress: 0.745,
      cp1: [260, 720],
      cp2: [165, 780],
      end: [105, 795],
    },

    {
      progress: 0.86,
      cp1: [245, 695],
      cp2: [455, 605],
      end: [615, 410],
    },
    {
      progress: 0.96,
      cp1: [735, 265],
      cp2: [825, 250],
      end: [885, 315],
    },
  ],
};

const SPREAD_KEYFRAMES = [
  { progress: 0.0, value: 0 },
  { progress: 0.075, value: 86 },
  { progress: 0.19, value: 28 },
  { progress: 0.225, value: 18 },

  { progress: 0.335, value: 66 },
  { progress: 0.435, value: 12 },
  { progress: 0.47, value: 18 },

  { progress: 0.585, value: 82 },
  { progress: 0.705, value: 18 },
  { progress: 0.745, value: 22 },

  { progress: 0.86, value: 120 },
  { progress: 0.96, value: 82 },
];

function scaleRoute(route, profileKey) {
  if (profileKey === 'desktop' || profileKey === 'lab') {
    return route;
  }

  const tablet = profileKey === 'tablet';
  const xScale = tablet ? 0.92 : 0.68;
  const yScale = tablet ? 0.96 : 0.9;
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

  const scale = profileKey === 'tablet' ? 0.82 : 0.46;

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
const SAMPLES_PER_SEGMENT = 110;
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

    const t = smoothstep(
      previous.progress,
      next.progress,
      p
    );

    return lerp(previous.value, next.value, t);
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
  const previous = points[Math.max(0, index - 3)];
  const next = points[Math.min(points.length - 1, index + 3)];
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
     * Small asymmetry keeps the bundle organic while preserving
     * one shared route and one continuous identity.
     */
    const localPhase = Math.sin(
      Math.PI * clamp(progress / HEAD_PROGRESS_END, 0, 1)
    );
    const laneBias = lineKey === 'outer'
      ? localPhase * 6
      : lineKey === 'inner'
        ? -localPhase * 4
        : 0;

    return [
      clamp(
        centerPoint[0] + normalX * spread * factor + laneBias,
        SAFE_X_MIN,
        SAFE_X_MAX
      ),
      clamp(
        centerPoint[1] + normalY * spread * factor,
        20,
        980
      ),
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

  const routeU = lerp(
    samples.normalizedDistance[lowerIndex],
    samples.normalizedDistance[upperIndex],
    t
  );

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
    routeU,
  };
}

export function resolveGestureState(progress) {
  const p = clamp(progress, 0, HEAD_PROGRESS_END);
  let gestureIndex = GESTURE_WINDOWS.length - 1;

  for (let index = 0; index < GESTURE_WINDOWS.length; index += 1) {
    const gesture = GESTURE_WINDOWS[index];

    if (p >= gesture.start && p <= gesture.end) {
      gestureIndex = index;
      break;
    }
  }

  const gesture = GESTURE_WINDOWS[gestureIndex];
  const localProgress = clamp(
    (p - gesture.start)
    / Math.max(gesture.end - gesture.start, 0.000001),
    0,
    1
  );

  return {
    gestureIndex,
    gestureId: gesture.id,
    localProgress,
    /*
     * No fades between sections. It is always the same traveler.
     * Only the very beginning fades in.
     */
    opacity: smoothstep(0, 0.018, p),
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
    if (routeU > from && routeU < to) count += 1;
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
