import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay, glow } from './materials.js';

const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

function mk(geo, material, [x, y, z]) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  return m;
}

export function createLamp() {
  const g = new THREE.Group();
  g.name = 'lamp';
  g.add(mk(cyl(0.1, 0.14, 0.2), clay(0xd9c7b3), [0, 0.1, 0]));
  g.add(mk(cyl(0.045, 0.06, 1.9), clay(0xd9c7b3), [0, 1.05, 0]));

  // 가로등 전구: 주간/야간 발광 제어가 가능한 독립 재질
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff1b8,
    emissive: 0xffdf88,
    emissiveIntensity: 0.1,
    roughness: 1
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), bulbMat);
  bulb.name = 'lamp-bulb';
  bulb.position.set(0, 2.1, 0);
  g.add(bulb);

  // 야간 가로등 웜 라이트 (기본 강도 0, 야간에 점등)
  const lampLight = new THREE.PointLight(0xffdf88, 0, 9.0, 1.3);
  lampLight.name = 'lamp-light';
  lampLight.position.set(0, 2.05, 0);
  g.add(lampLight);

  g.add(mk(new THREE.ConeGeometry(0.26, 0.2, 12), clay(0xffc2d4), [0, 2.38, 0]));
  g.traverse((o) => {
    if (o.isMesh && o.name !== 'lamp-bulb') o.castShadow = true;
  });
  return g;
}

// 벤치 (정면 = 로컬 +z)
export function createBench() {
  const g = new THREE.Group();
  g.name = 'bench';
  const wood = clay(0xe3c29f);
  g.add(mk(rbox(1.6, 0.1, 0.5), wood, [0, 0.45, 0]));
  g.add(mk(rbox(1.6, 0.45, 0.08), wood, [0, 0.78, -0.22]));
  g.add(mk(rbox(0.1, 0.45, 0.45), clay(0xd9b48c), [-0.65, 0.22, 0]));
  g.add(mk(rbox(0.1, 0.45, 0.45), clay(0xd9b48c), [0.65, 0.22, 0]));
  g.traverse((o) => (o.castShadow = o.isMesh));
  return g;
}

export function createFountain() {
  const g = new THREE.Group();
  g.name = 'fountain';
  g.add(mk(cyl(1.6, 1.7, 0.4, 32), clay(0xf6ecdd), [0, 0.2, 0]));
  g.add(mk(cyl(1.35, 1.35, 0.06, 32), clay(0xbfe4f2), [0, 0.38, 0]));
  g.add(mk(cyl(0.2, 0.28, 1.1, 14), clay(0xf6ecdd), [0, 0.9, 0]));
  g.add(mk(new THREE.SphereGeometry(0.34, 16, 12), clay(0xbfe4f2), [0, 1.5, 0]));
  g.add(mk(cyl(0.7, 0.5, 0.15, 24), clay(0xf6ecdd), [0, 1.05, 0]));
  g.traverse((o) => (o.castShadow = o.isMesh));
  return g;
}

// 마을 입구 아치
export function createGate(halfWidth = 2.5) {
  const g = new THREE.Group();
  g.name = 'gate';
  const trim = clay(0xfffaf2);
  for (const s of [-1, 1]) {
    g.add(mk(rbox(0.7, 2.4, 0.7, 0.15), trim, [s * halfWidth, 1.2, 0]));
    g.add(mk(new THREE.SphereGeometry(0.42, 14, 10), clay(0xffc2d4), [s * halfWidth, 2.55, 0]));
  }
  g.add(mk(rbox(halfWidth * 2 + 0.7, 0.45, 0.55, 0.15), clay(0xffc2d4), [0, 2.3, 0]));
  g.add(mk(rbox(1.7, 0.6, 0.12, 0.06), clay(0xbfe3d0), [0, 1.8, 0.05]));
  g.traverse((o) => (o.castShadow = o.isMesh));
  return g;
}

// 안내 표지판
export function createSign(color = 0xbfe3d0) {
  const g = new THREE.Group();
  g.name = 'sign';
  g.add(mk(cyl(0.05, 0.05, 1.2, 8), clay(0xd9b48c), [0, 0.6, 0]));
  g.add(mk(rbox(0.8, 0.45, 0.08), clay(color), [0, 1.2, 0]));
  g.traverse((o) => (o.castShadow = o.isMesh));
  return g;
}
