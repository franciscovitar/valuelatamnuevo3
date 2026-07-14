'use client';

import { usePathname } from 'next/navigation';
import { initHomeScrollExperience } from '@/lib/scroll/home';
import { useGsapScope } from '@/lib/scroll';
import { useRouteReady } from './PageTransitionProvider';

export default function HomeScrollExperience() {
  const pathname = usePathname();
  const routeReady = useRouteReady();

  useGsapScope(() => {
    if (pathname !== '/' || !routeReady) return () => {};

    let cleanup;
    let frame = 0;

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const main = document.querySelector('main');
        if (!main) return;
        cleanup = initHomeScrollExperience(main);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, { dependencies: [pathname, routeReady], revertOnUpdate: false });

  return null;
}
