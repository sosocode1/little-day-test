import { QuestState, QUEST_DATA } from '../data/quest.js';
import { createQuestUI } from '../ui/questUI.js';

export function createQuestSystem(inventorySystem = null) {
  const ui = createQuestUI();
  let state = QuestState.NOT_STARTED;
  let collectedCount = 0;
  let collectedFlowerIds = new Set();
  const targetCount = QUEST_DATA.targetCount;
  const listeners = new Set();

  function notify() {
    for (const cb of listeners) {
      cb({ state, collectedCount, targetCount, collectedFlowerIds: Array.from(collectedFlowerIds) });
    }
  }

  return {
    ui,
    getState() {
      return state;
    },
    getCollectedCount() {
      return collectedCount;
    },
    getTargetCount() {
      return targetCount;
    },
    // 퀘스트 시작 (수락)
    startQuest() {
      if (state !== QuestState.NOT_STARTED) return;
      state = QuestState.IN_PROGRESS;
      collectedCount = 0;
      collectedFlowerIds.clear();
      ui.updateQuestProgress(collectedCount, targetCount, false, false);
      ui.showPanel();
      notify();
    },
    // 꽃 수집
    collectFlower(flower) {
      if (state !== QuestState.IN_PROGRESS) return false;
      if (flower.id && collectedFlowerIds.has(flower.id)) return false;
      if (!flower.collect()) return false;

      if (flower.id) {
        collectedFlowerIds.add(flower.id);
      }
      collectedCount++;
      const isReady = collectedCount >= targetCount;
      if (isReady) {
        state = QuestState.READY_TO_COMPLETE;
      }

      ui.updateQuestProgress(collectedCount, targetCount, isReady, false);
      ui.showCollectToast(collectedCount, targetCount);
      notify();
      return true;
    },
    // 퀘스트 완료 및 보상 지급
    completeQuest(playerCharacter = null, onDone = null) {
      if (state !== QuestState.READY_TO_COMPLETE) return false;
      state = QuestState.COMPLETED;
      ui.updateQuestProgress(targetCount, targetCount, true, true);

      // 인벤토리에 보상 아이템 등록 및 착용
      if (inventorySystem) {
        inventorySystem.addItem(QUEST_DATA.reward);
        inventorySystem.equip(QUEST_DATA.reward.id);
      } else if (playerCharacter && typeof playerCharacter.equipFlowerPin === 'function') {
        // 플레이어 캐릭터에 분홍 꽃 머리핀 직접 장착
        playerCharacter.equipFlowerPin();
      }

      notify();

      // 보상 획득 모달 표시
      ui.showRewardModal(QUEST_DATA.reward, () => {
        if (onDone) onDone();
      });
      return true;
    },
    // 폭시 전용 대사 배열 동적 생성
    getFoxDialogues() {
      if (state === QuestState.NOT_STARTED) {
        return QUEST_DATA.dialogues.not_started;
      } else if (state === QuestState.IN_PROGRESS) {
        return QUEST_DATA.dialogues.in_progress(collectedCount, targetCount);
      } else if (state === QuestState.READY_TO_COMPLETE) {
        return QUEST_DATA.dialogues.ready_to_complete;
      } else {
        return QUEST_DATA.dialogues.completed;
      }
    },
    // 상태 변경 구독
    onStateChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    // 저장 데이터 추출
    getStateData() {
      return {
        id: QUEST_DATA.id,
        state,
        collectedCount,
        collectedFlowerIds: Array.from(collectedFlowerIds)
      };
    },
    // 세이브 데이터로부터 복원
    restore(savedData) {
      if (!savedData || !savedData.state) return;
      state = savedData.state;
      collectedCount = Math.max(0, Math.min(targetCount, Number(savedData.collectedCount) || 0));
      collectedFlowerIds = new Set(Array.isArray(savedData.collectedFlowerIds) ? savedData.collectedFlowerIds : []);

      // 하위 호환성: collectedCount는 있는데 collectedFlowerIds가 비어있다면 순서대로 채움
      if (collectedCount > 0 && collectedFlowerIds.size === 0) {
        for (let i = 1; i <= collectedCount; i++) {
          collectedFlowerIds.add(`flower_${i}`);
        }
      }

      if (state === QuestState.IN_PROGRESS) {
        ui.updateQuestProgress(collectedCount, targetCount, false, false);
        ui.showPanel();
      } else if (state === QuestState.READY_TO_COMPLETE) {
        ui.updateQuestProgress(collectedCount, targetCount, true, false);
        ui.showPanel();
      } else if (state === QuestState.COMPLETED) {
        ui.updateQuestProgress(targetCount, targetCount, true, true);
      }
      notify();
    },
    isFlowerCollected(flowerId) {
      return collectedFlowerIds.has(flowerId);
    },
    getCollectedFlowerIds() {
      return Array.from(collectedFlowerIds);
    }
  };
}
