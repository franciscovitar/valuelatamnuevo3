import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const TABLET_QUERY = '(max-width: 1024px)';
const MOBILE_QUERY = '(max-width: 760px)';
const SAMPLE_COUNT = 100;
const FRAME_MS = 33;

const LINE_KEYS = ['primary', 'secondary', 'brass'];
const MOBILE_LINE_KEYS = ['primary', 'secondary'];

const LINE_STAGGER = {
  primary: 0,
  secondary: 0.008,
  brass: 0.016,
};

const LINE_TIME_OFFSET = {
  primary: 0,
  secondary: 680,
  brass: 1420,
};

const LINE_PHASE = {
  primary: 0,
  secondary: 1.4,
  brass: 2.8,
};

/** Lanes alternados — sin smoothing que aplaste el movimiento lateral */
const ROUTE_ANCHORS = [
  { key: 'start', lane: 0.18, fixedY: 32 },
  { key: 'hero', selector: '.video-hero', lane: 0.68, yRatio: 0.55 },
  { key: 'metrics', selector: '[data-vl-home-section="metrics"]', lane: 0.76, yRatio: 0.4 },
  { key: 'partners', selector: '[data-vl-home-section="partners"]', lane: 0.22, yRatio: 0.5 },
  { key: 'solutions', selector: '[data-vl-home-section="solutions"]', lane: 0.78, yRatio: 0.35 },
  { key: 'why-us', selector: '[data-vl-home-section="why-us"]', lane: 0.18, yRatio: 0.45 },
  { key: 'process', selector: '[data-vl-home-section="process"]', lane: 0.72, yRatio: 0.4 },
  { key: 'regulation', selector: '[data-vl-home-section="regulation"]', lane: 0.24, yRatio: 0.38 },
  { key: 'team', selector: '[data-vl-home-section="team"]', lane: 0.78, yRatio: 0.42 },
  { key: 'referrals', selector: '[data-vl-home-section="referrals"]', lane: 0.2, yRatio: 0.4 },
  { key: 'contact', selector: '[data-vl-home-section="contact"]', lane: 0.68, yRatio: 0.32 },
  { key: 'end', lane: 0.38, fixedY: null },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getViewportMode() {
  return {
    mobile: window.matchMedia(MOBILE_QUERY).matches,
    tablet: window.matchMedia(TABLET_QUERY).matches,
  };
}

function getViewportBand(mobile, tablet) {
  if (mobile) return { target: 0.71, min: 0.66, max: 0.76 };
  if (tablet) return { target: 0.675, min: 0.63, max: 0.72 };
  return { target: 0.65, min: 0.61, max: 0.69 };
}

function getFloatConfig(mobile, tablet) {
  if (mobile) {
    return { cp1X: 10, cp2X: 12, cp1Y: 5.5, cp2Y: 6.5, anchorAmp: 5 };
  }
  if (tablet) {
    return { cp1X: 17, cp2X: 20, cp1Y: 8.5, cp2Y: 10, anchorAmp: 6 };
  }
  return { cp1X: 25, cp2X: 28, cp1Y: 11.5, cp2Y: 13, anchorAmp: 6.5 };
}

function segmentVariation(index) {
  const s = Math.sin(index * 2.417 + 0.83) * 0.5 + 0.5;
  const c = Math.cos(index * 1.673 + 1.21) * 0.5 + 0.5;
  const r = Math.sin(index * 3.891 + 2.47) * 0.5 + 0.5;
  return {
    laneJitter: (s - 0.5) * 0.13,
    curveBias: (c - 0.5) * 0.38,
    spreadBias: 0.95 + s * 0.42,
    yBias: (r - 0.5) * 0.07,
    bulgeFlip: r > 0.38 ? -1 : 1,
    tLenScale: 0.78 + c * 0.44,
    splitShift: (r - 0.5) * 0.14,
  };
}

function computeBaseAnchors(main, width, height) {
  const margin = width * 0.06;
  const mainTop = main.getBoundingClientRect().top + window.scrollY;
  const anchors = [];

  ROUTE_ANCHORS.forEach((cfg, index) => {
    let y;
    if (cfg.fixedY != null && cfg.key === 'start') {
      y = cfg.fixedY;
    } else if (cfg.key === 'end') {
      y = height - 40;
    } else if (cfg.selector) {
      const el = main.querySelector(cfg.selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vary = segmentVariation(index);
      y = rect.top + window.scrollY - mainTop + rect.height * (cfg.yRatio + vary.yBias);
    } else {
      return;
    }

    const vary = segmentVariation(index);
    anchors.push({
      x: clamp(width * (cfg.lane + vary.laneJitter), margin, width - margin),
      y: clamp(y, 32, height - 32),
      phase: index * 1.15 + cfg.lane * 2 + vary.curveBias * 3,
    });
  });

  for (let i = 1; i < anchors.length; i += 1) {
    if (anchors[i].y <= anchors[i - 1].y + 28) {
      anchors[i].y = anchors[i - 1].y + 28;
    }
  }

  if (anchors.length) {
    anchors[anchors.length - 1].y = Math.min(anchors[anchors.length - 1].y, height - 40);
  }

  return anchors;
}

function simplifyAnchorsForMobile(anchors) {
  if (anchors.length <= 5) return anchors;
  const keep = [0];
  for (let i = 1; i < anchors.length - 1; i += 2) keep.push(i);
  keep.push(anchors.length - 1);
  return keep.map((i) => anchors[i]);
}

function expandAnchorsForSmoothTurns(anchors, width) {
  if (anchors.length < 2) return anchors;

  const result = [{ ...anchors[0] }];
  for (let i = 1; i < anchors.length; i += 1) {
    const prev = result[result.length - 1];
    const curr = anchors[i];
    const laneJump = Math.abs(curr.x - prev.x);
    const vary = segmentVariation(i + 1);

    if (laneJump > width * 0.34) {
      const t = 0.4 + vary.curveBias * 0.14;
      const midY = prev.y + (curr.y - prev.y) * t;
      const midX = prev.x + (curr.x - prev.x) * (0.32 + vary.curveBias * 0.1);
      const bow = (prev.x > curr.x ? 1 : -1) * width * (0.04 + Math.abs(vary.curveBias) * 0.03);

      result.push({
        x: midX + bow,
        y: midY,
        phase: (prev.phase + curr.phase) * 0.5 + vary.curveBias * 2,
      });
    }

    result.push({ ...curr });
  }

  return result;
}

function buildSegmentControls(start, end, segmentIndex, prevAnchor, nextAnchor, width) {
  const dx = end.x - start.x;
  const dy = Math.max(end.y - start.y, 1);
  const vary = segmentVariation(segmentIndex);

  const split1 = clamp(0.32 + vary.splitShift, 0.24, 0.5);
  const split2 = clamp(0.68 + vary.splitShift * 0.5, 0.5, 0.8);
  const hLen = Math.max(Math.abs(dx) * 0.58, width * 0.13) * vary.tLenScale;
  const bulge = (dx >= 0 ? 1 : -1) * vary.bulgeFlip;

  let cp1x = start.x + bulge * hLen * 0.5 + dx * 0.06;
  let cp1y = start.y + dy * split1;
  let cp2x = end.x - bulge * hLen * 0.46 + dx * 0.05;
  let cp2y = start.y + dy * split2;

  cp1x += vary.curveBias * width * 0.045;
  cp2x -= vary.curveBias * width * 0.038;
  cp1y += vary.laneJitter * dy * 0.12;
  cp2y -= vary.laneJitter * dy * 0.08;

  cp1y = Math.max(cp1y, start.y + dy * 0.05);
  cp2y = Math.max(cp2y, cp1y + dy * 0.04);
  if (cp2y >= end.y) cp2y = end.y - Math.max(22, dy * 0.028);

  const turnAtStart =
    prevAnchor != null && (start.x - prevAnchor.x) * dx < 0;
  const turnAtEnd =
    nextAnchor != null && (nextAnchor.x - end.x) * dx < 0;

  return {
    start: { x: start.x, y: start.y },
    cp1: { x: cp1x, y: cp1y },
    cp2: { x: cp2x, y: cp2y },
    end: { x: end.x, y: end.y },
    phase: (start.phase + end.phase) * 0.5 + vary.curveBias,
    turnAtStart,
    turnAtEnd,
  };
}

/** Tangentes amplias en giros — una sola vuelta fluida, sin ángulos */
function softenTurns(segments, width) {
  for (let i = 0; i < segments.length - 1; i += 1) {
    const curr = segments[i];
    const next = segments[i + 1];
    const inDx = curr.end.x - curr.start.x;
    const outDx = next.end.x - next.start.x;
    if (inDx * outDx >= 0) continue;

    const ax = curr.end.x;
    const ay = curr.end.y;
    const dyIn = ay - curr.start.y;
    const dyOut = next.end.y - ay;
    const handle = clamp(Math.min(Math.abs(inDx), Math.abs(outDx)) * 0.58, 100, width * 0.22);

    const tangentX = inDx * 0.28 + outDx * 0.28;
    const tangentY = Math.max(dyIn, dyOut, 48) * 0.92;
    const tLen = Math.hypot(tangentX, tangentY) || 1;
    const tx = tangentX / tLen;
    const ty = tangentY / tLen;

    curr.cp2 = { x: ax - tx * handle, y: ay - ty * handle * 0.08 };
    next.cp1 = { x: ax + tx * handle, y: ay + ty * handle * 0.08 };
  }

  return segments;
}

function buildBaseSegments(anchors, width) {
  const segments = [];
  for (let i = 0; i < anchors.length - 1; i += 1) {
    segments.push(
      buildSegmentControls(
        anchors[i],
        anchors[i + 1],
        i,
        anchors[i - 1] || null,
        anchors[i + 2] || null,
        width,
      ),
    );
  }
  return softenTurns(segments, width);
}

function segmentPerpOffset(segment, amount) {
  const dx = segment.end.x - segment.start.x;
  const dy = segment.end.y - segment.start.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: (-dy / len) * amount, y: (dx / len) * amount };
}

function applyLineVariant(segment, lineKey, segmentIndex) {
  if (lineKey === 'primary') return segment;

  const dx = segment.end.x - segment.start.x;
  const sign = dx >= 0 ? 1 : -1;
  const vary = segmentVariation(segmentIndex);
  const fan = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(segmentIndex * 0.67 + vary.curveBias * 2.6));
  const turnDamp = segment.turnAtStart || segment.turnAtEnd ? 0.55 : 1;
  const lineSkew = lineKey === 'secondary' ? -1 : 1;
  const perp = segmentPerpOffset(segment, lineSkew * (8 + fan * 14) * turnDamp);

  if (lineKey === 'secondary') {
    const spread = (44 + fan * 68) * vary.spreadBias * turnDamp;
    return {
      ...segment,
      start: {
        x: segment.start.x + perp.x * 0.35,
        y: segment.start.y + perp.y * 0.35,
      },
      cp1: {
        x: segment.cp1.x - sign * spread * 0.7 - spread * 0.1 + perp.x,
        y: segment.cp1.y - spread * 0.24 + perp.y,
      },
      cp2: {
        x: segment.cp2.x - sign * spread * 0.9 + perp.x * 0.8,
        y: segment.cp2.y - spread * 0.18 + perp.y * 0.8,
      },
      end: {
        x: segment.end.x + perp.x * 0.3,
        y: segment.end.y + perp.y * 0.3,
      },
    };
  }

  const spread = (52 + fan * 74) * vary.spreadBias * turnDamp;
  return {
    ...segment,
    start: {
      x: segment.start.x - perp.x * 0.35,
      y: segment.start.y - perp.y * 0.35,
    },
    cp1: {
      x: segment.cp1.x + sign * spread * 0.74 + spread * 0.12 - perp.x,
      y: segment.cp1.y + spread * 0.22 - perp.y,
    },
    cp2: {
      x: segment.cp2.x + sign * spread * 0.94 - perp.x * 0.8,
      y: segment.cp2.y + spread * 0.16 - perp.y * 0.8,
    },
    end: {
      x: segment.end.x - perp.x * 0.3,
      y: segment.end.y - perp.y * 0.3,
    },
  };
}

function animateSegment(segment, time, floatConfig, lineKey, segmentIndex) {
  const phase = segment.phase + segmentIndex * 0.74 + (LINE_PHASE[lineKey] || 0);
  const t = time + (LINE_TIME_OFFSET[lineKey] || 0);
  const lineAmp = lineKey === 'primary' ? 1 : lineKey === 'secondary' ? 1.12 : 0.92;
  const { cp1X, cp2X, cp1Y, cp2Y, anchorAmp } = floatConfig;

  const deform = (pt, ampX, ampY, mult, anchor = false) => {
    const damp = anchor ? 0.38 : 1;
    const ox =
      (Math.sin(t * 0.00037 + phase * mult) * ampX +
        Math.sin(t * 0.00023 + phase * 1.08) * ampX * 0.38) *
      damp;
    const oy =
      (Math.cos(t * 0.00033 + phase * mult * 0.92) * ampY +
        Math.cos(t * 0.0002 + phase * 0.72) * ampY * 0.32) *
      damp;
    return { x: pt.x + ox, y: pt.y + oy };
  };

  return {
    start: deform(segment.start, anchorAmp, anchorAmp * 0.65, 0.45, true),
    cp1: deform(segment.cp1, cp1X * lineAmp, cp1Y * lineAmp, 1),
    cp2: deform(segment.cp2, cp2X * lineAmp, cp2Y * lineAmp, 1.55),
    end: deform(segment.end, anchorAmp, anchorAmp * 0.65, 2.05, true),
    phase: segment.phase,
  };
}

function buildPathFromSegments(segments) {
  if (!segments.length) return '';
  let d = `M ${segments[0].start.x.toFixed(1)} ${segments[0].start.y.toFixed(1)}`;
  segments.forEach((seg) => {
    d += ` C ${seg.cp1.x.toFixed(1)} ${seg.cp1.y.toFixed(1)}, ${seg.cp2.x.toFixed(1)} ${seg.cp2.y.toFixed(1)}, ${seg.end.x.toFixed(1)} ${seg.end.y.toFixed(1)}`;
  });
  return d;
}

function buildPathSamples(path) {
  const len = path.getTotalLength();
  if (!len) return [];

  const samples = [];
  for (let i = 0; i <= SAMPLE_COUNT; i += 1) {
    const ratio = i / SAMPLE_COUNT;
    const point = path.getPointAtLength(ratio * len);
    samples.push({ lengthRatio: ratio, x: point.x, y: point.y });
  }
  return samples;
}

function findLengthRatioForY(samples, targetY) {
  if (!samples.length) return 0;

  const first = samples[0];
  const last = samples[samples.length - 1];
  if (targetY <= first.y) return 0;
  if (targetY >= last.y) return 1;

  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (samples[mid].y < targetY) lo = mid + 1;
    else hi = mid;
  }

  const upper = samples[lo];
  const lower = samples[Math.max(lo - 1, 0)];
  const span = upper.y - lower.y;
  if (Math.abs(span) < 0.001) return upper.lengthRatio;

  const t = clamp((targetY - lower.y) / span, 0, 1);
  return lower.lengthRatio + (upper.lengthRatio - lower.lengthRatio) * t;
}

function updateTip(path, tip, drawProgress) {
  if (!path || !tip) return;
  const len = path.getTotalLength();
  if (!len) return;
  const at = clamp(drawProgress, 0, 1) * len;
  const point = path.getPointAtLength(at);
  tip.setAttribute('cx', point.x.toFixed(2));
  tip.setAttribute('cy', point.y.toFixed(2));
  tip.style.opacity = drawProgress > 0.008 ? '1' : '0';
}

/**
 * Tres líneas continuas — ruta global con segmentos Bézier y progreso por Y.
 */
export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');
  const layer = document.getElementById('vl-bg-lines-layer');
  const svg = document.getElementById('vl-bg-lines');

  if (!main || !layer || !svg) return;

  const paths = {
    primary: svg.querySelector('[data-vl-bg-line="primary"]'),
    secondary: svg.querySelector('[data-vl-bg-line="secondary"]'),
    brass: svg.querySelector('[data-vl-bg-line="brass"]'),
  };

  const tips = {
    primary: svg.querySelector('[data-vl-bg-tip="primary"]'),
    secondary: svg.querySelector('[data-vl-bg-tip="secondary"]'),
    brass: svg.querySelector('[data-vl-bg-tip="brass"]'),
  };

  const state = {
    scrollProgress: 0,
    baseAnchors: [],
    baseSegments: { primary: [], secondary: [], brass: [] },
    primarySamples: [],
    width: 0,
    height: 0,
    mainTop: 0,
    time: 0,
    lastFrame: 0,
    rafId: null,
    organic: !ctx?.reduced,
    floatConfig: getFloatConfig(false, false),
    visibleLines: LINE_KEYS,
    drawRatio: 0,
  };

  function getMainTop() {
    return main.getBoundingClientRect().top + window.scrollY;
  }

  function rebuildPrimarySamples() {
    const d = buildPathFromSegments(state.baseSegments.primary);
    paths.primary.setAttribute('d', d);
    state.primarySamples = buildPathSamples(paths.primary);
  }

  function computeDrawRatio() {
    const { mobile, tablet } = getViewportMode();
    const band = getViewportBand(mobile, tablet);
    const targetDocumentY =
      window.scrollY + window.innerHeight * clamp(band.target, band.min, band.max);
    const targetY = targetDocumentY - state.mainTop;

    if (!state.primarySamples.length) return clamp(state.scrollProgress, 0, 1);

    let progress = findLengthRatioForY(state.primarySamples, targetY);

    if (state.scrollProgress <= 0.01) progress = Math.min(progress, 0.03);
    if (state.scrollProgress >= 0.985) progress = Math.max(progress, 1);

    return clamp(progress, 0, 1);
  }

  function applyDash(lineKey) {
    const path = paths[lineKey];
    if (!path) return;

    const stagger = LINE_STAGGER[lineKey] || 0;
    const visible = clamp(state.drawRatio - stagger, 0, 1);
    const len = path.getTotalLength();
    if (!len) return;

    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len * (1 - visible)}`;
    updateTip(path, tips[lineKey], visible);
  }

  function applyAllDash() {
    state.drawRatio = computeDrawRatio();
    state.visibleLines.forEach((key) => applyDash(key));
  }

  function renderPaths(time) {
    state.visibleLines.forEach((lineKey) => {
      const baseSegs = state.baseSegments[lineKey];
      if (!baseSegs.length) return;

      const animated = state.organic
        ? baseSegs.map((seg, i) =>
            animateSegment(seg, time ?? state.time, state.floatConfig, lineKey, i),
          )
        : baseSegs;

      paths[lineKey].setAttribute('d', buildPathFromSegments(animated));
    });

    applyAllDash();
  }

  function layout() {
    const { mobile, tablet } = getViewportMode();
    state.organic = !ctx?.reduced;
    state.visibleLines = mobile ? MOBILE_LINE_KEYS : LINE_KEYS;
    state.floatConfig = getFloatConfig(mobile, tablet);

    Object.entries(paths).forEach(([key, path]) => {
      if (!path) return;
      path.style.display = state.visibleLines.includes(key) ? '' : 'none';
    });
    Object.entries(tips).forEach(([key, tip]) => {
      if (!tip) return;
      tip.style.display = state.visibleLines.includes(key) ? '' : 'none';
    });

    const width = Math.max(main.clientWidth, 320);
    const height = Math.max(main.scrollHeight, window.innerHeight);
    state.width = width;
    state.height = height;
    state.mainTop = getMainTop();

    layer.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    let anchors = computeBaseAnchors(main, width, height);
    if (mobile) anchors = simplifyAnchorsForMobile(anchors);
    anchors = expandAnchorsForSmoothTurns(anchors, width);

    state.baseAnchors = anchors;
    const primarySegments = buildBaseSegments(anchors, width);

    state.baseSegments.primary = primarySegments;
    state.baseSegments.secondary = primarySegments.map((seg, i) =>
      applyLineVariant(seg, 'secondary', i),
    );
    state.baseSegments.brass = primarySegments.map((seg, i) =>
      applyLineVariant(seg, 'brass', i),
    );

    rebuildPrimarySamples();
    renderPaths(state.time);
  }

  function tick(now) {
    state.rafId = window.requestAnimationFrame(tick);
    if (now - state.lastFrame < FRAME_MS) return;
    state.lastFrame = now;
    state.time = now;
    renderPaths(now);
  }

  function setProgress(progress) {
    state.scrollProgress = clamp(progress, 0, 1);
    state.mainTop = getMainTop();
    applyAllDash();
  }

  layout();
  layer.classList.add('is-ready');

  let st = null;

  function cleanup() {
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    st?.kill();
    ro?.disconnect();
    window.removeEventListener('resize', onResize);
    layer.classList.remove('is-ready', 'is-reduced');
    Object.values(paths).forEach((path) => {
      if (path) {
        path.removeAttribute('d');
        path.style.removeProperty('stroke-dasharray');
        path.style.removeProperty('stroke-dashoffset');
        path.style.removeProperty('display');
      }
    });
    Object.values(tips).forEach((tip) => {
      if (tip) {
        tip.removeAttribute('cx');
        tip.removeAttribute('cy');
        tip.style.removeProperty('opacity');
        tip.style.removeProperty('display');
      }
    });
    layer.style.removeProperty('height');
    svg.removeAttribute('viewBox');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  }

  let ro = null;
  const onResize = () => {
    layout();
    ScrollTrigger.refresh();
  };

  if (ctx?.reduced) {
    state.drawRatio = 0.38;
    renderPaths(null);
    layer.classList.add('is-reduced');
    state.visibleLines.forEach((key) => {
      const path = paths[key];
      if (!path) return;
      const len = path.getTotalLength();
      if (!len) return;
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len * 0.62}`;
    });

    pushCleanup(cleanups, cleanup);
    return;
  }

  st = ScrollTrigger.create({
    trigger: main,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => setProgress(self.progress),
    onRefresh: () => layout(),
  });

  setProgress(st.progress || 0);
  state.rafId = window.requestAnimationFrame(tick);

  ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        layout();
        ScrollTrigger.refresh();
      })
    : null;
  ro?.observe(main);

  window.addEventListener('resize', onResize);
  pushCleanup(cleanups, cleanup);
}
