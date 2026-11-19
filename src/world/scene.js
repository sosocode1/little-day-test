import * as THREE from 'three';
import { createDayNightCycle } from './dayNightCycle.js';
import { createNightEffects } from './nightEffects.js';
import { createVillage, BOUNDARY_RADIUS } from './village.js';
import { createCottageInterior } from './cottageInterior.js';

// 월드 조립: 낮과 밤 환경 + 야간 연출(가로등/창문/반딧불이) + 마을 + 플레이어 별장 실내
export function createScene(timeSystem) {
  const scene = new THREE.Scene();
  const village = createVillage();
  const cottage = createCottageInterior();

  // 낮과 밤 환경 및 조명 관리자
  const dayNightCycle = createDayNightCycle(scene, timeSystem);

  // 야간 가로등, 창문 불빛 및 반딧불이 관리자
  const nightEffects = createNightEffects(scene, village.group);

  scene.add(village.group);

  // 실내 공간은 처음에 숨김
  cottage.group.visible = false;
  scene.add(cottage.group);

  return {
    scene,
    env: dayNightCycle,
    dayNightCycle,
    nightEffects,
    village,
    cottage,
    timeSystem,
    colliders: village.colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawn: village.spawn,
    npcs: village.npcs,
    update(playerPos, isIndoor = false, dt = 0.016) {
      if (!isIndoor && village.group.visible) {
        dayNightCycle.update(playerPos);
        nightEffects.update(dt, timeSystem, isIndoor);
      }
    },
  };
}
