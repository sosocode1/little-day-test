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
import { createSpaceManager } from './systems/spaceManager.js';

const renderer = createRenderer(document.getElementById('app'));
const camera = createCamera();
const world = createScene();
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

// 아이템 보관함, 퀘스트 시스템 및 수집 꽃 매니저 초기화
const inventorySystem = createInventorySystem(player);
const inventoryUI = createInventoryUI(inventorySystem);
const flowerManager = createFlowerManager(scene);
const questSystem = createQuestSystem(inventorySystem);
const interaction = createInteractionSystem(
  npcs,
  flowerManager,
  questSystem,
  player,
  inventoryUI,
  spaceManager,
  world.cottage,
  world.village.cottageEntrance
);

let last = performance.now();
renderer.setAnimationLoop((time) => {
  const dt = Math.min((time - last) / 1000, 0.05);
  last = time;

  // I 키 입력 시 아이템 보관함 토글
  if (input.consumeInventoryToggle()) {
    inventoryUI.toggle();
  }

  // 동적 환경 업데이트 (실내에서는 야외 환경 갱신 스킵)
  if (world.update) {
    world.update(player.position, spaceManager.isIndoor());
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
