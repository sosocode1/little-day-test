import { QuestState, QUEST_DATA, DIALOGUE_QUEST_HOOKS } from '../data/quest.js';
import { createQuestUI } from '../ui/questUI.js';

export function createQuestSystem(inventorySystem = null) {
  const ui = createQuestUI();
  let state = QuestState.NOT_STARTED;
  let collectedCount = 0;
  let collectedFlowerIds = new Set();
  let rewardClaimed = false;
  const targetCount = QUEST_DATA.targetCount;
  const listeners = new Set();

  // NPC 대화 완료 상태, 밤 전용 단서 기록 및 추후 퀘스트 확장용 훅 레지스트리
  let completedDialogues = new Set(); // 예: 'rabbit:day', 'rabbit:night', 'fox:day', 'fox:night'
  let discoveredClues = new Set();    // 예: 'clue_rabbit_lighthouse', 'clue_fox_island_secret'
  let triggeredQuestHooks = new Set();
  const questHookHandlers = new Map();

  function notify() {
    for (const cb of listeners) {
      cb({
        state,
        collectedCount,
        targetCount,
        collectedFlowerIds: Array.from(collectedFlowerIds),
        rewardClaimed,
        completedDialogues: Array.from(completedDialogues),
        discoveredClues: Array.from(discoveredClues),
        triggeredQuestHooks: Array.from(triggeredQuestHooks)
      });
    }
  }

  const system = {
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
      if (state !== QuestState.NOT_STARTED) return false;
      state = QuestState.IN_PROGRESS;
      collectedCount = 0;
      collectedFlowerIds.clear();
      rewardClaimed = false;
      ui.updateQuestProgress(collectedCount, targetCount, false, false);
      ui.showPanel();
      ui.showToast('새 퀘스트 수락: 폭시의 작은 부탁', '🌸', 2600);
      notify();
      return true;
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

      // 꽃 3개를 모두 수집하면 퀘스트를 완료 상태로 변경
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
      ui.showToast('퀘스트 완료! 폭시에게 말을 걸어보세요! 🎉', '✨', 3200);

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

      ui.showRewardModal(QUEST_DATA.reward, () => {
        if (onDone) onDone();
      });
      return true;
    },
    // 폭시 전용 대사 배열 동적 생성 (기존 API 하위 호환 유지)
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

    // --- NPC 대화 상태 및 퀘스트 연동 구조 ---
    hasCompletedDialogue(npcId, period = 'day') {
      if (!npcId) return false;
      return completedDialogues.has(`${npcId}:${period}`);
    },
    hasSeenFoxCompletion() {
      return completedDialogues.has('fox:quest_complete');
    },
    getCompletedDialogues() {
      return Array.from(completedDialogues);
    },
    hasDiscoveredClue(clueId) {
      return discoveredClues.has(clueId);
    },
    getDiscoveredClues() {
      return Array.from(discoveredClues);
    },
    getTriggeredQuestHooks() {
      return Array.from(triggeredQuestHooks);
    },
    // 추후 퀘스트 확장을 위한 훅 등록 인터페이스
    registerQuestHook(hookId, handler) {
      if (!hookId || typeof handler !== 'function') return;
      questHookHandlers.set(hookId, handler);
    },
    // 대화 완료 시 호출: 완료 상태 저장 + 밤 단서 기록 + 퀘스트 훅 실행
    onNpcDialogueCompleted(npcId, result = {}, context = {}) {
      if (!npcId) return;
      const period = result.period || (context.isNight ? 'night' : 'day');
      const key = `${npcId}:${period}`;
      let changed = false;

      if (!completedDialogues.has(key)) {
        completedDialogues.add(key);
        changed = true;
      }

      // 밤 전용 단서 등 새로운 단서 수집 기록
      const clues = Array.isArray(result.discoveredClues) ? result.discoveredClues : [];
      for (const clue of clues) {
        if (clue && clue.id && !discoveredClues.has(clue.id)) {
          discoveredClues.add(clue.id);
          changed = true;
          if (clue.title) {
            ui.showToast(`밤의 단서 기록: ${clue.title}`, '🌙', 3000);
          }
        }
      }

      // 선택지로 발동된 퀘스트 훅 실행
      const hooks = Array.isArray(result.triggeredQuestHooks) ? result.triggeredQuestHooks : [];
      for (const hookId of hooks) {
        if (!hookId) continue;
        if (!triggeredQuestHooks.has(hookId)) {
          triggeredQuestHooks.add(hookId);
          changed = true;
        }
        const handler = questHookHandlers.get(hookId);
        if (typeof handler === 'function') {
          handler({ npcId, period, result, player: context.player });
        }
      }

      if (changed) {
        notify();
      }
    },
    // NPC 머리 위 말풍선 상태 결정 ('quest' | 'night' | 'talk')
    getNpcIndicatorType(npcId, isNight = false) {
      if (isNight) {
        return !completedDialogues.has(`${npcId}:night`) ? 'night' : 'talk';
      }
      if (
        npcId === 'fox' &&
        (state === QuestState.NOT_STARTED ||
          state === QuestState.READY_TO_COMPLETE ||
          (state === QuestState.COMPLETED && !completedDialogues.has('fox:quest_complete')))
      ) {
        return 'quest';
      }
      return 'talk';
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
        rewardClaimed: Boolean(rewardClaimed || state === QuestState.COMPLETED),
        completedDialogues: Array.from(completedDialogues),
        discoveredClues: Array.from(discoveredClues),
        triggeredQuestHooks: Array.from(triggeredQuestHooks)
      };
    },
    // 세이브 데이터로부터 복원
    restore(savedData) {
      if (!savedData) return;

      if (savedData.state) {
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
      }

      if (Array.isArray(savedData.completedDialogues)) {
        completedDialogues = new Set(savedData.completedDialogues);
      }
      if (Array.isArray(savedData.discoveredClues)) {
        discoveredClues = new Set(savedData.discoveredClues);
      }
      if (Array.isArray(savedData.triggeredQuestHooks)) {
        triggeredQuestHooks = new Set(savedData.triggeredQuestHooks);
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

  // 기본 내장 퀘스트 훅 바인딩 (기존 폭시 꽃 퀘스트와 자연 연동)
  system.registerQuestHook(DIALOGUE_QUEST_HOOKS.START_FOX_FLOWER, () => {
    if (state === QuestState.NOT_STARTED) {
      system.startQuest();
    }
  });
  system.registerQuestHook(DIALOGUE_QUEST_HOOKS.COMPLETE_FOX_FLOWER, ({ player }) => {
    if (state === QuestState.READY_TO_COMPLETE) {
      system.completeQuest(player);
    }
  });
  system.registerQuestHook('ack_fox_completion', () => {
    completedDialogues.add('fox:quest_complete');
  });

  return system;
}
