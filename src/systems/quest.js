import { QuestState, QUEST_DATA } from '../data/quest.js';
import { createQuestUI } from '../ui/questUI.js';

export function createQuestSystem(inventorySystem = null) {
  const ui = createQuestUI();
  let state = QuestState.NOT_STARTED;
  let collectedCount = 0;
  let collectedFlowerIds = new Set();
  let rewardClaimed = false;
  const targetCount = QUEST_DATA.targetCount;
  const listeners = new Set();

  function notify() {
    for (const cb of listeners) {
      cb({
        state,
        collectedCount,
        targetCount,
        collectedFlowerIds: Array.from(collectedFlowerIds),
        rewardClaimed
      });
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
    isRewardClaimed() {
      return rewardClaimed;
    },
    // 퀘스트 시작 (수락)
    startQuest() {
      if (state !== QuestState.NOT_STARTED) return;
      state = QuestState.IN_PROGRESS;
      collectedCount = 0;
      collectedFlowerIds.clear();
      rewardClaimed = false;
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
      collectedCount = Math.min(targetCount, collectedCount + 1);

      // 꽃 수집 토스트 팝업 표시 (1/3, 2/3, 3/3)
      ui.showCollectToast(collectedCount, targetCount);

      // 요구사항 1: 꽃 3개를 모두 수집하면 퀘스트를 완료 상태로 변경
      if (collectedCount >= targetCount) {
        this.completeQuest();
      } else {
        ui.updateQuestProgress(collectedCount, targetCount, false, false);
        notify();
      }
      return true;
    },
    // 퀘스트 완료 및 보상 지급
    completeQuest(playerCharacter = null, onDone = null) {
      // 이미 보상이 지급되었거나 완료 처리된 경우 중복 지급 방지 (요구사항 7)
      if (state === QuestState.COMPLETED && rewardClaimed) {
        return false;
      }
      if (
        state !== QuestState.IN_PROGRESS &&
        state !== QuestState.READY_TO_COMPLETE &&
        state !== QuestState.COMPLETED
      ) {
        return false;
      }

      state = QuestState.COMPLETED;
      collectedCount = targetCount;
      ui.updateQuestProgress(targetCount, targetCount, true, true);

      // 보상 아이템 '달빛 브로치' 1개 지급 및 로컬스토리지 동기화 (중복 방지)
      if (!rewardClaimed) {
        rewardClaimed = true;
        if (inventorySystem && typeof inventorySystem.addItem === 'function') {
          inventorySystem.addItem(QUEST_DATA.reward);
        }
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('littleday_item_moonlight_brooch', '1');
            localStorage.setItem('littleday_quest_completed', '1');
            localStorage.setItem('littleday_quest_reward_claimed', '1');
          }
        } catch (e) {}
      }

      notify();

      // 화면 중앙에 클레이 감성의 'QUEST COMPLETE' 팝업 표시 (요구사항 2)
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
        collectedFlowerIds: Array.from(collectedFlowerIds),
        rewardClaimed: Boolean(rewardClaimed || state === QuestState.COMPLETED)
      };
    },
    // 세이브 데이터로부터 복원
    restore(savedData) {
      if (!savedData || !savedData.state) return;
      state = savedData.state;
      collectedCount = Math.max(0, Math.min(targetCount, Number(savedData.collectedCount) || 0));
      collectedFlowerIds = new Set(Array.isArray(savedData.collectedFlowerIds) ? savedData.collectedFlowerIds : []);
      rewardClaimed = Boolean(
        savedData.rewardClaimed ||
        state === QuestState.COMPLETED ||
        (typeof localStorage !== 'undefined' && (
          localStorage.getItem('littleday_quest_reward_claimed') === '1' ||
          localStorage.getItem('littleday_item_moonlight_brooch') === '1'
        ))
      );

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
