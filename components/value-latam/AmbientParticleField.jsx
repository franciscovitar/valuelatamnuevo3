'use client';

import { useEffect, useRef } from 'react';

const IVORY = [242, 239, 232];
const CHAMPAGNE = [204, 180, 135];

const STARFIELD_CONFIG = {
  desktopMin: 72,
  desktopMax: 126,
  mobileMin: 34,
  mobileMax: 56,
  areaDivisor: 16800,
  pointerStrength: 14,
  scrollEase: 0.075,
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

  if (roll < 0.56) {
    return {
      name: 'far',
      depth: randomBetween(0.12, 0.38),
      radius: randomBetween(0.32, 0.66),
      alpha: randomBetween(0.15, 0.34),
      scrollFactor: randomBetween(0.008, 0.017),
      pointerFactor: randomBetween(0.8, 2.4),
      drift: randomBetween(0.12, 0.35),
      sparkleChance: 0,
    };
  }

  if (roll < 0.9) {
    return {
      name: 'mid',
      depth: randomBetween(0.42, 0.72),
      radius: randomBetween(0.62, 1.08),
      alpha: randomBetween(0.28, 0.52),
      scrollFactor: randomBetween(0.019, 0.036),
      pointerFactor: randomBetween(2.8, 5.4),
      drift: randomBetween(0.3, 0.65),
      sparkleChance: 0.025,
    };
  }

  return {
    name: 'near',
    depth: randomBetween(0.76, 1),
    radius: randomBetween(1.05, 1.72),
    alpha: randomBetween(0.48, 0.78),
    scrollFactor: randomBetween(0.039, 0.064),
    pointerFactor: randomBetween(5.8, 9.2),
    drift: randomBetween(0.55, 0.95),
    sparkleChance: 0.16,
  };
}

function createStar(width, height) {
  const layer = selectLayer();
  const warm = Math.random() < 0.14;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    depth: layer.depth,
    radius: layer.radius,
    alpha: layer.alpha,
    scrollFactor: layer.scrollFactor,
    pointerFactor: layer.pointerFactor,
    drift: layer.drift,
    layer: layer.name,
    sparkle: Math.random() < layer.sparkleChance,
    color: warm ? CHAMPAGNE : IVORY,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: randomBetween(0.00018, 0.00052),
    twinkleAmount: randomBetween(0.08, 0.24),
    driftSpeedX: randomBetween(0.000012, 0.000032),
    driftSpeedY: randomBetween(0.000009, 0.000025),
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
    0.92
  );
  const radius = star.radius * (
    0.88 + star.depth * 0.18
  );
  const [red, green, blue] = star.color;

  context.beginPath();
  context.fillStyle = (
    `rgba(${red}, ${green}, ${blue}, ${alpha})`
  );
  context.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );
  context.fill();

  if (!star.sparkle) return;

  const sparkleAlpha = alpha * 0.42;
  const arm = radius * 3.2;

  context.beginPath();
  context.strokeStyle = (
    `rgba(${red}, ${green}, ${blue}, ${sparkleAlpha})`
  );
  context.lineWidth = Math.max(
    0.42,
    radius * 0.34
  );
  context.moveTo(x - arm, y);
  context.lineTo(x + arm, y);
  context.moveTo(x, y - arm);
  context.lineTo(x, y + arm);
  context.stroke();
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
        mobile ? 1.25 : 1.55
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
      context.lineCap = 'round';

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
      const delta = clamp(
        (time - lastTime) / 16.667,
        0.25,
        2.4
      );

      lastTime = time;

      pointer.x += (
        pointer.targetX - pointer.x
      ) * 0.04;
      pointer.y += (
        pointer.targetY - pointer.y
      ) * 0.04;
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

        /*
         * Scrolling down makes stars descend in the viewport.
         * Each depth layer uses a different fraction of page scroll,
         * so distant stars move least and nearby stars move most.
         */
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
          * 0.09
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
