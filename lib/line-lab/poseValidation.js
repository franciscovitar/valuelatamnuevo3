import {
  LINE_KEYS,
  GESTURE_WINDOWS,
  getProfileRouteSamples,
  resolveGestureState,
  resolveLineState,
} from './trionnLinesEngine';

const PROFILES = ['desktop', 'tablet', 'mobile'];
const PROGRESS_STEP = 0.002;

export function validateRoutes() {
  const warnings = [];

  if (GESTURE_WINDOWS.length !== 4) {
    warnings.push('Expected four semantic route ranges.');
  }

  PROFILES.forEach((profileKey) => {
    LINE_KEYS.forEach((lineKey) => {
      const samples = getProfileRouteSamples(
        profileKey,
        lineKey
      );

      if (!samples?.points?.length) {
        warnings.push(
          `${profileKey}/${lineKey}: missing samples.`
        );
        return;
      }

      samples.points.forEach(([x, y], index) => {
        if (x < 20 || x > 980 || y < 10 || y > 990) {
          warnings.push(
            `${profileKey}/${lineKey}: sample ${index} exits viewport.`
          );
        }
      });

      for (
        let index = 1;
        index < samples.timelineProgress.length;
        index += 1
      ) {
        if (
          samples.timelineProgress[index]
          < samples.timelineProgress[index - 1]
        ) {
          warnings.push(
            `${profileKey}/${lineKey}: timeline is not monotonic.`
          );
          break;
        }
      }

      if (samples.totalLength < 1800) {
        warnings.push(
          `${profileKey}/${lineKey}: route is too short.`
        );
      }
    });
  });

  LINE_KEYS.forEach((lineKey) => {
    let previousHeadU = -1;

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

      if (stateA.headU < previousHeadU - 0.000001) {
        warnings.push(
          `${lineKey}: traveler moves backward at p=${progress.toFixed(3)}.`
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

      previousHeadU = stateA.headU;
    }
  });

  [
    0.224,
    0.225,
    0.226,
    0.469,
    0.47,
    0.471,
    0.744,
    0.745,
    0.746,
  ].forEach((progress) => {
    const state = resolveGestureState(progress);

    if (state.opacity < 0.99) {
      warnings.push(
        `Traveler fades at transition p=${progress}.`
      );
    }
  });

  return warnings;
}
