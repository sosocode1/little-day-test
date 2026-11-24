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
import { createLoadingScreen } from './ui/loadingScreen.js';
import { createAreaManager } from './world/areaManager.js';
import { createWorldMapUI } from './ui/worldMapUI.js';
import { createSaveSystem } from './systems/saveSystem.js';

// 게임 내부 시간 시스템 초기화 (현실 시간보다 정확히 1시간 느린 실시간 1:1 진행)
const timeSystem = createTimeSystem();

// ?reset=1 URL 파라미터 감지 시 신규 유저 테스트를 위한 로컬스토리지 초기화
if (typeof window !== 'undefined' && new URLSearchParams(location.search).get('reset') === '1') {
  try {
    localStorage.clear();
  } catch (e) {}
}

const renderer = createRenderer(document.getElementById('app'));
const camera = createCamera();
const world = createScene(timeSystem);
const { scene, spawn, npcs, weatherSystem } = world;
onResize(renderer, camera);

// 캐릭터 생성
const charType = new URLSearchParams(location.search).get('char') === 'male' ? 'male' : 'female';
const player = createPlayer(charType, spawn);
scene.add(player);

const input = createInput(renderer.domElement);
const followCamera = createFollowCamera(camera);

// 로딩 화면 UI 생성
const loadingScreen = createLoadingScreen();

// 시스템 참조 래퍼 (지연 바인딩용)
let inventorySystem = null;
let questSystem = null;

// 독립 3D 지역 관리자 (마을, 속삭이는 숲, 달빛 섬, 오래된 저택)
const areaManager = createAreaManager({
  scene,
  timeSystem,
  player,
  followCamera,
  loadingScreen,
  getSystems: () => ({ inventorySystem, questSystem })
});

// 공간 전환 관리자 (마을 <-> 별장 실내 및 구역 이동)
world.cottage = areaManager.getCottage();
const spaceManager = createSpaceManager(world, player, followCamera, areaManager);

// 아이템 보관함, 옷장, 화장대, 조작 안내 가이드 및 퀘스트 시스템 초기화
inventorySystem = createInventorySystem(player);
const inventoryUI = createInventoryUI(inventorySystem);
const wardrobeUI = createWardrobeUI(inventorySystem);
const vanityUI = createVanityUI(player);
const welcomeGuideUI = createWelcomeGuideUI();
const flowerManager = createFlowerManager(scene);
questSystem = createQuestSystem(inventorySystem);

// 월드맵 UI 생성 (단축키 M 및 우측 상단 플로팅 버튼)
const worldMapUI = createWorldMapUI(areaManager, questSystem, inventorySystem);

// 밤 22:00 전용 미스터리 이벤트: 사라진 달빛 꽃 (The Lost Moonflower)
const moonflowerEvent = createMoonflowerEvent(scene, timeSystem, questSystem, inventorySystem);
const timeUI = createTimeUI(timeSystem, moonflowerEvent, weatherSystem);

// 통합 세이브 시스템 초기화 및 바인딩
const saveSystem = createSaveSystem({
  player,
  areaManager,
  questSystem,
  inventorySystem,
  timeSystem,
  moonflowerEvent,
  flowerManager,
  weatherSystem
});

// 외형 스타일링 변경 시 자동 저장
vanityUI.onChange(() => saveSystem.save());

// 주기적 자동 저장 (25초 간격)
setInterval(() => saveSystem.save(), 25000);

// 세이브 데이터 복원 (외형, 장착, 퀘스트, 위치/지역)
saveSystem.restore().then(() => {
  if (flowerManager && questSystem && typeof flowerManager.syncCollected === 'function') {
    flowerManager.syncCollected(questSystem.getCollectedFlowerIds());
  }
  if (followCamera && typeof followCamera.snap === 'function') {
    followCamera.snap(player.position);
  }
});

// 공간 이동 알림 (별장 진입 시 '우리 집에 돌아왔어요!' 토스트) 및 자동 저장
spaceManager.onSpaceChange((space) => {
  saveSystem.save();
  if (space === 'cottage') {
    questSystem.ui.showToast('우리 집에 돌아왔어요! 편안하게 쉬어가세요 🏡✨', '🏡', 3000);
  } else if (space === 'village') {
    questSystem.ui.showToast('마을 광장으로 나왔어요! 기분 좋은 하루를 보내세요 🌿☀️', '🌿', 2500);
  } else if (space === 'forest') {
    questSystem.ui.showToast('신비로운 속삭이는 숲에 들어왔어요! 🌲✨', '🌲', 3200);
  } else if (space === 'moonlight_island') {
    questSystem.ui.showToast('달빛 섬에 도착했습니다! 은빛 모래사장을 거닐어보세요 🏝️✨', '🏝️', 3200);
  } else if (space === 'old_mansion') {
    questSystem.ui.showToast('오래된 저택 정원에 들어왔습니다! 🏰✨', '🏰', 3200);
  }
});

const interaction = createInteractionSystem(
  npcs,
  flowerManager,
  questSystem,
  player,
  inventoryUI,
  spaceManager,
  areaManager.getCottage(),
  world.village.cottageEntrance,
  wardrobeUI,
  vanityUI,
  welcomeGuideUI,
  moonflowerEvent,
  null,
  world.village.forestEntrance,
  areaManager,
  worldMapUI,
  timeSystem,
  saveSystem
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

  // 동적 환경 업데이트 (낮과 밤 태양/달 궤도, 하늘/안개 색상, 가로등/창문/반딧불이 및 활성 지역 갱신)
  if (world.update) {
    world.update(player.position, spaceManager.isIndoor(), dt, spaceManager.getCurrentSpace(), areaManager);
  }

  // 상호작용 및 NPC/꽃/별장/퀘스트 업데이트
  interaction.update(player.position, input, dt);

  // 대화, 보상 모달, 보관함 오픈 또는 공간 전환 중에는 플레이어 이동 제한
  const moveAxis = interaction.isInteracting() ? { x: 0, y: 0 } : input.getMoveAxis();

  // 현재 공간(야외 vs 별장 실내)에 맞는 콜라이더 및 경계 적용
  const activeColliders = spaceManager.getActiveColliders();
  const activeBoundary = spaceManager.getActiveBoundary();

  followCamera.update(player.position, input.consumeLook(), dt, input.consumeZoom());
  updatePlayer(player, moveAxis, followCamera.yaw, dt, activeColliders, activeBoundary);
  renderer.render(scene, camera);
});
