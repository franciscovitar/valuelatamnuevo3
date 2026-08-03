import { gsap } from '../gsap';
import { pushCleanup } from './utils';

const LINE_PROGRESS = {
  1: { start: 0, end: 0.55 },
  2: { start: 0.12, end: 0.78 },
  3: { start: 0.4, end: 1 },
  4: { start: 0.25, end: 0.92 },
};

const TABLET_QUERY = '(max-width: 1024px)';
const MOBILE_QUERY = '(max-width: 760px)';

function visibleLineNodes(svg) {
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  const tablet = window.matchMedia(TABLET_QUERY).matches;

  return gsap.utils.toArray(svg.querySelectorAll('[data-vl-bg-line]')).filter((path) => {
    const id = path.getAttribute('data-vl-bg-line');
    if (mobile && (id === '3' || id === '4')) return false;
    if (tablet && !mobile && id === '4') return false;
    return true;
  });
}

function preparePath(path) {
  const length = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });
  return length;
}

function showStaticFaint(svg, paths) {
  paths.forEach((path) => {
    const length = preparePath(path);
    gsap.set(path, { strokeDashoffset: length * 0.35 });
  });
  svg.classList.add('is-ready', 'is-reduced');
}

/**
 * Líneas SVG fijas animadas por progreso total del documento (home).
 * scrub 1 — se retraen al subir el scroll.
 */
export function initBackgroundLines(ctx, cleanups) {
  const svg = document.getElementById('vl-bg-lines');
  if (!svg) return;

  const group = svg.querySelector('.vl-bg-lines__draw');
  let paths = visibleLineNodes(svg);

  if (!paths.length) {
    svg.classList.add('is-ready');
    return;
  }

  paths.forEach(preparePath);

  if (ctx?.reduced) {
    showStaticFaint(svg, paths);
    pushCleanup(cleanups, () => {
      svg.classList.remove('is-ready', 'is-reduced');
      gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' });
    });
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        paths = visibleLineNodes(svg);
        paths.forEach(preparePath);
      },
    },
  });

  paths.forEach((path) => {
    const id = path.getAttribute('data-vl-bg-line');
    const range = LINE_PROGRESS[id] || { start: 0, end: 1 };
    const duration = Math.max(0.01, range.end - range.start);

    tl.fromTo(
      path,
      {
        strokeDashoffset: () => path.getTotalLength(),
      },
      {
        strokeDashoffset: 0,
        duration,
      },
      range.start,
    );
  });

  if (group && !ctx?.mobile) {
    tl.fromTo(group, { y: 6 }, { y: -8, duration: 1, ease: 'none' }, 0);
  }

  svg.classList.add('is-ready');

  const st = tl.scrollTrigger;
  pushCleanup(cleanups, () => {
    st?.kill();
    tl.kill();
    gsap.set([group, ...paths].filter(Boolean), {
      clearProps: 'strokeDasharray,strokeDashoffset,transform,y',
    });
    svg.classList.remove('is-ready', 'is-reduced');
  });
}
