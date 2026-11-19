// LITTLE DAY 세 번째 독립 탐험 지역: 달빛 섬 (Moonlight Island)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';
import { createPathSegment } from './paths.js';

const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

// 1. 하얀 등대 제작 (Lighthouse)
function createLighthouse() {
  const g = new THREE.Group();
  g.name = 'moonlight_lighthouse';

  const whiteMat = clay(0xfaf7f2);
  const coralMat = clay(0xf08092);
  const darkMat = clay(0x40363a);

  // 등대 기단 (돌받침)
  const base = new THREE.Mesh(cyl(2.8, 3.2, 1.2, 16), clay(0xb0a59b));
  base.position.y = 0.6;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // 1단 흰색 탑신
  const tier1 = new THREE.Mesh(cyl(2.2, 2.6, 3.5, 16), whiteMat);
  tier1.position.y = 2.95;
  tier1.castShadow = true;
  g.add(tier1);

  // 중간 코랄색 링 띠
  const ring = new THREE.Mesh(cyl(2.1, 2.2, 0.45, 16), coralMat);
  ring.position.y = 4.95;
  g.add(ring);

  // 2단 흰색 탑신
  const tier2 = new THREE.Mesh(cyl(1.7, 2.05, 3.2, 16), whiteMat);
  tier2.position.y = 6.75;
  tier2.castShadow = true;
  g.add(tier2);

  // 등대 전망대 데크 & 난간
  const deck = new THREE.Mesh(cyl(2.2, 2.2, 0.35, 16), darkMat);
  deck.position.y = 8.5;
  g.add(deck);

  // 등대 등명기(조명실) 유리 & 프레임
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xfff9e6,
    emissive: 0xffd97d,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });
  const lanternGlass = new THREE.Mesh(cyl(1.3, 1.3, 1.8, 12), glassMat);
  lanternGlass.position.y = 9.5;
  g.add(lanternGlass);

  // 등대 조명 전구 (PointLight)
  const beaconLight = new THREE.PointLight(0xffea9f, 0.5, 25.0, 1.2);
  beaconLight.position.set(0, 9.6, 0);
  g.add(beaconLight);

  // 등대 뾰족 지붕 (코랄 돔)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.4, 16), coralMat);
  roof.position.y = 11.1;
  roof.castShadow = true;
  g.add(roof);

  return { root: g, beaconLight, glassMat };
}

// 2. 야자수 (Palm Tree) 제작
function createPalmTree(scale = 1.0, slantAngle = 0.15) {
  const g = new THREE.Group();
  g.name = 'palm_tree';

  // 줄기 (위로 가며 살짝 기울어진 야자 줄기)
  const trunkMat = clay(0xa17a56);
  const segments = 6;
  let curY = 0;
  for (let i = 0; i < segments; i++) {
    const r = (0.28 - i * 0.02) * scale;
    const h = 0.7 * scale;
    const segMesh = new THREE.Mesh(cyl(r * 0.9, r, h, 8), trunkMat);
    segMesh.position.set(Math.sin(slantAngle) * curY * 0.3, curY + h / 2, 0);
    segMesh.rotation.z = -slantAngle * (i / segments);
    segMesh.castShadow = true;
    g.add(segMesh);
    curY += h * 0.95;
  }

  // 야자 잎사귀 (5장 방사형)
  const leafMat = clay(0x62b368);
  const frondCount = 6;
  const leafGroup = new THREE.Group();
  leafGroup.position.set(Math.sin(slantAngle) * curY * 0.3, curY, 0);

  for (let i = 0; i < frondCount; i++) {
    const ang = (i / frondCount) * Math.PI * 2;
    const frond = new THREE.Mesh(rbox(0.45 * scale, 0.08 * scale, 2.2 * scale, 0.02), leafMat);
    frond.position.set(Math.cos(ang) * 0.9 * scale, -0.2 * scale, Math.sin(ang) * 0.9 * scale);
    frond.rotation.y = ang;
    frond.rotation.x = 0.45;
    frond.castShadow = true;
    leafGroup.add(frond);
  }

  // 코코넛 열매 3개
  const nutMat = clay(0x593d28);
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + 0.5;
    const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 8, 6), nutMat);
    nut.position.set(Math.cos(ang) * 0.35 * scale, -0.15 * scale, Math.sin(ang) * 0.35 * scale);
    leafGroup.add(nut);
  }

  g.add(leafGroup);
  return g;
}

// 3. 목조 부두 및 나룻배 (Pier & Rowboat)
function createPier() {
  const g = new THREE.Group();
  g.name = 'wooden_pier';

  const woodMat = clay(0xb58c67);
  const darkWoodMat = clay(0x75523b);

  // 부두 상판 널빤지 (길이 10m)
  const plankCount = 14;
  for (let i = 0; i < plankCount; i++) {
    const z = i * 0.7;
    const plank = new THREE.Mesh(rbox(2.8, 0.12, 0.6, 0.03), woodMat);
    plank.position.set(0, 0.35, z);
    plank.castShadow = true;
    plank.receiveShadow = true;
    g.add(plank);
  }

  // 바다에 박힌 지지 기둥들
  for (let i = 0; i < plankCount; i += 3) {
    const z = i * 0.7;
    for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(cyl(0.1, 0.12, 1.4, 8), darkWoodMat);
      pole.position.set(s * 1.3, -0.2, z);
      g.add(pole);
    }
  }

  // 부두 끝 랜턴
  const lanternLight = new THREE.PointLight(0xffbe6b, 0, 7.0, 1.3);
  lanternLight.position.set(1.1, 1.2, (plankCount - 1) * 0.7);
  g.add(lanternLight);

  return { root: g, lanternLight };
}

// 4. 빛나는 조개/소라 장식
function createSeashell(color = 0xffadc7) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), clay(color));
  shell.scale.set(1.2, 0.4, 0.9);
  shell.position.y = 0.08;
  g.add(shell);
  return g;
}

// 5. 달빛 섬 전체 3D 맵 빌더
export function createMoonlightIsland(timeSystem) {
  const group = new THREE.Group();
  group.name = 'moonlight_island_world';

  const colliders = [];
  const BOUNDARY_RADIUS = 28.0;

  const place = (mesh, x, z, rotY = 0) => {
    mesh.position.set(x, 0, z);
    mesh.rotation.y = rotY;
    group.add(mesh);
    return mesh;
  };
  const circleCollider = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
  const boxCollider = (x, z, hw, hd, rot = 0) => colliders.push({ type: 'box', x, z, hw, hd, rot });

  // 1. 섬 모래사장 지면
  const islandFloorGeo = new THREE.CylinderGeometry(30, 31, 0.4, 48);
  const sandMat = clay(0xf4e6cd); // 고운 백사장
  const floor = new THREE.Mesh(islandFloorGeo, sandMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  group.add(floor);

  // 물기 젖은 모래 가장자리 림
  const wetRimGeo = new THREE.RingGeometry(26, 32, 48);
  const wetRimMat = clay(0xd9be9b);
  const wetRim = new THREE.Mesh(wetRimGeo, wetRimMat);
  wetRim.rotation.x = -Math.PI / 2;
  wetRim.position.y = 0.02;
  wetRim.receiveShadow = true;
  group.add(wetRim);

  // 2. 바다 평면 (에메랄드 크리스탈 바다)
  const oceanGeo = new THREE.PlaneGeometry(160, 160);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x56a6c2,
    roughness: 0.18,
    metalness: 0.12,
    transparent: true,
    opacity: 0.88
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.05, 0);
  ocean.receiveShadow = true;
  group.add(ocean);

  // 3. 하얀 등대 (북쪽 해안가 언덕: x: 0, z: -16)
  const lighthouse = createLighthouse();
  place(lighthouse.root, 0, -16);
  circleCollider(0, -16, 2.9);

  // 4. 목조 부두 (남쪽 바다: x: 0, z: 12 ~ 21)
  const pier = createPier();
  place(pier.root, 0, 11);
  boxCollider(0, 15.5, 1.45, 4.6, 0);

  // 5. 숲과 모래길
  group.add(createPathSegment([0, 11], [0, -12], 2.6));
  group.add(createPathSegment([0, 0], [10, -3], 2.2));
  group.add(createPathSegment([0, 0], [-10, -3], 2.2));

  // 6. 야자수들 배치
  const palmTrees = [
    [-8, 6, 1.2, 0.15],
    [9, 5, 1.15, -0.18],
    [-14, -2, 1.1, 0.2],
    [13, -4, 1.25, -0.15],
    [-6, -11, 1.05, -0.1],
    [7, -12, 1.1, 0.12],
    [-11, 12, 1.0, 0.22],
    [10, 13, 1.05, -0.2]
  ];
  for (const [x, z, s, slant] of palmTrees) {
    place(createPalmTree(s, slant), x, z);
    circleCollider(x, z, 0.5 * s);
  }

  // 7. 해변 바위들
  const coastalRocks = [
    [-16, 8, 1.4], [17, 7, 1.2],
    [-9, -15, 1.5], [11, -15, 1.6],
    [-3, -19, 1.3], [3, -19, 1.3]
  ];
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  const rockMat = clay(0x9ca3a8);
  for (const [x, z, s] of coastalRocks) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(s * 1.1, s * 0.7, s * 0.9);
    rock.position.set(x, s * 0.35, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    circleCollider(x, z, s * 0.8);
  }

  // 8. 빛나는 조개들 (해변 장식)
  const shells = [
    createSeashell(0xffa8c5),
    createSeashell(0x76d7c4),
    createSeashell(0xffdf88),
    createSeashell(0xc5a8ff)
  ];
  place(shells[0], -4, 8);
  place(shells[1], 5, 9);
  place(shells[2], -8, -5);
  place(shells[3], 7, -6);

  // 9. 해안가 반딧불이
  const seaFirefliesGroup = new THREE.Group();
  const flyGeo = new THREE.SphereGeometry(0.045, 8, 6);
  const seaFlies = [];
  for (let i = 0; i < 20; i++) {
    const flyMat = new THREE.MeshBasicMaterial({ color: 0x98f5ff, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(flyGeo, flyMat);
    const ang = Math.random() * Math.PI * 2;
    const r = 4 + Math.random() * 18;
    const bx = Math.cos(ang) * r;
    const bz = Math.sin(ang) * r;
    const by = 0.6 + Math.random() * 1.8;
    mesh.position.set(bx, by, bz);
    seaFirefliesGroup.add(mesh);
    seaFlies.push({ mesh, mat: flyMat, bx, by, bz, seed: Math.random() * 100 });
  }
  group.add(seaFirefliesGroup);

  // 스폰 위치: 부두 앞 모래사장 (북쪽 등대를 바라봄)
  const spawnPos = new THREE.Vector3(0, 0, 8.5);

  let timeAnim = 0;

  function update(dt, isNight = false) {
    timeAnim += dt;

    // (1) 등대 야간 조명 및 비콘 회전
    const targetBeacon = isNight ? 2.2 : 0.2;
    lighthouse.beaconLight.intensity = THREE.MathUtils.lerp(
      lighthouse.beaconLight.intensity,
      targetBeacon,
      dt * 3.0
    );
    lighthouse.glassMat.emissiveIntensity = THREE.MathUtils.lerp(
      lighthouse.glassMat.emissiveIntensity,
      isNight ? 1.4 : 0.3,
      dt * 3.0
    );

    // (2) 부두 랜턴
    pier.lanternLight.intensity = THREE.MathUtils.lerp(
      pier.lanternLight.intensity,
      isNight ? 1.4 : 0,
      dt * 3.0
    );

    // (3) 해안 반딧불이 애니메이션
    const targetFlyOp = isNight ? 0.8 : 0;
    for (const f of seaFlies) {
      f.seed += dt;
      f.mesh.position.x = f.bx + Math.sin(f.seed * 0.8) * 0.9;
      f.mesh.position.y = f.by + Math.sin(f.seed * 1.2) * 0.35;
      f.mesh.position.z = f.bz + Math.cos(f.seed * 0.7) * 0.9;
      f.mat.opacity = THREE.MathUtils.lerp(f.mat.opacity, targetFlyOp, dt * 3.5);
    }
  }

  function dispose() {
    // Three.js 리소스 해제 헬퍼
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  return {
    group,
    colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawnPos,
    update,
    dispose
  };
}
