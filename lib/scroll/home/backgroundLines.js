import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';
import {
  LINE_KEYS,
  WORLD_WIDTH,
  VIEWPORT_HEIGHT,
  NODE_COLOR,
  HISTORY_LINE_STYLE,
  ACTIVE_LINE_STYLE,
  resolveLineState,
  resolveCameraTop,
  resolveHomeHeadScreenY,
  resolveConvergenceState,
} from '@/lib/line-lab/trionnLinesEngine';

const START_SELECTOR = '[data-vl-home-section="metrics"]';
const END_SELECTOR = '[data-vl-home-section="contact"]';

const SECTION_SELECTORS = {
  metrics: '[data-vl-home-section="metrics"]',
  partners: '[data-vl-home-section="partners"]',
  solutions: '[data-vl-home-section="solutions"]',
  whyUs: '[data-vl-home-section="why-us"]',
  process: '[data-vl-home-section="process"]',
  regulation: '[data-vl-home-section="regulation"]',
  team: '[data-vl-home-section="team"]',
  contact: '[data-vl-home-section="contact"]',
};

const DEBUG_QUERY_KEY = 'lineDebug';
const DEBUG_METRICS_EVENT = 'vl-line-debug-metrics';
const HEAD_COLLISION_MARGIN = 4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function getDocumentTop(element) {
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
  return element.getBoundingClientRect().top + scrollY;
}

function scrollWhenTopAtViewportFraction(element, fraction, viewportHeight) {
  return getDocumentTop(element) - viewportHeight * fraction;
}

function scrollWhenBottomAtViewportFraction(element, fraction, viewportHeight) {
  return getDocumentTop(element) + element.offsetHeight - viewportHeight * fraction;
}

function mapScrollToProgress(scrollY, anchors) {
  if (!anchors.length) return 0;
  if (scrollY <= anchors[0].scrollY) return 0;
  if (scrollY >= anchors[anchors.length - 1].scrollY) return 1;

  for (let i = 1; i < anchors.length; i += 1) {
    const previous = anchors[i - 1];
    const next = anchors[i];
    if (scrollY > next.scrollY) continue;

    const span = next.scrollY - previous.scrollY;
    if (span <= 0) return previous.progress;
    const local = (scrollY - previous.scrollY) / span;
    return lerp(previous.progress, next.progress, local);
  }

  return 1;
}

function collectSections(main) {
  const metrics = main.querySelector(SECTION_SELECTORS.metrics);
  const partners = main.querySelector(SECTION_SELECTORS.partners);
  const solutions = main.querySelector(SECTION_SELECTORS.solutions);
  const whyUs = main.querySelector(SECTION_SELECTORS.whyUs);
  const process = main.querySelector(SECTION_SELECTORS.process);
  const regulation = main.querySelector(SECTION_SELECTORS.regulation);
  const team = main.querySelector(SECTION_SELECTORS.team);
  const contact = main.querySelector(SECTION_SELECTORS.contact);

  if (!metrics || !partners || !solutions || !whyUs || !process || !regulation || !team || !contact) return null;

  return {
    metrics,
    partners,
    solutions,
    whyUs,
    process,
    regulation,
    team,
    contact,
  };
}

function buildProgressAnchors(sections, viewportHeight) {
  const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 0);
  const anchors = [
    { scrollY: scrollWhenTopAtViewportFraction(sections.metrics, 1.0, viewportHeight), progress: 0.0 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.metrics, 0.62, viewportHeight), progress: 0.08 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.partners, 0.62, viewportHeight), progress: 0.18 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.solutions, 0.62, viewportHeight), progress: 0.3 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.whyUs, 0.62, viewportHeight), progress: 0.42 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.process, 0.62, viewportHeight), progress: 0.56 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.regulation, 0.62, viewportHeight), progress: 0.7 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.team, 0.62, viewportHeight), progress: 0.84 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.contact, 0.62, viewportHeight), progress: 0.96 },
    { scrollY: scrollWhenBottomAtViewportFraction(sections.contact, 0.62, viewportHeight), progress: 1.0 },
  ].map((anchor) => ({
    ...anchor,
    scrollY: clamp(anchor.scrollY, 0, maxScroll),
  }));

  return anchors.sort((a, b) => a.scrollY - b.scrollY);
}

function buildOpacityEnvelope(sections, viewportHeight) {
  const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 0);
  const fadeInStart = clamp(scrollWhenTopAtViewportFraction(sections.metrics, 1.0, viewportHeight), 0, maxScroll);
  const fadeInEnd = clamp(scrollWhenTopAtViewportFraction(sections.metrics, 0.72, viewportHeight), 0, maxScroll);
  const rawFadeOutStart = clamp(scrollWhenBottomAtViewportFraction(sections.contact, 0.4, viewportHeight), 0, maxScroll);
  const rawFadeOutEnd = clamp(scrollWhenBottomAtViewportFraction(sections.contact, 0.0, viewportHeight), 0, maxScroll);
  const fadeOutEnd = Math.max(rawFadeOutStart, rawFadeOutEnd);
  const fadeOutStart = Math.min(rawFadeOutStart, Math.max(0, fadeOutEnd - 1));

  return {
    fadeInStart,
    fadeInEnd,
    fadeOutStart,
    fadeOutEnd,
  };
}

function resolveProfileKey() {
  const width = Math.max(window.innerWidth || 0, 0);
  if (width <= 760) return 'mobile';
  if (width <= 1160) return 'tablet';
  return 'desktop';
}

function isDebugMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(DEBUG_QUERY_KEY) === '1';
}

function worldPointFromClient(svgRect, cameraTop, clientX, clientY) {
  const x = ((clientX - svgRect.left) / Math.max(svgRect.width, 1)) * WORLD_WIDTH;
  const y = cameraTop + ((clientY - svgRect.top) / Math.max(svgRect.height, 1)) * VIEWPORT_HEIGHT;
  return [x, y];
}

function collectProtectedElements(main) {
  const selectors = [
    '[data-vl-home-section="why-us"] .pullquote',
    '[data-vl-home-section="solutions"] .sol-card',
    '[data-vl-home-section="process"] .step',
    '[data-vl-home-section="regulation"] .reg-seal-panel',
    '[data-vl-home-section="regulation"] .seals .seal',
    '[data-vl-home-section="team"] .person',
    '[data-vl-home-section="contact"] form',
  ];

  return selectors.flatMap((selector) => Array.from(main.querySelectorAll(selector)));
}

function buildProtectedRects(main, svg, cameraTop) {
  const svgRect = svg.getBoundingClientRect();
  const protectedElements = collectProtectedElements(main);

  return protectedElements.map((element) => {
    const rect = element.getBoundingClientRect();
    const [x1, y1] = worldPointFromClient(svgRect, cameraTop, rect.left, rect.top);
    const [x2, y2] = worldPointFromClient(svgRect, cameraTop, rect.right, rect.bottom);
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  });
}

function pointInsideRect(point, rect, margin = 0) {
  return (
    point[0] >= rect.x - margin
    && point[0] <= rect.x + rect.width + margin
    && point[1] >= rect.y - margin
    && point[1] <= rect.y + rect.height + margin
  );
}

function renderDebugOverlay(debugOverlay, rects, lineStates, mergeAmount) {
  if (!debugOverlay) return;
  const rectMarkup = rects
    .map((rect) => `<rect class="vl-bg-lines__debug-box" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" />`)
    .join('');

  const headsMarkup = LINE_KEYS
    .map((key) => {
      const [cx, cy] = lineStates[key].headPoint;
      return `<ellipse class="vl-bg-lines__debug-head" cx="${cx}" cy="${cy}" rx="2.4" ry="2.4" />`;
    })
    .join('');

  debugOverlay.setAttribute('opacity', '1');
  debugOverlay.innerHTML = `${rectMarkup}${headsMarkup}`;
  debugOverlay.setAttribute('data-merge', `${mergeAmount}`);
}

function clearDebugOverlay(debugOverlay) {
  if (!debugOverlay) return;
  debugOverlay.setAttribute('opacity', '0');
  debugOverlay.innerHTML = '';
}

/**
 * Owns exactly one ScrollTrigger for the whole home run — start at Metrics,
 * end at Contact. All geometry/camera/render logic is reused from line-lab engine.
 */
export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');
  if (!main) return;

  const layer = main.querySelector('[data-vl-bg-lines-root]');
  const svg = layer?.querySelector('[data-vl-bg-lines-svg]');
  const world = svg?.querySelector('[data-vl-bg-lines-world]');
  const sharedNode = world?.querySelector('[data-vl-shared-node]');
  const sharedNodeHalo = sharedNode?.querySelector('[data-vl-shared-node-halo]');
  const sharedNodeCore = sharedNode?.querySelector('[data-vl-shared-node-core]');
  const debugOverlay = world?.querySelector('[data-vl-lines-debug-overlay]');

  if (!layer || !svg || !world || !sharedNode || !sharedNodeHalo || !sharedNodeCore) return;
  if (ctx?.reduced) {
    layer.style.opacity = '0';
    pushCleanup(cleanups, () => layer.style.removeProperty('opacity'));
    return;
  }

  const sections = collectSections(main);
  if (!sections) return;

  const lineElements = LINE_KEYS.reduce((acc, key) => {
    const group = world.querySelector(`[data-vl-line-group="${key}"]`);
    const historyTrail = group?.querySelector(`[data-vl-history-trail="${key}"]`);
    const activeTrail = group?.querySelector(`[data-vl-active-trail="${key}"]`);
    const node = group?.querySelector(`[data-vl-node="${key}"]`);
    const nodeHalo = node?.querySelector(`[data-vl-node-halo="${key}"]`);
    const nodeCore = node?.querySelector(`[data-vl-node-core="${key}"]`);
    if (!group || !historyTrail || !activeTrail || !node || !nodeHalo || !nodeCore) return null;
    acc[key] = { group, historyTrail, activeTrail, node, nodeHalo, nodeCore };
    return acc;
  }, {});

  if (!lineElements || LINE_KEYS.some((key) => !lineElements[key])) return;

  let disposed = false;
  let progressAnchors = [];
  let opacityEnvelope = null;
  let profileKey = 'desktop';
  const debugEnabled = isDebugMode();
  const debugMetrics = [];

  const applyNodeRadii = () => {
    const viewportWidth = Math.max(window.innerWidth, 1);
    const viewportHeight = Math.max(window.innerHeight, 1);
    const worldUnitsPerPixelX = WORLD_WIDTH / viewportWidth;
    const worldUnitsPerPixelY = VIEWPORT_HEIGHT / viewportHeight;

    const coreRx = 1.05 * worldUnitsPerPixelX;
    const coreRy = 1.05 * worldUnitsPerPixelY;
    const haloRx = 2.5 * worldUnitsPerPixelX;
    const haloRy = 2.5 * worldUnitsPerPixelY;

    LINE_KEYS.forEach((key) => {
      const { nodeHalo, nodeCore } = lineElements[key];
      nodeHalo.setAttribute('rx', `${haloRx}`);
      nodeHalo.setAttribute('ry', `${haloRy}`);
      nodeCore.setAttribute('rx', `${coreRx}`);
      nodeCore.setAttribute('ry', `${coreRy}`);
    });

    sharedNodeHalo.setAttribute('rx', `${haloRx}`);
    sharedNodeHalo.setAttribute('ry', `${haloRy}`);
    sharedNodeCore.setAttribute('rx', `${coreRx}`);
    sharedNodeCore.setAttribute('ry', `${coreRy}`);
  };

  const recalcAnchors = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    progressAnchors = buildProgressAnchors(sections, viewportHeight);
    opacityEnvelope = buildOpacityEnvelope(sections, viewportHeight);
    profileKey = resolveProfileKey();
  };

  const renderProgress = (inputProgress) => {
    if (disposed) return;

    const progress = clamp01(inputProgress);
    const desiredHeadScreenY = resolveHomeHeadScreenY(progress, profileKey);
    const cameraTop = resolveCameraTop(progress, {
      mode: 'home',
      profileKey,
      desiredHeadScreenY,
    });
    svg.setAttribute('viewBox', `0 ${cameraTop} ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`);

    const convergenceState = resolveConvergenceState(progress);
    const individualNodeOpacity = Math.max(0, 1 - convergenceState.mergeAmount);
    const lineStates = {};

    LINE_KEYS.forEach((lineKey) => {
      const { historyTrail, activeTrail, node, nodeHalo, nodeCore } = lineElements[lineKey];
      const state = resolveLineState(progress, lineKey, {
        profileKey,
      });
      lineStates[lineKey] = state;
      const [cx, cy] = state.headPoint;
      const showNode = state.headU > 0.002;

      historyTrail.setAttribute('d', state.historyTrailD);
      activeTrail.setAttribute('d', state.activeTrailD);
      node.setAttribute('opacity', showNode ? `${individualNodeOpacity}` : '0');
      nodeHalo.setAttribute('cx', `${cx}`);
      nodeHalo.setAttribute('cy', `${cy}`);
      nodeCore.setAttribute('cx', `${cx}`);
      nodeCore.setAttribute('cy', `${cy}`);
    });

    const sharedPoint = lineStates.outer.headPoint;
    sharedNode.setAttribute('opacity', `${convergenceState.mergeAmount}`);
    sharedNodeHalo.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeHalo.setAttribute('cy', `${sharedPoint[1]}`);
    sharedNodeCore.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeCore.setAttribute('cy', `${sharedPoint[1]}`);

    if (debugEnabled && process.env.NODE_ENV !== 'production') {
      const rects = buildProtectedRects(main, svg, cameraTop);
      const collisions = [];

      LINE_KEYS.forEach((lineKey) => {
        const state = lineStates[lineKey];
        const hit = rects.some((rect) => pointInsideRect(state.headPoint, rect, HEAD_COLLISION_MARGIN));
        if (hit) collisions.push(lineKey);
      });

      debugMetrics.push({
        progress,
        profileKey,
        mergeAmount: convergenceState.mergeAmount,
        collisions,
        spread: lineStates.inner.headPoint[0] - lineStates.outer.headPoint[0],
      });

      renderDebugOverlay(debugOverlay, rects, lineStates, convergenceState.mergeAmount);

      if (collisions.length) {
        // Keep runtime diagnostics explicit for visual QA sessions.
        console.warn('[vl-lines][debug] head collision detected', {
          progress,
          profileKey,
          collisions,
        });
      }
    }
  };

  const applyLayerOpacity = (scrollY) => {
    if (!opacityEnvelope) return;
    const fadeIn = smoothstep(opacityEnvelope.fadeInStart, opacityEnvelope.fadeInEnd, scrollY);
    const fadeOut = 1 - smoothstep(opacityEnvelope.fadeOutStart, opacityEnvelope.fadeOutEnd, scrollY);
    layer.style.opacity = `${clamp01(fadeIn * fadeOut)}`;
  };

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: sections.contact,
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (disposed) return;
      const scrollY = self.scroll();
      const progress = mapScrollToProgress(scrollY, progressAnchors);
      renderProgress(progress);
      applyLayerOpacity(scrollY);
    },
    onRefresh: (self) => {
      if (disposed) return;
      recalcAnchors();
      applyNodeRadii();
      const scrollY = self.scroll();
      const progress = mapScrollToProgress(scrollY, progressAnchors);
      renderProgress(progress);
      applyLayerOpacity(scrollY);
    },
  });

  recalcAnchors();
  applyNodeRadii();
  LINE_KEYS.forEach((lineKey) => {
    const element = lineElements[lineKey];
    element.group.style.setProperty('--node-color', NODE_COLOR);
    element.historyTrail.style.stroke = HISTORY_LINE_STYLE[lineKey].color;
    element.historyTrail.style.strokeWidth = `${HISTORY_LINE_STYLE[lineKey].width}`;
    element.activeTrail.style.stroke = ACTIVE_LINE_STYLE[lineKey].color;
    element.activeTrail.style.strokeWidth = `${ACTIVE_LINE_STYLE[lineKey].width}`;
  });
  const initialScroll = trigger.scroll();
  const initialProgress = mapScrollToProgress(initialScroll, progressAnchors);
  renderProgress(initialProgress);
  applyLayerOpacity(initialScroll);

  pushCleanup(cleanups, () => {
    disposed = true;
    trigger.kill();
    layer.style.removeProperty('opacity');
    svg.setAttribute('viewBox', `0 0 ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`);
    sharedNode.removeAttribute('opacity');
    if (debugEnabled && process.env.NODE_ENV !== 'production') {
      clearDebugOverlay(debugOverlay);
      window.dispatchEvent(new CustomEvent(DEBUG_METRICS_EVENT, { detail: debugMetrics }));
      window.__vlLineDebugMetrics = debugMetrics;
    }

    LINE_KEYS.forEach((lineKey) => {
      const { group, node, historyTrail, activeTrail } = lineElements[lineKey];
      group.style.removeProperty('--node-color');
      node.removeAttribute('opacity');
      historyTrail.style.removeProperty('stroke');
      historyTrail.style.removeProperty('stroke-width');
      activeTrail.style.removeProperty('stroke');
      activeTrail.style.removeProperty('stroke-width');
      historyTrail.removeAttribute('d');
      activeTrail.removeAttribute('d');
    });
  });
}
