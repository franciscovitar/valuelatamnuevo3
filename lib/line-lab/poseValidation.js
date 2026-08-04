/**
 * Dev-only validation for the K0–K8 line-lab pose sequence contract.
 */

import { CONTROL_KEYS, LINE_KEYS } from './trionnLinesEngine';

const VALUE_MIN = -0.25;
const VALUE_MAX = 1.25;
const CONVERGENCE_TOLERANCE = 0.05;

function pointsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function curvesEqual(a, b) {
  return CONTROL_KEYS.every((ck) => pointsEqual(a[ck], b[ck]));
}

function keyframesEqual(a, b) {
  return LINE_KEYS.every((lineKey) => curvesEqual(a[lineKey], b[lineKey]));
}

/** Validates the pose sequence contract. Returns a list of warning strings (empty = valid). */
export function validateKeyframes(keyframes) {
  const warnings = [];

  if (!Array.isArray(keyframes) || keyframes.length !== 9) {
    warnings.push(`Se esperaban exactamente 9 keyframes, hay ${keyframes?.length ?? 0}`);
    return warnings;
  }

  keyframes.forEach((kf, index) => {
    const label = kf.id ?? `#${index}`;
    LINE_KEYS.forEach((lineKey) => {
      const curve = kf[lineKey];
      if (!curve) {
        warnings.push(`${label}: falta la línea "${lineKey}"`);
        return;
      }
      CONTROL_KEYS.forEach((ck) => {
        const pt = curve[ck];
        if (!Array.isArray(pt) || pt.length !== 2 || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
          warnings.push(`${label}: ${lineKey}.${ck} no es un punto numérico válido`);
          return;
        }
        if (pt[0] < VALUE_MIN || pt[0] > VALUE_MAX || pt[1] < VALUE_MIN || pt[1] > VALUE_MAX) {
          warnings.push(`${label}: ${lineKey}.${ck} fuera de rango [${VALUE_MIN}, ${VALUE_MAX}]`);
        }
      });
    });
  });

  for (let i = 0; i < keyframes.length; i += 1) {
    for (let j = i + 1; j < keyframes.length; j += 1) {
      if (keyframesEqual(keyframes[i], keyframes[j])) {
        warnings.push(`Keyframes duplicados: ${keyframes[i].id} y ${keyframes[j].id}`);
      }
    }
  }

  for (let i = 1; i < keyframes.length; i += 1) {
    if (!(keyframes[i].progress > keyframes[i - 1].progress)) {
      warnings.push(`Los progresos deben ser crecientes (${keyframes[i - 1].id} → ${keyframes[i].id})`);
    }
  }

  const k1 = keyframes.find((kf) => kf.id === 'K1');
  if (k1 && !(k1.outer.p3[0] > k1.middle.p3[0] && k1.middle.p3[0] > k1.inner.p3[0])) {
    warnings.push('K1 debe cumplir outer.p3.x > middle.p3.x > inner.p3.x');
  }

  const k4 = keyframes.find((kf) => kf.id === 'K4');
  if (k4) {
    const xs = LINE_KEYS.map((lineKey) => k4[lineKey].p3[0]);
    const ys = LINE_KEYS.map((lineKey) => k4[lineKey].p3[1]);
    const spreadX = Math.max(...xs) - Math.min(...xs);
    const spreadY = Math.max(...ys) - Math.min(...ys);
    if (spreadX > CONVERGENCE_TOLERANCE || spreadY > CONVERGENCE_TOLERANCE) {
      warnings.push('K4 debe tener los tres p3 prácticamente convergentes');
    }
  }

  const k6 = keyframes.find((kf) => kf.id === 'K6');
  if (k6 && !LINE_KEYS.every((lineKey) => k6[lineKey].p0[0] > 1)) {
    warnings.push('K6 debe comenzar fuera del borde derecho (p0.x > 1)');
  }

  const k8 = keyframes.find((kf) => kf.id === 'K8');
  if (k8 && !LINE_KEYS.every((lineKey) => k8[lineKey].p3[1] > 1)) {
    warnings.push('K8 debe terminar debajo del viewport (p3.y > 1)');
  }

  return warnings;
}
