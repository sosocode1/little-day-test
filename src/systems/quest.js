import { QuestState, QUEST_DATA } from '../data/quest.js';
import { createQuestUI } from '../ui/questUI.js';

export function createQuestSystem(inventorySystem = null) {
  const ui = createQuestUI();
  let state = QuestState.NOT_STARTED;
  let collectedCount = 0;
  const targetCount = QUEST_DATA.targetCount;

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
      ui.updateQuestProgress(collectedCount, targetCount, false, false);
      ui.showPanel();
    },
    // 꽃 수집
    collectFlower(flower) {
      if (state !== QuestState.IN_PROGRESS) return false;
      if (!flower.collect()) return false;

      collectedCount++;
      const isReady = collectedCount >= targetCount;
      if (isReady) {
        state = QuestState.READY_TO_COMPLETE;
      }

      ui.updateQuestProgress(collectedCount, targetCount, isReady, false);
      ui.showCollectToast(collectedCount, targetCount);
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
    }
  };
}
