'use client';

import { useEffect, useRef } from 'react';

const IVORY = [242, 239, 232];
const CHAMPAGNE = [204, 180, 135];

const STARFIELD_CONFIG = {
  desktopMin: 64,
  desktopMax: 104,
  mobileMin: 32,
  mobileMax: 48,
  areaDivisor: 19000,
  pointerStrength: 8,
  scrollEase: 0.07,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function selectLayer() {
  const roll = Math.random();

  if (roll < 0.66) {
    return {
      depth: randomBetween(0.08, 0.32),
      radius: randomBetween(0.34, 0.62),
      alpha: randomBetween(0.06, 0.14),
      blur: randomBetween(3, 6),
      halo: randomBetween(1.8, 2.6),
      scrollFactor: randomBetween(0.005, 0.011),
      pointerFactor: randomBetween(0.5, 1.3),
      drift: randomBetween(0.24, 0.5),
      floatRadius: randomBetween(2.5, 6),
      floatSpeed: randomBetween(0.00008, 0.00016),
    };
  }

  if (roll < 0.93) {
    return {
      depth: randomBetween(0.36, 0.68),
      radius: randomBetween(0.54, 0.96),
      alpha: randomBetween(0.1, 0.22),
      blur: randomBetween(5, 9),
      halo: randomBetween(2.2, 3.2),
      scrollFactor: randomBetween(0.012, 0.022),
      pointerFactor: randomBetween(1.5, 2.8),
      drift: randomBetween(0.36, 0.78),
      floatRadius: randomBetween(6, 12),
      floatSpeed: randomBetween(0.00012, 0.0002),
    };
  }

  return {
    depth: randomBetween(0.72, 0.96),
    radius: randomBetween(0.92, 1.48),
    alpha: randomBetween(0.14, 0.28),
    blur: randomBetween(7, 12),
    halo: randomBetween(2.6, 3.8),
    scrollFactor: randomBetween(0.022, 0.036),
    pointerFactor: randomBetween(2.8, 4.2),
    drift: randomBetween(0.54, 1.1),
    floatRadius: randomBetween(10, 18),
    floatSpeed: randomBetween(0.00016, 0.00024),
  };
}

function createStar(width, height) {
  const layer = selectLayer();
  const warm = Math.random() < 0.12;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    depth: layer.depth,
    radius: layer.radius,
    alpha: layer.alpha,
    blur: layer.blur,
    halo: layer.halo,
    scrollFactor: layer.scrollFactor,
    pointerFactor: layer.pointerFactor,
    drift: layer.drift,
    floatRadius: layer.floatRadius,
    floatSpeed: layer.floatSpeed,
    color: warm ? CHAMPAGNE : IVORY,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: randomBetween(0.00009, 0.00018),
    twinkleAmount: randomBetween(0.018, 0.06),
    driftSpeedX: randomBetween(0.000008, 0.000018),
    driftSpeedY: randomBetween(0.000007, 0.000016),
    floatPhaseX: Math.random() * Math.PI * 2,
    floatPhaseY: Math.random() * Math.PI * 2,
  };
}

function createStars(width, height) {
  const estimated = Math.round((width * height) / STARFIELD_CONFIG.areaDivisor);
  const mobile = width <= 760;
  const count = mobile
    ? clamp(estimated, STARFIELD_CONFIG.mobileMin, STARFIELD_CONFIG.mobileMax)
    : clamp(estimated, STARFIELD_CONFIG.desktopMin, STARFIELD_CONFIG.desktopMax);

  return Array.from({ length: count }, () => createStar(width, height));
}

function drawStar(context, star, x, y, time) {
  const twinkle = 1 + Math.sin(time * star.twinkleSpeed + star.phase) * star.twinkleAmount;
  const alpha = clamp(star.alpha * twinkle, 0, 0.4);
  const [red, green, blue] = star.color;
  const haloRadius = star.radius * star.halo;

  const gradient = context.createRadialGradient(x, y, 0, x, y, haloRadius);
  gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
  gradient.addColorStop(0.35, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.45})`);
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

  context.save();
  context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.35})`;
  context.shadowBlur = star.blur;
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, haloRadius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export default function AmbientParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 1;
    let height = 1;
    let stars = [];
    let frame = 0;

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const scroll = { value: window.scrollY || 0, target: window.scrollY || 0 };

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);

      const mobile = width <= 760;
      const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.4);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = createStars(width, height);
    };

    const updatePointer = (event) => {
      pointer.targetX = clamp(event.clientX / width - 0.5, -0.5, 0.5);
      pointer.targetY = clamp(event.clientY / height - 0.5, -0.5, 0.5);
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const updateScroll = () => {
      scroll.target = window.scrollY || 0;
    };

    const draw = (time) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.03;
      pointer.y += (pointer.targetY - pointer.y) * 0.03;
      scroll.value += (scroll.target - scroll.value) * STARFIELD_CONFIG.scrollEase;

      context.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        const driftX = Math.sin(time * star.driftSpeedX + star.phase) * star.drift;
        const driftY = Math.cos(time * star.driftSpeedY + star.phase) * star.drift;
        const floatX = Math.sin(time * star.floatSpeed + star.floatPhaseX) * star.floatRadius;
        const floatY = Math.cos(time * star.floatSpeed * 0.92 + star.floatPhaseY) * star.floatRadius * 0.75;

        const scrollY = scroll.value * star.scrollFactor;
        const pointerX = pointer.x * STARFIELD_CONFIG.pointerStrength * star.pointerFactor * 0.11;
        const pointerY = pointer.y * STARFIELD_CONFIG.pointerStrength * star.pointerFactor * 0.08;

        const x = wrap(star.x + pointerX + driftX + floatX, width);
        const y = wrap(star.y + scrollY + pointerY + driftY + floatY, height);

        drawStar(context, star, x, y, time);
      });

      frame = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => drawStar(context, star, star.x, star.y, 0));
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        return;
      }

      if (reducedMotion) {
        drawStatic();
        return;
      }

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    resize();

    if (reducedMotion) {
      drawStatic();
    } else {
      frame = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointerleave', resetPointer, { passive: true });
    window.addEventListener('scroll', updateScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="vl-ambient-particles"
      aria-hidden="true"
      data-vl-ambient-particles
    />
  );
}
