// LITTLE DAY 월드 조립 (낮과 밤 환경 + 씬 관리)
import * as THREE from 'three';
import { createDayNightCycle } from './dayNightCycle.js';
import { createNightEffects } from './nightEffects.js';
import { createVillage, BOUNDARY_RADIUS } from './village.js';

export function createScene(timeSystem) {
  const scene = new THREE.Scene();

  // 낮과 밤 환경 및 조명 관리자 (태양/달/하늘/안개/빛)
  const dayNightCycle = createDayNightCycle(scene, timeSystem);

  // 기본 거점 마을 초기화
  const village = createVillage();

  // 마을 야간 가로등, 창문 불빛 및 반딧불이 관리자
  const nightEffects = createNightEffects(scene, village.group);

  return {
    scene,
    env: dayNightCycle,
    dayNightCycle,
    nightEffects,
    village,
    timeSystem,
    colliders: village.colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawn: village.spawn,
    npcs: village.npcs,
    update(playerPos, isIndoor = false, dt = 0.016, currentAreaId = 'village', areaManager = null) {
      if (!isIndoor) {
        dayNightCycle.update(playerPos);
        if (currentAreaId === 'village') {
          nightEffects.update(dt, timeSystem, false);
        } else if (areaManager) {
          areaManager.update(dt, timeSystem.isNight());
        }
      }
    },
  };
}
