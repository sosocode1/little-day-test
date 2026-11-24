// LITTLE DAY 월드 조립 (낮과 밤 환경 + 날씨 시스템 + 씬 관리)
import * as THREE from 'three';
import { createDayNightCycle } from './dayNightCycle.js';
import { createNightEffects } from './nightEffects.js';
import { createVillage, BOUNDARY_RADIUS } from './village.js';
import { createWeatherSystem } from '../systems/weatherSystem.js';
import { createWeatherEffects } from './weatherEffects.js';

export function createScene(timeSystem) {
  const scene = new THREE.Scene();

  // 1. 낮과 밤 환경 및 조명 관리자 (태양/달/하늘/안개/빛)
  const dayNightCycle = createDayNightCycle(scene, timeSystem);

  // 2. 날씨 시스템 및 3D 시각/음향 효과
  const weatherSystem = createWeatherSystem();
  const weatherEffects = createWeatherEffects(scene, weatherSystem, timeSystem);

  // 3. 기본 거점 마을 초기화
  const village = createVillage();

  // 4. 마을 야간 가로등, 창문 불빛 및 반딧불이 관리자
  const nightEffects = createNightEffects(scene, village.group);

  return {
    scene,
    env: dayNightCycle,
    dayNightCycle,
    nightEffects,
    weatherSystem,
    weatherEffects,
    village,
    timeSystem,
    colliders: village.colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawn: village.spawn,
    npcs: village.npcs,
    update(playerPos, isIndoor = false, dt = 0.016, currentAreaId = 'village', areaManager = null, cameraPos = null) {
      // 날씨 시스템 및 파티클/사운드 갱신
      weatherSystem.update(dt);
      weatherEffects.update(playerPos, isIndoor, dt, cameraPos);

      if (!isIndoor) {
        // 야외: 시간대 기본 조명과 날씨 계수 결합 갱신
        dayNightCycle.setIndoor(false);
        dayNightCycle.update(playerPos, weatherEffects.getCurrentModifiers());
        if (currentAreaId === 'village') {
          nightEffects.update(dt, timeSystem, false);
        } else if (areaManager) {
          areaManager.update(dt, timeSystem.isNight());
        }
      } else {
        dayNightCycle.setIndoor(true);
      }
    },
  };
}
