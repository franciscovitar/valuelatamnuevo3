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
const FOG_COLOR = new THREE.Color(PALETTE.blackBlue);

const FIELD_HEIGHT = 8.4;
const FIELD_MIN_Y = -4.2;

const LAYER_BOUNDS = {
  far: { x: [-6.5, 6.5], y: [-4.2, 4.2], z: [-6.0, -2.0], travel: 2.3 },
  mid: { x: [-5.5, 5.5], y: [-4.2, 4.2], z: [-2.5, 1.8], travel: 3.9 },
  near: { x: [-4.4, 4.4], y: [-4.2, 4.2], z: [2.0, 4.8], travel: 5.7 },
  bokeh: { x: [-3.8, 3.8], y: [-4.2, 4.2], z: [4.8, 6.3], travel: 6.8 },
};

const HAZE_TRAVEL = 1.8;

const CLOUD_CLUSTERS = [
  { cx: 2.4, cy: 0.6, cz: -3.2, rx: 3.8, ry: 2.6, rz: 1.8 },
  { cx: 1.8, cy: 2.6, cz: -4.0, rx: 3.2, ry: 1.6, rz: 1.4 },
  { cx: 3.0, cy: -1.2, cz: -1.8, rx: 2.8, ry: 2.2, rz: 1.6 },
  { cx: -0.8, cy: 1.0, cz: -2.8, rx: 2.0, ry: 2.4, rz: 1.2 },
];

const COLOR_TYPE = {
  ICE: 0,
  ICE_LIGHT: 1,
  GOLD: 2,
  IVORY: 3,
};

const PARTICLE_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aOpacity;
  attribute float aKind;
  attribute vec3 color;

  uniform float uPointScale;
  uniform float uSparkleScale;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vKind;
  varying float vDepth;

  void main() {
    vColor = color;
    vOpacity = aOpacity;
    vKind = aKind;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = max(-mvPosition.z, 0.15);
    gl_Position = projectionMatrix * mvPosition;

    float sizeMul = aKind > 0.5 ? uSparkleScale : 1.0;
    float pointSize = aSize * uPointScale * sizeMul / vDepth;
    gl_PointSize = clamp(pointSize, 0.45, 52.0);
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  uniform float uLayerOpacity;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFogMix;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vKind;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r2 = dot(uv, uv);
    float r = sqrt(r2);

    float core = exp(-r2 * 180.0);
    float inner = exp(-r2 * 44.0) * 0.21;
    float outer = exp(-r2 * 12.0) * 0.06;
    float alpha = (core * 0.92 + inner + outer) * vOpacity * uLayerOpacity;

    if (vKind > 0.5) {
      float crossH = exp(-abs(uv.y) * 100.0) * exp(-abs(uv.x) * 24.0) * 0.035;
      float crossV = exp(-abs(uv.x) * 100.0) * exp(-abs(uv.y) * 24.0) * 0.035;
      alpha += (crossH + crossV + core * 0.18) * vOpacity * uLayerOpacity;
    }

    alpha = clamp(alpha, 0.0, 1.0);
    if (alpha < 0.0015) discard;

    float fogFactor = 1.0 - clamp(exp(-uFogDensity * uFogDensity * vDepth * vDepth), 0.0, 1.0);
    vec3 lit = vColor * (0.88 + core * 0.22);
    lit = mix(lit, uFogColor, fogFactor * uFogMix);
    alpha *= 1.0 - fogFactor * uFogMix * 0.72;

    gl_FragColor = vec4(lit, alpha);
  }
`;

const BOKEH_FRAGMENT_SHADER = `
  uniform float uLayerOpacity;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFogMix;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vKind;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r2 = dot(uv, uv);

    float center = exp(-r2 * 4.2) * 0.22;
    float mid = exp(-r2 * 1.6) * 0.14;
    float edge = exp(-r2 * 0.55) * 0.08;
    float alpha = (center + mid + edge) * vOpacity * uLayerOpacity;

    alpha = clamp(alpha, 0.0, 1.0);
    if (alpha < 0.0008) discard;

    float fogFactor = 1.0 - clamp(exp(-uFogDensity * uFogDensity * vDepth * vDepth), 0.0, 1.0);
    vec3 lit = vColor * 0.92;
    lit = mix(lit, uFogColor, fogFactor * uFogMix * 0.35);
    alpha *= 1.0 - fogFactor * 0.18;

    gl_FragColor = vec4(lit, alpha);
  }
`;

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

function sampleParticleOpacity(rng) {
  const roll = rng();

  if (roll >= 0.992) {
    return lerp(0.82, 0.96, rng());
  }

  if (roll >= 0.96) {
    return lerp(0.58, 0.78, Math.pow(rng(), 0.65));
  }

  if (roll >= 0.82) {
    return lerp(0.28, 0.54, Math.pow(rng(), 0.85));
  }

  return lerp(0.045, 0.27, Math.pow(rng(), 2.4));
}

function sampleSizePx(layerKey, rng) {
  const u = rng();
  const body = Math.pow(u, 0.82);

  if (layerKey === 'far') {
    const size = lerp(0.65, 1.25, body);
    return u > 0.985 ? Math.min(size + lerp(0, 0.35, (u - 0.985) / 0.015), 1.6) : size;
  }
  if (layerKey === 'mid') {
    const size = lerp(1.0, 2.05, body);
    return u > 0.972 ? Math.min(size + lerp(0, 0.55, (u - 0.972) / 0.028), 2.6) : size;
  }
  if (layerKey === 'near') {
    const size = lerp(1.7, 3.2, body);
    return u > 0.965 ? Math.min(size + lerp(0, 1.0, (u - 0.965) / 0.035), 4.2) : size;
  }
  return lerp(10, 22, Math.pow(rng(), 0.72));
}

function pickColorType(rng, layerKey) {
  const roll = rng();

  if (layerKey === 'far') {
    if (roll > 0.992) return COLOR_TYPE.GOLD;
    if (roll > 0.84) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (layerKey === 'mid') {
    if (roll > 0.985) return COLOR_TYPE.GOLD;
    if (roll > 0.36) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (layerKey === 'near') {
    if (roll > 0.972) return COLOR_TYPE.GOLD;
    if (roll > 0.9) return COLOR_TYPE.IVORY;
    if (roll > 0.32) return COLOR_TYPE.ICE_LIGHT;
    return COLOR_TYPE.ICE;
  }

  if (roll > 0.88) return COLOR_TYPE.GOLD;
  return COLOR_TYPE.ICE_LIGHT;
}

function colorFromType(type) {
  if (type === COLOR_TYPE.GOLD) return GOLD;
  if (type === COLOR_TYPE.ICE_LIGHT) return ICE_LIGHT;
  if (type === COLOR_TYPE.IVORY) return IVORY;
  return ICE;
}

function clampToBounds(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sampleOrganicPosition(rng, layerKey) {
  const bounds = LAYER_BOUNDS[layerKey];
  const clusterChance =
    layerKey === 'far' ? 0.14 : layerKey === 'mid' ? 0.1 : 0.05;

  if (rng() >= clusterChance) {
    return {
      x: lerp(bounds.x[0], bounds.x[1], rng()),
      y: lerp(bounds.y[0], bounds.y[1], rng()),
      z: lerp(bounds.z[0], bounds.z[1], rng()),
    };
  }

  const cloud = CLOUD_CLUSTERS[Math.floor(rng() * CLOUD_CLUSTERS.length)];
  const jitter = () => (rng() + rng() + rng() - 1.5) / 1.5;

  return {
    x: clampToBounds(cloud.cx + jitter() * cloud.rx, bounds.x[0], bounds.x[1]),
    y: clampToBounds(cloud.cy + jitter() * cloud.ry, bounds.y[0], bounds.y[1]),
    z: clampToBounds(cloud.cz + jitter() * cloud.rz, bounds.z[0], bounds.z[1]),
  };
}

function sampleBokehPosition(rng, layerKey) {
  const bounds = LAYER_BOUNDS[layerKey];
  let x;
  let y;

  if (rng() < 0.38) {
    const edge = rng() < 0.5 ? bounds.x[0] : bounds.x[1];
    x = edge + (rng() < 0.5 ? -1 : 1) * rng() * 0.55;
    y = lerp(bounds.y[0], bounds.y[1], rng());
  } else {
    x = lerp(bounds.x[0], bounds.x[1], rng());
    y = lerp(bounds.y[0], bounds.y[1], rng());
  }

  return {
    x: clampToBounds(x, bounds.x[0], bounds.x[1]),
    y: clampToBounds(y, bounds.y[0], bounds.y[1]),
    z: lerp(bounds.z[0], bounds.z[1], rng()),
  };
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
      farCount: 180,
      midCount: 44,
      nearCount: 14,
      bokehCount: 4,
      farOpacity: 0.52,
      midOpacity: 0.64,
      nearOpacity: 0.72,
      bokehOpacity: 0.055,
      dpr: 1,
    };
  }

  if (tablet) {
    return {
      mobile: false,
      tablet: true,
      desktop: false,
      farCount: 380,
      midCount: 92,
      nearCount: 28,
      bokehCount: 6,
      farOpacity: 0.56,
      midOpacity: 0.68,
      nearOpacity: 0.77,
      bokehOpacity: 0.07,
      dpr: 1.1,
    };
  }

  return {
    mobile: false,
    tablet: false,
    desktop: true,
    farCount: 680,
    midCount: 160,
    nearCount: 48,
    bokehCount: 10,
    farOpacity: 0.58,
    midOpacity: 0.7,
    nearOpacity: 0.8,
    bokehOpacity: 0.075,
    dpr: Math.min(window.devicePixelRatio || 1, 1.35),
  };
}

function createSoftTexture(size = 192) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,0.28)');
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.14)');
  gradient.addColorStop(0.42, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(0.72, 'rgba(255,255,255,0.012)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function computePointScale(camera, height, dpr) {
  const fovRad = (camera.fov * Math.PI) / 180;
  return (height * dpr) / (2 * Math.tan(fovRad * 0.5));
}

function createShaderMaterial({
  fragmentShader,
  baseOpacity,
  blending,
  fogMix,
}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPointScale: { value: 1 },
      uSparkleScale: { value: 1.18 },
      uLayerOpacity: { value: baseOpacity },
      uFogColor: { value: FOG_COLOR.clone() },
      uFogDensity: { value: 0.026 },
      uFogMix: { value: fogMix },
    },
    vertexShader: PARTICLE_VERTEX_SHADER,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending,
  });
}

function createShaderParticleLayer(count, rng, { baseOpacity, layerKey, fogMix }) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const aSizes = new Float32Array(count);
  const aOpacities = new Float32Array(count);
  const aKinds = new Float32Array(count);
  const meta = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const { x, y, z } = sampleOrganicPosition(rng, layerKey);
    const offset = i * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    basePositions.set([x, y, z], offset);

    const colorType = pickColorType(rng, layerKey);
    const source = colorFromType(colorType);
    const particleOpacity = sampleParticleOpacity(rng);
    const xFactor = xIntensityFactor(x);
    const colorGain = lerp(0.72, 1.08, Math.pow(rng(), 1.6)) * xFactor;

    colors[offset] = source.r * colorGain;
    colors[offset + 1] = source.g * colorGain;
    colors[offset + 2] = source.b * colorGain;

    aSizes[i] = sampleSizePx(layerKey, rng);
    aOpacities[i] = particleOpacity;
    aKinds[i] = rng() < 0.018 ? 1 : 0;

    meta[i * 3] = i % 4;
    meta[i * 3 + 1] = colorType;
    meta[i * 3 + 2] = colorGain;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSizes, 1));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(aOpacities, 1));
  geometry.setAttribute('aKind', new THREE.BufferAttribute(aKinds, 1));

  const material = createShaderMaterial({
    fragmentShader: PARTICLE_FRAGMENT_SHADER,
    baseOpacity,
    blending: THREE.AdditiveBlending,
    fogMix,
  });

  return {
    points: new THREE.Points(geometry, material),
    positions,
    basePositions,
    colors,
    aOpacities,
    meta,
    layerKey,
    baseOpacity,
    isBokeh: false,
  };
}

function createBokehLayer(count, rng, { baseOpacity }) {
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const aSizes = new Float32Array(count);
  const aOpacities = new Float32Array(count);
  const aKinds = new Float32Array(count);
  const meta = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const { x, y, z } = sampleBokehPosition(rng, 'bokeh');
    const offset = i * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    basePositions.set([x, y, z], offset);

    const colorType = pickColorType(rng, 'bokeh');
    const source = colorFromType(colorType);
    const xFactor = xIntensityFactor(x);
    const colorGain = lerp(0.55, 0.82, Math.pow(rng(), 1.4)) * xFactor;

    colors[offset] = source.r * colorGain;
    colors[offset + 1] = source.g * colorGain;
    colors[offset + 2] = source.b * colorGain;

    aSizes[i] = sampleSizePx('bokeh', rng);
    aOpacities[i] = lerp(0.025, 0.09, Math.pow(rng(), 1.35));
    aKinds[i] = 0;

    meta[i * 3] = i % 4;
    meta[i * 3 + 1] = colorType;
    meta[i * 3 + 2] = colorGain;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(aSizes, 1));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(aOpacities, 1));
  geometry.setAttribute('aKind', new THREE.BufferAttribute(aKinds, 1));

  const material = createShaderMaterial({
    fragmentShader: BOKEH_FRAGMENT_SHADER,
    baseOpacity,
    blending: THREE.NormalBlending,
    fogMix: 0.22,
  });

  return {
    points: new THREE.Points(geometry, material),
    positions,
    basePositions,
    colors,
    aOpacities,
    meta,
    layerKey: 'bokeh',
    baseOpacity,
    isBokeh: true,
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
    blueMain: makeSprite(PALETTE.navyMedium, 0.24, [0.8, 0, -3], [11, 7.5]),
    blueSecondary: makeSprite(PALETTE.navyMedium, 0.1, [-2.2, 0.4, -4], [7, 5.5]),
    gold: makeSprite(PALETTE.gold, 0.045, [2.0, 0.2, -2.3], [5, 4]),
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

  const softTexture = createSoftTexture();
  if (!softTexture) {
    renderer.dispose();
    return null;
  }

  const rng = createRng(42857);
  const farParticles = createShaderParticleLayer(quality.farCount, rng, {
    baseOpacity: quality.farOpacity,
    layerKey: 'far',
    fogMix: 0.92,
  });
  const midParticles = createShaderParticleLayer(quality.midCount, rng, {
    baseOpacity: quality.midOpacity,
    layerKey: 'mid',
    fogMix: 0.58,
  });
  const nearParticles = createShaderParticleLayer(quality.nearCount, rng, {
    baseOpacity: quality.nearOpacity,
    layerKey: 'near',
    fogMix: 0.28,
  });
  const bokehParticles = createBokehLayer(quality.bokehCount, rng, {
    baseOpacity: quality.bokehOpacity,
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

  function syncShaderUniforms(brandT, exitT) {
    const fogDensity = 0.026 + brandT * 0.016 + exitT * 0.028;
    const height = canvas.clientHeight || root.clientHeight || 1;
    const pointScale = computePointScale(camera, height, quality.dpr);

    particleLayers.forEach((layer) => {
      const { uniforms } = layer.points.material;
      uniforms.uPointScale.value = pointScale;
      uniforms.uFogDensity.value = fogDensity;
      uniforms.uLayerOpacity.value =
        layer.baseOpacity * (1 - brandT * 0.08 - exitT * 0.14);
    });
  }

  function updateParticleLayer(layer, weights, brandT, exitT, progress) {
    const { positions, basePositions, colors, meta, points, layerKey } = layer;
    const count = positions.length / 3;
    const travelY = -progress * LAYER_BOUNDS[layerKey].travel;
    const fade = 1 - brandT * 0.1 - exitT * 0.16;
    const chapterCap = layer.isBokeh ? 0.06 : 0.14;

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const metaOffset = i * 3;
      const baseX = basePositions[offset];
      const baseY = basePositions[offset + 1];
      const baseZ = basePositions[offset + 2];
      const cluster = meta[metaOffset];
      const colorType = meta[metaOffset + 1];
      const colorGain = meta[metaOffset + 2];
      const chapterBoost = Math.min(chapterCap, (weights[cluster] ?? 0) * (chapterCap * 0.85));

      positions[offset] = baseX;
      positions[offset + 1] = wrapFieldY(baseY, travelY);
      positions[offset + 2] = baseZ;

      const source = colorFromType(colorType);
      const xFactor = xIntensityFactor(baseX);
      const strength = (colorGain + chapterBoost) * xFactor * fade;

      colors[offset] = source.r * strength;
      colors[offset + 1] = source.g * strength;
      colors[offset + 2] = source.b * strength;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;
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

    syncShaderUniforms(brandT, exitT);

    hazeLayer.position.y = -progress * HAZE_TRAVEL;

    haze.blueMain.material.opacity = 0.24 * (1 - brandT * 0.1 - exitT * 0.08);
    haze.blueSecondary.material.opacity = 0.1 * (1 - brandT * 0.08 - exitT * 0.06);
    haze.gold.material.opacity =
      (0.045 + weights[0] * 0.015 + chapterT * 0.01) * (1 - brandT * 0.06 - exitT * 0.1);

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
