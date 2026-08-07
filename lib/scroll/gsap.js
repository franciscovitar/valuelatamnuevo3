import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let pluginsRegistered = false;

export function ensureGsapPlugins() {
  if (typeof window === 'undefined' || pluginsRegistered) return;

  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ markers: false });
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
