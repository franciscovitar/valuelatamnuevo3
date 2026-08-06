/*
 * Paleta para JS (GSAP escribe valores de color directos, no puede depender de
 * la cascada como el CSS).
 *
 * Lee las variables de app/styles/1-settings/_palette.scss en tiempo de
 * ejecucion, asi que la fuente unica sigue siendo el SCSS: si cambias el
 * dorado alla, el motion lo sigue sin tocar este archivo.
 *
 * Antes esto era una copia literal de la paleta con nombres heredados de una
 * identidad azul anterior que ya no existia: `iceBlue` valia #CCB487 (dorado),
 * `azure` era un gris calido y `navy` un negro. Los nombres mentian.
 */

/* Se usan si se consulta antes de tener document (SSR) o si falta la variable. */
const FALLBACK = {
  gold: '#ccb487',
  goldBright: '#ddc8a1',
  cream: '#f2efe8',
  slate: '#b7b3ab',
  inkDeep: '#020306',
  goldRgb: '204 180 135',
  goldBrightRgb: '221 200 161',
  slateRgb: '183 179 171',
};

function readVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

/** Color con transparencia a partir de una terna `R G B` de la paleta. */
function alpha(varName, fallbackTriplet, amount) {
  return `rgb(${readVar(varName, fallbackTriplet)} / ${amount})`;
}

function buildPalette() {
  return {
    gold: readVar('--p-gold', FALLBACK.gold),
    goldLight: readVar('--p-gold-bright', FALLBACK.goldBright),
    ivory: readVar('--p-cream', FALLBACK.cream),
    slate: readVar('--p-slate', FALLBACK.slate),
    inkDeep: readVar('--p-ink-950', FALLBACK.inkDeep),

    glowGold: alpha('--p-gold-rgb', FALLBACK.goldRgb, 0.28),
    glowGoldSoft: alpha('--p-gold-bright-rgb', FALLBACK.goldBrightRgb, 0.18),
    glowNeutral: alpha('--p-slate-rgb', FALLBACK.slateRgb, 0.14),
    glowNeutralSoft: alpha('--p-slate-rgb', FALLBACK.slateRgb, 0.1),
  };
}

let cached = null;

/**
 * Paleta resuelta. Se cachea tras la primera lectura en cliente: consultar
 * getComputedStyle por cada tween seria trabajo por frame para valores que no
 * cambian durante la sesion.
 */
export const scrollPalette = new Proxy({}, {
  get(_target, key) {
    if (!cached || (cached.__ssr && typeof document !== 'undefined')) {
      cached = buildPalette();
      cached.__ssr = typeof document === 'undefined';
    }
    return cached[key];
  },
});
