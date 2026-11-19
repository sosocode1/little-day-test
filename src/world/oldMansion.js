// LITTLE DAY 네 번째 독립 탐험 지역: 오래된 저택 (Old Mansion)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';
import { createPathSegment } from './paths.js';
import { createFlowerBed } from './plants.js';

const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

// 1. 고풍스러운 저택 본관 파사드 (Antique Stone Manor)
function createMansionFacade() {
  const g = new THREE.Group();
  g.name = 'mansion_facade';

  const stoneMat = clay(0xd1c7bd); // 고풍스러운 베이지 석조
  const roofMat = clay(0x544741);  // 앤틱 브라운 박공 지붕
  const trimMat = clay(0xf4ede4);
  const doorMat = clay(0x6e4d3a);

  // 본관 1단 몸통 (가로 14m, 세로 5.5m, 깊이 6m)
  const body = new THREE.Mesh(rbox(14, 5.5, 6, 0.15), stoneMat);
  body.position.set(0, 2.75, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // 중앙 돌출 현관 포치 (Porch)
  const porch = new THREE.Mesh(rbox(4.8, 4.2, 2.4, 0.1), stoneMat);
  porch.position.set(0, 2.1, 3.4);
  porch.castShadow = true;
  g.add(porch);

  // 현관 지붕 박공
  const porchRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), roofMat);
  porchRoof.rotation.y = Math.PI / 4;
  porchRoof.position.set(0, 5.0, 3.4);
  porchRoof.castShadow = true;
  g.add(porchRoof);

  // 현관문 (묵직한 원목 아치문)
  const door = new THREE.Mesh(rbox(1.8, 2.8, 0.15, 0.08), doorMat);
  door.position.set(0, 1.4, 4.65);
  g.add(door);

  // 대형 박공 지붕 (Roof)
  const mainRoof = new THREE.Mesh(rbox(15.2, 2.8, 7.2, 0.15), roofMat);
  mainRoof.position.set(0, 6.4, 0);
  mainRoof.castShadow = true;
  g.add(mainRoof);

  // 굴뚝 2개
  for (const s of [-4.5, 4.5]) {
    const chimney = new THREE.Mesh(rbox(0.9, 2.4, 0.9, 0.08), clay(0x8a6254));
    chimney.position.set(s, 7.8, -1.0);
    chimney.castShadow = true;
    g.add(chimney);
  }

  // 창문들과 야간 창문 불빛 메쉬
  const windowMeshes = [];
  const windowLightMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c7,
    emissive: 0xffaa33,
    emissiveIntensity: 0.1,
    roughness: 0.2
  });

  const winCoords = [
    [-4.5, 3.6, 3.05], [4.5, 3.6, 3.05],
    [-4.5, 1.6, 3.05], [4.5, 1.6, 3.05],
    [0, 3.4, 4.65]
  ];
  for (const [wx, wy, wz] of winCoords) {
    const frame = new THREE.Mesh(rbox(1.5, 1.9, 0.15, 0.05), trimMat);
    frame.position.set(wx, wy, wz);
    g.add(frame);

    const glass = new THREE.Mesh(rbox(1.2, 1.6, 0.1, 0.04), windowLightMat);
    glass.position.set(wx, wy, wz + 0.04);
    g.add(glass);
    windowMeshes.push(glass);
  }

  // 현관 앞 랜턴 조명
  const porchLight = new THREE.PointLight(0xffbe6b, 0.2, 9.0, 1.4);
  porchLight.position.set(0, 3.2, 4.9);
  g.add(porchLight);

  return { root: g, windowLightMat, porchLight };
}

// 2. 앤틱 석조 분수대 (Antique Stone Fountain)
function createAntiqueFountain() {
  const g = new THREE.Group();
  g.name = 'antique_fountain';

  const stoneMat = clay(0xc5bcb3);

  // 하단 분수대 원형 수조
  const basin = new THREE.Mesh(cyl(2.8, 3.0, 0.55, 24), stoneMat);
  basin.position.y = 0.28;
  basin.castShadow = true;
  basin.receiveShadow = true;
  g.add(basin);

  // 분수대 물 평면
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.05, 24), new THREE.MeshStandardMaterial({
    color: 0x6dbdd6,
    roughness: 0.15,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9
  }));
  water.position.y = 0.48;
  g.add(water);

  // 중앙 석조 기둥
  const pillar = new THREE.Mesh(cyl(0.35, 0.45, 1.8, 12), stoneMat);
  pillar.position.y = 1.0;
  pillar.castShadow = true;
  g.add(pillar);

  // 2단 작은 수조
  const topBowl = new THREE.Mesh(cyl(1.1, 0.8, 0.35, 16), stoneMat);
  topBowl.position.y = 1.8;
  topBowl.castShadow = true;
  g.add(topBowl);

  // 상단 석조 장식 구체
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), stoneMat);
  finial.position.y = 2.2;
  finial.castShadow = true;
  g.add(finial);

  return g;
}

// 3. 사이프러스 침엽수 (Cypress Tree - 앤틱 정원수)
function createCypressTree(scale = 1.0) {
  const g = new THREE.Group();
  g.name = 'cypress_tree';

  // 줄기
  const trunk = new THREE.Mesh(cyl(0.14 * scale, 0.18 * scale, 1.0 * scale, 8), clay(0x6e4e37));
  trunk.position.y = 0.5 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  // 세로로 길쭉한 원뿔형 녹색 잎
  const foliageMat = clay(0x43734a);
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 4.2 * scale, 10), foliageMat);
  foliage.position.y = 2.7 * scale;
  foliage.castShadow = true;
  g.add(foliage);

  return g;
}

// 4. 저택 철제 정원 게이트 (Iron Gate)
function createIronGate(width = 3.6) {
  const g = new THREE.Group();
  g.name = 'mansion_gate';

  const pillarMat = clay(0xbdb2a6);
  const ironMat = clay(0x3d363b);

  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(rbox(0.7, 3.2, 0.7, 0.1), pillarMat);
    post.position.set(s * (width / 2), 1.6, 0);
    post.castShadow = true;
    g.add(post);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), pillarMat);
    cap.position.set(s * (width / 2), 3.4, 0);
    g.add(cap);
  }

  // 상단 철제 아치
  const arch = new THREE.Mesh(rbox(width + 0.4, 0.2, 0.2, 0.04), ironMat);
  arch.position.set(0, 2.9, 0);
  g.add(arch);

  return g;
}

// 5. 오래된 저택 전체 3D 맵 빌더
export function createOldMansion(timeSystem) {
  const group = new THREE.Group();
  group.name = 'old_mansion_world';

  const colliders = [];
  const BOUNDARY_RADIUS = 26.0;

  const place = (mesh, x, z, rotY = 0) => {
    mesh.position.set(x, 0, z);
    mesh.rotation.y = rotY;
    group.add(mesh);
    return mesh;
  };
  const circleCollider = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
  const boxCollider = (x, z, hw, hd, rot = 0) => colliders.push({ type: 'box', x, z, hw, hd, rot });

  // 1. 저택 지면 (고즈넉한 고풍 잔디와 석조 바닥)
  const mansionFloorGeo = new THREE.CylinderGeometry(28, 29, 0.4, 48);
  const grassMat = clay(0x61855e); // 차분하고 고풍스러운 정원 잔디
  const floor = new THREE.Mesh(mansionFloorGeo, grassMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. 본관 건물 파사드 (북쪽 끝: x: 0, z: -14)
  const mansion = createMansionFacade();
  place(mansion.root, 0, -14);
  boxCollider(0, -14, 7.4, 3.4, 0);
  boxCollider(0, -10.6, 2.6, 1.4, 0);

  // 3. 중앙 앤틱 석조 분수대 (x: 0, z: 0)
  const fountain = createAntiqueFountain();
  place(fountain, 0, 0);
  circleCollider(0, 0, 2.9);

  // 4. 정원 진입 게이트 (남쪽 입구: x: 0, z: 15.5)
  const gate = createIronGate(4.2);
  place(gate, 0, 15.5);
  boxCollider(-2.1, 15.5, 0.45, 0.45, 0);
  boxCollider(2.1, 15.5, 0.45, 0.45, 0);

  // 5. 대칭 고풍 정원길 (포석길)
  // (1) 입구 ~ 분수대
  group.add(createPathSegment([0, 15], [0, 3.2], 2.8));
  // (2) 분수대 ~ 저택 현관
  group.add(createPathSegment([0, -3.2], [0, -9.5], 2.8));
  // (3) 좌우 정원 가로길
  group.add(createPathSegment([-10, 0], [10, 0], 2.2));

  // 6. 사이프러스 정원수들 (대칭 정원)
  const cypresses = [
    [-5.5, -7, 1.2], [5.5, -7, 1.2],
    [-7.5, -2, 1.3], [7.5, -2, 1.3],
    [-7.5, 3, 1.2], [7.5, 3, 1.2],
    [-5.5, 8, 1.15], [5.5, 8, 1.15],
    [-11, -8, 1.35], [11, -8, 1.35],
    [-11, 7, 1.25], [11, 7, 1.25]
  ];
  for (const [x, z, s] of cypresses) {
    place(createCypressTree(s), x, z);
    circleCollider(x, z, 0.45 * s);
  }

  // 7. 장미 꽃밭 4구획
  place(createFlowerBed(1.5, 301, 25), -4.5, -3.5);
  place(createFlowerBed(1.5, 302, 25), 4.5, -3.5);
  place(createFlowerBed(1.5, 303, 25), -4.5, 3.5);
  place(createFlowerBed(1.5, 304, 25), 4.5, 3.5);

  // 8. 앤틱 석조 벤치 2개
  const benchMat = clay(0xb8ada0);
  for (const s of [-1, 1]) {
    const bench = new THREE.Mesh(rbox(1.8, 0.5, 0.6, 0.05), benchMat);
    bench.position.set(s * 8.5, 0.25, 0);
    bench.castShadow = true;
    group.add(bench);
    boxCollider(s * 8.5, 0, 0.95, 0.35, 0);
  }

  // 스폰 위치: 정원 게이트 안쪽 (북쪽 저택을 바라봄)
  const spawnPos = new THREE.Vector3(0, 0, 12.5);

  function update(dt, isNight = false) {
    // 야간 저택 창문 불빛 & 현관등 제어
    const targetWindowEmissive = isNight ? 1.2 : 0.05;
    const targetPorchLight = isNight ? 1.6 : 0.1;

    mansion.windowLightMat.emissiveIntensity = THREE.MathUtils.lerp(
      mansion.windowLightMat.emissiveIntensity,
      targetWindowEmissive,
      dt * 3.5
    );
    mansion.porchLight.intensity = THREE.MathUtils.lerp(
      mansion.porchLight.intensity,
      targetPorchLight,
      dt * 3.5
    );
  }

  function dispose() {
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
