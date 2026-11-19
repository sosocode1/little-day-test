import * as THREE from 'three';
import { clay } from './materials.js';

const discGeo = new THREE.CylinderGeometry(1, 1, 1, 40);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// 중앙 광장: 이중 원판
export function createPlaza(radius = 6) {
  const group = new THREE.Group();
  group.name = 'plaza';
  const base = new THREE.Mesh(discGeo, clay(0xf3e4cc));
  base.scale.set(radius, 0.05, radius);
  base.position.y = 0.025;
  const ring = new THREE.Mesh(discGeo, clay(0xe9d4b6));
  ring.scale.set(radius * 0.72, 0.05, radius * 0.72);
  ring.position.y = 0.04;
  const inner = new THREE.Mesh(discGeo, clay(0xf3e4cc));
  inner.scale.set(radius * 0.66, 0.05, radius * 0.66);
  inner.position.y = 0.045;
  for (const m of [base, ring, inner]) m.receiveShadow = true;
  group.add(base, ring, inner);
  return group;
}

// 두 점 사이의 길 (끝은 둥글게)
export function createPathSegment(a, b, width = 2) {
  const group = new THREE.Group();
  group.name = 'path';
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  const color = 0xf0dfc4;

  const strip = new THREE.Mesh(boxGeo, clay(color));
  strip.scale.set(width, 0.03, len);
  strip.position.set((a[0] + b[0]) / 2, 0.015, (a[1] + b[1]) / 2);
  strip.rotation.y = Math.atan2(dx, dz);
  strip.receiveShadow = true;
  group.add(strip);

  for (const p of [a, b]) {
    const cap = new THREE.Mesh(discGeo, clay(color));
    cap.scale.set(width / 2, 0.03, width / 2);
    cap.position.set(p[0], 0.015, p[1]);
    cap.receiveShadow = true;
    group.add(cap);
  }
  return group;
}
