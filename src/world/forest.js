// LITTLE DAY 두 번째 탐험 지역: 속삭이는 숲 (Whispering Forest)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';
import { createTree, createBush, createFlowerBed } from './plants.js';
import { createPathSegment } from './paths.js';
import { createForestCollectibles } from './forestCollectibles.js';

const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

// 1. 아치형 원목 다리 제작
function createWoodenBridge() {
  const g = new THREE.Group();
  g.name = 'wooden_bridge';

  const woodColor = 0xb88e68;
  const darkWood = 0x8a6442;

  // 다리 상판 (원목 널판지 11개 아치형 배열)
  const plankCount = 11;
  const bridgeLength = 5.2;
  const bridgeWidth = 3.0;

  for (let i = 0; i < plankCount; i++) {
    const t = i / (plankCount - 1); // 0 ~ 1
    const z = (t - 0.5) * bridgeLength;
    // 아치 곡선 (가운데가 살짝 솟아오름)
    const y = Math.sin(t * Math.PI) * 0.35 + 0.12;
    const angleX = Math.cos(t * Math.PI) * -0.15;

    const plank = new THREE.Mesh(rbox(bridgeWidth, 0.1, 0.42, 0.03), clay(i % 2 === 0 ? woodColor : 0xa67d58));
    plank.position.set(0, y, z);
    plank.rotation.x = angleX;
    plank.castShadow = true;
    plank.receiveShadow = true;
    g.add(plank);
  }

  // 좌우 난간 기둥 & 핸드레일
  const lampLights = [];
  const bulbMeshes = [];

  for (const s of [-1, 1]) {
    const x = s * (bridgeWidth / 2 - 0.15);
    // 3개의 지지 기둥
    for (let k = 0; k < 3; k++) {
      const t = k / 2;
      const z = (t - 0.5) * (bridgeLength - 0.6);
      const y = Math.sin(t * Math.PI) * 0.35 + 0.5;

      const post = new THREE.Mesh(cyl(0.08, 0.09, 0.85, 8), clay(darkWood));
      post.position.set(x, y, z);
      post.castShadow = true;
      g.add(post);

      // 가운데 기둥(k === 1) 상단에 숲 등불(랜턴) 부착
      if (k === 1) {
        const lanternGroup = new THREE.Group();
        lanternGroup.position.set(x, y + 0.52, z);

        const frame = new THREE.Mesh(cyl(0.12, 0.1, 0.28, 6), clay(0x4a3b32));
        frame.castShadow = true;
        lanternGroup.add(frame);

        const bulbMat = new THREE.MeshStandardMaterial({
          color: 0xffe6a3,
          emissive: 0xffb84d,
          emissiveIntensity: 0.2,
          roughness: 0.9
        });
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), bulbMat);
        bulb.position.y = 0.02;
        lanternGroup.add(bulb);
        bulbMeshes.push(bulb);

        const pLight = new THREE.PointLight(0xffb84d, 0, 7.0, 1.4);
        pLight.position.set(0, 0.05, 0);
        lanternGroup.add(pLight);
        lampLights.push(pLight);

        g.add(lanternGroup);
      }
    }

    // 곡선 핸드레일 상단 빔
    const rail = new THREE.Mesh(rbox(0.1, 0.1, bridgeLength - 0.4, 0.02), clay(darkWood));
    rail.position.set(x, 0.92, 0);
    rail.castShadow = true;
    g.add(rail);
  }

  return { root: g, lampLights, bulbMeshes };
}

// 2. 판타지 거대 버섯 제작 (클레이 랜드마크)
function createGiantMushroom(capColor, size = 1.0, dotColor = 0xffffff) {
  const g = new THREE.Group();
  g.name = 'giant_mushroom';

  const stemMat = clay(0xfaf3e3);
  const capMat = clay(capColor);

  // 줄기 (위로 가며 살짝 굽은 유선형)
  const stem = new THREE.Mesh(cyl(0.35 * size, 0.55 * size, 2.4 * size, 12), stemMat);
  stem.position.y = 1.2 * size;
  stem.castShadow = true;
  g.add(stem);

  // 버섯갓 (풍성한 돔 형태)
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.6 * size, 16, 12), capMat);
  cap.scale.set(1.0, 0.6, 1.0);
  cap.position.y = 2.4 * size;
  cap.castShadow = true;
  g.add(cap);

  // 하얀 물방울 도트들
  const dotCoords = [
    [0, 3.2 * size, 0],
    [-0.9 * size, 2.7 * size, 0.5 * size],
    [0.8 * size, 2.8 * size, -0.6 * size],
    [0.7 * size, 2.6 * size, 0.8 * size],
    [-0.7 * size, 2.8 * size, -0.7 * size]
  ];
  for (const pos of dotCoords) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.24 * size, 10, 8), clay(dotColor));
    dot.position.set(...pos);
    g.add(dot);
  }

  return g;
}

// 3. 고목 그루터기 랜드마크 제작
function createAncientTreeStump(radius = 2.2, height = 1.6) {
  const g = new THREE.Group();
  g.name = 'ancient_stump';

  const barkMat = clay(0x785338);
  const ringMat = clay(0xd4b08c);
  const mossMat = clay(0x6eb071);

  // 그루터기 몸통
  const stump = new THREE.Mesh(cyl(radius * 0.9, radius * 1.1, height, 16), barkMat);
  stump.position.y = height / 2;
  stump.castShadow = true;
  stump.receiveShadow = true;
  g.add(stump);

  // 나이테가 있는 상단 평면
  const topRing = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.86, radius * 0.86, 0.05, 20), ringMat);
  topRing.position.y = height + 0.01;
  topRing.receiveShadow = true;
  g.add(topRing);

  // 그루터기 주변 이끼 덤불과 작은 버섯들
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.3;
    const mx = Math.cos(ang) * (radius * 1.05);
    const mz = Math.sin(ang) * (radius * 1.05);

    const moss = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), mossMat);
    moss.scale.set(1.4, 0.6, 1.2);
    moss.position.set(mx, 0.2, mz);
    g.add(moss);
  }

  return g;
}

// 4. 통나무 벤치 제작
function createLogBench() {
  const g = new THREE.Group();
  g.name = 'log_bench';

  const woodMat = clay(0x996f4d);
  const log = new THREE.Mesh(cyl(0.25, 0.25, 2.2, 10), woodMat);
  log.rotation.z = Math.PI / 2;
  log.position.y = 0.32;
  log.castShadow = true;
  g.add(log);

  // 지지대 받침 2개
  for (const s of [-0.65, 0.65]) {
    const leg = new THREE.Mesh(cyl(0.18, 0.22, 0.32, 8), clay(0x6e4e35));
    leg.position.set(s, 0.16, 0);
    leg.castShadow = true;
    g.add(leg);
  }

  return g;
}

// 5. 숲 전용 반딧불이 (야간 22개 부유)
function createForestFireflies(count = 22) {
  const g = new THREE.Group();
  g.name = 'forest_fireflies';

  const fireflies = [];
  const flyGeo = new THREE.SphereGeometry(0.048, 8, 6);
  const flyMat = new THREE.MeshBasicMaterial({
    color: 0xc8ff7a,
    transparent: true,
    opacity: 0
  });

  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(flyGeo, flyMat.clone());
    // 숲 중심 반경 22m 내에 고루 분포
    const angle = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 19;
    const baseX = Math.cos(angle) * r;
    const baseZ = Math.sin(angle) * r;
    const baseY = 0.6 + Math.random() * 2.2;

    mesh.position.set(baseX, baseY, baseZ);
    g.add(mesh);

    fireflies.push({
      mesh,
      baseX,
      baseY,
      baseZ,
      seed: Math.random() * 100,
      speedX: 0.4 + Math.random() * 0.5,
      speedY: 0.8 + Math.random() * 0.8,
      speedZ: 0.3 + Math.random() * 0.5,
      flickerSpeed: 2.0 + Math.random() * 2.5
    });
  }

  return { group: g, fireflies };
}

// =========================================================================
// 속삭이는 숲 전체 월드 생성자
// =========================================================================
export function createForest(timeSystem, questSystem, inventorySystem) {
  const group = new THREE.Group();
  group.name = 'whispering_forest_world';

  const colliders = [];
  const BOUNDARY_RADIUS = 30.0;

  // 헬퍼: 메쉬 배치 & 콜라이더
  const place = (mesh, x, z, rotY = 0) => {
    mesh.position.set(x, 0, z);
    mesh.rotation.y = rotY;
    group.add(mesh);
    return mesh;
  };
  const circleCollider = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
  const boxCollider = (x, z, hw, hd, rot = 0) => colliders.push({ type: 'box', x, z, hw, hd, rot });

  // 1. 숲 지면 (넓은 원형 잔디 디스크 - 깊고 아늑한 숲속 올리브 잔디빛)
  const forestFloorGeo = new THREE.CylinderGeometry(33, 33, 0.4, 48);
  const floorMat = clay(0x6ca369); // 깊은 숲 잔디
  const floor = new THREE.Mesh(forestFloorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. 시냇물 (구불구불한 맑은 물줄기 평면)
  const riverGeo = new THREE.PlaneGeometry(54, 4.2);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x6dc4db,
    roughness: 0.22,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.02, -2.0);
  river.receiveShadow = true;
  group.add(river);

  // 시냇가 자갈 및 모래 둑
  const sandBankGeo = new THREE.PlaneGeometry(54, 1.2);
  const sandMat = clay(0xcdba9e);
  for (const s of [-1, 1]) {
    const bank = new THREE.Mesh(sandBankGeo, sandMat);
    bank.rotation.x = -Math.PI / 2;
    bank.position.set(0, 0.025, -2.0 + s * 2.3);
    bank.receiveShadow = true;
    group.add(bank);
  }

  // 3. 숲길 (포근한 흙길 네트워크)
  // (1) 입구 ~ 다리 앞 길
  group.add(createPathSegment([0, -17], [0, -4.6], 2.8));
  // (2) 다리 건너서 ~ 숲속 중앙 공터
  group.add(createPathSegment([0, 0.6], [0, 6.0], 2.8));
  // (3) 중앙 공터 ~ 동쪽 허브 초원
  group.add(createPathSegment([0, 6.0], [8.0, 3.0], 2.2));
  // (4) 중앙 공터 ~ 서쪽 버섯 숲
  group.add(createPathSegment([0, 6.0], [-8.0, 4.5], 2.2));
  // (5) 중앙 공터 ~ 북쪽 고목 그루터기 비밀 터
  group.add(createPathSegment([0, 6.0], [0, 15.0], 2.4));

  // 4. 아치형 원목 다리
  const bridgeObj = createWoodenBridge();
  bridgeObj.root.position.set(0, 0, -2.0);
  group.add(bridgeObj.root);
  // 다리 좌우 난간 충돌체
  boxCollider(-1.45, -2.0, 0.25, 2.6, 0);
  boxCollider(1.45, -2.0, 0.25, 2.6, 0);

  // 5. 판타지 거대 버섯 랜드마크 3개
  const shroomRed = createGiantMushroom(0xe74c3c, 1.15, 0xffffff);
  place(shroomRed, -10.5, 5.5, 0.4);
  circleCollider(-10.5, 5.5, 0.8);

  const shroomMint = createGiantMushroom(0x48c9b0, 0.95, 0xfbf6ea);
  place(shroomMint, 7.8, -7.5, -0.6);
  circleCollider(7.8, -7.5, 0.7);

  const shroomViolet = createGiantMushroom(0x9b59b6, 1.05, 0xfadbd8);
  place(shroomViolet, -5.2, 11.5, 1.2);
  circleCollider(-5.2, 11.5, 0.75);

  // 6. 북쪽 고목 그루터기 공터
  const stump = createAncientTreeStump(2.2, 1.5);
  place(stump, 0, 16.5);
  circleCollider(0, 16.5, 2.1);

  // 공터 주변 통나무 벤치 2개
  const benchL = createLogBench();
  place(benchL, -3.2, 6.2, Math.PI * 0.15);
  boxCollider(-3.2, 6.2, 1.1, 0.4, Math.PI * 0.15);

  const benchR = createLogBench();
  place(benchR, 3.2, 6.2, -Math.PI * 0.15);
  boxCollider(3.2, 6.2, 1.1, 0.4, -Math.PI * 0.15);

  // 7. 울창한 숲 나무 배치 (소나무, 활엽수, 벚나무)
  const forestTrees = [
    // 입구 주변
    ['pine', -4.2, -14.0, 1.2], ['pine', 4.2, -14.0, 1.2],
    ['round', -7.5, -16.0, 1.1], ['round', 7.5, -16.0, 1.1],
    // 시냇물 남쪽
    ['pine', -11.0, -8.0, 1.3], ['round', -16.0, -6.0, 1.0],
    ['pine', 12.0, -7.0, 1.2], ['round', 17.0, -9.0, 1.1],
    // 시냇물 북쪽 & 다리 옆
    ['pine', -4.5, 1.5, 1.2], ['round', 4.5, 1.5, 1.2],
    ['pine', -14.0, 0.5, 1.2], ['round', 14.0, 0.5, 1.1],
    // 중앙 공터 & 서쪽 버섯 숲
    ['round', -14.0, 8.0, 1.3], ['pine', -11.0, 12.0, 1.1],
    ['pine', -8.0, 17.0, 1.2], ['round', -4.0, 20.0, 1.0],
    // 동쪽 허브 초원
    ['pine', 13.0, 6.0, 1.2], ['round', 11.0, 11.0, 1.1],
    ['pine', 7.5, 16.0, 1.2], ['round', 4.0, 20.0, 1.0],
    // 북쪽 고목 뒤편 깊은 숲 병풍
    ['pine', 0.0, 22.0, 1.4], ['pine', -2.5, 23.5, 1.2], ['pine', 2.5, 23.5, 1.2],
    // 신비로운 벚나무 포인트 2그루
    ['cherry', -9.0, -1.5, 1.3], ['cherry', 9.5, 8.5, 1.3]
  ];

  for (const [type, x, z, s] of forestTrees) {
    place(createTree(type, s), x, z);
    circleCollider(x, z, 0.55 * s);
  }

  // 8. 숲속 바위 및 수풀
  const forestRocks = [
    [-6.5, -3.2, 0.8], [6.8, -3.5, 0.9],
    [-12.0, 4.0, 1.2], [10.5, 1.5, 1.0],
    [-2.2, 13.5, 0.7], [2.2, 13.5, 0.7]
  ];
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  const rockMat = clay(0x9fa8a3);
  for (const [x, z, s] of forestRocks) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(s * 0.9, s * 0.6, s * 0.8);
    rock.position.set(x, s * 0.3, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    circleCollider(x, z, s * 0.75);
  }

  // 꽃밭 3곳
  place(createFlowerBed(1.4, 201), 6.5, 4.0);
  place(createFlowerBed(1.3, 202), -5.5, 7.5);
  place(createFlowerBed(1.2, 203), 0, 10.0);

  // 9. 마을 복귀 출구 게이트 (남쪽 입구: x: 0, z: -17)
  const exitGate = new THREE.Group();
  exitGate.name = 'forest_exit_gate';
  const gateFrameMat = clay(0x73503a);

  // 양쪽 원목 기둥
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(cyl(0.18, 0.22, 3.2, 10), gateFrameMat);
    post.position.set(s * 1.5, 1.6, 0);
    post.castShadow = true;
    exitGate.add(post);
    circleCollider(s * 1.5, -17.0, 0.35);
  }
  // 상단 원목 아치 들보
  const beam = new THREE.Mesh(rbox(3.4, 0.32, 0.38, 0.05), gateFrameMat);
  beam.position.set(0, 3.1, 0);
  beam.castShadow = true;
  exitGate.add(beam);

  // 안내 팻말: "마을로 가는 길 🏡"
  const signBoard = new THREE.Mesh(rbox(1.8, 0.55, 0.1, 0.04), clay(0xf5e6cb));
  signBoard.position.set(0, 2.5, 0);
  exitGate.add(signBoard);

  place(exitGate, 0, -17.0);

  // 10. 숲 수집품 시스템 연결 (숲 이슬 버섯 3개, 속삭임 민트 허브 3개)
  const collectibles = createForestCollectibles(inventorySystem, questSystem);
  group.add(collectibles.group);

  // 11. 숲 반딧불이 (야간 22개)
  const fireflyData = createForestFireflies(22);
  group.add(fireflyData.group);

  // 12. 마을로 복귀 트리거 정보
  const exitTrigger = {
    x: 0,
    z: -17.0,
    radius: 2.2,
    prompt: '마을 광장으로 돌아가기 🏡'
  };

  // 스폰 위치 (마을에서 숲으로 입장 시 플레이어가 나타나는 위치)
  const spawnPos = new THREE.Vector3(0, 0, -15.2);

  // 애니메이션 및 낮밤 상태 갱신 함수
  function update(dt, isNight = false) {
    // (1) 수집품 호흡 및 펄스 애니메이션
    collectibles.update(dt);

    // (2) 다리 랜턴 야간 점등
    const targetLampIntensity = isNight ? 1.5 : 0;
    const targetBulbEmissive = isNight ? 1.0 : 0.1;
    for (const lamp of bridgeObj.lampLights) {
      lamp.intensity = THREE.MathUtils.lerp(lamp.intensity, targetLampIntensity, dt * 3.5);
    }
    for (const bulb of bridgeObj.bulbMeshes) {
      bulb.material.emissiveIntensity = THREE.MathUtils.lerp(
        bulb.material.emissiveIntensity,
        targetBulbEmissive,
        dt * 3.5
      );
    }

    // (3) 숲 반딧불이 애니메이션 (밤에 빛나며 부유)
    const targetFlyOpacity = isNight ? 0.85 : 0;
    for (const fly of fireflyData.fireflies) {
      fly.seed += dt;
      // 유려한 3D 비행 곡선
      fly.mesh.position.x = fly.baseX + Math.sin(fly.seed * fly.speedX) * 1.2;
      fly.mesh.position.y = fly.baseY + Math.sin(fly.seed * fly.speedY) * 0.45;
      fly.mesh.position.z = fly.baseZ + Math.cos(fly.seed * fly.speedZ) * 1.2;

      // 반짝임
      const flicker = 0.6 + 0.4 * Math.sin(fly.seed * fly.flickerSpeed);
      fly.mesh.material.opacity = THREE.MathUtils.lerp(
        fly.mesh.material.opacity,
        targetFlyOpacity * flicker,
        dt * 4.0
      );
    }
  }

  return {
    group,
    colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawnPos,
    exitTrigger,
    collectibles,
    setSystems(invSys, qSys) {
      collectibles.setSystems(invSys, qSys);
    },
    update
  };
}
