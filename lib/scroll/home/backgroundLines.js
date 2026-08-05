import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';
import {
  LINE_KEYS,
  WORLD_WIDTH,
  VIEWPORT_HEIGHT,
  HISTORY_LINE_STYLE,
  ACTIVE_LINE_STYLE,
  resolveGestureState,
  resolveLineState,
  getGestureRouteSamples,
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

function smoothstep(edge0, edge1, input) {
  if (edge1 <= edge0) return input >= edge1 ? 1 : 0;
  const t = clamp01((input - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function getDocumentTop(element) {
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
  return element.getBoundingClientRect().top + scrollY;
}

function scrollWhenTopAtViewportFraction(
  element,
  fraction,
  viewportHeight
) {
  return (
    getDocumentTop(element)
    - viewportHeight * fraction
  );
}

function scrollWhenBottomAtViewportFraction(
  element,
  fraction,
  viewportHeight
) {
  return (
    getDocumentTop(element)
    + element.offsetHeight
    - viewportHeight * fraction
  );
}

function collectSections(main) {
  const sections = Object.fromEntries(
    Object.entries(SECTION_SELECTORS).map(
      ([key, selector]) => [
        key,
        main.querySelector(selector),
      ]
    )
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
        sections.partners,
        0.62,
        viewportHeight
      ),
      progress: 0.19,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.solutions,
        0.78,
        viewportHeight
      ),
      progress: 0.225,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.whyUs,
        0.55,
        viewportHeight
      ),
      progress: 0.435,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.process,
        0.78,
        viewportHeight
      ),
      progress: 0.47,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.regulation,
        0.54,
        viewportHeight
      ),
      progress: 0.705,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.team,
        0.8,
        viewportHeight
      ),
      progress: 0.745,
    },
    {
      scrollY: scrollWhenTopAtViewportFraction(
        sections.referrals,
        0.58,
        viewportHeight
      ),
      progress: 0.87,
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
        0.42,
        viewportHeight
      ),
      progress: 0.96,
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
    if (a.scrollY !== b.scrollY) {
      return a.scrollY - b.scrollY;
    }

    return a.progress - b.progress;
  });
}

function mapScrollToProgress(scrollY, anchors) {
  if (!anchors.length) return 0;
  if (scrollY <= anchors[0].scrollY) {
    return anchors[0].progress;
  }

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

function resolveProfileKey() {
  const width = Math.max(window.innerWidth || 0, 0);

  if (width <= 760) return 'mobile';
  if (width <= 1160) return 'tablet';

  return 'desktop';
}

function setGradientVector(
  gradient,
  startPoint,
  endPoint
) {
  gradient.setAttribute('x1', `${startPoint[0]}`);
  gradient.setAttribute('y1', `${startPoint[1]}`);
  gradient.setAttribute('x2', `${endPoint[0]}`);
  gradient.setAttribute('y2', `${endPoint[1]}`);
}

export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');

  if (!main) return;

  const layer = main.querySelector(
    '[data-vl-bg-lines-root]'
  );
  const svg = layer?.querySelector(
    '[data-vl-bg-lines-svg]'
  );
  const world = svg?.querySelector(
    '[data-vl-bg-lines-world]'
  );

  if (!layer || !svg || !world) return;

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
    const historyGradient = svg.querySelector(
      `[data-vl-history-gradient="${lineKey}"]`
    );
    const activeGradient = svg.querySelector(
      `[data-vl-active-gradient="${lineKey}"]`
    );
    const historyStops = historyGradient
      ? Array.from(historyGradient.querySelectorAll('stop'))
      : [];
    const activeStops = activeGradient
      ? Array.from(activeGradient.querySelectorAll('stop'))
      : [];

    if (
      !group
      || !historyTrail
      || !activeTrail
      || !historyGradient
      || !activeGradient
      || historyStops.length < 2
      || activeStops.length < 2
    ) {
      return;
    }

    lineElements[lineKey] = {
      group,
      historyTrail,
      activeTrail,
      historyGradient,
      activeGradient,
      historyStops,
      activeStops,
    };
  }

  let disposed = false;
  let profileKey = resolveProfileKey();
  let progressAnchors = buildProgressAnchors(
    sections,
    Math.max(window.innerHeight, 1)
  );
  let targetProgress = 0;
  const display = { progress: 0 };

  const applyPalette = () => {
    LINE_KEYS.forEach((lineKey) => {
      const element = lineElements[lineKey];

      element.historyTrail.style.stroke = (
        `url(#vl-history-gradient-${lineKey})`
      );
      element.historyTrail.style.strokeWidth = (
        `${HISTORY_LINE_STYLE[lineKey].width}`
      );
      element.activeTrail.style.stroke = (
        `url(#vl-active-gradient-${lineKey})`
      );
      element.activeTrail.style.strokeWidth = (
        `${ACTIVE_LINE_STYLE[lineKey].width}`
      );

      element.historyStops.forEach((stop) => {
        stop.style.stopColor = (
          HISTORY_LINE_STYLE[lineKey].color
        );
      });

      element.activeStops.forEach((stop) => {
        stop.style.stopColor = (
          ACTIVE_LINE_STYLE[lineKey].color
        );
      });
    });
  };

  const renderProgress = (inputProgress) => {
    if (disposed) return;

    const progress = clamp01(inputProgress);
    const gestureState = resolveGestureState(progress);
    const opacity = gestureState.opacity;

    world.style.opacity = `${opacity}`;

    LINE_KEYS.forEach((lineKey) => {
      const element = lineElements[lineKey];
      const state = resolveLineState(
        progress,
        lineKey,
        { profileKey }
      );
      const samples = getGestureRouteSamples(
        profileKey,
        state.gestureIndex,
        lineKey
      );

      if (!samples) {
        element.historyTrail.removeAttribute('d');
        element.activeTrail.removeAttribute('d');
        return;
      }

      const tailPoint = pointAtRouteU(
        samples,
        state.tailU
      );
      const activeStartPoint = pointAtRouteU(
        samples,
        state.activeStartU
      );
      const headPoint = pointAtRouteU(
        samples,
        state.headU
      );

      element.historyTrail.setAttribute(
        'd',
        sliceRoute(
          samples,
          state.tailU,
          state.activeStartU
        )
      );
      element.activeTrail.setAttribute(
        'd',
        sliceRoute(
          samples,
          state.activeStartU,
          state.headU
        )
      );

      setGradientVector(
        element.historyGradient,
        tailPoint,
        activeStartPoint
      );
      setGradientVector(
        element.activeGradient,
        activeStartPoint,
        headPoint
      );
    });
  };

  const moveProgress = gsap.quickTo(
    display,
    'progress',
    {
      duration: 0.24,
      ease: 'power3.out',
      onUpdate: () => {
        renderProgress(display.progress);
      },
    }
  );

  const updateTarget = (scrollY) => {
    targetProgress = mapScrollToProgress(
      scrollY,
      progressAnchors
    );

    moveProgress(targetProgress);
  };

  applyPalette();
  renderProgress(0);

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: document.documentElement,
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (disposed) return;
      updateTarget(self.scroll());
    },
    onRefresh: (self) => {
      if (disposed) return;

      profileKey = resolveProfileKey();
      progressAnchors = buildProgressAnchors(
        sections,
        Math.max(window.innerHeight, 1)
      );

      updateTarget(self.scroll());
    },
  });

  updateTarget(trigger.scroll());

  pushCleanup(cleanups, () => {
    disposed = true;
    trigger.kill();
    gsap.killTweensOf(display);

    layer.style.removeProperty('opacity');
    world.style.removeProperty('opacity');

    LINE_KEYS.forEach((lineKey) => {
      const element = lineElements[lineKey];

      element.historyTrail.removeAttribute('d');
      element.activeTrail.removeAttribute('d');
      element.historyTrail.style.removeProperty('stroke');
      element.historyTrail.style.removeProperty(
        'stroke-width'
      );
      element.activeTrail.style.removeProperty('stroke');
      element.activeTrail.style.removeProperty(
        'stroke-width'
      );

      element.historyGradient.removeAttribute('x1');
      element.historyGradient.removeAttribute('y1');
      element.historyGradient.removeAttribute('x2');
      element.historyGradient.removeAttribute('y2');
      element.activeGradient.removeAttribute('x1');
      element.activeGradient.removeAttribute('y1');
      element.activeGradient.removeAttribute('x2');
      element.activeGradient.removeAttribute('y2');

      element.historyStops.forEach((stop) => {
        stop.style.removeProperty('stop-color');
      });

      element.activeStops.forEach((stop) => {
        stop.style.removeProperty('stop-color');
      });
    });
  });
}
