// LITTLE DAY - 플레이어 전용 별장 실내 공간 (아기자기한 유럽풍 클레이 토이 스타일)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';

const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);

function mk(geo, color, [x, y, z], [rx, ry, rz] = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, clay(color));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createCottageInterior() {
  const group = new THREE.Group();
  group.name = 'cottage-interior';
  const colliders = [];
  const occluders = [];

  function addOccluder(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.isMesh) {
        occluders.push(child);
      }
    });
  }

  const addWall = (mesh) => {
    group.add(mesh);
    addOccluder(mesh);
    return mesh;
  };

  // 방 크기: 폭 7.2m (x: -3.6 ~ 3.6), 깊이 6.4m (z: -3.2 ~ 3.2), 높이 3.2m
  const ROOM_W = 7.2;
  const ROOM_D = 6.4;
  const ROOM_H = 3.2;

  // 팔레트 (따뜻한 유럽풍 파스텔 클레이 톤)
  const C_WALL = 0xfffaee;      // 부드러운 크림 벽면
  const C_BASEBOARD = 0xffebdc; // 살구빛 몰딩/걸레받이
  const C_FLOOR = 0xebd3b5;     // 따뜻한 원목 파켓 바닥
  const C_WOOD_DARK = 0xb88365; // 가구 우드 프레임
  const C_WOOD_LIGHT = 0xdeb89a;// 밝은 원목
  const C_PINK = 0xffc4d4;      // 침구 및 커튼 핑크
  const C_MINT = 0xcfead9;      // 옷장/화장대 민트 악센트
  const C_CREAM = 0xfffcf5;     // 베개/시트
  const C_BRASS = 0xffdf78;     // 손잡이 및 금속 디테일
  const C_GLASS = 0xd5edfb;     // 거울 및 창문 유리

  // 1. 바닥 (목재 바닥판 느낌)
  const floorMesh = mk(rbox(ROOM_W, 0.2, ROOM_D, 0.05), C_FLOOR, [0, -0.1, 0]);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. 벽면 (상단은 카메라 시야를 위해 열려있고 하단 몰딩 포함)
  // 북쪽 벽 (창문이 있는 안쪽 벽)
  addWall(mk(rbox(ROOM_W, ROOM_H, 0.2, 0.08), C_WALL, [0, ROOM_H / 2, -ROOM_D / 2]));
  addWall(mk(rbox(ROOM_W, 0.25, 0.24, 0.04), C_BASEBOARD, [0, 0.125, -ROOM_D / 2]));

  // 서쪽 벽 (테이블과 침대 헤드가 붙는 벽)
  addWall(mk(rbox(0.2, ROOM_H, ROOM_D, 0.08), C_WALL, [-ROOM_W / 2, ROOM_H / 2, 0]));
  addWall(mk(rbox(0.24, 0.25, ROOM_D, 0.04), C_BASEBOARD, [-ROOM_W / 2, 0.125, 0]));

  // 동쪽 벽 (화장대와 옷장이 붙는 벽)
  addWall(mk(rbox(0.2, ROOM_H, ROOM_D, 0.08), C_WALL, [ROOM_W / 2, ROOM_H / 2, 0]));
  addWall(mk(rbox(0.24, 0.25, ROOM_D, 0.04), C_BASEBOARD, [ROOM_W / 2, 0.125, 0]));

  // 남쪽 벽 (출입문이 있는 벽, 문 양옆으로 분할)
  const DOOR_W = 1.3;
  const sideW = (ROOM_W - DOOR_W) / 2;
  addWall(mk(rbox(sideW, ROOM_H, 0.2, 0.08), C_WALL, [-ROOM_W / 2 + sideW / 2, ROOM_H / 2, ROOM_D / 2]));
  addWall(mk(rbox(sideW, ROOM_H, 0.2, 0.08), C_WALL, [ROOM_W / 2 - sideW / 2, ROOM_H / 2, ROOM_D / 2]));
  addWall(mk(rbox(DOOR_W, ROOM_H - 2.2, 0.2, 0.08), C_WALL, [0, ROOM_H - (ROOM_H - 2.2) / 2, ROOM_D / 2]));

  // 남쪽 출입문 (닫힌 문 + 문틀 + 손잡이 + 발매트)
  addWall(mk(rbox(DOOR_W + 0.15, 2.25, 0.1, 0.05), C_BASEBOARD, [0, 1.125, ROOM_D / 2 - 0.02]));
  addWall(mk(rbox(DOOR_W - 0.05, 2.15, 0.12, 0.06), 0xf0a8b8, [0, 1.075, ROOM_D / 2 + 0.01])); // 핑크 현관문
  addWall(mk(new THREE.SphereGeometry(0.055, 12, 8), C_BRASS, [-0.45, 1.05, ROOM_D / 2 - 0.06]));
  // 귀여운 현관 웰컴 매트
  group.add(mk(rbox(1.5, 0.03, 0.8, 0.04), 0xfff0db, [0, 0.015, ROOM_D / 2 - 0.55]));

  // 벽 충돌 박스 등록
  colliders.push({ type: 'box', x: 0, z: -ROOM_D / 2 - 0.1, hw: ROOM_W / 2, hd: 0.2, rot: 0 }); // 북
  colliders.push({ type: 'box', x: -ROOM_W / 2 - 0.1, z: 0, hw: 0.2, hd: ROOM_D / 2, rot: 0 }); // 서
  colliders.push({ type: 'box', x: ROOM_W / 2 + 0.1, z: 0, hw: 0.2, hd: ROOM_D / 2, rot: 0 });  // 동
  colliders.push({ type: 'box', x: 0, z: ROOM_D / 2 + 0.1, hw: ROOM_W / 2, hd: 0.2, rot: 0 });  // 남

  // ----------------------------------------------------
  // 3. 필수 가구 7종 배치
  // ----------------------------------------------------

  // [1] 침대 (북서쪽 코너: x -2.3, z -2.0)
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-2.25, 0, -1.95);
  // 침대 목재 프레임
  bedGroup.add(mk(rbox(1.7, 0.35, 2.1, 0.06), C_WOOD_LIGHT, [0, 0.175, 0]));
  // 헤드보드
  bedGroup.add(mk(rbox(1.75, 1.0, 0.15, 0.08), C_WOOD_LIGHT, [0, 0.5, -1.0]));
  // 풋보드
  bedGroup.add(mk(rbox(1.75, 0.5, 0.12, 0.06), C_WOOD_LIGHT, [0, 0.25, 1.0]));
  // 매트리스
  bedGroup.add(mk(rbox(1.55, 0.3, 1.95, 0.08), C_CREAM, [0, 0.4, 0]));
  // 포근한 분홍 이불 (덮개)
  bedGroup.add(mk(rbox(1.58, 0.24, 1.35, 0.08), C_PINK, [0, 0.48, 0.32]));
  // 접힌 이불깃 (화이트/크림)
  bedGroup.add(mk(rbox(1.58, 0.08, 0.25, 0.04), C_CREAM, [0, 0.52, -0.32]));
  // 베개 2개
  bedGroup.add(mk(rbox(0.6, 0.16, 0.42, 0.07), C_CREAM, [-0.42, 0.53, -0.68], [0.2, 0, 0]));
  bedGroup.add(mk(rbox(0.6, 0.16, 0.42, 0.07), C_CREAM, [0.42, 0.53, -0.68], [0.2, 0, 0]));
  group.add(bedGroup);
  addOccluder(bedGroup);
  // 침대 충돌체
  colliders.push({ type: 'box', x: -2.25, z: -1.95, hw: 0.95, hd: 1.15, rot: 0 });

  // 협탁 & 작은 스탠드 조명 (침대 우측: x -1.0, z -2.6)
  const standGroup = new THREE.Group();
  standGroup.position.set(-1.0, 0, -2.65);
  standGroup.add(mk(rbox(0.55, 0.55, 0.55, 0.05), C_WOOD_LIGHT, [0, 0.275, 0]));
  standGroup.add(mk(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), C_BRASS, [0, 0.7, 0]));
  standGroup.add(mk(new THREE.ConeGeometry(0.22, 0.24, 16, 1, true), 0xfffae0, [0, 0.88, 0]));
  group.add(standGroup);
  addOccluder(standGroup);
  colliders.push({ type: 'box', x: -1.0, z: -2.65, hw: 0.35, hd: 0.35, rot: 0 });

  // [2] 옷장 (북동쪽: x 2.4, z -2.55)
  const wardrobeGroup = new THREE.Group();
  wardrobeGroup.position.set(2.35, 0, -2.55);
  // 본체
  wardrobeGroup.add(mk(rbox(1.75, 2.35, 0.8, 0.08), C_WOOD_LIGHT, [0, 1.175, 0]));
  // 상단 몰딩 캡
  wardrobeGroup.add(mk(rbox(1.9, 0.18, 0.9, 0.06), C_WOOD_DARK, [0, 2.4, 0]));
  // 2단 도어 패널 (민트 톤 포인트)
  wardrobeGroup.add(mk(rbox(0.76, 1.8, 0.06, 0.04), C_MINT, [-0.42, 1.25, 0.41]));
  wardrobeGroup.add(mk(rbox(0.76, 1.8, 0.06, 0.04), C_MINT, [0.42, 1.25, 0.41]));
  // 금속 손잡이
  wardrobeGroup.add(mk(new THREE.SphereGeometry(0.04, 10, 8), C_BRASS, [-0.08, 1.25, 0.47]));
  wardrobeGroup.add(mk(new THREE.SphereGeometry(0.04, 10, 8), C_BRASS, [0.08, 1.25, 0.47]));
  // 하단 서랍부
  wardrobeGroup.add(mk(rbox(1.6, 0.36, 0.05, 0.03), C_WOOD_DARK, [0, 0.25, 0.41]));
  group.add(wardrobeGroup);
  addOccluder(wardrobeGroup);
  // 옷장 충돌체
  colliders.push({ type: 'box', x: 2.35, z: -2.55, hw: 0.95, hd: 0.48, rot: 0 });

  // [3] 전신거울 / 화장대 (동쪽 벽면: x 3.0, z 0.1)
  const vanityGroup = new THREE.Group();
  vanityGroup.position.set(3.05, 0, 0.1);
  vanityGroup.rotation.y = -Math.PI / 2;
  // 화장대 테이블
  vanityGroup.add(mk(rbox(1.3, 0.75, 0.55, 0.06), C_WOOD_LIGHT, [0, 0.375, 0]));
  // 아치형 거울 프레임
  vanityGroup.add(mk(rbox(0.9, 1.25, 0.08, 0.06), C_WOOD_DARK, [0, 1.45, -0.22]));
  // 거울 유리면
  vanityGroup.add(mk(rbox(0.74, 1.08, 0.04, 0.04), C_GLASS, [0, 1.45, -0.19]));
  // 소품 (향수병, 꽃병)
  vanityGroup.add(mk(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 8), 0xf7b0c4, [-0.4, 0.82, 0]));
  vanityGroup.add(mk(new THREE.CylinderGeometry(0.03, 0.04, 0.18, 8), 0xa0dcc0, [0.4, 0.84, 0]));
  // 둥근 스툴 의자
  vanityGroup.add(mk(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 16), C_PINK, [0, 0.21, 0.5]));
  group.add(vanityGroup);
  addOccluder(vanityGroup);
  // 화장대 충돌체
  colliders.push({ type: 'box', x: 3.05, z: 0.1, hw: 0.55, hd: 0.85, rot: 0 });

  // [4] 작은 티 테이블 & 의자 (서쪽 벽면: x -2.6, z 1.1)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-2.55, 0, 1.1);
  // 둥근 원목 테이블
  tableGroup.add(mk(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 20), C_WOOD_LIGHT, [0, 0.72, 0]));
  tableGroup.add(mk(new THREE.CylinderGeometry(0.08, 0.12, 0.68, 12), C_WOOD_DARK, [0, 0.34, 0]));
  tableGroup.add(mk(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16), C_WOOD_DARK, [0, 0.025, 0]));
  // 테이블보 (연핑크)
  tableGroup.add(mk(new THREE.CylinderGeometry(0.48, 0.52, 0.04, 18), 0xfff1f5, [0, 0.76, 0]));
  // 티포트와 찻잔
  tableGroup.add(mk(new THREE.SphereGeometry(0.08, 10, 8), 0xfffcf7, [0.05, 0.85, 0]));
  tableGroup.add(mk(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 8), 0xbde6d0, [-0.2, 0.81, 0.1]));
  // 의자 2개 (북쪽, 남쪽)
  for (const s of [-1, 1]) {
    const chair = new THREE.Group();
    chair.position.set(0, 0, s * 0.85);
    chair.add(mk(rbox(0.42, 0.06, 0.42, 0.04), C_WOOD_LIGHT, [0, 0.45, 0]));
    chair.add(mk(rbox(0.42, 0.48, 0.06, 0.04), C_WOOD_LIGHT, [0, 0.7, s * 0.18]));
    // 다리 4개
    for (const cx of [-0.16, 0.16]) {
      for (const cz of [-0.16, 0.16]) {
        chair.add(mk(new THREE.CylinderGeometry(0.025, 0.02, 0.44, 8), C_WOOD_DARK, [cx, 0.22, cz]));
      }
    }
    tableGroup.add(chair);
  }
  group.add(tableGroup);
  addOccluder(tableGroup);
  // 테이블 세트 충돌체
  colliders.push({ type: 'circle', x: -2.55, z: 1.1, r: 0.95 });

  // [5] 창문 (북쪽 벽 중앙: x 0, z -3.1, y 1.7)
  const windowGroup = new THREE.Group();
  windowGroup.position.set(0, 1.7, -ROOM_D / 2 + 0.08);
  // 창틀 (아치형 디테일)
  windowGroup.add(mk(rbox(1.8, 1.4, 0.1, 0.06), C_BASEBOARD, [0, 0, 0]));
  windowGroup.add(mk(rbox(1.56, 1.18, 0.12, 0.04), C_GLASS, [0, 0, 0.01]));
  // 십자 창살
  windowGroup.add(mk(rbox(1.56, 0.06, 0.13, 0.02), C_BASEBOARD, [0, 0, 0.02]));
  windowGroup.add(mk(rbox(0.06, 1.18, 0.13, 0.02), C_BASEBOARD, [0, 0, 0.02]));
  // 커튼 봉 및 양쪽 핑크 커튼
  windowGroup.add(mk(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8), C_BRASS, [0, 0.78, 0.1], [0, 0, Math.PI / 2]));
  windowGroup.add(mk(rbox(0.35, 1.55, 0.14, 0.06), C_PINK, [-0.95, -0.05, 0.08]));
  windowGroup.add(mk(rbox(0.35, 1.55, 0.14, 0.06), C_PINK, [0.95, -0.05, 0.08]));
  // 창턱 꽃상자
  windowGroup.add(mk(rbox(1.4, 0.18, 0.28, 0.05), C_WOOD_LIGHT, [0, -0.72, 0.18]));
  group.add(windowGroup);
  addOccluder(windowGroup);

  // [6] 중앙 펜던트 조명 (천장 중앙: x 0, y 2.7, z 0)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(0, 2.7, 0);
  lampGroup.add(mk(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), 0x5a4a42, [0, 0.25, 0]));
  lampGroup.add(mk(new THREE.ConeGeometry(0.38, 0.25, 16, 1, true), 0xfff3d4, [0, -0.05, 0]));
  lampGroup.add(mk(new THREE.SphereGeometry(0.09, 12, 8), 0xfffce8, [0, -0.12, 0]));
  // 따뜻한 실내 포인트 라이트
  const pointLight = new THREE.PointLight(0xffebd2, 2.4, 9.5);
  pointLight.position.set(0, 2.45, 0);
  pointLight.castShadow = true;
  pointLight.shadow.bias = -0.002;
  group.add(lampGroup, pointLight);

  // [7] 둥근 대형 클레이 러그 (중앙 바닥: x 0.1, z 0.3)
  const rugGroup = new THREE.Group();
  rugGroup.position.set(0.1, 0.01, 0.3);
  rugGroup.add(mk(rbox(2.8, 0.02, 2.2, 0.3), 0xfff6eb, [0, 0, 0])); // 아이보리 바탕
  rugGroup.add(mk(rbox(2.4, 0.022, 1.8, 0.25), 0xfce4ec, [0, 0, 0])); // 핑크 테두리
  rugGroup.add(mk(rbox(1.8, 0.024, 1.2, 0.2), 0xfff9f2, [0, 0, 0]));  // 내부 패턴
  group.add(rugGroup);

  // ----------------------------------------------------
  // 4. 상호작용 트리거 지점 목록 (플레이어 주거 공간 인터랙션)
  // ----------------------------------------------------
  const triggers = {
    // [E] 나가기 (출입문 근처)
    exit: {
      id: 'exit',
      name: '마을 광장으로 나가기',
      prompt: '마을 광장으로 나가기',
      x: 0,
      z: 2.3,
      radius: 1.4
    },
    // [E] 옷장 열기 (의상 변경)
    wardrobe: {
      id: 'wardrobe',
      name: '내 옷장',
      prompt: '내 옷장 열기 (의상 갈아입기)',
      x: 2.35,
      z: -1.75,
      radius: 1.35
    },
    // [E] 거울/화장대 보기 (캐릭터 꾸미기)
    mirror: {
      id: 'mirror',
      name: '내 화장대',
      prompt: '내 화장대 보기 (외형 스타일링)',
      x: 2.1,
      z: 0.1,
      radius: 1.3
    },
    // [E] 침대 휴식
    bed: {
      id: 'bed',
      name: '포근한 내 침대',
      prompt: '포근한 침대에서 휴식하기',
      x: -1.2,
      z: -1.95,
      radius: 1.3
    }
  };

  // 실내 플레이어 이동 가능 경계 (바운딩 박스)
  const boundaryBox = {
    minX: -ROOM_W / 2 + 0.5,
    maxX: ROOM_W / 2 - 0.5,
    minZ: -ROOM_D / 2 + 0.5,
    maxZ: ROOM_D / 2 - 0.6
  };

  // 실내 전용 카메라 세팅 (벽 밖으로 나가지 않도록 거리 및 바운드 설정, 실내 적정 줌 범위 및 여유 있는 거리 확보)
  const cameraSettings = {
    distance: 3.2,
    minDistance: 2.0,
    maxDistance: 4.2,
    yaw: 0,
    pitch: 0.46,
    bounds: {
      minX: -3.4,
      maxX: 3.4,
      minY: 0.9,
      maxY: 3.6,
      minZ: -3.0,
      maxZ: 3.8
    }
  };

  return {
    group,
    colliders,
    triggers,
    boundaryBox,
    cameraSettings,
    spawnPos: new THREE.Vector3(0, 0, 0.5), // 중앙 러그 위, 북쪽을 바라보며 실내 전경과 캐릭터 전신이 시원하게 보이도록 스폰
    occluders
  };
}
