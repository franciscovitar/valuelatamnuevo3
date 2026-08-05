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
  return (
    getDocumentTop(element)
    + element.offsetHeight
    - viewportHeight * fraction
  );
}

function mapScrollToProgress(scrollY, anchors) {
  if (!anchors.length) return 0;
  if (scrollY <= anchors[0].scrollY) return anchors[0].progress;

  if (scrollY >= anchors[anchors.length - 1].scrollY) {
    return anchors[anchors.length - 1].progress;
  }

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const next = anchors[index];
    if (scrollY > next.scrollY) continue;

    const span = next.scrollY - previous.scrollY;
    if (span <= 0) return next.progress;

    return lerp(
      previous.progress,
      next.progress,
      (scrollY - previous.scrollY) / span
    );
  }

  return anchors[anchors.length - 1].progress;
}

function mapProgressToScroll(progress, anchors) {
  if (!anchors.length) return 0;
  if (progress <= anchors[0].progress) return anchors[0].scrollY;

  if (progress >= anchors[anchors.length - 1].progress) {
    return anchors[anchors.length - 1].scrollY;
  }

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const next = anchors[index];
    if (progress > next.progress) continue;

    const span = next.progress - previous.progress;
    if (span <= 0) return next.scrollY;

    return lerp(
      previous.scrollY,
      next.scrollY,
      (progress - previous.progress) / span
    );
  }

  return anchors[anchors.length - 1].scrollY;
}

function collectSections(main) {
  const sections = Object.fromEntries(
    Object.entries(SECTION_SELECTORS).map(([key, selector]) => [
      key,
      main.querySelector(selector),
    ])
  );

  if (Object.values(sections).some((section) => !section)) {
    return null;
  }

  return sections;
}

function buildProgressAnchors(sections, viewportHeight) {
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    0
  );

  const anchors = [
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.metrics,
        1,
        viewportHeight
      ),
      progress: 0,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.metrics,
        0.62,
        viewportHeight
      ),
      progress: 0.08,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.partners,
        0.62,
        viewportHeight
      ),
      progress: 0.18,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.solutions,
        0.62,
        viewportHeight
      ),
      progress: 0.30,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.whyUs,
        0.62,
        viewportHeight
      ),
      progress: 0.42,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.process,
        0.62,
        viewportHeight
      ),
      progress: 0.56,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.regulation,
        0.62,
        viewportHeight
      ),
      progress: 0.70,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.team,
        0.62,
        viewportHeight
      ),
      progress: 0.84,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.referrals,
        0.62,
        viewportHeight
      ),
      progress: 0.90,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.contact,
        0.62,
        viewportHeight
      ),
      progress: 0.93,
    },
    {
      scrollY: scrollWhenBottomAtViewportFraction(
        sections.contact,
        0.45,
        viewportHeight
      ),
      progress: 0.95,
    },
    {
      scrollY: maxScroll,
      progress: 0.96,
    },
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
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    0
  );

  const fadeInStart = clamp(
    scrollWhenTopAtViewportFraction(
      sections.metrics,
      1,
      viewportHeight
    ),
    0,
    maxScroll
  );

  const fadeInEnd = clamp(
    scrollWhenTopAtViewportFraction(
      sections.metrics,
      0.72,
      viewportHeight
    ),
    0,
    maxScroll
  );

  const fadeOutEnd = maxScroll;
  const fadeOutStart = Math.max(
    0,
    fadeOutEnd - viewportHeight * 0.28
  );

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

function buildDocumentRouteSamples(
  sourceSamples,
  progressAnchors,
  profileKey,
  viewportHeight,
  mainDocumentTop
) {
  const points = sourceSamples.points.map(([x, worldY]) => {
    const pointProgress = worldYToProgress(worldY);
    const pointScrollY = mapProgressToScroll(
      pointProgress,
      progressAnchors
    );
    const headScreenWorldY = resolveHomeHeadScreenY(
      pointProgress,
      profileKey
    );
    const headScreenPixels = (
      headScreenWorldY / VIEWPORT_HEIGHT
    ) * viewportHeight;
    const documentY = (
      pointScrollY
      + headScreenPixels
      - mainDocumentTop
    );

    return [x, documentY];
  });

  return {
    ...sourceSamples,
    points,
  };
}

function setGradientVector(gradient, startPoint, endPoint) {
  if (!gradient) return;

  gradient.setAttribute('x1', `${startPoint[0]}`);
  gradient.setAttribute('y1', `${startPoint[1]}`);
  gradient.setAttribute('x2', `${endPoint[0]}`);
  gradient.setAttribute('y2', `${endPoint[1]}`);
}

export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');
  if (!main) return;

  const layer = main.querySelector('[data-vl-bg-lines-root]');
  const svg = layer?.querySelector('[data-vl-bg-lines-svg]');
  const world = svg?.querySelector('[data-vl-bg-lines-world]');
  const sharedNode = world?.querySelector('[data-vl-shared-node]');
  const sharedNodeHalo = sharedNode?.querySelector(
    '[data-vl-shared-node-halo]'
  );
  const sharedNodeCore = sharedNode?.querySelector(
    '[data-vl-shared-node-core]'
  );

  if (
    !layer
    || !svg
    || !world
    || !sharedNode
    || !sharedNodeHalo
    || !sharedNodeCore
  ) {
    return;
  }

  if (ctx?.reduced) {
    layer.style.opacity = '0';
    pushCleanup(
      cleanups,
      () => layer.style.removeProperty('opacity')
    );
    return;
  }

  const sections = collectSections(main);
  if (!sections) return;

  const lineElements = {};

  for (const lineKey of LINE_KEYS) {
    const group = world.querySelector(
      `[data-vl-line-group="${lineKey}"]`
    );
    const historyTrail = group?.querySelector(
      `[data-vl-history-trail="${lineKey}"]`
    );
    const activeTrail = group?.querySelector(
      `[data-vl-active-trail="${lineKey}"]`
    );
    const node = group?.querySelector(
      `[data-vl-node="${lineKey}"]`
    );
    const activeGradient = svg.querySelector(
      `[data-vl-active-gradient="${lineKey}"]`
    );
    const gradientStops = activeGradient
      ? Array.from(activeGradient.querySelectorAll('stop'))
      : [];

    if (
      !group
      || !historyTrail
      || !activeTrail
      || !node
      || !activeGradient
      || gradientStops.length < 2
    ) {
      return;
    }

    lineElements[lineKey] = {
      group,
      historyTrail,
      activeTrail,
      node,
      activeGradient,
      gradientStops,
    };
  }

  let disposed = false;
  let progressAnchors = [];
  let opacityEnvelope = null;
  let profileKey = 'desktop';
  let mainDocumentTop = 0;
  let layerHeight = 1;
  let documentRouteSamples = {};

  const originalMainInlinePosition = main.style.position;
  const shouldPositionMain = (
    window.getComputedStyle(main).position === 'static'
  );

  if (shouldPositionMain) {
    main.style.position = 'relative';
  }

  const applyNodeRadii = () => {
    const viewportWidth = Math.max(window.innerWidth, 1);
    const worldUnitsPerPixelX = WORLD_WIDTH / viewportWidth;
    const coreRx = 0.85 * worldUnitsPerPixelX;
    const haloRx = 2.05 * worldUnitsPerPixelX;

    sharedNodeHalo.setAttribute('rx', `${haloRx}`);
    sharedNodeHalo.setAttribute('ry', '2.05');
    sharedNodeCore.setAttribute('rx', `${coreRx}`);
    sharedNodeCore.setAttribute('ry', '0.85');
  };

  const recalcGeometry = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    profileKey = resolveProfileKey();
    progressAnchors = buildProgressAnchors(
      sections,
      viewportHeight
    );
    opacityEnvelope = buildOpacityEnvelope(
      sections,
      viewportHeight
    );
    mainDocumentTop = getDocumentTop(main);
    layerHeight = Math.max(
      document.documentElement.scrollHeight - mainDocumentTop,
      main.scrollHeight,
      viewportHeight
    );

    layer.style.height = `${layerHeight}px`;
    svg.setAttribute(
      'viewBox',
      `0 0 ${WORLD_WIDTH} ${layerHeight}`
    );

    documentRouteSamples = {};

    LINE_KEYS.forEach((lineKey) => {
      documentRouteSamples[lineKey] = buildDocumentRouteSamples(
        getProfileRouteSamples(profileKey, lineKey),
        progressAnchors,
        profileKey,
        viewportHeight,
        mainDocumentTop
      );
    });
  };

  const routesReady = () => (
    LINE_KEYS.every((lineKey) => {
      const samples = documentRouteSamples[lineKey];
      return Boolean(
        samples
        && Array.isArray(samples.points)
        && samples.points.length > 1
        && Array.isArray(samples.normalizedDistance)
        && samples.normalizedDistance.length === samples.points.length
      );
    })
  );

  const renderProgress = (inputProgress) => {
    if (disposed || !routesReady()) return;

    const progress = clamp01(inputProgress);
    const lineStates = {};

    LINE_KEYS.forEach((lineKey) => {
      const {
        historyTrail,
        activeTrail,
        node,
        activeGradient,
      } = lineElements[lineKey];

      const state = resolveLineState(
        progress,
        lineKey,
        { profileKey }
      );
      const routeSamples = documentRouteSamples[lineKey];
      const headPoint = pointAtRouteU(
        routeSamples,
        state.headU
      );
      const activeStartPoint = pointAtRouteU(
        routeSamples,
        state.activeStartU
      );

      historyTrail.setAttribute(
        'd',
        sliceRoute(routeSamples, 0, state.headU)
      );
      activeTrail.setAttribute(
        'd',
        sliceRoute(
          routeSamples,
          state.activeStartU,
          state.headU
        )
      );

      setGradientVector(
        activeGradient,
        activeStartPoint,
        headPoint
      );

      node.setAttribute('opacity', '0');

      lineStates[lineKey] = {
        ...state,
        headPoint,
      };
    });

    const middleState = lineStates.middle;
    const showNode = middleState.headU > 0.002;
    const nodeOpacity = showNode
      ? smoothstep(0.002, 0.025, middleState.headU)
      : 0;
    const sharedPoint = middleState.headPoint;

    sharedNode.setAttribute('opacity', `${nodeOpacity}`);
    sharedNodeHalo.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeHalo.setAttribute('cy', `${sharedPoint[1]}`);
    sharedNodeCore.setAttribute('cx', `${sharedPoint[0]}`);
    sharedNodeCore.setAttribute('cy', `${sharedPoint[1]}`);
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

  sharedNode.style.setProperty('--node-color', NODE_COLOR);

  LINE_KEYS.forEach((lineKey) => {
    const element = lineElements[lineKey];
    const gradientId = `vl-active-gradient-${lineKey}`;

    element.historyTrail.style.stroke = (
      HISTORY_LINE_STYLE[lineKey].color
    );
    element.historyTrail.style.strokeWidth = (
      `${HISTORY_LINE_STYLE[lineKey].width}`
    );
    element.activeTrail.style.stroke = `url(#${gradientId})`;
    element.activeTrail.style.strokeWidth = (
      `${ACTIVE_LINE_STYLE[lineKey].width}`
    );

    element.gradientStops.forEach((stop) => {
      stop.style.stopColor = ACTIVE_LINE_STYLE[lineKey].color;
    });
  });

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: document.documentElement,
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (disposed) return;

      const scrollY = self.scroll();
      const progress = mapScrollToProgress(
        scrollY,
        progressAnchors
      );

      renderProgress(progress);
      applyLayerOpacity(scrollY);
    },
    onRefresh: (self) => {
      if (disposed) return;

      recalcGeometry();
      applyNodeRadii();

      const scrollY = self.scroll();
      const progress = mapScrollToProgress(
        scrollY,
        progressAnchors
      );

      renderProgress(progress);
      applyLayerOpacity(scrollY);
    },
  });

  const initialScroll = trigger.scroll();
  const initialProgress = mapScrollToProgress(
    initialScroll,
    progressAnchors
  );

  renderProgress(initialProgress);
  applyLayerOpacity(initialScroll);

  pushCleanup(cleanups, () => {
    disposed = true;
    trigger.kill();

    layer.style.removeProperty('opacity');
    layer.style.removeProperty('height');
    svg.setAttribute(
      'viewBox',
      `0 0 ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`
    );

    sharedNode.removeAttribute('opacity');
    sharedNode.style.removeProperty('--node-color');

    if (shouldPositionMain) {
      if (originalMainInlinePosition) {
        main.style.position = originalMainInlinePosition;
      } else {
        main.style.removeProperty('position');
      }
    }

    LINE_KEYS.forEach((lineKey) => {
      const {
        historyTrail,
        activeTrail,
        node,
        activeGradient,
        gradientStops,
      } = lineElements[lineKey];

      node.removeAttribute('opacity');
      historyTrail.style.removeProperty('stroke');
      historyTrail.style.removeProperty('stroke-width');
      activeTrail.style.removeProperty('stroke');
      activeTrail.style.removeProperty('stroke-width');
      historyTrail.removeAttribute('d');
      activeTrail.removeAttribute('d');
      activeGradient.removeAttribute('x1');
      activeGradient.removeAttribute('y1');
      activeGradient.removeAttribute('x2');
      activeGradient.removeAttribute('y2');

      gradientStops.forEach((stop) => {
        stop.style.removeProperty('stop-color');
      });
    });
  });
}
