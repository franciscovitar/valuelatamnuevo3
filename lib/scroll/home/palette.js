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
 *
 * Bug encontrado en la pasada de seguridad: este archivo seguia leyendo
 * `--p-gold*`, el nombre de ANTES de que la escala se renombrara a
 * `--p-accent*` durante la conversion a paleta monocroma. Como esa variable ya
 * no existe, `getPropertyValue` devolvia string vacio y CADA lectura caia
 * siempre al FALLBACK hardcodeado — que ademas era el dorado calido de la
 * identidad previa (#ccb487), no el acento monocromo actual (#f4f4f1). Es el
 * mismo patron de riesgo que ya documenta CLAUDE.md: renombrar una custom
 * property no rompe el build, rompe el navegador en silencio.
 */

/* Se usan si se consulta antes de tener document (SSR) o si falta la variable. */
const FALLBACK = {
  gold: '#f4f4f1',
  goldBright: '#f7f7f4',
  cream: '#f4f4f1',
  slate: '#c9c9c7',
  inkDeep: '#050505',
  goldRgb: '244 244 241',
  goldBrightRgb: '247 247 244',
  slateRgb: '201 201 199',
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
    gold: readVar('--p-accent', FALLBACK.gold),
    goldLight: readVar('--p-accent-bright', FALLBACK.goldBright),
    ivory: readVar('--p-cream', FALLBACK.cream),
    slate: readVar('--p-slate', FALLBACK.slate),
    inkDeep: readVar('--p-ink-950', FALLBACK.inkDeep),

    glowGold: alpha('--p-accent-rgb', FALLBACK.goldRgb, 0.28),
    glowGoldSoft: alpha('--p-accent-bright-rgb', FALLBACK.goldBrightRgb, 0.18),
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
