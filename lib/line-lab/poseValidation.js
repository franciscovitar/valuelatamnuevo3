import { POINT_COUNT } from './trionnLinesEngine';

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function cubicAt(p0, cp1, cp2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * cp1.x + 3 * u * tt * cp2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * cp1.y + 3 * u * tt * cp2.y + ttt * p3.y,
  };
}

export function denormPoint(pt, w, h) {
  const xMin = w * -0.25;
  const xMax = w * 1.25;
  const yMin = h * -0.25;
  const yMax = h * 1.2;
  return {
    x: clamp(pt[0] * w, xMin, xMax),
    y: clamp(pt[1] * h, yMin, yMax),
  };
}

export function resolvePxCurve(normCurve, w, h) {
  return {
    p0: denormPoint(normCurve.p0, w, h),
    cp1: denormPoint(normCurve.cp1, w, h),
    cp2: denormPoint(normCurve.cp2, w, h),
    p3: denormPoint(normCurve.p3, w, h),
  };
}

export function samplePxCurve(pxCurve, count = POINT_COUNT) {
  const samples = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    samples.push(cubicAt(pxCurve.p0, pxCurve.cp1, pxCurve.cp2, pxCurve.p3, t));
  }
  return samples;
}

export function measureBezierCurvature(normCurve, w, h) {
  const px = resolvePxCurve(normCurve, w, h);
  const mid = cubicAt(px.p0, px.cp1, px.cp2, px.p3, 0.5);
  const chordMid = {
    x: (px.p0.x + px.p3.x) * 0.5,
    y: (px.p0.y + px.p3.y) * 0.5,
  };
  return Math.hypot(mid.x - chordMid.x, mid.y - chordMid.y);
}

export function validatePoseCurvature(pose, w, h) {
  const minDim = Math.min(w, h);
  const minArc = minDim * 0.07;
  const warnings = [];
  const keys = ['left', 'center', 'right'];
  const arcs = keys.map((key) => measureBezierCurvature(pose[key], w, h));
  const straightCount = arcs.filter((a) => a < minArc).length;

  keys.forEach((key, i) => {
    if (arcs[i] < minArc) {
      warnings.push(`${key}: curvatura baja (${Math.round(arcs[i])}px < ${Math.round(minArc)}px)`);
    }
  });

  if (straightCount >= 2) {
    warnings.push('Dos o más líneas casi rectas en la misma pose');
  }

  return warnings;
}

function segmentsIntersect(a1, a2, b1, b2) {
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = cross(a1, a2, b1);
  const d2 = cross(a1, a2, b2);
  const d3 = cross(b1, b2, a1);
  const d4 = cross(b1, b2, a2);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

export function detectLineCrossings(samplesA, samplesB, step = 4) {
  for (let i = 0; i < samplesA.length - step; i += step) {
    for (let j = 0; j < samplesB.length - step; j += step) {
      if (segmentsIntersect(samplesA[i], samplesA[i + step], samplesB[j], samplesB[j + step])) {
        return true;
      }
    }
  }
  return false;
}

export function validateGeometryCrossings(geometry, w, h) {
  const keys = ['left', 'center', 'right'];
  const samples = keys.map((key) => samplePxCurve(resolvePxCurve(geometry[key], w, h)));
  const warnings = [];

  if (detectLineCrossings(samples[0], samples[1])) {
    warnings.push('Cruce detectado: left ↔ center');
  }
  if (detectLineCrossings(samples[1], samples[2])) {
    warnings.push('Cruce detectado: center ↔ right');
  }
  if (detectLineCrossings(samples[0], samples[2])) {
    warnings.push('Cruce detectado: left ↔ right');
  }

  const headDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const heads = samples.map((s) => s[s.length - 1]);
  for (let i = 0; i < heads.length; i += 1) {
    for (let j = i + 1; j < heads.length; j += 1) {
      const d = headDist(heads[i], heads[j]);
      if (d < 20) {
        warnings.push(`Heads muy juntos (${Math.round(d)}px)`);
      }
    }
  }

  return warnings;
}
