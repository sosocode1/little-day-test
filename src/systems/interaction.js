import * as THREE from 'three';
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
  moonflowerEvent = null,
  forest = null,
  forestEntrance = null,
  areaManager = null,
  worldMapUI = null
) {
  const ui = createDialogueUI();
  let nearestNpc = null;
  let nearestFlower = null;
  let activeNpc = null;
  let cooldownTimer = 0;

  // ---- 마우스/터치 입력 → E키와 동일한 실행 경로 (update 안의 단일 execute) ----
  // 클릭은 즉시 실행하지 않고 요청만 기록한다. 다음 update 에서 현재 사거리 안의 후보에 한해,
  // E키 입력과 동일한 조건/쿨다운으로 한 번만 실행된다 (동시 입력해도 중복 실행 없음).
  let pendingPromptClick = false;
  let pendingWorldClick = null; // { id, type }
  let lastCandidates = [];
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  ui.setPromptHandler(() => {
    pendingPromptClick = true;
  });

  // 화면 좌표에서 사거리 안 후보의 3D 오브젝트를 찾는다
  function pickCandidate(domElement, camera, e) {
    const objs = lastCandidates.filter((c) => c.object && c.object.visible !== false);
    if (!objs.length) return null;
    const rect = domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    let best = null;
    let bestDist = Infinity;
    for (const c of objs) {
      const hit = raycaster.intersectObject(c.object, true)[0];
      if (hit && hit.distance < bestDist) {
        best = c;
        bestDist = hit.distance;
      }
    }
    return best;
  }

  function bindPointer(domElement, camera) {
    let down = null;
    domElement.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    });
    // 드래그(카메라 회전)와 클릭 구분: 거의 움직이지 않은 짧은 입력만 클릭으로 인정
    domElement.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dur = performance.now() - down.t;
      down = null;
      if (moved > 6 || dur > 500) return;
      const c = pickCandidate(domElement, camera, e);
      if (c) pendingWorldClick = { id: c.id, type: c.type };
    });
    domElement.addEventListener('pointermove', (e) => {
      if (down) return;
      domElement.style.cursor = pickCandidate(domElement, camera, e) ? 'pointer' : '';
    });
  }

  return {
    bindPointer,
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
    areaManager,
    worldMapUI,
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
      // 이전 프레임에 쌓인 클릭 요청 소모 (대화/모달 등으로 early return 되면 폐기됨)
      const promptClicked = pendingPromptClick;
      const worldClick = pendingWorldClick;
      pendingPromptClick = false;
      pendingWorldClick = null;
      lastCandidates = [];
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

      // 1. NPC들의 아이들 애니메이션 및 시선 업데이트 (마을 야외일 때만)
      const currentSpace = spaceManager ? spaceManager.getCurrentSpace() : 'village';
      const isIndoor = spaceManager && spaceManager.isIndoor();
      if (currentSpace === 'village') {
        for (const npc of npcs) {
          const isCurrentActive = isDialogueOpen && activeNpc === npc;
          npc.update(dt, playerPos, isCurrentActive);
        }

        // 2. 수집 가능한 꽃들 애니메이션 업데이트
        if (flowerManager) {
          flowerManager.update(dt);
        }
      }

      const isWorldMapOpen = worldMapUI && worldMapUI.isOpen();

      // 전환 중이거나 인벤토리/옷장/화장대/월드맵이 열려 있는 경우 프롬프트 숨김 및 입력 스킵
      if (isTransitioning || isInventoryOpen || isWardrobeOpen || isVanityOpen || isWorldMapOpen) {
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

      if (currentSpace === 'cottage' && cottage && cottage.triggers) {
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
      } else if (currentSpace === 'village') {
        // [마을 야외 상호작용 후보]: 별장 현관, 꽃 수집, NPC 대화, 달빛 꽃, 속삭이는 숲 입구

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
                object: flower.model?.root,
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
              object: npc.root,
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

        // (5) 속삭이는 숲 (Whispering Forest) 입장
        if (forestEntrance) {
          const dist = Math.hypot(playerPos.x - forestEntrance.x, playerPos.z - forestEntrance.z);
          if (dist <= forestEntrance.radius) {
            candidates.push({
              id: 'forest_entrance',
              type: 'forest_entrance',
              dist,
              prompt: '속삭이는 숲(Whispering Forest) 들어가기 🌲',
              execute: () => {
                if (spaceManager) spaceManager.enterForest();
              }
            });
          }
        }
        // (6) 부두의 배 / 선착장 → 섬 선택 화면
        const dock = areaManager && typeof areaManager.getVillageDock === 'function' ? areaManager.getVillageDock() : null;
        if (dock && worldMapUI) {
          const dist = Math.hypot(playerPos.x - dock.x, playerPos.z - dock.z);
          if (dist <= dock.radius) {
            candidates.push({
              id: 'village_dock',
              type: 'dock',
              dist,
              prompt: dock.prompt,
              execute: () => {
                worldMapUI.open({ canTravel: true });
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
                dist,
                prompt: trig.prompt || '마을 광장으로 돌아가기 🏡',
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
                  object: item.modelObj?.root,
                  dist,
                  prompt: `${item.itemName} ${actionVerb} ${item.icon}`,
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
            dist,
            prompt: '나룻배 타고 마을 광장으로 돌아가기 ⛵',
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
            dist,
            prompt: '정원 문을 열고 마을 광장으로 돌아가기 🏡',
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
      lastCandidates = candidates;

      // 월드 클릭은 클릭한 대상(사거리 안 후보), 그 외(E키/프롬프트 클릭)는 가장 가까운 대상
      const clicked = worldClick ? candidates.find((c) => c.id === worldClick.id && c.type === worldClick.type) : null;
      const target = clicked || candidates[0];

      ui.showPrompt(target.prompt);

      if ((interactPressed || promptClicked || clicked) && cooldownTimer <= 0) {
        cooldownTimer = 0.4;
        target.execute();
      }
    }
  };
}
