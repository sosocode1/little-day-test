import { createRenderer, onResize } from './core/renderer.js';
import { createCamera } from './camera/mainCamera.js';
import { createFollowCamera } from './camera/followCamera.js';
import { createScene } from './world/scene.js';
import { createPlayer, updatePlayer } from './character/player.js';
import { createInput } from './systems/input.js';
import { createInteractionSystem } from './systems/interaction.js';
import { createFlowerManager } from './world/collectibleFlower.js';
import { createQuestSystem } from './systems/quest.js';
import { createInventorySystem } from './systems/inventory.js';
import { createInventoryUI } from './ui/inventoryUI.js';
import { createWardrobeUI } from './ui/wardrobeUI.js';
import { createVanityUI } from './ui/vanityUI.js';
import { createWelcomeGuideUI } from './ui/welcomeGuideUI.js';
import { createTimeUI } from './ui/timeUI.js';
import { createTimeSystem } from './systems/timeSystem.js';
import { createMoonflowerEvent } from './world/moonflowerEvent.js';
import { createSpaceManager } from './systems/spaceManager.js';

// 게임 내부 시간 시스템 초기화 (기본 오전 10:00 시작, 현실 8분 = 게임 24시간)
const timeSystem = createTimeSystem({ initialTime: 10.0, realSecondsPerDay: 480 });

const renderer = createRenderer(document.getElementById('app'));
const camera = createCamera();
const world = createScene(timeSystem);
const { scene, spawn, npcs } = world;
onResize(renderer, camera);

// 캐릭터 선택 UI 전까지는 ?char=male 로 임시 선택
const charType = new URLSearchParams(location.search).get('char') === 'male' ? 'male' : 'female';
const player = createPlayer(charType, spawn);
scene.add(player);

const input = createInput(renderer.domElement);
const followCamera = createFollowCamera(camera);

// 공간 전환 관리자 (마을 <-> 별장 실내)
const spaceManager = createSpaceManager(world, player, followCamera);

// 아이템 보관함, 옷장, 화장대, 조작 안내 가이드 및 퀘스트 시스템 초기화
const inventorySystem = createInventorySystem(player);
const inventoryUI = createInventoryUI(inventorySystem);
const wardrobeUI = createWardrobeUI(inventorySystem);
const vanityUI = createVanityUI(player);
const welcomeGuideUI = createWelcomeGuideUI();
const flowerManager = createFlowerManager(scene);
const questSystem = createQuestSystem(inventorySystem);

// 밤 22:00 전용 미스터리 이벤트: 사라진 달빛 꽃 (The Lost Moonflower)
const moonflowerEvent = createMoonflowerEvent(scene, timeSystem, questSystem, inventorySystem);
const timeUI = createTimeUI(timeSystem, moonflowerEvent);

// 속삭이는 숲 수집품 시스템에 인벤토리 및 퀘스트(토스트) 시스템 연결
if (world.forest && typeof world.forest.setSystems === 'function') {
  world.forest.setSystems(inventorySystem, questSystem);
}

// 공간 이동 알림 (별장 진입 시 '우리 집에 돌아왔어요!' 토스트)
spaceManager.onSpaceChange((space) => {
  if (space === 'cottage') {
    questSystem.ui.showToast('우리 집에 돌아왔어요! 편안하게 쉬어가세요 🏡✨', '🏡', 3000);
  } else if (space === 'village') {
    questSystem.ui.showToast('마을 광장으로 나왔어요! 기분 좋은 하루를 보내세요 🌿☀️', '🌿', 2500);
  } else if (space === 'forest') {
    questSystem.ui.showToast('신비로운 속삭이는 숲에 들어왔어요! 🌲✨', '🌲', 3200);
  }
});

const interaction = createInteractionSystem(
  npcs,
  flowerManager,
  questSystem,
  player,
  inventoryUI,
  spaceManager,
  world.cottage,
  world.village.cottageEntrance,
  wardrobeUI,
  vanityUI,
  welcomeGuideUI,
  moonflowerEvent,
  world.forest,
  world.village.forestEntrance
);

let last = performance.now();
renderer.setAnimationLoop((time) => {
  const dt = Math.min((time - last) / 1000, 0.05);
  last = time;

  // 게임 시간 및 시간 표시 UI 업데이트
  timeSystem.update(dt);
  timeUI.update();

  // 밤 22:00 미스터리 이벤트 갱신 (시간 체크, 푸른빛 오라 및 반딧불이 애니메이션)
  moonflowerEvent.update(dt, spaceManager.isIndoor());

  // I 키 입력 시 아이템 보관함 토글
  if (input.consumeInventoryToggle()) {
    inventoryUI.toggle();
  }

  // 동적 환경 업데이트 (낮과 밤 태양/달 궤도, 하늘/안개 색상, 가로등/창문/반딧불이)
  if (world.update) {
    world.update(player.position, spaceManager.isIndoor(), dt);
  }

  // 상호작용 및 NPC/꽃/별장/퀘스트 업데이트
  interaction.update(player.position, input, dt);

  // 대화, 보상 모달, 보관함 오픈 또는 공간 전환 중에는 플레이어 이동 제한
  const moveAxis = interaction.isInteracting() ? { x: 0, y: 0 } : input.getMoveAxis();

  // 현재 공간(야외 vs 별장 실내)에 맞는 콜라이더 및 경계 적용
  const activeColliders = spaceManager.getActiveColliders();
  const activeBoundary = spaceManager.getActiveBoundary();

  followCamera.update(player.position, input.consumeLook(), dt);
  updatePlayer(player, moveAxis, followCamera.yaw, dt, activeColliders, activeBoundary);
  renderer.render(scene, camera);
});
