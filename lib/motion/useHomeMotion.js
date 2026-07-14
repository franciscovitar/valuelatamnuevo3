'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { METRICS_COUNT_DURATION } from './homeSections';

const zeroDisplay = (decimals) => (decimals > 0 ? (0).toFixed(decimals) : '0');

export function useCountUp(target, active, { duration = METRICS_COUNT_DURATION, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(() => zeroDisplay(decimals));

  useEffect(() => {
    if (!active) return undefined;

    const numericTarget = Number(target) || 0;
    let frameId = 0;
    let startTime = null;

    const tick = (timestamp) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = numericTarget * eased;
      setDisplay(current.toFixed(decimals));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplay(numericTarget.toFixed(decimals));
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [active, target, duration, decimals]);

  return active ? display : zeroDisplay(decimals);
}

const noopSubscribe = () => () => {};

export function useSectionMotionState(inView) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const getPhase = (reduceMotion) => {
    if (!mounted || reduceMotion || inView) return 'visible';
    return 'hidden';
  };

  return { mounted, getPhase };
}
