import { ScrollTrigger } from '../gsap';
import { refreshLenis } from '../lenis';
import { initAIPage } from './ai';
import { initFinancingPage } from './financing';
import { initLiquidityPage } from './liquidity';
import { initPaymentsPage } from './payments';
import { initProcessRoutePage } from './processRoute';
import { initReferralsPage } from './referrals';
import {
  bindLateImageRefresh,
  createInternalScrollContext,
  ensureInternalPageVisible,
  initPageEntry,
  prepInternalAboveFold,
  pushCleanup,
  refreshInternalScrollTriggers,
  waitForPageImages,
} from './utils';

const ROUTE_INIT = {
  '/financiamiento': initFinancingPage,
  '/liquidez': initLiquidityPage,
  '/medios-de-pago': initPaymentsPage,
  '/procesos-ia': initAIPage,
  '/como-trabajamos': initProcessRoutePage,
  '/referenciadores': initReferralsPage,
};

export function initInternalScrollExperience(root, pathname) {
  if (!root) return () => {};

  const init = ROUTE_INIT[pathname];
  if (!init) return () => {};

  const ctx = createInternalScrollContext();
  const cleanups = [];
  const triggers = [];
  let disposed = false;

  if (ctx.reduced) {
    ensureInternalPageVisible(root);
    return () => {};
  }

  prepInternalAboveFold(root);

  const boot = async () => {
    await waitForPageImages(root);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    if (disposed) return;

    initPageEntry(root, ctx);
    init(root, ctx, cleanups);
    bindLateImageRefresh(root, cleanups);

    requestAnimationFrame(() => {
      if (disposed) return;

      ScrollTrigger.getAll().forEach((trigger) => {
        if (root.contains(trigger.trigger) && !triggers.includes(trigger)) {
          triggers.push(trigger);
        }
      });

      refreshInternalScrollTriggers({ hard: false });
      refreshLenis();
    });
  };

  boot();

  const onResize = () => ScrollTrigger.refresh(false);
  window.addEventListener('resize', onResize);
  pushCleanup(cleanups, () => window.removeEventListener('resize', onResize));

  return () => {
    disposed = true;
    triggers.forEach((trigger) => {
      try {
        trigger.kill();
      } catch {
        /* noop */
      }
    });
    cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch {
        /* noop */
      }
    });
  };
}

export { scrollPalette } from '../home/palette';
export { ensureInternalPageVisible } from './utils';
