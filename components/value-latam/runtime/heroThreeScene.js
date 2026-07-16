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
const GOLD = new THREE.Color(PALETTE.gold);

const FIELD_HEIGHT = 7.6;
const FIELD_MIN_Y = -3.8;

const LAYER_BOUNDS = {
  far: { x: [-5.5, 5.5], y: [-3.8, 3.8], z: [-5.0, -1.4], travel: 2.8 },
  mid: { x: [-4.8, 4.8], y: [-3.8, 3.8], z: [-3.0, -0.3], travel: 4.4 },
  near: { x: [-4.1, 4.1], y: [-3.8, 3.8], z: [-1.8, 0.5], travel: 6.0 },
};

const HAZE_TRAVEL = 2.1;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrapFieldY(baseY, travelY) {
  const localY =
    ((baseY + travelY - FIELD_MIN_Y) % FIELD_HEIGHT + FIELD_HEIGHT) % FIELD_HEIGHT;
  return FIELD_MIN_Y + localY;
}

function xIntensityFactor(x) {
  const t = clamp01((x + 5.5) / 11);
  if (t <= 0.5) return lerp(0.52, 0.75, t / 0.5);
  return lerp(0.75, 1.0, (t - 0.5) / 0.5);
}

function getQuality() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
  const desktop = !mobile && !tablet;

  return {
    mobile,
    tablet,
    desktop,
    farCount: mobile ? 220 : tablet ? 420 : 780,
    midCount: mobile ? 60 : tablet ? 110 : 175,
    nearCount: mobile ? 16 : tablet ? 28 : 45,
    farSize: mobile ? 0.028 : tablet ? 0.031 : 0.033,
    midSize: mobile ? 0.042 : tablet ? 0.047 : 0.05,
    nearSize: mobile ? 0.058 : tablet ? 0.066 : 0.072,
    farOpacity: mobile ? 0.46 : tablet ? 0.49 : 0.5,
    midOpacity: mobile ? 0.58 : tablet ? 0.61 : 0.63,
    nearOpacity: mobile ? 0.6 : tablet ? 0.63 : 0.66,
    dpr: mobile ? 1 : tablet ? 1.1 : Math.min(window.devicePixelRatio || 1, 1.35),
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

function sampleFieldPosition(rng, layerKey) {
  const bounds = LAYER_BOUNDS[layerKey];
  return {
    x: lerp(bounds.x[0], bounds.x[1], rng()),
    y: lerp(bounds.y[0], bounds.y[1], rng()),
    z: lerp(bounds.z[0], bounds.z[1], rng()),
  };
}

function createParticleLayer(count, rng, texture, { size, baseOpacity, layerKey }) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const meta = new Float32Array(count * 2);

  for (let i = 0; i < count; i += 1) {
    const { x, y, z } = sampleFieldPosition(rng, layerKey);
    const offset = i * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    basePositions.set([x, y, z], offset);

    const goldish = rng() > 0.87;
    const source = goldish ? GOLD : ICE;
    const xFactor = xIntensityFactor(x);
    const layerBase = layerKey === 'far' ? 0.22 : layerKey === 'mid' ? 0.32 : 0.38;
    const dim = (layerBase + rng() * 0.18) * xFactor;

    colors[offset] = source.r * dim;
    colors[offset + 1] = source.g * dim;
    colors[offset + 2] = source.b * dim;

    meta[i * 2] = i % 4;
    meta[i * 2 + 1] = goldish ? 1 : 0;
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
    blueMain: makeSprite(PALETTE.navyMedium, 0.22, [0.8, 0, -3], [10, 7]),
    blueSecondary: makeSprite(PALETTE.navyMedium, 0.09, [-2.2, 0.4, -4], [6, 5]),
    gold: makeSprite(PALETTE.gold, 0.045, [2.0, 0.2, -2.3], [4.5, 3.5]),
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
  renderer.toneMappingExposure = 0.88;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.blackBlue, 0.042);

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
  });
  const midParticles = createParticleLayer(quality.midCount, rng, pointTexture, {
    size: quality.midSize,
    baseOpacity: quality.midOpacity,
    layerKey: 'mid',
  });
  const nearParticles = createParticleLayer(quality.nearCount, rng, pointTexture, {
    size: quality.nearSize,
    baseOpacity: quality.nearOpacity,
    layerKey: 'near',
  });
  const haze = createHazeSprites(softTexture);

  const hazeLayer = new THREE.Group();
  hazeLayer.add(haze.blueMain, haze.blueSecondary, haze.gold);

  fieldRoot.add(
    farParticles.points,
    midParticles.points,
    nearParticles.points,
    hazeLayer,
  );

  if (quality.mobile) {
    fieldRoot.scale.setScalar(0.94);
  }

  let currentProgress = 0;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;

  const particleLayers = [farParticles, midParticles, nearParticles];

  function updateParticleLayer(layer, weights, progress, brandT, exitT) {
    const { positions, basePositions, colors, meta, points, layerKey, baseOpacity } = layer;
    const count = positions.length / 3;
    const travelY = -progress * LAYER_BOUNDS[layerKey].travel;
    const layerDimBase = layerKey === 'far' ? 0.22 : layerKey === 'mid' ? 0.32 : 0.38;

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const metaOffset = i * 2;
      const baseX = basePositions[offset];
      const baseY = basePositions[offset + 1];
      const baseZ = basePositions[offset + 2];
      const cluster = meta[metaOffset];
      const goldish = meta[metaOffset + 1] > 0.5;
      const chapterBoost = weights[cluster] ?? 0;

      positions[offset] = baseX;
      positions[offset + 1] = wrapFieldY(baseY, travelY);
      positions[offset + 2] = baseZ;

      const source = goldish ? GOLD : ICE;
      const xFactor = xIntensityFactor(baseX);
      const brightness =
        (layerDimBase + chapterBoost * (layerKey === 'far' ? 0.18 : 0.28)) *
        xFactor *
        (1 - brandT * 0.14 - exitT * 0.22);

      colors[offset] = source.r * brightness;
      colors[offset + 1] = source.g * brightness;
      colors[offset + 2] = source.b * brightness;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
    points.material.opacity = baseOpacity * (1 - brandT * 0.1 - exitT * 0.18);
  }

  function applySceneState() {
    const progress = currentProgress;
    const weights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(progress, start, end));
    const brandT = smoothstep(0.72, 0.93, progress);
    const exitT = smoothstep(0.93, 1, progress);
    const chapterT = smoothstep(0.27, 0.71, progress);

    particleLayers.forEach((layer) => {
      updateParticleLayer(layer, weights, progress, brandT, exitT);
    });

    hazeLayer.position.y = -progress * HAZE_TRAVEL;

    haze.blueMain.material.opacity = 0.22 * (1 - brandT * 0.12 - exitT * 0.1);
    haze.blueSecondary.material.opacity = 0.09 * (1 - brandT * 0.1 - exitT * 0.08);
    haze.gold.material.opacity =
      (0.045 + weights[0] * 0.018 + chapterT * 0.012) * (1 - brandT * 0.08 - exitT * 0.12);

    camera.position.set(0, 0.05, lerp(8.1, 8.5, brandT));
    camera.lookAt(0, 0, 0);

    scene.fog.density = 0.042 + brandT * 0.014 + exitT * 0.024;
    renderer.toneMappingExposure = 0.88 - brandT * 0.1 - exitT * 0.14;
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
        bloom: false,
        dpr: quality.dpr,
      };
    },
  };
}
