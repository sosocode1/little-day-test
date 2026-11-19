import * as THREE from 'three';
import { clay, createRng } from './materials.js';

const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 1.6, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 10);

const GREENS = [0x9fd8a0, 0xb4e3a8, 0xa8dcae, 0xbfe8b0];
const FLOWER_COLORS = [0xffb3c8, 0xffe08a, 0xffffff, 0xc9b3ff, 0xffa8a8, 0xa8d8ff];

function sph(color, r, [sx, sy, sz], [x, y, z]) {
  const m = new THREE.Mesh(sphereGeo, clay(color));
  m.scale.set(r * sx, r * sy, r * sz);
  m.position.set(x, y, z);
  return m;
}

// 나무 한 그루. type: 'round' | 'cherry' | 'pine'. GLB로 교체 가능한 Group.
export function createTree(type = 'round', scale = 1) {
  const g = new THREE.Group();
  g.name = `tree-${type}`;
  const trunk = new THREE.Mesh(trunkGeo, clay(0xb98b6a));
  trunk.position.y = 0.8;
  g.add(trunk);

  if (type === 'pine') {
    for (const [r, h, y, c] of [[1.2, 1.4, 1.6, 0x8fcfa5], [0.95, 1.3, 2.4, 0x9ad7ae], [0.65, 1.2, 3.1, 0xa8e0ba]]) {
      const cone = new THREE.Mesh(coneGeo, clay(c));
      cone.scale.set(r, h, r);
      cone.position.y = y;
      g.add(cone);
    }
  } else {
    const c1 = type === 'cherry' ? 0xffc5d8 : 0x9fd8a0;
    const c2 = type === 'cherry' ? 0xffb3cc : 0xb4e3a8;
    g.add(sph(c1, 1.25, [1, 0.9, 1], [0, 2.3, 0]));
    g.add(sph(c2, 0.85, [1, 0.9, 1], [0.7, 1.9, 0.3]));
    g.add(sph(c2, 0.85, [1, 0.9, 1], [-0.65, 1.95, -0.35]));
  }
  g.scale.setScalar(scale);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

export function createBush(scale = 1) {
  const g = new THREE.Group();
  g.name = 'bush';
  g.add(sph(0x9fd8a0, 0.6, [1, 0.8, 1], [0, 0.4, 0]));
  g.add(sph(0xb4e3a8, 0.45, [1, 0.8, 1], [0.45, 0.32, 0.15]));
  g.add(sph(0xa8dcae, 0.4, [1, 0.8, 1], [-0.4, 0.3, -0.1]));
  g.scale.setScalar(scale);
  return g;
}

// 꽃밭: 풀 언덕 + InstancedMesh 꽃송이 (draw call 2~3개)
export function createFlowerBed(radius = 1.5, seed = 1, count = 30) {
  const rng = createRng(seed);
  const g = new THREE.Group();
  g.name = 'flowerbed';
  const mound = sph(0xa5d99b, radius, [1, 0.2, 1], [0, 0.02, 0]);
  mound.receiveShadow = true;
  g.add(mound);

  const heads = new THREE.InstancedMesh(sphereGeo, clay(0xffffff), count);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * radius * 0.85;
    const y = 0.2 * radius * Math.sqrt(Math.max(0, 1 - (d / radius) ** 2)) + 0.1;
    dummy.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
    dummy.scale.setScalar(0.1 + rng() * 0.04);
    dummy.updateMatrix();
    heads.setMatrixAt(i, dummy.matrix);
    heads.setColorAt(i, color.set(FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)]));
  }
  heads.instanceColor.needsUpdate = true;
  g.add(heads);
  return g;
}

// 마을 바깥 숲: 나무 전체를 InstancedMesh 3개로 그린다.
export function createForest(positions, seed = 7) {
  const rng = createRng(seed);
  const n = positions.length;
  const trunks = new THREE.InstancedMesh(trunkGeo, clay(0xb98b6a), n);
  const canopyA = new THREE.InstancedMesh(sphereGeo, clay(0xffffff), n);
  const canopyB = new THREE.InstancedMesh(sphereGeo, clay(0xffffff), n);
  const d = new THREE.Object3D();
  const col = new THREE.Color();

  positions.forEach(([x, z], i) => {
    const s = 0.9 + rng() * 0.8;
    d.rotation.set(0, 0, 0);
    d.position.set(x, 0.8 * s, z);
    d.scale.setScalar(s);
    d.updateMatrix();
    trunks.setMatrixAt(i, d.matrix);

    d.position.set(x, 2.4 * s, z);
    d.scale.set(1.5 * s, 1.35 * s, 1.5 * s);
    d.updateMatrix();
    canopyA.setMatrixAt(i, d.matrix);

    d.position.set(x + 0.7 * s, 1.9 * s, z + 0.3 * s);
    d.scale.setScalar(1.0 * s);
    d.updateMatrix();
    canopyB.setMatrixAt(i, d.matrix);

    col.set(GREENS[Math.floor(rng() * GREENS.length)]);
    canopyA.setColorAt(i, col);
    canopyB.setColorAt(i, col);
  });
  canopyA.instanceColor.needsUpdate = true;
  canopyB.instanceColor.needsUpdate = true;

  const g = new THREE.Group();
  g.name = 'forest';
  g.add(trunks, canopyA, canopyB);
  return g;
}

// 마을 경계를 둘러싸는 생울타리 (입구 쪽은 비워 둔다)
export function createHedgeRing(radius, gapHalfWidth = 3.4, step = 1.7, seed = 3) {
  const rng = createRng(seed);
  const pts = [];
  const count = Math.floor((Math.PI * 2 * radius) / step);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    if (z > 0 && Math.abs(x) < gapHalfWidth) continue; // 입구
    pts.push([x, z]);
  }
  const mesh = new THREE.InstancedMesh(sphereGeo, clay(0xffffff), pts.length);
  const d = new THREE.Object3D();
  const col = new THREE.Color();
  pts.forEach(([x, z], i) => {
    const s = 0.85 + rng() * 0.3;
    d.position.set(x, 0.55, z);
    d.scale.set(s, s * 0.85, s);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
    mesh.setColorAt(i, col.set(GREENS[Math.floor(rng() * GREENS.length)]));
  });
  mesh.instanceColor.needsUpdate = true;
  mesh.name = 'hedge';
  return mesh;
}
