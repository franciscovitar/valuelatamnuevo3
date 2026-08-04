/**
 * WebGL controller for the home background lines. Single RAF, single renderer,
 * driven entirely by an external scroll progress value (see lib/scroll/home/backgroundLines.js).
 */
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import {
  BREAKPOINT,
  getGeometryConfig,
  buildCurveSet,
  createAmbientParticles,
  createFragmentDefs,
  clamp01,
} from './backgroundLinesGeometry';
import {
  createRadialTexture,
  createLineMaterial,
  createNodeMaterial,
  createFragmentMaterial,
  createParticlesMaterial,
} from './backgroundLinesMaterials';

const TABLET_QUERY = '(max-width: 1024px)';
const MOBILE_QUERY = '(max-width: 760px)';
const DAMPING = 7;
const PX_TO_WORLD = 0.0035;
const NODE_CORE_PX = 3;
const NODE_HALO_PX = 8;
const NODE_COLOR = '#D8E6F4';
const FRAGMENT_COLORS = ['#268CFF', '#57B8FF', '#A5E2FF'];

function resolveBreakpoint() {
  if (typeof window === 'undefined') return BREAKPOINT.DESKTOP;
  if (window.matchMedia(MOBILE_QUERY).matches) return BREAKPOINT.MOBILE;
  if (window.matchMedia(TABLET_QUERY).matches) return BREAKPOINT.TABLET;
  return BREAKPOINT.DESKTOP;
}

function createSafeController() {
  return {
    setTargetProgress() {},
    setVisibility() {},
    setActive() {},
    resize() {},
    renderOnce() {},
    destroy() {},
    getStats() {
      return { disposed: true };
    },
  };
}

export function createBackgroundLinesScene({ canvas, root, reducedMotion }) {
  if (!canvas || reducedMotion) return createSafeController();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
  } catch {
    root?.classList.add('vl-bg-lines-layer--error');
    return createSafeController();
  }

  if (!renderer.getContext()) {
    root?.classList.add('vl-bg-lines-layer--error');
    return createSafeController();
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.08, 60);

  const nodeTexture = createRadialTexture(32, { softness: 1.6 });
  const fragmentTexture = createRadialTexture(48, { stretchX: 2.4, stretchY: 1, softness: 1.2 });
  const particleTexture = createRadialTexture(16, { softness: 1.8 });
  const ownedTextures = [nodeTexture, fragmentTexture, particleTexture];

  let breakpoint = null;
  let config = null;
  let cameraCurve = null;
  let lookAtCurve = null;
  let lineEntries = [];
  let nodeEntries = [];
  let fragmentEntries = [];
  let particlePoints = null;

  let currentProgress = 0;
  let targetProgress = 0;
  let elapsed = 0;
  let active = false;
  let disposed = false;
  let pausedByVisibility = false;
  let contextLost = false;
  let rafId = null;
  let lastFrameTime = 0;

  const tmpCameraPos = new THREE.Vector3();
  const tmpLookAt = new THREE.Vector3();
  const tmpFragmentPos = new THREE.Vector3();
  const tmpFragmentTangent = new THREE.Vector3();

  function disposeSceneContents() {
    lineEntries.forEach(({ mesh, geometry, material }) => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    });
    lineEntries = [];

    nodeEntries.forEach(({ sprite, material }) => {
      scene.remove(sprite);
      material.dispose();
    });
    nodeEntries = [];

    fragmentEntries.forEach(({ sprite, material }) => {
      scene.remove(sprite);
      material.dispose();
    });
    fragmentEntries = [];

    if (particlePoints) {
      scene.remove(particlePoints);
      particlePoints.geometry.dispose();
      particlePoints.material.dispose();
      particlePoints = null;
    }
  }

  function buildForBreakpoint(nextBreakpoint, width, height) {
    disposeSceneContents();

    breakpoint = nextBreakpoint;
    config = getGeometryConfig(breakpoint);
    camera.fov = config.fov;
    camera.near = config.near;
    camera.far = config.far;
    camera.updateProjectionMatrix();

    const curveSet = buildCurveSet(config);
    cameraCurve = curveSet.cameraCurve;
    lookAtCurve = curveSet.lookAtCurve;

    lineEntries = curveSet.lines.map((line) => {
      const points = line.curve.getPoints(config.sampleCount);
      const positions = new Float32Array(points.length * 3);
      points.forEach((pt, i) => {
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      });

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const material = createLineMaterial({
        color: line.color,
        opacity: line.opacity,
        widthPx: line.widthPx,
        width: Math.max(width, 1),
        height: Math.max(height, 1),
      });

      const mesh = new Line2(geometry, material);
      scene.add(mesh);

      const nodePoint = line.curve.getPointAt(line.nodeU);
      const core = new THREE.Sprite(createNodeMaterial(nodeTexture, NODE_COLOR, 0.55));
      core.scale.setScalar(NODE_CORE_PX * PX_TO_WORLD);
      core.position.copy(nodePoint);
      scene.add(core);
      nodeEntries.push({ sprite: core, material: core.material });

      const halo = new THREE.Sprite(createNodeMaterial(nodeTexture, NODE_COLOR, 0.16));
      halo.scale.setScalar(NODE_HALO_PX * PX_TO_WORLD);
      halo.position.copy(nodePoint);
      scene.add(halo);
      nodeEntries.push({ sprite: halo, material: halo.material });

      return { key: line.key, curve: line.curve, mesh, geometry, material };
    });

    const fragmentDefs = createFragmentDefs(config);
    fragmentEntries = fragmentDefs.map((def, i) => {
      const material = createFragmentMaterial(fragmentTexture, FRAGMENT_COLORS[i % FRAGMENT_COLORS.length]);
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.34, 0.1, 1);
      scene.add(sprite);
      return { ...def, sprite, material };
    });

    const { positions } = createAmbientParticles(config);
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = createParticlesMaterial(particleTexture, 2.4);
    particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlePoints);
  }

  function applyDpr(width, height) {
    const capped = Math.min(window.devicePixelRatio || 1, config.maxDpr);
    renderer.setPixelRatio(capped);
    renderer.setSize(width, height, false);
    lineEntries.forEach(({ material }) => material.resolution.set(width, height));
  }

  function updateCamera() {
    cameraCurve.getPointAt(currentProgress, tmpCameraPos);
    lookAtCurve.getPointAt(currentProgress, tmpLookAt);
    camera.position.copy(tmpCameraPos);
    camera.lookAt(tmpLookAt);
  }

  function updateFragments(delta) {
    elapsed += delta;
    fragmentEntries.forEach(({ curveIndex, speed, offset, sprite, material }) => {
      const line = lineEntries[curveIndex];
      if (!line) return;

      const u = (elapsed * speed + offset) % 1;
      line.curve.getPointAt(u, tmpFragmentPos);
      line.curve.getTangentAt(u, tmpFragmentTangent);

      sprite.position.copy(tmpFragmentPos);
      material.rotation = Math.atan2(tmpFragmentTangent.y, tmpFragmentTangent.x);

      let windowOpacity;
      if (u < 0.15) windowOpacity = u / 0.15;
      else if (u < 0.65) windowOpacity = 1;
      else windowOpacity = Math.max(0, 1 - (u - 0.65) / 0.35);

      material.opacity = windowOpacity * 0.85;
    });
  }

  function renderFrame() {
    updateCamera();
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (disposed || !active || pausedByVisibility) return;
    rafId = requestAnimationFrame(loop);

    const delta = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.1) : 0;
    lastFrameTime = now;

    currentProgress = clamp01(THREE.MathUtils.damp(currentProgress, targetProgress, DAMPING, delta));

    updateFragments(delta);
    renderFrame();
  }

  function startLoop() {
    if (rafId != null || disposed || pausedByVisibility || !active) return;
    lastFrameTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function onVisibilityChange() {
    pausedByVisibility = document.hidden;
    if (pausedByVisibility) stopLoop();
    else startLoop();
  }

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    stopLoop();
    root?.classList.add('vl-bg-lines-layer--error');
  }

  function onContextRestored() {
    if (disposed) return;
    contextLost = false;
    root?.classList.remove('vl-bg-lines-layer--error');
    resize();
    if (active) startLoop();
  }

  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);
  document.addEventListener('visibilitychange', onVisibilityChange);

  function resize() {
    if (disposed || contextLost) return;
    const rect = (root || canvas).getBoundingClientRect();
    const width = Math.max(Math.round(rect.width) || window.innerWidth, 1);
    const height = Math.max(Math.round(rect.height) || window.innerHeight, 1);

    const nextBreakpoint = resolveBreakpoint();
    if (nextBreakpoint !== breakpoint) {
      buildForBreakpoint(nextBreakpoint, width, height);
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    applyDpr(width, height);
  }

  resize();

  return {
    setTargetProgress(progress) {
      targetProgress = clamp01(progress);
    },
    setVisibility(opacity) {
      canvas.style.opacity = String(clamp01(opacity));
    },
    setActive(nextActive) {
      if (disposed) return;
      active = Boolean(nextActive);
      if (active) startLoop();
      else stopLoop();
    },
    resize,
    renderOnce() {
      if (disposed || contextLost) return;
      renderFrame();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      active = false;
      stopLoop();

      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      canvas.removeEventListener('webglcontextrestored', onContextRestored, false);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      disposeSceneContents();
      ownedTextures.forEach((texture) => texture.dispose());

      renderer.dispose();
      root?.classList.remove('vl-bg-lines-layer--error');
      canvas.style.removeProperty('opacity');
    },
    getStats() {
      return { breakpoint, active, disposed, currentProgress, targetProgress };
    },
  };
}
