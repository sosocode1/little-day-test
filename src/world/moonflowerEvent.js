// LITTLE DAY 밤 22:00 전용 미스터리 이벤트: 사라진 달빛 꽃 (The Lost Moonflower)
import * as THREE from 'three';
import { ITEMS } from '../data/items.js';

export function createMoonflowerEvent(scene, timeSystem, questSystem, inventorySystem) {
  const STORAGE_KEY = 'littleday_event_moonflower_done';
  const EVENT_POS = new THREE.Vector3(2.4, 0, -20.2); // 북쪽 산책로 끝 벚나무 아래 호젓한 명당

  let isCompleted = false;
  try {
    isCompleted = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    isCompleted = false;
  }

  // 1. 이벤트 3D 오브젝트 루트 그룹 생성
  const root = new THREE.Group();
  root.name = 'moonflower_event_group';
  root.position.copy(EVENT_POS);

  // 2. 신비로운 달빛 꽃 3D 모델 제작 (클레이 토이 스타일)
  const flowerGroup = new THREE.Group();
  flowerGroup.name = 'moonflower_model';

  // (1) 줄기 & 신비로운 푸른 잎사귀
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x47698a, roughness: 1 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.65, 8), stemMat);
  stem.position.y = 0.32;
  flowerGroup.add(stem);

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x6692c2,
    emissive: 0x244266,
    emissiveIntensity: 0.5,
    roughness: 1
  });
  for (const s of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), leafMat);
    leaf.scale.set(1.4, 0.3, 0.7);
    leaf.position.set(s * 0.12, 0.3, 0);
    leaf.rotation.z = s * -0.4;
    flowerGroup.add(leaf);
  }

  // (2) 꽃 머리 (6장의 영롱한 달빛 푸른 꽃잎 + 은백색 발광 꽃술)
  const head = new THREE.Group();
  head.position.y = 0.68;

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0x8ab8ff,
    emissive: 0x457adb,
    emissiveIntensity: 0.9,
    roughness: 0.9
  });

  const PETAL_COUNT = 6;
  for (let i = 0; i < PETAL_COUNT; i++) {
    const angle = (i / PETAL_COUNT) * Math.PI * 2;
    const px = Math.cos(angle) * 0.18;
    const pz = Math.sin(angle) * 0.18;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), petalMat);
    petal.scale.set(1.0, 0.45, 1.45);
    petal.position.set(px, 0, pz);
    petal.rotation.set(-0.25, angle + Math.PI / 2, 0);
    head.add(petal);
  }

  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xf4f7ff,
    emissive: 0xdde6ff,
    emissiveIntensity: 1.2,
    roughness: 0.8
  });
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), centerMat);
  center.position.y = 0.05;
  head.add(center);

  // (3) 신비로운 푸른빛 오라 구체
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x7ab6ff,
    transparent: true,
    opacity: 0.38,
    side: THREE.BackSide
  });
  const aura = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 12), auraMat);
  aura.position.y = 0.05;
  head.add(aura);

  // (4) 주변을 은은하게 비추는 달빛 포인트 라이트
  const pointLight = new THREE.PointLight(0x6ea8ff, 1.4, 6.5, 1.2);
  pointLight.position.set(0, 0.7, 0);
  flowerGroup.add(pointLight);

  flowerGroup.add(head);
  root.add(flowerGroup);

  // 3. 달빛 꽃 주변을 맴도는 전용 반딧불이 (6개)
  const FIREFLY_COUNT = 6;
  const fireflies = [];
  const fireflyGeo = new THREE.SphereGeometry(0.042, 8, 6);

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const fMat = new THREE.MeshBasicMaterial({
      color: 0x9ed0ff, // 영롱한 연보라빛 하늘색
      transparent: true,
      opacity: 0.9
    });
    const fMesh = new THREE.Mesh(fireflyGeo, fMat);
    root.add(fMesh);

    fireflies.push({
      mesh: fMesh,
      mat: fMat,
      baseRadius: 0.55 + (i * 0.12),
      speed: 1.0 + (i * 0.18),
      phase: (i / FIREFLY_COUNT) * Math.PI * 2,
      heightOffset: 0.35 + (i * 0.12)
    });
  }

  // 초기 상태는 보이지 않음
  root.visible = false;
  scene.add(root);

  let animTime = 0;
  let isCollecting = false;
  let collectProgress = 0;

  function isNightTime() {
    const time = timeSystem.getTime() % 24.0;
    // 밤 22:00 ~ 새벽 04:59 시간대 판정
    return (time >= 22.0 || time < 5.0);
  }

  return {
    root,

    // 상호작용 가능 여부 판정 (밤 22:00 이후 + 미완료 + 야외)
    isAvailable() {
      return !isCompleted && !isCollecting && isNightTime();
    },

    getPosition() {
      return EVENT_POS;
    },

    getInteractRadius() {
      return 1.8;
    },

    isCompleted() {
      return isCompleted;
    },

    // 달빛 꽃 수집 실행
    collect() {
      if (!this.isAvailable()) return false;

      isCollecting = true;
      collectProgress = 0;
      isCompleted = true;

      // 1. 이벤트 완료 상태 기록 (중복 획득 완벽 방지)
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, '1');
        }
      } catch (e) {
        // 로컬스토리지 예외 대비
      }

      // 2. 인벤토리에 새로운 달빛 꽃 아이템 등록
      if (inventorySystem) {
        inventorySystem.addItem(ITEMS.moonflower);
      }

      // 3. 획득 피드백 연출 (토스트 및 보상 모달)
      if (questSystem && questSystem.ui) {
        questSystem.ui.showToast('신비로운 달빛 꽃을 발견하여 획득했습니다! 🪻✨', '🪻', 3500);
        questSystem.ui.showRewardModal(ITEMS.moonflower);
      }

      return true;
    },

    isCompleted() {
      return isCompleted;
    },

    setCompleted(val = true) {
      isCompleted = Boolean(val);
      if (isCompleted) {
        root.visible = false;
      }
    },

    // 개발/테스트용 이벤트 리셋 메서드
    resetEvent() {
      isCompleted = false;
      isCollecting = false;
      collectProgress = 0;
      flowerGroup.scale.set(1, 1, 1);
      head.position.y = 0.68;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {}
      if (inventorySystem) {
        inventorySystem.removeItem('moonflower');
      }
    },

    // 매 프레임 애니메이션 및 상태 갱신
    update(dt, isIndoor = false) {
      animTime += dt;

      // 이미 수집 완료되었거나 실내인 경우 완전히 숨김
      if (isCompleted && !isCollecting) {
        root.visible = false;
        return;
      }
      if (isIndoor) {
        root.visible = false;
        return;
      }

      // 밤 22:00 이후인지 검사
      const nightActive = isNightTime();

      if (!nightActive && !isCollecting) {
        // 낮이나 22:00 이전에는 오브젝트가 나타나지 않음
        root.visible = false;
        return;
      }

      // 22:00 이후 밤이 되면 신비로운 푸른빛과 함께 표시
      root.visible = true;

      // 수집 중 소멸 애니메이션 (꽃이 살짝 떠오르며 영롱하게 축소)
      if (isCollecting) {
        collectProgress += dt * 1.8;
        head.position.y += dt * 0.8;
        const s = Math.max(0, 1.0 - collectProgress);
        flowerGroup.scale.setScalar(s);
        pointLight.intensity = 1.4 * s;

        for (const f of fireflies) {
          f.mat.opacity = 0.9 * s;
        }

        if (collectProgress >= 1.0) {
          isCollecting = false;
          root.visible = false;
        }
        return;
      }

      // 1. 달빛 꽃 살랑살랑 호흡 애니메이션
      head.rotation.z = Math.sin(animTime * 1.4) * 0.08;
      head.rotation.x = Math.cos(animTime * 1.1) * 0.06;
      aura.scale.setScalar(1.0 + Math.sin(animTime * 2.2) * 0.12);

      // 2. 달빛 반딧불이 나선 궤도 부유 애니메이션
      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        const t = animTime * f.speed + f.phase;
        const r = f.baseRadius + Math.sin(animTime * 1.8 + i) * 0.2;

        f.mesh.position.x = Math.cos(t) * r;
        f.mesh.position.z = Math.sin(t) * r;
        f.mesh.position.y = f.heightOffset + Math.sin(animTime * 2.5 + i * 2) * 0.22;

        // 은은한 깜빡임
        const blink = Math.sin(animTime * 3.5 + i * 3) * 0.4 + 0.6;
        f.mat.opacity = blink;
      }
    }
  };
}
