// Structural validation for the immutable-route Snake engine (dev-only warnings).
import {
  LINE_KEYS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  HEAD_TAIL_RANGE,
  CHECKPOINTS,
  buildMasterPathD,
  computeHeadU,
  computeTailU,
} from './trionnLinesEngine';

const SEGMENTS_PER_ROUTE = 7;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isFinitePoint(point) {
  return Array.isArray(point) && point.length === 2 && isFiniteNumber(point[0]) && isFiniteNumber(point[1]);
}

export function validateRoutes(routes = MASTER_ROUTES) {
  const warnings = [];

  const routeKeys = Object.keys(routes);
  if (routeKeys.length !== 3 || LINE_KEYS.some((key) => !routes[key])) {
    warnings.push(`Se esperaban exactamente 3 rutas (outer/middle/inner), se encontraron ${routeKeys.length}.`);
  }

  LINE_KEYS.forEach((key) => {
    const route = routes[key];
    if (!route) {
      warnings.push(`Falta la ruta "${key}".`);
      return;
    }

    if (!isFinitePoint(route.start)) {
      warnings.push(`"${key}".start no es un punto [x, y] finito.`);
    }

    if (!Array.isArray(route.segments) || route.segments.length !== SEGMENTS_PER_ROUTE) {
      warnings.push(`"${key}" debe tener exactamente ${SEGMENTS_PER_ROUTE} segmentos, tiene ${route.segments?.length ?? 0}.`);
    } else {
      route.segments.forEach((segment, index) => {
        if (!isFinitePoint(segment.cp1)) warnings.push(`"${key}" segmento ${index + 1}: cp1 inválido.`);
        if (!isFinitePoint(segment.cp2)) warnings.push(`"${key}" segmento ${index + 1}: cp2 inválido.`);
        if (!isFinitePoint(segment.end)) warnings.push(`"${key}" segmento ${index + 1}: end inválido.`);
      });
    }

    const samples = ROUTE_SAMPLES[key];
    if (!samples || !samples.points || samples.points.length === 0) {
      warnings.push(`"${key}" no tiene muestras precalculadas.`);
    } else if (!(samples.totalLength > 0)) {
      warnings.push(`"${key}" tiene longitud total no positiva.`);
    }

    // The master path string must be a pure function of the route's own
    // coordinates only — recomputing it must always yield the same string.
    if (route) {
      const a = buildMasterPathD(route);
      const b = buildMasterPathD(route);
      if (a !== b) {
        warnings.push(`"${key}": buildMasterPathD no es determinista (depende de algo externo a la ruta).`);
      }
    }

    const range = HEAD_TAIL_RANGE[key];
    if (!range) {
      warnings.push(`Falta HEAD_TAIL_RANGE para "${key}".`);
    } else {
      const { headStart, headEnd, tailStart, tailEnd } = range;
      [headStart, headEnd, tailStart, tailEnd].forEach((value) => {
        if (!isFiniteNumber(value) || value < 0 || value > 1) {
          warnings.push(`"${key}": HEAD_TAIL_RANGE contiene un valor fuera de [0, 1].`);
        }
      });
      if (!(headStart < headEnd)) warnings.push(`"${key}": headStart debe ser menor que headEnd.`);
      if (!(tailStart < tailEnd)) warnings.push(`"${key}": tailStart debe ser menor que tailEnd.`);

      // Sample several progress points to confirm tailU never exceeds headU
      // and both stay within [0, 1].
      for (let p = 0; p <= 1; p += 0.05) {
        const headU = computeHeadU(p, range);
        const tailU = computeTailU(p, range, headU);
        if (headU < 0 || headU > 1 || tailU < 0 || tailU > 1) {
          warnings.push(`"${key}": headU/tailU fuera de [0, 1] en progress=${p.toFixed(2)}.`);
        }
        if (tailU > headU + 1e-9) {
          warnings.push(`"${key}": tailU supera a headU en progress=${p.toFixed(2)}.`);
        }
      }
    }
  });

  if (!Array.isArray(CHECKPOINTS) || CHECKPOINTS.length === 0) {
    warnings.push('CHECKPOINTS está vacío o no es un arreglo.');
  } else {
    for (let i = 1; i < CHECKPOINTS.length; i += 1) {
      if (!(CHECKPOINTS[i].progress > CHECKPOINTS[i - 1].progress)) {
        warnings.push(`CHECKPOINTS no es estrictamente creciente en el índice ${i}.`);
      }
    }
  }

  return warnings;
}
