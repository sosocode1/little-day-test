import * as THREE from 'three';
import { createEnvironment } from './environment.js';
import { createVillage, BOUNDARY_RADIUS } from './village.js';
import { createCottageInterior } from './cottageInterior.js';

// 월드 조립: 환경 + 마을 + 플레이어 별장 실내
export function createScene() {
  const scene = new THREE.Scene();
  const env = createEnvironment(scene);
  const village = createVillage();
  const cottage = createCottageInterior();

  scene.add(village.group);

  // 실내 공간은 처음에 숨김
  cottage.group.visible = false;
  scene.add(cottage.group);

  return {
    scene,
    env,
    village,
    cottage,
    colliders: village.colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawn: village.spawn,
    npcs: village.npcs,
    update(playerPos, isIndoor = false) {
      if (!isIndoor && village.group.visible) {
        env.update(playerPos);
      }
    },
  };
}
