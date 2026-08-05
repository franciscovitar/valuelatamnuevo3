import {
  LINE_KEYS,
  GESTURE_WINDOWS,
  getGestureRouteSamples,
  resolveGestureState,
  resolveLineState,
} from './trionnLinesEngine';

const PROFILES = ['desktop', 'tablet', 'mobile'];
const PROGRESS_STEP = 0.002;

export function validateRoutes() {
  const warnings = [];

  if (GESTURE_WINDOWS.length !== 4) {
    warnings.push('Expected four gesture windows.');
  }

  PROFILES.forEach((profileKey) => {
    GESTURE_WINDOWS.forEach((window, gestureIndex) => {
      LINE_KEYS.forEach((lineKey) => {
        const samples = getGestureRouteSamples(
          profileKey,
          gestureIndex,
          lineKey
        );

        if (!samples?.points?.length) {
          warnings.push(
            `${profileKey}/${gestureIndex}/${lineKey}: missing samples.`
          );
          return;
        }

        samples.points.forEach(([x, y], index) => {
          if (x < 20 || x > 980 || y < 10 || y > 990) {
            warnings.push(
              `${profileKey}/${gestureIndex}/${lineKey}: sample ${index} exits viewport.`
            );
          }
        });

        if (samples.totalLength < 260) {
          warnings.push(
            `${profileKey}/${gestureIndex}/${lineKey}: gesture is too short.`
          );
        }
      });

      const before = resolveGestureState(
        Math.max(0, window.start - 0.002)
      );
      const inside = resolveGestureState(
        (window.start + window.end) / 2
      );
      const after = resolveGestureState(
        Math.min(0.96, window.end + 0.002)
      );

      if (inside.opacity <= 0.8) {
        warnings.push(
          `Gesture ${gestureIndex}: midpoint opacity is too low.`
        );
      }

      if (
        window.start > 0
        && before.gestureIndex === gestureIndex
        && before.opacity > 0.001
      ) {
        warnings.push(
          `Gesture ${gestureIndex}: visible before start.`
        );
      }

      if (
        window.end < 0.96
        && after.gestureIndex === gestureIndex
        && after.opacity > 0.001
      ) {
        warnings.push(
          `Gesture ${gestureIndex}: visible after end.`
        );
      }
    });
  });

  LINE_KEYS.forEach((lineKey) => {
    for (
      let progress = 0;
      progress <= 0.96 + 0.000001;
      progress += PROGRESS_STEP
    ) {
      const stateA = resolveLineState(
        progress,
        lineKey,
        { profileKey: 'desktop' }
      );
      const stateB = resolveLineState(
        progress,
        lineKey,
        { profileKey: 'desktop' }
      );

      if (
        stateA.headU !== stateB.headU
        || stateA.tailU !== stateB.tailU
        || stateA.activeStartU !== stateB.activeStartU
        || stateA.trailD !== stateB.trailD
      ) {
        warnings.push(
          `${lineKey}: non-deterministic at p=${progress.toFixed(3)}.`
        );
        break;
      }

      if (
        stateA.tailU > stateA.activeStartU
        || stateA.activeStartU > stateA.headU
      ) {
        warnings.push(
          `${lineKey}: invalid trail ordering at p=${progress.toFixed(3)}.`
        );
        break;
      }
    }
  });

  return warnings;
}
