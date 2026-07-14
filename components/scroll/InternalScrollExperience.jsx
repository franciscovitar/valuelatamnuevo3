'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initInternalScrollExperience, ensureInternalPageVisible } from '@/lib/scroll/internal';
import { useGsapScope } from '@/lib/scroll';

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

  useLayoutEffect(() => {
    if (!INTERNAL_ROUTES.has(pathname)) return;
    const main = document.querySelector('main');
    if (main) ensureInternalPageVisible(main);
  }, [pathname]);

  useGsapScope(() => {
    if (!INTERNAL_ROUTES.has(pathname)) return () => {};

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
  }, { dependencies: [pathname], revertOnUpdate: false });

  return null;
}
