'use client';

import { useEffect, useRef } from 'react';

const IVORY = [242, 239, 232];
const CHAMPAGNE = [204, 180, 135];

const STARFIELD_CONFIG = {
  desktopMin: 48,
  desktopMax: 82,
  mobileMin: 24,
  mobileMax: 38,
  areaDivisor: 23500,
  pointerStrength: 7,
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

  if (roll < 0.7) {
    return {
      depth: randomBetween(0.1, 0.34),
      radius: randomBetween(0.22, 0.46),
      alpha: randomBetween(0.07, 0.17),
      scrollFactor: randomBetween(0.005, 0.011),
      pointerFactor: randomBetween(0.5, 1.4),
      drift: randomBetween(0.08, 0.22),
    };
  }

  if (roll < 0.96) {
    return {
      depth: randomBetween(0.38, 0.68),
      radius: randomBetween(0.42, 0.76),
      alpha: randomBetween(0.13, 0.27),
      scrollFactor: randomBetween(0.012, 0.023),
      pointerFactor: randomBetween(1.6, 3.1),
      drift: randomBetween(0.16, 0.38),
    };
  }

  return {
    depth: randomBetween(0.72, 0.94),
    radius: randomBetween(0.72, 1.05),
    alpha: randomBetween(0.21, 0.38),
    scrollFactor: randomBetween(0.025, 0.038),
    pointerFactor: randomBetween(3.3, 4.8),
    drift: randomBetween(0.28, 0.5),
  };
}

function createStar(width, height) {
  const layer = selectLayer();
  const warm = Math.random() < 0.1;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    depth: layer.depth,
    radius: layer.radius,
    alpha: layer.alpha,
    scrollFactor: layer.scrollFactor,
    pointerFactor: layer.pointerFactor,
    drift: layer.drift,
    color: warm ? CHAMPAGNE : IVORY,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: randomBetween(0.00011, 0.00025),
    twinkleAmount: randomBetween(0.025, 0.09),
    driftSpeedX: randomBetween(0.000008, 0.000021),
    driftSpeedY: randomBetween(0.000007, 0.000018),
  };
}

function createStars(width, height) {
  const estimated = Math.round(
    (width * height) / STARFIELD_CONFIG.areaDivisor
  );
  const mobile = width <= 760;
  const count = mobile
    ? clamp(
      estimated,
      STARFIELD_CONFIG.mobileMin,
      STARFIELD_CONFIG.mobileMax
    )
    : clamp(
      estimated,
      STARFIELD_CONFIG.desktopMin,
      STARFIELD_CONFIG.desktopMax
    );

  return Array.from(
    { length: count },
    () => createStar(width, height)
  );
}

function drawStar(context, star, x, y, time) {
  const twinkle = (
    1
    + Math.sin(
      time * star.twinkleSpeed
      + star.phase
    ) * star.twinkleAmount
  );
  const alpha = clamp(
    star.alpha * twinkle,
    0,
    0.46
  );
  const [red, green, blue] = star.color;

  context.beginPath();
  context.fillStyle = (
    `rgba(${red}, ${green}, ${blue}, ${alpha})`
  );
  context.arc(
    x,
    y,
    star.radius,
    0,
    Math.PI * 2
  );
  context.fill();
}

export default function AmbientParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const context = canvas.getContext(
      '2d',
      { alpha: true }
    );

    if (!context) return undefined;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 1;
    let height = 1;
    let stars = [];
    let frame = 0;
    let lastTime = performance.now();
    let visible = !document.hidden;

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const scroll = {
      value: window.scrollY || 0,
      target: window.scrollY || 0,
    };

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);

      const mobile = width <= 760;
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        mobile ? 1.2 : 1.4
      );

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      stars = createStars(width, height);
    };

    const updatePointer = (event) => {
      pointer.targetX = clamp(
        event.clientX / width - 0.5,
        -0.5,
        0.5
      );
      pointer.targetY = clamp(
        event.clientY / height - 0.5,
        -0.5,
        0.5
      );
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const updateScroll = () => {
      scroll.target = window.scrollY || 0;
    };

    const draw = (time) => {
      lastTime = time;

      pointer.x += (
        pointer.targetX - pointer.x
      ) * 0.035;
      pointer.y += (
        pointer.targetY - pointer.y
      ) * 0.035;
      scroll.value += (
        scroll.target - scroll.value
      ) * STARFIELD_CONFIG.scrollEase;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      stars.forEach((star) => {
        const driftX = Math.sin(
          time * star.driftSpeedX
          + star.phase
        ) * star.drift;
        const driftY = Math.cos(
          time * star.driftSpeedY
          + star.phase
        ) * star.drift;

        const scrollY = (
          scroll.value * star.scrollFactor
        );
        const pointerX = (
          pointer.x
          * STARFIELD_CONFIG.pointerStrength
          * star.pointerFactor
          * 0.12
        );
        const pointerY = (
          pointer.y
          * STARFIELD_CONFIG.pointerStrength
          * star.pointerFactor
          * 0.08
        );

        const x = wrap(
          star.x + pointerX + driftX,
          width
        );
        const y = wrap(
          star.y + scrollY + pointerY + driftY,
          height
        );

        drawStar(
          context,
          star,
          x,
          y,
          time
        );
      });

      frame = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      context.clearRect(
        0,
        0,
        width,
        height
      );

      stars.forEach((star) => {
        drawStar(
          context,
          star,
          star.x,
          star.y,
          0
        );
      });
    };

    const handleVisibility = () => {
      visible = !document.hidden;

      if (!visible) {
        cancelAnimationFrame(frame);
        return;
      }

      if (reducedMotion) {
        drawStatic();
        return;
      }

      lastTime = performance.now();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    resize();

    if (reducedMotion) {
      drawStatic();
    } else {
      frame = requestAnimationFrame(draw);
    }

    window.addEventListener(
      'resize',
      resize,
      { passive: true }
    );
    window.addEventListener(
      'pointermove',
      updatePointer,
      { passive: true }
    );
    window.addEventListener(
      'pointerleave',
      resetPointer,
      { passive: true }
    );
    window.addEventListener(
      'scroll',
      updateScroll,
      { passive: true }
    );
    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        'resize',
        resize
      );
      window.removeEventListener(
        'pointermove',
        updatePointer
      );
      window.removeEventListener(
        'pointerleave',
        resetPointer
      );
      window.removeEventListener(
        'scroll',
        updateScroll
      );
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );
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
