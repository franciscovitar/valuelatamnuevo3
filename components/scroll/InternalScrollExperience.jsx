'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  initInternalScrollExperience,
  stashInternalIntroBeforePaint,
} from '@/lib/scroll/internal';
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

  useLayoutEffect(() => {
    if (!INTERNAL_ROUTES.has(pathname) || !routeReady) return;
    const main = document.querySelector('main');
    if (main) stashInternalIntroBeforePaint(main);
  }, [pathname, routeReady]);

  useGsapScope(() => {
    if (!INTERNAL_ROUTES.has(pathname) || !routeReady) return () => {};

    const main = document.querySelector('main');
    if (!main) return () => {};

    const cleanup = initInternalScrollExperience(main, pathname);
    return () => cleanup?.();
  }, { dependencies: [pathname, routeReady], revertOnUpdate: false });

  return null;
}
