import * as THREE from 'three';

// 공유 클레이 재질
const materials = new Map();
const mat = (color, roughness = 1) => {
  if (!materials.has(color)) {
    materials.set(color, new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }));
  }
  return materials.get(color);
};
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xffeef5,
  transparent: true,
  opacity: 0.35,
});

const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
const cylGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 8);

function ball(material, radius, scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(sphereGeo, material);
  m.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// 수집 가능한 단일 분홍색 꽃 3D 모델
function buildFlowerModel() {
  const group = new THREE.Group();
  const PINK = 0xff8fad;      // 화사하고 선명한 분홍 꽃잎
  const CENTER = 0xffdf70;    // 노란 꽃술
  const GREEN = 0x8ecc82;     // 줄기와 잎사귀

  // 줄기
  const stem = new THREE.Mesh(cylGeo, mat(GREEN));
  stem.position.y = 0.3;
  group.add(stem);

  // 잎사귀 2장
  for (const s of [-1, 1]) {
    const leaf = ball(mat(GREEN), 0.12, [1.4, 0.3, 0.7], [s * 0.12, 0.28, 0], [0, 0, s * -0.4]);
    group.add(leaf);
  }

  // 꽃 머리 그룹 (살랑살랑 흔들림)
  const head = new THREE.Group();
  head.position.y = 0.65;

  // 5장의 분홍 꽃잎
  const PETAL_COUNT = 5;
  for (let i = 0; i < PETAL_COUNT; i++) {
    const angle = (i / PETAL_COUNT) * Math.PI * 2;
    const px = Math.cos(angle) * 0.16;
    const pz = Math.sin(angle) * 0.16;
    const petal = ball(
      mat(PINK),
      0.14,
      [1, 0.5, 1.4],
      [px, 0, pz],
      [-0.2, angle + Math.PI / 2, 0]
    );
    head.add(petal);
  }

  // 중앙 노란 꽃술
  const center = ball(mat(CENTER), 0.12, [1, 0.8, 1], [0, 0.04, 0]);
  head.add(center);

  // 은은한 반짝임 구체
  const aura = ball(glowMat, 0.38, [1, 1, 1], [0, 0.04, 0]);
  head.add(aura);

  group.add(head);

  group.traverse((o) => {
    if (o.isMesh && o !== aura) o.castShadow = true;
  });

  return { root: group, head, aura };
}

// 꽃 배치 및 매니저
export function createFlowerManager(scene) {
  // 꽃 3개 배치 좌표 (마을 입구 꽃밭, 별장 앞마당 정원, 북쪽 산책로 벚꽃나무 부근)
  const FLOWER_SPOTS = [
    { id: 'flower_1', x: -4.5, z: 9.0, label: '마을 입구 꽃밭' },
    { id: 'flower_2', x: -12.5, z: -3.8, label: '별장 정원 꽃밭' },
    { id: 'flower_3', x: 2.5, z: -13.0, label: '북쪽 산책로 벚꽃나무 옆' }
  ];

  const flowers = [];
  const flowersGroup = new THREE.Group();
  flowersGroup.name = 'collectible_flowers';
  scene.add(flowersGroup);

  FLOWER_SPOTS.forEach((spot, idx) => {
    const model = buildFlowerModel();
    model.root.position.set(spot.x, 0, spot.z);
    flowersGroup.add(model.root);

    flowers.push({
      id: spot.id,
      index: idx + 1,
      label: spot.label,
      position: model.root.position,
      interactRadius: 1.8,
      isCollected: false,
      model,
      collectProgress: 0, // 수집 시 축소 애니메이션 (0: 정상, 1: 소멸)
      // 수집 실행
      collect() {
        if (this.isCollected) return false;
        this.isCollected = true;
        return true;
      }
    });
  });

  let time = 0;

  return {
    flowers,
    // 아직 수집되지 않은 꽃들 반환
    getActiveFlowers() {
      return flowers.filter((f) => !f.isCollected || f.collectProgress < 1);
    },
    // 세이브 복원 시 이미 수집된 꽃 동기화 (재생성 및 중복 수집 방지)
    syncCollected(collectedFlowerIds) {
      if (!collectedFlowerIds) return;
      const set = new Set(Array.isArray(collectedFlowerIds) ? collectedFlowerIds : Array.from(collectedFlowerIds));
      for (const flower of flowers) {
        if (set.has(flower.id)) {
          flower.isCollected = true;
          flower.collectProgress = 1;
          if (flower.model && flower.model.root && flower.model.root.parent) {
            flower.model.root.parent.remove(flower.model.root);
          }
        }
      }
    },
    update(dt) {
      time += dt;

      for (const flower of flowers) {
        if (flower.collectProgress >= 1) continue;

        // 수집 중인 꽃은 회전하며 작아져서 소멸
        if (flower.isCollected) {
          flower.collectProgress += dt * 3.5;
          const s = Math.max(0, 1 - flower.collectProgress);
          flower.model.root.scale.setScalar(s);
          flower.model.root.rotation.y += dt * 10;
          flower.model.root.position.y += dt * 1.5;

          if (flower.collectProgress >= 1) {
            flowersGroup.remove(flower.model.root);
          }
          continue;
        }

        // 대기 시 부드러운 상하 부유 및 살랑살랑 회전
        const bob = Math.sin(time * 3 + flower.index) * 0.08;
        flower.model.root.position.y = bob;
        flower.model.head.rotation.y = time * 1.5;
        flower.model.aura.scale.setScalar(1 + Math.sin(time * 4 + flower.index) * 0.15);
      }
    }
  };
}
