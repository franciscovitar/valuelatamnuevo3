import { ScrollTrigger } from '../gsap';
import { refreshScrollTriggers } from '../routeScroll';
import { initAIPage } from './ai';
import { initFinancingPage } from './financing';
import { initLiquidityPage } from './liquidity';
import { initPaymentsPage } from './payments';
import { initProcessRoutePage } from './processRoute';
import { initReferralsPage } from './referrals';
import {
  createInternalScrollContext,
  ensureInternalPageVisible,
  initPageEntry,
  pushCleanup,
  refreshInternalScrollTriggers,
  setVisible,
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

  ensureInternalPageVisible(root);

  const ctx = createInternalScrollContext();
  const cleanups = [];
  const triggers = [];

  if (ctx.reduced) {
    return () => {};
  }

  initPageEntry(root, ctx);
  init(root, ctx, cleanups);
  ensureInternalPageVisible(root);

  ScrollTrigger.getAll().forEach((trigger) => {
    if (root.contains(trigger.trigger)) {
      triggers.push(trigger);
    }
  });

  refreshInternalScrollTriggers();
  refreshScrollTriggers({ hard: true });

  requestAnimationFrame(() => {
    ensureInternalPageVisible(root);
  });

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);
  pushCleanup(cleanups, () => window.removeEventListener('resize', onResize));

  return () => {
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
