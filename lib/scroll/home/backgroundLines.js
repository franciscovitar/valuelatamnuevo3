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
  resolveHomeHeadScreenY,
  resolveConvergenceState,
  getProfileRouteSamples,
  worldYToProgress,
  sliceRoute,
  pointAtRouteU,
} from '@/lib/line-lab/trionnLinesEngine';

const SECTION_SELECTORS = {
  metrics: '[data-vl-home-section="metrics"]',
  partners: '[data-vl-home-section="partners"]',
  solutions: '[data-vl-home-section="solutions"]',
  whyUs: '[data-vl-home-section="why-us"]',
  process: '[data-vl-home-section="process"]',
  regulation: '[data-vl-home-section="regulation"]',
  team: '[data-vl-home-section="team"]',
  referrals: '[data-vl-home-section="referrals"]',
  contact: '[data-vl-home-section="contact"]',
};

const DEBUG_QUERY_KEY = 'lineDebug';
const DEBUG_METRICS_EVENT = 'vl-line-debug-metrics';
const HEAD_COLLISION_MARGIN = 20;

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
  if (scrollY <= anchors[0].scrollY) return anchors[0].progress;
  if (scrollY >= anchors[anchors.length - 1].scrollY) {
    return anchors[anchors.length - 1].progress;
  }

  for (let i = 1; i < anchors.length; i += 1) {
    const previous = anchors[i - 1];
    const next = anchors[i];
    if (scrollY > next.scrollY) continue;

    const span = next.scrollY - previous.scrollY;
    if (span <= 0) return next.progress;
    const local = (scrollY - previous.scrollY) / span;
    return lerp(previous.progress, next.progress, local);
  }

  return anchors[anchors.length - 1].progress;
}

function mapProgressToScroll(progress, anchors) {
  if (!anchors.length) return 0;
  if (progress <= anchors[0].progress) return anchors[0].scrollY;
  if (progress >= anchors[anchors.length - 1].progress) {
    return anchors[anchors.length - 1].scrollY;
  }

  for (let i = 1; i < anchors.length; i += 1) {
    const previous = anchors[i - 1];
    const next = anchors[i];
    if (progress > next.progress) continue;

    const span = next.progress - previous.progress;
    if (span <= 0) return next.scrollY;
    const local = (progress - previous.progress) / span;
    return lerp(previous.scrollY, next.scrollY, local);
  }

  return anchors[anchors.length - 1].scrollY;
}

function collectSections(main) {
  const metrics = main.querySelector(SECTION_SELECTORS.metrics);
  const partners = main.querySelector(SECTION_SELECTORS.partners);
  const solutions = main.querySelector(SECTION_SELECTORS.solutions);
  const whyUs = main.querySelector(SECTION_SELECTORS.whyUs);
  const process = main.querySelector(SECTION_SELECTORS.process);
  const regulation = main.querySelector(SECTION_SELECTORS.regulation);
  const team = main.querySelector(SECTION_SELECTORS.team);
  const referrals = main.querySelector(SECTION_SELECTORS.referrals);
  const contact = main.querySelector(SECTION_SELECTORS.contact);

  if (
    !metrics
    || !partners
    || !solutions
    || !whyUs
    || !process
    || !regulation
    || !team
    || !referrals
    || !contact
  ) {
    return null;
  }

  return {
    metrics,
    partners,
    solutions,
    whyUs,
    process,
    regulation,
    team,
    referrals,
    contact,
  };
}

function buildProgressAnchors(sections, viewportHeight) {
  const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 0);
  const anchors = [
    { scrollY: scrollWhenTopAtViewportFraction(sections.metrics, 1, viewportHeight), progress: 0 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.metrics, 0.62, viewportHeight), progress: 0.08 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.partners, 0.62, viewportHeight), progress: 0.18 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.solutions, 0.62, viewportHeight), progress: 0.3 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.whyUs, 0.62, viewportHeight), progress: 0.42 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.process, 0.62, viewportHeight), progress: 0.56 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.regulation, 0.62, viewportHeight), progress: 0.7 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.team, 0.62, viewportHeight), progress: 0.84 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.referrals, 0.62, viewportHeight), progress: 0.9 },
    { scrollY: scrollWhenTopAtViewportFraction(sections.contact, 0.62, viewportHeight), progress: 0.93 },
    { scrollY: scrollWhenBottomAtViewportFraction(sections.contact, 0.45, viewportHeight), progress: 0.95 },
    { scrollY: maxScroll, progress: 0.96 },
  ].map((anchor) => ({
    ...anchor,
    scrollY: clamp(anchor.scrollY, 0, maxScroll),
  }));

  return anchors.sort((a, b) => {
    if (a.scrollY !== b.scrollY) return a.scrollY - b.scrollY;
    return a.progress - b.progress;
  });
}

function buildOpacityEnvelope(sections, viewportHeight) {
  const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 0);
  const fadeInStart = clamp(
    scrollWhenTopAtViewportFraction(sections.metrics, 1, viewportHeight),
    0,
    maxScroll
  );
  const fadeInEnd = clamp(
    scrollWhenTopAtViewportFraction(sections.metrics, 0.72, viewportHeight),
    0,
    maxScroll
  );
  const fadeOutEnd = maxScroll;
  const fadeOutStart = Math.max(0, fadeOutEnd - viewportHeight * 0.35);

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

function collectProtectedElements(main) {
  const selectors = [
    '[data-vl-home-section] .sec-head',
    '[data-vl-home-section="solutions"] .sol-card',
    '[data-vl-home-section="why-us"] .edge-grid > :first-child',
    '[data-vl-home-section="why-us"] .pullquote',
    '[data-vl-home-section="process"] .step',
    '[data-vl-home-section="process"] .closer',
    '[data-vl-home-section="regulation"] .reg-copy',
    '[data-vl-home-section="regulation"] .reg-seal-panel',
    '[data-vl-home-section="regulation"] .seals .seal',
    '[data-vl-home-section="team"] .sec-head',
    '[data-vl-home-section="team"] .person',
    '[data-vl-home-section="referrals"] .wrap',
    '[data-vl-home-section="contact"] .contact-copy',
    '[data-vl-home-section="contact"] form',
  ];

  return selectors.flatMap((selector) => Array.from(main.querySelectorAll(selector)));
}

function buildProtectedRects(main, mainDocumentTop) {
  const viewportWidth = Math.max(window.innerWidth, 1);
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;

  return collectProtectedElements(main).map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: (rect.left / viewportWidth) * WORLD_WIDTH,
      y: rect.top + scrollY - mainDocumentTop,
      width: (rect.width / viewportWidth) * WORLD_WIDTH,
      height: rect.height,
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
    .map(
      (rect) => (
        `<rect class="vl-bg-lines__debug-box" x="${rect.x}" y="${rect.y}" `
        + `width="${rect.width}" height="${rect.height}" />`
      )
    )
    .join('');

  const headsMarkup = LINE_KEYS
    .map((key) => {
      const [cx, cy] = lineStates[key].headPoint;
      return (
        `<ellipse class="vl-bg-lines__debug-head" cx="${cx}" cy="${cy}" `
        + 'rx="2.4" ry="2.4" />'
      );
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

function buildDocumentRouteSamples(
  sourceSamples,
  progressAnchors,
  profileKey,
  viewportHeight,
  mainDocumentTop
) {
  const points = sourceSamples.points.map(([x, worldY]) => {
    const pointProgress = worldYToProgress(worldY);
    const pointScrollY = mapProgressToScroll(pointProgress, progressAnchors);
    const headScreenWorldY = resolveHomeHeadScreenY(pointProgress, profileKey);
    const headScreenPixels = (headScreenWorldY / VIEWPORT_HEIGHT) * viewportHeight;
    const documentY = pointScrollY + headScreenPixels - mainDocumentTop;
    return [x, documentY];
  });

  return {
    ...sourceSamples,
    points,
  };
}

/**
 * The line layer is document-anchored. Once a point is drawn, its document
 * coordinate never changes. Scroll only reveals more of the immutable route.
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

    if (!group || !historyTrail || !activeTrail || !node || !nodeHalo || !nodeCore) {
      return null;
    }

    acc[key] = {
      group,
      historyTrail,
      activeTrail,
      node,
      nodeHalo,
      nodeCore,
    };
    return acc;
  }, {});

  if (!lineElements || LINE_KEYS.some((key) => !lineElements[key])) return;

  let disposed = false;
  let progressAnchors = [];
  let opacityEnvelope = null;
  let profileKey = 'desktop';
  let mainDocumentTop = 0;
  let layerHeight = 1;
  let documentRouteSamples = {};
  const debugEnabled = isDebugMode();
  const debugMetrics = [];

  const originalMainInlinePosition = main.style.position;
  const shouldPositionMain = window.getComputedStyle(main).position === 'static';
  if (shouldPositionMain) main.style.position = 'relative';

  const applyNodeRadii = () => {
    const viewportWidth = Math.max(window.innerWidth, 1);
    const worldUnitsPerPixelX = WORLD_WIDTH / viewportWidth;
    const coreRx = 1.05 * worldUnitsPerPixelX;
    const haloRx = 2.5 * worldUnitsPerPixelX;
    const coreRy = 1.05;
    const haloRy = 2.5;

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

  const recalcGeometry = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    profileKey = resolveProfileKey();
    progressAnchors = buildProgressAnchors(sections, viewportHeight);
    opacityEnvelope = buildOpacityEnvelope(sections, viewportHeight);
    mainDocumentTop = getDocumentTop(main);
    layerHeight = Math.max(
      document.documentElement.scrollHeight - mainDocumentTop,
      main.scrollHeight,
      viewportHeight
    );

    layer.style.height = `${layerHeight}px`;
    svg.setAttribute('viewBox', `0 0 ${WORLD_WIDTH} ${layerHeight}`);

    documentRouteSamples = LINE_KEYS.reduce((acc, lineKey) => {
      const sourceSamples = getProfileRouteSamples(profileKey, lineKey);
      acc[lineKey] = buildDocumentRouteSamples(
        sourceSamples,
        progressAnchors,
        profileKey,
        viewportHeight,
        mainDocumentTop
      );
      return acc;
    }, {});
  };

  const renderProgress = (inputProgress) => {
    if (disposed) return;

    const routesReady = LINE_KEYS.every((lineKey) => {
      const samples = documentRouteSamples[lineKey];
      return Boolean(
        samples
        && Array.isArray(samples.points)
        && samples.points.length > 1
        && Array.isArray(samples.normalizedDistance)
        && samples.normalizedDistance.length === samples.points.length
      );
    });

    if (!routesReady) return;

    const progress = clamp01(inputProgress);
    const convergenceState = resolveConvergenceState(progress);
    const individualNodeOpacity = Math.max(0, 1 - convergenceState.mergeAmount);
    const lineStates = {};

    LINE_KEYS.forEach((lineKey) => {
      const {
        historyTrail,
        activeTrail,
        node,
        nodeHalo,
        nodeCore,
      } = lineElements[lineKey];

      const state = resolveLineState(progress, lineKey, { profileKey });
      const routeSamples = documentRouteSamples[lineKey];
      const headPoint = pointAtRouteU(routeSamples, state.headU);
      const showNode = state.headU > 0.002;

      historyTrail.setAttribute('d', sliceRoute(routeSamples, 0, state.headU));
      activeTrail.setAttribute(
        'd',
        sliceRoute(routeSamples, state.activeStartU, state.headU)
      );
      node.setAttribute('opacity', showNode ? `${individualNodeOpacity}` : '0');
      nodeHalo.setAttribute('cx', `${headPoint[0]}`);
      nodeHalo.setAttribute('cy', `${headPoint[1]}`);
      nodeCore.setAttribute('cx', `${headPoint[0]}`);
      nodeCore.setAttribute('cy', `${headPoint[1]}`);

      lineStates[lineKey] = {
        ...state,
        headPoint,
      };
    });

    const sharedPoint = lineStates.outer.headPoint;
    sharedNode.setAttribute('opacity', `${convergenceState.mergeAmount}`);
    sharedNodeHalo.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeHalo.setAttribute('cy', `${sharedPoint[1]}`);
    sharedNodeCore.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeCore.setAttribute('cy', `${sharedPoint[1]}`);

    if (debugEnabled && process.env.NODE_ENV !== 'production') {
      const rects = buildProtectedRects(main, mainDocumentTop);
      const collisions = [];

      LINE_KEYS.forEach((lineKey) => {
        const state = lineStates[lineKey];
        const hit = rects.some((rect) => (
          pointInsideRect(state.headPoint, rect, HEAD_COLLISION_MARGIN)
        ));
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

    const fadeIn = smoothstep(
      opacityEnvelope.fadeInStart,
      opacityEnvelope.fadeInEnd,
      scrollY
    );
    const fadeOut = 1 - smoothstep(
      opacityEnvelope.fadeOutStart,
      opacityEnvelope.fadeOutEnd,
      scrollY
    );

    layer.style.opacity = `${clamp01(fadeIn * fadeOut)}`;
  };

  recalcGeometry();
  applyNodeRadii();

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: document.documentElement,
    end: 'bottom bottom',
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
      recalcGeometry();
      applyNodeRadii();
      const scrollY = self.scroll();
      const progress = mapScrollToProgress(scrollY, progressAnchors);
      renderProgress(progress);
      applyLayerOpacity(scrollY);
    },
  });

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
    layer.style.removeProperty('height');
    svg.setAttribute('viewBox', `0 0 ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`);
    sharedNode.removeAttribute('opacity');

    if (shouldPositionMain) {
      if (originalMainInlinePosition) main.style.position = originalMainInlinePosition;
      else main.style.removeProperty('position');
    }

    if (debugEnabled && process.env.NODE_ENV !== 'production') {
      clearDebugOverlay(debugOverlay);
      window.dispatchEvent(
        new CustomEvent(DEBUG_METRICS_EVENT, { detail: debugMetrics })
      );
      window.__vlLineDebugMetrics = debugMetrics;
    }

    LINE_KEYS.forEach((lineKey) => {
      const {
        group,
        node,
        historyTrail,
        activeTrail,
      } = lineElements[lineKey];

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
