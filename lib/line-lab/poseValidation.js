import {
  LINE_KEYS,
  MASTER_ANCHORS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  MASTER_PATH_D,
  CONVERGENCE_BEATS,
  SAFE_X_MIN,
  SAFE_X_MAX,
  buildMasterPathD,
  resolveCameraTop,
  resolveLineState,
} from './trionnLinesEngine';

const ANCHOR_COUNT = 25;
const SEGMENT_COUNT = 24;
const Y_TOLERANCE = 0.000001;
const X_TOLERANCE = 0.000001;
const PROGRESS_STEP = 0.01;

function inSafeX(x) {
  return x >= SAFE_X_MIN - X_TOLERANCE && x <= SAFE_X_MAX + X_TOLERANCE;
}

function stdDev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function directionChanges(points) {
  let lastSign = 0;
  let changes = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - points[i - 1][0];
    if (Math.abs(dx) < 1) continue;
    const sign = dx > 0 ? 1 : -1;
    if (lastSign !== 0 && sign !== lastSign) changes += 1;
    lastSign = sign;
  }
  return changes;
}

export function validateRoutes(routes = MASTER_ROUTES) {
  const warnings = [];

  LINE_KEYS.forEach((key) => {
    const anchors = MASTER_ANCHORS[key];
    const route = routes[key];
    const samples = ROUTE_SAMPLES[key];

    if (!Array.isArray(anchors) || anchors.length !== ANCHOR_COUNT) {
      warnings.push(`"${key}": debe tener ${ANCHOR_COUNT} anclas.`);
      return;
    }

    anchors.forEach(([x], i) => {
      if (!inSafeX(x)) warnings.push(`"${key}": ancla ${i} fuera de SAFE_X.`);
    });

    for (let i = 1; i < anchors.length; i += 1) {
      if (!(anchors[i][1] > anchors[i - 1][1])) {
        warnings.push(`"${key}": anclas no monótonas en Y.`);
        break;
      }
    }

    if (!route || !Array.isArray(route.segments) || route.segments.length !== SEGMENT_COUNT) {
      warnings.push(`"${key}": debe tener ${SEGMENT_COUNT} segmentos.`);
    } else {
      let prevY = route.start[1];
      route.segments.forEach((segment, i) => {
        if (!inSafeX(segment.cp1[0]) || !inSafeX(segment.cp2[0]) || !inSafeX(segment.end[0])) {
          warnings.push(`"${key}": segmento ${i} fuera de SAFE_X.`);
        }
        if (!(prevY < segment.cp1[1] && segment.cp1[1] < segment.cp2[1] && segment.cp2[1] < segment.end[1])) {
          warnings.push(`"${key}": segmento ${i} no respeta p0.y < cp1.y < cp2.y < p3.y.`);
        }
        prevY = segment.end[1];
      });
    }

    if (!samples || !samples.points.length) {
      warnings.push(`"${key}": sin muestras.`);
      return;
    }

    samples.points.forEach(([x], i) => {
      if (!inSafeX(x)) warnings.push(`"${key}": muestra ${i} fuera de SAFE_X.`);
    });

    for (let i = 1; i < samples.points.length; i += 1) {
      if (samples.points[i][1] < samples.points[i - 1][1] - Y_TOLERANCE) {
        warnings.push(`"${key}": muestra ${i} rompe monotonía Y.`);
        break;
      }
    }

    if (directionChanges(samples.points) < 10) {
      warnings.push(`"${key}": pocos cambios de dirección horizontal.`);
    }

    const dA = buildMasterPathD(route);
    const dB = buildMasterPathD(route);
    if (dA !== dB || dA !== MASTER_PATH_D[key]) {
      warnings.push(`"${key}": MASTER_PATH_D no determinista.`);
    }
  });

  // Convergencias exactas P0..P8
  CONVERGENCE_BEATS.forEach((beat) => {
    const o = resolveLineState(beat.progress, 'outer').headPoint;
    const m = resolveLineState(beat.progress, 'middle').headPoint;
    const i = resolveLineState(beat.progress, 'inner').headPoint;

    const dOM = Math.hypot(o[0] - m[0], o[1] - m[1]);
    const dOI = Math.hypot(o[0] - i[0], o[1] - i[1]);
    const dMI = Math.hypot(m[0] - i[0], m[1] - i[1]);
    const maxD = Math.max(dOM, dOI, dMI);
    if (maxD > 0.05) {
      warnings.push(`Convergencia en p=${beat.progress} excede tolerancia (${maxD.toFixed(4)}).`);
    }
  });

  // Aperturas entre convergencias
  let spread140 = 0;
  let spread260 = 0;
  for (let idx = 0; idx < CONVERGENCE_BEATS.length - 1; idx += 1) {
    const a = CONVERGENCE_BEATS[idx].progress;
    const b = CONVERGENCE_BEATS[idx + 1].progress;
    const mid = (a + b) / 2;

    const ox = resolveLineState(mid, 'outer').headPoint[0];
    const mx = resolveLineState(mid, 'middle').headPoint[0];
    const ix = resolveLineState(mid, 'inner').headPoint[0];
    const spread = Math.max(ox, mx, ix) - Math.min(ox, mx, ix);

    if (spread >= 140) spread140 += 1;
    if (spread >= 260) spread260 += 1;
  }
  if (spread140 < 6) warnings.push(`Apertura insuficiente: ${spread140}/8 intervalos con spread >= 140.`);
  if (spread260 < 3) warnings.push(`Apertura alta insuficiente: ${spread260}/8 intervalos con spread >= 260.`);

  // No paralelismo: desviación de separaciones
  const outerMiddle = [];
  const middleInner = [];
  const len = Math.min(ROUTE_SAMPLES.outer.points.length, ROUTE_SAMPLES.middle.points.length, ROUTE_SAMPLES.inner.points.length);
  for (let i = 0; i < len; i += 1) {
    const ox = ROUTE_SAMPLES.outer.points[i][0];
    const mx = ROUTE_SAMPLES.middle.points[i][0];
    const ix = ROUTE_SAMPLES.inner.points[i][0];
    outerMiddle.push(ox - mx);
    middleInner.push(mx - ix);
  }
  if (stdDev(outerMiddle) < 20 || stdDev(middleInner) < 20) {
    warnings.push('Separaciones casi constantes: rutas demasiado paralelas.');
  }

  // Acumulación, tail fija, cámara monótona
  const prevHead = { outer: -Infinity, middle: -Infinity, inner: -Infinity };
  const prevCount = { outer: -Infinity, middle: -Infinity, inner: -Infinity };
  let prevCameraTop = -Infinity;

  for (let p = 0; p <= 1 + 1e-9; p += PROGRESS_STEP) {
    const progress = Math.min(p, 1);
    const cameraTop = resolveCameraTop(progress);
    if (cameraTop < prevCameraTop - 1e-9) warnings.push(`cameraTop disminuyó en p=${progress.toFixed(2)}.`);
    prevCameraTop = cameraTop;

    LINE_KEYS.forEach((key) => {
      const state = resolveLineState(progress, key);
      if (state.tailU !== 0) warnings.push(`"${key}": tailU != 0 en p=${progress.toFixed(2)}.`);
      if (state.headU < prevHead[key] - 1e-9) warnings.push(`"${key}": headU disminuyó en p=${progress.toFixed(2)}.`);
      if (state.trailPointCount < prevCount[key]) warnings.push(`"${key}": trailPointCount disminuyó en p=${progress.toFixed(2)}.`);
      prevHead[key] = state.headU;
      prevCount[key] = state.trailPointCount;
    });
  }

  // Persistencia final 0.96 vs 1
  const camera96 = resolveCameraTop(0.96);
  const camera1 = resolveCameraTop(1);
  if (Math.abs(camera96 - camera1) > 0.000001) warnings.push('cameraTop difiere entre 0.96 y 1.');

  LINE_KEYS.forEach((key) => {
    const a = resolveLineState(0.96, key);
    const b = resolveLineState(1, key);
    if (Math.abs(a.headU - 1) > 0.000001 || Math.abs(b.headU - 1) > 0.000001) warnings.push(`"${key}": headU final no es 1.`);
    if (a.tailU !== 0 || b.tailU !== 0) warnings.push(`"${key}": tailU final no es 0.`);
    if (a.trailD !== b.trailD) warnings.push(`"${key}": trailD difiere entre 0.96 y 1.`);
    if (!a.trailD.trim()) warnings.push(`"${key}": trailD final vacío.`);
  });

  // Reversibilidad geométrica
  LINE_KEYS.forEach((key) => {
    const a = resolveLineState(0.37, key);
    const b = resolveLineState(0.78, key);
    const c = resolveLineState(0.37, key);
    if (a.trailD !== c.trailD || a.headU !== c.headU || a.tailU !== c.tailU || a.headPoint[0] !== c.headPoint[0] || a.headPoint[1] !== c.headPoint[1]) {
      warnings.push(`"${key}": no reversible entre 0.37→0.78→0.37.`);
    }
    if (!b.trailD) warnings.push(`"${key}": trailD vacío en 0.78.`);
  });

  return warnings;
}
