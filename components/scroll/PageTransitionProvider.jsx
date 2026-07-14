'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { prepareRouteExit, finalizeRouteEnter } from '@/lib/scroll/routeScroll';
import { resumeLenis } from '@/lib/scroll/lenis';

export default function PageTransitionProvider({ children }) {
  const pathname = usePathname();
  const isFirstRoute = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    prepareRouteExit({ resetScroll: true });

    requestAnimationFrame(() => {
      finalizeRouteEnter();
      resumeLenis();
      document.documentElement.classList.remove('lenis-stopped');
    });
  }, [pathname]);

  return children;
}
