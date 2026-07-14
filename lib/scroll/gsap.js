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

export { gsap, ScrollTrigger, useGSAP };
export default gsap;
