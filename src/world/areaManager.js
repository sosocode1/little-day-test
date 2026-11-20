// LITTLE DAY 월드맵 및 독립 3D 지역 관리 시스템 (Area Manager)
// - 4개 독립 3D 맵 (마을, 속삭이는 숲, 달빛 섬, 오래된 저택)
// - 지역 이동 시 이전 맵 오브젝트 정리 및 대상 지역만 씬 로딩
// - 플레이어, 인벤토리, 퀘스트, 보유 아이템 100% 유지
// - 잠금/해금 상태 관리 및 영구 저장

import * as THREE from 'three';
import { createVillage, BOUNDARY_RADIUS as VILLAGE_BOUNDARY } from './village.js';
import { createForest } from './forest.js';
import { createMoonlightIsland } from './moonlightIsland.js';
import { createOldMansion } from './oldMansion.js';
import { createCottageInterior } from './cottageInterior.js';

// 지역 메타데이터 정의
export const AREA_CONFIGS = {
  village: {
    id: 'village',
    name: '달맞이 마을',
    subtitle: '평화로운 삶의 거점',
    icon: '🏡',
    description: '아기자기한 집들과 다정한 동물 이웃들이 모여 사는 따뜻한 마을입니다.',
    themeColor: '#ff98b2',
    defaultUnlocked: true,
    conditionText: '기본 거점 (상시 이용 가능)',
    map: { x: 24, y: 62, size: 15 },
    terrain: 'meadow'
  },
  forest: {
    id: 'forest',
    name: '속삭이는 숲',
    subtitle: '피톤치드와 신비의 숲',
    icon: '🌲',
    description: '시냇물이 흐르고 영롱한 이슬 버섯과 향기로운 민트 허브가 자라나는 숲입니다.',
    themeColor: '#48c9b0',
    defaultUnlocked: true,
    conditionText: '기본 탐험 지역 (해금 완료)',
    map: { x: 44, y: 24, size: 14 },
    terrain: 'forest'
  },
  moonlight_island: {
    id: 'moonlight_island',
    name: '달빛 섬',
    subtitle: '은빛 모래사장과 하얀 등대',
    icon: '🏝️',
    description: '은은한 파도 소리와 빛나는 소라, 밤하늘을 비추는 하얀 등대가 있는 신비로운 섬입니다.',
    themeColor: '#5dade2',
    defaultUnlocked: false,
    conditionText: '속삭이는 숲 탐험 또는 수집품 1종 이상 획득 시 해금',
    map: { x: 70, y: 56, size: 14 },
    terrain: 'moon'
  },
  old_mansion: {
    id: 'old_mansion',
    name: '오래된 저택',
    subtitle: '고풍스러운 앤틱 정원',
    icon: '🏰',
    description: '담쟁이덩굴과 고풍스러운 석조 분수대, 앤틱 가든이 어우러진 비밀스러운 저택 구역입니다.',
    themeColor: '#af7ac5',
    defaultUnlocked: false,
    conditionText: '달빛 섬 탐방 또는 수집품 2종 이상 획득 시 해금',
    map: { x: 80, y: 20, size: 13 },
    terrain: 'mansion'
  },
  // 임시 표시용 (미구현): 이동 불가, 완성된 지역처럼 취급하지 않음
  coming_soon: {
    id: 'coming_soon',
    name: '안개 속 미지의 섬',
    subtitle: '준비 중인 다음 모험지',
    icon: '❓',
    description: '안개에 가려 아직 모습을 알 수 없는 섬입니다. 앞으로의 업데이트에서 만나볼 수 있어요.',
    themeColor: '#aab7b8',
    defaultUnlocked: false,
    comingSoon: true,
    conditionText: '아직 준비 중인 지역입니다 (임시 표시, 이동 불가)',
    map: { x: 52, y: 80, size: 11 },
    terrain: 'fog'
  }
};

export function createAreaManager({
  scene,
  timeSystem,
  player,
  followCamera,
  loadingScreen,
  village = null,
  getSystems = () => ({})
}) {
  let currentAreaId = 'village';
  let isTransitioning = false;
  const areaChangeListeners = new Set();

  // 지역별 인스턴스 캐시
  const areaInstances = new Map();

  // 해금 상태 확인 및 초기화
  function isUnlocked(areaId) {
    if (AREA_CONFIGS[areaId]?.comingSoon) return false;
    if (AREA_CONFIGS[areaId]?.defaultUnlocked) return true;
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(`littleday_area_unlocked_${areaId}`) === '1';
      }
    } catch (e) {}
    return false;
  }

  function wasVisited(areaId) {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(`littleday_area_visited_${areaId}`) === '1';
    } catch (e) {
      return false;
    }
  }

  function markVisited(areaId) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(`littleday_area_visited_${areaId}`, '1');
    } catch (e) {}
  }

  // 수집한 숲 수집품 종 수 (forestCollectibles 의 영구 저장 키 기준)
  function countCollected() {
    let n = 0;
    try {
      if (typeof localStorage === 'undefined') return 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('littleday_col_') && localStorage.getItem(k) === '1') n++;
      }
    } catch (e) {}
    return n;
  }

  // 조건 충족 시 자동 해금 (맵 열 때 / 지역 이동 후 호출). 새로 해금된 지역 ID 배열 반환
  function evaluateUnlocks() {
    const newly = [];
    const collected = countCollected();
    const rules = {
      moonlight_island: () => wasVisited('forest') || collected >= 1,
      old_mansion: () => wasVisited('moonlight_island') || collected >= 2
    };
    for (const [id, rule] of Object.entries(rules)) {
      if (!isUnlocked(id) && rule()) {
        setUnlocked(id, true);
        newly.push(id);
      }
    }
    return newly;
  }

  // 떠나는 지역의 Three.js 리소스 해제 (마을/별장은 상시 유지)
  function disposeArea(areaId) {
    if (areaId === 'village' || areaId === 'cottage') return;
    const inst = areaInstances.get(areaId);
    if (!inst) return;
    if (typeof inst.dispose === 'function') {
      inst.dispose();
    } else {
      inst.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    areaInstances.delete(areaId);
  }

  function setUnlocked(areaId, unlocked = true) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`littleday_area_unlocked_${areaId}`, unlocked ? '1' : '0');
      }
    } catch (e) {}
  }

  // 지역 인스턴스 팩토리
  function getOrCreateArea(areaId) {
    if (areaInstances.has(areaId)) {
      return areaInstances.get(areaId);
    }

    let instance;
    if (areaId === 'village') {
      instance = village || createVillage();
    } else if (areaId === 'forest') {
      const { inventorySystem, questSystem } = getSystems();
      instance = createForest(timeSystem, questSystem, inventorySystem);
    } else if (areaId === 'moonlight_island') {
      instance = createMoonlightIsland(timeSystem);
    } else if (areaId === 'old_mansion') {
      instance = createOldMansion(timeSystem);
    } else if (areaId === 'cottage') {
      instance = createCottageInterior();
    }

    if (instance) {
      areaInstances.set(areaId, instance);
    }
    return instance;
  }

  // 초기 시작 지역: 마을 로딩 및 씬 추가
  const initialVillage = getOrCreateArea('village');
  scene.add(initialVillage.group);

  // 별장 실내 인스턴스도 사전 준비 (별장 출입 지원)
  const cottage = getOrCreateArea('cottage');
  cottage.group.visible = false;

  function notifyAreaChange(newAreaId, prevAreaId) {
    for (const cb of areaChangeListeners) {
      cb(newAreaId, prevAreaId);
    }
  }

  return {
    getCurrentAreaId() {
      return currentAreaId;
    },
    getCurrentArea() {
      return areaInstances.get(currentAreaId);
    },
    getCottage() {
      return cottage;
    },
    isIndoor() {
      return currentAreaId === 'cottage';
    },
    isTransitioning() {
      return isTransitioning;
    },
    isUnlocked(areaId) {
      return isUnlocked(areaId);
    },
    evaluateUnlocks,
    getVillageDock() {
      return initialVillage.dock;
    },
    unlockArea(areaId) {
      setUnlocked(areaId, true);
    },
    onAreaChange(cb) {
      areaChangeListeners.add(cb);
      return () => areaChangeListeners.delete(cb);
    },

    // 현재 활성화된 지역의 충돌체 목록
    getActiveColliders() {
      if (currentAreaId === 'cottage') {
        return cottage.colliders || [];
      }
      const cur = areaInstances.get(currentAreaId);
      return cur ? cur.colliders : [];
    },

    // 현재 활성화된 지역의 경계 반경 또는 박스
    getActiveBoundary() {
      if (currentAreaId === 'cottage') {
        return cottage.boundaryBox;
      }
      const cur = areaInstances.get(currentAreaId);
      if (cur && cur.boundaryRadius) return cur.boundaryRadius;
      return VILLAGE_BOUNDARY;
    },

    // 지역 이동 (Travel To) - 이전 맵 정리 + 로딩 화면 + 새 맵 로딩
    async travelTo(targetAreaId, customSpawnPos = null, customYaw = 0) {
      if (isTransitioning || targetAreaId === currentAreaId) return false;
      const config = AREA_CONFIGS[targetAreaId];
      if (!config && targetAreaId !== 'cottage') return false;
      if (config?.comingSoon) return false;

      // 잠금 확인
      if (targetAreaId !== 'cottage' && !isUnlocked(targetAreaId)) {
        const { questSystem } = getSystems();
        if (questSystem?.ui?.showToast) {
          questSystem.ui.showToast(`[${config.name}]은(는) 아직 잠겨 있습니다. 해금 조건을 확인해보세요! 🔒`, '🔒', 2600);
        }
        return false;
      }

      isTransitioning = true;
      const prevAreaId = currentAreaId;

      try {
        // 1. 로딩 화면 표시 (섬 이동은 항해 연출)
        const destName = config ? config.name : '플레이어 별장';
        const destIcon = config ? config.icon : '🏡';
        const isVoyage = ['moonlight_island', 'old_mansion'].includes(targetAreaId) ||
          ['moonlight_island', 'old_mansion'].includes(prevAreaId);
        await loadingScreen.show(destName, isVoyage ? '⛵' : destIcon, isVoyage ? '⛵ 잔잔한 파도를 가르며 항해 중입니다...' : null);

        // 2. 이전 맵 정리: 씬에서 분리하고 마을/별장 외 지역은 리소스까지 해제
        const prevArea = areaInstances.get(prevAreaId);
        if (prevArea && prevArea.group) {
          scene.remove(prevArea.group);
          prevArea.group.visible = false;
        }
        disposeArea(prevAreaId);

        // 3. 새로운 맵 인스턴스 가져오기 및 씬 추가
        const newArea = getOrCreateArea(targetAreaId);
        newArea.group.visible = true;
        scene.add(newArea.group);

        // 숲인 경우 시스템 연동 재확인
        if (targetAreaId === 'forest' && typeof newArea.setSystems === 'function') {
          const { inventorySystem, questSystem } = getSystems();
          newArea.setSystems(inventorySystem, questSystem);
        }

        currentAreaId = targetAreaId;
        if (targetAreaId !== 'cottage') markVisited(targetAreaId);

        // 4. 플레이어 위치 및 카메라 스냅 (마을 복귀 기본 위치는 부두)
        const dockReturn = targetAreaId === 'village' && !customSpawnPos && prevAreaId !== 'cottage' ? initialVillage.dock : null;
        if (dockReturn) customYaw = dockReturn.returnYaw;
        const spawn = customSpawnPos || dockReturn?.returnPos || newArea.spawnPos || newArea.spawn || new THREE.Vector3(0, 0, 0);
        player.position.copy(spawn);
        player.rotation.y = customYaw;

        if (followCamera) {
          if (typeof followCamera.setOrientation === 'function') {
            followCamera.setOrientation(customYaw, 0.32);
          } else {
            followCamera.yaw = customYaw;
            followCamera.pitch = 0.32;
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        // 5. 로딩 지연 (자연스러운 체감)
        await new Promise((r) => setTimeout(r, 380));

        // 6. 지역 전환 알림
        notifyAreaChange(targetAreaId, prevAreaId);

        // 7. 도착 토스트 표시 + 조건 충족 시 새 지역 자동 해금 안내
        const { questSystem } = getSystems();
        if (questSystem?.ui?.showToast && config) {
          questSystem.ui.showToast(`${config.name}에 도착했습니다! ${config.icon}✨`, config.icon, 3000);
        }
        const newly = evaluateUnlocks();
        if (questSystem?.ui?.showToast) {
          newly.forEach((id, i) => {
            setTimeout(() => {
              questSystem.ui.showToast(`새로운 항로 발견! [${AREA_CONFIGS[id].name}] 이(가) 해금되었습니다 ${AREA_CONFIGS[id].icon}`, AREA_CONFIGS[id].icon, 3200);
            }, 3200 + i * 3300);
          });
        }

        return true;
      } finally {
        // 8. 로딩 화면 부드럽게 닫기
        await loadingScreen.hide();
        isTransitioning = false;
      }
    },

    // 별장 실내 입장 (마을 전용)
    async enterCottage() {
      return this.travelTo('cottage', cottage.spawnPos, 0);
    },

    // 별장에서 마을로 나가기
    async exitCottage(villageReturnPos, returnYaw) {
      return this.travelTo('village', villageReturnPos, returnYaw);
    },

    // 현재 활성화된 지역 프레임 갱신
    update(dt, isNight = false) {
      if (currentAreaId === 'cottage') return;

      const curArea = areaInstances.get(currentAreaId);
      if (curArea && typeof curArea.update === 'function') {
        curArea.update(dt, isNight);
      }
    }
  };
}
