'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const CITY_REVEAL_EASE = [0.22, 1, 0.36, 1];
const REVEAL_DELAY_S = 0.48;

const cityHorizontalReveal = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)',
    scale: 1.02,
  },
  visible: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    scale: 1,
    transition: { duration: 1.15, delay: REVEAL_DELAY_S, ease: CITY_REVEAL_EASE },
  },
};

export default function CityVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
          setInView(true);
          section.classList.add('is-inview');
        }
      },
      { threshold: [0, 0.28, 0.45], rootMargin: '0px 0px -14% 0px' },
    );

    revealObserver.observe(section);

    let playObserver;
    if (!reduce && video) {
      playObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const play = video.play();
            if (play && typeof play.catch === 'function') play.catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0 },
      );
      playObserver.observe(section);
    } else if (video) {
      video.pause();
    }

    return () => {
      revealObserver.disconnect();
      playObserver?.disconnect();
    };
  }, []);

  const animateState = reduceMotion || inView ? 'visible' : 'hidden';

  return (
    <section
      ref={sectionRef}
      className="city-video"
      aria-label="Buenos Aires y su actividad empresarial"
    >
      <motion.div
        className="city-video__reveal"
        variants={cityHorizontalReveal}
        initial={reduceMotion ? false : 'hidden'}
        animate={animateState}
      >
        <div className="city-video__frame">
          <video
            ref={videoRef}
            className="city-video__media"
            src="/portada.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            controls={false}
            aria-hidden="true"
          />
          <div className="city-video__overlay" aria-hidden="true" />
        </div>
      </motion.div>
    </section>
  );
}
