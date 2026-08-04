import {
  LINE_KEYS,
  MASTER_ANCHORS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  MASTER_PATH_D,
  CONVERGENCE_BEATS,
  INTERVAL_DANCE,
  MERGE_RECOVERY_RADIUS,
  SAFE_X_MIN,
  SAFE_X_MAX,
  buildMasterPathD,
  resolveCameraTop,
  resolveLineState,
} from './trionnLinesEngine';

const ANCHOR_COUNT = 17;
const SEGMENT_COUNT = 16;
const Y_TOLERANCE = 0.000001;
const X_TOLERANCE = 0.000001;
const PROGRESS_STEP = 0.002;

function inSafeX(x) {
  return x >= SAFE_X_MIN - X_TOLERANCE && x <= SAFE_X_MAX + X_TOLERANCE;
}

function isNearConvergence(progress) {
  return CONVERGENCE_BEATS.some((beat) => Math.abs(progress - beat.progress) <= MERGE_RECOVERY_RADIUS);
}

function countCentralDirectionChanges(start, end) {
  const sampleCount = 18;
  let lastSign = 0;
  let changes = 0;
  let prevX = null;

  for (let i = 0; i <= sampleCount; i += 1) {
    const p = start + (end - start) * (i / sampleCount);
    const x = resolveLineState(p, 'middle').headPoint[0];
    if (prevX === null) {
      prevX = x;
      continue;
    }
    const dx = x - prevX;
    prevX = x;
    if (Math.abs(dx) < 2) continue;
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

    for (let i = 20; i < samples.points.length; i += 20) {
      const dx = samples.points[i][0] - samples.points[i - 20][0];
      const dy = samples.points[i][1] - samples.points[i - 20][1];
      if (Math.abs(dy) < 40) continue;
      if (Math.abs(dx / dy) > 0.55) {
        warnings.push(`"${key}": pendiente excesiva en muestra ${i}.`);
        break;
      }
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
    const spread = Math.max(o[0], m[0], i[0]) - Math.min(o[0], m[0], i[0]);
    if (spread > 0.05) warnings.push(`Convergencia en p=${beat.progress} excede 0.05.`);
  });

  // Midpoint spreads should remain controlled and compact.
  let compactMidCount = 0;
  for (let idx = 0; idx < CONVERGENCE_BEATS.length - 1; idx += 1) {
    const a = CONVERGENCE_BEATS[idx].progress;
    const b = CONVERGENCE_BEATS[idx + 1].progress;
    const mid = (a + b) / 2;
    const ox = resolveLineState(mid, 'outer').headPoint[0];
    const mx = resolveLineState(mid, 'middle').headPoint[0];
    const ix = resolveLineState(mid, 'inner').headPoint[0];
    const spread = Math.max(ox, mx, ix) - Math.min(ox, mx, ix);
    if (spread < 90 || spread > 160) warnings.push(`Midpoint ${idx} spread fuera de [90,160]: ${spread.toFixed(3)}.`);
    if (spread >= 100 && spread <= 150) compactMidCount += 1;

    const directionChanges = countCentralDirectionChanges(a, b);
    if (directionChanges > 1) warnings.push(`Intervalo ${idx} tiene zigzag central excesivo (${directionChanges}).`);
  }
  if (compactMidCount < 6) warnings.push(`Bundle poco compacto: solo ${compactMidCount}/8 midpoints en [100,150].`);

  // Accumulation, ordering, spread limits and center constraints across progress.
  const prevHead = { outer: -Infinity, middle: -Infinity, inner: -Infinity };
  const prevCount = { outer: -Infinity, middle: -Infinity, inner: -Infinity };
  let prevCameraTop = -Infinity;
  let prevSpread = null;

  for (let p = 0; p <= 1 + 1e-9; p += PROGRESS_STEP) {
    const progress = Math.min(p, 1);
    const cameraTop = resolveCameraTop(progress);
    if (cameraTop < prevCameraTop - 1e-9) warnings.push(`cameraTop disminuyó en p=${progress.toFixed(3)}.`);
    prevCameraTop = cameraTop;

    const o = resolveLineState(progress, 'outer');
    const m = resolveLineState(progress, 'middle');
    const i = resolveLineState(progress, 'inner');

    const spread = Math.max(o.headPoint[0], m.headPoint[0], i.headPoint[0]) - Math.min(o.headPoint[0], m.headPoint[0], i.headPoint[0]);
    const center = (o.headPoint[0] + m.headPoint[0] + i.headPoint[0]) / 3;

    if (spread > 175) warnings.push(`Spread global excede 175 en p=${progress.toFixed(3)} (${spread.toFixed(3)}).`);
    if (center < 350 || center > 750) warnings.push(`Centro fuera de [350,750] en p=${progress.toFixed(3)} (${center.toFixed(3)}).`);

    if (!isNearConvergence(progress)) {
      if (o.headPoint[0] > m.headPoint[0] + 1e-6 || m.headPoint[0] > i.headPoint[0] + 1e-6) {
        warnings.push(`Cruce de carriles en p=${progress.toFixed(3)}.`);
      }
    }

    if (prevSpread !== null && Math.abs(spread - prevSpread) > 12) {
      warnings.push(`Cambio brusco de separación en p=${progress.toFixed(3)}.`);
    }
    prevSpread = spread;

    [
      ['outer', o],
      ['middle', m],
      ['inner', i],
    ].forEach(([key, state]) => {
      if (state.tailU !== 0) warnings.push(`"${key}": tailU != 0 en p=${progress.toFixed(3)}.`);
      if (state.headU < prevHead[key] - 1e-9) warnings.push(`"${key}": headU disminuyó en p=${progress.toFixed(3)}.`);
      if (state.trailPointCount < prevCount[key]) warnings.push(`"${key}": trailPointCount disminuyó en p=${progress.toFixed(3)}.`);
      prevHead[key] = state.headU;
      prevCount[key] = state.trailPointCount;
    });
  }

  // Convergence center continuity guard
  for (let i = 0; i < INTERVAL_DANCE.length - 1; i += 1) {
    const dx = Math.abs(INTERVAL_DANCE[i + 1].centerX - INTERVAL_DANCE[i].centerX);
    if (dx > 220) warnings.push(`Salto de centerX excesivo entre intervalos ${i} y ${i + 1}.`);
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
    const c = resolveLineState(0.37, key);
    if (
      a.trailD !== c.trailD ||
      a.headU !== c.headU ||
      a.tailU !== c.tailU ||
      a.headPoint[0] !== c.headPoint[0] ||
      a.headPoint[1] !== c.headPoint[1]
    ) {
      warnings.push(`"${key}": no reversible en 0.37.`);
    }
  });

  return warnings;
}
