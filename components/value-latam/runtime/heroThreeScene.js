import * as THREE from 'three';
import {
  PALETTE,
  CHAPTER_WINDOWS,
  cameraKeyframes,
  chapterPast,
  chapterWeight,
  createRng,
  generateGroundLines,
  generatePillars,
  generateStreamCurves,
  getCoreTarget,
  interpolateKeyframes,
  smoothstep,
} from './heroThreeGeometry';

const POINTER_QUERY = '(min-width: 981px) and (pointer: fine)';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(out, a, b, t) {
  out.r = lerp(a.r, b.r, t);
  out.g = lerp(a.g, b.g, t);
  out.b = lerp(a.b, b.b, t);
}

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }
  material.dispose();
}

function disposeObject(object) {
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) disposeMaterial(node.material);
  });
}

function getQuality() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
  const desktop = !mobile && !tablet;

  return {
    mobile,
    tablet,
    desktop,
    pillarCount: mobile ? 30 : desktop ? 56 : 48,
    nodeCount: mobile ? 12 : 24,
    pulseCount: mobile ? 10 : 24,
    tubeSegments: mobile ? 28 : 56,
    antialias: !mobile,
    dpr: mobile ? 1 : tablet ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 1.5),
    fpsCap: mobile ? 30 : 60,
    cameraScale: mobile ? 0.7 : 1,
    pointerEnabled: window.matchMedia(POINTER_QUERY).matches,
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
      antialias: quality.antialias,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
  } catch {
    return null;
  }

  const gl = renderer.getContext();
  if (!gl) {
    renderer.dispose();
    return null;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.blackBlue, quality.mobile ? 0.075 : 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 48);
  const cameraRig = new THREE.Group();
  const worldGroup = new THREE.Group();
  const lookTarget = new THREE.Vector3();

  scene.add(cameraRig);
  cameraRig.add(camera);
  cameraRig.add(worldGroup);

  const groundGroup = new THREE.Group();
  const architectureGroup = new THREE.Group();
  const streamsGroup = new THREE.Group();
  const nodesGroup = new THREE.Group();
  const particlesGroup = new THREE.Group();
  const coreGroup = new THREE.Group();

  worldGroup.add(groundGroup, architectureGroup, streamsGroup, nodesGroup, particlesGroup, coreGroup);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(quality.dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const rng = createRng();
  const pillars = generatePillars(quality.pillarCount, rng);
  const streamPointSets = generateStreamCurves();
  const coreTarget = getCoreTarget();
  const camKeys = cameraKeyframes();

  const tempColor = new THREE.Color();
  const iceColor = new THREE.Color(PALETTE.iceBlue);
  const goldColor = new THREE.Color(PALETTE.gold);
  const navyColor = new THREE.Color(PALETTE.navyMedium);
  const dummy = new THREE.Object3D();
  const lookPos = [0, 0, 0];
  const camPos = [0, 0, 0];
  const pointerCurrent = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  let targetProgress = 0;
  let currentProgress = 0;
  let ambientTime = 0;
  let rafId = 0;
  let running = false;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;
  let lastFrame = 0;
  let frameInterval = 1000 / quality.fpsCap;

  const pillarGeo = new THREE.BoxGeometry(1, 1, 1);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: PALETTE.navyDark,
    emissive: PALETTE.navy,
    emissiveIntensity: 0.12,
    roughness: 0.62,
    metalness: 0.18,
  });
  const pillarMesh = new THREE.InstancedMesh(pillarGeo, pillarMat, pillars.length);
  pillarMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  architectureGroup.add(pillarMesh);

  pillars.forEach((pillar, index) => {
    dummy.position.set(pillar.x, pillar.y, pillar.z);
    dummy.scale.set(pillar.width, pillar.height, pillar.depth);
    dummy.rotation.y = pillar.rotY;
    dummy.updateMatrix();
    pillarMesh.setMatrixAt(index, dummy.matrix);
  });
  pillarMesh.instanceMatrix.needsUpdate = true;

  const streamCurves = streamPointSets.map(
    (points) => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, p.y, p.z))),
  );

  const streamMeshes = [];
  const streamMats = [];

  streamCurves.forEach((curve) => {
    const geo = new THREE.TubeGeometry(curve, quality.tubeSegments, quality.mobile ? 0.011 : 0.014, 6, false);
    const mat = new THREE.MeshStandardMaterial({
      color: PALETTE.navyMedium,
      emissive: PALETTE.iceBlue,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.22,
      roughness: 0.45,
      metalness: 0.12,
    });
    const mesh = new THREE.Mesh(geo, mat);
    streamsGroup.add(mesh);
    streamMeshes.push(mesh);
    streamMats.push(mat);
  });

  const nodeGeo = new THREE.SphereGeometry(quality.mobile ? 0.028 : 0.034, 10, 10);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: PALETTE.navyMedium,
    emissive: PALETTE.iceBlue,
    emissiveIntensity: 0.18,
    roughness: 0.35,
    metalness: 0.2,
  });
  const nodeRecords = [];
  for (let i = 0; i < quality.nodeCount; i += 1) {
    const stream = i % 4;
    nodeRecords.push({
      stream,
      t: ((i / quality.nodeCount) * 0.82 + rng() * 0.08) % 0.9,
    });
  }
  const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeRecords.length);
  nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodesGroup.add(nodeMesh);

  const pulseGeo = new THREE.SphereGeometry(quality.mobile ? 0.018 : 0.022, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: PALETTE.iceBlue,
    transparent: true,
    opacity: 0.55,
  });
  const pulses = [];
  for (let i = 0; i < quality.pulseCount; i += 1) {
    const mesh = new THREE.Mesh(pulseGeo, pulseMat.clone());
    mesh.visible = false;
    particlesGroup.add(mesh);
    pulses.push({
      mesh,
      stream: i % 4,
      offset: i / quality.pulseCount,
      speed: 0.08 + (i % 5) * 0.012,
    });
  }

  const coreBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.42, 0.22),
    new THREE.MeshStandardMaterial({
      color: PALETTE.navy,
      emissive: PALETTE.iceBlue,
      emissiveIntensity: 0.14,
      roughness: 0.4,
      metalness: 0.28,
    }),
  );
  coreBase.position.set(coreTarget.x, coreTarget.y, coreTarget.z);
  coreGroup.add(coreBase);

  const ringMats = [];
  [0.52, 0.68, 0.84].forEach((radius, index) => {
    const mat = new THREE.MeshStandardMaterial({
      color: PALETTE.navyDark,
      emissive: PALETTE.iceBlue,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.42 - index * 0.08,
      roughness: 0.55,
      metalness: 0.22,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 8, 48), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(coreTarget.x, coreTarget.y, coreTarget.z);
    coreGroup.add(ring);
    ringMats.push({ mesh: ring, mat, speed: 0.05 + index * 0.015 });
  });

  const groundGeo = new THREE.BufferGeometry();
  groundGeo.setAttribute('position', new THREE.BufferAttribute(generateGroundLines(rng), 3));
  const groundMat = new THREE.LineBasicMaterial({
    color: PALETTE.navyMedium,
    transparent: true,
    opacity: 0.06,
  });
  groundGroup.add(new THREE.LineSegments(groundGeo, groundMat));

  const ambient = new THREE.HemisphereLight(PALETTE.navyMedium, PALETTE.blackBlue, 0.42);
  const dir = new THREE.DirectionalLight(PALETTE.iceBlue, 0.38);
  dir.position.set(2.5, 4.5, 3.5);
  const coreLight = new THREE.PointLight(PALETTE.iceBlue, 0.55, 8);
  coreLight.position.set(coreTarget.x, coreTarget.y + 0.35, coreTarget.z);
  const goldLight = new THREE.PointLight(PALETTE.gold, 0, 6);
  goldLight.position.set(coreTarget.x, coreTarget.y, coreTarget.z);
  scene.add(ambient, dir, coreLight, goldLight);

  const tempVec = new THREE.Vector3();

  function applyProgress(progress, time) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const introT = smoothstep(0, 0.27, p);
    const brandT = smoothstep(0.72, 0.93, p);
    const exitT = smoothstep(0.91, 1, p);

    const streamWeights = CHAPTER_WINDOWS.map(([start, end]) => chapterWeight(p, start, end));
    const streamPast = CHAPTER_WINDOWS.map(([, end]) => chapterPast(p, end));

    streamMats.forEach((mat, index) => {
      const active = streamWeights[index];
      const past = streamPast[index];
      const base = past > 0 && active < 0.05 ? 0.34 : 0.18 + introT * 0.08;
      const goldMix = active;
      mixColor(tempColor, iceColor, goldColor, goldMix);
      mat.color.copy(navyColor);
      mat.emissive.copy(tempColor);
      mat.emissiveIntensity = 0.06 + active * 0.28 + past * 0.08;
      mat.opacity = base + active * 0.42 + past * 0.12;
    });

    const camScale = quality.cameraScale;
    interpolateKeyframes(camKeys, p, camPos, lookPos);
    const pullBack = brandT * 0.35 - exitT * 0.15;
    camera.position.set(
      (camPos[0] + pullBack * 0.4) * camScale,
      camPos[1] * camScale,
      (camPos[2] + pullBack * 0.8) * camScale,
    );
    lookTarget.set(lookPos[0], lookPos[1], lookPos[2]);
    camera.lookAt(lookTarget);

    const fogDensity = (quality.mobile ? 0.075 : 0.055) + exitT * 0.04 + brandT * 0.012;
    scene.fog.density = fogDensity;

    goldLight.intensity = streamWeights.reduce((sum, w) => sum + w, 0) * 0.18 + brandT * 0.35;
    coreLight.intensity = 0.42 + brandT * 0.22 - exitT * 0.18;
    ambient.intensity = 0.42 - exitT * 0.12;

    pillars.forEach((pillar, index) => {
      const activeBand = streamWeights[pillar.band] || 0;
      const pastBand = streamPast[pillar.band] || 0;
      const introLift = introT * 0.04;
      const activeLift = activeBand * 0.18;
      const iaAlign = streamWeights[3] * 0.04;
      const height = pillar.baseHeight * (1 + introLift + activeLift + iaAlign);
      const rotY = pillar.rotY + streamWeights[3] * 0.035 * Math.sin(time * 0.35 + index);

      dummy.position.set(pillar.x, height * 0.5, pillar.z);
      dummy.scale.set(pillar.width, height, pillar.depth);
      dummy.rotation.y = rotY;
      dummy.updateMatrix();
      pillarMesh.setMatrixAt(index, dummy.matrix);

      tempColor.copy(pillarMat.color);
      mixColor(tempColor, navyColor, goldColor, activeBand * 0.35);
      pillarMesh.setColorAt(index, tempColor);
    });
    pillarMesh.instanceMatrix.needsUpdate = true;
    if (pillarMesh.instanceColor) pillarMesh.instanceColor.needsUpdate = true;

    nodeRecords.forEach((node, index) => {
      const curve = streamCurves[node.stream];
      curve.getPointAt(node.t, tempVec);
      dummy.position.copy(tempVec);
      const active = streamWeights[node.stream];
      const scale = 0.85 + active * 0.35;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      nodeMesh.setMatrixAt(index, dummy.matrix);
      mixColor(tempColor, iceColor, goldColor, active);
      nodeMesh.setColorAt(index, tempColor);
    });
    nodeMesh.instanceMatrix.needsUpdate = true;
    if (nodeMesh.instanceColor) nodeMesh.instanceColor.needsUpdate = true;

    pulses.forEach((pulse) => {
      const active = streamWeights[pulse.stream];
      const past = streamPast[pulse.stream];
      const visiblePulse = active > 0.05 || past > 0.2 || (p > 0.72 && p < 0.95);
      pulse.mesh.visible = visiblePulse;
      if (!visiblePulse) return;

      const travel = (time * pulse.speed + pulse.offset + p * 0.25) % 1;
      streamCurves[pulse.stream].getPointAt(travel, tempVec);
      pulse.mesh.position.copy(tempVec);
      const s = 0.75 + active * 0.55 + brandT * 0.15;
      pulse.mesh.scale.setScalar(s);
      pulse.mesh.material.opacity = 0.25 + active * 0.45 + past * 0.15;
      mixColor(tempColor, iceColor, goldColor, active + brandT * 0.35);
      pulse.mesh.material.color.copy(tempColor);
    });

    ringMats.forEach((ring, index) => {
      ring.mesh.rotation.z = time * ring.speed + brandT * 0.08;
      ring.mesh.rotation.y = time * (ring.speed * 0.6) + streamWeights[3] * 0.04;
      ring.mat.emissiveIntensity = 0.08 + brandT * 0.22 + streamWeights.reduce((a, b) => a + b, 0) * 0.03;
      ring.mat.opacity = (0.42 - index * 0.08) + brandT * 0.08 - exitT * 0.12;
    });

    coreBase.material.emissiveIntensity = 0.12 + brandT * 0.28 + exitT * -0.06;
    coreBase.scale.setScalar(1 + brandT * 0.08 - exitT * 0.04);
    coreGroup.position.y = Math.sin(time * 0.45) * 0.012 * (1 - exitT);

    groundMat.opacity = 0.045 + introT * 0.025 - exitT * 0.02;
  }

  function resize() {
    if (disposed) return;
    const width = canvas.clientWidth || root.clientWidth || 1;
    const height = canvas.clientHeight || root.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function renderFrame(time) {
    const dt = lastFrame ? time - lastFrame : 16;
    lastFrame = time;

    currentProgress += (targetProgress - currentProgress) * Math.min(1, dt * 0.012);
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.06;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.06;

    ambientTime += dt * 0.001;
    cameraRig.rotation.y = pointerCurrent.x * 0.022;
    cameraRig.rotation.x = pointerCurrent.y * 0.014;
    worldGroup.position.x = pointerCurrent.x * 0.12;
    worldGroup.position.y = pointerCurrent.y * 0.06;

    applyProgress(currentProgress, ambientTime);
    renderer.render(scene, camera);
  }

  function tick(time) {
    if (!running || disposed) return;
    rafId = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    if (time - (tick.last || 0) < frameInterval) return;
    tick.last = time;
    renderFrame(time);
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(root);

  function onVisibilityChange() {
    if (document.hidden) {
      lastFrame = 0;
    }
  }

  function onPointerMove(event) {
    if (!quality.pointerEnabled || !visible) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.x = THREE.MathUtils.clamp(pointerTarget.x, -1, 1);
    pointerTarget.y = THREE.MathUtils.clamp(pointerTarget.y, -1, 1);
  }

  function onPointerLeave() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  }

  function onContextLost(event) {
    event.preventDefault();
    pause();
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
    start();
  }

  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (quality.pointerEnabled) {
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
  }

  resize();
  applyProgress(0, 0);

  return {
    setProgress(progress) {
      targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
    },

    setPointer(x, y) {
      pointerTarget.x = THREE.MathUtils.clamp(x, -1, 1);
      pointerTarget.y = THREE.MathUtils.clamp(y, -1, 1);
    },

    resize,

    renderOnce() {
      currentProgress = targetProgress;
      renderFrame(performance.now());
    },

    start() {
      if (running || disposed) return;
      running = true;
      lastFrame = 0;
      tick.last = 0;
      rafId = requestAnimationFrame(tick);
    },

    pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    },

    destroy() {
      if (disposed) return;
      disposed = true;
      pause();

      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);

      disposeObject(worldGroup);
      pillarGeo.dispose();
      nodeGeo.dispose();
      pulseGeo.dispose();
      groundGeo.dispose();
      disposeMaterial(pillarMat);
      disposeMaterial(nodeMat);
      disposeMaterial(groundMat);
      streamMats.forEach(disposeMaterial);
      pulses.forEach((pulse) => disposeMaterial(pulse.mesh.material));
      ringMats.forEach(({ mat }) => disposeMaterial(mat));
      disposeMaterial(coreBase.material);

      renderer.dispose();
      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      const tubeTris = streamMeshes.reduce((sum, mesh) => {
        const geo = mesh.geometry;
        return sum + (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3);
      }, 0);
      const pillarTris = pillars.length * 12;
      const nodeTris = nodeRecords.length * 80;
      const pulseTris = pulses.length * 64;
      const drawCalls =
        1 +
        streamMeshes.length +
        1 +
        pulses.length +
        coreGroup.children.length +
        1 +
        1;

      return {
        pillars: pillars.length,
        nodes: nodeRecords.length,
        pulses: pulses.length,
        drawCalls,
        triangles: Math.round(pillarTris + tubeTris + nodeTris + pulseTris + 4000),
        dpr: quality.dpr,
      };
    },
  };
}
