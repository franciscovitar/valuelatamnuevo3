import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let pluginsRegistered = false;

export function ensureGsapPlugins() {
  if (typeof window === 'undefined' || pluginsRegistered) return;

  gsap.registerPlugin(ScrollTrigger, useGSAP);

  /*
   * `ignoreMobileResize` evita el temblor del hero en mobile.
   *
   * En Chrome y Safari de telefono la barra de direcciones se contrae y se
   * expande mientras se scrollea, y cada cambio dispara un `resize` de solo
   * alto. ScrollTrigger, por defecto, responde con un refresh completo:
   * recalcula start/end de todos los triggers y reposiciona los pins en pleno
   * gesto, lo que devuelve el viewport hacia atras. Con el hero pinneado eso
   * se repite en cada cambio de barra y se siente como un terremoto.
   *
   * La opcion hace que ScrollTrigger ignore los resize en los que solo cambia
   * el alto en dispositivos tactiles. La rotacion (cambia el ancho) y los
   * cambios de layout siguen refrescando normalmente.
   */
  ScrollTrigger.config({ markers: false, ignoreMobileResize: true });
  pluginsRegistered = true;
}

ensureGsapPlugins();

/*
 * Lee una terna "R G B" de la paleta CSS y arma un color con alfa. Sin
 * fallback hardcodeado: la paleta (app/styles/1-settings/_palette.scss) es
 * la unica fuente, GSAP no debe llevar una copia propia del color.
 */
export function paletteColor(rgbVarName, alpha = 1) {
  const triplet = getComputedStyle(document.documentElement)
    .getPropertyValue(rgbVarName)
    .trim();

  return `rgb(${triplet} / ${alpha})`;
}

export { gsap, ScrollTrigger, useGSAP };
export default gsap;
