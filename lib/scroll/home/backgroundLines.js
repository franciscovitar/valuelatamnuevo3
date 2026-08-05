import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const LINE_KEYS = ['outer', 'middle', 'inner'];
const WORLD_WIDTH = 1000;
const ACTIVE_SEGMENT_MIN = 54;
const ACTIVE_SEGMENT_MAX = 126;
const PATH_SAMPLE_STEP = 7;
const NODE_SEARCH_STEPS = 900;
const SPARK_COOLDOWN_MS = 420;

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getDocumentTop(element) {
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
  return element.getBoundingClientRect().top + scrollY;
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

function resolveProfile() {
  const width = Math.max(window.innerWidth || 0, 1);

  if (width <= 760) return 'mobile';
  if (width <= 1160) return 'tablet';

  return 'desktop';
}

function scaleX(value, profile) {
  if (profile === 'desktop') return value;

  if (profile === 'tablet') {
    return 500 + (value - 500) * 0.88;
  }

  return 720 + (value - 500) * 0.54;
}

function catmullRomPath(points, tension = 0.88) {
  if (!points.length) return '';

  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];

    const cp1 = [
      p1[0] + ((p2[0] - p0[0]) * tension) / 6,
      p1[1] + ((p2[1] - p0[1]) * tension) / 6,
    ];
    const cp2 = [
      p2[0] - ((p3[0] - p1[0]) * tension) / 6,
      p2[1] - ((p3[1] - p1[1]) * tension) / 6,
    ];

    d += (
      ` C ${cp1[0]} ${cp1[1]},`
      + ` ${cp2[0]} ${cp2[1]},`
      + ` ${p2[0]} ${p2[1]}`
    );
  }

  return d;
}

function toMainY(element, fraction, mainDocumentTop) {
  return (
    getDocumentTop(element)
    - mainDocumentTop
    + element.offsetHeight * fraction
  );
}

function buildNetworkGeometry(
  sections,
  mainDocumentTop,
  profile,
  viewportHeight
) {
  const startY = Math.max(
    -viewportHeight * 0.55,
    toMainY(sections.metrics, 0, mainDocumentTop)
      - viewportHeight * 0.66
  );

  const hubs = [
    [
      scaleX(250, profile),
      toMainY(sections.metrics, 0.24, mainDocumentTop),
    ],
    [
      scaleX(805, profile),
      toMainY(sections.solutions, 0.18, mainDocumentTop),
    ],
    [
      scaleX(250, profile),
      toMainY(sections.process, 0.34, mainDocumentTop),
    ],
    [
      scaleX(790, profile),
      toMainY(sections.team, 0.18, mainDocumentTop),
    ],
    [
      scaleX(220, profile),
      toMainY(sections.contact, 0.42, mainDocumentTop),
    ],
  ];

  const startXs = [620, 760, 920].map(
    (x) => scaleX(x, profile)
  );

  const fanXs = [
    [620, 710, 800],
    [760, 820, 880],
    [610, 720, 830],
    [290, 400, 510],
  ].map((set) => set.map((x) => scaleX(x, profile)));

  const fanYs = [
    toMainY(sections.partners, 0.52, mainDocumentTop),
    toMainY(sections.whyUs, 0.52, mainDocumentTop),
    toMainY(sections.regulation, 0.5, mainDocumentTop),
    toMainY(sections.referrals, 0.42, mainDocumentTop),
  ];

  const laneAnchors = LINE_KEYS.map((lineKey, laneIndex) => [
    [startXs[laneIndex], startY],
    hubs[0],
    [fanXs[0][laneIndex], fanYs[0]],
    hubs[1],
    [fanXs[1][laneIndex], fanYs[1]],
    hubs[2],
    [fanXs[2][laneIndex], fanYs[2]],
    hubs[3],
    [fanXs[3][laneIndex], fanYs[3]],
    hubs[4],
  ]);

  return {
    hubs,
    laneAnchors,
    middleAnchors: laneAnchors[1],
  };
}

function findNearestLength(path, target, totalLength) {
  let bestLength = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index <= NODE_SEARCH_STEPS; index += 1) {
    const length = totalLength * (index / NODE_SEARCH_STEPS);
    const point = path.getPointAtLength(length);
    const dx = point.x - target[0];
    const dy = point.y - target[1];
    const distance = dx * dx + dy * dy;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestLength = length;
    }
  }

  return bestLength;
}

function slicePath(path, startLength, endLength) {
  const from = Math.max(0, Math.min(startLength, endLength));
  const to = Math.max(from, Math.max(startLength, endLength));

  if (to - from < 0.5) return '';

  const start = path.getPointAtLength(from);
  let d = `M ${start.x} ${start.y}`;

  for (
    let length = from + PATH_SAMPLE_STEP;
    length < to;
    length += PATH_SAMPLE_STEP
  ) {
    const point = path.getPointAtLength(length);
    d += ` L ${point.x} ${point.y}`;
  }

  const end = path.getPointAtLength(to);
  d += ` L ${end.x} ${end.y}`;

  return d;
}

function mapScrollToRouteU(scrollY, anchors) {
  if (!anchors.length) return 0;

  if (scrollY <= anchors[0].scrollY) {
    return anchors[0].routeU;
  }

  if (scrollY >= anchors[anchors.length - 1].scrollY) {
    return anchors[anchors.length - 1].routeU;
  }

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1];
    const next = anchors[index];

    if (scrollY > next.scrollY) continue;

    const span = next.scrollY - previous.scrollY;

    if (span <= 0) return next.routeU;

    return lerp(
      previous.routeU,
      next.routeU,
      (scrollY - previous.scrollY) / span
    );
  }

  return anchors[anchors.length - 1].routeU;
}

function buildBoltPath(start, end, seed) {
  const segmentCount = 6;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(Math.hypot(dx, dy), 0.000001);
  const normalX = -dy / length;
  const normalY = dx / length;
  const points = [[start.x, start.y]];

  for (let index = 1; index < segmentCount; index += 1) {
    const t = index / segmentCount;
    const envelope = Math.sin(Math.PI * t);
    const pseudo = Math.sin(
      seed * 13.71 + index * 7.31
    );
    const jitter = pseudo * envelope * (5.5 + seed * 0.7);

    points.push([
      lerp(start.x, end.x, t) + normalX * jitter,
      lerp(start.y, end.y, t) + normalY * jitter,
    ]);
  }

  points.push([end.x, end.y]);

  return points.reduce(
    (d, point, index) => (
      `${d}${index ? ' L' : 'M'} ${point[0]} ${point[1]}`
    ),
    ''
  );
}

function triggerSpark(
  spark,
  middlePath,
  lineData,
  nodeLength
) {
  const center = middlePath.getPointAtLength(nodeLength);
  const targets = [];

  LINE_KEYS.forEach((lineKey, lineIndex) => {
    const data = lineData[lineKey];
    const before = data.path.getPointAtLength(
      clamp(nodeLength - 28 - lineIndex * 8, 0, data.length)
    );
    const after = data.path.getPointAtLength(
      clamp(nodeLength + 24 + lineIndex * 10, 0, data.length)
    );

    targets.push(before, after);
  });

  gsap.killTweensOf([
    spark.halo,
    ...spark.bolts,
  ]);

  spark.halo.setAttribute('cx', `${center.x}`);
  spark.halo.setAttribute('cy', `${center.y}`);

  gsap.fromTo(
    spark.halo,
    {
      attr: { r: 2.2 },
      opacity: 0,
    },
    {
      attr: { r: 11 },
      opacity: 0.72,
      duration: 0.09,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    }
  );

  spark.bolts.forEach((bolt, index) => {
    const target = targets[index % targets.length];
    const d = buildBoltPath(
      center,
      target,
      index + 1
    );

    bolt.setAttribute('d', d);
    const length = bolt.getTotalLength();

    gsap.set(bolt, {
      opacity: 0,
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.timeline({
      delay: index * 0.035,
    })
      .to(bolt, {
        opacity: 0.95,
        strokeDashoffset: 0,
        duration: 0.055,
        ease: 'none',
      })
      .to(bolt, {
        opacity: 0,
        duration: 0.11,
        ease: 'power2.out',
      });
  });
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
  const head = world?.querySelector(
    '[data-vl-travel-head]'
  );
  const sparkRoot = world?.querySelector(
    '[data-vl-network-spark]'
  );
  const sparkHalo = sparkRoot?.querySelector(
    '[data-vl-spark-halo]'
  );
  const sparkBolts = sparkRoot
    ? Array.from(
      sparkRoot.querySelectorAll('[data-vl-spark-bolt]')
    )
    : [];

  if (
    !layer
    || !svg
    || !world
    || !head
    || !sparkRoot
    || !sparkHalo
    || sparkBolts.length < 3
  ) {
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

    if (!group || !historyTrail || !activeTrail) {
      return;
    }

    lineElements[lineKey] = {
      group,
      historyTrail,
      activeTrail,
    };
  }

  const nodes = Array.from(
    world.querySelectorAll('[data-vl-network-node]')
  );

  let disposed = false;
  let profile = 'desktop';
  let mainDocumentTop = 0;
  let layerHeight = 1;
  let lineData = {};
  let routeAnchors = [];
  let nodeData = [];
  let previousU = 0;
  let initialized = false;
  let lastSparkAt = new Map();
  let resizeFrame = 0;

  const originalMainPosition = main.style.position;
  const shouldPositionMain = (
    window.getComputedStyle(main).position === 'static'
  );

  if (shouldPositionMain) {
    main.style.position = 'relative';
  }

  const spark = {
    root: sparkRoot,
    halo: sparkHalo,
    bolts: sparkBolts,
  };

  const recalcGeometry = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);

    profile = resolveProfile();
    mainDocumentTop = getDocumentTop(main);
    layerHeight = Math.max(
      main.scrollHeight,
      viewportHeight
    );

    layer.style.height = `${layerHeight}px`;
    svg.setAttribute(
      'viewBox',
      `0 0 ${WORLD_WIDTH} ${layerHeight}`
    );

    const geometry = buildNetworkGeometry(
      sections,
      mainDocumentTop,
      profile,
      viewportHeight
    );

    lineData = {};

    LINE_KEYS.forEach((lineKey, lineIndex) => {
      const element = lineElements[lineKey];
      const d = catmullRomPath(
        geometry.laneAnchors[lineIndex]
      );

      element.historyTrail.setAttribute('d', d);
      element.activeTrail.setAttribute('d', '');

      const length = element.historyTrail.getTotalLength();

      element.historyTrail.style.strokeDasharray = (
        `${length} ${length}`
      );
      element.historyTrail.style.strokeDashoffset = (
        `${length}`
      );

      lineData[lineKey] = {
        path: element.historyTrail,
        activePath: element.activeTrail,
        length,
      };
    });

    const middle = lineData.middle;
    const middlePath = middle.path;

    nodeData = geometry.hubs.map((hub, index) => {
      const length = findNearestLength(
        middlePath,
        hub,
        middle.length
      );
      const routeU = length / middle.length;
      const node = nodes[index];

      if (node) {
        node.setAttribute('cx', `${hub[0]}`);
        node.setAttribute('cy', `${hub[1]}`);
      }

      return {
        point: hub,
        length,
        routeU,
      };
    });

    routeAnchors = geometry.middleAnchors.map((anchor) => {
      const length = findNearestLength(
        middlePath,
        anchor,
        middle.length
      );

      return {
        routeU: length / middle.length,
        scrollY: clamp(
          mainDocumentTop
          + anchor[1]
          - viewportHeight * 0.48,
          0,
          Math.max(
            document.documentElement.scrollHeight
            - viewportHeight,
            0
          )
        ),
      };
    }).sort((a, b) => {
      if (a.scrollY !== b.scrollY) {
        return a.scrollY - b.scrollY;
      }

      return a.routeU - b.routeU;
    });
  };

  const render = (inputU, allowSpark = true) => {
    if (disposed || !lineData.middle) return;

    const routeU = clamp(inputU, 0, 1);

    LINE_KEYS.forEach((lineKey) => {
      const data = lineData[lineKey];
      const drawnLength = data.length * routeU;
      const activeLength = clamp(
        data.length * 0.022,
        ACTIVE_SEGMENT_MIN,
        ACTIVE_SEGMENT_MAX
      );
      const activeStart = Math.max(
        0,
        drawnLength - activeLength
      );

      data.path.style.strokeDashoffset = (
        `${data.length - drawnLength}`
      );

      data.activePath.setAttribute(
        'd',
        slicePath(
          data.path,
          activeStart,
          drawnLength
        )
      );
    });

    const middle = lineData.middle;
    const headLength = middle.length * routeU;
    const headPoint = middle.path.getPointAtLength(
      clamp(headLength, 0, middle.length)
    );

    head.setAttribute('cx', `${headPoint.x}`);
    head.setAttribute('cy', `${headPoint.y}`);
    head.style.opacity = (
      routeU > 0.002 && routeU < 0.998
        ? '0.82'
        : '0'
    );

    nodeData.forEach((nodeState, index) => {
      const node = nodes[index];

      if (!node) return;

      const distance = Math.abs(routeU - nodeState.routeU);
      const near = clamp(
        1 - distance / 0.032,
        0,
        1
      );
      const passed = routeU >= nodeState.routeU;

      node.style.opacity = `${Math.max(
        0.18,
        near * 0.94,
        passed ? 0.44 : 0
      )}`;
    });

    if (allowSpark && initialized) {
      nodeData.slice(1).forEach((nodeState, rawIndex) => {
        const nodeIndex = rawIndex + 1;
        const crossedForward = (
          previousU < nodeState.routeU
          && routeU >= nodeState.routeU
        );
        const crossedBackward = (
          previousU > nodeState.routeU
          && routeU <= nodeState.routeU
        );

        if (!crossedForward && !crossedBackward) return;

        const now = performance.now();
        const last = lastSparkAt.get(nodeIndex) || 0;

        if (now - last < SPARK_COOLDOWN_MS) return;

        lastSparkAt.set(nodeIndex, now);

        triggerSpark(
          spark,
          middle.path,
          lineData,
          nodeState.length
        );
      });
    }

    previousU = routeU;
  };

  recalcGeometry();

  const initialScrollY = window.scrollY ?? 0;
  const initialU = mapScrollToRouteU(
    initialScrollY,
    routeAnchors
  );

  previousU = initialU;
  render(initialU, false);
  initialized = true;
  layer.style.opacity = '1';

  const driver = { routeU: initialU };
  const moveRoute = gsap.quickTo(
    driver,
    'routeU',
    {
      duration: 0.52,
      ease: 'power3.out',
      onUpdate: () => {
        render(driver.routeU);
      },
    }
  );

  const updateFromScroll = (scrollY) => {
    moveRoute(
      mapScrollToRouteU(
        scrollY,
        routeAnchors
      )
    );
  };

  const trigger = ScrollTrigger.create({
    trigger: sections.metrics,
    start: 'top bottom',
    endTrigger: sections.contact,
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (disposed) return;
      updateFromScroll(self.scroll());
    },
    onRefresh: (self) => {
      if (disposed) return;

      recalcGeometry();

      const nextU = mapScrollToRouteU(
        self.scroll(),
        routeAnchors
      );

      gsap.killTweensOf(driver);
      driver.routeU = nextU;
      previousU = nextU;
      render(nextU, false);
    },
  });

  const scheduleRecalc = () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      if (disposed) return;

      recalcGeometry();

      const nextU = mapScrollToRouteU(
        window.scrollY ?? 0,
        routeAnchors
      );

      gsap.killTweensOf(driver);
      driver.routeU = nextU;
      previousU = nextU;
      render(nextU, false);
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
    gsap.killTweensOf([
      spark.halo,
      ...spark.bolts,
    ]);

    layer.style.removeProperty('height');
    layer.style.removeProperty('opacity');
    svg.setAttribute('viewBox', '0 0 1000 1');
    head.style.removeProperty('opacity');

    LINE_KEYS.forEach((lineKey) => {
      const element = lineElements[lineKey];

      element.historyTrail.removeAttribute('d');
      element.historyTrail.style.removeProperty(
        'stroke-dasharray'
      );
      element.historyTrail.style.removeProperty(
        'stroke-dashoffset'
      );
      element.activeTrail.removeAttribute('d');
    });

    nodes.forEach((node) => {
      node.removeAttribute('cx');
      node.removeAttribute('cy');
      node.style.removeProperty('opacity');
    });

    spark.halo.removeAttribute('cx');
    spark.halo.removeAttribute('cy');
    spark.halo.style.removeProperty('opacity');

    spark.bolts.forEach((bolt) => {
      bolt.removeAttribute('d');
      bolt.style.removeProperty('opacity');
      bolt.style.removeProperty('stroke-dasharray');
      bolt.style.removeProperty('stroke-dashoffset');
    });

    if (shouldPositionMain) {
      if (originalMainPosition) {
        main.style.position = originalMainPosition;
      } else {
        main.style.removeProperty('position');
      }
    }
  });
}
