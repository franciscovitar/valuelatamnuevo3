'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/scroll/gsap';

const WORDS = [
  'Financiamiento',
  'Inversiones',
  'Liquidez',
  'Medios de pago',
  'Automatización con IA',
  'Mercado de capitales',
  'Estrategia',
  'Ejecución',
  'Resultados',
  'Gestión integral',
];

const DESKTOP_LAYOUT = [
  { x: -35, y: -21, scale: 1.12, opacity: 0.66, blur: 0 },
  { x: 29, y: -24, scale: 0.88, opacity: 0.38, blur: 1.5 },
  { x: -42, y: 4, scale: 0.76, opacity: 0.28, blur: 2.8 },
  { x: 34, y: 15, scale: 1.02, opacity: 0.52, blur: 0.4 },
  { x: -24, y: 27, scale: 0.82, opacity: 0.34, blur: 2 },
  { x: 18, y: 30, scale: 0.7, opacity: 0.25, blur: 3.4 },
  { x: 41, y: -4, scale: 0.62, opacity: 0.2, blur: 4.2 },
  { x: -10, y: -33, scale: 0.58, opacity: 0.18, blur: 4.8 },
  { x: 7, y: 5, scale: 1.18, opacity: 0.58, blur: 0 },
  { x: -36, y: 18, scale: 0.68, opacity: 0.23, blur: 3.5 },
];

const MOBILE_LAYOUT = [
  { x: -22, y: -25, scale: 0.92, opacity: 0.52, blur: 0 },
  { x: 20, y: -17, scale: 0.76, opacity: 0.34, blur: 1.5 },
  { x: -26, y: 5, scale: 0.7, opacity: 0.28, blur: 2 },
  { x: 23, y: 16, scale: 0.86, opacity: 0.44, blur: 0.5 },
  { x: -18, y: 26, scale: 0.68, opacity: 0.28, blur: 2.2 },
  { x: 14, y: 31, scale: 0.62, opacity: 0.22, blur: 3 },
];

function getLayout(mobile) {
  return mobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
}

export default function FloatingServiceWords() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const frame = root.querySelector(
      '[data-vl-service-words-frame]'
    );
    const words = gsap.utils.toArray(
      root.querySelectorAll(
        '[data-vl-service-word]'
      )
    );
    const message = root.querySelector(
      '[data-vl-service-message]'
    );
    const eyebrow = root.querySelector(
      '[data-vl-service-eyebrow]'
    );
    const title = root.querySelector(
      '[data-vl-service-title]'
    );
    const copy = root.querySelector(
      '[data-vl-service-copy]'
    );

    if (
      !frame
      || !words.length
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
    const mobile = window.matchMedia(
      '(max-width: 760px)'
    ).matches;
    const layout = getLayout(mobile);
    const visibleWords = mobile
      ? words.slice(0, layout.length)
      : words;

    if (mobile) {
      words.slice(layout.length).forEach((word) => {
        gsap.set(word, { display: 'none' });
      });
    }

    if (reduced) {
      gsap.set(words, { autoAlpha: 0 });
      gsap.set(message, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      });

      return () => {
        gsap.set(words, { clearProps: 'all' });
        gsap.set(message, { clearProps: 'all' });
      };
    }

    const context = gsap.context(() => {
      visibleWords.forEach((word, index) => {
        const point = layout[index];

        gsap.set(word, {
          x: `${point.x}vw`,
          y: `${point.y}vh`,
          scale: point.scale,
          autoAlpha: point.opacity,
          filter: `blur(${point.blur}px)`,
          rotate: index % 2 === 0 ? -1.5 : 1.5,
          transformOrigin: '50% 50%',
          force3D: true,
        });
      });

      gsap.set(message, {
        autoAlpha: 0,
        y: 32,
        scale: 0.96,
        filter: 'blur(10px)',
      });

      gsap.set([eyebrow, title, copy], {
        autoAlpha: 0,
        y: 18,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.52,
          invalidateOnRefresh: true,
        },
      });

      visibleWords.forEach((word, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const depth = layout[index].scale;

        timeline.to(
          word,
          {
            x: `+=${direction * (4 + depth * 7)}vw`,
            y: `+=${(index % 3 - 1) * (4 + depth * 4)}vh`,
            rotate: direction * (2.5 + depth * 2),
            scale: depth * 1.06,
            duration: 0.42,
            ease: 'power2.inOut',
          },
          0
        );

        timeline.to(
          word,
          {
            x: `+=${direction * (10 + depth * 12)}vw`,
            y: `+=${index % 2 === 0 ? -8 : 9}vh`,
            scale: depth * 1.28,
            autoAlpha: 0,
            filter: `blur(${5 + depth * 8}px)`,
            duration: 0.34,
            ease: 'power2.in',
          },
          0.3 + index * 0.008
        );
      });

      timeline.to(
        message,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.3,
          ease: 'power3.out',
        },
        0.42
      );

      timeline.to(
        eyebrow,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.2,
          ease: 'power3.out',
        },
        0.45
      );

      timeline.to(
        title,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.26,
          ease: 'power3.out',
        },
        0.49
      );

      timeline.to(
        copy,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: 'power3.out',
        },
        0.56
      );

      timeline.to(
        message,
        {
          autoAlpha: 0,
          y: -22,
          scale: 0.985,
          filter: 'blur(5px)',
          duration: 0.18,
          ease: 'power2.in',
        },
        0.86
      );
    }, root);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="sol-word-cloud"
      data-vl-service-words
      aria-label="Servicios integrados de Value Latam"
    >
      <div
        className="sol-word-cloud__frame"
        data-vl-service-words-frame
      >
        <div
          className="sol-word-cloud__words"
          aria-hidden="true"
        >
          {WORDS.map((word, index) => (
            <span
              className={
                `sol-word-cloud__word `
                + (
                  index === 0
                  || index === 3
                  || index === 8
                    ? 'is-accent'
                    : ''
                )
              }
              data-vl-service-word
              key={word}
            >
              {word}
            </span>
          ))}
        </div>

        <div
          className="sol-word-cloud__message"
          data-vl-service-message
        >
          <span
            className="eyebrow"
            data-vl-service-eyebrow
          >
            Una estructura integrada
          </span>

          <h2
            className="serif"
            data-vl-service-title
          >
            Todo lo que tu empresa necesita para
            <span> financiarse, operar y crecer.</span>
          </h2>

          <p data-vl-service-copy>
            Financiamiento, inversión, medios de pago e IA
            bajo un mismo equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
