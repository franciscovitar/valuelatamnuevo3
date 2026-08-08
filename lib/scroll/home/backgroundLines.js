import { SECTION_MOTION } from '../../motion/tokens';
import { gsap, ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const LINE_KEYS = ['outer', 'middle', 'inner'];
const SPARK_COOLDOWN_MS = 520;
const VIEWPORT_FADE_RANGE = 0.03;

/*
 * Largo del desvanecido de cierre, en fraccion de recorrido. El sistema se
 * apaga hasta quedar transparente, en vez de seguir colgado sobre el footer; el
 * tramo largo es lo que lo hace leerse como una salida y no como un apagon.
 *
 * Termina en el progreso que la pagina ALCANZA de verdad, no en 1: el trigger
 * cierra cuando la ultima seccion sale por arriba, pero el footer es mas bajo
 * que el viewport, asi que el scroll se acaba antes y ese ultimo tramo no se
 * recorre nunca. Anclado a 1, el desvanecido quedaba a mitad de camino y las
 * lineas seguian visibles sobre el footer.
 */
const TAIL_FADE_SPAN = 0.12;
const IDLE_DELAY_MS = 160;
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
 * Tres trayectorias independientes, no tres copias desplazadas de una misma
 * ruta. Cada linea tiene su propio carril, su propio serpenteo, su propia
 * ondulacion y su propio floteo residual; lo unico que comparten es la
 * direccion dominante (siempre descendente) y los nodos donde el recorrido las
 * hace converger.
 *
 * `lane`      carril base: separa las tres lineas en el eje horizontal.
 * `meander*`  serpenteo horizontal propio dentro de cada ciclo.
 * `lead`      adelanto o retraso respecto del scroll: ninguna llega exactamente
 *             al mismo tiempo que las otras.
 * `wave*`     ondulacion sobre la normal en funcion de la POSICION en la ruta.
 *             Es la memoria del trazo: se recorre al scrollear y no cambia con
 *             el tiempo, asi que lo ya dibujado conserva su forma.
 * `drift*`    floteo en funcion del TIEMPO. Muy chico en el cuerpo (microfloteo
 *             tipo lava lamp) y bastante mas vivo cerca de la cabeza, que es la
 *             que define el recorrido.
 */
const LINE_SETTINGS = {
  outer: {
    lane: -1,
    phase: 0.35,
    meanderAmp: 0.115,
    meanderFreq: 2.35,
    trailScale: 1.08,
    lead: -0.0055,
    waveFreq: 5.3,
    waveAmp: 0.34,
    waveFreq2: 12.7,
    waveAmp2: 0.13,
    driftSpeed: 0.17,
    bodyDrift: 0.72,
    headDrift: 1.35,
  },
  middle: {
    lane: 0.12,
    phase: 1.82,
    meanderAmp: 0.072,
    meanderFreq: 3.1,
    trailScale: 1,
    lead: 0,
    waveFreq: 9.1,
    waveAmp: 0.42,
    waveFreq2: 21.4,
    waveAmp2: 0.16,
    driftSpeed: 0.31,
    bodyDrift: 0.95,
    headDrift: 1.7,
  },
  inner: {
    lane: 1,
    phase: 4.4,
    meanderAmp: 0.094,
    meanderFreq: 1.72,
    trailScale: 0.86,
    lead: 0.0072,
    waveFreq: 13.1,
    waveAmp: 0.3,
    waveFreq2: 30.6,
    waveAmp2: 0.12,
    driftSpeed: 0.235,
    bodyDrift: 0.84,
    headDrift: 1.5,
  },
};

/*
 * Coreografia horizontal del recorrido, un tramo por entrada. Los tramos se
 * encadenan uno debajo del otro y forman una unica bajada continua: son siempre
 * las mismas tres lineas, nunca nace ni muere ninguna.
 *
 * `focus` marca los tramos con nodo de convergencia: ahi las tres cabezas se
 * juntan sobre un punto comun, y despues vuelven a separarse. Los tramos sin
 * `focus` bajan sueltos, para que la cercania sea un acontecimiento y no el
 * estado permanente.
 */
const FLOW_CYCLES = [
  { entry: 0.62, mid: 0.31, exit: 0.70, sway: 1, focus: { x: 0.44, y: 0.52, tight: 0.009 } },
  { entry: 0.27, mid: 0.73, exit: 0.36, sway: -1, focus: null },
  { entry: 0.76, mid: 0.44, exit: 0.24, sway: 1, focus: { x: 0.67, y: 0.38, tight: 0.007 } },
  { entry: 0.38, mid: 0.67, exit: 0.72, sway: -1, focus: null },
  { entry: 0.70, mid: 0.33, exit: 0.45, sway: 1, focus: { x: 0.35, y: 0.60, tight: 0.011 } },
  { entry: 0.22, mid: 0.58, exit: 0.66, sway: -1, focus: null },
  { entry: 0.58, mid: 0.26, exit: 0.31, sway: 1, focus: { x: 0.52, y: 0.44, tight: 0.008 } },
];

/* Alturas normalizadas de los puntos de control de un ciclo. */
const CYCLE_STOPS = [-0.24, 0.08, 0.42, 0.80, 1.24];

/* Alto de un tramo. Cada uno arranca donde termino el anterior. */
const CYCLE_SPAN = CYCLE_STOPS[CYCLE_STOPS.length - 1] - CYCLE_STOPS[0];

/*
 * Banda de pantalla por la que viaja la cabeza a lo largo de toda la pagina.
 *
 * El recorrido completo mide muchas pantallas de alto, asi que el mundo se
 * desplaza para seguir a la cabeza y esta recorre solo esta franja: baja medio
 * viewport en todo el scroll de la pagina, o sea muchisimo mas lento que el
 * scroll, y no puede caerse por abajo.
 */
const HEAD_BAND_FROM = 0.2;
const HEAD_BAND_TO = 0.7;

/* Radio de influencia de un nodo de convergencia, en fraccion de recorrido. */
const FOCUS_REACH = 0.055;

/* Cuanto se comprime la ondulacion justo encima del nodo. */
const FOCUS_PINCH = 0.22;

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

/* Pseudoaleatorio determinista: la irregularidad es la misma en cada carga. */
function hashNoise(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function getDocumentTop(element) {
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
  return element.getBoundingClientRect().top + scrollY;
}

/**
 * Secciones que delimitan el recorrido, en orden de documento.
 *
 * La home tiene una lista nombrada; las paginas internas no, y antes eso hacia
 * que `initBackgroundLines` abandonara y dejara la capa vacia. Ahora cae a las
 * secciones que la pagina tenga.
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
      samplesPerCycle: 58,
      trailCycles: 0.78,
      activeFraction: 0.2,
      spread: 0.09,
      meanderScale: 0.62,
      waveScale: 0.038,
      sparkScale: 0.82,
      worldDriftX: 3.5,
      worldDriftY: 5,
    };
  }

  if (profile === 'tablet') {
    return {
      samplesPerCycle: 82,
      trailCycles: 0.84,
      activeFraction: 0.17,
      spread: 0.075,
      meanderScale: 0.82,
      waveScale: 0.030,
      sparkScale: 0.92,
      worldDriftX: 5,
      worldDriftY: 7,
    };
  }

  return {
    samplesPerCycle: 108,
    trailCycles: 0.92,
    activeFraction: 0.15,
    spread: 0.062,
    meanderScale: 1,
    waveScale: 0.031,
    sparkScale: 1,
    worldDriftX: 7,
    worldDriftY: 10,
  };
}

/**
 * Cuantos tramos de coreografia horizontal cubre la pagina. La velocidad de
 * descenso ya no depende de esto — la fija la banda de la cabeza — asi que solo
 * decide cuantas vueltas y cuantos nodos hay en el camino.
 */
function resolveCycleCount(scrollRange, viewportHeight) {
  return clamp(
    Math.round(scrollRange / (viewportHeight * 1.45)),
    3,
    16
  );
}

/**
 * Columnas horizontales de un tramo para una linea concreta.
 *
 * Cuando el tramo tiene nodo de convergencia, las tres lineas comparten la
 * columna del medio salvo un desplazamiento minimo (`tight`): siguen siendo
 * tres trazos distinguibles, pero se leen como atraidas por un punto comun.
 */
function buildCycleColumns(lineKey, cycleIndex, settings) {
  const line = LINE_SETTINGS[lineKey];
  const shape = FLOW_CYCLES[cycleIndex % FLOW_CYCLES.length];
  const wobble = hashNoise(cycleIndex * 7.3 + line.phase * 5.1);
  const wobbleAlt = hashNoise(cycleIndex * 3.9 + line.phase * 11.4);
  const spread = settings.spread;
  const meander = line.meanderAmp * settings.meanderScale;

  return [
    shape.entry + line.lane * spread * 1.15 + wobble * 0.05,
    shape.mid + line.lane * spread * 1.4
      + Math.sin(cycleIndex * line.meanderFreq + line.phase) * meander,
    shape.focus
      ? shape.focus.x + line.lane * shape.focus.tight
      // Sin foco el carril tiene que dominar sobre el serpenteo: si el azar
      // las junta tanto como un nodo disenado, los nodos dejan de ser un
      // acontecimiento y la cercania pasa a ser el estado normal.
      : lerp(shape.mid, shape.exit, 0.5)
        + line.lane * spread * 1.9
        + wobbleAlt * meander * 0.45,
    shape.exit + line.lane * spread * 1.25
      + Math.cos(cycleIndex * line.meanderFreq * 0.8 + line.phase) * meander * 0.8,
    shape.exit + shape.sway * 0.06 + line.lane * spread * 0.7,
  ];
}

function buildCycleRows(cycleIndex) {
  const shape = FLOW_CYCLES[cycleIndex % FLOW_CYCLES.length];

  // Cada tramo se apila DEBAJO del anterior en vez de repetir la misma banda
  // de pantalla. Antes todos ocupaban el mismo rango vertical, de modo que al
  // terminar uno la cabeza salia por abajo y otra entraba por arriba: se leia
  // como lineas nuevas. Apilados, el recorrido es una sola bajada continua.
  const offset = cycleIndex * CYCLE_SPAN;

  return CYCLE_STOPS.map((stop, index) => (
    (index === 2 && shape.focus ? shape.focus.y : stop) + offset
  ));
}

/* Catmull-Rom: pasa por todos los puntos y no produce quiebres ni angulos. */
function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: 0.5 * (
      2 * p1.x
      + (p2.x - p0.x) * t
      + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
      + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
    ),
    y: 0.5 * (
      2 * p1.y
      + (p2.y - p0.y) * t
      + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
      + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
    ),
  };
}

function sampleCycle(waypoints, samples) {
  const points = [];
  const spanCount = waypoints.length - 1;

  for (let index = 0; index < samples; index += 1) {
    const t = index / (samples - 1);
    const scaled = t * spanCount;
    const span = Math.min(Math.floor(scaled), spanCount - 1);
    const local = scaled - span;

    points.push(catmullRomPoint(
      waypoints[Math.max(span - 1, 0)],
      waypoints[span],
      waypoints[span + 1],
      waypoints[Math.min(span + 2, spanCount)],
      local
    ));
  }

  return points;
}

function normalizeVector(vector) {
  const length = Math.max(Math.hypot(vector.x, vector.y), 0.000001);

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

/**
 * Ruta completa de una linea: la concatenacion de todos sus ciclos.
 *
 * `cycleIndex` identifica a que caida pertenece cada muestra. El salto de abajo
 * del viewport a arriba no debe dibujarse, asi que al cambiar de ciclo el path
 * corta y arranca un subtrazo: mientras la cola todavia sale por abajo, la
 * cabeza ya esta entrando por arriba.
 */
function buildLineRoute(lineKey, cycles, settings, width, height) {
  const waypoints = [];
  const focusSlots = [];

  for (let cycle = 0; cycle < cycles; cycle += 1) {
    const columns = buildCycleColumns(lineKey, cycle, settings);
    const rows = buildCycleRows(cycle);
    // El primer punto de un tramo coincide con el ultimo del anterior, asi que
    // se omite: el recorrido queda encadenado y sin costura visible.
    const from = cycle === 0 ? 0 : 1;

    if (FLOW_CYCLES[cycle % FLOW_CYCLES.length].focus) {
      focusSlots.push(waypoints.length + (2 - from));
    }

    for (let index = from; index < columns.length; index += 1) {
      waypoints.push({
        x: columns[index] * width,
        y: rows[index] * height,
      });
    }
  }

  const spanCount = waypoints.length - 1;
  const points = sampleCycle(waypoints, settings.samplesPerCycle * cycles);
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
    normals,
    focusUs: focusSlots.map((slot) => slot / spanCount),
  };
}

/*
 * El recorrido se parametriza por ciclo, no por longitud de arco.
 *
 * Con longitud de arco cada linea llegaba a un mismo punto del plano en un
 * momento distinto del scroll — sus rutas no miden lo mismo — y la
 * convergencia, que es el nucleo del efecto, no se veia nunca. Parametrizadas
 * por ciclo las tres comparten el reloj: en `u = (ciclo + 0.5) / ciclos` las
 * tres estan sobre el nodo comun. Como efecto secundario cada linea avanza a
 * su propio ritmo en pantalla segun cuanto mida su tramo, que es exactamente
 * la variacion de velocidad que se busca.
 */
function routeUToIndex(route, routeU) {
  return clamp(routeU, 0, 1) * (route.points.length - 1);
}

function sampleAtRouteU(route, routeU) {
  const position = routeUToIndex(route, routeU);
  const lowerIndex = Math.min(
    Math.floor(position),
    route.points.length - 2
  );
  const upperIndex = lowerIndex + 1;
  const t = position - lowerIndex;

  return {
    point: {
      x: lerp(route.points[lowerIndex].x, route.points[upperIndex].x, t),
      y: lerp(route.points[lowerIndex].y, route.points[upperIndex].y, t),
    },
    normal: normalizeVector({
      x: lerp(route.normals[lowerIndex].x, route.normals[upperIndex].x, t),
      y: lerp(route.normals[lowerIndex].y, route.normals[upperIndex].y, t),
    }),
  };
}

/**
 * Cercania al nodo de convergencia mas proximo: 0 justo encima de un nodo, 1
 * lejos de todos.
 *
 * Es lo que convierte un cruce accidental en una convergencia de verdad. Sobre
 * el nodo apaga el adelanto propio de cada linea — si no, cada cabeza llegaba
 * al punto comun en un momento distinto — y comprime la ondulacion, para que
 * las tres se junten de verdad en vez de pasar cerca.
 */
function focusNearness(routeU, focusUs) {
  if (!focusUs || !focusUs.length) return 1;

  let nearest = Infinity;

  for (let index = 0; index < focusUs.length; index += 1) {
    nearest = Math.min(nearest, Math.abs(routeU - focusUs[index]));
  }

  return smoothstep(0, FOCUS_REACH, nearest);
}

/**
 * Desplaza un punto de la curva sobre su normal combinando dos movimientos:
 *
 *   forma  - depende de la posicion en la ruta. Es lo que hace que la linea
 *            baje serpenteando en vez de bajar recta, y como no depende del
 *            tiempo, el tramo ya trazado conserva su forma: es la memoria del
 *            recorrido.
 *
 *   floteo - depende del tiempo. Es el que da la sensacion de algo suspendido
 *            en liquido: el cuerpo ya trazado nunca queda rigido, y cerca de la
 *            cabeza sube todavia mas, porque la cabeza es la que esta
 *            definiendo hacia donde va la trayectoria.
 */
function deformSample(sample, routeU, lineKey, floatState) {
  if (!floatState) return sample.point;

  const line = LINE_SETTINGS[lineKey];
  const cycleT = (routeU * floatState.routeScale) % 1;
  const envelope = 0.55 + 0.45 * Math.sin(Math.PI * cycleT);
  const forma = (
    Math.sin(routeU * floatState.routeScale * line.waveFreq + line.phase)
    * line.waveAmp
    + Math.sin(
      routeU * floatState.routeScale * line.waveFreq2
      + line.phase * 1.7
    ) * line.waveAmp2
  );

  // Proximidad a la cabeza: 0 en la cola, 1 en la punta que esta avanzando.
  const headNearness = smoothstep(
    floatState.headU - floatState.trailU,
    floatState.headU,
    routeU
  );
  const driftAmount = lerp(
    line.bodyDrift,
    line.headDrift,
    headNearness * headNearness
  ) * floatState.restBoost;
  const floteo = (
    Math.sin(
      floatState.time * line.driftSpeed
      + routeU * floatState.routeScale * 3.6
      + line.phase
    ) * 0.34
    + Math.sin(
      floatState.time * line.driftSpeed * 0.41
      + routeU * floatState.routeScale * 1.4
      + line.phase * 0.6
    ) * 0.2
  ) * driftAmount;

  // Sobre un nodo la ondulacion se comprime: sin esto las tres curvas pasaban
  // cerca pero cada una con su propia onda encima, y la convergencia se leia
  // como un choque en vez de como un punto comun.
  const pinch = lerp(
    FOCUS_PINCH,
    1,
    focusNearness(routeU, floatState.focusUs)
  );
  const amount = (forma + floteo) * floatState.waveScale * envelope * pinch;

  return {
    x: sample.point.x + sample.normal.x * amount,
    y: sample.point.y + sample.normal.y * amount,
  };
}

function visualPointAtRouteU(route, routeU, lineKey, floatState) {
  return deformSample(
    sampleAtRouteU(route, routeU),
    routeU,
    lineKey,
    floatState
  );
}

/*
 * Trazo visible entre dos posiciones de la ruta. Un unico subtrazo: el
 * recorrido es continuo de punta a punta, asi que no hay ningun salto que
 * disimular ni linea que nazca de nuevo.
 */
function sliceRoute(route, fromU, toU, lineKey, floatState) {
  const from = clamp(Math.min(fromU, toU), 0, 1);
  const to = clamp(Math.max(fromU, toU), 0, 1);

  if (to - from < 0.00001) return '';

  const lastSample = route.points.length - 1;
  const firstIndex = Math.ceil(routeUToIndex(route, from));
  const lastIndex = Math.floor(routeUToIndex(route, to));
  let path = '';

  const emit = (point) => {
    path += `${path ? ' L' : 'M'} `
      + `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  };

  emit(visualPointAtRouteU(route, from, lineKey, floatState));

  for (let index = firstIndex; index <= lastIndex; index += 1) {
    const routeU = index / lastSample;

    if (routeU <= from || routeU >= to) continue;

    emit(deformSample(
      {
        point: route.points[index],
        normal: route.normals[index],
      },
      routeU,
      lineKey,
      floatState
    ));
  }

  emit(visualPointAtRouteU(route, to, lineKey, floatState));

  return path;
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
  let sparkEvents = [];
  let previousProgress = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let initialized = false;
  let sparkController = null;
  let restMix = 0;
  let lastScrollAt = performance.now();
  let lastIdlePathRender = 0;
  let forcePathRender = true;
  // Progreso maximo que el scroll de la pagina permite alcanzar de verdad.
  let tailFadeTo = 1;
  const eventCooldowns = new Map();

  const getScrollRange = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    const first = getDocumentTop(sections[0]) - viewportHeight;
    const last = sections[sections.length - 1];
    const end = getDocumentTop(last) + last.offsetHeight;

    return Math.max(end - first, viewportHeight);
  };

  const recalcGeometry = () => {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const profile = resolveProfile(width);
    const settings = resolveProfileSettings(profile);
    const cycles = resolveCycleCount(getScrollRange(), height);

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);

    const routes = Object.fromEntries(
      LINE_KEYS.map((lineKey) => [
        lineKey,
        buildLineRoute(lineKey, cycles, settings, width, height),
      ])
    );

    // Los destellos ya no marcan cambios de seccion sino los nodos donde las
    // tres curvas se juntan de verdad. Las tres rutas tienen la misma cantidad
    // y el mismo orden de puntos de control, asi que `focusUs` es identico para
    // las tres: en ese punto del recorrido estan las tres cabezas juntas.
    sparkEvents = routes.middle.focusUs.map((progress, index) => ({
      id: `focus-${index}`,
      progress,
    }));

    sparkController?.stop();
    sparkController = createSparkController(sparkRoot, settings.sparkScale);

    geometry = {
      profile,
      settings,
      routes,
      width,
      height,
      cycles,
      // Amplitud de la ondulacion, atada a la geometria y no a px fijos para
      // que escale sola con el viewport.
      waveScale: Math.min(width, height) * settings.waveScale,
      // La forma depende de la posicion en la ruta; sin este factor, una
      // pagina con mas ciclos comprimiria todas las ondas.
      routeScale: cycles,
      trailU: (settings.trailCycles / cycles),
      focusUs: routes.middle.focusUs,
    };
    forcePathRender = true;
  };

  /**
   * Posicion de la ruta que le toca a la cabeza de una linea.
   *
   * El adelanto propio de cada linea se apaga al acercarse a un nodo: fuera de
   * los nodos las tres avanzan a ritmos distintos, pero sobre el nodo llegan
   * juntas, que es lo que hace que la convergencia se lea como un punto comun
   * y no como tres cruces sueltos.
   */
  const headRouteU = (lineKey, progress) => {
    const lead = LINE_SETTINGS[lineKey].lead
      * focusNearness(progress, geometry.focusUs);

    return clamp(progress + lead, 0, 1);
  };

  /*
   * Desplazamiento del mundo para que la cabeza viaje por su banda.
   *
   * El recorrido completo mide varias pantallas de alto; sin esta compensacion
   * la cabeza bajaba mas rapido que el scroll y terminaba saliendose por abajo.
   * Siguiendola, lo que se ve es siempre el entorno de la cabeza: la cola se
   * pierde por arriba y la continuidad es total.
   */
  const headFollowOffset = (progress) => {
    if (!geometry) return 0;

    const band = lerp(HEAD_BAND_FROM, HEAD_BAND_TO, clamp(progress, 0, 1));
    const head = sampleAtRouteU(
      geometry.routes.middle,
      headRouteU('middle', progress)
    );

    return geometry.height * band - head.point.y;
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
        sampleAtRouteU(geometry.routes[lineKey], event.progress).point,
      ])
    );
    const center = {
      x: (positions.outer.x + positions.middle.x + positions.inner.x) / 3,
      y: (positions.outer.y + positions.middle.y + positions.inner.y) / 3,
    };

    sparkController.play(
      [
        { start: positions.outer, end: positions.middle },
        { start: positions.middle, end: positions.inner },
        { start: positions.outer, end: positions.inner },
        { start: center, end: positions.middle },
        { start: center, end: positions.outer },
        { start: center, end: positions.inner },
      ],
      center
    );
  };

  /*
   * Deriva global minima y permanente. No mueve la forma de las lineas (eso lo
   * hace la deformacion sobre la normal); solo evita que el conjunto quede
   * absolutamente clavado al viewport.
   */
  const renderWorldDrift = (time, progress) => {
    if (!geometry) return;

    const settings = geometry.settings;
    const amount = 0.45 + 0.55 * restMix;
    const driftX = (
      Math.sin(time * 0.21)
      + Math.sin(time * 0.083 + 1.2) * 0.4
    ) * settings.worldDriftX * amount;
    const driftY = (
      Math.sin(time * 0.17 + 0.8)
      + Math.sin(time * 0.061) * 0.35
    ) * settings.worldDriftY * amount
      + headFollowOffset(progress);

    world.setAttribute(
      'transform',
      `translate(${driftX.toFixed(2)} ${driftY.toFixed(2)})`
    );
  };

  const renderPaths = (inputProgress, allowSpark, time) => {
    if (disposed || !geometry) return;

    const progress = clamp(inputProgress, 0, 1);
    const fadeIn = smoothstep(0, VIEWPORT_FADE_RANGE, progress);
    const fadeOut = 1 - smoothstep(
      tailFadeTo - TAIL_FADE_SPAN,
      tailFadeTo,
      progress
    );
    const layerOpacity = fadeIn * fadeOut;

    layer.style.opacity = `${layerOpacity}`;

    LINE_KEYS.forEach((lineKey) => {
      const route = geometry.routes[lineKey];
      const elements = lineElements[lineKey];
      const headU = headRouteU(lineKey, progress);
      const trailU = geometry.trailU * LINE_SETTINGS[lineKey].trailScale;
      const tailU = Math.max(0, headU - trailU);
      // Tramo brillante de la punta: la parte que en este momento esta
      // definiendo el recorrido.
      const activeStartU = Math.max(
        tailU,
        headU - trailU * geometry.settings.activeFraction
      );
      const floatState = {
        time,
        headU,
        trailU,
        restBoost: 0.7 + 0.3 * restMix,
        waveScale: geometry.waveScale,
        routeScale: geometry.routeScale,
        focusUs: geometry.focusUs,
      };
      const headPoint = visualPointAtRouteU(
        route,
        headU,
        lineKey,
        floatState
      );

      elements.historyTrail.setAttribute(
        'd',
        sliceRoute(route, tailU, activeStartU, lineKey, floatState)
      );
      elements.activeTrail.setAttribute(
        'd',
        sliceRoute(route, activeStartU, headU, lineKey, floatState)
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
        crossedEvent(previousProgress, progress, event.progress)
      ));

      if (crossed.length) {
        triggerSparkEvent(
          progress >= previousProgress
            ? crossed[crossed.length - 1]
            : crossed[0]
        );
      }
    }

    previousProgress = progress;
  };

  const resetTo = (progress) => {
    currentProgress = progress;
    targetProgress = progress;
    previousProgress = progress;
    lastScrollAt = performance.now();
    renderPaths(progress, false, 0);
    renderWorldDrift(0, progress);
  };

  recalcGeometry();
  resetTo(0);
  initialized = true;

  const tick = (time, deltaTime) => {
    if (disposed || document.hidden || !geometry) return;

    const deltaSeconds = clamp(deltaTime / 1000, 0, 0.05);
    const progressEase = 1 - Math.exp(-11 * deltaSeconds);
    const progressDistance = Math.abs(targetProgress - currentProgress);
    const isActivelyScrolling = (
      performance.now() - lastScrollAt < IDLE_DELAY_MS
      || progressDistance > 0.0002
    );
    const restEase = 1 - Math.exp(-2.6 * deltaSeconds);

    restMix += ((isActivelyScrolling ? 0 : 1) - restMix) * restEase;
    currentProgress += (targetProgress - currentProgress) * progressEase;

    if (Math.abs(targetProgress - currentProgress) < 0.00001) {
      currentProgress = targetProgress;
    }

    renderWorldDrift(time, currentProgress);

    const shouldRenderPaths = (
      forcePathRender
      || isActivelyScrolling
      || time - lastIdlePathRender >= 1 / IDLE_RENDER_FPS
    );

    if (!shouldRenderPaths) return;

    renderPaths(currentProgress, true, time);
    forcePathRender = false;
    lastIdlePathRender = time;
  };

  gsap.ticker.add(tick);

  const updateTailFade = (self) => {
    const span = self.end - self.start;

    if (!(span > 0)) {
      tailFadeTo = 1;
      return;
    }

    const reachable = (ScrollTrigger.maxScroll(window) - self.start) / span;

    // El desvanecido necesita recorrido para leerse: si la pagina termina
    // demasiado pronto se respeta el largo minimo aunque no llegue a cero.
    tailFadeTo = clamp(reachable, TAIL_FADE_SPAN + 0.05, 1);
  };

  const trigger = ScrollTrigger.create({
    trigger: sections[0],
    start: 'top bottom',
    endTrigger: sections[sections.length - 1],
    end: 'bottom top',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (disposed) return;

      targetProgress = clamp(self.progress, 0, 1);
      lastScrollAt = performance.now();
    },
    onRefresh: (self) => {
      if (disposed) return;

      recalcGeometry();
      updateTailFade(self);
      resetTo(clamp(self.progress, 0, 1));
    },
  });

  const scheduleRecalc = () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      if (disposed) return;

      recalcGeometry();
      updateTailFade(trigger);
      resetTo(clamp(trigger.progress, 0, 1));
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
