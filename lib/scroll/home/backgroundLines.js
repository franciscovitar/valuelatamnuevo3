import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const LINE_KEYS = ['outer', 'middle', 'inner'];
const SPARK_COOLDOWN_MS = 420;
const VIEWPORT_FADE_RANGE = 0.028;

const SECTION_SELECTORS = [
  ['metrics', '[data-vl-home-section="metrics"]'],
  ['partners', '[data-vl-home-section="partners"]'],
  ['solutions', '[data-vl-home-section="solutions"]'],
  ['whyUs', '[data-vl-home-section="why-us"]'],
  ['process', '[data-vl-home-section="process"]'],
  ['regulation', '[data-vl-home-section="regulation"]'],
  ['team', '[data-vl-home-section="team"]'],
  ['referrals', '[data-vl-home-section="referrals"]'],
  ['contact', '[data-vl-home-section="contact"]'],
];

const LANE_SETTINGS = {
  outer: {
    factor: -1,
    tangentA: 0.235,
    tangentB: 0.31,
    spreadA: 1.08,
    spreadB: 0.78,
  },
  middle: {
    factor: 0,
    tangentA: 0.29,
    tangentB: 0.255,
    spreadA: 0.08,
    spreadB: -0.12,
  },
  inner: {
    factor: 1,
    tangentA: 0.325,
    tangentB: 0.225,
    spreadA: 0.82,
    spreadB: 1.14,
  },
};

const DESKTOP_NODES = [
  [0.50, -0.10],
  [0.24, 0.29],
  [0.76, 0.37],
  [0.24, 0.28],
  [0.50, 0.25],
  [0.74, 0.34],
  [0.23, 0.31],
  [0.50, 0.23],
  [0.81, 0.28],
  [0.28, 0.36],
];

const TABLET_NODES = [
  [0.51, -0.10],
  [0.27, 0.29],
  [0.73, 0.36],
  [0.28, 0.28],
  [0.51, 0.24],
  [0.72, 0.33],
  [0.27, 0.30],
  [0.51, 0.23],
  [0.75, 0.28],
  [0.31, 0.35],
];

const MOBILE_NODES = [
  [0.52, -0.08],
  [0.31, 0.27],
  [0.69, 0.34],
  [0.31, 0.25],
  [0.52, 0.23],
  [0.69, 0.31],
  [0.31, 0.29],
  [0.52, 0.22],
  [0.72, 0.26],
  [0.35, 0.34],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, value) {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;

  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function getDocumentTop(element) {
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
  return element.getBoundingClientRect().top + scrollY;
}

function collectSections(main) {
  const entries = SECTION_SELECTORS.map(([key, selector]) => [
    key,
    main.querySelector(selector),
  ]);

  if (entries.some(([, section]) => !section)) return null;

  return Object.fromEntries(entries);
}

function resolveProfile(width) {
  if (width <= 760) return 'mobile';
  if (width <= 1160) return 'tablet';
  return 'desktop';
}

function resolveProfileSettings(profile) {
  if (profile === 'mobile') {
    return {
      nodes: MOBILE_NODES,
      samplesPerSegment: 58,
      trailFraction: 0.108,
      activeFraction: 0.014,
      bendScale: 0.108,
      laneScale: 0.064,
      sparkScale: 0.82,
    };
  }

  if (profile === 'tablet') {
    return {
      nodes: TABLET_NODES,
      samplesPerSegment: 76,
      trailFraction: 0.135,
      activeFraction: 0.015,
      bendScale: 0.125,
      laneScale: 0.072,
      sparkScale: 0.92,
    };
  }

  return {
    nodes: DESKTOP_NODES,
    samplesPerSegment: 104,
    trailFraction: 0.158,
    activeFraction: 0.016,
    bendScale: 0.14,
    laneScale: 0.082,
    sparkScale: 1,
  };
}

function cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;

  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

function normalizePoint([x, y], width, height) {
  return {
    x: x * width,
    y: y * height,
  };
}

function buildControlPoints(
  start,
  end,
  lineKey,
  segmentIndex,
  settings,
  width,
  height
) {
  const lane = LANE_SETTINGS[lineKey];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.max(Math.hypot(dx, dy), 0.0001);
  const dirX = dx / distance;
  const dirY = dy / distance;
  const normalX = -dirY;
  const normalY = dirX;
  const minDimension = Math.min(width, height);
  const alternating = segmentIndex % 2 === 0 ? -1 : 1;
  const secondary = segmentIndex % 3 === 0 ? 1 : -1;
  const sharedBend = minDimension * settings.bendScale * alternating;
  const laneSpread = minDimension * settings.laneScale * lane.factor;
  const asymmetricA = minDimension * 0.018 * secondary;
  const asymmetricB = minDimension * 0.015 * -secondary;

  const cp1Offset = (
    sharedBend
    + laneSpread * lane.spreadA
    + asymmetricA * (lineKey === 'middle' ? 0.35 : lane.factor)
  );
  const cp2Offset = (
    sharedBend * 0.72
    + laneSpread * lane.spreadB
    + asymmetricB * (lineKey === 'middle' ? -0.4 : lane.factor)
  );

  return {
    cp1: {
      x: start.x + dx * lane.tangentA + normalX * cp1Offset,
      y: start.y + dy * lane.tangentA + normalY * cp1Offset,
    },
    cp2: {
      x: end.x - dx * lane.tangentB + normalX * cp2Offset,
      y: end.y - dy * lane.tangentB + normalY * cp2Offset,
    },
  };
}

function buildRouteSamples(
  lineKey,
  nodes,
  anchorProgress,
  settings,
  width,
  height
) {
  const points = [];
  const timeline = [];

  for (let segmentIndex = 0; segmentIndex < nodes.length - 1; segmentIndex += 1) {
    const start = nodes[segmentIndex];
    const end = nodes[segmentIndex + 1];
    const { cp1, cp2 } = buildControlPoints(
      start,
      end,
      lineKey,
      segmentIndex,
      settings,
      width,
      height
    );
    const startProgress = anchorProgress[segmentIndex];
    const endProgress = anchorProgress[segmentIndex + 1];

    for (let sampleIndex = 0; sampleIndex < settings.samplesPerSegment; sampleIndex += 1) {
      if (segmentIndex > 0 && sampleIndex === 0) continue;

      const t = sampleIndex / (settings.samplesPerSegment - 1);
      points.push(cubicPoint(start, cp1, cp2, end, t));
      timeline.push(lerp(startProgress, endProgress, t));
    }
  }

  const distances = [0];

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x;
    const dy = points[index].y - points[index - 1].y;
    distances.push(distances[index - 1] + Math.hypot(dx, dy));
  }

  const totalLength = Math.max(distances[distances.length - 1], 0.0001);
  const normalizedDistance = distances.map((distance) => distance / totalLength);

  return {
    points,
    timeline,
    distances,
    normalizedDistance,
    totalLength,
  };
}

function findUpperIndex(values, target) {
  let low = 0;
  let high = values.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < target) low = middle + 1;
    else high = middle;
  }

  return low;
}

function pointAtTimeline(samples, progress) {
  const target = clamp(progress, 0, 1);
  const upperIndex = findUpperIndex(samples.timeline, target);
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerProgress = samples.timeline[lowerIndex];
  const upperProgress = samples.timeline[upperIndex];
  const span = upperProgress - lowerProgress;
  const t = span > 0 ? (target - lowerProgress) / span : 0;

  return {
    point: {
      x: lerp(samples.points[lowerIndex].x, samples.points[upperIndex].x, t),
      y: lerp(samples.points[lowerIndex].y, samples.points[upperIndex].y, t),
    },
    routeU: lerp(
      samples.normalizedDistance[lowerIndex],
      samples.normalizedDistance[upperIndex],
      t
    ),
  };
}

function pointAtRouteU(samples, routeU) {
  const target = clamp(routeU, 0, 1);
  const upperIndex = findUpperIndex(samples.normalizedDistance, target);
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerU = samples.normalizedDistance[lowerIndex];
  const upperU = samples.normalizedDistance[upperIndex];
  const span = upperU - lowerU;
  const t = span > 0 ? (target - lowerU) / span : 0;

  return {
    x: lerp(samples.points[lowerIndex].x, samples.points[upperIndex].x, t),
    y: lerp(samples.points[lowerIndex].y, samples.points[upperIndex].y, t),
  };
}

function sliceRoute(samples, fromU, toU) {
  const from = clamp(Math.min(fromU, toU), 0, 1);
  const to = clamp(Math.max(fromU, toU), 0, 1);

  if (to - from < 0.00001) return '';

  const points = [pointAtRouteU(samples, from)];

  for (let index = 0; index < samples.normalizedDistance.length; index += 1) {
    const routeU = samples.normalizedDistance[index];
    if (routeU > from && routeU < to) points.push(samples.points[index]);
  }

  points.push(pointAtRouteU(samples, to));

  return points.reduce((path, point, index) => (
    `${path}${index === 0 ? 'M' : ' L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  ), '');
}

function mapScrollToProgress(scrollY, scrollAnchors) {
  if (!scrollAnchors.length) return 0;

  if (scrollY <= scrollAnchors[0].scrollY) return 0;
  if (scrollY >= scrollAnchors[scrollAnchors.length - 1].scrollY) return 1;

  for (let index = 1; index < scrollAnchors.length; index += 1) {
    const previous = scrollAnchors[index - 1];
    const next = scrollAnchors[index];

    if (scrollY > next.scrollY) continue;

    const span = Math.max(next.scrollY - previous.scrollY, 1);
    const local = clamp((scrollY - previous.scrollY) / span, 0, 1);

    return lerp(
      previous.progress,
      next.progress,
      smoothstep(0, 1, local)
    );
  }

  return 1;
}

function buildBoltPath(start, end, seed, sparkScale) {
  const segmentCount = 9;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(Math.hypot(dx, dy), 0.0001);
  const normalX = -dy / length;
  const normalY = dx / length;
  const points = [start];
  const jitterBase = clamp(length * 0.085, 4, 11) * sparkScale;

  for (let index = 1; index < segmentCount; index += 1) {
    const t = index / segmentCount;
    const envelope = Math.sin(Math.PI * t);
    const pseudo = Math.sin(seed * 17.17 + index * 9.31)
      + Math.sin(seed * 4.77 + index * 3.13) * 0.45;
    const jitter = pseudo * envelope * jitterBase;

    points.push({
      x: lerp(start.x, end.x, t) + normalX * jitter,
      y: lerp(start.y, end.y, t) + normalY * jitter,
    });
  }

  points.push(end);

  return points.reduce((path, point, index) => (
    `${path}${index === 0 ? 'M' : ' L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  ), '');
}

function createSparkController(sparkRoot, sparkScale) {
  const halo = sparkRoot.querySelector('[data-vl-spark-halo]');
  const bolts = Array.from(
    sparkRoot.querySelectorAll('[data-vl-spark-bolt]')
  ).map((group) => ({
    group,
    glow: group.querySelector('[data-vl-spark-glow]'),
    core: group.querySelector('[data-vl-spark-core]'),
  }));

  let timeline = null;
  let burstSeed = 0;

  const stop = () => {
    timeline?.kill();
    timeline = null;
    gsap.killTweensOf([
      halo,
      ...bolts.flatMap((bolt) => [bolt.glow, bolt.core]),
    ]);

    if (halo) halo.style.opacity = '0';
    bolts.forEach(({ glow, core }) => {
      glow.style.opacity = '0';
      core.style.opacity = '0';
    });
  };

  const play = (pairs, center) => {
    if (!pairs.length || !halo || !bolts.length) return;

    stop();
    burstSeed += 1;
    timeline = gsap.timeline();

    halo.setAttribute('cx', `${center.x}`);
    halo.setAttribute('cy', `${center.y}`);

    timeline.fromTo(
      halo,
      {
        attr: { r: 1.8 * sparkScale },
        opacity: 0,
      },
      {
        attr: { r: 10 * sparkScale },
        opacity: 0.44,
        duration: 0.075,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0
    );

    bolts.forEach((bolt, index) => {
      const pair = pairs[index % pairs.length];
      const d = buildBoltPath(
        pair.start,
        pair.end,
        burstSeed * 10 + index + 1,
        sparkScale
      );

      bolt.glow.setAttribute('d', d);
      bolt.core.setAttribute('d', d);

      const length = Math.max(bolt.core.getTotalLength(), 1);
      const delay = index * (0.04 + (index % 2) * 0.012);

      gsap.set([bolt.glow, bolt.core], {
        opacity: 0,
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      timeline
        .to([bolt.glow, bolt.core], {
          opacity: (itemIndex) => (itemIndex === 0 ? 0.38 : 0.98),
          strokeDashoffset: 0,
          duration: 0.05,
          ease: 'none',
        }, delay)
        .to([bolt.glow, bolt.core], {
          opacity: 0,
          duration: 0.11,
          ease: 'power2.out',
        }, delay + 0.055);
    });
  };

  return {
    play,
    stop,
  };
}

function buildScrollAnchors(sections, viewportHeight) {
  const orderedSections = SECTION_SELECTORS.map(([key]) => sections[key]);
  const nodeCount = orderedSections.length + 1;
  const progressStep = 1 / (nodeCount - 1);
  const firstTop = getDocumentTop(orderedSections[0]);
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    0
  );
  const anchors = [{
    progress: 0,
    scrollY: clamp(firstTop - viewportHeight * 1.02, 0, maxScroll),
  }];

  orderedSections.forEach((section, index) => {
    const sectionTop = getDocumentTop(section);
    const fraction = index === orderedSections.length - 1 ? 0.42 : 0.58;
    const rawScroll = sectionTop - viewportHeight * fraction;
    const previous = anchors[anchors.length - 1];

    anchors.push({
      progress: (index + 1) * progressStep,
      scrollY: clamp(Math.max(rawScroll, previous.scrollY + 1), 0, maxScroll),
    });
  });

  return anchors;
}

function createEventList(anchorProgress) {
  const nodeEvents = anchorProgress.slice(1).map((progress, index) => ({
    id: `node-${index + 1}`,
    type: 'node',
    progress,
  }));

  const bridgeSegments = [4, 7];
  const bridgeEvents = bridgeSegments
    .filter((segmentIndex) => segmentIndex < anchorProgress.length - 1)
    .map((segmentIndex) => ({
      id: `bridge-${segmentIndex}`,
      type: 'bridge',
      progress: lerp(
        anchorProgress[segmentIndex],
        anchorProgress[segmentIndex + 1],
        0.58
      ),
    }));

  return [...nodeEvents, ...bridgeEvents]
    .sort((a, b) => a.progress - b.progress);
}

function crossedEvent(previousProgress, nextProgress, eventProgress) {
  if (nextProgress >= previousProgress) {
    return previousProgress < eventProgress && nextProgress >= eventProgress;
  }

  return previousProgress > eventProgress && nextProgress <= eventProgress;
}

export function initBackgroundLines(ctx, cleanups, root) {
  if (ctx?.reduced) return;

  const main = root || document.querySelector('main');
  if (!main) return;

  const layer = main.querySelector('[data-vl-bg-lines-root]');
  const svg = layer?.querySelector('[data-vl-bg-lines-svg]');
  const world = svg?.querySelector('[data-vl-bg-lines-world]');
  const sparkRoot = world?.querySelector('[data-vl-spark-root]');

  if (!layer || !svg || !world || !sparkRoot) return;

  const sections = collectSections(main);
  if (!sections) return;

  const lineElements = {};

  for (const lineKey of LINE_KEYS) {
    const group = world.querySelector(`[data-vl-line-group="${lineKey}"]`);
    const historyTrail = group?.querySelector(
      `[data-vl-history-trail="${lineKey}"]`
    );
    const activeTrail = group?.querySelector(
      `[data-vl-active-trail="${lineKey}"]`
    );
    const head = group?.querySelector(
      `[data-vl-travel-head="${lineKey}"]`
    );

    if (!group || !historyTrail || !activeTrail || !head) return;

    lineElements[lineKey] = {
      group,
      historyTrail,
      activeTrail,
      head,
    };
  }

  let disposed = false;
  let resizeFrame = 0;
  let geometry = null;
  let scrollAnchors = [];
  let anchorProgress = [];
  let sparkEvents = [];
  let previousProgress = 0;
  let initialized = false;
  let sparkController = null;
  const eventCooldowns = new Map();

  const recalcGeometry = () => {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const profile = resolveProfile(width);
    const settings = resolveProfileSettings(profile);
    const nodes = settings.nodes.map((node) => normalizePoint(node, width, height));

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);

    scrollAnchors = buildScrollAnchors(sections, height);
    anchorProgress = scrollAnchors.map((anchor) => anchor.progress);
    sparkEvents = createEventList(anchorProgress);

    const routes = Object.fromEntries(
      LINE_KEYS.map((lineKey) => [
        lineKey,
        buildRouteSamples(
          lineKey,
          nodes,
          anchorProgress,
          settings,
          width,
          height
        ),
      ])
    );

    sparkController?.stop();
    sparkController = createSparkController(
      sparkRoot,
      settings.sparkScale
    );

    geometry = {
      profile,
      settings,
      nodes,
      routes,
      width,
      height,
    };
  };

  const triggerSparkEvent = (event) => {
    if (!geometry || !sparkController) return;

    const now = performance.now();
    const lastTime = eventCooldowns.get(event.id) || 0;
    if (now - lastTime < SPARK_COOLDOWN_MS) return;
    eventCooldowns.set(event.id, now);

    const positions = Object.fromEntries(
      LINE_KEYS.map((lineKey) => [
        lineKey,
        pointAtTimeline(geometry.routes[lineKey], event.progress).point,
      ])
    );

    if (event.type === 'bridge') {
      const center = {
        x: (positions.outer.x + positions.middle.x + positions.inner.x) / 3,
        y: (positions.outer.y + positions.middle.y + positions.inner.y) / 3,
      };
      const pairs = [
        { start: positions.outer, end: positions.middle },
        { start: positions.middle, end: positions.inner },
        { start: positions.outer, end: positions.inner },
      ];

      sparkController.play(pairs, center);
      return;
    }

    const sampleOffset = geometry.profile === 'mobile' ? 0.014 : 0.011;
    const beforeProgress = clamp(event.progress - sampleOffset, 0, 1);
    const afterProgress = clamp(event.progress + sampleOffset, 0, 1);
    const center = positions.middle;
    const pairs = [];

    LINE_KEYS.forEach((lineKey) => {
      const route = geometry.routes[lineKey];
      const before = pointAtTimeline(route, beforeProgress).point;
      const after = pointAtTimeline(route, afterProgress).point;

      pairs.push({ start: center, end: before });
      pairs.push({ start: center, end: after });
    });

    sparkController.play(pairs, center);
  };

  const render = (inputProgress, allowSpark = true) => {
    if (disposed || !geometry) return;

    const progress = clamp(inputProgress, 0, 1);
    const fadeIn = smoothstep(0, VIEWPORT_FADE_RANGE, progress);
    const fadeOut = 1 - smoothstep(
      1 - VIEWPORT_FADE_RANGE,
      1,
      progress
    );
    const layerOpacity = Math.min(fadeIn, fadeOut);

    layer.style.opacity = `${layerOpacity}`;

    LINE_KEYS.forEach((lineKey) => {
      const route = geometry.routes[lineKey];
      const state = pointAtTimeline(route, progress);
      const headU = state.routeU;
      const tailU = Math.max(
        0,
        headU - geometry.settings.trailFraction
      );
      const activeStartU = Math.max(
        tailU,
        headU - geometry.settings.activeFraction
      );
      const elements = lineElements[lineKey];

      elements.historyTrail.setAttribute(
        'd',
        sliceRoute(route, tailU, activeStartU)
      );
      elements.activeTrail.setAttribute(
        'd',
        sliceRoute(route, activeStartU, headU)
      );
      elements.head.setAttribute('cx', `${state.point.x}`);
      elements.head.setAttribute('cy', `${state.point.y}`);
      elements.head.style.opacity = (
        progress > 0.004 && progress < 0.997
          ? `${0.64 + layerOpacity * 0.34}`
          : '0'
      );
    });

    if (allowSpark && initialized) {
      const crossed = sparkEvents.filter((event) => (
        crossedEvent(previousProgress, progress, event.progress)
      ));

      if (crossed.length) {
        const event = progress >= previousProgress
          ? crossed[crossed.length - 1]
          : crossed[0];
        triggerSparkEvent(event);
      }
    }

    previousProgress = progress;
  };

  recalcGeometry();

  const initialProgress = mapScrollToProgress(
    window.scrollY ?? 0,
    scrollAnchors
  );

  previousProgress = initialProgress;
  render(initialProgress, false);
  initialized = true;

  const driver = { progress: initialProgress };
  const moveProgress = gsap.quickTo(driver, 'progress', {
    duration: 0.38,
    ease: 'power3.out',
    onUpdate: () => render(driver.progress),
  });

  const updateFromScroll = (scrollY) => {
    moveProgress(mapScrollToProgress(scrollY, scrollAnchors));
  };

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: sections.contact,
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (!disposed) updateFromScroll(self.scroll());
    },
    onRefresh: (self) => {
      if (disposed) return;

      recalcGeometry();
      const nextProgress = mapScrollToProgress(
        self.scroll(),
        scrollAnchors
      );

      gsap.killTweensOf(driver);
      driver.progress = nextProgress;
      previousProgress = nextProgress;
      render(nextProgress, false);
    },
  });

  const scheduleRecalc = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (disposed) return;

      recalcGeometry();
      const nextProgress = mapScrollToProgress(
        window.scrollY ?? 0,
        scrollAnchors
      );

      gsap.killTweensOf(driver);
      driver.progress = nextProgress;
      previousProgress = nextProgress;
      render(nextProgress, false);
    });
  };

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleRecalc)
    : null;

  resizeObserver?.observe(main);
  Object.values(sections).forEach((section) => {
    resizeObserver?.observe(section);
  });

  pushCleanup(cleanups, () => {
    disposed = true;
    cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    trigger.kill();
    gsap.killTweensOf(driver);
    sparkController?.stop();

    layer.style.removeProperty('opacity');
    svg.removeAttribute('viewBox');
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    LINE_KEYS.forEach((lineKey) => {
      const elements = lineElements[lineKey];
      elements.historyTrail.removeAttribute('d');
      elements.activeTrail.removeAttribute('d');
      elements.head.removeAttribute('cx');
      elements.head.removeAttribute('cy');
      elements.head.style.removeProperty('opacity');
    });
  });
}
