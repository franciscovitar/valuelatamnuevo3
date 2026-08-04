/**
 * TRIONN line lab — dynamic cubic Bézier, differential easing, K0–K5 sequence.
 */

import { ScrollTrigger } from '@/lib/scroll/gsap';

export const LINE_KEYS = ['left', 'center', 'right'];
export const CONTROL_KEYS = ['p0', 'cp1', 'cp2', 'p3'];

const LINE_DEFS = [
  { key: 'left', color: 'rgba(143, 178, 214, 0.24)', width: 1.12, phase: 0 },
  { key: 'center', color: 'rgba(143, 178, 214, 0.15)', width: 0.95, phase: 2.2 },
  { key: 'right', color: 'rgba(196, 154, 58, 0.13)', width: 0.9, phase: 4.1 },
];

/** Secuencia 4.0–6.0 s — keyframes manuales */
export const KEYFRAMES = [
  {
    id: 'K0',
    name: 'K0 · ~4.0s',
    left: { p0: [0.1, -0.08], cp1: [0.26, 0.02], cp2: [0.56, 0.1], p3: [0.72, 0.26] },
    center: { p0: [0.16, -0.1], cp1: [0.34, 0.0], cp2: [0.6, 0.12], p3: [0.76, 0.3] },
    right: { p0: [0.22, -0.08], cp1: [0.4, 0.04], cp2: [0.66, 0.16], p3: [0.8, 0.34] },
  },
  {
    id: 'K1',
    name: 'K1 · ~4.4s',
    left: { p0: [0.1, -0.07], cp1: [0.27, 0.04], cp2: [0.54, 0.16], p3: [0.7, 0.34] },
    center: { p0: [0.16, -0.09], cp1: [0.35, 0.02], cp2: [0.58, 0.18], p3: [0.74, 0.38] },
    right: { p0: [0.22, -0.07], cp1: [0.41, 0.06], cp2: [0.64, 0.22], p3: [0.78, 0.42] },
  },
  {
    id: 'K2',
    name: 'K2 · ~4.8s',
    left: { p0: [0.11, -0.06], cp1: [0.28, 0.08], cp2: [0.52, 0.28], p3: [0.66, 0.46] },
    center: { p0: [0.17, -0.08], cp1: [0.36, 0.06], cp2: [0.56, 0.3], p3: [0.7, 0.48] },
    right: { p0: [0.23, -0.06], cp1: [0.42, 0.1], cp2: [0.6, 0.32], p3: [0.72, 0.5] },
  },
  {
    id: 'K3',
    name: 'K3 · ~5.2s',
    left: { p0: [0.11, -0.05], cp1: [0.29, 0.12], cp2: [0.48, 0.38], p3: [0.58, 0.54] },
    center: { p0: [0.17, -0.07], cp1: [0.37, 0.14], cp2: [0.52, 0.4], p3: [0.62, 0.56] },
    right: { p0: [0.23, -0.05], cp1: [0.43, 0.16], cp2: [0.56, 0.42], p3: [0.64, 0.58] },
  },
  {
    id: 'K4',
    name: 'K4 · ~5.6s',
    left: { p0: [0.12, -0.04], cp1: [0.3, 0.18], cp2: [0.46, 0.48], p3: [0.54, 0.62] },
    center: { p0: [0.18, -0.06], cp1: [0.38, 0.2], cp2: [0.5, 0.5], p3: [0.56, 0.63] },
    right: { p0: [0.24, -0.04], cp1: [0.44, 0.22], cp2: [0.54, 0.52], p3: [0.58, 0.64] },
  },
  {
    id: 'K5',
    name: 'K5 · ~5.8s',
    left: { p0: [0.12, -0.03], cp1: [0.3, 0.22], cp2: [0.44, 0.54], p3: [0.52, 0.68] },
    center: { p0: [0.18, -0.05], cp1: [0.38, 0.24], cp2: [0.48, 0.56], p3: [0.545, 0.685] },
    right: { p0: [0.24, -0.03], cp1: [0.44, 0.26], cp2: [0.52, 0.58], p3: [0.565, 0.69] },
  },
];

/** Placeholder para secuencia 7.8–8.4 s (no implementada aún) */
export const SEQUENCE_2_KEYFRAMES = null;

export const DEFAULT_PARAMS = {
  easeP0: 0.032,
  easeCp1: 0.048,
  easeCp2: 0.11,
  easeP3: 0.15,
  floatP0: 2,
  floatCp1X: 15,
  floatCp1Y: 10,
  floatCp2X: 18,
  floatCp2Y: 12,
  floatP3: 5,
  floatSpeed: 0.00032,
  floatSpeedY: 0.00026,
  reveal: 0,
};

const HANDLE_COLORS = {
  p0: '#6b8fb8',
  cp1: '#8fb2d6',
  cp2: '#c49a3a',
  p3: '#e8dcc8',
};

const LS_KEY = 'line-lab-bezier-keyframes';

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function cloneCurve(c) {
  return {
    p0: [...c.p0],
    cp1: [...c.cp1],
    cp2: [...c.cp2],
    p3: [...c.p3],
  };
}

function cloneKeyframe(kf) {
  return {
    id: kf.id,
    name: kf.name,
    left: cloneCurve(kf.left),
    center: cloneCurve(kf.center),
    right: cloneCurve(kf.right),
  };
}

function clonePoint(pt) {
  return { x: pt.x, y: pt.y };
}

function clonePxCurve(c) {
  return { p0: clonePoint(c.p0), cp1: clonePoint(c.cp1), cp2: clonePoint(c.cp2), p3: clonePoint(c.p3) };
}

export function denormPoint(pt, w, h) {
  return {
    x: clamp(pt[0] * w, w * -0.25, w * 1.25),
    y: clamp(pt[1] * h, h * -0.25, h * 1.2),
  };
}

function normToPx(curve, w, h) {
  return {
    p0: denormPoint(curve.p0, w, h),
    cp1: denormPoint(curve.cp1, w, h),
    cp2: denormPoint(curve.cp2, w, h),
    p3: denormPoint(curve.p3, w, h),
  };
}

function lerpPxPoint(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function easePoint(current, target, ease) {
  return {
    x: current.x + (target.x - current.x) * ease,
    y: current.y + (target.y - current.y) * ease,
  };
}

export function resolveTargetGeometry(keyframes, progress) {
  const n = keyframes.length;
  if (n === 1) return keyframes[0];

  const scaled = clamp(progress, 0, 1) * (n - 1);
  const seg = clamp(Math.floor(scaled), 0, n - 2);
  const localT = smoothstep(scaled - seg);
  const i0 = Math.max(seg - 1, 0);
  const i1 = seg;
  const i2 = seg + 1;
  const i3 = Math.min(seg + 2, n - 1);

  const out = {};
  LINE_KEYS.forEach((lineKey) => {
    out[lineKey] = {};
    CONTROL_KEYS.forEach((ck) => {
      const read = (ki, axis) => keyframes[ki][lineKey][ck][axis];
      out[lineKey][ck] = [
        catmullRom(read(i0, 0), read(i1, 0), read(i2, 0), read(i3, 0), localT),
        catmullRom(read(i0, 1), read(i1, 1), read(i2, 1), read(i3, 1), localT),
      ];
    });
  });
  return out;
}

function getRenderCurve(line, time, params, floatEnabled) {
  const px = clonePxCurve(line.current);
  if (!floatEnabled) return px;

  const ph = line.phase;
  px.p0.x += Math.sin(time * params.floatSpeed + ph) * params.floatP0;
  px.p0.y += Math.cos(time * params.floatSpeedY + ph * 1.1) * params.floatP0 * 0.6;
  px.cp1.x += Math.sin(time * params.floatSpeed + ph) * params.floatCp1X;
  px.cp1.y += Math.cos(time * params.floatSpeedY + ph * 1.3) * params.floatCp1Y;
  px.cp2.x += Math.sin(time * params.floatSpeed * 0.92 + ph * 1.7) * params.floatCp2X;
  px.cp2.y += Math.cos(time * params.floatSpeedY * 0.88 + ph * 0.8) * params.floatCp2Y;
  px.p3.x += Math.sin(time * params.floatSpeed * 1.05 + ph * 2.1) * params.floatP3;
  px.p3.y += Math.cos(time * params.floatSpeedY * 1.02 + ph * 1.5) * params.floatP3 * 0.85;
  return px;
}

function drawBezier(ctx, px, color, width, reveal) {
  if (reveal <= 0) return;
  ctx.save();
  ctx.globalAlpha = reveal;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px.p0.x, px.p0.y);
  ctx.bezierCurveTo(px.cp1.x, px.cp1.y, px.cp2.x, px.cp2.y, px.p3.x, px.p3.y);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.globalAlpha = reveal * 0.42;
  ctx.fillStyle = color.replace(/[\d.]+\)$/, '0.55)');
  ctx.arc(px.p3.x, px.p3.y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function loadStoredKeyframes(fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 2) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveStoredKeyframes(keyframes) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(keyframes));
}

export function clearStoredKeyframes() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_KEY);
}

export function keyframeToJson(kf) {
  return cloneKeyframe(kf);
}

function createLine(def, w, h, initialNorm) {
  const px = normToPx(initialNorm, w, h);
  return {
    key: def.key,
    color: def.color,
    width: def.width,
    phase: def.phase,
    current: clonePxCurve(px),
    target: clonePxCurve(px),
    targetNorm: cloneCurve(initialNorm),
  };
}

export function createTrionnLinesEngine(canvas, scrollRoot, options = {}) {
  const ctx = canvas.getContext('2d');
  const debug = options.debug ?? false;
  const reduced = options.reduced ?? false;
  const stored = loadStoredKeyframes(KEYFRAMES);
  const keyframes = stored.map(cloneKeyframe);

  const engine = {
    canvas,
    ctx,
    scrollRoot,
    keyframes,
    baseKeyframes: KEYFRAMES.map(cloneKeyframe),
    lines: [],
    params: { ...DEFAULT_PARAMS, reveal: debug ? 1 : 0, ...options.params },
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    scrollProgress: 0,
    keyframeIndex: 0,
    keyframeT: 0,
    manualProgress: null,
    paused: false,
    floatEnabled: !reduced,
    debug,
    editMode: false,
    editKeyframeIndex: 0,
    showBezierControls: false,
    showTarget: false,
    showCurrent: false,
    rafId: null,
    lastFrame: 0,
    frameMs: 33,
    scrollTrigger: null,
    resizeObserver: null,
    running: !reduced,
    cleanupFns: [],
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    engine.width = w;
    engine.height = h;
    engine.dpr = dpr;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (engine.lines.length === 0) {
      const k0 = keyframes[0];
      engine.lines = LINE_DEFS.map((def) => createLine(def, w, h, k0[def.key]));
    }
  }

  function resolveProgress() {
    if (engine.manualProgress != null) return engine.manualProgress;
    return engine.scrollProgress;
  }

  function updateTargets() {
    const progress = resolveProgress();
    const norm = resolveTargetGeometry(keyframes, progress);
    const w = engine.width;
    const h = engine.height;
    const segments = keyframes.length - 1;
    const scaled = progress * segments;
    engine.keyframeIndex = clamp(Math.floor(scaled), 0, segments);
    engine.keyframeT = scaled - engine.keyframeIndex;

    engine.lines.forEach((line) => {
      line.targetNorm = cloneCurve(norm[line.key]);
      line.target = normToPx(norm[line.key], w, h);
    });
  }

  function stepEase() {
    const { easeP0, easeCp1, easeCp2, easeP3 } = engine.params;
    engine.lines.forEach((line) => {
      line.current.p0 = easePoint(line.current.p0, line.target.p0, easeP0);
      line.current.cp1 = easePoint(line.current.cp1, line.target.cp1, easeCp1);
      line.current.cp2 = easePoint(line.current.cp2, line.target.cp2, easeCp2);
      line.current.p3 = easePoint(line.current.p3, line.target.p3, easeP3);
    });
  }

  function updateReveal() {
    if (engine.debug) {
      engine.params.reveal = 1;
      return;
    }
    const p = resolveProgress();
    if (p <= 0.005) {
      engine.params.reveal = clamp(p * 12, 0, 1);
      return;
    }
    engine.params.reveal = Math.max(engine.params.reveal, 1);
  }

  function getLineRenderCurve(line) {
    return getRenderCurve(line, engine.time, engine.params, engine.floatEnabled);
  }

  function drawDebugCurve(c, px, style, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = style;
    c.lineWidth = 0.75;
    c.setLineDash([4, 4]);
    c.beginPath();
    c.moveTo(px.p0.x, px.p0.y);
    c.lineTo(px.cp1.x, px.cp1.y);
    c.lineTo(px.cp2.x, px.cp2.y);
    c.lineTo(px.p3.x, px.p3.y);
    c.stroke();
    c.setLineDash([]);
    c.restore();
  }

  function drawEditHandles(c) {
    if (!engine.editMode) return;
    const kf = keyframes[engine.editKeyframeIndex];
    LINE_KEYS.forEach((lineKey) => {
      const px = normToPx(kf[lineKey], engine.width, engine.height);
      if (engine.showBezierControls) {
        c.strokeStyle = 'rgba(143, 178, 214, 0.2)';
        c.lineWidth = 0.75;
        c.beginPath();
        c.moveTo(px.p0.x, px.p0.y);
        c.lineTo(px.cp1.x, px.cp1.y);
        c.lineTo(px.cp2.x, px.cp2.y);
        c.lineTo(px.p3.x, px.p3.y);
        c.stroke();
      }
      CONTROL_KEYS.forEach((ck) => {
        const p = px[ck];
        c.beginPath();
        c.fillStyle = HANDLE_COLORS[ck];
        c.arc(p.x, p.y, ck === 'p3' || ck === 'p0' ? 6 : 5, 0, Math.PI * 2);
        c.fill();
      });
    });
  }

  function render() {
    const { ctx: c } = engine;
    c.clearRect(0, 0, engine.width, engine.height);
    const reveal = engine.params.reveal;

    engine.lines.forEach((line) => {
      const px = getLineRenderCurve(line);
      drawBezier(c, px, line.color, line.width, reveal);

      if (engine.showTarget) drawDebugCurve(c, line.target, 'rgba(196, 154, 58, 0.6)', 0.7);
      if (engine.showCurrent) drawDebugCurve(c, line.current, 'rgba(143, 178, 214, 0.5)', 0.55);
    });

    drawEditHandles(c);
  }

  function tick(now) {
    engine.rafId = requestAnimationFrame(tick);
    if (document.hidden) return;
    if (now - engine.lastFrame < engine.frameMs) return;
    engine.lastFrame = now;
    engine.time = now;

    if (engine.running) {
      updateTargets();
      stepEase();
      updateReveal();
    }

    render();
  }

  function syncScroll(progress) {
    if (engine.paused || engine.manualProgress != null) return;
    engine.scrollProgress = progress;
    updateTargets();
    updateReveal();
  }

  function initScroll() {
    if (reduced || !scrollRoot) return;
    engine.scrollTrigger = ScrollTrigger.create({
      trigger: scrollRoot,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
      onUpdate: (self) => syncScroll(self.progress),
    });
    syncScroll(engine.scrollTrigger.progress || 0);
  }

  resize();
  updateTargets();
  render();

  if (reduced) {
    engine.manualProgress = 0.5;
    updateTargets();
    engine.lines.forEach((line) => {
      line.current = clonePxCurve(line.target);
    });
    engine.params.reveal = 0.6;
    render();
  } else {
    initScroll();
    engine.rafId = requestAnimationFrame(tick);
  }

  const onResize = () => {
    resize();
    updateTargets();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize);
  engine.cleanupFns.push(() => window.removeEventListener('resize', onResize));

  if (typeof ResizeObserver !== 'undefined' && scrollRoot) {
    engine.resizeObserver = new ResizeObserver(onResize);
    engine.resizeObserver.observe(scrollRoot);
    engine.cleanupFns.push(() => engine.resizeObserver?.disconnect());
  }

  engine.render = render;
  engine.updateTargets = updateTargets;

  return engine;
}

export function destroyTrionnLinesEngine(engine) {
  if (!engine) return;
  if (engine.rafId) cancelAnimationFrame(engine.rafId);
  engine.scrollTrigger?.kill();
  engine.cleanupFns.forEach((fn) => fn());
}

export function setEngineParams(engine, partial) {
  Object.assign(engine.params, partial);
}

export function setManualProgress(engine, progress) {
  engine.manualProgress = clamp(progress, 0, 1);
  engine.paused = true;
  engine.scrollTrigger?.disable();
  engine.updateTargets();
}

export function resumeScroll(engine) {
  engine.manualProgress = null;
  engine.paused = false;
  engine.scrollTrigger?.enable();
}

export function pauseScroll(engine) {
  engine.paused = true;
  engine.scrollTrigger?.disable();
}

export function jumpToKeyframeProgress(engine, progress) {
  setManualProgress(engine, progress);
  engine.render();
}

export function enterEditMode(engine, keyframeIndex = 0) {
  engine.editMode = true;
  engine.editKeyframeIndex = clamp(keyframeIndex, 0, engine.keyframes.length - 1);
  engine.paused = true;
  engine.canvas.style.pointerEvents = 'auto';
  engine.scrollTrigger?.disable();
}

export function exitEditMode(engine) {
  engine.editMode = false;
  engine.canvas.style.pointerEvents = 'none';
  if (engine.manualProgress == null) {
    engine.paused = false;
    engine.scrollTrigger?.enable();
  }
}

export function setEditControl(engine, keyframeIndex, lineKey, controlKey, normX, normY) {
  const kf = engine.keyframes[keyframeIndex];
  if (!kf) return;
  kf[lineKey][controlKey] = [clamp(normX, -0.25, 1.25), clamp(normY, -0.25, 1.2)];
  engine.updateTargets();
}

export function restoreKeyframes(engine) {
  engine.keyframes = engine.baseKeyframes.map(cloneKeyframe);
  engine.updateTargets();
}

export function hitTestEditHandle(engine, clientX, clientY) {
  if (!engine.editMode) return null;
  const kf = engine.keyframes[engine.editKeyframeIndex];
  const rect = engine.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  let best = null;
  let bestDist = 12;

  LINE_KEYS.forEach((lineKey) => {
    CONTROL_KEYS.forEach((ck) => {
      const p = denormPoint(kf[lineKey][ck], engine.width, engine.height);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = { keyframeIndex: engine.editKeyframeIndex, lineKey, controlKey: ck };
      }
    });
  });

  return best;
}

export function normFromClient(engine, clientX, clientY) {
  const rect = engine.canvas.getBoundingClientRect();
  return [(clientX - rect.left) / engine.width, (clientY - rect.top) / engine.height];
}

export { HANDLE_COLORS, KEYFRAMES as LINE_LAB_KEYFRAMES };
