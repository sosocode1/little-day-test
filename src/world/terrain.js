import * as THREE from 'three';
import { clay } from './materials.js';

// 마을 지형: 마을 잔디 + 바깥 숲 바닥
export function createTerrain({ villageRadius, outerRadius }) {
  const group = new THREE.Group();
  group.name = 'terrain';

  const village = new THREE.Mesh(new THREE.CircleGeometry(villageRadius, 64), clay(0xcdeebf));
  village.rotation.x = -Math.PI / 2;
  village.receiveShadow = true;

  const outer = new THREE.Mesh(new THREE.CircleGeometry(outerRadius, 48), clay(0xb5dba9));
  outer.rotation.x = -Math.PI / 2;
  outer.position.y = -0.03;
  outer.receiveShadow = true;

  group.add(outer, village);
  return group;
}
