import { createDialogueUI } from '../ui/dialogueUI.js';
import { QuestState } from '../data/quest.js';

export function createInteractionSystem(
  npcs = [],
  flowerManager = null,
  questSystem = null,
  player = null,
  inventoryUI = null,
  spaceManager = null,
  cottage = null,
  cottageEntrance = null,
  wardrobeUI = null,
  vanityUI = null,
  welcomeGuideUI = null,
  moonflowerEvent = null
) {
  const ui = createDialogueUI();
  let nearestNpc = null;
  let nearestFlower = null;
  let activeNpc = null;
  let cooldownTimer = 0;

  return {
    ui,
    npcs,
    flowerManager,
    questSystem,
    inventoryUI,
    spaceManager,
    wardrobeUI,
    vanityUI,
    welcomeGuideUI,
    moonflowerEvent,
    // 대화창, 보상 모달, 보관함, 옷장, 화장대, 환영 가이드 또는 공간 전환 중인지 여부 (플레이어 이동 잠금용)
    isInteracting() {
      return (
        ui.isOpen() ||
        (questSystem && questSystem.ui.isRewardModalOpen()) ||
        (inventoryUI && inventoryUI.isOpen()) ||
        (wardrobeUI && wardrobeUI.isOpen()) ||
        (vanityUI && vanityUI.isOpen()) ||
        (welcomeGuideUI && welcomeGuideUI.isOpen()) ||
        (spaceManager && spaceManager.isTransitioning())
      );
    },
    update(playerPos, input, dt) {
      if (welcomeGuideUI && welcomeGuideUI.isOpen()) {
        ui.hidePrompt();
        return;
      }

      const isDialogueOpen = ui.isOpen();
      const isRewardOpen = questSystem && questSystem.ui.isRewardModalOpen();
      const isInventoryOpen = inventoryUI && inventoryUI.isOpen();
      const isWardrobeOpen = wardrobeUI && wardrobeUI.isOpen();
      const isVanityOpen = vanityUI && vanityUI.isOpen();
      const isTransitioning = spaceManager && spaceManager.isTransitioning();
      const interactPressed = input.consumeInteract();
      if (cooldownTimer > 0) cooldownTimer -= dt;

      // 1. NPC들의 아이들 애니메이션 및 시선 업데이트 (야외일 때만)
      const isIndoor = spaceManager && spaceManager.isIndoor();
      if (!isIndoor) {
        for (const npc of npcs) {
          const isCurrentActive = isDialogueOpen && activeNpc === npc;
          npc.update(dt, playerPos, isCurrentActive);
        }

        // 2. 수집 가능한 꽃들 애니메이션 업데이트
        if (flowerManager) {
          flowerManager.update(dt);
        }
      }

      // 전환 중이거나 인벤토리/옷장/화장대가 열려 있는 경우 프롬프트 숨김 및 입력 스킵
      if (isTransitioning || isInventoryOpen || isWardrobeOpen || isVanityOpen) {
        ui.hidePrompt();
        return;
      }

      // 3. 보상 모달이 열려 있는 경우
      if (isRewardOpen) {
        if (interactPressed) {
          questSystem.ui.closeRewardModal();
        }
        return;
      }

      // 4. 대화창이 열려 있는 경우
      if (isDialogueOpen) {
        if (interactPressed) {
          ui.advance();
        }
        return;
      }

      // -----------------------------------------------------------
      // 5. 공간별 상호작용 후보 수집 (가장 가까운 대상 1개만 엄격히 선정)
      // -----------------------------------------------------------
      const candidates = [];

      if (isIndoor && cottage && cottage.triggers) {
        // [별장 실내 상호작용 후보]: 출입구(나가기), 옷장, 거울, 침대
        for (const trig of Object.values(cottage.triggers)) {
          const dist = Math.hypot(playerPos.x - trig.x, playerPos.z - trig.z);
          if (dist <= trig.radius) {
            candidates.push({
              id: trig.id,
              type: 'indoor_trigger',
              dist,
              prompt: trig.prompt,
              execute: () => {
                if (trig.id === 'exit') {
                  // 별장 나가기
                  spaceManager.exitCottage();
                } else if (trig.id === 'wardrobe') {
                  // 옷장 열기 (옷장 전용 UI 열기)
                  if (wardrobeUI) {
                    wardrobeUI.open();
                  } else if (inventoryUI) {
                    inventoryUI.open();
                    inventoryUI.selectTab('outfit');
                  }
                } else if (trig.id === 'mirror') {
                  // 화장대 & 거울 보기 (화장대 뷰티 스타일링 UI 열기)
                  if (vanityUI) {
                    vanityUI.open();
                  } else if (inventoryUI) {
                    inventoryUI.open();
                    inventoryUI.selectTab('head');
                  }
                } else if (trig.id === 'bed') {
                  // 침대 휴식 기능 (화면 암전 및 휴식 메시지 표시, 퀘스트 메시지 절대 출력 안함)
                  if (spaceManager && typeof spaceManager.rest === 'function') {
                    spaceManager.rest();
                  }
                  if (questSystem && questSystem.ui && typeof questSystem.ui.showToast === 'function') {
                    questSystem.ui.showToast('포근한 침대에서 편안하게 휴식을 취했습니다. 기운이 회복되었습니다! ✨', '🛏️', 2600);
                  }
                }
              }
            });
          }
        }
      } else if (!isIndoor) {
        // [마을 야외 상호작용 후보]: 별장 현관, 꽃 수집, NPC 대화

        // (1) 별장 현관 입장
        if (cottageEntrance) {
          const dist = Math.hypot(playerPos.x - cottageEntrance.x, playerPos.z - cottageEntrance.z);
          if (dist <= cottageEntrance.radius) {
            candidates.push({
              id: 'cottage_entrance',
              type: 'cottage_entrance',
              dist,
              prompt: '우리 집(MY LITTLE HOME) 들어가기',
              execute: () => {
                if (spaceManager) spaceManager.enterCottage();
              }
            });
          }
        }

        // (2) 꽃 수집
        if (flowerManager && questSystem && questSystem.getState() === QuestState.IN_PROGRESS) {
          for (const flower of flowerManager.getActiveFlowers()) {
            const dist = Math.hypot(playerPos.x - flower.position.x, playerPos.z - flower.position.z);
            if (dist <= flower.interactRadius) {
              candidates.push({
                id: flower.id || 'flower',
                type: 'flower',
                dist,
                prompt: '분홍색 꽃 꺾기',
                execute: () => {
                  questSystem.collectFlower(flower);
                }
              });
            }
          }
        }

        // (3) NPC 대화
        for (const npc of npcs) {
          const dist = Math.hypot(playerPos.x - npc.position.x, playerPos.z - npc.position.z);
          if (dist <= npc.interactRadius) {
            candidates.push({
              id: npc.id || npc.type,
              type: 'npc',
              dist,
              prompt: `${npc.data.name}와 대화하기`,
              execute: () => {
                activeNpc = npc;
                if (npc.type === 'fox' && questSystem) {
                  npc.data.dialogues = questSystem.getFoxDialogues();
                }
                const currentQuestState = questSystem ? questSystem.getState() : null;

                ui.openDialogue(npc, () => {
                  activeNpc = null;
                  cooldownTimer = 0.4;
                  if (npc.type === 'fox' && questSystem) {
                    if (currentQuestState === QuestState.NOT_STARTED) {
                      questSystem.startQuest();
                    } else if (currentQuestState === QuestState.READY_TO_COMPLETE) {
                      questSystem.completeQuest(player);
                    }
                  }
                });
              }
            });
          }
        }

        // (4) 사라진 달빛 꽃 (밤 22:00 전용 미스터리 이벤트)
        if (moonflowerEvent && moonflowerEvent.isAvailable()) {
          const flowerPos = moonflowerEvent.getPosition();
          const dist = Math.hypot(playerPos.x - flowerPos.x, playerPos.z - flowerPos.z);
          if (dist <= moonflowerEvent.getInteractRadius()) {
            candidates.push({
              id: 'moonflower',
              type: 'mystery_event',
              dist,
              prompt: '신비로운 달빛 꽃 꺾기',
              execute: () => {
                moonflowerEvent.collect();
              }
            });
          }
        }
      }

      // -----------------------------------------------------------
      // 6. 단일 최단거리 상호작용 대상 선택 및 실행 (중복 실행 완벽 방지)
      // -----------------------------------------------------------
      if (candidates.length === 0) {
        ui.hidePrompt();
        return;
      }

      // 거리 기준 오름차순 정렬하여 가장 가까운 대상 1개만 선택
      candidates.sort((a, b) => a.dist - b.dist);
      const target = candidates[0];

      ui.showPrompt(target.prompt);

      if (interactPressed && cooldownTimer <= 0) {
        cooldownTimer = 0.4;
        target.execute();
      }
    }
  };
}
