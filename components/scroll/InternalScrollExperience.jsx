'use client';

import { usePathname } from 'next/navigation';
import { initInternalScrollExperience } from '@/lib/scroll/internal';
import { useGsapScope } from '@/lib/scroll';
import { useRouteReady } from './PageTransitionProvider';

const INTERNAL_ROUTES = new Set([
  '/financiamiento',
  '/liquidez',
  '/medios-de-pago',
  '/procesos-ia',
  '/como-trabajamos',
  '/referenciadores',
]);

export default function InternalScrollExperience() {
  const pathname = usePathname();
  const routeReady = useRouteReady();

  useGsapScope(() => {
    if (!INTERNAL_ROUTES.has(pathname) || !routeReady) return () => {};

    let cleanup;
    let frame = 0;

    frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const main = document.querySelector('main');
        if (!main) return;
        cleanup = initInternalScrollExperience(main, pathname);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, { dependencies: [pathname, routeReady], revertOnUpdate: false });

  return null;
}
