import { createDialogueUI } from '../ui/dialogueUI.js';
import { createNpcOverheadUI } from '../ui/npcOverheadUI.js';
import { resolveNpcDialogueTree } from '../data/dialogue.js';
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
  moonflowerEvent = null,
  forest = null,
  forestEntrance = null,
  areaManager = null,
  worldMapUI = null,
  timeSystem = null,
  saveSystem = null
) {
  const ui = createDialogueUI();
  const overheadUI = createNpcOverheadUI();
  let camera = null;
  let activeNpc = null;
  let cooldownTimer = 0;
  let promptTapRequested = false;

  ui.onPromptTap(() => {
    promptTapRequested = true;
  });

  return {
    ui,
    overheadUI,
    npcs,
    flowerManager,
    questSystem,
    inventoryUI,
    spaceManager,
    wardrobeUI,
    vanityUI,
    welcomeGuideUI,
    moonflowerEvent,
    areaManager,
    worldMapUI,
    setCamera(cam) {
      camera = cam;
    },
    setTimeSystem(ts) {
      timeSystem = ts;
    },
    setSaveSystem(ss) {
      saveSystem = ss;
    },
    // 대화창, 보상 모달, 보관함, 옷장, 화장대, 환영 가이드, 월드맵 또는 공간 전환 중인지 여부 (플레이어 이동 잠금용)
    isInteracting() {
      return (
        ui.isOpen() ||
        (questSystem && questSystem.ui.isRewardModalOpen()) ||
        (inventoryUI && inventoryUI.isOpen()) ||
        (wardrobeUI && wardrobeUI.isOpen()) ||
        (vanityUI && vanityUI.isOpen()) ||
        (welcomeGuideUI && welcomeGuideUI.isOpen()) ||
        (worldMapUI && worldMapUI.isOpen()) ||
        (spaceManager && spaceManager.isTransitioning())
      );
    },
    update(playerPos, input, dt) {
      if (welcomeGuideUI && welcomeGuideUI.isOpen()) {
        ui.hidePrompt();
        overheadUI.hideAll();
        return;
      }

      const isDialogueOpen = ui.isOpen();
      const isRewardOpen = questSystem && questSystem.ui.isRewardModalOpen();
      const isInventoryOpen = inventoryUI && inventoryUI.isOpen();
      const isWardrobeOpen = wardrobeUI && wardrobeUI.isOpen();
      const isVanityOpen = vanityUI && vanityUI.isOpen();
      const isTransitioning = spaceManager && spaceManager.isTransitioning();
      const interactPressed = input.consumeInteract() || promptTapRequested;
      promptTapRequested = false;
      if (cooldownTimer > 0) cooldownTimer -= dt;

      // 1. NPC들의 아이들 애니메이션 및 시선 업데이트 (마을 야외일 때만)
      const currentSpace = spaceManager ? spaceManager.getCurrentSpace() : 'village';
      if (flowerManager && typeof flowerManager.setVisible === 'function') {
        flowerManager.setVisible(currentSpace === 'village');
      }
      if (currentSpace === 'village') {
        for (const npc of npcs) {
          const isCurrentActive = isDialogueOpen && activeNpc === npc;
          npc.update(dt, playerPos, isCurrentActive);
        }

        // 2. 수집 가능한 꽃들(및 반짝임 파티클) 애니메이션 업데이트
        if (flowerManager) {
          flowerManager.update(dt);
        }
      }

      const isWorldMapOpen = worldMapUI && worldMapUI.isOpen();
      const isNight = Boolean(timeSystem && typeof timeSystem.isNight === 'function' && timeSystem.isNight());
      const canShowOverhead =
        currentSpace === 'village' &&
        !isDialogueOpen &&
        !isRewardOpen &&
        !isTransitioning &&
        !isInventoryOpen &&
        !isWardrobeOpen &&
        !isVanityOpen &&
        !isWorldMapOpen;

      // 동물 NPC 머리 위 이름표 & 말풍선/느낌표/밤 단서 표시 갱신
      overheadUI.update({
        npcs,
        playerPos,
        camera,
        visible: canShowOverhead,
        isNight,
        getIndicatorType: (npcId, nightFlag) =>
          questSystem && typeof questSystem.getNpcIndicatorType === 'function'
            ? questSystem.getNpcIndicatorType(npcId, nightFlag)
            : 'talk'
      });

      // 전환 중이거나 인벤토리/옷장/화장대/월드맵이 열려 있는 경우 프롬프트 숨김 및 입력 스킵
      if (isTransitioning || isInventoryOpen || isWardrobeOpen || isVanityOpen || isWorldMapOpen) {
        ui.hidePrompt();
        return;
      }

      // 3. 보상 모달이 열려 있는 경우
      if (isRewardOpen) {
        ui.hidePrompt();
        if (interactPressed && cooldownTimer <= 0) {
          cooldownTimer = 0.25;
          questSystem.ui.closeRewardModal();
        }
        return;
      }

      // 4. 대화창이 열려 있는 경우 (키보드 제어는 dialogueUI의 전용 단축키 핸들러가 중복 없이 처리)
      if (isDialogueOpen) {
        ui.hidePrompt();
        return;
      }

      // -----------------------------------------------------------
      // 5. 공간별 상호작용 후보 수집 (가장 가까운 대상 1개만 엄격히 선정)
      // -----------------------------------------------------------
      const candidates = [];

      const activeCottage = cottage || (areaManager && typeof areaManager.getCottage === 'function' ? areaManager.getCottage() : null);

      if (currentSpace === 'cottage' && activeCottage && activeCottage.triggers) {
        // [별장 실내 상호작용 후보]: 출입구(나가기), 옷장, 거울, 침대
        for (const trig of Object.values(activeCottage.triggers)) {
          const dist = Math.hypot(playerPos.x - trig.x, playerPos.z - trig.z);
          if (dist <= trig.radius) {
            const trigIcons = { exit: '🚪', wardrobe: '👗', mirror: '🪞', bed: '🛏️' };
            candidates.push({
              id: trig.id,
              type: 'indoor_trigger',
              icon: trigIcons[trig.id] || '✨',
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
                  // 침대 휴식 기능 (화면 암전 후 다음 날 아침 08:00으로 전환 및 휴식 메시지 표시)
                  if (spaceManager && typeof spaceManager.rest === 'function') {
                    spaceManager.rest(async () => {
                      if (timeSystem && typeof timeSystem.setTime === 'function') {
                        timeSystem.setTime(8, 0); // 다음 날 오전 08:00 설정
                        if (typeof timeSystem.nextDay === 'function') {
                          timeSystem.nextDay();
                        }
                      }
                      if (saveSystem && typeof saveSystem.save === 'function') {
                        saveSystem.save();
                      }
                    });
                  }
                  if (questSystem && questSystem.ui && typeof questSystem.ui.showToast === 'function') {
                    questSystem.ui.showToast('포근한 침대에서 푹 쉬고 새로운 아침(08:00)을 맞이했습니다! ✨', '🛏️', 2800);
                  }
                }
              }
            });
          }
        }
      } else if (currentSpace === 'village') {
        // [마을 야외 상호작용 후보]: 별장 현관, 꽃 수집, NPC 대화, 달빛 꽃, 속삭이는 숲 입구

        // (1) 별장 현관 입장
        if (cottageEntrance) {
          const dist = Math.hypot(playerPos.x - cottageEntrance.x, playerPos.z - cottageEntrance.z);
          if (dist <= cottageEntrance.radius) {
            candidates.push({
              id: 'cottage_entrance',
              type: 'cottage_entrance',
              icon: '🏡',
              dist,
              prompt: '우리 집(MY LITTLE HOME) 들어가기',
              execute: () => {
                if (spaceManager) spaceManager.enterCottage();
              }
            });
          }
        }

        // (2) 월드 수집 아이템 (분홍색 꽃 등 확장 가능)
        if (
          flowerManager &&
          questSystem &&
          (questSystem.getState() === QuestState.IN_PROGRESS || questSystem.getState() === QuestState.NOT_STARTED)
        ) {
          for (const flower of flowerManager.getActiveFlowers()) {
            if (flower.isCollected) continue;
            if (questSystem.isFlowerCollected && questSystem.isFlowerCollected(flower.id)) continue;
            const dist = Math.hypot(playerPos.x - flower.position.x, playerPos.z - flower.position.z);
            if (dist <= flower.interactRadius) {
              candidates.push({
                id: flower.id || 'flower',
                type: 'flower',
                icon: flower.icon || '🌸',
                dist,
                prompt: flower.prompt || '수집하기',
                execute: () => {
                  if (questSystem.getState() === QuestState.NOT_STARTED) {
                    questSystem.startQuest();
                  }
                  questSystem.collectFlower(flower);
                }
              });
            }
          }
        }

        // (3) 동물 NPC 대화 (낮/밤 시간대 연동 + 분기 선택지 + 퀘스트 훅)
        for (const npc of npcs) {
          if (!npc || npc.talkable === false) continue;
          const dist = Math.hypot(playerPos.x - npc.position.x, playerPos.z - npc.position.z);
          if (dist <= npc.interactRadius) {
            const npcId = npc.id || npc.type;
            candidates.push({
              id: npcId,
              type: 'npc',
              icon: isNight ? '🌙' : '💬',
              dist,
              prompt: '대화하기',
              execute: () => {
                activeNpc = npc;
                const period = isNight ? 'night' : 'day';
                const hasCompleted =
                  questSystem && typeof questSystem.hasCompletedDialogue === 'function'
                    ? questSystem.hasCompletedDialogue(npcId, period)
                    : false;
                const hasSeenFoxCompletion =
                  questSystem && typeof questSystem.hasSeenFoxCompletion === 'function'
                    ? questSystem.hasSeenFoxCompletion()
                    : false;

                const resolvedTree = resolveNpcDialogueTree(npcId, {
                  isNight,
                  hasCompleted,
                  hasSeenFoxCompletion,
                  foxQuestState: questSystem ? questSystem.getState() : null,
                  foxCollectedCount: questSystem ? questSystem.getCollectedCount() : 0,
                  foxTargetCount: questSystem ? questSystem.getTargetCount() : 3
                });

                ui.hidePrompt();
                overheadUI.hideAll();
                ui.openDialogue(
                  npc,
                  (result = {}) => {
                    activeNpc = null;
                    cooldownTimer = 0.35;

                    if (result.completed && questSystem) {
                      if (typeof questSystem.onNpcDialogueCompleted === 'function') {
                        questSystem.onNpcDialogueCompleted(npcId, result, { isNight, player });
                      }
                      if (saveSystem && typeof saveSystem.save === 'function') {
                        saveSystem.save();
                      }
                    }
                  },
                  { isNight, resolvedTree }
                );
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
              icon: '🌙',
              dist,
              prompt: '신비로운 달빛 꽃 꺾기',
              execute: () => {
                moonflowerEvent.collect();
              }
            });
          }
        }

        // (5) 속삭이는 숲 (Whispering Forest) 입장
        if (forestEntrance) {
          const dist = Math.hypot(playerPos.x - forestEntrance.x, playerPos.z - forestEntrance.z);
          if (dist <= forestEntrance.radius) {
            candidates.push({
              id: 'forest_entrance',
              type: 'forest_entrance',
              icon: '🌲',
              dist,
              prompt: '속삭이는 숲 들어가기',
              execute: () => {
                if (spaceManager) spaceManager.enterForest();
              }
            });
          }
        }
      } else if (currentSpace === 'forest') {
        const forestArea = (areaManager && areaManager.getCurrentAreaId() === 'forest') ? areaManager.getCurrentArea() : forest;
        if (forestArea) {
          // [속삭이는 숲 상호작용 후보]: 마을 복귀 출구, 숲 수집품 (버섯, 허브)

          // (1) 마을 복귀 출구
          if (forestArea.exitTrigger) {
            const trig = forestArea.exitTrigger;
            const dist = Math.hypot(playerPos.x - trig.x, playerPos.z - trig.z);
            if (dist <= trig.radius) {
              candidates.push({
                id: 'forest_exit',
                type: 'forest_exit',
                icon: '🏡',
                dist,
                prompt: (trig.prompt || '마을 광장으로 돌아가기').replace(/\s*🏡\s*$/, ''),
                execute: () => {
                  if (spaceManager) spaceManager.exitForest();
                }
              });
            }
          }

          // (2) 숲 수집품 (숲 이슬 버섯, 속삭임 민트 허브)
          if (forestArea.collectibles && typeof forestArea.collectibles.getActiveItems === 'function') {
            for (const item of forestArea.collectibles.getActiveItems()) {
              const dist = Math.hypot(playerPos.x - item.x, playerPos.z - item.z);
              if (dist <= item.interactRadius) {
                const actionVerb = item.type === 'mushroom' ? '채취하기' : '꺾기';
                candidates.push({
                  id: item.id,
                  type: 'forest_collectible',
                  icon: item.icon || '🌿',
                  dist,
                  prompt: `${item.itemName} ${actionVerb}`,
                  execute: () => {
                    item.collect();
                  }
                });
              }
            }
          }
        }
      } else if (currentSpace === 'moonlight_island') {
        // [달빛 섬 상호작용 후보]: 부두 나룻배를 타고 마을 복귀
        const dist = Math.hypot(playerPos.x - 0, playerPos.z - 11);
        if (dist <= 2.8) {
          candidates.push({
            id: 'island_dock_exit',
            type: 'island_exit',
            icon: '⛵',
            dist,
            prompt: '나룻배 타고 마을 광장으로 돌아가기',
            execute: () => {
              if (spaceManager) spaceManager.travelTo('village');
            }
          });
        }
      } else if (currentSpace === 'old_mansion') {
        // [오래된 저택 상호작용 후보]: 정원 문을 열고 마을 복귀
        const dist = Math.hypot(playerPos.x - 0, playerPos.z - 15.5);
        if (dist <= 2.8) {
          candidates.push({
            id: 'mansion_gate_exit',
            type: 'mansion_exit',
            icon: '🏡',
            dist,
            prompt: '정원 문을 열고 마을 광장으로 돌아가기',
            execute: () => {
              if (spaceManager) spaceManager.travelTo('village');
            }
          });
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

      ui.showPrompt(target.prompt, target.icon || '✨');

      if (interactPressed && cooldownTimer <= 0) {
        cooldownTimer = 0.4;
        target.execute();
      }
    }
  };
}
