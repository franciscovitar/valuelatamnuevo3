import {
  LINE_KEYS,
  MASTER_ANCHORS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  MASTER_PATH_D,
  SAFE_X_MIN,
  SAFE_X_MAX,
  WORLD_Y,
  buildMasterPathD,
  resolveHeadWorldY,
  resolveCameraTop,
  resolveLineState,
} from './trionnLinesEngine';

const ANCHOR_COUNT = 14;
const SEGMENT_COUNT = 13;
const Y_TOLERANCE = 0.000001;
const X_TOLERANCE = 0.000001;
const PROGRESS_STEP = 0.01;

const TAIL_FIXED_PROGRESS = [0, 0.1, 0.25, 0.5, 0.75, 0.96, 1];

function inSafeX(x) {
  return x >= SAFE_X_MIN - X_TOLERANCE && x <= SAFE_X_MAX + X_TOLERANCE;
}

function samePoint(a, b, tolerance = 0.000001) {
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
}

export function validateRoutes(routes = MASTER_ROUTES) {
  const warnings = [];

  const routeKeys = Object.keys(routes);
  if (routeKeys.length !== 3 || LINE_KEYS.some((key) => !routes[key])) {
    warnings.push(`Se esperaban exactamente 3 rutas, se encontraron ${routeKeys.length}.`);
  }

  LINE_KEYS.forEach((key) => {
    const anchors = MASTER_ANCHORS[key];
    const route = routes[key];
    const samples = ROUTE_SAMPLES[key];

    if (!Array.isArray(anchors) || anchors.length !== ANCHOR_COUNT) {
      warnings.push(`"${key}" debe tener ${ANCHOR_COUNT} anclas, tiene ${anchors?.length ?? 0}.`);
    } else {
      for (let i = 1; i < anchors.length; i += 1) {
        if (!(anchors[i][1] > anchors[i - 1][1])) {
          warnings.push(`"${key}": Y de anclas no es estrictamente creciente en el índice ${i}.`);
        }
      }
      anchors.forEach((anchor, index) => {
        if (!inSafeX(anchor[0])) {
          warnings.push(`"${key}": ancla ${index} fuera de SAFE_X (x=${anchor[0]}).`);
        }
      });
    }

    if (!route || !Array.isArray(route.segments) || route.segments.length !== SEGMENT_COUNT) {
      warnings.push(`"${key}" debe tener ${SEGMENT_COUNT} segmentos, tiene ${route?.segments?.length ?? 0}.`);
    } else {
      let prevY = route.start[1];
      if (!inSafeX(route.start[0])) {
        warnings.push(`"${key}": start fuera de SAFE_X (x=${route.start[0]}).`);
      }
      route.segments.forEach((segment, index) => {
        const [, cp1y] = segment.cp1;
        const [, cp2y] = segment.cp2;
        const [, endY] = segment.end;
        if (!(prevY < cp1y && cp1y < cp2y && cp2y < endY)) {
          warnings.push(`"${key}" segmento ${index}: no cumple p0.y < cp1.y < cp2.y < p3.y.`);
        }
        if (!inSafeX(segment.cp1[0]) || !inSafeX(segment.cp2[0]) || !inSafeX(segment.end[0])) {
          warnings.push(`"${key}" segmento ${index}: control/end fuera de SAFE_X.`);
        }
        prevY = endY;
      });
    }

    if (!samples || !samples.points.length) {
      warnings.push(`"${key}": faltan muestras de ruta.`);
    } else {
      for (let i = 1; i < samples.points.length; i += 1) {
        if (samples.points[i][1] < samples.points[i - 1][1] - Y_TOLERANCE) {
          warnings.push(`"${key}": muestra ${i} rompe monotonía Y.`);
        }
      }
      samples.points.forEach((point, index) => {
        if (!inSafeX(point[0])) {
          warnings.push(`"${key}": muestra ${index} fuera de SAFE_X (x=${point[0]}).`);
        }
      });
    }

    const deterministicA = buildMasterPathD(route);
    const deterministicB = buildMasterPathD(route);
    if (deterministicA !== deterministicB || deterministicA !== MASTER_PATH_D[key]) {
      warnings.push(`"${key}": MASTER_PATH_D no es determinista o cambió respecto al cache.`);
    }
  });

  for (let i = 1; i < WORLD_Y.length; i += 1) {
    if (!(WORLD_Y[i] > WORLD_Y[i - 1])) {
      warnings.push(`WORLD_Y no es estrictamente creciente en índice ${i}.`);
    }
  }

  let prevCameraTop = -Infinity;
  const prevHeadU = { outer: -Infinity, middle: -Infinity, inner: -Infinity };
  const prevTrailPointCount = { outer: -Infinity, middle: -Infinity, inner: -Infinity };

  for (let p = 0; p <= 1 + 1e-9; p += PROGRESS_STEP) {
    const progress = Math.min(p, 1);
    const cameraTop = resolveCameraTop(progress);
    if (cameraTop < prevCameraTop - 1e-9) {
      warnings.push(`cameraTop disminuyó en progress=${progress.toFixed(2)}.`);
    }
    prevCameraTop = cameraTop;

    LINE_KEYS.forEach((key) => {
      const state = resolveLineState(progress, key);
      if (state.headU < prevHeadU[key] - 1e-9) {
        warnings.push(`"${key}": headU disminuyó en progress=${progress.toFixed(2)}.`);
      }
      if (state.trailPointCount < prevTrailPointCount[key]) {
        warnings.push(`"${key}": trailPointCount disminuyó en progress=${progress.toFixed(2)}.`);
      }
      prevHeadU[key] = state.headU;
      prevTrailPointCount[key] = state.trailPointCount;
    });
  }

  TAIL_FIXED_PROGRESS.forEach((progress) => {
    LINE_KEYS.forEach((key) => {
      const state = resolveLineState(progress, key);
      if (state.tailU !== 0) {
        warnings.push(`"${key}": tailU debe ser 0 en progress=${progress}, obtuvo ${state.tailU}.`);
      }
    });
  });

  const finalAProgress = 0.96;
  const finalBProgress = 1;
  const cameraA = resolveCameraTop(finalAProgress);
  const cameraB = resolveCameraTop(finalBProgress);
  if (Math.abs(cameraA - cameraB) > 0.000001) {
    warnings.push('cameraTop difiere entre progress 0.96 y 1.');
  }

  LINE_KEYS.forEach((key) => {
    const a = resolveLineState(finalAProgress, key);
    const b = resolveLineState(finalBProgress, key);

    if (Math.abs(a.headU - 1) > 0.000001 || Math.abs(b.headU - 1) > 0.000001) {
      warnings.push(`"${key}": headU debe ser 1 en progress 0.96 y 1.`);
    }
    if (a.tailU !== 0 || b.tailU !== 0) {
      warnings.push(`"${key}": tailU debe ser 0 en progress 0.96 y 1.`);
    }
    if (a.trailD !== b.trailD || !a.trailD.trim()) {
      warnings.push(`"${key}": trailD final no persistente o vacío.`);
    }
    if (!samePoint(a.headPoint, b.headPoint)) {
      warnings.push(`"${key}": headPoint difiere entre 0.96 y 1.`);
    }
    if (a.trailPointCount !== b.trailPointCount) {
      warnings.push(`"${key}": trailPointCount difiere entre 0.96 y 1.`);
    }
    if (!inSafeX(a.headPoint[0]) || !inSafeX(b.headPoint[0])) {
      warnings.push(`"${key}": headPoint final fuera de SAFE_X.`);
    }
  });

  LINE_KEYS.forEach((key) => {
    const state1 = resolveLineState(0.6, key);
    const state2 = resolveLineState(0.6, key);
    if (state1.trailD !== state2.trailD || state1.headU !== state2.headU || state1.tailU !== state2.tailU) {
      warnings.push(`"${key}": geometría no determinista al re-resolver (float no debería influir).`);
    }
  });

  return warnings;
}
