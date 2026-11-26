import * as THREE from 'three';
import { NPC_DATA } from '../data/dialogue.js';

// 공유 클레이 재질 캐시
const materials = new Map();
const mat = (color) => {
  if (!materials.has(color)) {
    materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 }));
  }
  return materials.get(color);
};
const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sphereGeo = new THREE.SphereGeometry(1, 20, 14);

function ball(material, radius, scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(sphereGeo, material);
  m.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// ----------------- 토끼 주민 -----------------
function buildRabbitModel() {
  const group = new THREE.Group();
  const WHITE = 0xfffcf7;
  const PINK = 0xffc2d4;
  const DARK = 0x3a2520;
  const CLOTH = 0xbfe3d0; // 파스텔 민트 원피스

  // 몸통 (통통한 달걀형)
  const body = ball(mat(CLOTH), 0.28, [1, 1.15, 0.9], [0, 0.55, 0]);
  group.add(body);

  // 꼬리 (동글동글한 흰 꼬리)
  const tail = ball(mat(WHITE), 0.09, [1, 1, 1], [0, 0.42, -0.28]);
  group.add(tail);

  // 머리
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.1, 0);
  const head = ball(mat(WHITE), 0.28, [1.12, 0.98, 1.05]);
  headGroup.add(head);

  // 긴 토끼 귀 2개
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.12, 0.24, -0.02);
    const outer = ball(mat(WHITE), 0.08, [0.8, 2.4, 0.6], [0, 0.15, 0], [0, 0, s * -0.15]);
    const inner = ball(mat(PINK), 0.055, [0.7, 2.1, 0.5], [0, 0.15, 0.02], [0, 0, s * -0.15]);
    ear.add(outer, inner);
    headGroup.add(ear);
    ears.push(ear);
  }

  // 얼굴: 큰 눈, 하이라이트, 작은 코, 입, 볼터치
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.11, -0.02, 0.25);
    eye.add(
      ball(mat(DARK), 0.038, [1, 1.15, 0.4]),
      ball(shineMat, 0.012, [1, 1, 0.4], [s * -0.01, 0.012, 0.025])
    );
    headGroup.add(eye);
    headGroup.add(ball(mat(0xffa8b8), 0.045, [1, 0.6, 0.4], [s * 0.16, -0.07, 0.22])); // 볼터치
  }
  headGroup.add(ball(mat(PINK), 0.02, [1, 0.8, 0.9], [0, -0.055, 0.28])); // 분홍 코
  group.add(headGroup);

  // 팔과 발
  for (const s of [-1, 1]) {
    const arm = ball(mat(WHITE), 0.065, [1, 1.4, 1], [s * 0.24, 0.65, 0.05], [0.2, 0, s * 0.1]);
    const foot = ball(mat(WHITE), 0.085, [1, 0.6, 1.3], [s * 0.11, 0.1, 0.08]);
    group.add(arm, foot);
  }

  group.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });

  return { root: group, headGroup, ears, tail, body };
}

// ----------------- 여우 주민 -----------------
function buildFoxModel() {
  const group = new THREE.Group();
  const ORANGE = 0xee8f5a; // 부드러운 오렌지
  const CREAM = 0xfffcf7;
  const DARK = 0x3a2018;
  const CLOTH = 0xffdfba; // 파스텔 옐로우 조끼

  // 몸통
  const body = ball(mat(CLOTH), 0.28, [1, 1.15, 0.9], [0, 0.55, 0]);
  const chest = ball(mat(CREAM), 0.18, [0.8, 1.1, 0.6], [0, 0.58, 0.2]);
  group.add(body, chest);

  // 풍성한 여우 꼬리 (끝이 하얀색)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.45, -0.25);
  const tailMain = ball(mat(ORANGE), 0.13, [1, 1.8, 1], [0, 0.12, -0.15], [-0.6, 0, 0]);
  const tailTip = ball(mat(CREAM), 0.08, [1, 1.2, 1], [0, 0.28, -0.28], [-0.6, 0, 0]);
  tailGroup.add(tailMain, tailTip);
  group.add(tailGroup);

  // 머리
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.1, 0);
  const head = ball(mat(ORANGE), 0.28, [1.15, 0.96, 1.05]);
  const muzzle = ball(mat(CREAM), 0.13, [1.1, 0.8, 1.2], [0, -0.06, 0.22]);
  headGroup.add(head, muzzle);

  // 쫑긋한 삼각형 여우 귀 2개
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.16, 0.22, 0);
    const outer = ball(mat(ORANGE), 0.09, [0.9, 1.4, 0.6], [0, 0.08, 0], [0, 0, s * -0.3]);
    const inner = ball(mat(CREAM), 0.06, [0.8, 1.2, 0.4], [0, 0.07, 0.03], [0, 0, s * -0.3]);
    const tip = ball(mat(DARK), 0.035, [1, 1, 0.6], [s * 0.03, 0.18, 0], [0, 0, s * -0.3]);
    ear.add(outer, inner, tip);
    headGroup.add(ear);
    ears.push(ear);
  }

  // 눈, 코, 볼터치
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.115, -0.015, 0.26);
    eye.add(
      ball(mat(DARK), 0.038, [1, 1.1, 0.4]),
      ball(shineMat, 0.012, [1, 1, 0.4], [s * -0.01, 0.012, 0.025])
    );
    headGroup.add(eye);
    headGroup.add(ball(mat(0xffa080), 0.045, [1, 0.6, 0.4], [s * 0.17, -0.07, 0.21])); // 볼터치
  }
  headGroup.add(ball(mat(DARK), 0.025, [1.2, 0.8, 0.9], [0, -0.07, 0.33])); // 까만 코
  group.add(headGroup);

  // 팔과 발
  for (const s of [-1, 1]) {
    const arm = ball(mat(ORANGE), 0.065, [1, 1.4, 1], [s * 0.24, 0.65, 0.05], [0.2, 0, s * 0.1]);
    const foot = ball(mat(DARK), 0.08, [1, 0.6, 1.3], [s * 0.11, 0.1, 0.08]);
    group.add(arm, foot);
  }

  group.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });

  return { root: group, headGroup, ears, tail: tailGroup, body };
}

// 기존 동물 NPC 모델 빌더 레지스트리 (추후 동물 NPC 추가 시 확장 가능)
const NPC_BUILDERS = {
  rabbit: {
    build: buildRabbitModel,
    interactRadius: 2.8,
    overheadRadius: 5.5,
    headHeight: 1.85,
    animate(model, time) {
      const breathe = Math.sin(time * 2.2) * 0.02;
      model.body.scale.y = 1.15 + breathe;
      // 토끼: 귀 쫑긋 쫑긋
      model.ears[0].rotation.z = -0.15 + Math.sin(time * 3) * 0.06;
      model.ears[1].rotation.z = 0.15 - Math.sin(time * 3 + 0.5) * 0.06;
    }
  },
  fox: {
    build: buildFoxModel,
    interactRadius: 2.8,
    overheadRadius: 5.5,
    headHeight: 1.78,
    animate(model, time) {
      const breathe = Math.sin(time * 2.2) * 0.02;
      model.body.scale.y = 1.15 + breathe;
      // 여우: 꼬리 살랑살랑
      model.tail.rotation.y = Math.sin(time * 2.5) * 0.25;
      model.tail.rotation.z = Math.cos(time * 2.5) * 0.15;
    }
  }
};

// 동물 NPC 객체 생성 팩토리 (기존 외형·애니메이션·충돌 100% 유지)
export function createNPC(type, x, z, initialRotY = 0, overrides = {}) {
  const builderSpec = NPC_BUILDERS[type] || NPC_BUILDERS.fox;
  const model = builderSpec.build();
  const baseData = NPC_DATA[type] || NPC_DATA.fox;
  const data = { ...baseData, ...(overrides.data || {}) };

  model.root.position.set(x, 0, z);
  model.root.rotation.y = initialRotY;
  model.root.name = `npc-${overrides.id || type}`;

  let time = Math.random() * 10;
  let currentRotY = initialRotY;
  let joyTimer = 0;

  return {
    id: overrides.id || data.id || type,
    type,
    data,
    root: model.root,
    position: model.root.position,
    collider: { type: 'circle', x, z, r: overrides.colliderRadius ?? 0.55 },
    interactRadius: overrides.interactRadius ?? builderSpec.interactRadius ?? 2.8,
    overheadRadius: overrides.overheadRadius ?? builderSpec.overheadRadius ?? 5.5,
    headHeight: overrides.headHeight ?? builderSpec.headHeight ?? 1.8,
    talkable: data.talkable !== false,

    // 아이템 전달 등 기쁜 순간의 짧은 점프/반응 애니메이션 (기존 3D 모델 유지)
    playJoyReaction(duration = 2.2) {
      joyTimer = Math.max(joyTimer, duration);
    },

    // 플레이어를 바라보는 회전 및 아이들 애니메이션
    update(dt, playerPos = null, isTalking = false) {
      time += dt;

      builderSpec.animate(model, time, isTalking);

      if (joyTimer > 0) {
        joyTimer = Math.max(0, joyTimer - dt);
        const hop = Math.abs(Math.sin(time * 9.5)) * 0.22 * Math.min(1, joyTimer * 1.4);
        model.root.position.y = hop;
        if (model.tail) {
          model.tail.rotation.y = Math.sin(time * 12) * 0.52;
        }
      } else if (model.root.position.y !== 0) {
        model.root.position.y = 0;
      }

      // 대화 중이거나 플레이어가 근접하면 플레이어 쪽으로 몸을 살짝 회전
      if (playerPos) {
        const dx = playerPos.x - model.root.position.x;
        const dz = playerPos.z - model.root.position.z;
        const dist = Math.hypot(dx, dz);

        if (isTalking || dist < 3.0) {
          const targetRotY = Math.atan2(dx, dz);
          let diff = targetRotY - currentRotY;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          currentRotY += diff * (1 - Math.exp(-8 * dt));
          model.root.rotation.y = currentRotY;
          return;
        }
      }

      // 원래 각도로 서서히 복귀
      let diff = initialRotY - currentRotY;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      currentRotY += diff * (1 - Math.exp(-4 * dt));
      model.root.rotation.y = currentRotY;
    }
  };
}
