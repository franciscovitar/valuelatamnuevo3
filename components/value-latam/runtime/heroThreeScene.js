import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  CHAPTER_WINDOWS,
  PALETTE,
  cameraKeyframes,
  chapterWeight,
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
    filamentCount: mobile ? 8 : tablet ? 11 : 14,
    tubeSegments: mobile ? 48 : tablet ? 64 : 80,
    tubeRadial: mobile ? 6 : tablet ? 6 : 7,
    tubeRadius: mobile ? 0.014 : tablet ? 0.016 : 0.018,
    particleCount: mobile ? 72 : tablet ? 160 : 320,
    arcCount: mobile ? 4 : tablet ? 7 : 10,
    dpr: mobile ? 1 : tablet ? 1.1 : Math.min(window.devicePixelRatio || 1, 1.35),
    bloom: false,
    pointerEnabled: window.matchMedia(POINTER_QUERY).matches,
  };
}

function generateFilamentPoints(index, total, rng) {
  const points = [];
  const nodeCount = 8 + (index % 3);
  const yMin = -1.95;
  const yMax = 2.45;
  const phase = index * 0.81 + rng() * 0.6;
  const lane = index / Math.max(total - 1, 1);
  const baseX = 0.36 + lane * 0.5 + (rng() - 0.5) * 0.16;
  const baseZ = -0.52 + (index % 4) * 0.18 + (rng() - 0.5) * 0.36;
  const ampX = 0.11 + rng() * 0.15;
  const ampZ = 0.08 + rng() * 0.13;

  for (let i = 0; i < nodeCount; i += 1) {
    const t = i / (nodeCount - 1);
    const y = yMin + t * (yMax - yMin);
    const pinch = 0.88 + Math.sin(t * Math.PI) * 0.14;
    const weaveX =
      Math.sin(t * Math.PI * (2.05 + index * 0.11) + phase) * ampX * pinch +
      Math.sin(t * Math.PI * 4.2 + phase * 1.3) * ampX * 0.22;
    const weaveZ =
      Math.cos(t * Math.PI * 1.65 + phase * 0.85) * ampZ +
      Math.sin(t * Math.PI * 3.1 + phase) * ampZ * 0.35;

    points.push(new THREE.Vector3(baseX + weaveX, y, baseZ + weaveZ));
  }

  return points;
}

function initTubeColors(geometry, baseColor, progressAttr) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return { colors, progressAttr };
}

function updateEmissiveColors(colorArray, progressAttr, activeWeight, lightPos, memory) {
  for (let i = 0; i < progressAttr.length; i += 1) {
    const p = progressAttr[i];
    const dist = p - lightPos;
    const band = Math.exp(-(dist * dist) / 0.022) * activeWeight;
    const mem = memory * 0.14 * Math.exp(-((p - 0.65) ** 2) / 0.1);
    const intensity = Math.min(0.72, band * 0.62 + mem * 0.85);

    const mix = activeWeight > 0.01 ? Math.min(1, band * 1.15) : 0;
    colorArray[i * 3] = lerp(ICE.r * 0.55, GOLD.r * 0.82, mix) * intensity;
    colorArray[i * 3 + 1] = lerp(ICE.g * 0.55, GOLD.g * 0.82, mix) * intensity;
    colorArray[i * 3 + 2] = lerp(ICE.b * 0.55, GOLD.b * 0.82, mix) * intensity;
  }
}

function createFilament(def, quality) {
  const curve = new THREE.CatmullRomCurve3(def.points, false, 'catmullrom', 0.42);
  const geometry = new THREE.TubeGeometry(
    curve,
    quality.tubeSegments,
    def.radius * quality.tubeRadius,
    quality.tubeRadial,
    false,
  );

  const progressAttr = new Float32Array(geometry.attributes.position.count);
  const positions = geometry.attributes.position;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (let i = 0; i < positions.count; i += 1) {
    const y = positions.getY(i);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }

  const ySpan = yMax - yMin || 1;
  for (let i = 0; i < positions.count; i += 1) {
    progressAttr[i] = (positions.getY(i) - yMin) / ySpan;
  }
  geometry.setAttribute('aProgress', new THREE.BufferAttribute(progressAttr, 1));

  const baseColor = new THREE.Color(def.baseHex);
  const { colors } = initTubeColors(geometry, baseColor, progressAttr);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.18,
    roughness: 0.68,
    clearcoat: 0.14,
    clearcoatRoughness: 0.62,
    transparent: true,
    opacity: 0.48,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  const glowGeo = geometry.clone();
  const glowColors = new Float32Array(colors.length);
  glowGeo.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: true,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const glow = new THREE.Mesh(glowGeo, glowMat);
  const group = new THREE.Group();
  group.add(mesh, glow);

  return {
    group,
    mesh,
    glow,
    glowColors,
    progressAttr: glowGeo.attributes.aProgress.array,
    curve,
    def,
    spreadAxis: def.spreadAxis,
    spreadAmount: def.spreadAmount,
  };
}

function buildFilaments(count, quality, rng) {
  const palette = [PALETTE.navyDark, PALETTE.navy, PALETTE.navyMedium, 0x0d2844];
  const filaments = [];

  for (let i = 0; i < count; i += 1) {
    const points = generateFilamentPoints(i, count, rng);
    filaments.push(
      createFilament(
        {
          index: i,
          chapter: i % 4,
          points,
          baseHex: palette[i % palette.length],
          radius: 0.82 + (i % 3) * 0.1 + rng() * 0.14,
          spreadAxis: i % 2 === 0 ? 'x' : 'z',
          spreadAmount: 0.08 + (i % 5) * 0.022,
          phase: rng() * Math.PI * 2,
        },
        quality,
      ),
    );
  }

  return filaments;
}

function createParticleField(count, rng, bounds) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const cluster = i % 4;
    const angle = rng() * Math.PI * 2;
    const radius = 0.15 + rng() * 0.55;
    const y = lerp(bounds.yMin, bounds.yMax, rng());

    positions[i * 3] = bounds.cx + Math.cos(angle) * radius + (rng() - 0.5) * 0.35;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = bounds.cz + Math.sin(angle) * radius * 0.65 + (rng() - 0.5) * 0.28;

    const goldish = rng() > 0.82;
    const c = goldish ? GOLD : ICE;
    const dim = 0.35 + rng() * 0.55;
    colors[i * 3] = c.r * dim;
    colors[i * 3 + 1] = c.g * dim;
    colors[i * 3 + 2] = c.b * dim;

    seeds[i * 3] = rng() * Math.PI * 2;
    seeds[i * 3 + 1] = 0.4 + rng() * 0.8;
    seeds[i * 3 + 2] = cluster;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.028,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { points: new THREE.Points(geometry, material), seeds, positions, basePositions: positions.slice(), colors };
}

function createArcLines(count, rng) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: PALETTE.iceBlue,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (let i = 0; i < count; i += 1) {
    const y = -0.6 + (i / Math.max(count - 1, 1)) * 2.4;
    const pts = [];
    const segments = 12;
    for (let s = 0; s <= segments; s += 1) {
      const t = s / segments;
      const x = 0.35 + t * 0.95 + Math.sin(t * Math.PI * 2 + i) * 0.08;
      const z = -0.2 + Math.sin(t * Math.PI + rng() * 0.5) * 0.35;
      pts.push(new THREE.Vector3(x, y + Math.sin(t * Math.PI) * 0.12, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(geo, material.clone()));
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
  renderer.toneMappingExposure = 0.88;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.blackBlue, 0.075);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.12, 40);
  const sculptureGroup = new THREE.Group();
  const filamentGroup = new THREE.Group();
  sculptureGroup.add(filamentGroup);
  scene.add(sculptureGroup);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  envScene.dispose?.();

  const hemi = new THREE.HemisphereLight(PALETTE.iceBlue, PALETTE.blackBlue, 0.34);
  const key = new THREE.DirectionalLight(0x9ec0e6, 0.42);
  key.position.set(2.4, 4.8, 3.2);
  const rim = new THREE.DirectionalLight(PALETTE.gold, 0.18);
  rim.position.set(-1.8, 2.2, -2.4);
  const accent = new THREE.PointLight(PALETTE.gold, 0.15, 8);
  accent.position.set(0.85, 1.2, 0.35);
  scene.add(hemi, key, rim, accent);

  const rng = createRng(42857);
  const filaments = buildFilaments(quality.filamentCount, quality, rng);
  filaments.forEach((filament) => filamentGroup.add(filament.group));

  const arcLines = createArcLines(quality.arcCount, rng);
  sculptureGroup.add(arcLines);

  const particleField = createParticleField(
    quality.particleCount,
    rng,
    { cx: 0.72, cz: -0.08, yMin: -1.4, yMax: 2.1 },
  );
  sculptureGroup.add(particleField.points);

  if (quality.mobile) {
    sculptureGroup.position.set(0.28, 0.35, 0);
    sculptureGroup.rotation.y = 0.32;
    sculptureGroup.scale.setScalar(0.86);
  } else if (quality.tablet) {
    sculptureGroup.position.set(0.38, 0.08, 0);
    sculptureGroup.rotation.y = 0.38;
    sculptureGroup.scale.setScalar(0.92);
  } else {
    sculptureGroup.position.set(0.18, -0.08, 0);
    sculptureGroup.rotation.y = 0.42;
  }

  let composer = null;
  let bloomPass = null;
  if (quality.bloom) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.42, 0.84);
    composer.addPass(bloomPass);
  }

  let currentProgress = 0;
  let pointerTarget = { x: 0, y: 0 };
  let pointerCurrent = { x: 0, y: 0 };
  let pointerStrengthTarget = 0;
  let pointerStrengthCurrent = 0;

  let rafId = 0;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;

  const camPos = [0, 0, 0];
  const camLook = [0, 0, 0];
  const lookAt = new THREE.Vector3();
  const camKeys = cameraKeyframes();

  function applySceneState() {
    const p = currentProgress;
    const weights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(p, start, end));
    const brandT = smoothstep(0.72, 0.93, p);
    const exitT = smoothstep(0.93, 1, p);
    const introT = smoothstep(0, 0.25, p);
    const chapterT = smoothstep(0.27, 0.71, p);
    const flowT = smoothstep(0.38, 0.49, p);
    const connectT = smoothstep(0.49, 0.6, p);
    const aiT = smoothstep(0.6, 0.71, p);

    interpolateKeyframes(camKeys, p, camPos, camLook);

    const chapterPull = chapterT * (1 - brandT * 0.4);
    camPos[0] += 0.12 + chapterPull * 0.08;
    camPos[1] += chapterPull * 0.22;
    camPos[2] += chapterPull * 1.85;

    filaments.forEach((filament) => {
      const chapter = filament.def.chapter;
      const w = weights[chapter];
      const [, end] = CHAPTER_WINDOWS[chapter];
      const past = p > end ? smoothstep(end, end + 0.035, p) : 0;

      let lightPos = 0.06;
      if (w > 0) {
        const [start] = CHAPTER_WINDOWS[chapter];
        const span = CHAPTER_WINDOWS[chapter][1] - start;
        lightPos = 0.08 + ((p - start) / span) * 0.82;
      } else if (past > 0) {
        lightPos = 0.86;
      }

      updateEmissiveColors(filament.glowColors, filament.progressAttr, w, lightPos, past);
      filament.glow.geometry.attributes.color.needsUpdate = true;

      const spread =
        w * filament.spreadAmount +
        flowT * (chapter === 1 ? 0.035 : 0) +
        connectT * (chapter === 2 ? 0.04 : 0) +
        aiT * (chapter === 3 ? 0.045 : 0);

      const openX = filament.spreadAxis === 'x' ? spread : spread * 0.35;
      const openZ = filament.spreadAxis === 'z' ? spread : spread * 0.35;

      filament.group.position.x = Math.sin(filament.def.phase + p * 0.6) * openX * 0.4;
      filament.group.position.z = Math.cos(filament.def.phase + p * 0.45) * openZ * 0.35;
      filament.group.rotation.z = w * 0.018 - brandT * 0.008;

      const baseOpacity = 0.42 - exitT * 0.22;
      filament.mesh.material.opacity = baseOpacity;
      filament.glow.material.opacity = 0.52 + w * 0.28 - exitT * 0.22;
    });

    const travelY = lerp(0, -1.35, chapterT) - brandT * 0.22 - exitT * 0.18;
    sculptureGroup.position.y = (quality.mobile ? 0.35 : -0.08) + travelY;
    sculptureGroup.rotation.y =
      (quality.mobile ? 0.32 : 0.42) +
      pointerCurrent.x * 0.022 * pointerStrengthCurrent +
      chapterT * 0.38 -
      brandT * 0.12;
    sculptureGroup.rotation.x =
      pointerCurrent.y * 0.014 * pointerStrengthCurrent + introT * 0.012 - brandT * 0.008;

    arcLines.rotation.y = chapterT * 0.08;
    arcLines.children.forEach((line, i) => {
      line.material.opacity = 0.03 + weights[i % 4] * 0.04 + aiT * 0.02 - exitT * 0.02;
    });

    const pPos = particleField.positions;
    const pBase = particleField.basePositions;
    const pCol = particleField.colors;
    const pSeeds = particleField.seeds;
    for (let i = 0; i < quality.particleCount; i += 1) {
      const cluster = pSeeds[i * 3 + 2];
      const clusterWeight = weights[cluster] ?? 0;
      const drift = Math.sin(pSeeds[i * 3] + p * 4.5) * 0.018 * (0.35 + clusterWeight);
      const driftY = Math.cos(pSeeds[i * 3 + 1] + p * 3.2) * 0.012 * clusterWeight;

      pPos[i * 3] = pBase[i * 3] + drift;
      pPos[i * 3 + 1] = pBase[i * 3 + 1] + driftY;
      pPos[i * 3 + 2] = pBase[i * 3 + 2] + drift * 0.45;

      const goldish = pSeeds[i * 3 + 1] > 0.95;
      const boost = clusterWeight * 0.55 + brandT * 0.08;
      const c = goldish ? GOLD : ICE;
      const dim = (0.14 + boost * 0.35) * (1 - exitT * 0.55);
      pCol[i * 3] = c.r * dim;
      pCol[i * 3 + 1] = c.g * dim;
      pCol[i * 3 + 2] = c.b * dim;
    }
    particleField.points.geometry.attributes.position.needsUpdate = true;
    particleField.points.geometry.attributes.color.needsUpdate = true;
    particleField.points.material.opacity = 0.22 + chapterT * 0.12 - exitT * 0.16;

    camera.position.set(
      camPos[0] + pointerCurrent.x * 0.05 * pointerStrengthCurrent,
      camPos[1] + pointerCurrent.y * 0.035 * pointerStrengthCurrent,
      camPos[2],
    );
    lookAt.set(camLook[0], camLook[1], camLook[2]);
    camera.lookAt(lookAt);

    accent.intensity = 0.12 + weights.reduce((sum, w) => sum + w, 0) * 0.18 + aiT * 0.08;
    key.intensity = 0.42 - exitT * 0.14 - brandT * 0.06;
    rim.intensity = 0.18 + chapterT * 0.08 - exitT * 0.1;
    hemi.intensity = 0.34 - exitT * 0.1;
    scene.fog.density = 0.075 + exitT * 0.04;
    renderer.toneMappingExposure = 0.88 - exitT * 0.2 - brandT * 0.05;

    if (bloomPass) {
      bloomPass.strength = 0.28 + weights.reduce((sum, w) => sum + w, 0) * 0.08 - exitT * 0.16;
    }
  }

  function renderFrame() {
    rafId = 0;

    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.09;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.09;
    pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.07;

    applySceneState();

    if (composer) composer.render();
    else renderer.render(scene, camera);

    const settling =
      Math.abs(pointerTarget.x - pointerCurrent.x) > 0.0004 ||
      Math.abs(pointerTarget.y - pointerCurrent.y) > 0.0004 ||
      Math.abs(pointerStrengthTarget - pointerStrengthCurrent) > 0.0004;

    if (settling && !disposed && visible) invalidate();
  }

  function render() {
    applySceneState();
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function invalidate() {
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
    if (composer) {
      composer.setSize(width, height);
      composer.setPixelRatio(quality.dpr);
      bloomPass?.setSize(width, height);
    }
    render();
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) invalidate();
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(root);

  function onPointerMove(event) {
    if (!quality.pointerEnabled || !visible) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTarget.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointerTarget.y = THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
    pointerStrengthTarget = 1;
    invalidate();
  }

  function onPointerLeave() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
    pointerStrengthTarget = 0;
    invalidate();
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
    renderOnce();
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
      currentProgress = THREE.MathUtils.clamp(progress, 0, 1);
      render();
    },

    resize,

    renderOnce() {
      pointerCurrent.x = pointerTarget.x;
      pointerCurrent.y = pointerTarget.y;
      pointerStrengthCurrent = pointerStrengthTarget;
      render();
    },

    destroy() {
      if (disposed) return;
      disposed = true;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;

      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);

      filaments.forEach((filament) => {
        filament.mesh.geometry.dispose();
        filament.mesh.material.dispose();
        filament.glow.geometry.dispose();
        filament.glow.material.dispose();
      });

      arcLines.children.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });

      particleField.points.geometry.dispose();
      particleField.points.material.dispose();

      composer?.dispose();
      envRT.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      return {
        filaments: filaments.length,
        particles: quality.particleCount,
        tubeSegments: quality.tubeSegments,
        bloom: quality.bloom,
        dpr: quality.dpr,
      };
    },
  };
}
