import * as THREE from 'three';
import {
  CHAPTER_WINDOWS,
  PALETTE,
  chapterWeight,
  clamp01,
  createRng,
  smoothstep,
} from './heroThreeGeometry';

const ICE = new THREE.Color(PALETTE.iceBlue);
const ICE_LIGHT = new THREE.Color(PALETTE.iceLight);
const GOLD = new THREE.Color(PALETTE.gold);
const IVORY = new THREE.Color(PALETTE.ivory);

const FIELD_HEIGHT = 8.4;
const FIELD_MIN_Y = -4.2;

const LAYER_BOUNDS = {
  far: { x: [-6.5, 6.5], y: [-4.2, 4.2], z: [-6.0, -2.0], travel: 2.3 },
  mid: { x: [-5.5, 5.5], y: [-4.2, 4.2], z: [-2.5, 1.8], travel: 3.9 },
  near: { x: [-4.4, 4.4], y: [-4.2, 4.2], z: [2.0, 4.8], travel: 5.7 },
  bokeh: { x: [-3.8, 3.8], y: [-4.2, 4.2], z: [4.8, 6.3], travel: 6.8 },
};

const HAZE_TRAVEL = 1.8;

const COLOR_TYPE = {
  ICE: 0,
  ICE_LIGHT: 1,
  GOLD: 2,
  IVORY: 3,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrapFieldY(baseY, travelY) {
  const localY =
    ((baseY + travelY - FIELD_MIN_Y) % FIELD_HEIGHT + FIELD_HEIGHT) % FIELD_HEIGHT;
  return FIELD_MIN_Y + localY;
}

function xIntensityFactor(x) {
  const t = clamp01((x + 6.5) / 13);
  if (t <= 0.5) return lerp(0.55, 0.78, t / 0.5);
  return lerp(0.78, 1.0, (t - 0.5) / 0.5);
}

function layerBaseStrength(layerKey, rng) {
  if (layerKey === 'far') return 0.48 + rng() * 0.24;
  if (layerKey === 'mid') return 0.65 + rng() * 0.23;
  if (layerKey === 'near') return 0.78 + rng() * 0.22;
  return 0.18 + rng() * 0.17;
}

function pickColorType(rng, layerKey) {
  const roll = rng();

  if (layerKey === 'far') {
    if (roll > 0.96) return COLOR_TYPE.GOLD;
    if (roll > 0.92) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (layerKey === 'mid') {
    if (roll > 0.97) return COLOR_TYPE.GOLD;
    if (roll > 0.42) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (layerKey === 'near') {
    if (roll > 0.975) return COLOR_TYPE.GOLD;
    if (roll > 0.9) return COLOR_TYPE.IVORY;
    if (roll > 0.28) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (roll > 0.78) return COLOR_TYPE.GOLD;
  return COLOR_TYPE.ICE_LIGHT;
}

function colorFromType(type) {
  if (type === COLOR_TYPE.GOLD) return GOLD;
  if (type === COLOR_TYPE.ICE_LIGHT) return ICE_LIGHT;
  if (type === COLOR_TYPE.IVORY) return IVORY;
  return ICE;
}

function getQuality() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
  const desktop = !mobile && !tablet;

  if (mobile) {
    return {
      mobile: true,
      tablet: false,
      desktop: false,
      farCount: 260,
      midCount: 80,
      nearCount: 28,
      bokehCount: 8,
      farSize: 0.032,
      midSize: 0.052,
      nearSize: 0.074,
      bokehSize: 0.095,
      farOpacity: 0.62,
      midOpacity: 0.72,
      nearOpacity: 0.8,
      bokehOpacity: 0.1,
      dpr: 1,
    };
  }

  if (tablet) {
    return {
      mobile: false,
      tablet: true,
      desktop: false,
      farCount: 520,
      midCount: 150,
      nearCount: 55,
      bokehCount: 14,
      farSize: 0.035,
      midSize: 0.058,
      nearSize: 0.082,
      bokehSize: 0.105,
      farOpacity: 0.65,
      midOpacity: 0.75,
      nearOpacity: 0.83,
      bokehOpacity: 0.11,
      dpr: 1.1,
    };
  }

  return {
    mobile: false,
    tablet: false,
    desktop: true,
    farCount: 900,
    midCount: 260,
    nearCount: 90,
    bokehCount: 22,
    farSize: 0.038,
    midSize: 0.064,
    nearSize: 0.09,
    bokehSize: 0.115,
    farOpacity: 0.68,
    midOpacity: 0.78,
    nearOpacity: 0.86,
    bokehOpacity: 0.12,
    dpr: Math.min(window.devicePixelRatio || 1, 1.35),
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
  gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSoftTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.14)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sampleFieldPosition(rng, layerKey) {
  const bounds = LAYER_BOUNDS[layerKey];
  return {
    x: lerp(bounds.x[0], bounds.x[1], rng()),
    y: lerp(bounds.y[0], bounds.y[1], rng()),
    z: lerp(bounds.z[0], bounds.z[1], rng()),
  };
}

function createParticleLayer(count, rng, texture, { size, baseOpacity, layerKey, blending }) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const meta = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const { x, y, z } = sampleFieldPosition(rng, layerKey);
    const offset = i * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    basePositions.set([x, y, z], offset);

    const colorType = pickColorType(rng, layerKey);
    const source = colorFromType(colorType);
    const baseStrength = layerBaseStrength(layerKey, rng);
    const xFactor = xIntensityFactor(x);

    colors[offset] = source.r * baseStrength * xFactor;
    colors[offset + 1] = source.g * baseStrength * xFactor;
    colors[offset + 2] = source.b * baseStrength * xFactor;

    meta[i * 3] = i % 4;
    meta[i * 3 + 1] = colorType;
    meta[i * 3 + 2] = baseStrength;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    map: texture,
    alphaTest: blending === THREE.NormalBlending ? 0.001 : 0.015,
    vertexColors: true,
    transparent: true,
    opacity: baseOpacity,
    depthWrite: false,
    depthTest: true,
    blending,
  });

  return {
    points: new THREE.Points(geometry, material),
    positions,
    basePositions,
    colors,
    meta,
    layerKey,
    baseOpacity,
  };
}

function createHazeSprites(softTexture) {
  const makeSprite = (color, opacity, position, scale) => {
    const material = new THREE.SpriteMaterial({
      map: softTexture,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(position[0], position[1], position[2]);
    sprite.scale.set(scale[0], scale[1], 1);
    return sprite;
  };

  return {
    blueMain: makeSprite(PALETTE.navyMedium, 0.3, [0.8, 0, -3], [11, 7.5]),
    blueSecondary: makeSprite(PALETTE.navyMedium, 0.14, [-2.2, 0.4, -4], [7, 5.5]),
    gold: makeSprite(PALETTE.gold, 0.06, [2.0, 0.2, -2.3], [5, 4]),
  };
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
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.blackBlue, 0.026);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 32);
  camera.position.set(0, 0.05, 8.1);
  camera.lookAt(0, 0, 0);

  const fieldRoot = new THREE.Group();
  fieldRoot.position.set(0, 0, 0);
  scene.add(fieldRoot);

  const pointTexture = createPointTexture();
  const softTexture = createSoftTexture();
  if (!pointTexture || !softTexture) {
    renderer.dispose();
    return null;
  }

  const rng = createRng(42857);
  const farParticles = createParticleLayer(quality.farCount, rng, pointTexture, {
    size: quality.farSize,
    baseOpacity: quality.farOpacity,
    layerKey: 'far',
    blending: THREE.AdditiveBlending,
  });
  const midParticles = createParticleLayer(quality.midCount, rng, pointTexture, {
    size: quality.midSize,
    baseOpacity: quality.midOpacity,
    layerKey: 'mid',
    blending: THREE.AdditiveBlending,
  });
  const nearParticles = createParticleLayer(quality.nearCount, rng, pointTexture, {
    size: quality.nearSize,
    baseOpacity: quality.nearOpacity,
    layerKey: 'near',
    blending: THREE.AdditiveBlending,
  });
  const bokehParticles = createParticleLayer(quality.bokehCount, rng, softTexture, {
    size: quality.bokehSize,
    baseOpacity: quality.bokehOpacity,
    layerKey: 'bokeh',
    blending: THREE.NormalBlending,
  });

  const haze = createHazeSprites(softTexture);
  const hazeLayer = new THREE.Group();
  hazeLayer.add(haze.blueMain, haze.blueSecondary, haze.gold);

  fieldRoot.add(
    farParticles.points,
    midParticles.points,
    nearParticles.points,
    bokehParticles.points,
    hazeLayer,
  );

  if (quality.mobile) {
    fieldRoot.scale.setScalar(0.94);
  }

  let currentProgress = 0;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;

  const particleLayers = [farParticles, midParticles, nearParticles, bokehParticles];

  function updateParticleLayer(layer, weights, brandT, exitT, progress) {
    const { positions, basePositions, colors, meta, points, layerKey, baseOpacity } = layer;
    const count = positions.length / 3;
    const travelY = -progress * LAYER_BOUNDS[layerKey].travel;

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const metaOffset = i * 3;
      const baseX = basePositions[offset];
      const baseY = basePositions[offset + 1];
      const baseZ = basePositions[offset + 2];
      const cluster = meta[metaOffset];
      const colorType = meta[metaOffset + 1];
      const baseStrength = meta[metaOffset + 2];
      const chapterBoost = Math.min(0.18, (weights[cluster] ?? 0) * 0.16);

      positions[offset] = baseX;
      positions[offset + 1] = wrapFieldY(baseY, travelY);
      positions[offset + 2] = baseZ;

      const source = colorFromType(colorType);
      const xFactor = xIntensityFactor(baseX);
      const fade = 1 - brandT * 0.1 - exitT * 0.16;
      const strength = (baseStrength + chapterBoost) * xFactor * fade;

      colors[offset] = source.r * strength;
      colors[offset + 1] = source.g * strength;
      colors[offset + 2] = source.b * strength;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    points.material.opacity = baseOpacity * (1 - brandT * 0.08 - exitT * 0.14);
  }

  function applySceneState() {
    const progress = currentProgress;
    const weights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(progress, start, end));
    const brandT = smoothstep(0.72, 0.93, progress);
    const exitT = smoothstep(0.93, 1, progress);
    const chapterT = smoothstep(0.27, 0.71, progress);

    particleLayers.forEach((layer) => {
      updateParticleLayer(layer, weights, brandT, exitT, progress);
    });

    hazeLayer.position.y = -progress * HAZE_TRAVEL;

    haze.blueMain.material.opacity = 0.3 * (1 - brandT * 0.1 - exitT * 0.08);
    haze.blueSecondary.material.opacity = 0.14 * (1 - brandT * 0.08 - exitT * 0.06);
    haze.gold.material.opacity =
      (0.06 + weights[0] * 0.015 + chapterT * 0.01) * (1 - brandT * 0.06 - exitT * 0.1);

    camera.position.set(0, 0.05, 8.1);
    camera.lookAt(0, 0, 0);

    scene.fog.density = 0.026 + brandT * 0.016 + exitT * 0.028;
    renderer.toneMappingExposure = 1.05 - brandT * 0.12 - exitT * 0.18;
  }

  function draw() {
    applySceneState();
    renderer.render(scene, camera);
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

  function onContextLost(event) {
    event.preventDefault();
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

  resize();

  return {
    setProgress(progress) {
      currentProgress = clamp01(progress);
      if (visible) draw();
    },

    resize,

    renderOnce() {
      draw();
    },

    destroy() {
      if (disposed) return;
      disposed = true;

      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      particleLayers.forEach((layer) => {
        layer.points.geometry.dispose();
        layer.points.material.dispose();
      });

      haze.blueMain.material.dispose();
      haze.blueSecondary.material.dispose();
      haze.gold.material.dispose();
      pointTexture.dispose();
      softTexture.dispose();
      renderer.dispose();

      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      return {
        farParticles: quality.farCount,
        midParticles: quality.midCount,
        nearParticles: quality.nearCount,
        bokehParticles: quality.bokehCount,
        bloom: false,
        dpr: quality.dpr,
      };
    },
  };
}
