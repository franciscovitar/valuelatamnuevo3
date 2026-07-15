'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/scroll/gsap';
import { prepareRouteExit, finalizeRouteEnter } from '@/lib/scroll/routeScroll';
import { pauseLenis, resumeLenis } from '@/lib/scroll/lenis';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const RouteReadyContext = createContext(true);

export function useRouteReady() {
  return useContext(RouteReadyContext);
}

const TIMING = {
  cover: 0.26,
  reveal: 0.38,
};

export default function PageTransitionProvider({ children }) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  const isFirstRoute = useRef(true);
  const timelineRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const lineRef = useRef(null);
  const [readyPathname, setReadyPathname] = useState(pathname);
  const routeReady = readyPathname === pathname;

  useLayoutEffect(() => {
    pathnameRef.current = pathname;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return undefined;
    }

    const transitionPathname = pathname;
    const root = document.documentElement;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const line = lineRef.current;

    pauseLenis();
    root.classList.add('lenis-stopped', 'vl-route-transition');

    const finish = () => {
      if (transitionPathname !== pathnameRef.current) return;

      timelineRef.current = null;
      root.classList.remove('vl-route-transition', 'vl-route-reveal');
      gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' });
      finalizeRouteEnter();
      resumeLenis();
      root.classList.remove('lenis-stopped');
      setReadyPathname(transitionPathname);
    };

    if (prefersReducedMotion() || !overlay || !panel || !line) {
      prepareRouteExit({ resetScroll: true });
      finish();
      return undefined;
    }

    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'all' });
    gsap.set(panel, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(line, { x: '-100vw', opacity: 1 });

    timelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: finish,
    });

    tl.to(panel, { scaleX: 1, duration: TIMING.cover, ease: 'power3.inOut' }, 0);
    tl.to(line, { x: '100vw', duration: TIMING.cover, ease: 'power2.out' }, 0);

    tl.add(() => {
      prepareRouteExit({ resetScroll: true });
      root.classList.add('vl-route-reveal');
    }, TIMING.cover);

    tl.set(panel, { transformOrigin: 'right center' }, TIMING.cover);
    tl.to(panel, { scaleX: 0, duration: TIMING.reveal, ease: 'power3.inOut' }, TIMING.cover);
    tl.to(
      line,
      { x: '200vw', opacity: 0, duration: TIMING.reveal * 0.75, ease: 'power2.in' },
      TIMING.cover,
    );

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <RouteReadyContext.Provider value={routeReady}>
      {children}
      <div ref={overlayRef} className="vl-route-overlay" aria-hidden="true">
        <div ref={panelRef} className="vl-route-overlay__panel" />
        <div ref={lineRef} className="vl-route-overlay__line" />
      </div>
    </RouteReadyContext.Provider>
  );
}
