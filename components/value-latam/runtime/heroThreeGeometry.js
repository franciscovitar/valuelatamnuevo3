/** Deterministic geometry for Hero Three.js scene — seeded, no Math.random() */

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
  gold: 0xe2c98a,
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

export function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function chapterWeight(progress, start, end, fade = 0.016) {
  if (progress < start - fade) return 0;
  if (progress < start + fade) return smoothstep(start - fade, start + fade, progress);
  if (progress < end - fade) return 1;
  if (progress < end + fade) return 1 - smoothstep(end - fade, end + fade, progress);
  return 0;
}

export function chapterPast(progress, end, fade = 0.02) {
  if (progress <= end) return 0;
  return smoothstep(end, end + fade, progress);
}

export function generatePillars(count, rng) {
  const pillars = [];
  let attempts = 0;

  while (pillars.length < count && attempts < count * 12) {
    attempts += 1;
    const band = pillars.length % 4;
    const slot = Math.floor(pillars.length / 4);
    const slotsPerBand = Math.ceil(count / 4);
    const t = slot / Math.max(slotsPerBand - 1, 1);

    const sectorAngle = band * (Math.PI / 2) + 0.35;
    const spread = 0.55 + t * 1.35;
    const radius = 1.55 + t * 2.35 + rng() * 0.55;
    const x = 0.95 + Math.cos(sectorAngle) * radius * spread;
    const z = -0.35 + Math.sin(sectorAngle) * radius * 0.72;

    if (x < -0.55) continue;
    if (x < 0.15 && rng() > 0.22) continue;

    const width = 0.07 + rng() * 0.05;
    const depth = 0.07 + rng() * 0.05;
    const height = 0.55 + rng() * 2.05 + t * 0.35;
    const y = height * 0.5;

    pillars.push({
      band,
      x,
      y,
      z,
      width,
      height,
      depth,
      baseHeight: height,
      rotY: (rng() - 0.5) * 0.08,
    });
  }

  return pillars;
}

const CORE = { x: 1.15, y: 1.05, z: -0.15 };

export function getCoreTarget() {
  return CORE;
}

export function generateStreamCurves() {
  const c = CORE;

  return [
    [
      { x: -0.85, y: 0.35, z: 2.4 },
      { x: -0.2, y: 0.85, z: 1.55 },
      { x: 0.45, y: 1.15, z: 0.75 },
      { x: 0.82, y: 1.05, z: 0.15 },
      { x: c.x, y: c.y, z: c.z },
    ],
    [
      { x: 3.35, y: 0.55, z: 1.85 },
      { x: 2.65, y: 0.95, z: 1.05 },
      { x: 2.05, y: 1.25, z: 0.45 },
      { x: 1.55, y: 1.15, z: 0.05 },
      { x: c.x, y: c.y, z: c.z },
    ],
    [
      { x: 3.55, y: 0.45, z: -1.65 },
      { x: 2.85, y: 0.75, z: -0.95 },
      { x: 2.15, y: 1.05, z: -0.45 },
      { x: 1.45, y: 1.1, z: -0.2 },
      { x: c.x, y: c.y, z: c.z },
    ],
    [
      { x: 0.35, y: 0.25, z: -2.35 },
      { x: 0.65, y: 0.65, z: -1.55 },
      { x: 0.88, y: 0.95, z: -0.85 },
      { x: 1.02, y: 1.05, z: -0.35 },
      { x: c.x, y: c.y, z: c.z },
    ],
  ];
}

export function sampleCurvePoints(curvePoints, count, rng) {
  const nodes = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const stream = i % 4;
    nodes.push({ stream, t: Math.min(t * 0.88 + rng() * 0.04, 0.92) });
  }
  return nodes;
}

export function generateGroundLines(rng) {
  const lines = [];
  for (let i = -6; i <= 8; i += 1) {
    if (i < -2 && rng() > 0.45) continue;
    const z = i * 0.55;
    lines.push(-1.2, 0, z, 5.2, 0, z);
  }
  for (let i = -2; i <= 7; i += 1) {
    if (i < 1 && rng() > 0.55) continue;
    const x = i * 0.65;
    lines.push(x, 0, -3.2, x, 0, 3.2);
  }
  return new Float32Array(lines);
}

export function cameraKeyframes() {
  return [
    { p: 0, pos: [4.35, 2.85, 7.65], look: [1.05, 0.75, -0.05] },
    { p: 0.27, pos: [3.75, 2.45, 6.35], look: [1.05, 0.85, -0.05] },
    { p: 0.38, pos: [3.35, 2.15, 5.65], look: [1.0, 0.95, -0.08] },
    { p: 0.49, pos: [3.05, 1.95, 5.15], look: [0.95, 1.0, -0.1] },
    { p: 0.6, pos: [2.75, 1.82, 4.65], look: [0.92, 1.05, -0.12] },
    { p: 0.71, pos: [2.55, 1.72, 4.25], look: [0.9, 1.08, -0.12] },
    { p: 0.82, pos: [2.85, 1.95, 5.05], look: [0.85, 0.95, -0.1] },
    { p: 0.93, pos: [3.15, 2.05, 5.85], look: [0.8, 0.85, -0.08] },
    { p: 1, pos: [3.45, 1.88, 6.55], look: [0.75, 0.72, -0.05] },
  ];
}

export function interpolateKeyframes(keyframes, progress, outPos, outLook) {
  let i0 = 0;
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (progress >= keyframes[i].p && progress <= keyframes[i + 1].p) {
      i0 = i;
      break;
    }
    if (progress > keyframes[i + 1].p) i0 = i + 1;
  }

  const a = keyframes[i0];
  const b = keyframes[Math.min(i0 + 1, keyframes.length - 1)];
  const span = b.p - a.p || 1;
  const t = smoothstep(a.p, b.p, progress);

  outPos[0] = a.pos[0] + (b.pos[0] - a.pos[0]) * t;
  outPos[1] = a.pos[1] + (b.pos[1] - a.pos[1]) * t;
  outPos[2] = a.pos[2] + (b.pos[2] - a.pos[2]) * t;
  outLook[0] = a.look[0] + (b.look[0] - a.look[0]) * t;
  outLook[1] = a.look[1] + (b.look[1] - a.look[1]) * t;
  outLook[2] = a.look[2] + (b.look[2] - a.look[2]) * t;
}
