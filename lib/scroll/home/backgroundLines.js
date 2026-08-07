import { SECTION_MOTION } from '../../motion/tokens';
import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const LINE_KEYS = ['outer', 'middle', 'inner'];
const SPARK_COOLDOWN_MS = 420;
const VIEWPORT_FADE_RANGE = 0.032;
const IDLE_DELAY_MS = 150;
const IDLE_RENDER_FPS = 30;

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

/*
 * Las tres lineas nacen de una misma ruta desplazada por su normal, pero eso
 * sola las volveria copias paralelas rigidas. `wave*` le da a cada una una
 * ondulacion propia a lo largo del recorrido: distinta frecuencia, distinta
 * fase y distinta amplitud. Es lo que hace que cada una "vaya un poco a su
 * bola" en vez de moverse las tres en bloque.
 *
 * Las amplitudes se expresan como fraccion de la separacion local entre
 * lineas, no en px, para que escalen solas con el viewport y el perfil.
 */
/*
 * Frecuencias deliberadamente no armonicas entre si y fases repartidas: con
 * valores cercanos (6.2 / 7.5) y fases separadas por ~PI las curvas quedaban
 * en espejo, con correlacion -0.87, y el conjunto se leia como un movimiento
 * coordinado. Con estos valores la correlacion maxima entre pares baja a 0.09,
 * o sea cada linea recorre lo suyo.
 */
const LINE_SETTINGS = {
  outer: {
    factor: -1,
    phase: 0.35,
    spreadScale: 1.04,
    waveFreq: 4.7,
    waveAmp: 0.30,
    waveFreq2: 11.8,
    waveAmp2: 0.12,
    driftSpeed: 0.19,
  },
  middle: {
    factor: 0,
    phase: 1.82,
    spreadScale: 0.24,
    waveFreq: 9.1,
    waveAmp: 0.46,
    waveFreq2: 21.8,
    waveAmp2: 0.16,
    driftSpeed: 0.27,
  },
  inner: {
    factor: 1,
    phase: 4.4,
    spreadScale: 0.9,
    waveFreq: 13.1,
    waveAmp: 0.36,
    waveFreq2: 31.4,
    waveAmp2: 0.14,
    driftSpeed: 0.23,
  },
};

/*
 * The reference is not a left-to-right ribbon. Each section transition is
 * a vertical dance: the bundle enters from above, opens, dives, converges,
 * and then releases toward the next bend.
 */
const DESKTOP_ROUTE = {
  nodes: [
    [0.50, -0.14],
    [0.245, 0.30],
    [0.77, 0.40],
    [0.245, 0.31],
    [0.50, 0.29],
    [0.75, 0.36],
    [0.235, 0.33],
    [0.50, 0.25],
    [0.82, 0.30],
    [0.30, 0.39],
  ],
  segments: [
    {
      cp1: [0.52, 0.00],
      cp2: [0.42, 0.12],
      spread: 0.090,
    },
    {
      cp1: [0.34, 0.49],
      cp2: [0.66, 0.60],
      spread: 0.082,
    },
    {
      cp1: [0.73, 0.05],
      cp2: [0.38, 0.03],
      spread: 0.088,
    },
    {
      cp1: [0.28, 0.54],
      cp2: [0.44, 0.57],
      spread: 0.074,
    },
    {
      cp1: [0.54, 0.03],
      cp2: [0.69, 0.02],
      spread: 0.078,
    },
    {
      cp1: [0.70, 0.60],
      cp2: [0.38, 0.64],
      spread: 0.092,
    },
    {
      cp1: [0.27, 0.03],
      cp2: [0.42, -0.01],
      spread: 0.082,
    },
    {
      cp1: [0.57, 0.54],
      cp2: [0.76, 0.56],
      spread: 0.082,
    },
    {
      cp1: [0.75, 0.03],
      cp2: [0.42, 0.04],
      spread: 0.090,
    },
  ],
};

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

/**
 * Secciones que anclan el recorrido, en orden de documento.
 *
 * La home tiene una lista nombrada; las paginas internas no, y antes eso hacia
 * que `initBackgroundLines` abandonara y dejara la capa vacia. Ahora cae a las
 * secciones que la pagina tenga: el recorrido se remuestrea sobre las que haya
 * (ver buildScrollAnchors), asi que no depende de que sean nueve.
 */
function collectSections(main) {
  const named = SECTION_SELECTORS
    .map(([, selector]) => main.querySelector(selector))
    .filter(Boolean);

  if (named.length >= 2) return named;

  const generic = [
    ...main.querySelectorAll('section[data-vl-internal-page], section'),
  ];

  return generic.length >= 2 ? generic : null;
}

function resolveProfile(width) {
  if (width <= 760) return 'mobile';
  if (width <= 1160) return 'tablet';
  return 'desktop';
}

function resolveProfileSettings(profile) {
  if (profile === 'mobile') {
    return {
      samplesPerSegment: 64,
      trailFraction: 0.145,
      activeFraction: 0.014,
      spreadScale: 0.58,
      sparkScale: 0.82,
      floatX: 1.4,
      floatY: 2.8,
      floatRotation: 0.035,
      localFloatX: 0.7,
      localFloatY: 1.1,
      localRotation: 0.025,
      shapeFloat: 0.75,
    };
  }

  if (profile === 'tablet') {
    return {
      samplesPerSegment: 86,
      trailFraction: 0.132,
      activeFraction: 0.013,
      spreadScale: 0.82,
      sparkScale: 0.92,
      floatX: 2.0,
      floatY: 3.8,
      floatRotation: 0.05,
      localFloatX: 1.0,
      localFloatY: 1.6,
      localRotation: 0.035,
      shapeFloat: 1.2,
    };
  }

  return {
    samplesPerSegment: 112,
    trailFraction: 0.122,
    activeFraction: 0.012,
    spreadScale: 1,
    sparkScale: 1,
    floatX: 9.5,
    floatY: 14,
    floatRotation: 0.22,
    localFloatX: 6.5,
    localFloatY: 9,
    localRotation: 0.16,
    shapeFloat: 1.75,
  };
}

function adaptPoint([x, y], profile) {
  if (profile === 'desktop') return [x, y];

  if (profile === 'tablet') {
    return [
      0.5 + (x - 0.5) * 0.86,
      y < 0 ? y : 0.01 + y * 0.97,
    ];
  }

  return [
    0.53 + (x - 0.5) * 0.61,
    y < 0 ? y * 0.9 : 0.015 + y * 0.94,
  ];
}

function normalizePoint(point, width, height, profile) {
  const [x, y] = adaptPoint(point, profile);

  return {
    x: x * width,
    y: y * height,
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

function cubicDerivative(p0, p1, p2, p3, t) {
  const mt = 1 - t;

  return {
    x: (
      3 * mt * mt * (p1.x - p0.x)
      + 6 * mt * t * (p2.x - p1.x)
      + 3 * t * t * (p3.x - p2.x)
    ),
    y: (
      3 * mt * mt * (p1.y - p0.y)
      + 6 * mt * t * (p2.y - p1.y)
      + 3 * t * t * (p3.y - p2.y)
    ),
  };
}

function normalizeVector(vector) {
  const length = Math.max(Math.hypot(vector.x, vector.y), 0.000001);

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function buildRouteSamples(
  lineKey,
  anchorProgress,
  settings,
  profile,
  width,
  height
) {
  const line = LINE_SETTINGS[lineKey];
  const points = [];
  const timeline = [];
  const floatEnvelope = [];
  const minimumDimension = Math.min(width, height);
  const nodes = DESKTOP_ROUTE.nodes.map((point) => (
    normalizePoint(point, width, height, profile)
  ));

  DESKTOP_ROUTE.segments.forEach((segment, segmentIndex) => {
    const start = nodes[segmentIndex];
    const end = nodes[segmentIndex + 1];
    const cp1 = normalizePoint(segment.cp1, width, height, profile);
    const cp2 = normalizePoint(segment.cp2, width, height, profile);
    const startProgress = anchorProgress[segmentIndex];
    const endProgress = anchorProgress[segmentIndex + 1];
    const spread = (
      minimumDimension
      * segment.spread
      * settings.spreadScale
      * line.spreadScale
    );

    for (
      let sampleIndex = 0;
      sampleIndex < settings.samplesPerSegment;
      sampleIndex += 1
    ) {
      if (segmentIndex > 0 && sampleIndex === 0) continue;

      const t = sampleIndex / (settings.samplesPerSegment - 1);
      const center = cubicPoint(start, cp1, cp2, end, t);
      const derivative = normalizeVector(
        cubicDerivative(start, cp1, cp2, end, t)
      );
      const normal = {
        x: -derivative.y,
        y: derivative.x,
      };
      const envelope = Math.sin(Math.PI * t) ** 0.92;
      const organicWave = Math.sin(
        Math.PI * 2 * t
        + line.phase
        + segmentIndex * 0.73
      );
      const laneWave = 1 + 0.12 * Math.sin(
        Math.PI * 2 * t
        + segmentIndex * 0.91
        + line.phase * 0.45
      );
      const laneOffset = (
        line.factor
        * spread
        * envelope
        * laneWave
      );
      const organicScale = lineKey === 'middle' ? 0.16 : 0.11;
      const organicOffset = (
        spread
        * organicScale
        * organicWave
        * envelope
      );
      const tangentOffset = (
        spread
        * 0.025
        * Math.sin(Math.PI * t + line.phase)
        * envelope
        * line.factor
      );

      points.push({
        x: (
          center.x
          + normal.x * (laneOffset + organicOffset)
          + derivative.x * tangentOffset
        ),
        y: (
          center.y
          + normal.y * (laneOffset + organicOffset)
          + derivative.y * tangentOffset
        ),
      });
      timeline.push(lerp(startProgress, endProgress, t));
      floatEnvelope.push(Math.sin(Math.PI * t) ** 1.2);
    }
  });

  const distances = [0];

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x;
    const dy = points[index].y - points[index - 1].y;
    distances.push(distances[index - 1] + Math.hypot(dx, dy));
  }

  const totalLength = Math.max(distances[distances.length - 1], 0.0001);
  const normalizedDistance = distances.map((distance) => (
    distance / totalLength
  ));
  const normals = points.map((point, index) => {
    const previous = points[Math.max(0, index - 3)];
    const next = points[Math.min(points.length - 1, index + 3)];
    const tangent = normalizeVector({
      x: next.x - previous.x,
      y: next.y - previous.y,
    });

    return {
      x: -tangent.y,
      y: tangent.x,
    };
  });

  return {
    points,
    timeline,
    normalizedDistance,
    totalLength,
    normals,
    floatEnvelope,
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

function sampleAtRouteU(samples, routeU) {
  const target = clamp(routeU, 0, 1);
  const upperIndex = findUpperIndex(samples.normalizedDistance, target);
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lowerU = samples.normalizedDistance[lowerIndex];
  const upperU = samples.normalizedDistance[upperIndex];
  const span = upperU - lowerU;
  const t = span > 0 ? (target - lowerU) / span : 0;
  const normal = normalizeVector({
    x: lerp(
      samples.normals[lowerIndex].x,
      samples.normals[upperIndex].x,
      t
    ),
    y: lerp(
      samples.normals[lowerIndex].y,
      samples.normals[upperIndex].y,
      t
    ),
  });

  return {
    point: {
      x: lerp(
        samples.points[lowerIndex].x,
        samples.points[upperIndex].x,
        t
      ),
      y: lerp(
        samples.points[lowerIndex].y,
        samples.points[upperIndex].y,
        t
      ),
    },
    normal,
    envelope: lerp(
      samples.floatEnvelope[lowerIndex],
      samples.floatEnvelope[upperIndex],
      t
    ),
  };
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
    routeU: lerp(
      samples.normalizedDistance[lowerIndex],
      samples.normalizedDistance[upperIndex],
      t
    ),
  };
}

/*
 * Desplaza un punto de la curva sobre su normal combinando dos movimientos:
 *
 *   danza  - depende de la posicion en la ruta, asi que se recorre al
 *            scrollear: la linea baja serpenteando en vez de bajar recta.
 *            Siempre activa. Antes todo el deform estaba multiplicado por
 *            idleMix, de modo que durante el scroll las tres lineas quedaban
 *            rigidamente paralelas y el efecto solo existia en reposo.
 *
 *   deriva - depende del tiempo. Se mantiene apenas viva mientras se scrollea
 *            y sube al maximo en reposo, que es cuando el sistema tiene que
 *            leerse como flotando.
 *
 * `sample.envelope` va a cero en los extremos de cada segmento para que las
 * uniones entre tramos no se quiebren.
 */
const DRIFT_WHILE_SCROLLING = 0.28;

function deformSample(
  sample,
  routeU,
  lineKey,
  floatState
) {
  if (!floatState) return sample.point;

  const line = LINE_SETTINGS[lineKey];
  const amplitude = floatState.waveScale * sample.envelope;

  const danza = (
    Math.sin(routeU * line.waveFreq + line.phase)
    * line.waveAmp
    + Math.sin(routeU * line.waveFreq2 + line.phase * 1.7)
    * line.waveAmp2
  );

  const driftMix = (
    DRIFT_WHILE_SCROLLING
    + (1 - DRIFT_WHILE_SCROLLING) * floatState.idleMix
  );
  const deriva = (
    Math.sin(
      floatState.time * line.driftSpeed
      + routeU * 4.1
      + line.phase
    ) * 0.38
    + Math.sin(
      floatState.time * line.driftSpeed * 0.43
      + routeU * 1.7
      + line.phase * 0.6
    ) * 0.18
  ) * driftMix;

  const amount = (danza + deriva) * amplitude;

  return {
    x: sample.point.x + sample.normal.x * amount,
    y: sample.point.y + sample.normal.y * amount,
  };
}

function visualPointAtRouteU(
  samples,
  routeU,
  lineKey,
  floatState
) {
  const sample = sampleAtRouteU(samples, routeU);

  return deformSample(
    sample,
    routeU,
    lineKey,
    floatState
  );
}

function sliceRoute(
  samples,
  fromU,
  toU,
  lineKey,
  floatState
) {
  const from = clamp(Math.min(fromU, toU), 0, 1);
  const to = clamp(Math.max(fromU, toU), 0, 1);

  if (to - from < 0.00001) return '';

  const points = [
    visualPointAtRouteU(
      samples,
      from,
      lineKey,
      floatState
    ),
  ];

  for (
    let index = 0;
    index < samples.normalizedDistance.length;
    index += 1
  ) {
    const routeU = samples.normalizedDistance[index];

    if (routeU <= from || routeU >= to) continue;

    points.push(deformSample(
      {
        point: samples.points[index],
        normal: samples.normals[index],
        envelope: samples.floatEnvelope[index],
      },
      routeU,
      lineKey,
      floatState
    ));
  }

  points.push(visualPointAtRouteU(
    samples,
    to,
    lineKey,
    floatState
  ));

  return points.reduce((path, point, index) => (
    `${path}${index === 0 ? 'M' : ' L'} `
    + `${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  ), '');
}

function mapScrollToProgress(scrollY, scrollAnchors) {
  if (!scrollAnchors.length) return 0;

  if (scrollY <= scrollAnchors[0].scrollY) return 0;
  if (scrollY >= scrollAnchors[scrollAnchors.length - 1].scrollY) {
    return 1;
  }

  for (let index = 1; index < scrollAnchors.length; index += 1) {
    const previous = scrollAnchors[index - 1];
    const next = scrollAnchors[index];

    if (scrollY > next.scrollY) continue;

    const span = Math.max(next.scrollY - previous.scrollY, 1);
    const local = clamp(
      (scrollY - previous.scrollY) / span,
      0,
      1
    );

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
    const pseudo = (
      Math.sin(seed * 17.17 + index * 9.31)
      + Math.sin(seed * 4.77 + index * 3.13) * 0.45
    );
    const jitter = pseudo * envelope * jitterBase;

    points.push({
      x: lerp(start.x, end.x, t) + normalX * jitter,
      y: lerp(start.y, end.y, t) + normalY * jitter,
    });
  }

  points.push(end);

  return points.reduce((path, point, index) => (
    `${path}${index === 0 ? 'M' : ' L'} `
    + `${point.x.toFixed(2)} ${point.y.toFixed(2)}`
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
        ease: SECTION_MOTION.ease,
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
          opacity: (itemIndex) => (
            itemIndex === 0 ? 0.38 : 0.98
          ),
          strokeDashoffset: 0,
          duration: 0.05,
          ease: 'none',
        }, delay)
        .to([bolt.glow, bolt.core], {
          opacity: 0,
          duration: 0.11,
          ease: SECTION_MOTION.ease,
        }, delay + 0.055);
    });
  };

  return {
    play,
    stop,
  };
}

/**
 * Traduce las secciones de la pagina en los anclajes de scroll del recorrido.
 *
 * El recorrido tiene una cantidad fija de nodos (DESKTOP_ROUTE.nodes), pero la
 * pagina puede tener cualquier cantidad de secciones. Primero se arma un
 * anclaje por seccion y despues se remuestrea a la cantidad exacta de nodos,
 * de modo que la misma ruta sirve para la home de nueve secciones y para una
 * interna de tres.
 */
function buildScrollAnchors(orderedSections, viewportHeight) {
  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewportHeight,
    0
  );
  const firstTop = getDocumentTop(orderedSections[0]);
  const raw = [
    clamp(firstTop - viewportHeight * 1.02, 0, maxScroll),
  ];

  orderedSections.forEach((section, index) => {
    const sectionTop = getDocumentTop(section);
    const fraction = (
      index === orderedSections.length - 1
        ? 0.42
        : 0.58
    );

    raw.push(clamp(
      Math.max(
        sectionTop - viewportHeight * fraction,
        raw[raw.length - 1] + 1
      ),
      0,
      maxScroll
    ));
  });

  const nodeCount = DESKTOP_ROUTE.nodes.length;
  const anchors = [];

  for (let index = 0; index < nodeCount; index += 1) {
    const progress = index / (nodeCount - 1);
    const position = progress * (raw.length - 1);
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, raw.length - 1);

    anchors.push({
      progress,
      scrollY: lerp(raw[lower], raw[upper], position - lower),
    });
  }

  return anchors;
}

function createEventList(anchorProgress) {
  const nodeEvents = anchorProgress.slice(1).map((progress, index) => ({
    id: `node-${index + 1}`,
    type: 'node',
    progress,
  }));
  const bridgeSegments = [7];
  const bridgeEvents = bridgeSegments
    .filter((segmentIndex) => (
      segmentIndex < anchorProgress.length - 1
    ))
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
    return (
      previousProgress < eventProgress
      && nextProgress >= eventProgress
    );
  }

  return (
    previousProgress > eventProgress
    && nextProgress <= eventProgress
  );
}

function distanceToNearestAnchor(progress, anchorProgress) {
  return anchorProgress.reduce(
    (nearest, anchor) => Math.min(
      nearest,
      Math.abs(progress - anchor)
    ),
    Number.POSITIVE_INFINITY
  );
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
    const group = world.querySelector(
      `[data-vl-line-group="${lineKey}"]`
    );
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
  let currentProgress = 0;
  let targetProgress = 0;
  let initialized = false;
  let sparkController = null;
  let idleMix = 0;
  let lastScrollAt = performance.now();
  let lastIdlePathRender = 0;
  let forcePathRender = true;
  const eventCooldowns = new Map();

  const recalcGeometry = () => {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const profile = resolveProfile(width);
    const settings = resolveProfileSettings(profile);

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
          anchorProgress,
          settings,
          profile,
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
      routes,
      width,
      height,
      // Amplitud de la ondulacion. La separacion base entre lineas es ~8.5%
      // de la dimension menor (~68px en 1280x800); la danza se mueve en torno
      // a un cuarto de eso, suficiente para leerse sin que las curvas se
      // crucen entre si. Atada a la geometria y no a px fijos, escala sola en
      // cada viewport y perfil.
      waveScale: (
        Math.min(width, height)
        * 0.018
        * settings.spreadScale
      ),
    };
    forcePathRender = true;
  };

  const triggerSparkEvent = (event) => {
    if (!geometry || !sparkController) return;

    const now = performance.now();
    const lastTime = eventCooldowns.get(event.id) || 0;

    if (now - lastTime < SPARK_COOLDOWN_MS) return;

    eventCooldowns.set(event.id, now);

    const positions = Object.fromEntries(
      LINE_KEYS.map((lineKey) => {
        const route = geometry.routes[lineKey];
        const routeU = pointAtTimeline(
          route,
          event.progress
        ).routeU;

        return [
          lineKey,
          sampleAtRouteU(route, routeU).point,
        ];
      })
    );

    if (event.type === 'bridge') {
      const center = {
        x: (
          positions.outer.x
          + positions.middle.x
          + positions.inner.x
        ) / 3,
        y: (
          positions.outer.y
          + positions.middle.y
          + positions.inner.y
        ) / 3,
      };
      const pairs = [
        {
          start: positions.outer,
          end: positions.middle,
        },
        {
          start: positions.middle,
          end: positions.inner,
        },
        {
          start: positions.outer,
          end: positions.inner,
        },
      ];

      sparkController.play(pairs, center);
      return;
    }

    const sampleOffset = (
      geometry.profile === 'mobile'
        ? 0.014
        : 0.011
    );
    const beforeProgress = clamp(
      event.progress - sampleOffset,
      0,
      1
    );
    const afterProgress = clamp(
      event.progress + sampleOffset,
      0,
      1
    );
    const center = positions.middle;
    const pairs = [];

    LINE_KEYS.forEach((lineKey) => {
      const route = geometry.routes[lineKey];
      const beforeU = pointAtTimeline(
        route,
        beforeProgress
      ).routeU;
      const afterU = pointAtTimeline(
        route,
        afterProgress
      ).routeU;
      const before = sampleAtRouteU(route, beforeU).point;
      const after = sampleAtRouteU(route, afterU).point;

      pairs.push({
        start: center,
        end: before,
      });
      pairs.push({
        start: center,
        end: after,
      });
    });

    sparkController.play(pairs, center);
  };

  const renderFloatingTransforms = (
    time,
    progress
  ) => {
    if (!geometry) return;

    const settings = geometry.settings;
    const sharedX = (
      Math.sin(time * 0.47)
      + Math.sin(time * 0.19 + 1.2) * 0.4
    ) * settings.floatX * idleMix;
    const sharedY = (
      Math.sin(time * 0.36 + 0.8)
      + Math.sin(time * 0.14) * 0.35
    ) * settings.floatY * idleMix;
    const sharedRotation = (
      Math.sin(time * 0.23)
      * settings.floatRotation
      * idleMix
    );

    world.setAttribute(
      'transform',
      `translate(${sharedX.toFixed(2)} ${sharedY.toFixed(2)}) `
      + `rotate(${sharedRotation.toFixed(4)} `
      + `${(geometry.width * 0.5).toFixed(2)} `
      + `${(geometry.height * 0.32).toFixed(2)})`
    );

    const anchorDistance = distanceToNearestAnchor(
      progress,
      anchorProgress
    );
    const localGate = smoothstep(
      0.012,
      0.055,
      anchorDistance
    );

    LINE_KEYS.forEach((lineKey, index) => {
      const line = LINE_SETTINGS[lineKey];
      const localAmount = idleMix * localGate;
      const localX = (
        Math.sin(
          time * (0.42 + index * 0.03)
          + line.phase
        )
        * settings.localFloatX
        * localAmount
      );
      const localY = (
        Math.cos(
          time * (0.34 + index * 0.025)
          + line.phase * 0.8
        )
        * settings.localFloatY
        * localAmount
      );
      const localRotation = (
        Math.sin(time * 0.25 + line.phase)
        * settings.localRotation
        * localAmount
      );

      lineElements[lineKey].group.setAttribute(
        'transform',
        `translate(${localX.toFixed(2)} ${localY.toFixed(2)}) `
        + `rotate(${localRotation.toFixed(4)} `
        + `${(geometry.width * 0.5).toFixed(2)} `
        + `${(geometry.height * 0.32).toFixed(2)})`
      );
    });
  };

  const renderPaths = (
    inputProgress,
    allowSpark,
    time
  ) => {
    if (disposed || !geometry) return;

    const progress = clamp(inputProgress, 0, 1);
    const fadeIn = smoothstep(
      0,
      VIEWPORT_FADE_RANGE,
      progress
    );
    const endSoftening = (
      1 - smoothstep(0.985, 1, progress) * 0.35
    );
    const layerOpacity = fadeIn * endSoftening;
    const floatState = {
      time,
      idleMix,
      waveScale: geometry.waveScale,
    };

    layer.style.opacity = `${layerOpacity}`;

    LINE_KEYS.forEach((lineKey) => {
      const route = geometry.routes[lineKey];
      const headU = pointAtTimeline(
        route,
        progress
      ).routeU;
      const tailU = Math.max(
        0,
        headU - geometry.settings.trailFraction
      );
      const activeStartU = Math.max(
        tailU,
        headU - geometry.settings.activeFraction
      );
      const elements = lineElements[lineKey];
      const headPoint = visualPointAtRouteU(
        route,
        headU,
        lineKey,
        floatState
      );

      elements.historyTrail.setAttribute(
        'd',
        sliceRoute(
          route,
          tailU,
          activeStartU,
          lineKey,
          floatState
        )
      );
      elements.activeTrail.setAttribute(
        'd',
        sliceRoute(
          route,
          activeStartU,
          headU,
          lineKey,
          floatState
        )
      );
      elements.head.setAttribute('cx', `${headPoint.x}`);
      elements.head.setAttribute('cy', `${headPoint.y}`);
      elements.head.style.opacity = (
        progress > 0.004
          ? `${0.64 + layerOpacity * 0.34}`
          : '0'
      );
    });

    if (allowSpark && initialized) {
      const crossed = sparkEvents.filter((event) => (
        crossedEvent(
          previousProgress,
          progress,
          event.progress
        )
      ));

      if (crossed.length) {
        const event = (
          progress >= previousProgress
            ? crossed[crossed.length - 1]
            : crossed[0]
        );

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

  currentProgress = initialProgress;
  targetProgress = initialProgress;
  previousProgress = initialProgress;
  renderPaths(initialProgress, false, 0);
  renderFloatingTransforms(0, initialProgress);
  initialized = true;

  const updateFromScroll = (scrollY) => {
    targetProgress = mapScrollToProgress(
      scrollY,
      scrollAnchors
    );
    lastScrollAt = performance.now();
  };

  const tick = (time, deltaTime) => {
    if (disposed || document.hidden || !geometry) return;

    const deltaSeconds = clamp(
      deltaTime / 1000,
      0,
      0.05
    );
    const progressEase = (
      1 - Math.exp(-11 * deltaSeconds)
    );
    const progressDistance = Math.abs(
      targetProgress - currentProgress
    );
    const isActivelyScrolling = (
      performance.now() - lastScrollAt < IDLE_DELAY_MS
      || progressDistance > 0.0002
    );
    const idleTarget = isActivelyScrolling ? 0.18 : 1;
    const idleEase = 1 - Math.exp(-2.6 * deltaSeconds);

    idleMix += (idleTarget - idleMix) * idleEase;
    currentProgress += (
      targetProgress - currentProgress
    ) * progressEase;

    if (Math.abs(targetProgress - currentProgress) < 0.00001) {
      currentProgress = targetProgress;
    }

    renderFloatingTransforms(time, currentProgress);

    const idleInterval = 1 / IDLE_RENDER_FPS;
    const shouldRenderPaths = (
      forcePathRender
      || isActivelyScrolling
      || time - lastIdlePathRender >= idleInterval
    );

    if (!shouldRenderPaths) return;

    renderPaths(
      currentProgress,
      true,
      time
    );
    forcePathRender = false;
    lastIdlePathRender = time;
  };

  gsap.ticker.add(tick);

  const trigger = ScrollTrigger.create({
    trigger: sections[0],
    start: 'top bottom',
    endTrigger: sections[sections.length - 1],
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

      currentProgress = nextProgress;
      targetProgress = nextProgress;
      previousProgress = nextProgress;
      lastScrollAt = performance.now();
      renderPaths(nextProgress, false, 0);
      renderFloatingTransforms(0, nextProgress);
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

      currentProgress = nextProgress;
      targetProgress = nextProgress;
      previousProgress = nextProgress;
      lastScrollAt = performance.now();
      renderPaths(nextProgress, false, 0);
      renderFloatingTransforms(0, nextProgress);
    });
  };

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleRecalc)
    : null;

  resizeObserver?.observe(main);

  sections.forEach((section) => {
    resizeObserver?.observe(section);
  });

  pushCleanup(cleanups, () => {
    disposed = true;
    cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    trigger.kill();
    gsap.ticker.remove(tick);
    sparkController?.stop();

    layer.style.removeProperty('opacity');
    svg.removeAttribute('viewBox');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    world.removeAttribute('transform');

    LINE_KEYS.forEach((lineKey) => {
      const elements = lineElements[lineKey];

      elements.group.removeAttribute('transform');
      elements.historyTrail.removeAttribute('d');
      elements.activeTrail.removeAttribute('d');
      elements.head.removeAttribute('cx');
      elements.head.removeAttribute('cy');
      elements.head.style.removeProperty('opacity');
    });
  });
}
