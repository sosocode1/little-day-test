import { createDialogueUI } from '../ui/dialogueUI.js';
import { createNpcOverheadUI } from '../ui/npcOverheadUI.js';
import { resolveNpcDialogueTree } from '../data/dialogue.js';
import { QuestState, QUEST_DATA, LIGHTHOUSE_QUEST_DATA, DIALOGUE_QUEST_HOOKS } from '../data/quest.js';
import { LIGHTHOUSE_LORE } from '../data/lighthousePuzzle.js';

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
  saveSystem = null,
  lighthousePuzzleSystem = null,
  clueUI = null,
  lighthousePuzzleUI = null
) {
  const ui = createDialogueUI();
  const overheadUI = createNpcOverheadUI();
  let camera = null;
  let deliveryEffect = null;
  let activeNpc = null;
  let cooldownTimer = 0;
  let promptTapRequested = false;
  let lighthouseApproachNotifiedThisVisit = false;

  ui.onPromptTap(() => {
    promptTapRequested = true;
  });

  // 폭시에게 분홍색 꽃 전달 확인창 → 차감 → 3D 연출 → 기쁨 대사 → 보상 모달 파이프라인
  function triggerQuestItemDelivery(questId, targetNpc) {
    if (!questSystem || !targetNpc) return;

    const status =
      typeof questSystem.getRequirementStatus === 'function'
        ? questSystem.getRequirementStatus(questId)
        : null;

    if (!status) return;

    if (status.missing.length > 0) {
      const firstMissing = status.missing[0];
      questSystem.ui.showToast(
        `${firstMissing.name}이(가) 부족해서 전달할 수 없어요! (보유: ${firstMissing.owned}/${firstMissing.count}개)`,
        '⚠️',
        2800
      );
      return;
    }

    if (!status.canDeliver) return;

    const questDef = status.quest || QUEST_DATA;
    const npcDisplayName = targetNpc.data?.displayName || targetNpc.data?.name || '폭시';

    questSystem.ui.showDeliveryConfirmModal(
      {
        npcName: npcDisplayName,
        title: `${npcDisplayName}에게 꽃을 전달할까요?`,
        subtitle: '전달하면 내 가방에서 분홍색 꽃 3개가 차감되고 보상을 받습니다.',
        requirements: status.requirements,
        rewards: questDef.rewards
      },
      () => {
        // 전달 확정!
        const res = questSystem.deliverQuestItems(questId);
        if (!res || !res.ok) {
          if (res?.reason === 'insufficient_items') {
            questSystem.ui.showToast('분홍색 꽃이 부족해서 전달할 수 없어요!', '⚠️', 2600);
          }
          return;
        }

        if (saveSystem && typeof saveSystem.save === 'function') {
          saveSystem.save(true);
        }

        // 1) 3D 꽃 전달 연출 + 폭시 기쁨 반응 + 꽃잎/반짝임 파티클
        if (deliveryEffect && typeof deliveryEffect.playItemDelivery === 'function') {
          deliveryEffect.playItemDelivery(player, targetNpc);
        } else if (typeof targetNpc.playJoyReaction === 'function') {
          targetNpc.playJoyReaction(2.2);
        }

        questSystem.ui.showToast('폭시에게 분홍색 꽃 3개를 전달했습니다! 🌸✨', '🌸', 2600);

        // 2) 폭시의 기쁨 감사 대사 출력 → 대화 종료 시 보상 획득 모달 표시
        const isNightNow = Boolean(timeSystem && typeof timeSystem.isNight === 'function' && timeSystem.isNight());
        const mainReward = (res.rewards && res.rewards[0]) || questDef.reward;
        activeNpc = targetNpc;
        ui.hidePrompt();
        overheadUI.hideAll();
        ui.openDialogue(
          targetNpc,
          () => {
            activeNpc = null;
            cooldownTimer = 0.35;
            questSystem.ui.showRewardModal({
              title: questDef.title,
              subtitle: '폭시에게 분홍색 꽃 3개를 전달했습니다!',
              ...mainReward
            });
          },
          {
            isNight: isNightNow,
            customLines: [
              '우와! 정말 예쁜 꽃이야!\n이렇게 많이 모아주다니 정말 고마워!',
              '고마운 마음을 담아 내가 아껴두던 반짝이는 조개를 선물로 줄게.\n분명 앞으로 이 섬의 비밀을 푸는 데 도움이 될 거야!'
            ]
          }
        );
      },
      () => {
        cooldownTimer = 0.25;
      }
    );
  }

  if (questSystem && typeof questSystem.registerQuestHook === 'function') {
    questSystem.registerQuestHook(DIALOGUE_QUEST_HOOKS.REQUEST_FOX_FLOWER_DELIVERY, ({ npc }) => {
      const foxNpc = npc || npcs.find((n) => n && (n.id === 'fox' || n.type === 'fox'));
      triggerQuestItemDelivery(QUEST_DATA.id, foxNpc);
    });
  }

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
    setDeliveryEffect(effectMgr) {
      deliveryEffect = effectMgr;
    },
    setTimeSystem(ts) {
      timeSystem = ts;
    },
    setSaveSystem(ss) {
      saveSystem = ss;
    },
    // 대화창, 전달 확인창, 보상 모달, 퀘스트 저널, 보관함, 옷장, 화장대, 환영 가이드, 월드맵, 단서창, 퍼즐창 또는 공간 전환 중인지 여부 (플레이어 이동 잠금용)
    isInteracting() {
      return (
        ui.isOpen() ||
        (questSystem && questSystem.ui.isDeliveryModalOpen && questSystem.ui.isDeliveryModalOpen()) ||
        (questSystem && questSystem.ui.isRewardModalOpen()) ||
        (questSystem && questSystem.ui.isJournalOpen && questSystem.ui.isJournalOpen()) ||
        (inventoryUI && inventoryUI.isOpen()) ||
        (wardrobeUI && wardrobeUI.isOpen()) ||
        (vanityUI && vanityUI.isOpen()) ||
        (welcomeGuideUI && welcomeGuideUI.isOpen()) ||
        (worldMapUI && worldMapUI.isOpen()) ||
        (clueUI && clueUI.isOpen()) ||
        (lighthousePuzzleUI && lighthousePuzzleUI.isOpen()) ||
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
      const isDeliveryOpen = questSystem && questSystem.ui.isDeliveryModalOpen && questSystem.ui.isDeliveryModalOpen();
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
      if (currentSpace !== 'moonlight_island') {
        lighthouseApproachNotifiedThisVisit = false;
      }
      if (flowerManager && typeof flowerManager.setVisible === 'function') {
        flowerManager.setVisible(currentSpace === 'village');
      }
      if (deliveryEffect && typeof deliveryEffect.update === 'function') {
        deliveryEffect.update(dt);
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
      const isJournalOpen = questSystem && questSystem.ui.isJournalOpen && questSystem.ui.isJournalOpen();
      const isClueOpen = clueUI && clueUI.isOpen();
      const isPuzzleOpen = lighthousePuzzleUI && lighthousePuzzleUI.isOpen();
      const isNight = Boolean(timeSystem && typeof timeSystem.isNight === 'function' && timeSystem.isNight());
      const canShowOverhead =
        currentSpace === 'village' &&
        !isDialogueOpen &&
        !isDeliveryOpen &&
        !isRewardOpen &&
        !isJournalOpen &&
        !isTransitioning &&
        !isInventoryOpen &&
        !isWardrobeOpen &&
        !isVanityOpen &&
        !isWorldMapOpen &&
        !isClueOpen &&
        !isPuzzleOpen;

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

      // 전환 중이거나 전달 확인창/퀘스트 저널/인벤토리/옷장/화장대/월드맵/단서창/퍼즐창이 열려 있는 경우 프롬프트 숨김 및 입력 스킵
      if (
        isTransitioning ||
        isDeliveryOpen ||
        isJournalOpen ||
        isInventoryOpen ||
        isWardrobeOpen ||
        isVanityOpen ||
        isWorldMapOpen ||
        isClueOpen ||
        isPuzzleOpen
      ) {
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
                  foxInventoryCount:
                    questSystem && typeof questSystem.getInventoryCount === 'function'
                      ? questSystem.getInventoryCount('pink_flower')
                      : 0,
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
                        questSystem.onNpcDialogueCompleted(npcId, result, { isNight, player, npc });
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
        const islandArea = areaManager ? areaManager.getCurrentArea() : null;
        const inter = islandArea?.interactables;

        // (0) 등대 근처 접근 탐험 안내 및 메인 퀘스트('사라진 등대의 비밀') 시작/갱신
        if (inter && lighthousePuzzleSystem) {
          const distToLighthouse = Math.hypot(
            playerPos.x - inter.lighthouseCenter.x,
            playerPos.z - inter.lighthouseCenter.z
          );
          if (distToLighthouse <= inter.approachRadius) {
            const firstApproach = lighthousePuzzleSystem.markApproached();
            if (firstApproach) {
              lighthouseApproachNotifiedThisVisit = true;
              if (questSystem?.ui?.showToast) {
                questSystem.ui.showToast(
                  '오래된 하얀 등대에 다가왔습니다! 등대 입구와 주변 단서를 조사해 보세요 🏛️✨',
                  '🏛️',
                  3600
                );
              }
            } else if (!lighthouseApproachNotifiedThisVisit && !lighthousePuzzleSystem.isRewardClaimed()) {
              lighthouseApproachNotifiedThisVisit = true;
              if (questSystem?.ui?.showToast) {
                const msg = lighthousePuzzleSystem.isPuzzleSolved()
                  ? '등대 왼쪽 기단의 열린 비밀 석함에서 오래된 항해 기록을 확인해 보세요! 📜✨'
                  : '오래된 등대 주변에 숨겨진 단서와 고대 장치가 있습니다. 가까이 다가가 [E]로 조사해 보세요 🔍';
                questSystem.ui.showToast(msg, '🏛️', 3200);
              }
            }
          }
        }

        // (1) 부두 나룻배를 타고 마을 복귀
        const distDock = Math.hypot(playerPos.x - 0, playerPos.z - 11);
        if (distDock <= 2.8) {
          candidates.push({
            id: 'island_dock_exit',
            type: 'island_exit',
            icon: '⛵',
            dist: distDock,
            prompt: '나룻배 타고 마을 광장으로 돌아가기',
            execute: () => {
              lighthouseApproachNotifiedThisVisit = false;
              if (spaceManager) spaceManager.travelTo('village');
            }
          });
        }

        if (inter && lighthousePuzzleSystem) {
          // (2) 등대 입구 조사
          const distEntrance = Math.hypot(playerPos.x - inter.entrance.x, playerPos.z - inter.entrance.z);
          if (distEntrance <= inter.entrance.radius) {
            candidates.push({
              id: 'lighthouse_entrance',
              type: 'lighthouse_entrance',
              icon: '🚪',
              dist: distEntrance,
              prompt: '등대 입구 조사하기',
              execute: () => {
                const res = lighthousePuzzleSystem.inspectEntrance();
                const lore = res.puzzleSolved ? LIGHTHOUSE_LORE.entranceUnlocked : LIGHTHOUSE_LORE.entranceLocked;
                const pState = lighthousePuzzleSystem.getState();
                if (clueUI) {
                  clueUI.open({
                    ...lore,
                    discoveredCount: pState.discoveredClueCount,
                    totalClues: pState.totalClues
                  });
                }
              }
            });
          }

          // (3) 오래된 등대의 장치 (퍼즐 UI 열기)
          const distDevice = Math.hypot(playerPos.x - inter.device.x, playerPos.z - inter.device.z);
          if (distDevice <= inter.device.radius) {
            const solved = lighthousePuzzleSystem.isPuzzleSolved();
            candidates.push({
              id: 'lighthouse_device',
              type: 'lighthouse_device',
              icon: solved ? '✨' : '🏛️',
              dist: distDevice,
              prompt: solved ? '작동된 등대 장치 확인하기' : '오래된 등대 장치 조사하기',
              execute: () => {
                lighthousePuzzleSystem.inspectDevice();
                if (lighthousePuzzleUI) {
                  lighthousePuzzleUI.open({
                    onSolved: () => {
                      if (islandArea && typeof islandArea.triggerSolveCelebration === 'function') {
                        islandArea.triggerSolveCelebration();
                      }
                      if (islandArea && typeof islandArea.syncPuzzleState === 'function') {
                        islandArea.syncPuzzleState(lighthousePuzzleSystem.getState());
                      }
                      if (questSystem?.ui?.showToast) {
                        questSystem.ui.showToast(
                          '등대 장치가 깨어났습니다! 왼쪽 기단의 열린 비밀 석함을 조사해 보세요 ✨📜',
                          '🌟',
                          3800
                        );
                      }
                    }
                  });
                }
              }
            });
          }

          // (4) 숨겨진 비밀 석함 (잠김 안내 / 퍼즐 성공 후 '오래된 항해 기록' 획득)
          const distVault = Math.hypot(playerPos.x - inter.vault.x, playerPos.z - inter.vault.z);
          if (distVault <= inter.vault.radius) {
            const solved = lighthousePuzzleSystem.isPuzzleSolved();
            const claimed = lighthousePuzzleSystem.isRewardClaimed();
            candidates.push({
              id: 'lighthouse_vault',
              type: 'lighthouse_vault',
              icon: !solved ? '🔒' : claimed ? '📜' : '✨',
              dist: distVault,
              prompt: !solved
                ? '봉인된 돌 석함 조사하기'
                : claimed
                  ? '오래된 항해 기록 다시 읽기'
                  : '숨겨진 비밀 석함에서 항해 기록 꺼내기',
              execute: () => {
                if (!solved) {
                  if (clueUI) {
                    const pState = lighthousePuzzleSystem.getState();
                    clueUI.open({
                      ...LIGHTHOUSE_LORE.vaultLocked,
                      discoveredCount: pState.discoveredClueCount,
                      totalClues: pState.totalClues
                    });
                  }
                  return;
                }

                if (claimed) {
                  if (clueUI) {
                    clueUI.open({
                      ...LIGHTHOUSE_LORE.voyageLogStory,
                      subtitle: '획득 완료된 이야기 단서'
                    });
                  }
                  return;
                }

                // 최초 보상 획득: 인벤토리 추가 + 퀘스트 완료 + 이야기 단서 열람 → 보상 모달
                const claimRes = lighthousePuzzleSystem.claimSecretReward();
                if (claimRes && claimRes.ok) {
                  if (islandArea && typeof islandArea.syncPuzzleState === 'function') {
                    islandArea.syncPuzzleState(lighthousePuzzleSystem.getState());
                  }
                  const rewardDef = LIGHTHOUSE_QUEST_DATA.rewards[0];
                  const showQuestReward = () => {
                    if (questSystem?.ui?.showRewardModal) {
                      questSystem.ui.showRewardModal({
                        title: LIGHTHOUSE_QUEST_DATA.title,
                        subtitle: '오래된 등대의 장치를 풀어 숨겨진 기록을 발견했습니다!',
                        ...rewardDef
                      });
                    }
                  };
                  if (clueUI) {
                    clueUI.open(
                      {
                        ...LIGHTHOUSE_LORE.voyageLogStory,
                        isNew: true,
                        subtitle: '새로운 이야기 단서 획득!',
                        buttonText: '기록 획득하기 📜'
                      },
                      showQuestReward
                    );
                  } else {
                    showQuestReward();
                  }
                }
              }
            });
          }

          // (5) 등대 주변 단서 4종 조사
          for (const clue of inter.clues || []) {
            const distClue = Math.hypot(playerPos.x - clue.position.x, playerPos.z - clue.position.z);
            if (distClue <= clue.interactRadius) {
              const alreadyFound = lighthousePuzzleSystem.hasDiscoveredClue(clue.id);
              candidates.push({
                id: clue.id,
                type: 'lighthouse_clue',
                icon: clue.icon || '🔍',
                dist: distClue,
                prompt: alreadyFound ? `${clue.title} 다시 살펴보기` : clue.prompt,
                execute: () => {
                  const res = lighthousePuzzleSystem.discoverClue(clue.id);
                  if (islandArea && typeof islandArea.syncPuzzleState === 'function') {
                    islandArea.syncPuzzleState(lighthousePuzzleSystem.getState());
                  }
                  if (res.isNew && questSystem?.ui?.showToast) {
                    questSystem.ui.showToast(
                      `단서 발견: ${clue.title} (${res.discoveredCount}/${res.totalClues}) 🔍`,
                      clue.icon || '🔍',
                      2800
                    );
                  }
                  if (clueUI) {
                    clueUI.open({
                      title: clue.title,
                      location: clue.location,
                      icon: clue.icon,
                      body: clue.body,
                      hintSummary: clue.hintSummary,
                      isNew: res.isNew,
                      discoveredCount: res.discoveredCount,
                      totalClues: res.totalClues
                    });
                  }
                }
              });
            }
          }
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
