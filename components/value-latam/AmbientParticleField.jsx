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

function createParticle(width, height) {
  const depth = randomBetween(0.06, 1);
  const warm = Math.random() < 0.16;
  const color = warm ? CHAMPAGNE : IVORY;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    depth,
    radius: randomBetween(0.28, 0.66) + depth * 0.42,
    alpha: randomBetween(0.028, 0.075) + depth * 0.055,
    vx: randomBetween(-0.014, 0.017) * (0.3 + depth),
    vy: randomBetween(-0.006, 0.018) * (0.3 + depth),
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: randomBetween(0.00013, 0.00028),
    color,
  };
}

function createParticles(width, height) {
  const baseCount = Math.round(
    (width * height) / 23500
  );
  const mobile = width <= 760;
  const count = mobile
    ? clamp(baseCount, 20, 34)
    : clamp(baseCount, 42, 82);

  return Array.from(
    { length: count },
    () => createParticle(width, height)
  );
}

function drawParticle(
  context,
  particle,
  x,
  y,
  time,
  scrollVelocity
) {
  const pulse = (
    0.9
    + Math.sin(
      time * particle.pulseSpeed
      + particle.phase
    ) * 0.1
  );
  const velocityPower = clamp(
    Math.abs(scrollVelocity) / 36,
    0,
    1
  );
  const alpha = (
    particle.alpha
    * pulse
    * (1 + velocityPower * particle.depth * 0.22)
  );
  const radius = particle.radius * (
    0.72 + particle.depth * 0.45
  );
  const [red, green, blue] = particle.color;

  /*
   * While scrolling, deeper particles become tiny vertical trails.
   * There is no circular halo.
   */
  const trailLength = (
    velocityPower
    * particle.depth
    * 7.5
  );
  const trailDirection = scrollVelocity >= 0 ? -1 : 1;

  if (trailLength > 0.35) {
    const gradient = context.createLinearGradient(
      x,
      y,
      x,
      y + trailLength * trailDirection
    );

    gradient.addColorStop(
      0,
      `rgba(${red}, ${green}, ${blue}, ${alpha * 0.82})`
    );
    gradient.addColorStop(
      1,
      `rgba(${red}, ${green}, ${blue}, 0)`
    );

    context.beginPath();
    context.strokeStyle = gradient;
    context.lineWidth = Math.max(
      0.45,
      radius * 0.68
    );
    context.moveTo(x, y);
    context.lineTo(
      x,
      y + trailLength * trailDirection
    );
    context.stroke();
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
    let lastScrollY = window.scrollY || 0;

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const scroll = {
      value: window.scrollY || 0,
      target: window.scrollY || 0,
      velocity: 0,
      targetVelocity: 0,
    };

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);

      const mobile = width <= 760;
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        mobile ? 1.2 : 1.45
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
      const nextScrollY = window.scrollY || 0;
      const delta = nextScrollY - lastScrollY;

      lastScrollY = nextScrollY;
      scroll.target = nextScrollY;
      scroll.targetVelocity = clamp(
        delta,
        -52,
        52
      );
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
      ) * 0.035;
      pointer.y += (
        pointer.targetY - pointer.y
      ) * 0.035;

      scroll.value += (
        scroll.target - scroll.value
      ) * 0.072;
      scroll.velocity += (
        scroll.targetVelocity - scroll.velocity
      ) * 0.16;
      scroll.targetVelocity *= 0.76;

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
          * (3 + depthPower * 16)
        );
        const pointerY = (
          pointer.y
          * (2 + depthPower * 11)
        );
        const baseScrollShift = (
          scroll.value
          * (0.004 + depthPower * 0.019)
        );
        const velocityShift = (
          scroll.velocity
          * depthPower
          * 1.15
        );
        const driftX = Math.sin(
          time * 0.000027
          + particle.phase
        ) * depthPower * 1.8;
        const driftY = Math.cos(
          time * 0.000023
          + particle.phase
        ) * depthPower * 1.4;

        const x = wrap(
          particle.x + pointerX + driftX,
          width
        );
        const y = wrap(
          particle.y
          + pointerY
          + driftY
          - baseScrollShift
          - velocityShift,
          height
        );

        drawParticle(
          context,
          particle,
          x,
          y,
          time,
          scroll.velocity
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
