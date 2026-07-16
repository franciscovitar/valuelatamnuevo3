/**
 * Deterministic helpers for the Value Latam hero sculpture.
 * The UI timeline owns the scroll windows; this file mirrors them so the 3D
 * scene can react to the same normalized 0..1 progress without a second trigger.
 */

export const CHAPTER_WINDOWS = [
  [0.27, 0.38],
  [0.38, 0.49],
  [0.49, 0.60],
  [0.60, 0.71],
];

export const PALETTE = {
  blackBlue: 0x01040a,
  deepNavy: 0x02070e,
  navyDark: 0x061321,
  navy: 0x0a2138,
  navyMedium: 0x1b3a5c,
  iceBlue: 0x8fb2d6,
  iceLight: 0xb7d1ec,
  gold: 0xe2c98a,
  goldLight: 0xffe6a8,
  goldDeep: 0x8f7135,
  ivory: 0xf6f3ec,
};

const SEED = 42857;

function mulberry32(seed) {
  let t = seed >>> 0;

  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed = SEED) {
  return mulberry32(seed);
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function chapterWeight(progress, start, end, fade = 0.018) {
  if (progress < start - fade || progress > end + fade) return 0;
  if (progress < start + fade) return smoothstep(start - fade, start + fade, progress);
  if (progress <= end - fade) return 1;
  return 1 - smoothstep(end - fade, end + fade, progress);
}

/**
 * Camera stays calm. Most of the perceived movement comes from the sculpture,
 * while these keyframes provide a subtle push-in during the chapters and a
 * clean pull-back for the Value Latam brand close.
 */
export function cameraKeyframes() {
  return [
    { p: 0.00, pos: [0.02, 0.30, 8.55], look: [0.08, 0.24, 0.00] },
    { p: 0.27, pos: [0.00, 0.20, 8.05], look: [0.08, 0.14, 0.00] },
    { p: 0.38, pos: [0.05, 0.08, 7.70], look: [0.10, 0.02, 0.00] },
    { p: 0.49, pos: [0.02, -0.04, 7.42], look: [0.08, -0.10, 0.00] },
    { p: 0.60, pos: [-0.02, -0.15, 7.25], look: [0.04, -0.20, 0.00] },
    { p: 0.71, pos: [0.04, -0.22, 7.30], look: [0.08, -0.28, 0.00] },
    { p: 0.82, pos: [0.02, -0.06, 7.90], look: [0.06, -0.10, 0.00] },
    { p: 0.93, pos: [0.00, 0.12, 8.65], look: [0.04, 0.04, 0.00] },
    { p: 1.00, pos: [0.00, 0.22, 9.20], look: [0.02, 0.12, 0.00] },
  ];
}

export function interpolateKeyframes(keyframes, progress, outPosition, outLookAt) {
  const p = clamp01(progress);
  let lowerIndex = 0;

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (p >= keyframes[i].p && p <= keyframes[i + 1].p) {
      lowerIndex = i;
      break;
    }

    if (p > keyframes[i + 1].p) lowerIndex = i + 1;
  }

  const a = keyframes[lowerIndex];
  const b = keyframes[Math.min(lowerIndex + 1, keyframes.length - 1)];
  const t = smoothstep(a.p, b.p, p);

  outPosition[0] = a.pos[0] + (b.pos[0] - a.pos[0]) * t;
  outPosition[1] = a.pos[1] + (b.pos[1] - a.pos[1]) * t;
  outPosition[2] = a.pos[2] + (b.pos[2] - a.pos[2]) * t;

  outLookAt[0] = a.look[0] + (b.look[0] - a.look[0]) * t;
  outLookAt[1] = a.look[1] + (b.look[1] - a.look[1]) * t;
  outLookAt[2] = a.look[2] + (b.look[2] - a.look[2]) * t;
}
