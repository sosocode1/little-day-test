// LITTLE DAY 속삭이는 숲 수집품 시스템 (숲 이슬 버섯 🍄, 속삭임 민트 허브 🌿)
import * as THREE from 'three';
import { ITEMS } from '../data/items.js';

// 공유 클레이 재질 헬퍼
const materials = new Map();
const mat = (color, roughness = 0.9, metalness = 0) => {
  if (!materials.has(color)) {
    materials.set(color, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  }
  return materials.get(color);
};

const sphereGeo = new THREE.SphereGeometry(1, 14, 10);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12);

function createBall(material, radius, scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(sphereGeo, material);
  m.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// 1. 숲 이슬 버섯 3D 모델 제작 (귀여운 클레이 버섯 + 물방울 + 반짝임)
function buildDewMushroomModel() {
  const group = new THREE.Group();
  group.name = 'dew_mushroom_model';

  const STEM_COLOR = 0xfbf6ea;
  const CAP_COLOR = 0x48c9b0;       // 에메랄드 이슬 민트빛 버섯갓
  const DOT_COLOR = 0xffffff;
  const DEW_COLOR = 0xc5f3ee;       // 영롱한 이슬 물방울

  // (1) 버섯 줄기 (살짝 통통한 원기둥)
  const stem = new THREE.Mesh(cylGeo, mat(STEM_COLOR, 0.95));
  stem.scale.set(0.14, 0.38, 0.14);
  stem.position.y = 0.19;
  stem.castShadow = true;
  group.add(stem);

  // (2) 버섯 머리 (살짝 도톰한 반구형 갓)
  const capGroup = new THREE.Group();
  capGroup.position.y = 0.38;

  const cap = createBall(mat(CAP_COLOR, 0.8), 0.32, [1.1, 0.75, 1.1], [0, 0.08, 0]);
  cap.castShadow = true;
  capGroup.add(cap);

  // 갓 위의 하얀 도트 (3개)
  const dotCoords = [
    [0, 0.31, 0.06],
    [-0.18, 0.22, -0.1],
    [0.17, 0.2, 0.12]
  ];
  for (const pos of dotCoords) {
    const dot = createBall(mat(DOT_COLOR, 0.9), 0.06, [1, 0.5, 1], pos);
    capGroup.add(dot);
  }

  // 영롱한 아침 이슬 물방울 (투명 글래스 느낌 클레이)
  const dewMat = new THREE.MeshStandardMaterial({
    color: DEW_COLOR,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
    emissive: 0x247167,
    emissiveIntensity: 0.3
  });
  const dew = createBall(dewMat, 0.09, [0.9, 1.2, 0.9], [0.12, 0.28, -0.14]);
  capGroup.add(dew);

  // 은은한 오라 구체
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x76d7c4,
    transparent: true,
    opacity: 0.26
  });
  const aura = createBall(auraMat, 0.44, [1, 0.9, 1], [0, 0.12, 0]);
  capGroup.add(aura);

  group.add(capGroup);

  return { root: group, capGroup, aura };
}

// 2. 속삭임 민트 허브 3D 모델 제작 (향기로운 허브 줄기 + 잎사귀 + 파스텔 꽃봉오리)
function buildWhisperMintHerbModel() {
  const group = new THREE.Group();
  group.name = 'whisper_mint_herb_model';

  const STEM_COLOR = 0x58b368;
  const LEAF_COLOR = 0x78e08f;
  const FLOWER_COLOR = 0xf9e79f;     // 은은한 노란 파스텔 꽃술

  // (1) 줄기
  const stem = new THREE.Mesh(cylGeo, mat(STEM_COLOR, 0.95));
  stem.scale.set(0.04, 0.5, 0.04);
  stem.position.y = 0.25;
  stem.castShadow = true;
  group.add(stem);

  // (2) 잎사귀 층 (3단 잎사귀)
  const leafLayers = [
    { y: 0.15, scale: 0.16, rot: 0 },
    { y: 0.30, scale: 0.13, rot: Math.PI / 4 },
    { y: 0.42, scale: 0.10, rot: Math.PI / 2 }
  ];

  for (const layer of leafLayers) {
    for (const s of [-1, 1]) {
      const leaf = createBall(mat(LEAF_COLOR, 0.85), layer.scale, [1.3, 0.28, 0.7], [s * layer.scale * 0.9, layer.y, 0]);
      leaf.rotation.z = s * -0.42;
      leaf.rotation.y = layer.rot;
      leaf.castShadow = true;
      group.add(leaf);
    }
  }

  // (3) 상단 민트 꽃봉오리
  const flowerHead = new THREE.Group();
  flowerHead.position.y = 0.52;

  const blossom = createBall(mat(FLOWER_COLOR, 0.8), 0.11, [1, 1.2, 1], [0, 0, 0]);
  flowerHead.add(blossom);

  // 허브의 은은한 향기 오라 구체
  const scentMat = new THREE.MeshBasicMaterial({
    color: 0xa9dfbf,
    transparent: true,
    opacity: 0.24
  });
  const aura = createBall(scentMat, 0.38, [1, 1, 1], [0, 0, 0]);
  flowerHead.add(aura);

  group.add(flowerHead);

  return { root: group, flowerHead, aura };
}

// 3. 숲 수집품 전체 관리자 생성
export function createForestCollectibles(inventorySystem = null, questSystem = null) {
  let _invSystem = inventorySystem;
  let _questSystem = questSystem;
  const group = new THREE.Group();
  group.name = 'forest_collectibles_group';

  // 숲 스폰 위치 6곳 (버섯 3개, 민트 허브 3개)
  const COLLECTIBLE_SPOTS = [
    // [숲 이슬 버섯] 3곳
    {
      id: 'forest_shroom_1',
      itemId: 'forest_dew_mushroom',
      itemName: '숲 이슬 버섯',
      icon: '🍄',
      type: 'mushroom',
      x: -8.5,
      z: 4.0,
      label: '버섯 바위 그늘'
    },
    {
      id: 'forest_shroom_2',
      itemId: 'forest_dew_mushroom',
      itemName: '숲 이슬 버섯',
      icon: '🍄',
      type: 'mushroom',
      x: -6.2,
      z: -4.5,
      label: '숲 시냇가 덤불'
    },
    {
      id: 'forest_shroom_3',
      itemId: 'forest_dew_mushroom',
      itemName: '숲 이슬 버섯',
      icon: '🍄',
      type: 'mushroom',
      x: 5.8,
      z: 9.5,
      label: '고목 그루터기 아래'
    },

    // [속삭임 민트 허브] 3곳
    {
      id: 'forest_herb_1',
      itemId: 'whisper_mint_herb',
      itemName: '속삭임 민트 허브',
      icon: '🌿',
      type: 'herb',
      x: 8.5,
      z: 2.5,
      label: '동쪽 허브 초원'
    },
    {
      id: 'forest_herb_2',
      itemId: 'whisper_mint_herb',
      itemName: '속삭임 민트 허브',
      icon: '🌿',
      type: 'herb',
      x: 2.2,
      z: -3.0,
      label: '아치 나무다리 옆'
    },
    {
      id: 'forest_herb_3',
      itemId: 'whisper_mint_herb',
      itemName: '속삭임 민트 허브',
      icon: '🌿',
      type: 'herb',
      x: -3.5,
      z: 14.0,
      label: '북쪽 언덕 비밀 터'
    }
  ];

  const items = [];

  for (const spot of COLLECTIBLE_SPOTS) {
    const storageKey = `littleday_col_${spot.id}`;
    let isCollected = false;
    try {
      isCollected = typeof localStorage !== 'undefined' && localStorage.getItem(storageKey) === '1';
    } catch (e) {
      isCollected = false;
    }

    let modelObj;
    if (spot.type === 'mushroom') {
      modelObj = buildDewMushroomModel();
    } else {
      modelObj = buildWhisperMintHerbModel();
    }

    modelObj.root.position.set(spot.x, 0, spot.z);
    group.add(modelObj.root);

    if (isCollected) {
      modelObj.root.visible = false;
    }

    items.push({
      ...spot,
      storageKey,
      isCollected,
      modelObj,
      interactRadius: 1.8,
      shrinkProgress: 0,
      collect() {
        if (this.isCollected) return false;
        this.isCollected = true;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.storageKey, '1');
          }
        } catch (e) {}

        // 인벤토리 아이템 등록
        if (_invSystem && typeof _invSystem.addItem === 'function') {
          _invSystem.addItem(this.itemId);
        }

        // 토스트 알림 표시
        if (_questSystem && _questSystem.ui && typeof _questSystem.ui.showToast === 'function') {
          _questSystem.ui.showToast(
            `새로운 수집품 [${this.itemName}]을(를) 채취했습니다! 보관함(I)에 저장되었습니다. ${this.icon}`,
            this.icon,
            3200
          );
        }

        return true;
      }
    });
  }

  let time = 0;

  return {
    group,
    items,
    // 활성화된(채취 가능한) 수집품 목록
    getActiveItems() {
      return items.filter((it) => !it.isCollected);
    },
    setSystems(invSys, qSys) {
      _invSystem = invSys;
      _questSystem = qSys;
    },
    update(dt) {
      time += dt;
      for (const item of items) {
        // 이미 채취된 아이템의 소멸 애니메이션
        if (item.isCollected) {
          if (item.shrinkProgress < 1) {
            item.shrinkProgress = Math.min(1, item.shrinkProgress + dt * 4);
            const scale = Math.max(0, 1 - item.shrinkProgress);
            item.modelObj.root.scale.set(scale, scale, scale);
            if (item.shrinkProgress >= 1) {
              item.modelObj.root.visible = false;
            }
          }
          continue;
        }

        // 채취 전 부유/호흡 애니메이션
        const bob = Math.sin(time * 2.2 + item.x) * 0.05;
        if (item.type === 'mushroom') {
          if (item.modelObj.capGroup) {
            item.modelObj.capGroup.position.y = 0.38 + bob;
          }
        } else {
          if (item.modelObj.flowerHead) {
            item.modelObj.flowerHead.position.y = 0.52 + bob;
          }
        }

        // 오라 펄스
        if (item.modelObj.aura) {
          const auraScale = 1 + Math.sin(time * 3 + item.z) * 0.12;
          item.modelObj.aura.scale.set(auraScale, auraScale, auraScale);
        }
      }
    }
  };
}
