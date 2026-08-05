import {
  LINE_KEYS,
  GESTURE_WINDOWS,
  getProfileRouteSamples,
  resolveGestureState,
  resolveLineState,
} from './trionnLinesEngine';

const PROFILES = ['desktop', 'tablet', 'mobile'];
const PROGRESS_STEP = 0.002;

function insideViewport([x, y], margin = 0) {
  return (
    x >= -margin
    && x <= 1000 + margin
    && y >= -margin
    && y <= 1000 + margin
  );
}

export function validateRoutes() {
  const warnings = [];

  if (GESTURE_WINDOWS.length !== 4) {
    warnings.push('Expected four semantic visible moments.');
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
            `${profileKey}/${lineKey}: non-monotonic timeline.`
          );
          break;
        }
      }

      if (samples.totalLength < 3300) {
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
          `${lineKey}: traveler reverses internally at p=${progress.toFixed(3)}.`
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

  /*
   * The midpoint of every former reset must place the traveler outside.
   * This proves it exits and re-enters instead of teleporting.
   */
  [0.195, 0.455, 0.695].forEach((progress) => {
    LINE_KEYS.forEach((lineKey) => {
      const state = resolveLineState(
        progress,
        lineKey,
        { profileKey: 'desktop' }
      );

      if (insideViewport(state.headPoint, 35)) {
        warnings.push(
          `${lineKey}: connector head remains visible at p=${progress}.`
        );
      }
    });
  });

  [0.0, 0.24, 0.51, 0.73].forEach((progress) => {
    const state = resolveGestureState(progress);

    if (progress > 0 && state.opacity < 0.99) {
      warnings.push(
        `Traveler unexpectedly fades at p=${progress}.`
      );
    }
  });

  return warnings;
}
