/**
 * Materials + runtime-generated radial textures for the background lines scene.
 * No external images, no CanvasRenderingContext2D — textures are built as DataTextures.
 */
import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

function buildRadialTextureData(size, { stretchX = 1, stretchY = 1, softness = 1.4 } = {}) {
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x - center) / center / stretchX;
      const ny = (y - center) / center / stretchY;
      const dist = Math.sqrt(nx * nx + ny * ny);
      const alpha = Math.max(0, 1 - dist) ** softness;
      const idx = (y * size + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }

  return data;
}

export function createRadialTexture(size = 32, options = {}) {
  const data = buildRadialTextureData(size, options);
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function createLineMaterial({ color, opacity, widthPx, width, height }) {
  const material = new LineMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    linewidth: widthPx,
    worldUnits: false,
    depthWrite: false,
    depthTest: true,
  });
  material.resolution.set(width, height);
  return material;
}

export function createNodeMaterial(texture, color, opacity) {
  return new THREE.SpriteMaterial({
    map: texture,
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  });
}

export function createFragmentMaterial(texture, color) {
  return new THREE.SpriteMaterial({
    map: texture,
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createParticlesMaterial(texture, sizePx) {
  return new THREE.PointsMaterial({
    map: texture,
    color: new THREE.Color('#C7D6E6'),
    size: sizePx,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
}
