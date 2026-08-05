'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';

const WORDS = [
  'Financiamiento',
  'Inversiones',
  'Liquidez',
  'Medios de pago',
  'Procesos con IA',
  'Mercado de capitales',
  'Estrategia',
  'Ejecución',
  'Resultados',
  'Respaldo',
  'Crecimiento',
  'Gestión integral',
];

const DESKTOP_LAYOUT = [
  { x: -37, y: -25, scale: 1.04, opacity: 0.72, blur: 0 },
  { x: 30, y: -28, scale: 0.78, opacity: 0.38, blur: 2.2 },
  { x: -43, y: 2, scale: 0.7, opacity: 0.28, blur: 3.4 },
  { x: 35, y: 12, scale: 0.98, opacity: 0.58, blur: 0.5 },
  { x: -25, y: 27, scale: 0.82, opacity: 0.42, blur: 1.8 },
  { x: 21, y: 31, scale: 0.64, opacity: 0.24, blur: 4.3 },
  { x: 43, y: -7, scale: 0.58, opacity: 0.2, blur: 5.2 },
  { x: -8, y: -34, scale: 0.56, opacity: 0.18, blur: 5.8 },
  { x: 8, y: 5, scale: 1.14, opacity: 0.66, blur: 0 },
  { x: -36, y: 18, scale: 0.65, opacity: 0.24, blur: 3.9 },
  { x: 37, y: 27, scale: 0.7, opacity: 0.28, blur: 3.2 },
  { x: 4, y: -21, scale: 0.68, opacity: 0.3, blur: 2.8 },
];

const TABLET_LAYOUT = [
  { x: -33, y: -23, scale: 0.96, opacity: 0.66, blur: 0 },
  { x: 28, y: -25, scale: 0.74, opacity: 0.34, blur: 2 },
  { x: -36, y: 2, scale: 0.68, opacity: 0.27, blur: 3 },
  { x: 31, y: 14, scale: 0.9, opacity: 0.52, blur: 0.5 },
  { x: -22, y: 25, scale: 0.76, opacity: 0.36, blur: 1.8 },
  { x: 17, y: 29, scale: 0.62, opacity: 0.22, blur: 4 },
  { x: 36, y: -6, scale: 0.56, opacity: 0.18, blur: 4.8 },
  { x: -5, y: -31, scale: 0.54, opacity: 0.17, blur: 5.2 },
  { x: 6, y: 5, scale: 1.06, opacity: 0.6, blur: 0 },
];

const MOBILE_LAYOUT = [
  { x: -23, y: -24, scale: 0.9, opacity: 0.56, blur: 0 },
  { x: 20, y: -18, scale: 0.7, opacity: 0.32, blur: 2 },
  { x: -27, y: 2, scale: 0.64, opacity: 0.25, blur: 3 },
  { x: 22, y: 15, scale: 0.82, opacity: 0.46, blur: 0.5 },
  { x: -18, y: 26, scale: 0.68, opacity: 0.3, blur: 2.2 },
  { x: 14, y: 30, scale: 0.58, opacity: 0.2, blur: 4 },
];

function resolveLayout() {
  if (window.matchMedia('(max-width: 760px)').matches) {
    return MOBILE_LAYOUT;
  }

  if (window.matchMedia('(max-width: 1100px)').matches) {
    return TABLET_LAYOUT;
  }

  return DESKTOP_LAYOUT;
}

export default function HeroFloatingServiceWords() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const heroScroll = document.querySelector(
      '[data-video-hero-scroll]'
    );

    if (!root || !heroScroll) return undefined;

    const words = gsap.utils.toArray(
      root.querySelectorAll('[data-hero-service-word]')
    );
    const message = root.querySelector(
      '[data-hero-service-message]'
    );
    const eyebrow = root.querySelector(
      '[data-hero-service-eyebrow]'
    );
    const title = root.querySelector(
      '[data-hero-service-title]'
    );
    const copy = root.querySelector(
      '[data-hero-service-copy]'
    );

    if (
      !words.length
      || !message
      || !eyebrow
      || !title
      || !copy
    ) {
      return undefined;
    }

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduced) {
      gsap.set(root, { autoAlpha: 0 });
      return () => gsap.set(root, { clearProps: 'all' });
    }

    const layout = resolveLayout();
    const visibleWords = words.slice(0, layout.length);

    words.slice(layout.length).forEach((word) => {
      gsap.set(word, { display: 'none' });
    });

    let trigger = null;

    const context = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(message, {
        autoAlpha: 0,
        y: 28,
        scale: 0.965,
        filter: 'blur(10px)',
      });
      gsap.set([eyebrow, title, copy], {
        autoAlpha: 0,
        y: 14,
      });

      visibleWords.forEach((word, index) => {
        const point = layout[index];

        gsap.set(word, {
          x: `${point.x}vw`,
          y: `${point.y}vh`,
          scale: point.scale,
          autoAlpha: 0,
          filter: `blur(${point.blur}px)`,
          rotate: index % 2 === 0 ? -1.2 : 1.2,
          force3D: true,
          transformOrigin: '50% 50%',
        });
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          overwrite: 'auto',
        },
      });

      visibleWords.forEach((word, index) => {
        const point = layout[index];
        const direction = index % 2 === 0 ? 1 : -1;
        const entryAt = 0.225 + index * 0.004;

        timeline.to(
          word,
          {
            autoAlpha: point.opacity,
            duration: 0.055,
            ease: 'power3.out',
          },
          entryAt
        );

        timeline.to(
          word,
          {
            x: `+=${direction * (3 + point.scale * 5)}vw`,
            y: `+=${(index % 3 - 1) * (3 + point.scale * 3)}vh`,
            rotate: direction * (1.8 + point.scale * 1.6),
            duration: 0.24,
            ease: 'power2.inOut',
          },
          0.26
        );

        timeline.to(
          word,
          {
            x: `+=${direction * (9 + point.scale * 10)}vw`,
            y: `+=${index % 2 === 0 ? -7 : 8}vh`,
            scale: point.scale * 1.18,
            autoAlpha: 0,
            filter: `blur(${5 + point.scale * 7}px)`,
            duration: 0.16,
            ease: 'power2.in',
          },
          0.43 + index * 0.003
        );
      });

      timeline.to(
        message,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.12,
          ease: 'power3.out',
        },
        0.48
      );

      timeline.to(
        eyebrow,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.07,
          ease: 'power3.out',
        },
        0.49
      );

      timeline.to(
        title,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.1,
          ease: 'power3.out',
        },
        0.515
      );

      timeline.to(
        copy,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.09,
          ease: 'power3.out',
        },
        0.55
      );

      timeline.to(
        message,
        {
          autoAlpha: 0,
          y: -18,
          scale: 0.985,
          filter: 'blur(5px)',
          duration: 0.055,
          ease: 'power2.in',
        },
        0.695
      );

      trigger = ScrollTrigger.create({
        animation: timeline,
        trigger: heroScroll,
        start: 'top top+=16',
        end: 'bottom bottom+=28',
        scrub: 0.52,
        invalidateOnRefresh: true,
      });

      timeline.progress(trigger.progress);
    }, root);

    return () => {
      trigger?.kill();
      context.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="video-hero__word-cloud"
      data-video-hero-word-cloud
      aria-label="Servicios integrados de Value Latam"
    >
      <div
        className="video-hero__word-cloud-words"
        aria-hidden="true"
      >
        {WORDS.map((word, index) => (
          <span
            className={
              `video-hero__floating-word `
              + (
                index === 0
                || index === 3
                || index === 8
                  ? 'is-accent'
                  : ''
              )
            }
            data-hero-service-word
            key={word}
          >
            {word}
          </span>
        ))}
      </div>

      <div
        className="video-hero__word-cloud-message"
        data-hero-service-message
      >
        <span
          className="video-hero__word-cloud-eyebrow"
          data-hero-service-eyebrow
        >
          Una estructura integrada
        </span>

        <h2 data-hero-service-title>
          Todo lo que tu empresa necesita para
          <span> financiarse, operar y crecer.</span>
        </h2>

        <p data-hero-service-copy>
          Financiamiento, inversión, medios de pago e IA
          bajo un mismo equipo.
        </p>
      </div>
    </div>
  );
}
