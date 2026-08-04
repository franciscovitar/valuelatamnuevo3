/**
 * TRIONN line lab — fixed-viewport SVG Bézier lines, deterministic K0–K8 pose sequence.
 * Geometry is a pure function of progress (0–1): no accumulated state, no easing, no float.
 */

import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['outer', 'middle', 'inner'];
export const CONTROL_KEYS = ['p0', 'cp1', 'cp2', 'p3'];
export const VIEWBOX_SIZE = 1000;

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

export const KEYFRAMES = [
  {
    id: 'K0',
    name: 'K0 · Entrada parcial',
    progress: 0,
    outer: { p0: [-0.12, -0.02], cp1: [0.22, 0.03], cp2: [0.7, 0.08], p3: [0.92, 0.46] },
    middle: { p0: [-0.12, 0.07], cp1: [0.2, 0.12], cp2: [0.56, 0.18], p3: [0.72, 0.52] },
    inner: { p0: [-0.12, 0.16], cp1: [0.18, 0.22], cp2: [0.42, 0.28], p3: [0.56, 0.58] },
  },
  {
    id: 'K1',
    name: 'K1 · Composición principal',
    progress: 0.125,
    outer: { p0: [-0.04, 0.04], cp1: [0.3, 0.1], cp2: [0.82, 0.18], p3: [0.81, 0.86] },
    middle: { p0: [-0.04, 0.13], cp1: [0.28, 0.2], cp2: [0.58, 0.31], p3: [0.65, 0.83] },
    inner: { p0: [-0.04, 0.22], cp1: [0.24, 0.32], cp2: [0.42, 0.43], p3: [0.54, 0.85] },
  },
  {
    id: 'K2',
    name: 'K2 · Apertura en abanico',
    progress: 0.25,
    outer: { p0: [-0.1, 0.02], cp1: [0.36, 0.08], cp2: [0.88, 0.28], p3: [0.86, 0.92] },
    middle: { p0: [-0.1, 0.12], cp1: [0.32, 0.2], cp2: [0.65, 0.38], p3: [0.66, 0.9] },
    inner: { p0: [-0.1, 0.24], cp1: [0.28, 0.36], cp2: [0.48, 0.5], p3: [0.5, 0.91] },
  },
  {
    id: 'K3',
    name: 'K3 · Comienzo de convergencia',
    progress: 0.375,
    outer: { p0: [-0.08, 0.08], cp1: [0.34, 0.2], cp2: [0.62, 0.5], p3: [0.62, 0.92] },
    middle: { p0: [-0.02, 0.04], cp1: [0.3, 0.22], cp2: [0.6, 0.56], p3: [0.61, 0.92] },
    inner: { p0: [0.06, 0], cp1: [0.28, 0.26], cp2: [0.58, 0.62], p3: [0.6, 0.92] },
  },
  {
    id: 'K4',
    name: 'K4 · Convergencia máxima',
    progress: 0.5,
    outer: { p0: [0.18, -0.12], cp1: [0.44, 0.16], cp2: [0.56, 0.5], p3: [0.59, 0.94] },
    middle: { p0: [0.28, -0.12], cp1: [0.46, 0.18], cp2: [0.57, 0.54], p3: [0.59, 0.94] },
    inner: { p0: [0.38, -0.12], cp1: [0.48, 0.2], cp2: [0.58, 0.58], p3: [0.59, 0.94] },
  },
  {
    id: 'K5',
    name: 'K5 · Paso y salida',
    progress: 0.625,
    outer: { p0: [0.45, -0.15], cp1: [0.54, 0.18], cp2: [0.6, 0.56], p3: [0.6, 1.1] },
    middle: { p0: [0.52, -0.15], cp1: [0.57, 0.18], cp2: [0.6, 0.58], p3: [0.6, 1.1] },
    inner: { p0: [0.58, -0.15], cp1: [0.6, 0.2], cp2: [0.61, 0.6], p3: [0.6, 1.1] },
  },
  {
    id: 'K6',
    name: 'K6 · Reentrada desde la derecha',
    progress: 0.75,
    outer: { p0: [1.1, 0.02], cp1: [0.88, 0.12], cp2: [0.64, 0.32], p3: [0.38, 0.88] },
    middle: { p0: [1.1, 0.12], cp1: [0.86, 0.2], cp2: [0.62, 0.4], p3: [0.42, 0.86] },
    inner: { p0: [1.1, 0.24], cp1: [0.84, 0.3], cp2: [0.6, 0.5], p3: [0.46, 0.84] },
  },
  {
    id: 'K7',
    name: 'K7 · Segunda expansión',
    progress: 0.875,
    outer: { p0: [1.08, -0.04], cp1: [0.8, 0.06], cp2: [0.44, 0.2], p3: [0.22, 0.82] },
    middle: { p0: [1.08, 0.08], cp1: [0.78, 0.16], cp2: [0.48, 0.3], p3: [0.32, 0.86] },
    inner: { p0: [1.08, 0.2], cp1: [0.76, 0.26], cp2: [0.52, 0.42], p3: [0.42, 0.9] },
  },
  {
    id: 'K8',
    name: 'K8 · Salida final',
    progress: 1,
    outer: { p0: [1.15, 0], cp1: [0.92, 0.1], cp2: [0.7, 0.24], p3: [0.58, 1.08] },
    middle: { p0: [1.15, 0.12], cp1: [0.9, 0.18], cp2: [0.68, 0.34], p3: [0.6, 1.08] },
    inner: { p0: [1.15, 0.24], cp1: [0.88, 0.28], cp2: [0.66, 0.46], p3: [0.62, 1.08] },
  },
];

const LS_KEY = 'line-lab-keyframes-v2';
const K5_PROGRESS = 0.625;
const K5_RADIUS = 0.125;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function lerpPoint(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function lerpCurve(a, b, t) {
  return {
    p0: lerpPoint(a.p0, b.p0, t),
    cp1: lerpPoint(a.cp1, b.cp1, t),
    cp2: lerpPoint(a.cp2, b.cp2, t),
    p3: lerpPoint(a.p3, b.p3, t),
  };
}

function cloneCurve(curve) {
  return { p0: [...curve.p0], cp1: [...curve.cp1], cp2: [...curve.cp2], p3: [...curve.p3] };
}

export function cloneKeyframe(kf) {
  return {
    id: kf.id,
    name: kf.name,
    progress: kf.progress,
    outer: cloneCurve(kf.outer),
    middle: cloneCurve(kf.middle),
    inner: cloneCurve(kf.inner),
  };
}

export function cloneKeyframes(keyframes) {
  return keyframes.map(cloneKeyframe);
}

/** Pure function: geometry at `progress` (0–1). Independently lerped per control point, per line. */
export function resolvePoseAtProgress(progress, keyframes = KEYFRAMES) {
  const p = clamp(progress, 0, 1);
  let i = 0;
  while (i < keyframes.length - 2 && p > keyframes[i + 1].progress) i += 1;
  const kfA = keyframes[i];
  const kfB = keyframes[i + 1];
  const span = kfB.progress - kfA.progress;
  const localProgress = span > 0 ? (p - kfA.progress) / span : 0;
  const t = smoothstep(localProgress);

  const pose = {};
  LINE_KEYS.forEach((lineKey) => {
    pose[lineKey] = lerpCurve(kfA[lineKey], kfB[lineKey], t);
  });
  return pose;
}

/** Pure function: overall opacity envelope at `progress` — fade-in/out plus the K5 dip. */
export function resolveOpacity(progress) {
  const p = clamp(progress, 0, 1);
  let envelope = 1;
  if (p <= 0.06) envelope = smoothstep(p / 0.06);
  else if (p >= 0.92) envelope = 1 - smoothstep((p - 0.92) / 0.08);

  const distanceToK5 = Math.abs(p - K5_PROGRESS);
  if (distanceToK5 < K5_RADIUS) {
    const dipT = smoothstep(1 - distanceToK5 / K5_RADIUS);
    envelope *= 1 - 0.35 * dipT;
  }
  return envelope;
}

/** Converts a normalized curve into an SVG cubic-Bézier `d` attribute (single segment). */
export function buildPathD(curve, size = VIEWBOX_SIZE) {
  const { p0, cp1, cp2, p3 } = curve;
  return `M ${p0[0] * size} ${p0[1] * size} C ${cp1[0] * size} ${cp1[1] * size}, ${cp2[0] * size} ${cp2[1] * size}, ${p3[0] * size} ${p3[1] * size}`;
}

/** Converts a viewport-relative pointer position into normalized [-0.5, 1.5] coordinates. */
export function normFromViewport(clientX, clientY) {
  if (typeof window === 'undefined') return [0, 0];
  return [
    clamp(clientX / window.innerWidth, -0.5, 1.5),
    clamp(clientY / window.innerHeight, -0.5, 1.5),
  ];
}

export function loadStoredKeyframes() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== KEYFRAMES.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredKeyframes(keyframes) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(keyframes));
}

export function clearStoredKeyframes() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LS_KEY);
}

export function keyframesToJson(keyframes) {
  return JSON.stringify(keyframes, null, 2);
}

/** Owns exactly one ScrollTrigger for the lab's scroll mode; fully reversible, no scrub lag. */
export function createLabScrollController(scrollRoot, onProgress) {
  const trigger = ScrollTrigger.create({
    trigger: scrollRoot,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => onProgress(self.progress),
  });
  onProgress(trigger.progress || 0);
  return trigger;
}
