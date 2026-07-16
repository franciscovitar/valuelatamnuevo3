import * as THREE from 'three';
import {
  CHAPTER_WINDOWS,
  PALETTE,
  cameraKeyframes,
  chapterWeight,
  clamp01,
  createRng,
  interpolateKeyframes,
  smoothstep,
} from './heroThreeGeometry';

const POINTER_QUERY = '(min-width: 981px) and (pointer: fine)';
const ICE = new THREE.Color(PALETTE.iceBlue);
const GOLD = new THREE.Color(PALETTE.gold);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getQuality() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
  const desktop = !mobile && !tablet;

  return {
    mobile,
    tablet,
    desktop,
    farCount: mobile ? 140 : tablet ? 280 : 480,
    midCount: mobile ? 36 : tablet ? 68 : 110,
    arcCount: mobile ? 3 : tablet ? 5 : 6,
    dpr: mobile ? 1 : tablet ? 1.1 : Math.min(window.devicePixelRatio || 1, 1.35),
    pointerEnabled: window.matchMedia(POINTER_QUERY).matches,
  };
}

function createPointTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sampleFieldPosition(rng, layer) {
  const depthBias = layer === 'far' ? 1.4 : 0.85;
  const xSpread = layer === 'far' ? 3.2 : 2.4;
  const xMin = layer === 'far' ? -0.35 : 0.05;

  return {
    x: xMin + rng() * xSpread,
    y: lerp(-2.8, 2.8, rng()),
    z: lerp(-2.4, 1.2, rng()) * depthBias,
  };
}

function createParticleLayer(count, rng, texture, { size, baseOpacity, layer }) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);

  for (let i = 0; i < count; i += 1) {
    const { x, y, z } = sampleFieldPosition(rng, layer);
    const offset = i * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    basePositions.set([x, y, z], offset);

    const goldish = rng() > (layer === 'far' ? 0.88 : 0.78);
    const color = goldish ? GOLD : ICE;
    const dim = layer === 'far' ? 0.12 + rng() * 0.28 : 0.22 + rng() * 0.38;

    colors[offset] = color.r * dim;
    colors[offset + 1] = color.g * dim;
    colors[offset + 2] = color.b * dim;

    seeds[i * 4] = rng() * Math.PI * 2;
    seeds[i * 4 + 1] = 0.25 + rng() * 0.75;
    seeds[i * 4 + 2] = i % 4;
    seeds[i * 4 + 3] = goldish ? 1 : 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    map: texture,
    alphaTest: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: baseOpacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    positions,
    basePositions,
    colors,
    seeds,
    layer,
  };
}

function createHazeSprites(softTexture) {
  const blueMat = new THREE.SpriteMaterial({
    map: softTexture,
    color: PALETTE.navyMedium,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const goldMat = new THREE.SpriteMaterial({
    map: softTexture,
    color: PALETTE.gold,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const blue = new THREE.Sprite(blueMat);
  blue.position.set(1.05, 0.15, -2.2);
  blue.scale.set(5.5, 4.2, 1);

  const gold = new THREE.Sprite(goldMat);
  gold.position.set(1.35, 0.55, -1.6);
  gold.scale.set(2.8, 2.2, 1);

  return { blue, gold };
}

function createSoftTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createArcLines(count, rng) {
  const group = new THREE.Group();

  for (let i = 0; i < count; i += 1) {
    const y = -1.6 + (i / Math.max(count - 1, 1)) * 3.2;
    const radius = 0.55 + i * 0.14 + rng() * 0.12;
    const segments = 48;
    const pts = [];

    for (let s = 0; s <= segments; s += 1) {
      const t = s / segments;
      const angle = t * Math.PI * 1.35 + i * 0.4;
      pts.push(
        new THREE.Vector3(
          0.75 + Math.cos(angle) * radius + Math.sin(t * Math.PI) * 0.08,
          y + Math.sin(t * Math.PI * 2) * 0.06,
          -0.35 + Math.sin(angle) * radius * 0.45,
        ),
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? PALETTE.iceBlue : PALETTE.gold,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.chapter = i % 4;
    group.add(line);
  }

  return group;
}

export function createHeroThreeScene({ canvas, root }) {
  if (!canvas || !root) return null;

  let quality;
  try {
    quality = getQuality();
  } catch {
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: quality.desktop,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
  } catch {
    return null;
  }

  if (!renderer.getContext()) {
    renderer.dispose();
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.blackBlue, 0.048);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 32);
  const fieldRoot = new THREE.Group();
  const farLayer = new THREE.Group();
  const midLayer = new THREE.Group();
  const hazeLayer = new THREE.Group();
  const arcLayer = new THREE.Group();

  fieldRoot.add(farLayer, midLayer, hazeLayer, arcLayer);
  scene.add(fieldRoot);

  const pointTexture = createPointTexture();
  const softTexture = createSoftTexture();
  if (!pointTexture || !softTexture) {
    renderer.dispose();
    return null;
  }

  const rng = createRng(42857);
  const farParticles = createParticleLayer(quality.farCount, rng, pointTexture, {
    size: quality.mobile ? 0.028 : 0.034,
    baseOpacity: 0.38,
    layer: 'far',
  });
  const midParticles = createParticleLayer(quality.midCount, rng, pointTexture, {
    size: quality.mobile ? 0.042 : 0.052,
    baseOpacity: 0.52,
    layer: 'mid',
  });
  const haze = createHazeSprites(softTexture);
  const arcs = createArcLines(quality.arcCount, rng);

  farLayer.add(farParticles.points);
  midLayer.add(midParticles.points);
  hazeLayer.add(haze.blue, haze.gold);
  arcLayer.add(arcs);

  if (quality.mobile) {
    fieldRoot.position.set(0.15, 0.2, 0);
    fieldRoot.scale.setScalar(0.92);
  } else {
    fieldRoot.position.set(0.35, 0, 0);
  }

  const cameraPosition = [0, 0, 0];
  const cameraLook = [0, 0, 0];
  const lookAt = new THREE.Vector3();
  const cameraKeys = cameraKeyframes();

  let currentProgress = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;
  let pointerStrengthTarget = 0;
  let pointerStrengthCurrent = 0;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;
  let rafId = 0;

  function updateParticleLayer(layer, weights, progress, brandT, exitT, parallaxY, flowBoost) {
    const { positions, basePositions, colors, seeds, points, layer: layerName } = layer;
    const count = positions.length / 3;
    const isFar = layerName === 'far';

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const seedOffset = i * 4;
      const phase = seeds[seedOffset];
      const speed = seeds[seedOffset + 1];
      const cluster = seeds[seedOffset + 2];
      const goldish = seeds[seedOffset + 3] > 0.5;
      const chapterBoost = weights[cluster] ?? 0;

      const driftX = Math.sin(phase + progress * (isFar ? 2.8 : 4.2)) * 0.012 * (0.4 + chapterBoost);
      const driftY =
        Math.cos(phase * 0.6 + progress * (3.2 + flowBoost)) * 0.018 * (0.35 + chapterBoost) +
        parallaxY * (isFar ? 0.15 : 0.28);
      const driftZ = Math.cos(phase + progress * 2.1) * 0.008;

      positions[offset] = basePositions[offset] + driftX;
      positions[offset + 1] = basePositions[offset + 1] + driftY;
      positions[offset + 2] = basePositions[offset + 2] + driftZ;

      const source = goldish ? GOLD : ICE;
      const goldPulse = goldish ? chapterBoost * 0.45 : 0;
      const brightness =
        (isFar ? 0.1 : 0.18) +
        chapterBoost * (isFar ? 0.22 : 0.42) +
        goldPulse * 0.2 -
        brandT * 0.18 -
        exitT * 0.28;

      colors[offset] = lerp(source.r * 0.55, source.r, brightness);
      colors[offset + 1] = lerp(source.g * 0.55, source.g, brightness);
      colors[offset + 2] = lerp(source.b * 0.55, source.b, brightness);
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    points.material.opacity =
      (isFar ? 0.34 : 0.48) +
      weights.reduce((sum, w) => sum + w, 0) * (isFar ? 0.06 : 0.1) -
      brandT * (isFar ? 0.12 : 0.18) -
      exitT * (isFar ? 0.2 : 0.28);
  }

  function applySceneState() {
    const progress = currentProgress;
    const weights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(progress, start, end));
    const introT = smoothstep(0, 0.25, progress);
    const chapterT = smoothstep(0.27, 0.71, progress);
    const brandT = smoothstep(0.72, 0.93, progress);
    const exitT = smoothstep(0.93, 1, progress);
    const flowT = smoothstep(0.38, 0.49, progress);
    const connectT = smoothstep(0.49, 0.6, progress);
    const aiT = smoothstep(0.6, 0.71, progress);

    interpolateKeyframes(cameraKeys, progress, cameraPosition, cameraLook);

    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.08;
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.08;
    pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.06;

    const travelY = lerp(introT * 0.15, -1.65, chapterT) - brandT * 0.35 - exitT * 0.25;
    const flowBoost = flowT * 0.85 + connectT * 0.35;

    farLayer.position.y = travelY * 0.42;
    midLayer.position.y = travelY * 0.72;
    hazeLayer.position.y = travelY * 0.55;
    arcLayer.position.y = travelY * 0.58;

    farLayer.position.x = pointerCurrentX * 0.04 * pointerStrengthCurrent;
    midLayer.position.x = 0.08 + pointerCurrentX * 0.07 * pointerStrengthCurrent;
    arcLayer.position.x = pointerCurrentX * 0.05 * pointerStrengthCurrent;

    fieldRoot.rotation.y = 0.02 + chapterT * 0.04 - brandT * 0.03 + pointerCurrentX * 0.012 * pointerStrengthCurrent;
    fieldRoot.rotation.x = pointerCurrentY * 0.008 * pointerStrengthCurrent;

    updateParticleLayer(farParticles, weights, progress, brandT, exitT, travelY, flowBoost);
    updateParticleLayer(midParticles, weights, progress, brandT, exitT, travelY, flowBoost);

    haze.blue.material.opacity = 0.18 + chapterT * 0.06 - brandT * 0.1 - exitT * 0.08;
    haze.gold.material.opacity =
      0.04 + weights[0] * 0.05 + aiT * 0.03 - brandT * 0.03 - exitT * 0.04;
    haze.gold.position.y = 0.55 - chapterT * 0.35;

    arcs.children.forEach((line) => {
      const chapter = line.userData.chapter ?? 0;
      const active = weights[chapter] ?? 0;
      line.material.opacity =
        (0.035 + active * 0.07 + connectT * 0.03 + aiT * 0.025) *
        (1 - brandT * 0.5 - exitT * 0.45);
    });
    arcLayer.rotation.y = chapterT * 0.06 + connectT * 0.04;

    camera.position.set(
      cameraPosition[0] + pointerCurrentX * 0.03 * pointerStrengthCurrent,
      cameraPosition[1] + pointerCurrentY * 0.02 * pointerStrengthCurrent,
      cameraPosition[2],
    );
    lookAt.set(cameraLook[0], cameraLook[1], cameraLook[2]);
    camera.lookAt(lookAt);

    scene.fog.density = 0.048 + brandT * 0.018 + exitT * 0.032;
    renderer.toneMappingExposure = 0.82 - brandT * 0.12 - exitT * 0.18;
  }

  function draw() {
    applySceneState();
    renderer.render(scene, camera);
  }

  function renderFrame() {
    rafId = 0;

    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.04;
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.04;
    pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.05;

    const settling =
      Math.abs(pointerTargetX - pointerCurrentX) > 0.0003 ||
      Math.abs(pointerTargetY - pointerCurrentY) > 0.0003 ||
      Math.abs(pointerStrengthTarget - pointerStrengthCurrent) > 0.0003;

    if (settling && !disposed && visible) {
      draw();
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function invalidatePointer() {
    if (disposed || !visible) return;
    if (rafId) return;
    rafId = requestAnimationFrame(renderFrame);
  }

  function resize() {
    if (disposed) return;
    quality = getQuality();
    const width = canvas.clientWidth || root.clientWidth || 1;
    const height = canvas.clientHeight || root.clientHeight || 1;
    renderer.setPixelRatio(quality.dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    },
    { threshold: 0.03 },
  );
  intersectionObserver.observe(root);

  function onPointerMove(event) {
    if (!quality.pointerEnabled || !visible) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTargetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointerTargetY = THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
    pointerStrengthTarget = 1;
    invalidatePointer();
  }

  function onPointerLeave() {
    pointerTargetX = 0;
    pointerTargetY = 0;
    pointerStrengthTarget = 0;
    invalidatePointer();
  }

  function onContextLost(event) {
    event.preventDefault();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    root.classList.add('is-webgl-error');
    root.classList.remove('is-webgl-ready');
  }

  function onContextRestored() {
    if (disposed || restoredOnce) return;
    restoredOnce = true;
    resize();
    root.classList.remove('is-webgl-error');
    root.classList.add('is-webgl-ready');
  }

  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  if (quality.pointerEnabled) {
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
  }

  resize();

  return {
    setProgress(progress) {
      currentProgress = clamp01(progress);
      if (visible) draw();
    },

    resize,

    renderOnce() {
      pointerCurrentX = pointerTargetX;
      pointerCurrentY = pointerTargetY;
      pointerStrengthCurrent = pointerStrengthTarget;
      draw();
    },

    destroy() {
      if (disposed) return;
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);

      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);

      farParticles.points.geometry.dispose();
      farParticles.points.material.dispose();
      midParticles.points.geometry.dispose();
      midParticles.points.material.dispose();
      haze.blue.material.dispose();
      haze.gold.material.dispose();
      arcs.children.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      pointTexture.dispose();
      softTexture.dispose();
      renderer.dispose();

      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      return {
        farParticles: quality.farCount,
        midParticles: quality.midCount,
        arcs: quality.arcCount,
        bloom: false,
        dpr: quality.dpr,
      };
    },
  };
}
