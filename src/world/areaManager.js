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
    conditionText: '기본 거점 (상시 이용 가능)'
  },
  forest: {
    id: 'forest',
    name: '속삭이는 숲',
    subtitle: '피톤치드와 신비의 숲',
    icon: '🌲',
    description: '시냇물이 흐르고 영롱한 이슬 버섯과 향기로운 민트 허브가 자라나는 숲입니다.',
    themeColor: '#48c9b0',
    defaultUnlocked: true,
    conditionText: '기본 탐험 지역 (해금 완료)'
  },
  moonlight_island: {
    id: 'moonlight_island',
    name: '달빛 섬',
    subtitle: '은빛 모래사장과 하얀 등대',
    icon: '🏝️',
    description: '은은한 파도 소리와 빛나는 소라, 밤하늘을 비추는 하얀 등대가 있는 신비로운 섬입니다.',
    themeColor: '#5dade2',
    defaultUnlocked: false,
    conditionText: '속삭이는 숲 탐험 또는 수집품 1종 이상 획득 시 해금'
  },
  old_mansion: {
    id: 'old_mansion',
    name: '오래된 저택',
    subtitle: '고풍스러운 앤틱 정원',
    icon: '🏰',
    description: '담쟁이덩굴과 고풍스러운 석조 분수대, 앤틱 가든이 어우러진 비밀스러운 저택 구역입니다.',
    themeColor: '#af7ac5',
    defaultUnlocked: false,
    conditionText: '달빛 섬 탐방 또는 수집품 2종 이상 획득 시 해금'
  }
};

export function createAreaManager({
  scene,
  timeSystem,
  player,
  followCamera,
  loadingScreen,
  getSystems = () => ({})
}) {
  let currentAreaId = 'village';
  let isTransitioning = false;
  const areaChangeListeners = new Set();

  // 지역별 인스턴스 캐시
  const areaInstances = new Map();

  // 해금 상태 확인 및 초기화
  function isUnlocked(areaId) {
    if (AREA_CONFIGS[areaId]?.defaultUnlocked) return true;
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(`littleday_area_unlocked_${areaId}`) === '1';
      }
    } catch (e) {}
    return false;
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
      instance = createVillage();
    } else if (areaId === 'forest') {
      const { inventorySystem, questSystem } = getSystems();
      instance = createForest(timeSystem, questSystem, inventorySystem);
    } else if (areaId === 'moonlight_island') {
      instance = createMoonlightIsland(timeSystem);
      const { lighthousePuzzleSystem } = getSystems();
      if (lighthousePuzzleSystem && typeof instance.syncPuzzleState === 'function') {
        instance.syncPuzzleState(lighthousePuzzleSystem.getState());
      }
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
    getArea(areaId) {
      return areaInstances.get(areaId) || null;
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
    unlockArea(areaId) {
      setUnlocked(areaId, true);
    },
    getUnlockedAreas() {
      const list = [];
      for (const id of Object.keys(AREA_CONFIGS)) {
        if (isUnlocked(id)) list.push(id);
      }
      return list;
    },
    restoreUnlockedAreas(areas) {
      if (!Array.isArray(areas)) return;
      for (const id of areas) {
        if (AREA_CONFIGS[id]) {
          setUnlocked(id, true);
        }
      }
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
        // 1. 로딩 화면 표시
        const destName = config ? config.name : '플레이어 별장';
        const destIcon = config ? config.icon : '🏡';
        await loadingScreen.show(destName, destIcon);

        // 2. 이전 맵 정리: 씬에서 이전 맵 3D 그룹 분리/숨김
        const prevArea = areaInstances.get(prevAreaId);
        if (prevArea && prevArea.group) {
          scene.remove(prevArea.group);
          prevArea.group.visible = false;
        }

        // 3. 새로운 맵 인스턴스 가져오기 및 씬 추가
        const newArea = getOrCreateArea(targetAreaId);
        newArea.group.visible = true;
        scene.add(newArea.group);

        // 숲인 경우 시스템 연동 재확인
        if (targetAreaId === 'forest' && typeof newArea.setSystems === 'function') {
          const { inventorySystem, questSystem } = getSystems();
          newArea.setSystems(inventorySystem, questSystem);
        }

        // 달빛 섬인 경우 등대 퍼즐 시각 상태 동기화
        if (targetAreaId === 'moonlight_island' && typeof newArea.syncPuzzleState === 'function') {
          const { lighthousePuzzleSystem } = getSystems();
          if (lighthousePuzzleSystem) {
            newArea.syncPuzzleState(lighthousePuzzleSystem.getState());
          }
        }

        currentAreaId = targetAreaId;

        // 4. 플레이어 위치 및 카메라 스냅
        const spawn = customSpawnPos || newArea.spawnPos || newArea.spawn || new THREE.Vector3(0, 0, 0);
        player.position.copy(spawn);
        player.rotation.y = customYaw;

        if (followCamera) {
          if (targetAreaId === 'cottage') {
            const camSet = newArea.cameraSettings || cottage?.cameraSettings;
            if (typeof followCamera.setDistanceRange === 'function') {
              followCamera.setDistanceRange(camSet?.minDistance || 2.0, camSet?.maxDistance || 4.2);
            }
            if (typeof followCamera.setDistance === 'function') {
              followCamera.setDistance(camSet?.distance || 3.2, true);
            }
            if (typeof followCamera.setBounds === 'function' && camSet?.bounds) {
              followCamera.setBounds(camSet.bounds);
            }
            const pitch = camSet?.pitch || 0.46;
            const camYaw = camSet?.yaw ?? 0;
            if (typeof followCamera.setOrientation === 'function') {
              followCamera.setOrientation(camYaw, pitch);
            } else {
              followCamera.yaw = camYaw;
              followCamera.pitch = pitch;
            }
            if (typeof followCamera.setOccluders === 'function') {
              followCamera.setOccluders(newArea.occluders, newArea.group);
            }
          } else {
            // 야외 (마을, 속삭이는 숲, 달빛 섬, 오래된 저택) 카메라 기본 설정 복원
            if (typeof followCamera.clearOccluders === 'function') {
              followCamera.clearOccluders();
            }
            if (typeof followCamera.setDistanceRange === 'function') {
              followCamera.setDistanceRange(2.0, 8.5);
            }
            if (typeof followCamera.clearBounds === 'function') {
              followCamera.clearBounds();
            }
            if (typeof followCamera.setDistance === 'function') {
              if (prevAreaId === 'cottage') {
                // 실내에서 야외로 나올 때 기본 야외 거리(5.0)로 복원
                followCamera.setDistance(5.0, true);
              } else {
                // 야외 구역 간 이동(마을 <-> 숲 등) 시에는 기존 줌 거리를 야외 범위 내에서 자연스럽게 유지
                const curDist = followCamera.targetDistance || followCamera.distance || 5.0;
                followCamera.setDistance(curDist, true);
              }
            }
            if (typeof followCamera.setOrientation === 'function') {
              if (prevAreaId === 'cottage') {
                // 실내에서 마을로 나올 때 캐릭터와 오두막이 시원하게 보이는 탁 트인 각도
                followCamera.setOrientation(0.0, 0.35);
              } else {
                followCamera.setOrientation(customYaw, 0.32);
              }
            } else {
              followCamera.yaw = prevAreaId === 'cottage' ? 0.0 : customYaw;
              followCamera.pitch = prevAreaId === 'cottage' ? 0.35 : 0.32;
            }
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        // 5. 로딩 지연 (자연스러운 체감)
        await new Promise((r) => setTimeout(r, 380));

        // 6. 지역 전환 알림
        notifyAreaChange(targetAreaId, prevAreaId);

        // 7. 도착 토스트 표시
        const { questSystem } = getSystems();
        if (questSystem?.ui?.showToast && config) {
          questSystem.ui.showToast(`${config.name}에 도착했습니다! ${config.icon}✨`, config.icon, 3000);
        }

        return true;
      } finally {
        // 8. 로딩 화면 부드럽게 닫기
        await loadingScreen.hide();
        isTransitioning = false;
      }
    },

    // 별장 실내 입장 (마을 전용, 실내를 바라보도록 Math.PI 회전)
    async enterCottage() {
      return this.travelTo('cottage', cottage.spawnPos, Math.PI);
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
