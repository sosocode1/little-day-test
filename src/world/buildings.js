import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';

const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);

function mk(geo, color, [x, y, z], ry = 0) {
  const m = new THREE.Mesh(geo, clay(color));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  return m;
}

// 작은 유럽풍 집 (그레이박스). 정면은 로컬 +z. 나중에 GLB로 통째로 교체 가능한 Group.
export function createHouse({
  width = 5,
  depth = 4.4,
  height = 2.6,
  roofHeight = 2.2,
  wall = 0xffdcc8,
  roof = 0xb7d5f5,
  door = 0x9fc7ea,
  trim = 0xfffaf2,
  chimney = 0xe8b7a6,
  glass = 0xcfeaf7,
} = {}) {
  const g = new THREE.Group();
  g.name = 'house';

  g.add(mk(rbox(width + 0.3, 0.35, depth + 0.3, 0.1), trim, [0, 0.175, 0])); // 기단
  const body = mk(rbox(width, height, depth, 0.28), wall, [0, height / 2 + 0.05, 0]);
  g.add(body);

  // 지붕 (사각뿔) – 처마가 살짝 튀어나오게
  const roofGeo = new THREE.ConeGeometry(Math.SQRT2, roofHeight, 4, 1).rotateY(Math.PI / 4);
  const roofMesh = mk(roofGeo, roof, [0, height + roofHeight / 2 - 0.05, 0]);
  roofMesh.scale.set(width / 2 + 0.5, 1, depth / 2 + 0.5);
  g.add(roofMesh);

  g.add(mk(rbox(0.6, 1.2, 0.6, 0.1), chimney, [width * 0.22, height + roofHeight * 0.38, -depth * 0.15]));

  // 문
  const zf = depth / 2;
  g.add(mk(rbox(1.2, 1.75, 0.1, 0.06), trim, [0, 0.95, zf + 0.01]));
  g.add(mk(rbox(0.95, 1.55, 0.14, 0.06), door, [0, 0.9, zf + 0.04]));
  g.add(mk(new THREE.SphereGeometry(0.06, 10, 8), 0xfff1a8, [0.3, 0.9, zf + 0.13]));
  g.add(mk(rbox(1.6, 0.12, 0.7, 0.05), trim, [0, 0.06, zf + 0.4])); // 현관 계단

  // 앞/옆 창문
  const wy = height * 0.6 + 0.05;
  for (const s of [-1, 1]) {
    const wx = s * (width / 2 - 0.95);
    g.add(mk(rbox(1.0, 1.0, 0.1, 0.06), trim, [wx, wy, zf + 0.01]));
    g.add(mk(rbox(0.78, 0.78, 0.12, 0.05), glass, [wx, wy, zf + 0.04]));
    g.add(mk(rbox(0.2, 0.9, 0.1, 0.05), door, [wx + s * 0.62, wy, zf + 0.03])); // 덧창
    g.add(mk(rbox(1.0, 0.18, 0.28, 0.06), door, [wx, wy - 0.62, zf + 0.15])); // 꽃 상자

    g.add(mk(rbox(0.1, 1.0, 1.0, 0.06), trim, [s * (width / 2 + 0.01), wy, 0]));
    g.add(mk(rbox(0.12, 0.78, 0.78, 0.05), glass, [s * (width / 2 + 0.04), wy, 0]));
  }

  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

// 충돌 박스 정보 (집 중심, 로컬 크기 → 콜라이더)
export function houseCollider(x, z, rot, { width = 5, depth = 4.4 } = {}) {
  return { type: 'box', x, z, hw: width / 2 + 0.15, hd: depth / 2 + 0.15, rot };
}
