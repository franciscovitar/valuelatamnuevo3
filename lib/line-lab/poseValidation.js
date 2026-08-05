import {
  LINE_KEYS,
  ACTIVE_WORLD_HEIGHT,
  MASTER_ANCHORS,
  MASTER_ROUTES,
  ROUTE_SAMPLES,
  MASTER_PATH_D,
  CONVERGENCE_BEATS,
  INTERVAL_DANCE,
  SAFE_X_MIN,
  SAFE_X_MAX,
  buildMasterPathD,
  resolveCameraTop,
  resolveLineState,
} from './trionnLinesEngine';

const EXPECTED_ANCHOR_COUNT = 5;
const EXPECTED_GESTURE_COUNT = 4;
const Y_TOLERANCE = 0.000001;
const X_TOLERANCE = 0.000001;
const PROGRESS_STEP = 0.004;

function inSafeX(x) {
  return (
    x >= SAFE_X_MIN - X_TOLERANCE
    && x <= SAFE_X_MAX + X_TOLERANCE
  );
}

function countDirectionChanges() {
  let previousX = null;
  let previousSign = 0;
  let changes = 0;

  for (
    let progress = 0;
    progress <= 0.96 + 0.000001;
    progress += 0.004
  ) {
    const x = resolveLineState(
      progress,
      'middle',
      { profileKey: 'desktop' }
    ).headPoint[0];

    if (previousX === null) {
      previousX = x;
      continue;
    }

    const dx = x - previousX;
    previousX = x;

    if (Math.abs(dx) < 0.04) continue;

    const sign = dx > 0 ? 1 : -1;

    if (previousSign && sign !== previousSign) {
      changes += 1;
    }

    previousSign = sign;
  }

  return changes;
}

export function validateRoutes(routes = MASTER_ROUTES) {
  const warnings = [];

  if (INTERVAL_DANCE.length !== EXPECTED_GESTURE_COUNT) {
    warnings.push(
      `Expected ${EXPECTED_GESTURE_COUNT} large gestures.`
    );
  }

  LINE_KEYS.forEach((lineKey) => {
    const anchors = MASTER_ANCHORS[lineKey];
    const route = routes[lineKey];
    const samples = ROUTE_SAMPLES[lineKey];

    if (
      !Array.isArray(anchors)
      || anchors.length !== EXPECTED_ANCHOR_COUNT
    ) {
      warnings.push(
        `"${lineKey}": expected ${EXPECTED_ANCHOR_COUNT} anchors.`
      );
    }

    if (!samples?.points?.length) {
      warnings.push(`"${lineKey}": missing samples.`);
      return;
    }

    samples.points.forEach(([x], index) => {
      if (!inSafeX(x)) {
        warnings.push(
          `"${lineKey}": sample ${index} exits SAFE_X.`
        );
      }
    });

    for (
      let index = 1;
      index < samples.points.length;
      index += 1
    ) {
      if (
        samples.points[index][1]
        < samples.points[index - 1][1] - Y_TOLERANCE
      ) {
        warnings.push(
          `"${lineKey}": sample ${index} breaks Y monotonicity.`
        );
        break;
      }
    }

    const pathA = buildMasterPathD(route);
    const pathB = buildMasterPathD(route);

    if (
      !pathA
      || pathA !== pathB
      || pathA !== MASTER_PATH_D[lineKey]
    ) {
      warnings.push(
        `"${lineKey}": master path is not deterministic.`
      );
    }
  });

  CONVERGENCE_BEATS.forEach((beat) => {
    const outer = resolveLineState(
      beat.progress,
      'outer',
      { profileKey: 'desktop' }
    ).headPoint;
    const middle = resolveLineState(
      beat.progress,
      'middle',
      { profileKey: 'desktop' }
    ).headPoint;
    const inner = resolveLineState(
      beat.progress,
      'inner',
      { profileKey: 'desktop' }
    ).headPoint;

    const spread = Math.max(
      outer[0],
      middle[0],
      inner[0]
    ) - Math.min(
      outer[0],
      middle[0],
      inner[0]
    );

    if (spread > 0.1) {
      warnings.push(
        `Convergence at p=${beat.progress} exceeds 0.1.`
      );
    }
  });

  const directionChanges = countDirectionChanges();

  if (directionChanges > 2) {
    warnings.push(
      `Center route has too many direction changes: ${directionChanges}.`
    );
  }

  const previousHead = {
    outer: Number.NEGATIVE_INFINITY,
    middle: Number.NEGATIVE_INFINITY,
    inner: Number.NEGATIVE_INFINITY,
  };

  let previousCameraTop = Number.NEGATIVE_INFINITY;

  for (
    let progress = 0;
    progress <= 1 + 0.000001;
    progress += PROGRESS_STEP
  ) {
    const p = Math.min(progress, 1);
    const cameraTop = resolveCameraTop(
      p,
      { mode: 'home', profileKey: 'desktop' }
    );

    if (cameraTop < previousCameraTop - 0.000001) {
      warnings.push(
        `cameraTop decreases at p=${p.toFixed(3)}.`
      );
    }

    previousCameraTop = cameraTop;

    const outer = resolveLineState(
      p,
      'outer',
      { profileKey: 'desktop' }
    );
    const middle = resolveLineState(
      p,
      'middle',
      { profileKey: 'desktop' }
    );
    const inner = resolveLineState(
      p,
      'inner',
      { profileKey: 'desktop' }
    );

    const spread = inner.headPoint[0] - outer.headPoint[0];
    const leftGap = middle.headPoint[0] - outer.headPoint[0];
    const rightGap = inner.headPoint[0] - middle.headPoint[0];

    if (spread < -0.000001) {
      warnings.push(
        `Lane crossing at p=${p.toFixed(3)}.`
      );
    }

    if (spread > 46) {
      warnings.push(
        `Desktop spread exceeds 46 at p=${p.toFixed(3)}.`
      );
    }

    if (Math.abs(leftGap - rightGap) > 0.4) {
      warnings.push(
        `Asymmetric normal offsets at p=${p.toFixed(3)}.`
      );
    }

    [
      ['outer', outer],
      ['middle', middle],
      ['inner', inner],
    ].forEach(([lineKey, state]) => {
      if (
        state.headU
        < previousHead[lineKey] - 0.000001
      ) {
        warnings.push(
          `"${lineKey}": headU decreases at p=${p.toFixed(3)}.`
        );
      }

      if (
        state.headWorldY - state.activeStartWorldY
        > ACTIVE_WORLD_HEIGHT + 0.000001
      ) {
        warnings.push(
          `"${lineKey}": active trail exceeds target height.`
        );
      }

      previousHead[lineKey] = state.headU;
    });
  }

  LINE_KEYS.forEach((lineKey) => {
    const atEnd = resolveLineState(
      0.96,
      lineKey,
      { profileKey: 'desktop' }
    );
    const afterEnd = resolveLineState(
      1,
      lineKey,
      { profileKey: 'desktop' }
    );
    const reverseA = resolveLineState(
      0.37,
      lineKey,
      { profileKey: 'desktop' }
    );
    const reverseB = resolveLineState(
      0.37,
      lineKey,
      { profileKey: 'desktop' }
    );

    if (
      Math.abs(atEnd.headU - 1) > 0.000001
      || Math.abs(afterEnd.headU - 1) > 0.000001
    ) {
      warnings.push(`"${lineKey}": final headU is not 1.`);
    }

    if (
      atEnd.historyTrailD !== afterEnd.historyTrailD
    ) {
      warnings.push(
        `"${lineKey}": final history changes after 0.96.`
      );
    }

    if (
      reverseA.historyTrailD !== reverseB.historyTrailD
      || reverseA.activeTrailD !== reverseB.activeTrailD
      || reverseA.headU !== reverseB.headU
      || reverseA.headPoint[0] !== reverseB.headPoint[0]
      || reverseA.headPoint[1] !== reverseB.headPoint[1]
    ) {
      warnings.push(
        `"${lineKey}": route is not reversible.`
      );
    }
  });

  return warnings;
}
