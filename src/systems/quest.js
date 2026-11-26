import { QuestState, QUEST_DATA, LIGHTHOUSE_QUEST_DATA, QUEST_REGISTRY, DIALOGUE_QUEST_HOOKS } from '../data/quest.js';
import { createQuestUI } from '../ui/questUI.js';

export function createQuestSystem(inventorySystem = null) {
  const ui = createQuestUI();
  let state = QuestState.NOT_STARTED;
  let collectedCount = 0;
  let collectedFlowerIds = new Set();
  let rewardClaimed = false;
  let deliveredAt = null;
  const targetCount = QUEST_DATA.targetCount;
  const listeners = new Set();

  // 메인 퀘스트('사라진 등대의 비밀') 다단계 진행 상태
  let mainQuests = {
    [LIGHTHOUSE_QUEST_DATA.id]: {
      id: LIGHTHOUSE_QUEST_DATA.id,
      title: LIGHTHOUSE_QUEST_DATA.title,
      active: false,
      completed: false,
      completedSteps: [],
      discoveredClueCount: 0,
      totalClues: 4
    }
  };

  // NPC 대화 완료 상태, 밤 전용 단서 기록 및 추후 퀘스트 확장용 훅 레지스트리
  let completedDialogues = new Set();
  let discoveredClues = new Set();
  let triggeredQuestHooks = new Set();
  const questHookHandlers = new Map();

  function getLighthouseQuestSnapshot() {
    const q = mainQuests[LIGHTHOUSE_QUEST_DATA.id];
    return {
      ...q,
      steps: LIGHTHOUSE_QUEST_DATA.steps,
      completedSteps: [...q.completedSteps]
    };
  }

  function renderMainQuestUI() {
    if (ui && typeof ui.updateMainQuest === 'function') {
      ui.updateMainQuest(getLighthouseQuestSnapshot());
    }
  }

  function notify() {
    for (const cb of listeners) {
      cb({
        state,
        collectedCount,
        targetCount,
        collectedFlowerIds: Array.from(collectedFlowerIds),
        rewardClaimed,
        deliveredAt,
        completedDialogues: Array.from(completedDialogues),
        discoveredClues: Array.from(discoveredClues),
        triggeredQuestHooks: Array.from(triggeredQuestHooks),
        mainQuests: {
          [LIGHTHOUSE_QUEST_DATA.id]: getLighthouseQuestSnapshot()
        }
      });
    }
  }

  function getQuestDef(questId = QUEST_DATA.id) {
    return QUEST_REGISTRY[questId] || QUEST_DATA;
  }

  // 보상 아이템 안전 지급 (중복 지급 원천 차단)
  function grantRewardsOnce(questDef) {
    if (rewardClaimed) return [];

    const granted = [];
    const rewards = Array.isArray(questDef.rewards) && questDef.rewards.length > 0
      ? questDef.rewards
      : questDef.reward
        ? [{ itemId: questDef.reward.id, count: questDef.reward.count || 1, ...questDef.reward }]
        : [];

    for (const r of rewards) {
      const itemId = r.itemId || r.id;
      const count = Math.max(1, Math.floor(Number(r.count) || 1));
      const rewardSourceId = `quest_reward_${questDef.id}_${itemId}`;
      if (inventorySystem && typeof inventorySystem.addItem === 'function') {
        inventorySystem.addItem(itemId, count, { sourceId: rewardSourceId });
      }
      granted.push({ ...r, itemId, count });
    }

    rewardClaimed = true;
    state = QuestState.COMPLETED;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('littleday_quest_completed', '1');
        localStorage.setItem('littleday_quest_reward_claimed', '1');
        for (const r of granted) {
          localStorage.setItem(`littleday_item_${r.itemId}`, String(inventorySystem?.getItemCount?.(r.itemId) || r.count));
        }
      }
    } catch (e) {}

    ui.updateQuestProgress(targetCount, targetCount, true, true, QuestState.COMPLETED);
    notify();
    return granted;
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
    getInventoryCount(itemId = 'pink_flower') {
      if (inventorySystem && typeof inventorySystem.getItemCount === 'function') {
        return inventorySystem.getItemCount(itemId);
      }
      return collectedCount;
    },

    // 1 -> 2. 퀘스트 시작 (진행 전 -> 아이템 수집 중)
    startQuest() {
      if (state !== QuestState.NOT_STARTED) return false;
      state = QuestState.IN_PROGRESS;
      collectedCount = 0;
      collectedFlowerIds.clear();
      rewardClaimed = false;
      ui.updateQuestProgress(collectedCount, targetCount, false, false, QuestState.IN_PROGRESS);
      ui.showPanel();
      ui.showToast('새 퀘스트 수락: 폭시의 작은 부탁', '🌸', 2600);
      notify();
      return true;
    },

    // 2 -> 3. 꽃 수집 (3개 수집 완료 시 '아이템 전달 가능' 상태로 전환)
    collectFlower(flower) {
      if (state !== QuestState.IN_PROGRESS) return false;
      if (flower.id && collectedFlowerIds.has(flower.id)) return false;
      if (!flower.collect()) return false;

      if (flower.id) {
        collectedFlowerIds.add(flower.id);
      }
      collectedCount = Math.min(targetCount, collectedCount + 1);

      // 인벤토리에 분홍색 꽃 자동 추가 (sourceId로 중복 추가 방지)
      if (inventorySystem && typeof inventorySystem.addItem === 'function') {
        const collectibleItemId = flower.type || 'pink_flower';
        inventorySystem.addItem(collectibleItemId, 1, { sourceId: flower.id || null });
      }

      if (collectedCount >= targetCount) {
        state = QuestState.READY_TO_COMPLETE;
        ui.updateQuestProgress(targetCount, targetCount, true, false, QuestState.READY_TO_COMPLETE);
        ui.showToast('분홍색 꽃 3개 수집 완료! 폭시에게 전달해 보세요! 🌸', '✨', 3000);
      } else {
        ui.showCollectToast(collectedCount, targetCount);
        ui.updateQuestProgress(collectedCount, targetCount, false, false, QuestState.IN_PROGRESS);
      }

      notify();
      return true;
    },

    // 확장 가능한 요구 아이템 보유 수량 검증
    getRequirementStatus(questId = QUEST_DATA.id) {
      const questDef = getQuestDef(questId);
      const reqList = Array.isArray(questDef.requirements) ? questDef.requirements : [];
      const evaluated = reqList.map((req) => {
        const owned = this.getInventoryCount(req.itemId);
        return {
          ...req,
          owned,
          satisfied: owned >= req.count
        };
      });
      const missing = evaluated.filter((r) => !r.satisfied);
      return {
        quest: questDef,
        canDeliver:
          state === QuestState.READY_TO_COMPLETE &&
          !rewardClaimed &&
          missing.length === 0,
        requirements: evaluated,
        missing
      };
    },

    // 3 -> 4 -> 5. NPC 아이템 전달 실행: 보유 검증 → 인벤토리 차감 → 전달 완료 → 보상 1회 지급 완료
    deliverQuestItems(questId = QUEST_DATA.id) {
      const questDef = getQuestDef(questId);

      if (state === QuestState.DELIVERED || state === QuestState.COMPLETED || rewardClaimed) {
        return { ok: false, reason: 'already_completed', quest: questDef };
      }

      const status = this.getRequirementStatus(questId);
      if (status.missing.length > 0) {
        return { ok: false, reason: 'insufficient_items', quest: questDef, missing: status.missing };
      }
      if (state !== QuestState.READY_TO_COMPLETE) {
        return { ok: false, reason: 'invalid_state', quest: questDef };
      }

      // 1) 인벤토리에서 요구 아이템 차감 (NPC 전달 인터페이스 재사용)
      for (const req of status.requirements) {
        if (inventorySystem && typeof inventorySystem.deliverItemToNpc === 'function') {
          const ok = inventorySystem.deliverItemToNpc(questDef.deliveryNpcId, req.itemId, req.count, {
            consume: true
          });
          if (!ok) {
            return { ok: false, reason: 'insufficient_items', quest: questDef, missing: [req] };
          }
        }
      }

      // 2) 상태: 전달 완료 (DELIVERED)
      state = QuestState.DELIVERED;
      deliveredAt = Date.now();
      completedDialogues.add('fox:quest_complete');
      ui.updateQuestProgress(targetCount, targetCount, true, false, QuestState.DELIVERED);
      notify();

      // 3) 보상 지급 (반짝이는 조개 1개, 중복 지급 원천 차단) -> 보상 지급 완료 (COMPLETED)
      const rewards = grantRewardsOnce(questDef);

      return {
        ok: true,
        quest: questDef,
        delivered: status.requirements,
        rewards
      };
    },

    // 기존 completeQuest 호출 하위 호환 (중복 지급 방지 유지)
    completeQuest(playerCharacter = null, onDone = null) {
      if (state === QuestState.COMPLETED && rewardClaimed) {
        return false;
      }
      if (
        state !== QuestState.IN_PROGRESS &&
        state !== QuestState.READY_TO_COMPLETE &&
        state !== QuestState.DELIVERED &&
        state !== QuestState.COMPLETED
      ) {
        return false;
      }

      const questDef = getQuestDef(QUEST_DATA.id);
      const granted = grantRewardsOnce(questDef);
      const mainReward = granted[0] || questDef.reward;
      ui.showRewardModal(
        {
          title: questDef.title,
          subtitle: '폭시에게 분홍색 꽃 3개를 전달했습니다!',
          ...mainReward
        },
        () => {
          if (onDone) onDone();
        }
      );
      return true;
    },

    // 폭시 전용 대사 배열 동적 생성 (하위 호환 유지)
    getFoxDialogues() {
      const currentFlowers = this.getInventoryCount('pink_flower');
      if (state === QuestState.NOT_STARTED) {
        return QUEST_DATA.dialogues.not_started;
      } else if (state === QuestState.IN_PROGRESS) {
        return QUEST_DATA.dialogues.in_progress(currentFlowers, targetCount);
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
    recordClue(clueId, title = null) {
      if (!clueId) return false;
      if (discoveredClues.has(clueId)) return false;
      discoveredClues.add(clueId);
      notify();
      return true;
    },
    // --- 메인 퀘스트('사라진 등대의 비밀') 관리 API ---
    startLighthouseQuest(showNotice = true) {
      const q = mainQuests[LIGHTHOUSE_QUEST_DATA.id];
      if (q.active) return false;
      q.active = true;
      renderMainQuestUI();
      if (showNotice) {
        ui.showToast('새 메인 퀘스트: 사라진 등대의 비밀 🏛️', '🏛️', 3000);
      }
      notify();
      return true;
    },
    getLighthouseQuestState() {
      return getLighthouseQuestSnapshot();
    },
    syncLighthouseQuest(progress = {}) {
      const q = mainQuests[LIGHTHOUSE_QUEST_DATA.id];
      const wasActive = q.active;
      const wasCompleted = q.completed;
      const prevStepsKey = q.completedSteps.join(',');
      const prevClueCount = q.discoveredClueCount;

      if (progress.active) q.active = true;

      const stepSet = new Set(q.completedSteps);
      if (progress.explored) stepSet.add('explore_lighthouse');
      if (progress.cluesFound) {
        stepSet.add('explore_lighthouse');
        stepSet.add('find_clues');
      }
      if (progress.deviceInspected) {
        stepSet.add('explore_lighthouse');
        stepSet.add('inspect_device');
      }
      if (progress.puzzleSolved) {
        stepSet.add('explore_lighthouse');
        stepSet.add('find_clues');
        stepSet.add('inspect_device');
        stepSet.add('solve_puzzle');
      }
      if (progress.rewardClaimed) {
        stepSet.add('explore_lighthouse');
        stepSet.add('find_clues');
        stepSet.add('inspect_device');
        stepSet.add('solve_puzzle');
        stepSet.add('obtain_log');
        q.completed = true;
      }

      // 정의된 순서대로 정렬
      q.completedSteps = LIGHTHOUSE_QUEST_DATA.steps
        .map((s) => s.id)
        .filter((id) => stepSet.has(id));

      if (typeof progress.discoveredClueCount === 'number') {
        q.discoveredClueCount = progress.discoveredClueCount;
      }
      if (typeof progress.totalClues === 'number') {
        q.totalClues = progress.totalClues;
      }

      const changed =
        wasActive !== q.active ||
        wasCompleted !== q.completed ||
        prevStepsKey !== q.completedSteps.join(',') ||
        prevClueCount !== q.discoveredClueCount;

      if (q.active || changed) {
        renderMainQuestUI();
      }
      if (changed) {
        notify();
      }
      return changed;
    },
    getTriggeredQuestHooks() {
      return Array.from(triggeredQuestHooks);
    },
    registerQuestHook(hookId, handler) {
      if (!hookId || typeof handler !== 'function') return;
      questHookHandlers.set(hookId, handler);
    },
    onNpcDialogueCompleted(npcId, result = {}, context = {}) {
      if (!npcId) return;
      const period = result.period || (context.isNight ? 'night' : 'day');
      const key = `${npcId}:${period}`;
      let changed = false;

      if (!completedDialogues.has(key)) {
        completedDialogues.add(key);
        changed = true;
      }

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

      const hooks = Array.isArray(result.triggeredQuestHooks) ? result.triggeredQuestHooks : [];
      for (const hookId of hooks) {
        if (!hookId) continue;
        if (!triggeredQuestHooks.has(hookId)) {
          triggeredQuestHooks.add(hookId);
          changed = true;
        }
        const handler = questHookHandlers.get(hookId);
        if (typeof handler === 'function') {
          handler({ npcId, period, result, player: context.player, npc: context.npc });
        }
      }

      if (changed) {
        notify();
      }
    },
    // NPC 머리 위 말풍선 상태 결정 ('quest' | 'night' | 'talk')
    getNpcIndicatorType(npcId, isNight = false) {
      if (npcId === 'fox' && state === QuestState.READY_TO_COMPLETE) {
        return 'quest';
      }
      if (isNight) {
        return !completedDialogues.has(`${npcId}:night`) ? 'night' : 'talk';
      }
      if (npcId === 'fox' && state === QuestState.NOT_STARTED) {
        return 'quest';
      }
      return 'talk';
    },

    onStateChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    getStateData() {
      const lq = mainQuests[LIGHTHOUSE_QUEST_DATA.id];
      return {
        id: QUEST_DATA.id,
        state,
        collectedCount,
        collectedFlowerIds: Array.from(collectedFlowerIds),
        rewardClaimed: Boolean(rewardClaimed || state === QuestState.COMPLETED),
        deliveredAt,
        completedDialogues: Array.from(completedDialogues),
        discoveredClues: Array.from(discoveredClues),
        triggeredQuestHooks: Array.from(triggeredQuestHooks),
        mainQuests: {
          [LIGHTHOUSE_QUEST_DATA.id]: {
            id: lq.id,
            active: Boolean(lq.active),
            completed: Boolean(lq.completed),
            completedSteps: [...lq.completedSteps],
            discoveredClueCount: lq.discoveredClueCount || 0,
            totalClues: lq.totalClues || 4
          }
        }
      };
    },
    restore(savedData) {
      if (!savedData) return;

      if (savedData.state) {
        state = savedData.state;
        collectedCount = Math.max(0, Math.min(targetCount, Number(savedData.collectedCount) || 0));
        collectedFlowerIds = new Set(Array.isArray(savedData.collectedFlowerIds) ? savedData.collectedFlowerIds : []);
        deliveredAt = savedData.deliveredAt || null;
        rewardClaimed = Boolean(
          savedData.rewardClaimed ||
          state === QuestState.COMPLETED ||
          (typeof localStorage !== 'undefined' && localStorage.getItem('littleday_quest_reward_claimed') === '1')
        );

        if (collectedCount > 0 && collectedFlowerIds.size === 0) {
          for (let i = 1; i <= collectedCount; i++) {
            collectedFlowerIds.add(`flower_${i}`);
          }
        }

        // 전달 완료 직후 중단된 저장 데이터가 있다면 안전하게 보상 1회 지급 후 완료 처리
        if (state === QuestState.DELIVERED && !rewardClaimed) {
          grantRewardsOnce(QUEST_DATA);
        }

        if (state === QuestState.IN_PROGRESS) {
          ui.updateQuestProgress(collectedCount, targetCount, false, false, QuestState.IN_PROGRESS);
          ui.showPanel();
        } else if (state === QuestState.READY_TO_COMPLETE) {
          ui.updateQuestProgress(collectedCount, targetCount, true, false, QuestState.READY_TO_COMPLETE);
          ui.showPanel();
        } else if (state === QuestState.DELIVERED) {
          ui.updateQuestProgress(targetCount, targetCount, true, false, QuestState.DELIVERED);
          ui.showPanel();
        } else if (state === QuestState.COMPLETED) {
          ui.updateQuestProgress(targetCount, targetCount, true, true, QuestState.COMPLETED);
          ui.showPanel();
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

      if (savedData.mainQuests && savedData.mainQuests[LIGHTHOUSE_QUEST_DATA.id]) {
        const savedLq = savedData.mainQuests[LIGHTHOUSE_QUEST_DATA.id];
        const lq = mainQuests[LIGHTHOUSE_QUEST_DATA.id];
        lq.active = Boolean(savedLq.active);
        lq.completed = Boolean(savedLq.completed);
        lq.completedSteps = Array.isArray(savedLq.completedSteps) ? [...savedLq.completedSteps] : [];
        lq.discoveredClueCount = Math.max(0, Number(savedLq.discoveredClueCount) || 0);
        lq.totalClues = Math.max(1, Number(savedLq.totalClues) || 4);
        renderMainQuestUI();
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

  // 기본 내장 퀘스트 훅 바인딩
  system.registerQuestHook(DIALOGUE_QUEST_HOOKS.START_FOX_FLOWER, () => {
    if (state === QuestState.NOT_STARTED) {
      system.startQuest();
    }
  });
  system.registerQuestHook('ack_fox_completion', () => {
    completedDialogues.add('fox:quest_complete');
  });

  return system;
}
