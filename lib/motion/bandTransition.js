import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';

const BAND_CLASS = 'vl-band-wipe';

/**
 * Transición por bandas horizontales.
 *
 * La sección entra tapada por N franjas del color de la sección ANTERIOR, que
 * se retraen escalonadas y la van descubriendo. No hay fundido entre fondos:
 * el cambio es por recorte, que es lo que separa un corte editorial de un
 * simple cambio de background.
 *
 * `color` debe ser el de la sección que se deja atrás: al arrancar, el borde
 * se ve continuo con lo anterior y recién después se abre. Si se usa el color
 * de la sección entrante, las bandas no tapan nada y el efecto desaparece.
 *
 * Reservado para cambios de mundo visual (oscuro↔marfil). Aplicado a cortes
 * entre secciones del mismo registro deja de leerse como un evento y pasa a
 * ser decoración de fondo.
 *
 * Fail-safe: si la sección ya está en pantalla cuando corre el init, no se
 * crea nada. Así nunca queda contenido tapado por un overlay cuyo trigger ya
 * pasó — el modo de fallo que importa acá.
 */
export function initBandWipe(section, ctx, options = {}) {
  if (!section) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) return () => {};

  const {
    bands = 5,
    duration = 1,
    stagger = 0.095,
    start = 'top 90%',
    ease = 'power3.inOut',
    color,
  } = options;

  // Viewport sin altura (pestaña en segundo plano, panel embebido colapsado):
  // los cálculos de disparo no son fiables y el overlay podría quedar tapando
  // contenido. Sin wipe es preferible a contenido oculto.
  const viewportHeight = window.innerHeight;
  if (!viewportHeight) return () => {};

  // Ya visible: entrar con las bandas puestas sería taparle contenido al
  // usuario para después destaparlo.
  const rect = section.getBoundingClientRect();
  if (rect.top < viewportHeight * 0.92) return () => {};

  section.querySelector(`:scope > .${BAND_CLASS}`)?.remove();

  const overlay = document.createElement('div');
  overlay.className = BAND_CLASS;
  overlay.setAttribute('aria-hidden', 'true');

  if (color) overlay.style.setProperty('--vl-band-color', color);

  const strips = [];
  const bandHeight = 100 / bands;

  for (let index = 0; index < bands; index += 1) {
    const band = document.createElement('span');
    band.className = `${BAND_CLASS}__band`;
    band.style.top = `${index * bandHeight}%`;
    // Medio punto extra evita costuras por redondeo subpíxel entre bandas.
    band.style.height = `${bandHeight + 0.5}%`;
    overlay.appendChild(band);
    strips.push(band);
  }

  section.appendChild(overlay);

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    overlay.remove();
  };

  gsap.set(strips, { transformOrigin: 'center top', scaleY: 1 });

  const tl = gsap.timeline({ paused: true, onComplete: remove });
  tl.to(strips, { scaleY: 0, duration, stagger, ease });

  const st = ScrollTrigger.create({
    trigger: section,
    start,
    once: true,
    onEnter: () => tl.play(),
  });

  if (st.progress > 0) remove();

  return () => {
    st.kill();
    tl.kill();
    remove();
  };
}
