import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];

export const WORLD_WIDTH = 1000;
export const VIEWPORT_HEIGHT = 1000;
export const WORLD_HEIGHT = VIEWPORT_HEIGHT;
export const SAFE_X_MIN = 35;
export const SAFE_X_MAX = 965;

export const ACTIVE_WORLD_HEIGHT = 0.075;
export const TRAIL_WORLD_HEIGHT = 0.34;

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

export const GESTURE_WINDOWS = [
  {
    id: 'metrics-partners',
    start: 0.0,
    end: 0.19,
    fadeFraction: 0.11,
  },
  {
    id: 'solutions-why-us',
    start: 0.225,
    end: 0.435,
    fadeFraction: 0.1,
  },
  {
    id: 'process-regulation',
    start: 0.47,
    end: 0.705,
    fadeFraction: 0.1,
  },
  {
    id: 'team-contact',
    start: 0.745,
    end: 0.96,
    fadeFraction: 0.1,
  },
];

export const CHECKPOINTS = [
  { id: 'G1', progress: 0.0 },
  { id: 'G2', progress: 0.225 },
  { id: 'G3', progress: 0.47 },
  { id: 'G4', progress: 0.745 },
  { id: 'END', progress: 0.96 },
];

export const CONVERGENCE_BEATS = GESTURE_WINDOWS.flatMap((gesture) => [
  { progress: gesture.start, x: 0 },
  { progress: gesture.end, x: 0 },
]);

export const INTERVAL_DANCE = GESTURE_WINDOWS.map((gesture) => ({
  startProgress: gesture.start,
  endProgress: gesture.end,
}));

const DESKTOP_GESTURES = [
  {
    id: 'metrics-partners',
    start: [115, 790],
    segments: [
      {
        cp1: [145, 525],
        cp2: [410, 165],
        end: [720, 125],
      },
      {
        cp1: [815, 112],
        cp2: [875, 150],
        end: [830, 220],
      },
    ],
    spread: [0, 86, 135],
    spreadAt: [0, 0.48, 1],
    endSpread: 26,
  },
  {
    id: 'solutions-why-us',
    start: [835, 110],
    segments: [
      {
        cp1: [860, 315],
        cp2: [865, 505],
        end: [770, 625],
      },
      {
        cp1: [715, 692],
        cp2: [690, 615],
        end: [728, 552],
      },
    ],
    spread: [0, 62, 92],
    spreadAt: [0, 0.58, 1],
    endSpread: 10,
  },
  {
    id: 'process-regulation',
    start: [780, 105],
    segments: [
      {
        cp1: [820, 315],
        cp2: [645, 438],
        end: [445, 330],
      },
      {
        cp1: [300, 252],
        cp2: [195, 470],
        end: [300, 650],
      },
    ],
    spread: [0, 74, 112],
    spreadAt: [0, 0.54, 1],
    endSpread: 18,
  },
  {
    id: 'team-contact',
    start: [105, 795],
    segments: [
      {
        cp1: [245, 695],
        cp2: [455, 605],
        end: [615, 410],
      },
      {
        cp1: [735, 265],
        cp2: [825, 250],
        end: [885, 315],
      },
    ],
    spread: [0, 118, 176],
    spreadAt: [0, 0.62, 1],
    endSpread: 82,
  },
];

function scaleGesture(gesture, profileKey) {
  if (profileKey === 'desktop' || profileKey === 'lab') {
    return gesture;
  }

  const tablet = profileKey === 'tablet';
  const xScale = tablet ? 0.92 : 0.68;
  const yScale = tablet ? 0.96 : 0.9;
  const xCenter = tablet ? 520 : 760;
  const spreadScale = tablet ? 0.82 : 0.46;

  const scalePoint = ([x, y]) => [
    xCenter + (x - 500) * xScale,
    500 + (y - 500) * yScale,
  ];

  return {
    ...gesture,
    start: scalePoint(gesture.start),
    segments: gesture.segments.map((segment) => ({
      cp1: scalePoint(segment.cp1),
      cp2: scalePoint(segment.cp2),
      end: scalePoint(segment.end),
    })),
    spread: gesture.spread.map((value) => value * spreadScale),
    endSpread: gesture.endSpread * spreadScale,
  };
}

const PROFILE_GESTURES = {
  desktop: DESKTOP_GESTURES,
  tablet: DESKTOP_GESTURES.map((gesture) => (
    scaleGesture(gesture, 'tablet')
  )),
  mobile: DESKTOP_GESTURES.map((gesture) => (
    scaleGesture(gesture, 'mobile')
  )),
};

PROFILE_GESTURES.lab = PROFILE_GESTURES.desktop;

const PROFILE_CACHE = new Map();
const SAMPLES_PER_GESTURE = 520;
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
  const t = clamp((input - edge0) / (edge1 - edge0), 0, 1);
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

function sampleCenterGesture(gesture) {
  const segmentCount = gesture.segments.length;
  const points = [];
  let segmentStart = gesture.start;

  for (let index = 0; index < SAMPLES_PER_GESTURE; index += 1) {
    const globalT = index / (SAMPLES_PER_GESTURE - 1);
    const scaled = globalT * segmentCount;
    const segmentIndex = Math.min(
      segmentCount - 1,
      Math.floor(scaled)
    );
    const localT = segmentIndex === segmentCount - 1
      ? clamp(scaled - segmentIndex, 0, 1)
      : scaled - segmentIndex;

    if (segmentIndex > 0) {
      segmentStart = gesture.segments[segmentIndex - 1].end;
    } else {
      segmentStart = gesture.start;
    }

    const segment = gesture.segments[segmentIndex];

    points.push(
      cubicPoint(
        segmentStart,
        segment.cp1,
        segment.cp2,
        segment.end,
        localT
      )
    );
  }

  return points;
}

function normalAt(points, index) {
  const previous = points[Math.max(0, index - 3)];
  const next = points[Math.min(points.length - 1, index + 3)];
  const dx = next[0] - previous[0];
  const dy = next[1] - previous[1];
  const length = Math.max(Math.hypot(dx, dy), 0.000001);

  return [-dy / length, dx / length];
}

function resolveSpread(gesture, t) {
  const middleAt = gesture.spreadAt[1];
  const peak = gesture.spread[1];

  if (t <= middleAt) {
    return lerp(
      gesture.spread[0],
      peak,
      smoothstep(0, middleAt, t)
    );
  }

  return lerp(
    peak,
    gesture.endSpread,
    smoothstep(middleAt, 1, t)
  );
}

function buildLanePoints(centerPoints, gesture, lineKey) {
  const factor = LANE_FACTORS[lineKey];

  return centerPoints.map((centerPoint, index) => {
    const t = index / (centerPoints.length - 1);
    const spread = resolveSpread(gesture, t);
    const [normalX, normalY] = normalAt(centerPoints, index);

    const lanePhase = lineKey === 'outer'
      ? Math.sin(Math.PI * t) * 7
      : lineKey === 'inner'
        ? -Math.sin(Math.PI * t) * 5
        : 0;

    return [
      clamp(
        centerPoint[0] + normalX * spread * factor + lanePhase,
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

function buildSampleData(points) {
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
  const gestures = PROFILE_GESTURES[profileKey];

  return gestures.map((gesture) => {
    const centerPoints = sampleCenterGesture(gesture);
    const samples = {};
    const pathD = {};

    LINE_KEYS.forEach((lineKey) => {
      const lanePoints = buildLanePoints(
        centerPoints,
        gesture,
        lineKey
      );

      samples[lineKey] = buildSampleData(lanePoints);
      pathD[lineKey] = buildPolylinePathD(lanePoints);
    });

    return {
      gesture,
      samples,
      pathD,
    };
  });
}

function getProfileData(profileKey = 'lab') {
  const profile = resolveProfileKey(profileKey);

  if (!PROFILE_CACHE.has(profile)) {
    PROFILE_CACHE.set(profile, buildProfileData(profile));
  }

  return PROFILE_CACHE.get(profile);
}

function resolveWindow(progress) {
  const p = clamp(progress, 0, HEAD_PROGRESS_END);

  for (let index = 0; index < GESTURE_WINDOWS.length; index += 1) {
    const window = GESTURE_WINDOWS[index];

    if (p >= window.start && p <= window.end) {
      return {
        index,
        window,
        inside: true,
      };
    }
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  GESTURE_WINDOWS.forEach((window, index) => {
    const distance = Math.min(
      Math.abs(p - window.start),
      Math.abs(p - window.end)
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return {
    index: nearestIndex,
    window: GESTURE_WINDOWS[nearestIndex],
    inside: false,
  };
}

export function resolveGestureState(progress) {
  const p = clamp(progress, 0, HEAD_PROGRESS_END);
  const resolved = resolveWindow(p);
  const { window } = resolved;
  const span = Math.max(window.end - window.start, 0.000001);
  const rawLocalProgress = clamp(
    (p - window.start) / span,
    0,
    1
  );
  const fade = clamp(window.fadeFraction, 0.02, 0.24);

  const fadeIn = smoothstep(0, fade, rawLocalProgress);
  const fadeOut = 1 - smoothstep(
    1 - fade,
    1,
    rawLocalProgress
  );

  return {
    gestureIndex: resolved.index,
    gestureId: window.id,
    localProgress: rawLocalProgress,
    opacity: resolved.inside
      ? clamp(fadeIn * fadeOut, 0, 1)
      : 0,
    inside: resolved.inside,
    startProgress: window.start,
    endProgress: window.end,
  };
}

export function getGestureRouteSamples(
  profileKey = 'lab',
  gestureIndex = 0,
  lineKey = null
) {
  const data = getProfileData(profileKey)[gestureIndex];

  if (!data) {
    return lineKey ? null : {};
  }

  return lineKey ? data.samples[lineKey] : data.samples;
}

export function getProfileRouteSamples(
  profileKey = 'lab',
  lineKey = null
) {
  return getGestureRouteSamples(profileKey, 0, lineKey);
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
  const gestureState = resolveGestureState(progress);
  const samples = getGestureRouteSamples(
    profileKey,
    gestureState.gestureIndex,
    lineKey
  );

  const headU = gestureState.localProgress;
  const tailLength = options.trailLength
    ?? TRAIL_WORLD_HEIGHT;
  const activeLength = options.activeLength
    ?? ACTIVE_WORLD_HEIGHT;
  const tailU = Math.max(0, headU - tailLength);
  const activeStartU = Math.max(tailU, headU - activeLength);

  return {
    gestureIndex: gestureState.gestureIndex,
    gestureId: gestureState.gestureId,
    gestureOpacity: gestureState.opacity,
    headU,
    tailU,
    activeStartU,
    headPoint: pointAtRouteU(samples, headU),
    tailPoint: pointAtRouteU(samples, tailU),
    historyTrailD: sliceRoute(samples, tailU, activeStartU),
    activeTrailD: sliceRoute(samples, activeStartU, headU),
    trailD: sliceRoute(samples, tailU, headU),
    trailPointCount: countTrailPoints(samples, tailU, headU),
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
  const distance = Math.min(
    state.localProgress,
    1 - state.localProgress
  );

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
    nearestProgress: distance < state.localProgress
      ? state.endProgress
      : state.startProgress,
    distance,
    mergeAmount,
    isFullyMerged: mergeAmount >= 0.999,
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

const LAB_DATA = getProfileData('lab')[0];

export const MASTER_ANCHORS = LINE_KEYS.reduce((result, lineKey) => {
  result[lineKey] = [
    LAB_DATA.samples[lineKey].points[0],
    LAB_DATA.samples[lineKey].points[
      LAB_DATA.samples[lineKey].points.length - 1
    ],
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
  const samples = getGestureRouteSamples(
    profileKey,
    0,
    lineKey
  );

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
      windows: GESTURE_WINDOWS,
      gestures: PROFILE_GESTURES[profile],
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
