import * as THREE from 'three';

const POINTER_QUERY = '(min-width: 981px) and (pointer: fine)';

const CHAPTER_WINDOWS = [
  [0.27, 0.38],
  [0.38, 0.49],
  [0.49, 0.60],
  [0.60, 0.71],
];

const VERT = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec4 uChapterWeights;
uniform float uBrandProgress;
uniform float uExitProgress;
uniform float uMobile;

const vec3 COL_BLACK = vec3(0.0039, 0.0157, 0.0392);
const vec3 COL_DEEP   = vec3(0.0078, 0.0275, 0.0549);
const vec3 COL_DARK   = vec3(0.0235, 0.0745, 0.1294);
const vec3 COL_NAVY   = vec3(0.0392, 0.1294, 0.2196);
const vec3 COL_MED    = vec3(0.1059, 0.2275, 0.3608);
const vec3 COL_ICE    = vec3(0.5608, 0.6980, 0.8392);
const vec3 COL_ICE_LT = vec3(0.6196, 0.7529, 0.9020);
const vec3 COL_GOLD   = vec3(0.7490, 0.6275, 0.3529);
const vec3 COL_GOLD_L = vec3(0.8235, 0.7176, 0.4588);

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) {
    v += a * valueNoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec2 domainWarp(vec2 p, float t) {
  float n1 = fbm(p * 1.35 + vec2(t * 0.018, t * 0.012));
  float n2 = fbm(p * 1.55 + vec2(3.7, 1.9) + t * 0.014);
  return p + vec2(n1 - 0.5, n2 - 0.5) * 0.085;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 bezier2(vec2 a, vec2 b, vec2 c, float t) {
  float omt = 1.0 - t;
  return omt * omt * a + 2.0 * omt * t * b + t * t * c;
}

float sdBezier2(vec2 p, vec2 a, vec2 b, vec2 c) {
  float d = 1e6;
  for (int i = 0; i < 16; i++) {
    float t0 = float(i) / 16.0;
    float t1 = float(i + 1) / 16.0;
    d = min(d, sdSegment(p, bezier2(a, b, c, t0), bezier2(a, b, c, t1)));
  }
  return d;
}

float streamPulse(vec2 p, vec2 a, vec2 b, vec2 c, float phase, float width) {
  float t = fract(phase);
  vec2 pt = bezier2(a, b, c, t);
  return exp(-dot(p - pt, p - pt) / (width * width));
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 pointerUv = uPointer * vec2(0.14, 0.09);
  vec2 warpCenter = mix(vec2(0.22, 0.0), vec2(0.18, 0.06), uMobile) + pointerUv;
  float warpDist = length(p - warpCenter);
  p += (p - warpCenter) * uPointerStrength * 0.016 * exp(-warpDist * warpDist * 10.0);

  float intro = smoothstep(0.0, 0.27, uProgress);
  float expand = 1.0 + intro * 0.04 + uBrandProgress * 0.025;

  vec2 core = mix(vec2(0.24, 0.02), vec2(0.20, -0.10), uMobile);
  vec2 formCenter = mix(vec2(0.30, 0.01), vec2(0.22, -0.08), uMobile);

  vec2 q = domainWarp((p - formCenter) / expand, uTime * 0.045 + uProgress * 0.08);
  float ellDist = length(q * vec2(0.88, 1.05));
  float density = fbm(q * 2.1 + uTime * 0.022);
  float mainShape = 1.0 - smoothstep(0.42, 1.08, ellDist + density * 0.18 - intro * 0.06);
  mainShape *= smoothstep(-0.55, -0.08, p.x + 0.12);

  vec3 base = mix(COL_BLACK, COL_DEEP, smoothstep(-0.55, -0.05, p.x));
  base = mix(base, COL_DARK, smoothstep(-0.1, 0.35, p.x) * 0.45);
  base = mix(base, COL_NAVY, smoothstep(0.05, 0.55, p.x + density * 0.08) * 0.35);
  base = mix(base, COL_MED * 0.35, smoothstep(0.25, 0.65, p.x) * 0.12);

  vec3 formInner = mix(COL_DARK, COL_MED, density * 0.55 + mainShape * 0.35);
  formInner = mix(formInner, COL_ICE * 0.55, mainShape * (0.18 + intro * 0.12));
  vec3 color = mix(base, formInner, mainShape * 0.92);

  vec2 c0a = mix(vec2(0.42, -0.38), vec2(0.38, -0.28), uMobile);
  vec2 c0b = mix(vec2(0.36, -0.08), vec2(0.32, -0.02), uMobile);
  vec2 c0c = core;
  vec2 c1a = mix(vec2(0.52, 0.08), vec2(0.46, 0.12), uMobile);
  vec2 c1b = mix(vec2(0.40, 0.06), vec2(0.34, 0.08), uMobile);
  vec2 c1c = core;
  vec2 c2a = mix(vec2(0.48, 0.32), vec2(0.44, 0.22), uMobile);
  vec2 c2b = mix(vec2(0.36, 0.18), vec2(0.30, 0.14), uMobile);
  vec2 c2c = core;
  vec2 c3a = mix(vec2(0.18, -0.22), vec2(0.16, -0.14), uMobile);
  vec2 c3b = mix(vec2(0.24, -0.02), vec2(0.22, 0.02), uMobile);
  vec2 c3c = core;

  float d0 = sdBezier2(p, c0a, c0b, c0c);
  float d1 = sdBezier2(p, c1a, c1b, c1c);
  float d2 = sdBezier2(p, c2a, c2b, c2c);
  float d3 = sdBezier2(p, c3a, c3b, c3c);

  float past0 = smoothstep(0.38, 0.42, uProgress);
  float past1 = smoothstep(0.49, 0.53, uProgress);
  float past2 = smoothstep(0.60, 0.64, uProgress);

  float w0 = uChapterWeights.x;
  float w1 = uChapterWeights.y;
  float w2 = uChapterWeights.z;
  float w3 = uChapterWeights.w;

  float mem0 = max(w0 * 0.15, past0 * 0.38);
  float mem1 = max(w1 * 0.15, past1 * 0.38);
  float mem2 = max(w2 * 0.15, past2 * 0.38);
  float mem3 = w3 * 0.15 + uBrandProgress * 0.55;

  float s0 = exp(-d0 * d0 / 0.0018) * (mem0 + w0 * 0.85 + uBrandProgress * 0.35);
  float s1 = exp(-d1 * d1 / 0.0016) * (mem1 + w1 * 0.85 + uBrandProgress * 0.35);
  float s2 = exp(-d2 * d2 / 0.0016) * (mem2 + w2 * 0.85 + uBrandProgress * 0.35);
  float s3 = exp(-d3 * d3 / 0.0018) * (mem3 + w3 * 0.85 + uBrandProgress * 0.35);

  float coreLine0 = exp(-d0 * d0 / 0.00035) * (w0 + mem0 * 0.5);
  float coreLine1 = exp(-d1 * d1 / 0.00032) * (w1 + mem1 * 0.5);
  float coreLine2 = exp(-d2 * d2 / 0.00032) * (w2 + mem2 * 0.5);
  float coreLine3 = exp(-d3 * d3 / 0.00035) * (w3 + mem3 * 0.5);

  vec3 streamIce = COL_ICE * 0.55;
  vec3 streamGold = mix(COL_GOLD, COL_GOLD_L, 0.45);

  color += streamIce * (s0 + s1 + s2 + s3) * 0.22 * mainShape;
  color += streamGold * (s0 * w0 + s1 * w1 + s2 * w2 + s3 * w3) * 0.42;
  color += streamGold * (coreLine0 * w0 + coreLine1 * w1 + coreLine2 * w2 + coreLine3 * w3) * 0.18;

  float fluid = fbm(p * 1.8 + vec2(uTime * 0.025, -uTime * 0.018) + uProgress * 0.2);
  color += COL_ICE * fluid * mainShape * (w1 * 0.08 + w2 * 0.06);

  float order = w3 * 0.12 + uBrandProgress * 0.18;
  float sym = 1.0 - abs(p.y) * 1.6;
  color += COL_ICE_LT * sym * order * mainShape * 0.08;

  float pulseSpeed = 0.06 + uTime * 0.035;
  float p0 = streamPulse(p, c0a, c0b, c0c, pulseSpeed + w0 * 0.2, 0.012) * w0;
  float p1 = streamPulse(p, c1a, c1b, c1c, pulseSpeed * 1.1 + 0.15 + w1 * 0.2, 0.011) * w1;
  float p2a = streamPulse(p, c2a, c2b, c2c, pulseSpeed * 0.95 + w2 * 0.15, 0.010) * w2;
  float p2b = streamPulse(p, c2a, c2b, c2c, pulseSpeed * 0.95 + 0.35 + w2 * 0.15, 0.009) * w2 * 0.7;
  float p3 = streamPulse(p, c3a, c3b, c3c, pulseSpeed * 1.05 + w3 * 0.18, 0.011) * w3;
  color += streamGold * (p0 + p1 + p2a + p2b + p3) * (0.55 + uBrandProgress * 0.25);

  float topo = mainShape * (density + intro * 0.08);
  float contour = abs(fract(topo * 7.5 + fbm(p * 2.4) * 0.35) - 0.5);
  float contourLine = smoothstep(0.065, 0.0, contour) * mainShape;
  contourLine *= mix(1.0, 0.45, uMobile);
  contourLine *= 1.0 - uExitProgress * 0.85;
  color += COL_ICE * contourLine * 0.07;

  float coreGlow = exp(-dot(p - core, p - core) / 0.018) * (0.12 + uBrandProgress * 0.35);
  coreGlow += exp(-dot(p - core, p - core) / 0.006) * w0 * 0.12;
  color += mix(COL_ICE, COL_GOLD, uBrandProgress * 0.65 + w0 * 0.2) * coreGlow;

  float corePulse = exp(-dot(p - core, p - core) / 0.004) * uBrandProgress;
  color += COL_GOLD * corePulse * (0.25 + sin(uTime * 0.55) * 0.04);

  float breathe = sin(uTime * 0.38) * 0.012 * (1.0 - uBrandProgress * 0.6);
  color += COL_MED * breathe * mainShape * 0.25;

  float grain = (hash21(gl_FragCoord.xy + uTime) - 0.5) * 0.022;
  color += grain * (1.0 - uExitProgress * 0.5);

  color = mix(color, COL_BLACK, uExitProgress * 0.72);
  color *= 1.0 - uExitProgress * 0.28;
  color = mix(color, COL_BLACK, uBrandProgress * 0.08);

  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

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

function getQuality() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;

  return {
    mobile,
    tablet,
    dpr: mobile ? 1 : tablet ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 1.5),
    fpsCap: mobile ? 30 : 60,
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
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
  } catch {
    return null;
  }

  if (!renderer.getContext()) {
    renderer.dispose();
    return null;
  }

  renderer.setClearColor(0x01040a, 1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPointerStrength: { value: 0 },
    uChapterWeights: { value: new THREE.Vector4(0, 0, 0, 0) },
    uBrandProgress: { value: 0 },
    uExitProgress: { value: 0 },
    uMobile: { value: quality.mobile ? 1 : 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const scene = new THREE.Scene();
  scene.add(mesh);

  let targetProgress = 0;
  let currentProgress = 0;
  let pointerTarget = { x: 0, y: 0 };
  let pointerCurrent = { x: 0, y: 0 };
  let pointerStrengthTarget = 0;
  let pointerStrengthCurrent = 0;

  let rafId = 0;
  let running = false;
  let visible = true;
  let disposed = false;
  let restoredOnce = false;
  let lastFrame = 0;
  const frameInterval = 1000 / quality.fpsCap;

  function updateUniformsFromProgress(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    uniforms.uProgress.value = p;
    uniforms.uChapterWeights.value.set(
      chapterWeight(p, CHAPTER_WINDOWS[0][0], CHAPTER_WINDOWS[0][1]),
      chapterWeight(p, CHAPTER_WINDOWS[1][0], CHAPTER_WINDOWS[1][1]),
      chapterWeight(p, CHAPTER_WINDOWS[2][0], CHAPTER_WINDOWS[2][1]),
      chapterWeight(p, CHAPTER_WINDOWS[3][0], CHAPTER_WINDOWS[3][1]),
    );
    uniforms.uBrandProgress.value = smoothstep(0.72, 0.93, p);
    uniforms.uExitProgress.value = smoothstep(0.91, 1, p);
  }

  function resize() {
    if (disposed) return;
    const width = canvas.clientWidth || root.clientWidth || 1;
    const height = canvas.clientHeight || root.clientHeight || 1;
    renderer.setPixelRatio(quality.dpr);
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width * quality.dpr, height * quality.dpr);
    uniforms.uMobile.value = window.matchMedia('(max-width: 767px)').matches ? 1 : 0;
  }

  function renderFrame(time) {
    const dt = lastFrame ? time - lastFrame : 16;
    lastFrame = time;

    currentProgress += (targetProgress - currentProgress) * Math.min(1, dt * 0.014);
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.06;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.06;
    pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * 0.05;

    uniforms.uTime.value = time * 0.001;
    updateUniformsFromProgress(currentProgress);
    uniforms.uPointer.value.set(pointerCurrent.x, pointerCurrent.y);
    uniforms.uPointerStrength.value = pointerStrengthCurrent;

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
    if (document.hidden) lastFrame = 0;
  }

  function onPointerMove(event) {
    if (!quality.pointerEnabled || !visible) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.x = THREE.MathUtils.clamp(pointerTarget.x, -1, 1);
    pointerTarget.y = THREE.MathUtils.clamp(pointerTarget.y, -1, 1);
    pointerStrengthTarget = 1;
  }

  function onPointerLeave() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
    pointerStrengthTarget = 0;
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
  updateUniformsFromProgress(0);

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
      pointerCurrent.x = pointerTarget.x;
      pointerCurrent.y = pointerTarget.y;
      pointerStrengthCurrent = pointerStrengthTarget;
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

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      root.classList.remove('is-webgl-ready', 'is-webgl-error');
    },

    getStats() {
      return {
        drawCalls: 1,
        triangles: 2,
        dpr: quality.dpr,
        noiseOctaves: 3,
      };
    },
  };
}
