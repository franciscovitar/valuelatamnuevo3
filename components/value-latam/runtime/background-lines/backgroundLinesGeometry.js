/**
 * Pure geometry data for the WebGL background lines scene.
 * No DOM access, no requestAnimationFrame, no ScrollTrigger.
 */
import * as THREE from 'three';

export const BREAKPOINT = { DESKTOP: 'desktop', TABLET: 'tablet', MOBILE: 'mobile' };

// Escala neutra: sin nombres de color, todo deriva de la paleta central.
const LINE_PALETTE = ['#c9c9c7', '#f4f4f1', '#9a9a97'];

function p(x, y, z) {
  return { x, y, z };
}

// Three static, hand-authored curve families — different X/Y/Z spread per line,
// no sine deformation, no regular spiral, independent of document/section count.
const DESKTOP_LINES = [
  {
    key: 'outer',
    color: LINE_PALETTE[0],
    opacity: 0.16,
    widthPx: 1.2,
    nodeU: 0.95,
    points: [
      p(-5.6, 2.8, -4.6),
      p(-4.0, 2.0, -2.4),
      p(-1.6, 2.5, -0.2),
      p(1.1, 1.4, 1.8),
      p(3.6, -0.3, 1.3),
      p(4.7, -2.1, -1.2),
      p(3.4, -3.2, -3.8),
      p(0.6, -2.5, -5.9),
      p(-2.5, -0.8, -5.7),
    ],
  },
  {
    key: 'mid',
    color: LINE_PALETTE[1],
    opacity: 0.12,
    widthPx: 1.0,
    nodeU: 0.9,
    points: [
      p(-3.7, 1.5, -3.3),
      p(-2.2, 0.9, -1.1),
      p(-0.3, 1.5, 1.0),
      p(1.9, 0.5, 2.2),
      p(3.1, -0.7, 0.5),
      p(2.5, -1.9, -1.7),
      p(0.9, -2.3, -3.5),
      p(-1.4, -1.5, -4.6),
    ],
  },
  {
    key: 'inner',
    color: LINE_PALETTE[2],
    opacity: 0.09,
    widthPx: 0.85,
    nodeU: 0.82,
    points: [
      p(-2.3, 0.7, -2.1),
      p(-1.1, 0.3, -0.5),
      p(0.4, 0.9, 0.7),
      p(1.7, 0.1, 1.3),
      p(2.1, -0.7, 0.1),
      p(1.1, -1.3, -1.3),
      p(-0.3, -1.0, -2.5),
    ],
  },
];

const TABLET_LINES = [
  {
    key: 'outer',
    color: LINE_PALETTE[0],
    opacity: 0.15,
    widthPx: 1.15,
    nodeU: 0.94,
    points: [
      p(-3.9, 2.1, -3.6),
      p(-2.7, 1.5, -1.8),
      p(-1.0, 1.9, 0.0),
      p(0.9, 1.0, 1.4),
      p(2.5, -0.3, 1.0),
      p(3.1, -1.7, -0.9),
      p(2.2, -2.4, -2.9),
      p(0.1, -1.8, -4.2),
    ],
  },
  {
    key: 'mid',
    color: LINE_PALETTE[1],
    opacity: 0.11,
    widthPx: 0.95,
    nodeU: 0.88,
    points: [
      p(-2.6, 1.1, -2.5),
      p(-1.5, 0.6, -0.9),
      p(-0.1, 1.1, 0.7),
      p(1.3, 0.3, 1.6),
      p(2.1, -0.5, 0.4),
      p(1.6, -1.4, -1.2),
      p(0.4, -1.7, -2.6),
    ],
  },
  {
    key: 'inner',
    color: LINE_PALETTE[2],
    opacity: 0.085,
    widthPx: 0.8,
    nodeU: 0.8,
    points: [
      p(-1.6, 0.5, -1.5),
      p(-0.7, 0.2, -0.4),
      p(0.3, 0.6, 0.5),
      p(1.2, 0.0, 0.9),
      p(1.4, -0.5, 0.0),
      p(0.7, -0.9, -0.9),
    ],
  },
];

const MOBILE_LINES = [
  {
    key: 'outer',
    color: LINE_PALETTE[0],
    opacity: 0.14,
    widthPx: 1.05,
    nodeU: 0.92,
    points: [
      p(-2.7, 1.5, -2.7),
      p(-1.8, 1.0, -1.3),
      p(-0.6, 1.3, -0.1),
      p(0.7, 0.7, 0.9),
      p(1.7, -0.2, 0.6),
      p(2.0, -1.2, -0.7),
      p(1.2, -1.6, -2.1),
    ],
  },
  {
    key: 'mid',
    color: LINE_PALETTE[1],
    opacity: 0.1,
    widthPx: 0.9,
    nodeU: 0.86,
    points: [
      p(-1.8, 0.8, -1.9),
      p(-1.0, 0.4, -0.7),
      p(0.0, 0.8, 0.4),
      p(0.9, 0.2, 1.0),
      p(1.4, -0.3, 0.2),
      p(0.9, -0.9, -0.9),
    ],
  },
  {
    key: 'inner',
    color: LINE_PALETTE[2],
    opacity: 0.08,
    widthPx: 0.8,
    nodeU: 0.78,
    points: [
      p(-1.1, 0.3, -1.0),
      p(-0.5, 0.1, -0.3),
      p(0.2, 0.4, 0.3),
      p(0.8, -0.1, 0.6),
      p(0.9, -0.4, -0.1),
    ],
  },
];

// Camera + look-at travel paths — one keyframe roughly per narrative checkpoint.
const DESKTOP_CAMERA_PATH = [
  p(0.0, 0.7, 9.2),
  p(0.5, 0.5, 7.7),
  p(2.3, 0.25, 6.1),
  p(3.1, -0.3, 4.3),
  p(1.7, -0.65, 2.5),
  p(0.2, -0.45, 1.0),
  p(-0.7, 0.1, 0.15),
  p(-2.5, 0.65, 1.7),
  p(-3.1, 1.05, 3.9),
  p(-1.0, 0.75, 6.5),
];

const DESKTOP_LOOKAT_PATH = [
  p(0.0, 0.0, -2.2),
  p(0.2, 0.0, -2.6),
  p(0.65, -0.1, -2.1),
  p(0.45, -0.2, -1.4),
  p(0.0, -0.1, -0.6),
  p(-0.2, 0.0, 0.4),
  p(-0.45, 0.2, 1.4),
  p(-0.85, 0.1, 0.6),
  p(-0.6, -0.1, -0.4),
  p(0.0, 0.0, -1.9),
];

const TABLET_CAMERA_PATH = [
  p(0.0, 0.5, 7.6),
  p(0.35, 0.35, 6.4),
  p(1.55, 0.2, 5.1),
  p(2.05, -0.2, 3.6),
  p(1.1, -0.45, 2.1),
  p(0.15, -0.3, 0.9),
  p(-0.45, 0.05, 0.2),
  p(-1.6, 0.45, 1.4),
  p(-2.0, 0.7, 3.2),
  p(-0.6, 0.5, 5.3),
];

const TABLET_LOOKAT_PATH = [
  p(0.0, 0.0, -1.7),
  p(0.15, 0.0, -2.0),
  p(0.45, -0.05, -1.6),
  p(0.3, -0.15, -1.1),
  p(0.0, -0.05, -0.4),
  p(-0.15, 0.0, 0.3),
  p(-0.3, 0.15, 1.0),
  p(-0.55, 0.05, 0.4),
  p(-0.4, -0.05, -0.3),
  p(0.0, 0.0, -1.4),
];

const MOBILE_CAMERA_PATH = [
  p(0.0, 0.35, 5.9),
  p(0.2, 0.25, 5.1),
  p(1.0, 0.15, 4.1),
  p(1.35, -0.15, 2.9),
  p(0.75, -0.3, 1.7),
  p(0.1, -0.2, 0.75),
  p(-0.3, 0.05, 0.2),
  p(-1.05, 0.3, 1.1),
  p(-1.3, 0.5, 2.5),
  p(-0.4, 0.35, 4.2),
];

const MOBILE_LOOKAT_PATH = [
  p(0.0, 0.0, -1.3),
  p(0.1, 0.0, -1.5),
  p(0.3, -0.05, -1.2),
  p(0.2, -0.1, -0.85),
  p(0.0, -0.05, -0.3),
  p(-0.1, 0.0, 0.25),
  p(-0.2, 0.1, 0.75),
  p(-0.4, 0.05, 0.3),
  p(-0.3, -0.05, -0.2),
  p(0.0, 0.0, -1.05),
];

const CONFIG = {
  [BREAKPOINT.DESKTOP]: {
    lines: DESKTOP_LINES,
    cameraPath: DESKTOP_CAMERA_PATH,
    lookAtPath: DESKTOP_LOOKAT_PATH,
    sampleCount: 260,
    fragmentCount: 2,
    particleCount: 16,
    particleBounds: { x: 11, y: 7, z: 10, zOffset: 2 },
    fov: 40,
    near: 0.08,
    far: 60,
    maxDpr: 1.6,
  },
  [BREAKPOINT.TABLET]: {
    lines: TABLET_LINES,
    cameraPath: TABLET_CAMERA_PATH,
    lookAtPath: TABLET_LOOKAT_PATH,
    sampleCount: 190,
    fragmentCount: 2,
    particleCount: 11,
    particleBounds: { x: 8, y: 5.5, z: 8, zOffset: 1.6 },
    fov: 42,
    near: 0.08,
    far: 52,
    maxDpr: 1.4,
  },
  [BREAKPOINT.MOBILE]: {
    lines: MOBILE_LINES,
    cameraPath: MOBILE_CAMERA_PATH,
    lookAtPath: MOBILE_LOOKAT_PATH,
    sampleCount: 130,
    fragmentCount: 1,
    particleCount: 6,
    particleBounds: { x: 6, y: 4, z: 6, zOffset: 1.2 },
    fov: 44,
    near: 0.08,
    far: 42,
    maxDpr: 1.2,
  },
};

export function getGeometryConfig(breakpoint) {
  return CONFIG[breakpoint] || CONFIG[BREAKPOINT.DESKTOP];
}

export function buildCurveSet(config) {
  const lines = config.lines.map((line) => {
    const points = line.points.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z));
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    curve.arcLengthDivisions = Math.max(64, Math.floor(config.sampleCount / 2));
    return {
      key: line.key,
      curve,
      color: line.color,
      opacity: line.opacity,
      widthPx: line.widthPx,
      nodeU: line.nodeU,
    };
  });

  const cameraPoints = config.cameraPath.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z));
  const lookAtPoints = config.lookAtPath.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z));
  const cameraCurve = new THREE.CatmullRomCurve3(cameraPoints, false, 'catmullrom', 0.5);
  const lookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, 'catmullrom', 0.5);
  cameraCurve.arcLengthDivisions = 200;
  lookAtCurve.arcLengthDivisions = 200;

  return { lines, cameraCurve, lookAtCurve };
}

function mulberry32(seed) {
  let state = seed | 0;
  return function rng() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createAmbientParticles(config, seed = 1337) {
  const rng = mulberry32(seed);
  const count = config.particleCount;
  const bounds = config.particleBounds;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (rng() - 0.5) * bounds.x;
    positions[i * 3 + 1] = (rng() - 0.5) * bounds.y;
    positions[i * 3 + 2] = (rng() - 0.5) * bounds.z - bounds.zOffset;
    sizes[i] = 1 + rng();
  }

  return { positions, sizes };
}

export function createFragmentDefs(config, seed = 99) {
  const rng = mulberry32(seed);
  const lineCount = config.lines.length;

  return Array.from({ length: config.fragmentCount }, (_, i) => ({
    curveIndex: i % lineCount,
    speed: 0.05 + rng() * 0.03,
    offset: rng(),
  }));
}

export function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
