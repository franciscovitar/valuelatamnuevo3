// Structural + kinematic validation for the world-space gravity engine (dev-only warnings).
import {
  LINE_KEYS,
  MASTER_ANCHORS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  WORLD_Y,
  CAMERA_FOLLOW_SCREEN_Y,
  buildMasterPathD,
  resolveHeadWorldY,
  resolveTailWorldY,
  resolveCameraTop,
} from './trionnLinesEngine';

const ANCHOR_COUNT = 14;
const SEGMENT_COUNT = 13;
const Y_TOLERANCE = 0.000001;
const X_DIRECTION_IGNORE = 0.5;
const MIN_DIRECTION_CHANGES = 4;
const PROGRESS_STEP = 0.01;
const CENTRAL_PROGRESS_RANGE = [0.3, 0.7];
const CENTRAL_HEAD_SCREEN_MIN = 560;
const CENTRAL_HEAD_SCREEN_MAX = 700;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
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

    // 2. exactamente 14 anclas
    if (!Array.isArray(anchors) || anchors.length !== ANCHOR_COUNT) {
      warnings.push(`"${key}" debe tener ${ANCHOR_COUNT} anclas, tiene ${anchors?.length ?? 0}.`);
    } else {
      // 3. Y de anclas estrictamente creciente
      for (let i = 1; i < anchors.length; i += 1) {
        if (!(anchors[i][1] > anchors[i - 1][1])) {
          warnings.push(`"${key}": Y de anclas no es estrictamente creciente en el índice ${i}.`);
        }
      }
    }

    // 4. exactamente 13 segmentos
    if (!route || !Array.isArray(route.segments) || route.segments.length !== SEGMENT_COUNT) {
      warnings.push(`"${key}" debe tener ${SEGMENT_COUNT} segmentos, tiene ${route?.segments?.length ?? 0}.`);
    } else {
      // 5. p0.y < cp1.y < cp2.y < p3.y por segmento
      let prevY = route.start[1];
      route.segments.forEach((segment, index) => {
        const [, cp1y] = segment.cp1;
        const [, cp2y] = segment.cp2;
        const [, endY] = segment.end;
        if (!(prevY < cp1y && cp1y < cp2y && cp2y < endY)) {
          warnings.push(`"${key}" segmento ${index}: no cumple p0.y < cp1.y < cp2.y < p3.y.`);
        }
        if (![cp1y, cp2y, endY, segment.cp1[0], segment.cp2[0], segment.end[0]].every(isFiniteNumber)) {
          warnings.push(`"${key}" segmento ${index}: coordenadas no finitas.`);
        }
        prevY = endY;
      });
    }

    // 6. muestras verticalmente monótonas
    const samples = ROUTE_SAMPLES[key];
    if (!samples || samples.points.length === 0) {
      warnings.push(`"${key}" no tiene muestras precalculadas.`);
    } else {
      for (let i = 1; i < samples.points.length; i += 1) {
        if (samples.points[i][1] < samples.points[i - 1][1] - Y_TOLERANCE) {
          warnings.push(`"${key}": muestra ${i} rompe la monotonía vertical.`);
        }
      }

      // 7. al menos cuatro cambios de dirección horizontal
      const xs = samples.points.map((p) => p[0]);
      let lastSign = 0;
      let directionChanges = 0;
      for (let i = 1; i < xs.length; i += 1) {
        const diff = xs[i] - xs[i - 1];
        if (Math.abs(diff) < X_DIRECTION_IGNORE) continue;
        const sign = diff > 0 ? 1 : -1;
        if (lastSign !== 0 && sign !== lastSign) directionChanges += 1;
        lastSign = sign;
      }
      if (directionChanges < MIN_DIRECTION_CHANGES) {
        warnings.push(`"${key}": solo ${directionChanges} cambios de dirección horizontal (se esperaban ≥ ${MIN_DIRECTION_CHANGES}).`);
      }

      // 8. sale horizontalmente del viewport al menos una vez
      const exitsViewport = xs.some((x) => x < 0 || x > 1000);
      if (!exitsViewport) {
        warnings.push(`"${key}": nunca sale del rango horizontal [0, 1000].`);
      }

      // 9. toda reentrada horizontal ocurre con Y mayor (implícito por la monotonía de Y, verificado explícitamente)
      let wasOutside = false;
      let exitY = null;
      for (let i = 0; i < samples.points.length; i += 1) {
        const [x, y] = samples.points[i];
        const outside = x < 0 || x > 1000;
        if (outside) {
          wasOutside = true;
          exitY = y;
        } else if (wasOutside && exitY !== null && y < exitY) {
          warnings.push(`"${key}": reentrada horizontal con Y menor a la de salida en la muestra ${i}.`);
        }
      }
    }

    // 13. MASTER_PATH_D independiente de progress (determinismo estructural)
    if (route) {
      const a = buildMasterPathD(route);
      const b = buildMasterPathD(route);
      if (a !== b) {
        warnings.push(`"${key}": buildMasterPathD no es determinista.`);
      }
    }
  });

  // 10, 11, 12: barridos de progreso
  let prevHeadWorldY = {};
  let prevCameraTop = -Infinity;
  LINE_KEYS.forEach((key) => {
    prevHeadWorldY[key] = -Infinity;
  });

  for (let p = 0; p <= 1 + 1e-9; p += PROGRESS_STEP) {
    const progress = Math.min(p, 1);
    const cameraTop = resolveCameraTop(progress);
    if (cameraTop < prevCameraTop - 1e-9) {
      warnings.push(`cameraTop disminuyó en progress=${progress.toFixed(2)}.`);
    }
    prevCameraTop = cameraTop;

    LINE_KEYS.forEach((key) => {
      const headWorldY = resolveHeadWorldY(progress, key);
      if (headWorldY < prevHeadWorldY[key] - 1e-9) {
        warnings.push(`"${key}": headWorldY disminuyó en progress=${progress.toFixed(2)}.`);
      }
      prevHeadWorldY[key] = headWorldY;

      const tailWorldY = resolveTailWorldY(progress, headWorldY, key);
      if (tailWorldY > headWorldY + 1e-9) {
        warnings.push(`"${key}": tailWorldY supera a headWorldY en progress=${progress.toFixed(2)}.`);
      }
    });
  }

  // 14. progreso 0: headScreenY <= 50
  const cameraAtZero = resolveCameraTop(0);
  LINE_KEYS.forEach((key) => {
    const headScreenY = resolveHeadWorldY(0, key) - cameraAtZero;
    if (headScreenY > 50) {
      warnings.push(`"${key}": headScreenY en progress=0 es ${headScreenY.toFixed(1)}, se esperaba <= 50.`);
    }
  });

  // 15. fase central: headScreenY aproximadamente entre 580 y 680 (tolerancia 560-700)
  for (let p = CENTRAL_PROGRESS_RANGE[0]; p <= CENTRAL_PROGRESS_RANGE[1] + 1e-9; p += 0.05) {
    const cameraTop = resolveCameraTop(p);
    LINE_KEYS.forEach((key) => {
      const headScreenY = resolveHeadWorldY(p, key) - cameraTop;
      if (headScreenY < CENTRAL_HEAD_SCREEN_MIN || headScreenY > CENTRAL_HEAD_SCREEN_MAX) {
        warnings.push(`"${key}": headScreenY fuera de rango central en progress=${p.toFixed(2)} (${headScreenY.toFixed(1)}).`);
      }
    });
  }

  // 16. al final la línea se aleja hacia abajo (pasa la línea de seguimiento de cámara)
  const cameraAtEnd = resolveCameraTop(1);
  const headScreenYEnd = resolveHeadWorldY(1, 'outer') - cameraAtEnd;
  if (headScreenYEnd <= CAMERA_FOLLOW_SCREEN_Y) {
    warnings.push(`La punta no avanza hacia la parte inferior al finalizar (headScreenY=${headScreenYEnd.toFixed(1)}).`);
  }

  // Anclas Y compartidas estrictamente crecientes (referencia global)
  for (let i = 1; i < WORLD_Y.length; i += 1) {
    if (!(WORLD_Y[i] > WORLD_Y[i - 1])) {
      warnings.push(`WORLD_Y no es estrictamente creciente en el índice ${i}.`);
    }
  }

  return warnings;
}
