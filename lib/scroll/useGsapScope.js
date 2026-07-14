'use client';

import { useGSAP } from '@gsap/react';
import gsap, { ScrollTrigger } from './gsap';

/**
 * Hook base para animaciones GSAP con cleanup automático.
 * Futuras etapas: limitar al scope del componente y evitar solaparse con Motion.
 */
export function useGsapScope(callback, { scope, dependencies = [], revertOnUpdate = true } = {}) {
  return useGSAP(
    () => callback({ gsap, ScrollTrigger }),
    {
      scope,
      dependencies,
      revertOnUpdate,
    },
  );
}

export { useGSAP };
