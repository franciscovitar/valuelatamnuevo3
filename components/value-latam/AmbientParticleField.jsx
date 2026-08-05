'use client';

import { useEffect, useRef } from 'react';

const IVORY = [242, 239, 232];
const CHAMPAGNE = [204, 180, 135];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrap(value, size) {
  return ((value % size) + size) % size;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(width, height, index) {
  const depth = randomBetween(0.08, 1);
  const warm = Math.random() < 0.22;
  const color = warm ? CHAMPAGNE : IVORY;
  const near = depth > 0.78;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    depth,
    radius: randomBetween(0.35, 0.9) + depth * 0.85,
    alpha: randomBetween(0.035, 0.11) + depth * 0.105,
    vx: randomBetween(-0.022, 0.026) * (0.35 + depth),
    vy: randomBetween(-0.012, 0.03) * (0.35 + depth),
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: randomBetween(0.00016, 0.00042),
    color,
    near,
    index,
  };
}

function createParticles(width, height) {
  const areaCount = Math.round(
    (width * height) / 29500
  );
  const mobile = width <= 760;
  const count = mobile
    ? clamp(areaCount, 18, 30)
    : clamp(areaCount, 34, 72);

  return Array.from(
    { length: count },
    (_, index) => createParticle(
      width,
      height,
      index
    )
  );
}

function drawParticle(
  context,
  particle,
  x,
  y,
  time
) {
  const pulse = (
    0.84
    + Math.sin(
      time * particle.pulseSpeed
      + particle.phase
    ) * 0.16
  );
  const alpha = particle.alpha * pulse;
  const radius = particle.radius * (
    0.7 + particle.depth * 0.65
  );
  const [red, green, blue] = particle.color;

  if (particle.near) {
    context.beginPath();
    context.fillStyle = (
      `rgba(${red}, ${green}, ${blue}, ${alpha * 0.12})`
    );
    context.arc(
      x,
      y,
      radius * 4.2,
      0,
      Math.PI * 2
    );
    context.fill();
  }

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
    let particles = [];
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
        mobile ? 1.25 : 1.5
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

      particles = createParticles(
        width,
        height
      );
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

    const draw = (time, animate = true) => {
      const delta = clamp(
        (time - lastTime) / 16.667,
        0.25,
        2.2
      );

      lastTime = time;

      pointer.x += (
        pointer.targetX - pointer.x
      ) * 0.045;
      pointer.y += (
        pointer.targetY - pointer.y
      ) * 0.045;
      scroll.value += (
        scroll.target - scroll.value
      ) * 0.075;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      particles.forEach((particle) => {
        if (animate) {
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
        }

        const depthPower = (
          particle.depth * particle.depth
        );
        const pointerX = (
          pointer.x
          * (5 + depthPower * 27)
        );
        const pointerY = (
          pointer.y
          * (4 + depthPower * 19)
        );
        const scrollShift = (
          scroll.value
          * (0.006 + depthPower * 0.028)
        );
        const driftX = Math.sin(
          time * 0.000035
          + particle.phase
        ) * depthPower * 3.2;
        const driftY = Math.cos(
          time * 0.000029
          + particle.phase
        ) * depthPower * 2.4;

        const x = wrap(
          particle.x + pointerX + driftX,
          width
        );
        const y = wrap(
          particle.y
          + pointerY
          + driftY
          - scrollShift,
          height
        );

        drawParticle(
          context,
          particle,
          x,
          y,
          time
        );
      });
    };

    const tick = (time) => {
      if (!visible) return;

      draw(time, true);
      frame = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      visible = !document.hidden;

      if (visible && !reducedMotion) {
        lastTime = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
      }
    };

    resize();

    if (reducedMotion) {
      draw(performance.now(), false);
    } else {
      frame = requestAnimationFrame(tick);
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
