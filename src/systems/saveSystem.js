// LITTLE DAY 통합 세이브 & 로드 시스템 (Unified Save & Load System)
// - 플레이어 위치, 구역, 외형 커스터마이징, 장착 슬롯, 인벤토리, 퀘스트, 지역 해금 상태 통합 관리
// - 단일 데이터 구조 관리 및 localStorage 기반 자동 영구 저장
// - 기존 개별 localStorage 데이터 마이그레이션 및 하위 호환성 완벽 지원
// - 데이터 버전 관리 및 손상 시 안전한 기본값 폴백

const SAVE_KEY = 'littleday_save_data';
const CURRENT_VERSION = 1;

export function createSaveSystem({
  player,
  areaManager,
  questSystem,
  inventorySystem,
  timeSystem,
  moonflowerEvent,
  flowerManager,
  weatherSystem = null
}) {
  let saveTimer = null;

  // 기존 개별 localStorage 키 마이그레이션 헬퍼
  function migrateLegacyData() {
    const legacy = {
      unlockedAreas: ['village', 'forest'],
      moonflowerDone: false,
      collectibles: {},
      guideSeen: false
    };

    try {
      if (typeof localStorage === 'undefined') return legacy;

      // 1. 달빛 꽃 이벤트 완료 여부
      if (localStorage.getItem('littleday_event_moonflower_done') === '1') {
        legacy.moonflowerDone = true;
      }

      // 2. 조작 가이드 열람 여부
      if (localStorage.getItem('littleday_guide_seen') === '1') {
        legacy.guideSeen = true;
      }

      // 3. 지역 해금 상태
      for (const areaId of ['village', 'forest', 'moonlight_island', 'old_mansion']) {
        if (localStorage.getItem(`littleday_area_unlocked_${areaId}`) === '1') {
          if (!legacy.unlockedAreas.includes(areaId)) {
            legacy.unlockedAreas.push(areaId);
          }
        }
      }

      // 4. 수집품 채집 상태
      for (const colId of ['forest_dew_mushroom', 'whisper_mint_herb']) {
        if (localStorage.getItem(`littleday_item_${colId}`) === '1') {
          legacy.collectibles[colId] = true;
        }
      }

      // 5. 퀘스트 완료 및 보상 아이템 상태
      if (localStorage.getItem('littleday_quest_completed') === '1') {
        legacy.questCompleted = true;
      }
      if (
        localStorage.getItem('littleday_item_moonlight_brooch') === '1' ||
        localStorage.getItem('littleday_quest_reward_claimed') === '1'
      ) {
        legacy.rewardClaimed = true;
      }
    } catch (e) {
      console.warn('[SaveSystem] Error reading legacy storage:', e);
    }

    return legacy;
  }

  // 통합 세이브 데이터 추출
  function collectSaveData() {
    // 1. 플레이어 위치 및 현재 지역
    const currentAreaId = areaManager ? areaManager.getCurrentAreaId() : 'village';
    const playerPos = player ? {
      x: Number(player.position.x.toFixed(3)),
      y: Number(player.position.y.toFixed(3)),
      z: Number(player.position.z.toFixed(3))
    } : { x: 0, y: 0, z: 11 };
    const playerRotY = player ? Number(player.rotation.y.toFixed(3)) : 0;

    // 2. 캐릭터 외형 커스터마이징 정보
    let appearance = null;
    if (player && typeof player.getAppearance === 'function') {
      appearance = player.getAppearance();
    } else if (player?.userData?.character?.getAppearance) {
      appearance = player.userData.character.getAppearance();
    }

    // 3. 인벤토리 및 장착 상태
    const invData = inventorySystem && typeof inventorySystem.getStateData === 'function'
      ? inventorySystem.getStateData()
      : { acquiredItemIds: [], equipped: {} };

    // 4. 퀘스트 상태
    const questData = questSystem && typeof questSystem.getStateData === 'function'
      ? questSystem.getStateData()
      : { id: 'fox_pink_flower', state: 'NOT_STARTED', collectedCount: 0, rewardClaimed: false };

    // 5. 월드 및 이벤트 상태
    const legacy = migrateLegacyData();
    const unlockedAreas = areaManager && typeof areaManager.getUnlockedAreas === 'function'
      ? areaManager.getUnlockedAreas()
      : legacy.unlockedAreas;

    const moonflowerDone = moonflowerEvent && typeof moonflowerEvent.isCompleted === 'function'
      ? moonflowerEvent.isCompleted()
      : legacy.moonflowerDone;

    // 6. 시간 상태
    const timeData = timeSystem ? {
      mode: timeSystem.getMode(),
      currentTime: Number(timeSystem.getTime().toFixed(4)),
      day: typeof timeSystem.getDay === 'function' ? timeSystem.getDay() : 1
    } : { mode: 'auto', currentTime: 12, day: 1 };

    return {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      player: {
        areaId: currentAreaId,
        position: playerPos,
        rotationY: playerRotY
      },
      appearance: appearance ? {
        hairStyle: appearance.hairStyle,
        hair: appearance.hair,
        hairAccent: appearance.hairAccent,
        skin: appearance.skin,
        eyeColor: appearance.eyeColor,
        eyeStyle: appearance.eyeStyle,
        expression: appearance.expression,
        hatVisible: appearance.hatVisible !== false,
        bagVisible: appearance.bagVisible !== false
      } : null,
      inventory: invData,
      quest: questData,
      world: {
        unlockedAreas,
        moonflowerDone,
        collectibles: legacy.collectibles
      },
      time: timeData,
      weather: weatherSystem && typeof weatherSystem.exportData === 'function'
        ? weatherSystem.exportData()
        : null
    };
  }

  // 저장 실행 (디바운스 지원)
  function save(immediate = false) {
    if (immediate) {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      doSave();
    } else {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(doSave, 300);
    }
  }

  function doSave() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const data = collectSaveData();
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));

      // 기존 개별 키 동기화 유지 (하위 호환성)
      if (data.world?.moonflowerDone) {
        localStorage.setItem('littleday_event_moonflower_done', '1');
      }
      if (data.quest?.state === 'COMPLETED' || data.quest?.rewardClaimed) {
        localStorage.setItem('littleday_quest_completed', '1');
        localStorage.setItem('littleday_quest_reward_claimed', '1');
      }
      if (
        Array.isArray(data.inventory?.acquiredItemIds) &&
        data.inventory.acquiredItemIds.includes('moonlight_brooch')
      ) {
        localStorage.setItem('littleday_item_moonlight_brooch', '1');
      }
      if (Array.isArray(data.world?.unlockedAreas)) {
        for (const id of data.world.unlockedAreas) {
          localStorage.setItem(`littleday_area_unlocked_${id}`, '1');
        }
      }
      return true;
    } catch (e) {
      console.warn('[SaveSystem] Save failed:', e);
      return false;
    }
  }

  // 저장 데이터 로드
  function load() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (e) {
      console.warn('[SaveSystem] Corrupted save data, falling back to defaults:', e);
    }
    return null;
  }

  // 저장 데이터 복원 실행
  async function restore(savedData = null) {
    const data = savedData || load();
    if (!data) return false;

    try {
      // 1. 외형 커스터마이징 복원
      if (data.appearance && player) {
        if (typeof player.setAppearance === 'function') {
          player.setAppearance({
            hairStyle: data.appearance.hairStyle,
            hairColor: data.appearance.hair,
            hairAccent: data.appearance.hairAccent,
            skinColor: data.appearance.skin,
            eyeColor: data.appearance.eyeColor,
            eyeStyle: data.appearance.eyeStyle,
            expression: data.appearance.expression,
            hatVisible: data.appearance.hatVisible,
            bagVisible: data.appearance.bagVisible
          });
        }
      }

      // 2. 인벤토리 및 착용 장비 복원
      if (data.inventory && inventorySystem && typeof inventorySystem.restore === 'function') {
        inventorySystem.restore(data.inventory);
      }

      // 3. 퀘스트 상태 복원 및 수집품 인벤토리 수량 일관성 동기화 (전달 전 상태에서만 꽃 수량 보정)
      if (data.quest && questSystem && typeof questSystem.restore === 'function') {
        questSystem.restore(data.quest);
        const restoredFlowerIds =
          typeof questSystem.getCollectedFlowerIds === 'function' ? questSystem.getCollectedFlowerIds() : [];
        if (flowerManager && typeof flowerManager.syncCollected === 'function') {
          flowerManager.syncCollected(restoredFlowerIds);
        }
        const qState = typeof questSystem.getState === 'function' ? questSystem.getState() : null;
        if (
          inventorySystem &&
          typeof inventorySystem.syncCollectibleSources === 'function' &&
          restoredFlowerIds.length > 0 &&
          (qState === 'IN_PROGRESS' || qState === 'READY_TO_COMPLETE')
        ) {
          inventorySystem.syncCollectibleSources('pink_flower', restoredFlowerIds);
        }
      }

      // 4. 지역 해금 상태 복원
      if (data.world?.unlockedAreas && areaManager && typeof areaManager.restoreUnlockedAreas === 'function') {
        areaManager.restoreUnlockedAreas(data.world.unlockedAreas);
      }

      // 5. 달빛 꽃 이벤트 완료 상태 복원
      if (data.world?.moonflowerDone && moonflowerEvent && typeof moonflowerEvent.setCompleted === 'function') {
        moonflowerEvent.setCompleted(true);
      }

      // 6. 플레이어 위치 및 지역 복원
      if (data.player && areaManager) {
        const savedAreaId = data.player.areaId || 'village';
        const savedPos = data.player.position;
        const savedRotY = data.player.rotationY || 0;

        if (savedAreaId !== 'village') {
          // 마을 이외의 지역으로 시작 복원
          await areaManager.travelTo(savedAreaId, savedPos, savedRotY);
        } else if (savedPos && player) {
          player.position.set(savedPos.x, savedPos.y, savedPos.z);
          player.rotation.y = savedRotY;
        }
      }

      // 7. 게임 시간 상태 복원 (수동 시간 및 자동 모드 완벽 복원)
      if (data.time && timeSystem && typeof timeSystem.restore === 'function') {
        timeSystem.restore(data.time);
      }

      // 8. 날씨 상태 복원
      if (data.weather && weatherSystem && typeof weatherSystem.restore === 'function') {
        weatherSystem.restore(data.weather);
      }

      return true;
    } catch (e) {
      console.warn('[SaveSystem] Restore error:', e);
      return false;
    }
  }

  // 브라우저 닫기/새로고침 시 즉시 저장
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => save(true));
    window.addEventListener('pagehide', () => save(true));
  }

  // 인벤토리 상태 변경 시 자동 저장 구독
  if (inventorySystem && typeof inventorySystem.subscribe === 'function') {
    inventorySystem.subscribe(() => save(false));
  }

  // 퀘스트 상태 변경 시 자동 저장 구독
  if (questSystem && typeof questSystem.onStateChange === 'function') {
    questSystem.onStateChange(() => save(false));
  }

  // 시간 설정 변경 시 자동 저장 구독 (수동 시간 변경 시 저장)
  if (timeSystem && typeof timeSystem.onModeChange === 'function') {
    timeSystem.onModeChange(() => save(false));
  }

  // 날씨 변경 및 자동 순환 설정 변경 시 자동 저장 구독
  if (weatherSystem && typeof weatherSystem.onChange === 'function') {
    weatherSystem.onChange(() => save(false));
  }
  if (weatherSystem && typeof weatherSystem.onAutoCycleChange === 'function') {
    weatherSystem.onAutoCycleChange(() => save(false));
  }

  return {
    save,
    load,
    restore,
    collectSaveData,
    clearSave() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(SAVE_KEY);
        }
      } catch (e) {}
    }
  };
}
