'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  bootstrapSmoothScroll,
  getActiveLenis,
  isSmoothScrollEnabled,
  subscribeReducedMotion,
  teardownSmoothScroll,
} from '@/lib/scroll';

const SmoothScrollContext = createContext({
  enabled: false,
  lenis: null,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export default function SmoothScrollProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const sync = () => {
      const shouldEnable = isSmoothScrollEnabled();

      if (!shouldEnable) {
        teardownSmoothScroll();
        setEnabled(false);
        setLenis(null);
        return;
      }

      const instance = bootstrapSmoothScroll();
      setEnabled(Boolean(instance));
      setLenis(instance);
    };

    sync();
    const unsubscribeReducedMotion = subscribeReducedMotion(sync);

    return () => {
      unsubscribeReducedMotion();
      teardownSmoothScroll();
    };
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      lenis: enabled ? getActiveLenis() ?? lenis : null,
    }),
    [enabled, lenis],
  );

  return (
    <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
  );
}
