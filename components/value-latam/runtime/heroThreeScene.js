import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const POINTER_QUERY = '(min-width: 981px) and (pointer: fine)';

const CHAPTER_WINDOWS = [
  [0.27, 0.38],
  [0.38, 0.49],
  [0.49, 0.60],
  [0.60, 0.71],
];

const COLORS = {
  navy: 0x0a2138,
  navyDark: 0x061321,
  navySteel: 0x1b3a5c,
  navyWarm: 0x0d2844,
};

const ICE = new THREE.Color(0x8fb2d6);
const GOLD = new THREE.Color(0xd2b775);

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function chapterWeight(progress, start, end, fade = 0.016) {
  if (progress < start - fade) return 0;
  if (progress < start + fade) return smoothstep(start - fade, start + fade, progress);
  if (progress < end - fade) return 1;
  if (progress < end + fade) return 1 - smoothstep(end - fade, end + fade, progress);
  return 0;
}

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
    segments: mobile ? 32 : tablet ? 48 : 64,
    width: mobile ? 0.44 : desktop ? 0.38 : 0.42,
    thickness: mobile ? 0.038 : 0.042,
    dpr: mobile ? 1 : tablet ? 1 : Math.min(window.devicePixelRatio || 1, 1.25),
    pointerEnabled: window.matchMedia(POINTER_QUERY).matches,
  };
}

function createRibbonGeometry({ points, width, thickness, segments, twist = 0 }) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, p.y, p.z)));
  const frames = curve.computeFrenetFrames(segments, false);

  const ringVerts = 4;
  const vertCount = (segments + 1) * ringVerts;
  const positions = new Float32Array(vertCount * 3);
  const ribbonProgress = new Float32Array(vertCount);
  const ringStarts = [];

  const halfW = width * 0.5;
  const halfT = thickness * 0.5;
  const normalUp = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const point = new THREE.Vector3();
  const corner = new THREE.Vector3();

  let vi = 0;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    curve.getPointAt(t, point);
    tangent.copy(frames.tangents[i]);
    normalUp.copy(frames.normals[i]);
    binormal.copy(frames.binormals[i]);

    if (twist !== 0) {
      const angle = twist * t * Math.PI * 0.35;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nr = normalUp.x * cos + binormal.x * sin;
      const nb = -normalUp.x * sin + binormal.x * cos;
      normalUp.x = nr;
      binormal.x = nb;
      const nr2 = normalUp.y * cos + binormal.y * sin;
      const nb2 = -normalUp.y * sin + binormal.y * cos;
      normalUp.y = nr2;
      binormal.y = nb2;
    }

    ringStarts.push(vi);

    const offsets = [
      [halfW, halfT],
      [-halfW, halfT],
      [-halfW, -halfT],
      [halfW, -halfT],
    ];

    offsets.forEach(([w, th]) => {
      corner.copy(point);
      corner.addScaledVector(binormal, w);
      corner.addScaledVector(normalUp, th);
      positions[vi * 3] = corner.x;
      positions[vi * 3 + 1] = corner.y;
      positions[vi * 3 + 2] = corner.z;
      ribbonProgress[vi] = t;
      vi += 1;
    });
  }

  const indices = [];

  for (let i = 0; i < segments; i += 1) {
    const a = ringStarts[i];
    const b = ringStarts[i + 1];

    indices.push(a, b, b + 1, a, b + 1, a + 1);
    indices.push(a + 3, a + 2, b + 2, a + 3, b + 2, b + 3);
    indices.push(a, a + 3, b + 3, a, b + 3, b);
    indices.push(a + 1, b + 1, b + 2, a + 1, b + 2, a + 2);
  }

  const start = ringStarts[0];
  const end = ringStarts[segments];
  indices.push(start, start + 3, start + 2, start, start + 2, start + 1);
  indices.push(end, end + 1, end + 2, end, end + 2, end + 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aRibbonProgress', new THREE.BufferAttribute(ribbonProgress, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { geometry, curve };
}

function setBaseVertexColors(geometry, color) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

function initOverlayColors(geometry) {
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return colors;
}

function updateOverlayColors(colorArray, progressAttr, activeWeight, lightPos, memoryWeight) {
  const iceR = ICE.r;
  const iceG = ICE.g;
  const iceB = ICE.b;
  const goldR = GOLD.r;
  const goldG = GOLD.g;
  const goldB = GOLD.b;

  for (let i = 0; i < progressAttr.length; i += 1) {
    const p = progressAttr[i];
    const dist = p - lightPos;
    const band = Math.exp(-(dist * dist) / 0.018) * activeWeight;
    const memory = memoryWeight * 0.12 * Math.exp(-((p - 0.7) ** 2) / 0.08);
    const intensity = Math.min(1, band * 0.85 + memory);

    const mix = band / (intensity + 0.0001);
    const r = lerp(iceR, goldR, mix * activeWeight) * intensity;
    const g = lerp(iceG, goldG, mix * activeWeight) * intensity;
    const b = lerp(iceB, goldB, mix * activeWeight) * intensity;

    colorArray[i * 3] = r;
    colorArray[i * 3 + 1] = g;
    colorArray[i * 3 + 2] = b;
  }
}

const RIBBON_DEFS = [
  {
    name: 'financiamiento',
    color: COLORS.navyDark,
    twist: 0.08,
    basePos: { x: 0, y: 0, z: 0 },
    baseRot: { x: 0.04, y: -0.12, z: 0.02 },
    brandPull: { x: 0.06, y: -0.04, z: 0.02 },
    points: [
      { x: 1.35, y: -1.35, z: -0.55 },
      { x: 0.95, y: -0.55, z: -0.28 },
      { x: 0.45, y: 0.25, z: -0.08 },
      { x: 0.05, y: 0.85, z: 0.06 },
      { x: -0.25, y: 1.15, z: 0.12 },
      { x: -0.45, y: 1.05, z: 0.08 },
    ],
  },
  {
    name: 'liquidez',
    color: COLORS.navySteel,
    twist: -0.05,
    basePos: { x: 0.05, y: -0.05, z: 0.04 },
    baseRot: { x: -0.02, y: -0.08, z: -0.01 },
    brandPull: { x: 0.05, y: 0.02, z: 0.01 },
    points: [
      { x: 1.55, y: 0.05, z: -0.35 },
      { x: 1.05, y: 0.22, z: -0.12 },
      { x: 0.45, y: 0.12, z: 0.05 },
      { x: -0.05, y: 0.35, z: 0.14 },
      { x: -0.45, y: 0.72, z: 0.1 },
      { x: -0.68, y: 0.95, z: 0.06 },
    ],
  },
  {
    name: 'medios',
    color: COLORS.navy,
    twist: 0.04,
    basePos: { x: -0.04, y: 0.06, z: -0.03 },
    baseRot: { x: 0.03, y: -0.1, z: 0.015 },
    brandPull: { x: 0.04, y: -0.03, z: 0.02 },
    points: [
      { x: 1.45, y: 1.15, z: -0.45 },
      { x: 1.0, y: 0.88, z: -0.18 },
      { x: 0.4, y: 0.58, z: 0.04 },
      { x: -0.08, y: 0.42, z: 0.16 },
      { x: -0.42, y: 0.55, z: 0.12 },
      { x: -0.58, y: 0.88, z: 0.08 },
    ],
  },
  {
    name: 'ia',
    color: COLORS.navyWarm,
    twist: -0.07,
    basePos: { x: 0.02, y: 0.02, z: -0.06 },
    baseRot: { x: -0.03, y: -0.14, z: 0.025 },
    brandPull: { x: 0.07, y: -0.02, z: 0.04 },
    points: [
      { x: 1.65, y: 0.35, z: -1.05 },
      { x: 1.15, y: 0.18, z: -0.62 },
      { x: 0.55, y: 0.42, z: -0.28 },
      { x: 0.02, y: 0.58, z: -0.05 },
      { x: -0.32, y: 0.82, z: 0.04 },
      { x: -0.5, y: 1.0, z: 0.02 },
    ],
  },
];

function cameraState(progress, mobile) {
  const brandT = smoothstep(0.72, 0.93, progress);
  const exitT = smoothstep(0.91, 1, progress);
  const introT = smoothstep(0, 0.27, progress);
  const chapterT = smoothstep(0.27, 0.71, progress);

  const posX = lerp(1.85, 1.55, chapterT) + brandT * 0.2 + exitT * 0.12;
  const posY = lerp(0.42, 0.3, chapterT) - brandT * 0.05 + (mobile ? 0.18 : 0);
  const posZ = lerp(3.85, 3.05, chapterT) + brandT * 0.4 + exitT * 0.22;

  const lookX = lerp(0.35, 0.18, chapterT) + brandT * 0.02;
  const lookY = lerp(0.38, 0.48, chapterT) + (mobile ? 0.1 : 0);
  const lookZ = lerp(-0.05, 0.05, chapterT);

  return { posX, posY, posZ, lookX, lookY, lookZ, brandT, exitT, introT };
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
      antialias: false,
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
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.15, 32);
  const sculptureGroup = new THREE.Group();
  scene.add(sculptureGroup);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  envScene.dispose?.();

  const hemi = new THREE.HemisphereLight(0x8fb2d6, 0x01040a, 0.38);
  const key = new THREE.DirectionalLight(0x9ec0e6, 0.48);
  key.position.set(2.8, 4.2, 3.5);
  const fill = new THREE.DirectionalLight(0x1b3a5c, 0.22);
  fill.position.set(-2.5, 1.2, 2.8);
  const accent = new THREE.PointLight(0xd2b775, 0, 9);
  accent.position.set(0.4, 0.9, 0.6);
  scene.add(hemi, key, fill, accent);

  const ribbons = [];
  const tempColor = new THREE.Color();

  RIBBON_DEFS.forEach((def, index) => {
    const { geometry } = createRibbonGeometry({
      points: def.points,
      width: quality.width,
      thickness: quality.thickness,
      segments: quality.segments,
      twist: def.twist,
    });

    tempColor.setHex(def.color);
    setBaseVertexColors(geometry, tempColor);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.45,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.24,
      side: THREE.DoubleSide,
      vertexColors: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

    const overlayGeo = geometry.clone();
    const overlayColors = initOverlayColors(overlayGeo);
    const overlayMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const overlay = new THREE.Mesh(overlayGeo, overlayMat);

    const group = new THREE.Group();
    group.add(mesh, overlay);
    group.position.set(def.basePos.x, def.basePos.y, def.basePos.z);
    group.rotation.set(def.baseRot.x, def.baseRot.y, def.baseRot.z);
    sculptureGroup.add(group);

    ribbons.push({
      group,
      mesh,
      overlay,
      overlayColors,
      progressAttr: overlayGeo.attributes.aRibbonProgress.array,
      def,
      index,
    });
  });

  if (quality.mobile) {
    sculptureGroup.position.set(0.35, 0.42, 0);
    sculptureGroup.rotation.y = 0.38;
    sculptureGroup.scale.setScalar(0.88);
  } else if (quality.tablet) {
    sculptureGroup.position.set(0.42, 0.05, 0);
    sculptureGroup.rotation.y = 0.42;
    sculptureGroup.scale.setScalar(0.94);
  } else {
    sculptureGroup.position.set(0.12, -0.05, 0);
    sculptureGroup.rotation.y = 0.48;
  }

  let targetProgress = 0;
  let currentProgress = 0;
  let pointerTarget = { x: 0, y: 0 };
  let pointerCurrent = { x: 0, y: 0 };
  let pointerStrengthTarget = 0;
  let pointerStrengthCurrent = 0;

  let rafId = 0;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;

  const lookAt = new THREE.Vector3();

  function applySceneState() {
    const p = currentProgress;
    const weights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(p, start, end));
    const brandT = smoothstep(0.72, 0.93, p);
    const exitT = smoothstep(0.91, 1, p);
    const alignT = weights[3] * 0.6 + brandT * 0.4;

    ribbons.forEach((ribbon, i) => {
      const w = weights[i];
      const [, end] = CHAPTER_WINDOWS[i];
      const past = p > end ? smoothstep(end, end + 0.04, p) : 0;

      let lightPos = 0.08;
      if (w > 0) {
        const [start] = CHAPTER_WINDOWS[i];
        const span = CHAPTER_WINDOWS[i][1] - start;
        lightPos = 0.1 + ((p - start) / span) * 0.78;
      } else if (past > 0) {
        lightPos = 0.82;
      }

      updateOverlayColors(ribbon.overlayColors, ribbon.progressAttr, w, lightPos, past);
      ribbon.overlay.geometry.attributes.color.needsUpdate = true;

      const lift = i === 0 ? w * 0.07 : 0;
      const fluid = i === 1 ? w * 0.04 : 0;

      ribbon.group.rotation.x = ribbon.def.baseRot.x + w * 0.05 + alignT * 0.025 + lift;
      ribbon.group.rotation.y = ribbon.def.baseRot.y + w * 0.035 - alignT * 0.02;
      ribbon.group.rotation.z = ribbon.def.baseRot.z + (i === 3 ? w * 0.02 : 0);

      ribbon.group.position.x = ribbon.def.basePos.x - brandT * ribbon.def.brandPull.x;
      ribbon.group.position.y = ribbon.def.basePos.y + lift * 0.5 + fluid - brandT * ribbon.def.brandPull.y;
      ribbon.group.position.z = ribbon.def.basePos.z - brandT * ribbon.def.brandPull.z;

      ribbon.group.scale.setScalar(1 + w * 0.025 - exitT * 0.02);
    });

    sculptureGroup.rotation.y = 0.48 + pointerCurrent.x * 0.025 * pointerStrengthCurrent - alignT * 0.018;
    sculptureGroup.rotation.x = pointerCurrent.y * 0.015 * pointerStrengthCurrent + brandT * 0.012;
    sculptureGroup.position.y = (quality.mobile ? 0.42 : -0.08) - exitT * 0.12 - brandT * 0.04;

    const cam = cameraState(p, quality.mobile);
    camera.position.set(
      cam.posX + pointerCurrent.x * 0.06 * pointerStrengthCurrent,
      cam.posY + pointerCurrent.y * 0.04 * pointerStrengthCurrent,
      cam.posZ,
    );
    lookAt.set(cam.lookX, cam.lookY, cam.lookZ);
    camera.lookAt(lookAt);

    accent.intensity = weights.reduce((sum, w) => sum + w, 0) * 0.22 + brandT * 0.18;
    hemi.intensity = 0.38 - exitT * 0.12;
    key.intensity = 0.48 - exitT * 0.16;
    renderer.toneMappingExposure = 0.9 - exitT * 0.22 - brandT * 0.04;
  }

  function renderFrame() {
    rafId = 0;

    currentProgress += (targetProgress - currentProgress) * 0.14;
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.08;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.08;
    pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.06;

    applySceneState();
    renderer.render(scene, camera);

    const settling =
      Math.abs(targetProgress - currentProgress) > 0.0005 ||
      Math.abs(pointerTarget.x - pointerCurrent.x) > 0.0005 ||
      Math.abs(pointerTarget.y - pointerCurrent.y) > 0.0005 ||
      Math.abs(pointerStrengthTarget - pointerStrengthCurrent) > 0.0005;

    if (settling && !disposed && visible) {
      invalidate();
    }
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
    invalidate();
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
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.x = THREE.MathUtils.clamp(pointerTarget.x, -1, 1);
    pointerTarget.y = THREE.MathUtils.clamp(pointerTarget.y, -1, 1);
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
  applySceneState();

  return {
    setProgress(progress) {
      targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
      invalidate();
    },

    setPointer(x, y) {
      pointerTarget.x = THREE.MathUtils.clamp(x, -1, 1);
      pointerTarget.y = THREE.MathUtils.clamp(y, -1, 1);
      invalidate();
    },

    resize,

    renderOnce() {
      currentProgress = targetProgress;
      pointerCurrent.x = pointerTarget.x;
      pointerCurrent.y = pointerTarget.y;
      pointerStrengthCurrent = pointerStrengthTarget;
      applySceneState();
      renderer.render(scene, camera);
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

      ribbons.forEach((ribbon) => {
        ribbon.mesh.geometry.dispose();
        ribbon.mesh.material.dispose();
        ribbon.overlay.geometry.dispose();
        ribbon.overlay.material.dispose();
      });

      envRT.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      let triangles = 0;
      ribbons.forEach((ribbon) => {
        const geo = ribbon.mesh.geometry;
        triangles += geo.index ? geo.index.count / 3 : 0;
      });
      return {
        ribbons: ribbons.length,
        overlays: ribbons.length,
        segments: quality.segments,
        drawCalls: ribbons.length * 2,
        triangles: Math.round(triangles * 2),
        dpr: quality.dpr,
      };
    },
  };
}
