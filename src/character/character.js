import * as THREE from 'three';

// LITTLE DAY 플레이어 캐릭터 (클레이 토이 스타일, 약 3등신).
// 기준 키 약 1.5 (머리 약 1/3). 여자/남자는 같은 베이스 체형을 쓰고
// hair / outfit / 색상 프리셋만 다르다. 각 부위는 이름 있는 그룹이라 교체·커스터마이징이 가능하다.
//
// 디자인 메모 (참고 이미지에서 취한 원칙, 특정 캐릭터를 따라 하지 않음):
//  - 크고 둥근 머리 + 통통한 볼, 낮고 넓게 자리한 큰 눈 (홍채 중심, 하이라이트 2개)
//  - 작은 코/입, 은은한 볼터치
//  - 한 덩어리로 흐르는 헤어 매스 + 앞머리/옆머리 가닥 + 포인트 장식
//  - 좁은 어깨, 퍼프 소매, A라인 치마, 짧고 통통한 팔다리, 양말과 두툼한 신발
export const CHARACTER_PRESETS = {
  female: {
    skin: 0xffe2cc,
    hair: 0xa8744f,
    hairAccent: 0xc08a60,
    hairStyle: 'bobBuns',
    outfit: 'dress',
    top: 0xffd9d3, // 원피스 상의/소매
    bottom: 0xffe9e2, // 치마
    trim: 0xfffaf2,
    accent: 0xbfe3d0, // 민트 리본
    shoes: 0xf2b5c3,
    lashes: true,
  },
  male: {
    skin: 0xffe2cc,
    hair: 0x8a6342,
    hairAccent: 0x9c7450,
    hairStyle: 'tufty',
    outfit: 'pants',
    top: 0xa9d3ff, // 재킷
    bottom: 0x6f7fb0, // 바지
    trim: 0xfffaf2,
    accent: 0xa9d3ff,
    shoes: 0xfdfdfd,
    lashes: false,
  },
};

// ---------- 공유 자원 ----------
// 재질: 무광 클레이 (roughness 1, metalness 0). 같은 색은 하나만 만든다.
const materials = new Map();
const mat = (color) => {
  if (!materials.has(color)) {
    materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 }));
  }
  return materials.get(color);
};
const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

// 지오메트리는 구 1개, 토러스 몇 개, 치마 라텍스 1개를 모든 부위가 공유한다.
const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
const lashGeo = new THREE.TorusGeometry(1, 0.1, 5, 14, Math.PI * 0.85);
const smileGeo = new THREE.TorusGeometry(1, 0.2, 6, 14, Math.PI * 0.8);
const hemGeo = new THREE.TorusGeometry(1, 0.08, 8, 28);
const skirtGeo = new THREE.LatheGeometry(
  [
    [0.15, 0.02], [0.17, 0.0], [0.2, -0.06], [0.245, -0.135], [0.268, -0.2],
  ].map(([r, y]) => new THREE.Vector2(r, y)),
  28
);

// 타원체 헬퍼: 반지름 + 축 스케일 + 위치 + 회전
function ball(material, radius, scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(sphereGeo, material);
  m.scale.set(radius * scale[0], radius * scale[1], radius * scale[2]);
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

// ---------- 머리 ----------
// 머리 타원체 반지름 (x .29, y .26, z .27). 얼굴 요소는 이 표면 기준으로 배치.
function buildFace(preset) {
  const face = new THREE.Group();
  face.name = 'face';
  const skin = mat(preset.skin);

  face.add(ball(skin, 0.09, [1, 0.9, 0.9], [-0.17, -0.1, 0.12])); // 통통한 볼
  face.add(ball(skin, 0.09, [1, 0.9, 0.9], [0.17, -0.1, 0.12]));

  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.name = s < 0 ? 'eyeL' : 'eyeR';
    eye.position.set(s * 0.115, -0.045, 0);
    eye.add(
      ball(mat(0xfffaf5), 0.06, [1, 1.15, 0.5], [0, 0, 0.222]), // 흰자 (살짝만 보임)
      ball(mat(0x9a6038), 0.048, [1, 1.15, 0.4], [0, -0.003, 0.243]), // 홍채
      ball(mat(0x3a2018), 0.024, [1, 1.1, 0.4], [0, -0.004, 0.254]), // 동공
      ball(shineMat, 0.016, [1, 1, 0.4], [s * -0.016, 0.02, 0.262]), // 큰 하이라이트
      ball(shineMat, 0.008, [1, 1, 0.4], [s * 0.016, -0.02, 0.262]) // 작은 하이라이트
    );
    if (preset.lashes) {
      const lash = new THREE.Mesh(lashGeo, mat(0x5a3a2e)); // 눈매 라인
      lash.scale.setScalar(0.064);
      lash.position.set(0, -0.01, 0.236);
      lash.rotation.set(0, s * 0.4, s * -0.12);
      eye.add(lash);
    }
    face.add(eye);

    face.add(ball(mat(0xffa8a8), 0.045, [1, 0.7, 0.35], [s * 0.165, -0.105, 0.185])); // 볼터치
    face.add(ball(skin, 0.045, [0.6, 1, 1], [s * 0.285, -0.04, 0])); // 귀
  }

  face.add(ball(mat(0xf3b9a0), 0.016, [1, 0.9, 0.9], [0, -0.1, 0.255])); // 작은 코
  const mouth = new THREE.Mesh(smileGeo, mat(0xc7707a)); // 작은 미소
  mouth.scale.setScalar(0.025);
  mouth.rotation.z = Math.PI * 1.1;
  mouth.position.set(0, -0.15, 0.213);
  mouth.name = 'mouth';
  face.add(mouth);
  return face;
}

// 헤어: 이름 있는 그룹 하나라서 통째로 교체 가능.
function buildHair(preset) {
  const hair = new THREE.Group();
  hair.name = 'hair';
  const m = mat(preset.hair);
  const m2 = mat(preset.hairAccent);

  // 뒤/윗머리 매스: 약간 뒤로 밀어 이마와 얼굴 앞은 비운다
  hair.add(ball(m, 1, [0.31, 0.28, 0.29], [0, 0.03, -0.045]));

  if (preset.hairStyle === 'bobBuns') {
    hair.add(ball(m, 0.27, [1.0, 0.62, 0.8], [0, -0.1, -0.1])); // 단발 아랫부분
    // 앞머리: 부드럽게 겹치는 가닥들
    for (const [x, z, len] of [[-0.2, 0.15, 1.5], [-0.13, 0.2, 1.7], [-0.065, 0.225, 1.8], [0, 0.235, 1.8], [0.065, 0.225, 1.8], [0.13, 0.2, 1.7], [0.2, 0.15, 1.5]]) {
      hair.add(ball(m, 0.06, [1, len, 0.5], [x, 0.14, z], [0, 0, -x * 0.5]));
    }
    // 옆머리: 볼을 감싸며 흐르는 가닥
    for (const s of [-1, 1]) {
      hair.add(ball(m, 0.06, [0.9, 2.6, 0.9], [s * 0.245, -0.06, 0.1], [0, 0, s * 0.1]));
      hair.add(ball(m2, 0.105, [1, 1, 1], [s * 0.2, 0.27, -0.03])); // 양쪽 위 올림머리
      hair.add(ball(mat(preset.accent), 0.05, [1.8, 0.8, 0.6], [s * 0.2, 0.21, 0.05], [0, 0, s * 0.35])); // 민트 리본
    }
    // 노란 꽃 핀 (작은 포인트)
    const flower = new THREE.Group();
    flower.name = 'hairClip';
    flower.add(ball(mat(0xffe08a), 0.055, [1, 1, 0.45]), ball(mat(0xffffff), 0.022, [1, 1, 0.5], [0, 0, 0.022]));
    flower.position.set(0.14, 0.21, 0.235);
    flower.rotation.set(-0.5, 0.4, 0);
    hair.add(flower);
  } else {
    // tufty: 짧고 부드럽게 삐친 머리
    for (const [x, z, len, tilt] of [[-0.19, 0.16, 1.1, 0.5], [-0.1, 0.21, 1.3, 0.25], [0, 0.23, 1.2, -0.15], [0.1, 0.21, 1.3, -0.3], [0.19, 0.16, 1.1, -0.6]]) {
      hair.add(ball(m, 0.065, [1.1, len, 0.55], [x, 0.15, z], [0, 0, tilt]));
    }
    for (const s of [-1, 1]) {
      hair.add(ball(m, 0.06, [0.9, 1.7, 0.9], [s * 0.25, -0.01, 0.09], [0, 0, s * 0.15]));
    }
    hair.add(ball(m2, 0.065, [0.8, 1.5, 0.8], [-0.03, 0.31, 0.04], [0, 0, 0.5]));
    hair.add(ball(m2, 0.055, [0.8, 1.3, 0.8], [0.07, 0.3, 0.02], [0, 0, -0.55]));
  }
  return hair;
}

function buildHead(preset) {
  const head = new THREE.Group();
  head.name = 'head';
  head.add(ball(mat(preset.skin), 1, [0.29, 0.26, 0.27])); // 크고 둥근 머리
  head.add(buildFace(preset), buildHair(preset));
  return head;
}

// ---------- 몸 ----------
function buildTorso(preset) {
  const body = new THREE.Group();
  body.name = 'torso';

  const chest = ball(mat(preset.top), 0.2, [1, 1.15, 0.88], [0, 0.72, 0]); // 좁은 어깨의 작고 둥근 몸통
  body.add(chest);

  if (preset.outfit === 'dress') {
    const skirt = new THREE.Mesh(skirtGeo, new THREE.MeshStandardMaterial({ color: preset.bottom, roughness: 1, side: THREE.DoubleSide }));
    skirt.name = 'skirt';
    skirt.position.y = 0.56;
    const hem = new THREE.Mesh(hemGeo, mat(preset.trim)); // 프릴 단
    hem.scale.setScalar(0.268);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = 0.36;
    body.add(skirt, hem);
    body.add(ball(mat(preset.accent), 0.05, [1.6, 0.8, 0.5], [0, 0.89, 0.165])); // 목 리본
    body.add(ball(mat(preset.trim), 0.02, [1, 1, 1], [0, 0.89, 0.18]));
  } else {
    body.add(ball(mat(preset.bottom), 0.15, [1, 0.8, 0.85], [0, 0.47, 0])); // 골반
    body.add(ball(mat(preset.trim), 0.1, [1.2, 0.5, 0.5], [0, 0.88, 0.14])); // 셔츠 칼라
  }
  return { group: body, chest };
}

// 팔: 퍼프 소매 → 팔꿈치 그룹(팔뚝 + 손). 어깨 pivot과 elbow pivot으로 흔든다.
function buildArm(side, preset) {
  const pivot = new THREE.Group();
  pivot.name = `arm${side < 0 ? 'L' : 'R'}`;
  pivot.position.set(side * 0.19, 0.84, 0);
  pivot.rotation.z = side * 0.2;
  pivot.add(
    ball(mat(preset.top), 0.088, [1, 1, 1], [0, -0.035, 0]), // 퍼프 소매
    ball(mat(preset.trim), 0.062, [1, 0.45, 1], [0, -0.105, 0]) // 소매 단
  );

  const elbow = new THREE.Group();
  elbow.name = 'elbow';
  elbow.position.y = -0.1;
  const skin = mat(preset.skin);
  elbow.add(ball(skin, 0.043, [1, 1.45, 1], [0, -0.05, 0]), ball(skin, 0.05, [1, 1, 1], [0, -0.115, 0.005])); // 팔뚝 + 작은 손
  pivot.add(elbow);
  return { pivot, elbow };
}

// 다리: 허벅지 → 무릎 그룹(종아리 + 양말 + 신발)
function buildLeg(side, preset) {
  const pivot = new THREE.Group();
  pivot.name = `leg${side < 0 ? 'L' : 'R'}`;
  pivot.position.set(side * 0.085, 0.38, 0);
  const thigh = preset.outfit === 'dress' ? mat(preset.skin) : mat(preset.bottom);
  const shin = preset.outfit === 'dress' ? mat(preset.skin) : mat(preset.bottom);
  pivot.add(ball(thigh, 0.065, [1, 1.5, 1], [0, -0.065, 0]));

  const knee = new THREE.Group();
  knee.name = 'knee';
  knee.position.y = -0.13;
  knee.add(
    ball(shin, 0.06, [1, 1.5, 1], [0, -0.07, 0]),
    ball(mat(preset.trim), 0.066, [1.05, 0.85, 1.05], [0, -0.125, 0]), // 양말/바짓단
    ball(mat(preset.shoes), 0.085, [1, 0.75, 1.5], [0, -0.185, 0.04]), // 두툼한 신발
    ball(mat(preset.trim), 0.088, [1, 0.25, 1.5], [0, -0.225, 0.04]), // 흰 밑창
    ball(mat(preset.trim), 0.025, [1.3, 0.8, 0.8], [0, -0.14, 0.095]) // 리본 포인트
  );
  pivot.add(knee);
  return { pivot, knee };
}

export function createCharacter(type = 'female') {
  const preset = CHARACTER_PRESETS[type] ?? CHARACTER_PRESETS.female;
  const root = new THREE.Group();
  root.name = `character-${type}`;

  const body = new THREE.Group(); // 호흡/걸음 바운스용
  root.add(body);

  const torso = buildTorso(preset);
  const head = buildHead(preset);
  head.position.y = 1.22;

  // 장착 액세서리 전용 슬롯 그룹 (머리, 등, 의상 등 향후 확장 가능)
  const slots = {
    head: new THREE.Group(),
    back: new THREE.Group()
  };
  slots.head.name = 'slot_head';
  slots.back.name = 'slot_back';
  head.add(slots.head);
  torso.chest.add(slots.back);

  const L = buildArm(-1, preset);
  const R = buildArm(1, preset);
  const legL = buildLeg(-1, preset);
  const legR = buildLeg(1, preset);
  body.add(torso.group, head, L.pivot, R.pivot, legL.pivot, legR.pivot);

  // 큰 부위만 그림자를 만든다 (작은 장식 제외)
  root.traverse((o) => {
    if (o.isMesh) o.castShadow = Math.max(o.scale.x, o.scale.y, o.scale.z) > 0.09;
  });

  const chestBaseY = torso.chest.scale.y;
  let phase = 0;
  let walk = 0; // 0 = 대기, 1 = 걷기 (부드럽게 전환)
  let t = 0;
  const equippedSlots = { head: null, back: null, outfit: null, shoes: null };

  function clearSlot(slotGroup) {
    while (slotGroup.children.length > 0) {
      const child = slotGroup.children[0];
      slotGroup.remove(child);
      if (child.geometry && !child.geometry._isShared) {
        // 공유 지오메트리는 dispose하지 않음
      }
    }
  }

  // 3D 액세서리 메시 빌더
  function buildAccessoryMesh(item) {
    if (item.modelType === 'flower_pin' || item.id === 'pink_flower_pin') {
      const pin = new THREE.Group();
      pin.name = `accessory_${item.id}`;
      const petalColor = (item.colors && item.colors.petal) || 0xff6b8b;
      const centerColor = (item.colors && item.colors.center) || 0xffe070;
      const leafColor = (item.colors && item.colors.leaf) || 0x8ec89a;

      // 귀여운 5장 꽃잎
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        pin.add(ball(mat(petalColor), 0.038, [1, 1, 0.55], [Math.cos(a) * 0.034, Math.sin(a) * 0.034, 0]));
      }
      // 노란 꽃술 중심
      pin.add(ball(mat(centerColor), 0.024, [1, 1, 0.7], [0, 0, 0.016]));
      // 작은 녹색 잎사귀 포인트
      pin.add(ball(mat(leafColor), 0.022, [1.4, 0.8, 0.5], [0.038, -0.025, -0.008], [0, 0, -0.6]));

      // 앞머리 우측 자연스러운 위치 및 각도
      pin.position.set(-0.15, 0.22, 0.22);
      pin.rotation.set(-0.4, -0.4, 0.2);
      return pin;
    }
    return null;
  }

  return {
    root,
    parts: {
      body, torso: torso.group, head, hair: head.getObjectByName('hair'), face: head.getObjectByName('face'),
      armL: L.pivot, armR: R.pivot, legL: legL.pivot, legR: legR.pivot, slots
    },
    // 액세서리 장착 (슬롯별 확장 구조)
    equipAccessory(item) {
      if (!item) return false;
      const slotType = item.type || 'head';
      const slotGroup = slots[slotType];
      if (!slotGroup) return false;

      // 이전 아이템 정리
      clearSlot(slotGroup);
      const oldPin = head.getObjectByName('rewardFlowerPin');
      if (oldPin) head.remove(oldPin);

      // 새 액세서리 메시 부착
      const mesh = buildAccessoryMesh(item);
      if (mesh) {
        slotGroup.add(mesh);
        equippedSlots[slotType] = item.id;
        return true;
      }
      return false;
    },
    // 액세서리 착용 해제
    unequipAccessory(slotType = 'head') {
      const slotGroup = slots[slotType];
      if (slotGroup) {
        clearSlot(slotGroup);
      }
      const oldPin = head.getObjectByName('rewardFlowerPin');
      if (oldPin) head.remove(oldPin);
      equippedSlots[slotType] = null;
      return true;
    },
    // 현재 슬롯 장착 아이템 ID 반환
    getEquippedAccessory(slotType = 'head') {
      return equippedSlots[slotType] || null;
    },
    // 퀘스트 보상 레거시 호환 메서드
    equipFlowerPin() {
      return this.equipAccessory({
        id: 'pink_flower_pin',
        type: 'head',
        modelType: 'flower_pin',
        colors: { petal: 0xff6b8b, center: 0xffe070, leaf: 0x8ec89a }
      });
    },
    update(dt, moving) {
      t += dt;
      walk += ((moving ? 1 : 0) - walk) * (1 - Math.exp(-10 * dt));
      if (moving) phase += dt * 10;

      const swing = Math.sin(phase);
      const idle = Math.sin(t * 2);
      const pos = (v) => Math.max(0, v);

      legL.pivot.rotation.x = swing * 0.7 * walk;
      legR.pivot.rotation.x = -swing * 0.7 * walk;
      legL.knee.rotation.x = pos(swing) * 0.7 * walk; // 뒤로 들 때 무릎 굽힘
      legR.knee.rotation.x = pos(-swing) * 0.7 * walk;

      L.pivot.rotation.x = -swing * 0.6 * walk + idle * 0.03 * (1 - walk);
      R.pivot.rotation.x = swing * 0.6 * walk - idle * 0.03 * (1 - walk);
      L.elbow.rotation.x = -0.2 - pos(swing) * 0.35 * walk;
      R.elbow.rotation.x = -0.2 - pos(-swing) * 0.35 * walk;

      // 호흡 + 걸음 바운스 + 머리 살랑임
      torso.chest.scale.y = chestBaseY * (1 + idle * 0.02 * (1 - walk));
      body.position.y = Math.abs(swing) * 0.04 * walk;
      head.rotation.z = Math.sin(t * 1.3) * 0.02 * (1 - walk);
      head.rotation.x = Math.sin(phase * 2) * 0.03 * walk;
    },
  };
}
