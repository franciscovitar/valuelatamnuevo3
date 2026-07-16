'use client';

import { useEffect } from 'react';
import { initHeaderMotion } from './runtime/headerMotion';
import { initMicroInteractions } from './runtime/microInteractions';
import { initCoverAnimation } from './runtime/coverAnimation';
import { initLeadCapture } from './runtime/leadCapture';
import { initNavigationCards } from './runtime/navigationCards';
import { initRevealCounters } from './runtime/revealCounters';
import { initSoundToggle } from './runtime/soundToggle';

export default function ValueLatamRuntime() {
  useEffect(() => {
    document.documentElement.classList.add('js');

    const cleanups = [
      initRevealCounters(),
      initNavigationCards(),
      initHeaderMotion(),
      initMicroInteractions(),
      initLeadCapture(),
      initSoundToggle(),
      initCoverAnimation(),
    ];

    return () => {
      cleanups.forEach((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, []);

  return null;
}
