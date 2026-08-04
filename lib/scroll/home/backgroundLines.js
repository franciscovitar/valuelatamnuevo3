import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';
import {
  LINE_KEYS,
  WORLD_WIDTH,
  VIEWPORT_HEIGHT,
  NODE_COLOR,
  resolveLineState,
  resolveCameraTop,
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

const LOCAL_FLOAT_BASE = {
  outer: { fx1: 0.9, fy1: -0.35, fx2: -0.72, fy2: 0.45, fx3: 0.41, fy3: 0.2, fx4: -0.28, fy4: 0.14 },
  middle: { fx1: -0.7, fy1: 0.38, fx2: 0.7, fy2: -0.5, fx3: -0.28, fy3: -0.16, fx4: 0.2, fy4: 0.11 },
  inner: { fx1: 1.0, fy1: 0.24, fx2: -0.82, fy2: -0.4, fx3: 0.33, fy3: -0.23, fx4: -0.22, fy4: 0.12 },
};

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

function buildLocalFloatVars(lineKey, localFloatStrength) {
  const base = LOCAL_FLOAT_BASE[lineKey];
  const s = clamp01(localFloatStrength);
  return {
    '--fx1': `${base.fx1 * s}px`,
    '--fy1': `${base.fy1 * s}px`,
    '--fx2': `${base.fx2 * s}px`,
    '--fy2': `${base.fy2 * s}px`,
    '--fx3': `${base.fx3 * s}px`,
    '--fy3': `${base.fy3 * s}px`,
    '--fx4': `${base.fx4 * s}px`,
    '--fy4': `${base.fy4 * s}px`,
  };
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

function clearLocalFloatVars(element) {
  element.style.removeProperty('--fx1');
  element.style.removeProperty('--fy1');
  element.style.removeProperty('--fx2');
  element.style.removeProperty('--fy2');
  element.style.removeProperty('--fx3');
  element.style.removeProperty('--fy3');
  element.style.removeProperty('--fx4');
  element.style.removeProperty('--fy4');
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
    const trail = group?.querySelector(`[data-vl-visible-trail="${key}"]`);
    const node = group?.querySelector(`[data-vl-node="${key}"]`);
    const nodeHalo = node?.querySelector(`[data-vl-node-halo="${key}"]`);
    const nodeCore = node?.querySelector(`[data-vl-node-core="${key}"]`);
    if (!group || !trail || !node || !nodeHalo || !nodeCore) return null;
    acc[key] = { group, trail, node, nodeHalo, nodeCore };
    return acc;
  }, {});

  if (!lineElements || LINE_KEYS.some((key) => !lineElements[key])) return;

  let disposed = false;
  let progressAnchors = [];
  let opacityEnvelope = null;

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
  };

  const renderProgress = (inputProgress) => {
    if (disposed) return;

    const progress = clamp01(inputProgress);
    const cameraTop = resolveCameraTop(progress);
    svg.setAttribute('viewBox', `0 ${cameraTop} ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`);

    const convergenceState = resolveConvergenceState(progress);
    const localFloatStrength = 1 - convergenceState.mergeAmount;
    const individualNodeOpacity = Math.max(0, 1 - convergenceState.mergeAmount);

    LINE_KEYS.forEach((lineKey) => {
      const { group, trail, node, nodeHalo, nodeCore } = lineElements[lineKey];
      const state = resolveLineState(progress, lineKey);
      const [cx, cy] = state.headPoint;
      const showNode = state.headU > 0.002;

      trail.setAttribute('d', state.trailD);
      node.setAttribute('opacity', showNode ? `${individualNodeOpacity}` : '0');
      nodeHalo.setAttribute('cx', `${cx}`);
      nodeHalo.setAttribute('cy', `${cy}`);
      nodeCore.setAttribute('cx', `${cx}`);
      nodeCore.setAttribute('cy', `${cy}`);

      const localFloatVars = buildLocalFloatVars(lineKey, localFloatStrength);
      Object.entries(localFloatVars).forEach(([name, value]) => {
        group.style.setProperty(name, value);
      });
    });

    const sharedPoint = resolveLineState(progress, 'outer').headPoint;
    sharedNode.setAttribute('opacity', `${convergenceState.mergeAmount}`);
    sharedNodeHalo.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeHalo.setAttribute('cy', `${sharedPoint[1]}`);
    sharedNodeCore.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeCore.setAttribute('cy', `${sharedPoint[1]}`);
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
    lineElements[lineKey].group.style.setProperty('--node-color', NODE_COLOR);
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

    LINE_KEYS.forEach((lineKey) => {
      const { group, node, trail } = lineElements[lineKey];
      clearLocalFloatVars(group);
      group.style.removeProperty('--node-color');
      node.removeAttribute('opacity');
      trail.removeAttribute('d');
    });
  });
}
