// LITTLE DAY 공간 전환 및 출입 처리 시스템 (마을 <-> 플레이어 별장 <-> 속삭이는 숲 <-> 달빛 섬 <-> 오래된 저택)
import * as THREE from 'three';

export function createSpaceManager(sceneData, player, followCamera, areaManager = null) {
  const { village, cottage, boundaryRadius } = sceneData;

  // 페이드 전환 오버레이 DOM 생성 (침대 휴식 및 실내 출입용)
  const fadeOverlay = document.createElement('div');
  fadeOverlay.id = 'space-fade-overlay';
  fadeOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #3b2832;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s ease;
    z-index: 500;
  `;
  document.body.appendChild(fadeOverlay);

  function fade(inOrOut) {
    return new Promise((resolve) => {
      if (inOrOut) {
        fadeOverlay.style.opacity = '1';
        fadeOverlay.style.pointerEvents = 'auto';
      } else {
        fadeOverlay.style.opacity = '0';
        fadeOverlay.style.pointerEvents = 'none';
      }
      setTimeout(resolve, 230);
    });
  }

  return {
    getCurrentSpace() {
      return areaManager ? areaManager.getCurrentAreaId() : 'village';
    },
    isIndoor() {
      return areaManager ? areaManager.isIndoor() : false;
    },
    isTransitioning() {
      return areaManager ? areaManager.isTransitioning() : false;
    },
    onSpaceChange(cb) {
      if (areaManager) return areaManager.onAreaChange(cb);
      return () => {};
    },
    // 현재 활성화된 공간의 충돌체 목록
    getActiveColliders() {
      if (areaManager) return areaManager.getActiveColliders();
      return village ? village.colliders : [];
    },
    // 현재 활성화된 공간의 이동 제한 경계 (원형 숫자 또는 사각 박스)
    getActiveBoundary() {
      if (areaManager) return areaManager.getActiveBoundary();
      return boundaryRadius || 23.2;
    },

    // 별장 실내 입장
    async enterCottage(onDone = null) {
      if (areaManager) {
        await areaManager.enterCottage();
        if (onDone) onDone();
      }
    },

    // 별장에서 마을로 나가기
    async exitCottage(onDone = null) {
      if (areaManager && village?.cottageEntrance) {
        await areaManager.exitCottage(
          village.cottageEntrance.returnPos,
          village.cottageEntrance.returnYaw
        );
        if (onDone) onDone();
      }
    },

    // 속삭이는 숲 입장
    async enterForest(onDone = null) {
      if (areaManager) {
        await areaManager.travelTo('forest');
        if (onDone) onDone();
      }
    },

    // 속삭이는 숲에서 마을로 나가기
    async exitForest(onDone = null) {
      if (areaManager) {
        const returnPos = village?.forestEntrance?.returnPos || new THREE.Vector3(-2.0, 0, -14.0);
        const returnYaw = village?.forestEntrance?.returnYaw || Math.PI;
        await areaManager.travelTo('village', returnPos, returnYaw);
        if (onDone) onDone();
      }
    },

    // 임의의 지역으로 이동 (월드맵 연동)
    async travelTo(areaId, spawnPos = null, yaw = 0) {
      if (areaManager) {
        return areaManager.travelTo(areaId, spawnPos, yaw);
      }
      return false;
    },

    // 침대 휴식 기능 (낮과 밤 시간대 전환 시스템 연동 포인트)
    async rest(onNightDayChange = null) {
      try {
        await fade(true);
        if (typeof onNightDayChange === 'function') {
          await onNightDayChange();
        } else {
          await new Promise((r) => setTimeout(r, 280));
        }
      } finally {
        await fade(false);
      }
    }
  };
}
