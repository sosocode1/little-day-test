import * as THREE from 'three';
import {
  VILLAGE_COLLECTIBLE_SPAWNS,
  getCollectibleDefinition
} from '../data/collectibles.js';

// 공유 클레이 재질 캐시
const materials = new Map();
const mat = (color, roughness = 1) => {
  if (!materials.has(color)) {
    materials.set(color, new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }));
  }
  return materials.get(color);
};

const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
const sparkleGeo = new THREE.OctahedronGeometry(0.065, 0);
const cylGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 8);

function ball(material, radius, scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(sphereGeo, material);
  m.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// 수집 가능한 분홍색 꽃 클레이 3D 모델
function buildPinkFlowerModel() {
  const group = new THREE.Group();
  const PINK = 0xff8fad;      // 화사하고 선명한 분홍 꽃잎
  const CENTER = 0xffdf70;    // 노란 꽃술
  const GREEN = 0x8ecc82;     // 줄기와 잎사귀

  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xffeef5,
    transparent: true,
    opacity: 0.34
  });

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

  // 은은한 반짝임 오라
  const aura = ball(auraMat, 0.38, [1, 1, 1], [0, 0.04, 0]);
  head.add(aura);

  // 주변을 감도는 작은 반짝임 별 2개
  const ambientSparkles = [];
  for (let i = 0; i < 2; i++) {
    const spMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0xfff5b8 : 0xffd1e2,
      transparent: true,
      opacity: 0.85
    });
    const sp = new THREE.Mesh(sparkleGeo, spMat);
    sp.scale.setScalar(0.65);
    head.add(sp);
    ambientSparkles.push(sp);
  }

  group.add(head);

  group.traverse((o) => {
    if (o.isMesh && o !== aura && !ambientSparkles.includes(o)) {
      o.castShadow = true;
    }
  });

  return { root: group, head, aura, ambientSparkles };
}

// 아이템 타입별 3D 모델 빌더 레지스트리 (추후 조개/편지/열쇠/단서 추가 시 여기에 등록)
export const COLLECTIBLE_MODEL_BUILDERS = {
  pink_flower: buildPinkFlowerModel
};

// 범용 월드 수집품 매니저 (확장 가능한 구조)
export function createCollectibleManager(scene, spawns = VILLAGE_COLLECTIBLE_SPAWNS, customBuilders = {}) {
  const builders = { ...COLLECTIBLE_MODEL_BUILDERS, ...customBuilders };
  const items = [];
  const sparkleBursts = [];
  const collectedIdSet = new Set();

  const rootGroup = new THREE.Group();
  rootGroup.name = 'collectible_flowers';
  scene.add(rootGroup);

  // 수집 시 가벼운 클레이 반짝임 파티클 버스트 생성
  function spawnCollectSparkles(origin, colors = [0xff9eb8, 0xffe484, 0xffffff]) {
    const burstGroup = new THREE.Group();
    burstGroup.position.set(origin.x, (origin.y || 0) + 0.55, origin.z);

    const particles = [];
    const COUNT = 12;
    for (let i = 0; i < COUNT; i++) {
      const color = colors[i % colors.length];
      const pMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(i % 2 === 0 ? sparkleGeo : sphereGeo, pMat);
      const baseScale = i % 2 === 0 ? 1.15 : 0.055;
      mesh.scale.setScalar(baseScale);

      const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 0.9 + Math.random() * 1.1;
      const vy = 1.6 + Math.random() * 1.4;

      burstGroup.add(mesh);
      particles.push({
        mesh,
        material: pMat,
        baseScale,
        vx: Math.cos(angle) * speed,
        vy,
        vz: Math.sin(angle) * speed,
        spin: (Math.random() - 0.5) * 10
      });
    }

    rootGroup.add(burstGroup);
    sparkleBursts.push({
      group: burstGroup,
      particles,
      age: 0,
      duration: 0.65
    });
  }

  spawns.forEach((spot, idx) => {
    const def = getCollectibleDefinition(spot.type);
    const builder = builders[spot.type] || buildPinkFlowerModel;
    const model = builder(spot, def);
    model.root.position.set(spot.x, 0, spot.z);
    model.root.name = `collectible-${spot.id}`;
    rootGroup.add(model.root);

    const item = {
      id: spot.id,
      type: spot.type || def.type,
      category: def.category,
      name: spot.name || def.name,
      icon: spot.icon || def.icon,
      prompt: spot.prompt || def.prompt || '수집하기',
      questId: spot.questId || def.questId || null,
      index: idx + 1,
      label: spot.label || def.name,
      position: model.root.position,
      interactRadius: spot.interactRadius ?? def.interactRadius ?? 2.1,
      isCollected: false,
      model,
      collectProgress: 0, // 0: 정상, 1: 수집 애니메이션 완료 및 월드에서 제거
      collect() {
        if (this.isCollected || collectedIdSet.has(this.id)) return false;
        this.isCollected = true;
        collectedIdSet.add(this.id);
        spawnCollectSparkles(this.position, def.sparkleColors);
        return true;
      }
    };
    items.push(item);
  });

  let time = 0;

  return {
    flowers: items,
    items,
    group: rootGroup,
    setVisible(visible) {
      rootGroup.visible = Boolean(visible);
    },
    // 아직 수집되지 않은 활성 아이템 반환
    getActiveItems() {
      return items.filter((item) => !item.isCollected);
    },
    // 기존 호출부 호환용 별칭
    getActiveFlowers() {
      return items.filter((item) => !item.isCollected);
    },
    getCollectedIds() {
      return Array.from(collectedIdSet);
    },
    isCollected(itemId) {
      return collectedIdSet.has(itemId);
    },
    // 세이브 복원 시 이미 수집된 아이템 동기화 (재생성 및 중복 수집 완벽 방지)
    syncCollected(collectedIds) {
      if (!collectedIds) return;
      const set = new Set(Array.isArray(collectedIds) ? collectedIds : Array.from(collectedIds));
      for (const item of items) {
        if (set.has(item.id)) {
          item.isCollected = true;
          item.collectProgress = 1;
          collectedIdSet.add(item.id);
          if (item.model && item.model.root && item.model.root.parent) {
            item.model.root.parent.remove(item.model.root);
          }
        }
      }
    },
    update(dt) {
      time += dt;

      // 1. 월드 수집 아이템 대기/수집 애니메이션 갱신
      for (const item of items) {
        if (item.collectProgress >= 1) continue;

        if (item.isCollected) {
          item.collectProgress = Math.min(1, item.collectProgress + dt * 3.2);
          const t = item.collectProgress;
          // 살짝 커졌다가(pop) 회전하며 부드럽게 상승 소멸
          const scale = t < 0.2 ? 1 + t * 1.1 : Math.max(0, 1.22 * (1 - (t - 0.2) / 0.8));
          item.model.root.scale.setScalar(scale);
          item.model.root.rotation.y += dt * 12;
          item.model.root.position.y += dt * 1.85;

          if (item.collectProgress >= 1 && item.model.root.parent) {
            item.model.root.parent.remove(item.model.root);
          }
          continue;
        }

        // 대기 시 부드러운 상하 부유 + 살랑 회전 + 반짝임 오라
        const bob = Math.sin(time * 2.8 + item.index * 1.3) * 0.07;
        item.model.root.position.y = bob;
        if (item.model.head) {
          item.model.head.rotation.y = time * 1.35;
        }
        if (item.model.aura) {
          item.model.aura.scale.setScalar(1 + Math.sin(time * 3.8 + item.index) * 0.14);
        }
        if (Array.isArray(item.model.ambientSparkles)) {
          item.model.ambientSparkles.forEach((sp, i) => {
            const orbit = time * 2.2 + item.index + i * Math.PI;
            sp.position.set(
              Math.cos(orbit) * 0.34,
              0.12 + Math.sin(time * 3.5 + i) * 0.08,
              Math.sin(orbit) * 0.34
            );
            sp.rotation.y = time * 3;
            sp.rotation.x = time * 2;
          });
        }
      }

      // 2. 수집 반짝임 파티클 버스트 갱신 및 자동 정리
      for (let i = sparkleBursts.length - 1; i >= 0; i--) {
        const burst = sparkleBursts[i];
        burst.age += dt;
        const progress = Math.min(1, burst.age / burst.duration);

        for (const p of burst.particles) {
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.vy -= 3.6 * dt; // 부드러운 중력
          p.mesh.rotation.y += p.spin * dt;
          p.mesh.rotation.z += p.spin * 0.7 * dt;
          const shrink = Math.max(0.01, 1 - progress);
          p.mesh.scale.setScalar(p.baseScale * shrink);
          p.material.opacity = Math.max(0, 1 - progress * progress);
        }

        if (progress >= 1) {
          if (burst.group.parent) {
            burst.group.parent.remove(burst.group);
          }
          for (const p of burst.particles) {
            p.material.dispose();
          }
          sparkleBursts.splice(i, 1);
        }
      }
    }
  };
}

// 기존 main.js와 100% 호환되는 마을 꽃 매니저 팩토리
export function createFlowerManager(scene) {
  return createCollectibleManager(scene, VILLAGE_COLLECTIBLE_SPAWNS);
}
