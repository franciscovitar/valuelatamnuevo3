import { ScrollTrigger } from '../gsap';
import { pushCleanup } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TABLET_QUERY = '(max-width: 1024px)';
const MOBILE_QUERY = '(max-width: 760px)';
const FRAME_MS = 33;

const LINE_KEYS = ['primary', 'secondary', 'brass'];
const MOBILE_LINE_KEYS = ['primary', 'secondary'];

const LINE_STAGGER = {
  primary: 0,
  secondary: 0.02,
  brass: 0.035,
};

const LINE_PHASES = {
  primary: 0,
  secondary: 2400,
  brass: 5100,
};

const LINE_SPEED = {
  primary: 1,
  secondary: 0.92,
  brass: 1.08,
};

/** Escenas locales — cada una es un haz independiente de curvas Bézier */
const LINE_SCENES = [
  {
    id: 'metrics-partners',
    selector: '[data-vl-home-section="metrics"]',
    yRatio: 0.72,
    heightVh: 90,
    origin: { x: 0.12, y: 0.78 },
    destination: { x: 0.68, y: 0.12 },
    bend: 'right',
    scrub: 0.9,
  },
  {
    id: 'solutions',
    selector: '[data-vl-home-section="solutions"]',
    yRatio: 0.64,
    heightVh: 105,
    origin: { x: 0.88, y: 0.76 },
    destination: { x: 0.35, y: 0.08 },
    bend: 'left',
    scrub: 1,
  },
  {
    id: 'why-process',
    selector: '[data-vl-home-section="why-us"]',
    yRatio: 0.7,
    heightVh: 110,
    origin: { x: 0.16, y: 0.82 },
    destination: { x: 0.72, y: 0.1 },
    bend: 'right',
    scrub: 0.95,
  },
  {
    id: 'regulation-team',
    selector: '[data-vl-home-section="regulation"]',
    yRatio: 0.72,
    heightVh: 100,
    origin: { x: 0.84, y: 0.8 },
    destination: { x: 0.3, y: 0.1 },
    bend: 'left',
    scrub: 1.05,
  },
  {
    id: 'referrals-contact',
    selector: '[data-vl-home-section="referrals"]',
    yRatio: 0.68,
    heightVh: 95,
    origin: { x: 0.18, y: 0.78 },
    destination: { x: 0.7, y: 0.12 },
    bend: 'right',
    scrub: 0.85,
  },
  {
    id: 'contact',
    selector: '[data-vl-home-section="contact"]',
    yRatio: 0.55,
    heightVh: 88,
    origin: { x: 0.82, y: 0.74 },
    destination: { x: 0.34, y: 0.1 },
    bend: 'left',
    scrub: 1.1,
  },
];

const MOBILE_SCENE_IDS = new Set([
  'metrics-partners',
  'solutions',
  'why-process',
  'referrals-contact',
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getViewportMode() {
  return {
    mobile: window.matchMedia(MOBILE_QUERY).matches,
    tablet: window.matchMedia(TABLET_QUERY).matches,
  };
}

function getFloatConfig(mobile, tablet) {
  if (mobile) {
    return { cpAmpX: 8, cpAmpY: 5.5, endAmp: 4, groupAmp: 5 };
  }
  if (tablet) {
    return { cpAmpX: 14, cpAmpY: 9, endAmp: 5, groupAmp: 6 };
  }
  return { cpAmpX: 22, cpAmpY: 14, endAmp: 6.5, groupAmp: 7.5 };
}

function sceneOpacity(progress) {
  const fadeIn = clamp(progress / 0.14, 0, 1);
  const fadeOut = progress > 0.84 ? clamp(1 - (progress - 0.84) / 0.16, 0, 1) : 1;
  return fadeIn * fadeOut;
}

function drawProgressFromScroll(progress, stagger) {
  const core = clamp((progress - 0.05) / 0.7, 0, 1);
  return clamp(core - stagger, 0, 1);
}

function buildBaseGeometry(scene, width, sceneHeight, lineKey) {
  const ox = scene.origin.x * width;
  const oy = scene.origin.y * sceneHeight;
  const dx = scene.destination.x * width;
  const dy = scene.destination.y * sceneHeight;
  const bendSign = scene.bend === 'right' ? 1 : -1;

  const bulge1 = width * 0.26 * bendSign;
  const bulge2 = width * 0.22 * bendSign;

  let cp1x = ox + (dx - ox) * 0.2 + bulge1;
  let cp1y = oy + (dy - oy) * 0.34;
  let cp2x = ox + (dx - ox) * 0.78 + bulge2;
  let cp2y = oy + (dy - oy) * 0.7;

  if (lineKey === 'secondary') {
    cp1x -= bendSign * 48;
    cp1y -= 16;
    cp2x -= bendSign * 64;
    cp2y -= 10;
  } else if (lineKey === 'brass') {
    cp1x += bendSign * 52;
    cp1y += 18;
    cp2x += bendSign * 70;
    cp2y += 12;
  }

  return {
    origin: { x: ox, y: oy },
    cp1: { x: cp1x, y: cp1y },
    cp2: { x: cp2x, y: cp2y },
    dest: { x: dx, y: dy },
  };
}

function applyFloat(base, time, floatConfig, lineKey) {
  const phase = LINE_PHASES[lineKey] || 0;
  const speed = LINE_SPEED[lineKey] || 1;
  const t = (time + phase) * speed;
  const { cpAmpX, cpAmpY, endAmp, groupAmp } = floatConfig;

  const groupX = Math.sin(t * 0.00039) * groupAmp * 0.35;
  const groupY = Math.cos(t * 0.00033) * groupAmp * 0.28;

  const deform = (pt, ampX, ampY, pOffset) => ({
    x: pt.x + groupX + Math.sin(t * 0.00041 + pOffset) * ampX,
    y: pt.y + groupY + Math.cos(t * 0.00037 + pOffset * 1.15) * ampY,
  });

  return {
    origin: deform(base.origin, endAmp * 0.55, endAmp * 0.45, 0.4),
    cp1: deform(base.cp1, cpAmpX, cpAmpY, 0.9),
    cp2: deform(base.cp2, cpAmpX * 0.92, cpAmpY * 0.88, 1.7),
    dest: deform(base.dest, endAmp * 0.5, endAmp * 0.42, 2.3),
  };
}

function buildPathD(geom) {
  const { origin, cp1, cp2, dest } = geom;
  return `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${dest.x.toFixed(1)} ${dest.y.toFixed(1)}`;
}

function createSvgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
}

function createSceneGroup(sceneId) {
  const group = createSvgEl('g', {
    'data-vl-line-scene': sceneId,
    class: 'vl-bg-line-scene',
  });

  const paths = {};
  const tips = {};

  LINE_KEYS.forEach((lineKey) => {
    paths[lineKey] = createSvgEl('path', {
      class: `vl-bg-lines__path vl-bg-lines__path--${lineKey}`,
      'data-vl-bg-line': lineKey,
      fill: 'none',
    });
    tips[lineKey] = createSvgEl('circle', {
      class: `vl-bg-lines__tip vl-bg-lines__tip--${lineKey}`,
      'data-vl-bg-tip': lineKey,
      r: lineKey === 'primary' ? '2.1' : lineKey === 'secondary' ? '1.9' : '1.7',
    });
    group.appendChild(paths[lineKey]);
    group.appendChild(tips[lineKey]);
  });

  return { group, paths, tips };
}

function applyLineDraw(path, tip, drawProgress, opacity) {
  if (!path) return;
  const len = path.getTotalLength();
  if (!len) return;

  const visible = clamp(drawProgress, 0, 1);
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len * (1 - visible)}`;
  path.style.opacity = String(opacity);

  if (!tip) return;
  const point = path.getPointAtLength(visible * len);
  tip.setAttribute('cx', point.x.toFixed(2));
  tip.setAttribute('cy', point.y.toFixed(2));
  tip.style.opacity = visible > 0.015 ? String(opacity) : '0';
}

function applySceneDraw(scene, lineKeys) {
  const opacity = sceneOpacity(scene.scrollProgress);

  lineKeys.forEach((lineKey) => {
    const draw = drawProgressFromScroll(scene.scrollProgress, LINE_STAGGER[lineKey] || 0);
    applyLineDraw(scene.paths[lineKey], scene.tips[lineKey], draw, opacity);
  });
}

function renderSceneGeometry(scene, time, floatConfig, lineKeys) {
  lineKeys.forEach((lineKey) => {
    const base = scene.baseGeometry[lineKey];
    if (!base) return;
    const geom = floatConfig ? applyFloat(base, time, floatConfig, lineKey) : base;
    scene.paths[lineKey].setAttribute('d', buildPathD(geom));
  });
  applySceneDraw(scene, lineKeys);
}

/**
 * Sistema de líneas SVG por escenas locales — haz Bézier independiente por bloque.
 */
export function initBackgroundLines(ctx, cleanups, root) {
  const main = root || document.querySelector('main');
  const layer = document.getElementById('vl-bg-lines-layer');
  const svg = document.getElementById('vl-bg-lines');
  const scenesRoot = svg?.querySelector('[data-vl-line-scenes]');

  if (!main || !layer || !svg || !scenesRoot) return;

  const state = {
    scenes: [],
    width: 0,
    height: 0,
    time: 0,
    lastFrame: 0,
    rafId: null,
    animate: !ctx?.reduced,
    lineKeys: MOBILE_LINE_KEYS,
    floatConfig: getFloatConfig(false, false),
    scrollTriggers: [],
    intersectionObserver: null,
  };

  function getActiveScenes() {
    const { mobile } = getViewportMode();
    return LINE_SCENES.filter((config) => !mobile || MOBILE_SCENE_IDS.has(config.id));
  }

  function computeSceneTop(anchorEl, sceneConfig, sceneHeight) {
    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    const rect = anchorEl.getBoundingClientRect();
    const anchorY = rect.top + window.scrollY - mainTop + rect.height * sceneConfig.yRatio;
    return clamp(anchorY - sceneHeight * 0.52, 16, Math.max(16, state.height - sceneHeight - 16));
  }

  function rebuildSceneGeometry(scene) {
    const { mobile, tablet } = getViewportMode();
    const openScale = mobile ? 0.88 : tablet ? 0.92 : 1;
    const cfg = scene.config;

    const adjustedConfig = {
      ...cfg,
      destination: {
        x: cfg.origin.x + (cfg.destination.x - cfg.origin.x) * openScale,
        y: cfg.destination.y,
      },
    };

    scene.lineKeys.forEach((lineKey) => {
      scene.baseGeometry[lineKey] = buildBaseGeometry(
        adjustedConfig,
        scene.width,
        scene.height,
        lineKey,
      );
    });
  }

  function destroyScenes() {
    state.scrollTriggers.forEach((st) => st.kill());
    state.scrollTriggers = [];
    state.intersectionObserver?.disconnect();
    state.intersectionObserver = null;
    scenesRoot.replaceChildren();
    state.scenes = [];
  }

  function buildScenes() {
    destroyScenes();

    const { mobile, tablet } = getViewportMode();
    state.lineKeys = mobile ? MOBILE_LINE_KEYS : LINE_KEYS;
    state.floatConfig = getFloatConfig(mobile, tablet);

    const width = Math.max(main.clientWidth, 320);
    const height = Math.max(main.scrollHeight, window.innerHeight);
    state.width = width;
    state.height = height;

    layer.style.height = `${height}px`;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));

    const configs = getActiveScenes();
    const vhPx = window.innerHeight / 100;

    configs.forEach((config) => {
      const anchorEl = main.querySelector(config.selector);
      if (!anchorEl) return;

      const sceneHeight = config.heightVh * vhPx;
      const top = computeSceneTop(anchorEl, config, sceneHeight);
      const { group, paths, tips } = createSceneGroup(config.id);

      group.setAttribute('transform', `translate(0, ${top.toFixed(1)})`);
      group.style.opacity = '0';
      scenesRoot.appendChild(group);

      const scene = {
        config,
        group,
        paths,
        tips,
        triggerEl: anchorEl,
        top,
        width,
        height: sceneHeight,
        lineKeys: [...state.lineKeys],
        baseGeometry: {},
        scrollProgress: 0,
        active: false,
      };

      rebuildSceneGeometry(scene);

      scene.lineKeys.forEach((key) => {
        paths[key].style.display = '';
        tips[key].style.display = '';
      });

      if (mobile) {
        paths.brass.style.display = 'none';
        tips.brass.style.display = 'none';
      }

      state.scenes.push(scene);
    });

    if (ctx?.reduced) {
      state.scenes.forEach((scene) => {
        renderSceneGeometry(scene, 0, null, scene.lineKeys);
        scene.scrollProgress = 0.55;
        scene.group.style.opacity = '0.22';
        applySceneDraw(scene, scene.lineKeys);
      });
      return;
    }

    state.scenes.forEach((scene) => {
      renderSceneGeometry(scene, 0, null, scene.lineKeys);

      const st = ScrollTrigger.create({
        trigger: scene.triggerEl,
        start: 'top 90%',
        end: 'bottom 15%',
        scrub: scene.config.scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scene.scrollProgress = self.progress;
          scene.group.style.opacity = String(sceneOpacity(self.progress));
          applySceneDraw(scene, scene.lineKeys);
        },
      });

      state.scrollTriggers.push(st);
      scene.group.style.opacity = String(sceneOpacity(st.progress || 0));
      applySceneDraw(scene, scene.lineKeys);
    });

    if (state.animate) {
      state.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const scene = state.scenes.find((s) => s.triggerEl === entry.target);
            if (scene) scene.active = entry.isIntersecting;
          });
        },
        { root: null, rootMargin: '100% 0px 100% 0px', threshold: 0 },
      );

      state.scenes.forEach((scene) => {
        state.intersectionObserver.observe(scene.triggerEl);
        const rect = scene.triggerEl.getBoundingClientRect();
        const inView = rect.bottom > -window.innerHeight && rect.top < window.innerHeight * 2;
        scene.active = inView;
      });
    }
  }

  function tick(now) {
    state.rafId = window.requestAnimationFrame(tick);
    if (now - state.lastFrame < FRAME_MS) return;
    state.lastFrame = now;
    state.time = now;

    state.scenes.forEach((scene) => {
      if (!scene.active) return;
      renderSceneGeometry(scene, now, state.floatConfig, scene.lineKeys);
    });
  }

  buildScenes();
  layer.classList.add('is-ready');

  if (ctx?.reduced) {
    layer.classList.add('is-reduced');
  } else if (state.animate) {
    state.rafId = window.requestAnimationFrame(tick);
  }

  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        buildScenes();
        ScrollTrigger.refresh();
      })
    : null;

  ro?.observe(main);

  const onResize = () => {
    buildScenes();
    ScrollTrigger.refresh();
  };

  window.addEventListener('resize', onResize);

  pushCleanup(cleanups, () => {
    if (state.rafId) window.cancelAnimationFrame(state.rafId);
    destroyScenes();
    ro?.disconnect();
    window.removeEventListener('resize', onResize);
    layer.classList.remove('is-ready', 'is-reduced');
    layer.style.removeProperty('height');
    svg.removeAttribute('viewBox');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
  });
}
