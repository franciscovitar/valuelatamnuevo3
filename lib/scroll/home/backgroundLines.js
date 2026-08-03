import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const TABLET_QUERY = '(max-width: 1024px)';
const MOBILE_QUERY = '(max-width: 760px)';

/** Desfase máximo entre líneas del haz (0–3 %) */
const LINE_STAGGER = {
  primary: 0,
  secondary: 0.015,
  brass: 0.028,
};

/** Lane horizontal (0–1) y altura relativa dentro de cada sección */
const SECTION_LINE_CONFIG = {
  hero: { lane: 0.68, yRatio: 0.58 },
  metrics: { lane: 0.72, yRatio: 0.38 },
  partners: { lane: 0.28, yRatio: 0.52 },
  solutions: { lane: 0.74, yRatio: 0.32 },
  'why-us': { lane: 0.26, yRatio: 0.46 },
  process: { lane: 0.24, yRatio: 0.42 },
  regulation: { lane: 0.7, yRatio: 0.38 },
  team: { lane: 0.32, yRatio: 0.44 },
  referrals: { lane: 0.64, yRatio: 0.4 },
  contact: { lane: 0.66, yRatio: 0.34 },
};

const SECTION_SELECTORS = [
  { key: 'hero', selector: '.video-hero' },
  { key: 'metrics', selector: '[data-vl-home-section="metrics"]' },
  { key: 'partners', selector: '[data-vl-home-section="partners"]' },
  { key: 'solutions', selector: '[data-vl-home-section="solutions"]' },
  { key: 'why-us', selector: '[data-vl-home-section="why-us"]' },
  { key: 'process', selector: '[data-vl-home-section="process"]' },
  { key: 'regulation', selector: '[data-vl-home-section="regulation"]' },
  { key: 'team', selector: '[data-vl-home-section="team"]' },
  { key: 'referrals', selector: '[data-vl-home-section="referrals"]' },
  { key: 'contact', selector: '[data-vl-home-section="contact"]' },
];

const LINE_OFFSETS = {
  primary: { x: 0, y: 0 },
  secondary: { x: -18, y: -6 },
  brass: { x: 16, y: 8 },
};

const FRAME_MS = 33;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function offsetPoints(points, xOff, yOff) {
  const last = points.length - 1;
  return points.map((p, i) => {
    const damp = i === 0 || i === last ? 0.45 : 1;
    return { x: p.x + xOff * damp, y: p.y + yOff * damp };
  });
}

function deformPoints(base, time, amplitude) {
  if (!amplitude) return base.map((p) => ({ ...p }));

  const last = base.length - 1;
  return base.map((p, i) => {
    const damp = i === 0 || i === last ? 0.28 : 1;
    const phase = i * 1.65 + (p.phase || 0);
    const ox =
      (Math.sin(time * 0.00024 + phase) * amplitude.x +
        Math.sin(time * 0.00016 + phase * 1.25) * amplitude.x * 0.35) *
      damp;
    const oy = Math.cos(time * 0.0002 + phase * 0.85) * amplitude.y * damp;
    return { x: p.x + ox, y: p.y + oy };
  });
}

function computeAnchors(main, width, height) {
  const margin = width * 0.08;
  const mainTop = main.getBoundingClientRect().top + window.scrollY;
  const anchors = [];

  anchors.push({
    x: clamp(width * 0.58, margin, width - margin),
    y: 32,
    phase: 0.2,
  });

  SECTION_SELECTORS.forEach(({ key, selector }, index) => {
    const el = main.querySelector(selector);
    if (!el) return;

    const config = SECTION_LINE_CONFIG[key] || { lane: 0.5, yRatio: 0.42 };
    const rect = el.getBoundingClientRect();
    const y = rect.top + window.scrollY - mainTop + rect.height * config.yRatio;

    anchors.push({
      x: clamp(width * config.lane, margin, width - margin),
      y: clamp(y, 48, height - 48),
      phase: index * 0.9 + config.lane,
    });
  });

  anchors.push({
    x: clamp(width * 0.42, margin, width - margin),
    y: height - 40,
    phase: 2.4,
  });

  return anchors;
}

function simplifyAnchorsForMobile(anchors) {
  if (anchors.length <= 4) return anchors;
  const picked = [anchors[0]];
  for (let i = 1; i < anchors.length - 1; i += 2) {
    picked.push(anchors[i]);
  }
  picked.push(anchors[anchors.length - 1]);
  return picked;
}

function getViewportMode() {
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  const tablet = window.matchMedia(TABLET_QUERY).matches;
  return { mobile, tablet };
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
 * Sistema de líneas SVG en main — recorrido por secciones, scroll global, haz de 3 paths.
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
    width: 0,
    height: 0,
    time: 0,
    lastFrame: 0,
    rafId: null,
    organic: true,
    visibleLines: ['primary', 'secondary', 'brass'],
  };

  function applyDash(lineKey, drawProgress) {
    const path = paths[lineKey];
    if (!path) return;
    const stagger = LINE_STAGGER[lineKey] || 0;
    const visible = clamp(drawProgress - stagger, 0, 1);
    const len = path.getTotalLength();
    if (!len) return;
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len * (1 - visible)}`;
    updateTip(path, tips[lineKey], visible);
  }

  function renderPaths(deformedBase) {
    state.visibleLines.forEach((key) => {
      const path = paths[key];
      if (!path) return;
      const offset = LINE_OFFSETS[key] || { x: 0, y: 0 };
      const points = offsetPoints(deformedBase, offset.x, offset.y);
      path.setAttribute('d', buildSmoothPath(points));
    });

    state.visibleLines.forEach((key) => {
      applyDash(key, state.scrollProgress);
    });
  }

  function layout() {
    const { mobile, tablet } = getViewportMode();
    state.organic = !ctx?.reduced && !mobile;
    state.visibleLines = mobile
      ? ['primary', 'secondary']
      : ['primary', 'secondary', 'brass'];

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

    layer.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    let anchors = computeAnchors(main, width, height);
    if (mobile) anchors = simplifyAnchorsForMobile(anchors);
    else if (tablet && anchors.length > 6) {
      anchors = anchors.filter((_, i) => i === 0 || i === anchors.length - 1 || i % 2 === 0);
    }

    state.baseAnchors = anchors;
    renderPaths(state.baseAnchors);
  }

  function tick(now) {
    state.rafId = window.requestAnimationFrame(tick);

    if (now - state.lastFrame < FRAME_MS) return;
    state.lastFrame = now;

    if (!state.organic) return;

    state.time = now;
    const { mobile, tablet } = getViewportMode();
    const amplitude = mobile
      ? null
      : tablet
        ? { x: 4, y: 2.5 }
        : { x: 7, y: 4 };

    const deformed = deformPoints(state.baseAnchors, state.time, amplitude);
    renderPaths(deformed);
  }

  function setProgress(progress) {
    state.scrollProgress = clamp(progress, 0, 1);
    if (!state.organic) {
      renderPaths(state.baseAnchors);
    } else {
      state.visibleLines.forEach((key) => applyDash(key, state.scrollProgress));
    }
  }

  layout();
  layer.classList.add('is-ready');

  if (ctx?.reduced) {
    layout();
    setProgress(0.38);
    layer.classList.add('is-reduced');
    state.visibleLines.forEach((key) => {
      const path = paths[key];
      if (!path) return;
      const len = path.getTotalLength();
      if (!len) return;
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len * 0.62}`;
    });

    pushCleanup(cleanups, () => {
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
    });
    return;
  }

  const st = ScrollTrigger.create({
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

  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        layout();
        ScrollTrigger.refresh();
      })
    : null;

  ro?.observe(main);

  const onResize = () => {
    layout();
    ScrollTrigger.refresh();
  };

  window.addEventListener('resize', onResize);

  pushCleanup(cleanups, () => {
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    st.kill();
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
  });
}
