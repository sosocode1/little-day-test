// LITTLE DAY 공간 전환 및 출입 처리 시스템 (마을 <-> 플레이어 별장 <-> 속삭이는 숲)
import * as THREE from 'three';

export function createSpaceManager(sceneData, player, followCamera) {
  let currentSpace = 'village'; // 'village' | 'cottage' | 'forest'
  let isTransitioning = false;
  const listeners = new Set();

  const { village, cottage, forest, boundaryRadius } = sceneData;

  // 페이드 전환 오버레이 DOM 생성
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

  function notify(space) {
    for (const cb of listeners) {
      cb(space);
    }
  }

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
      return currentSpace;
    },
    isIndoor() {
      return currentSpace === 'cottage';
    },
    isTransitioning() {
      return isTransitioning;
    },
    onSpaceChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    // 현재 활성화된 공간의 충돌체 목록
    getActiveColliders() {
      if (currentSpace === 'cottage') return cottage.colliders;
      if (currentSpace === 'forest') return forest ? forest.colliders : [];
      return village.colliders;
    },
    // 현재 활성화된 공간의 이동 제한 경계 (원형 숫자 또는 사각 박스)
    getActiveBoundary() {
      if (currentSpace === 'cottage') return cottage.boundaryBox;
      if (currentSpace === 'forest') return (forest && forest.boundaryRadius) || 30.0;
      return boundaryRadius;
    },
    // 별장 실내 입장
    async enterCottage(onDone = null) {
      if (isTransitioning || currentSpace === 'cottage') return;
      isTransitioning = true;

      try {
        // 1. 화면 암전 페이드아웃
        await fade(true);

        // 2. 월드 씬 가시성 교체
        village.group.visible = false;
        cottage.group.visible = true;
        currentSpace = 'cottage';

        // 3. 플레이어 실내 스폰 위치로 이동 (남쪽 현관 앞, 방 안쪽 북쪽을 바라봄)
        player.position.copy(cottage.spawnPos);
        player.rotation.y = 0;

        // 4. 카메라 시선 부드럽게 조정 및 스냅
        if (followCamera) {
          if (typeof followCamera.setOrientation === 'function') {
            followCamera.setOrientation(0, 0.35);
          } else {
            followCamera.yaw = 0;
            followCamera.pitch = 0.35;
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        notify(currentSpace);
        if (onDone) onDone();
      } finally {
        // 5. 화면 페이드인
        await fade(false);
        isTransitioning = false;
      }
    },
    // 마을로 나가기
    async exitCottage(onDone = null) {
      if (isTransitioning || currentSpace === 'village') return;
      isTransitioning = true;

      try {
        // 1. 화면 암전 페이드아웃
        await fade(true);

        // 2. 월드 씬 가시성 교체
        cottage.group.visible = false;
        village.group.visible = true;
        currentSpace = 'village';

        // 3. 플레이어 마을 별장 현관 앞으로 이동 (광장 쪽을 바라봄)
        player.position.copy(village.cottageEntrance.returnPos);
        player.rotation.y = village.cottageEntrance.returnYaw;

        // 4. 카메라 재조정 및 스냅
        if (followCamera) {
          if (typeof followCamera.setOrientation === 'function') {
            followCamera.setOrientation(player.rotation.y, 0.32);
          } else {
            followCamera.yaw = player.rotation.y;
            followCamera.pitch = 0.32;
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        notify(currentSpace);
        if (onDone) onDone();
      } finally {
        // 5. 화면 페이드인
        await fade(false);
        isTransitioning = false;
      }
    },
    // 속삭이는 숲 입장
    async enterForest(onDone = null) {
      if (isTransitioning || currentSpace === 'forest' || !forest) return;
      isTransitioning = true;

      try {
        // 1. 화면 암전 페이드아웃
        await fade(true);

        // 2. 월드 씬 가시성 교체 (마을 숨김, 숲 활성화)
        village.group.visible = false;
        cottage.group.visible = false;
        forest.group.visible = true;
        currentSpace = 'forest';

        // 3. 플레이어 숲 진입로 스폰 위치로 이동 (북쪽 숲 내부를 바라봄)
        player.position.copy(forest.spawnPos);
        player.rotation.y = 0; // 북쪽 방향

        // 4. 카메라 시선 부드럽게 조정 및 스냅
        if (followCamera) {
          if (typeof followCamera.setOrientation === 'function') {
            followCamera.setOrientation(0, 0.32);
          } else {
            followCamera.yaw = 0;
            followCamera.pitch = 0.32;
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        notify(currentSpace);
        if (onDone) onDone();
      } finally {
        await fade(false);
        isTransitioning = false;
      }
    },
    // 속삭이는 숲에서 마을로 나가기
    async exitForest(onDone = null) {
      if (isTransitioning || currentSpace === 'village') return;
      isTransitioning = true;

      try {
        // 1. 화면 암전 페이드아웃
        await fade(true);

        // 2. 월드 씬 가시성 교체 (숲 숨김, 마을 활성화)
        if (forest) forest.group.visible = false;
        cottage.group.visible = false;
        village.group.visible = true;
        currentSpace = 'village';

        // 3. 플레이어 마을 숲 입구 앞 복귀 위치로 이동 (마을 광장을 바라봄)
        player.position.copy(village.forestEntrance.returnPos);
        player.rotation.y = village.forestEntrance.returnYaw;

        // 4. 카메라 재조정 및 스냅
        if (followCamera) {
          if (typeof followCamera.setOrientation === 'function') {
            followCamera.setOrientation(player.rotation.y, 0.32);
          } else {
            followCamera.yaw = player.rotation.y;
            followCamera.pitch = 0.32;
          }
          if (typeof followCamera.snap === 'function') {
            followCamera.snap(player.position);
          }
        }

        notify(currentSpace);
        if (onDone) onDone();
      } finally {
        await fade(false);
        isTransitioning = false;
      }
    },
    // 침대 휴식 기능 (향후 낮과 밤 시간대 전환 시스템 연동 포인트)
    async rest(onNightDayChange = null) {
      if (isTransitioning) return;
      isTransitioning = true;
      try {
        await fade(true);
        if (typeof onNightDayChange === 'function') {
          await onNightDayChange();
        } else {
          await new Promise((r) => setTimeout(r, 280));
        }
      } finally {
        await fade(false);
        isTransitioning = false;
      }
    }
  };
}
