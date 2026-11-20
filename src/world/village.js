import * as THREE from 'three';
import { createTerrain } from './terrain.js';
import { createPlaza, createPathSegment } from './paths.js';
import { createHouse, houseCollider } from './buildings.js';
import { createTree, createBush, createFlowerBed, createForest, createHedgeRing } from './plants.js';
import { createLamp, createBench, createFountain, createGate, createSign } from './props.js';
import { createNPC } from '../character/npc.js';
import { createRng } from './materials.js';

// 맵 크기
export const VILLAGE_RADIUS = 26; // 마을 잔디 영역
export const BOUNDARY_RADIUS = 23.2; // 플레이어가 이동 가능한 최대 반경
const PLAZA_RADIUS = 6;

// 오브젝트 팩토리 레지스트리: 나중에 GLB 로더 함수로 교체하면 배치/충돌 코드는 그대로 쓸 수 있다.
//   예) assetFactories.house = (opts) => cloneGlb('house.glb', opts)
export const assetFactories = {
  house: createHouse,
  tree: createTree,
  bush: createBush,
  flowerBed: createFlowerBed,
  lamp: createLamp,
  bench: createBench,
  fountain: createFountain,
  gate: createGate,
  sign: createSign,
};

// 마을 레이아웃. 좌표: x = 동(+), z = 남(+). 입구는 남쪽(+z), 플레이어 시작 위치도 남쪽.
export function createVillage() {
  const group = new THREE.Group();
  group.name = 'village';
  const colliders = [];
  const f = assetFactories;

  const place = (obj, x, z, rotY = 0) => {
    obj.position.set(x, 0, z);
    obj.rotation.y = rotY;
    group.add(obj);
    return obj;
  };
  const circle = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
  const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

  // ----- 지형 / 경계 -----
  group.add(createTerrain({ villageRadius: VILLAGE_RADIUS, outerRadius: 90 }));
  group.add(createHedgeRing(24.4));

  // 바깥 숲 (입구 도로는 비워 둔다)
  const rng = createRng(11);
  const forestPos = [];
  for (let i = 0; i < 110; i++) {
    const a = rng() * Math.PI * 2;
    const r = 27.5 + rng() * 16;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (z > 0 && Math.abs(x) < 5) continue;
    forestPos.push([x, z]);
  }
  group.add(createForest(forestPos));

  // ----- 광장 -----
  group.add(createPlaza(PLAZA_RADIUS));
  place(f.fountain(), 0, 0);
  circle(0, 0, 1.75);
  for (const [x, z] of [[3.9, 3.9], [-3.9, 3.9], [3.9, -3.9], [-3.9, -3.9]]) {
    place(f.lamp(), x, z);
    circle(x, z, 0.2);
  }

  // ----- 집 3채 (모두 광장을 향한다) -----
  const houses = [
    { id: 'player-cottage', x: -13, z: -8, opts: { wall: 0xcfeedd, roof: 0xffc2d4, door: 0xf0a8b8, isPlayerHouse: true } },
    { id: 'villager-a', x: 13, z: -9, opts: { wall: 0xffdcc8, roof: 0xb7d5f5, door: 0x9fc7ea } },
    { id: 'villager-b', x: 14.5, z: 8, opts: { wall: 0xfff0b8, roof: 0xe3c7f0, door: 0xc9a7dc } },
  ];
  const doorFronts = {};
  for (const h of houses) {
    const rot = faceTo(h.x, h.z, 0, 0);
    const house = place(f.house(h.opts), h.x, h.z, rot);
    house.name = h.id;
    colliders.push(houseCollider(h.x, h.z, rot));
    // 현관 앞 지점 (길의 시작점)
    const front = 2.2 + 1.3;
    doorFronts[h.id] = [h.x + Math.sin(rot) * front, h.z + Math.cos(rot) * front];
  }

  // ----- 길 -----
  const dist = (p) => Math.hypot(p[0], p[1]);
  group.add(createPathSegment([0, 26], [0, PLAZA_RADIUS - 0.5], 3.2)); // 입구 ~ 광장
  group.add(createPathSegment([0, -(PLAZA_RADIUS - 0.5)], [0, -19], 2.6)); // 북쪽 산책로
  group.add(createPathSegment([0, -18], [-3.8, -20.5], 2.0)); // 북쪽 산책로 ~ 속삭이는 숲 입구
  for (const p of Object.values(doorFronts)) {
    const k = (PLAZA_RADIUS - 0.5) / dist(p);
    group.add(createPathSegment([p[0] * k, p[1] * k], p, 2));
  }

  // ----- 입구 -----
  place(f.gate(2.5), 0, 22);
  colliders.push({ type: 'box', x: -2.5, z: 22, hw: 0.45, hd: 0.45, rot: 0 });
  colliders.push({ type: 'box', x: 2.5, z: 22, hw: 0.45, hd: 0.45, rot: 0 });
  for (const [x, z] of [[-2.4, 13], [2.4, 13], [-2.4, 18], [2.4, 18]]) {
    place(f.lamp(), x, z);
    circle(x, z, 0.2);
  }

  // ----- 산책로 (북쪽): 벤치 + 가로등 + 끝의 벚나무 -----
  for (const s of [-1, 1]) {
    place(f.bench(), s * 2.4, -10, s < 0 ? Math.PI / 2 : -Math.PI / 2);
    colliders.push({ type: 'box', x: s * 2.4, z: -10, hw: 0.4, hd: 0.9, rot: 0 });
    place(f.lamp(), s * 2, -15);
    circle(s * 2, -15, 0.2);
  }
  place(f.tree('cherry', 1.5), 0, -21.5);
  circle(0, -21.5, 0.7);

  // ----- 꽃밭과 정원 -----
  const beds = [
    [-5, 9, 1.4], [5, 9, 1.4], // 입구 쪽
    [-15, -3.5, 1.6], [-8.5, -12.5, 1.4], // 별장 정원
    [17.5, -3.5, 1.5], [9, -14, 1.3], // 이웃집 정원
    [10, 14.5, 1.3], [-9, 4, 1.2],
  ];
  beds.forEach(([x, z, r], i) => {
    place(f.flowerBed(r, 100 + i), x, z);
    circle(x, z, r * 0.9);
  });
  for (const [x, z, s] of [[-17.5, -5.5, 1], [-17.5, -11, 1.1], [-8, -9.5, 0.9], [18, 14, 1], [18.5, -9, 1]]) {
    place(f.bush(s), x, z);
    circle(x, z, 0.6 * s);
  }
  place(f.sign(), -8.6, -3.0, faceTo(-8.6, -3.0, 0, 0));
  circle(-8.6, -3.0, 0.2);

  // ----- 마을 나무 -----
  const trees = [
    ['round', -20, -3, 1.1], ['round', -18, 6, 1], ['cherry', -10, 14, 1.2], ['round', 10, 18, 1],
    ['pine', 19.5, 0, 1.1], ['round', 20, -15, 1.1], ['pine', -19, -15, 1.1], ['round', -6, -19, 1],
    ['cherry', 7, -19, 1.2], ['round', -15, 17, 1], ['round', 17, 17, 1], ['pine', -21, 11, 1.1],
    ['pine', 21, 9, 1], ['cherry', -7, 17, 1.1],
  ];
  for (const [type, x, z, s] of trees) {
    place(f.tree(type, s), x, z);
    circle(x, z, 0.5 * s);
  }

  // ----- 마을 주민 (NPC) -----
  const rabbitNPC = createNPC('rabbit', -4.2, 0.8, Math.PI * 0.4);
  const foxNPC = createNPC('fox', 4.2, -0.8, -Math.PI * 0.4);
  group.add(rabbitNPC.root, foxNPC.root);
  colliders.push(rabbitNPC.collider, foxNPC.collider);
  const npcs = [rabbitNPC, foxNPC];

  // 플레이어 별장 현관 입장 트리거 위치
  const cottageRot = faceTo(-13, -8, 0, 0);
  const cottageEntrance = {
    x: -13 + Math.sin(cottageRot) * 2.65,
    z: -8 + Math.cos(cottageRot) * 2.65,
    radius: 1.8,
    returnPos: new THREE.Vector3(
      -13 + Math.sin(cottageRot) * 3.4,
      0,
      -8 + Math.cos(cottageRot) * 3.4
    ),
    returnYaw: cottageRot + Math.PI // 광장을 바라보는 각도
  };

  // 속삭이는 숲 (Whispering Forest) 입구 아치 및 입장 트리거 (북쪽 산책로 좌측)
  const forestGate = f.gate(1.5);
  place(forestGate, -3.8, -20.5, Math.PI * 0.1);
  colliders.push({ type: 'box', x: -3.8 - 1.5, z: -20.5, hw: 0.35, hd: 0.35, rot: 0 });
  colliders.push({ type: 'box', x: -3.8 + 1.5, z: -20.5, hw: 0.35, hd: 0.35, rot: 0 });

  // 숲 안내 표지판
  place(f.sign(0x9bd7ae), -5.5, -19.5, Math.PI * 0.25);
  circle(-5.5, -19.5, 0.2);

  const forestEntrance = {
    x: -3.8,
    z: -20.5,
    radius: 1.8,
    returnPos: new THREE.Vector3(-3.8, 0, -16.2),
    returnYaw: 0 // 카메라가 플레이어 남쪽(광장 쪽)에서 입구 아치를 바라봄 (안내판이 시야를 가리지 않음)
  };

  // ----- 부두 (섬 이동용 배 + 선착장) : 서쪽 연못 항구 -----
  group.add(createPathSegment([-1.5, 19.2], [-6.5, 19.2], 2)); // 입구 도로 ~ 부두
  const dock = createDock(group, colliders);

  return {
    group,
    colliders,
    spawn: new THREE.Vector3(0, 0, 18),
    houses,
    npcs,
    doorFronts,
    cottageEntrance,
    forestEntrance,
    dock
  };
}

// 서쪽 항구: 연못 + 나무 선착장 + 작은 클레이풍 돛단배. 플레이어는 선착장 끝에서 E키로 승선한다.
const DOCK_POND = { x: -11, z: 19.2, r: 2.2 };

function createDock(group, colliders) {
  const dockGroup = new THREE.Group();
  dockGroup.name = 'village-dock';
  const { x: px, z: pz, r } = DOCK_POND;
  const mat = (color, opts = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...opts });

  // 물
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.08, 36),
    mat(0x7fd0e8, { roughness: 0.35, transparent: true, opacity: 0.92 })
  );
  water.position.set(px, 0.04, pz);
  dockGroup.add(water);

  // 연못 가장자리 돌 (선착장이 닿는 동쪽 입구는 비워 둔다)
  const stoneMat = mat(0xd9d2c8);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.42) continue; // 동쪽(+x) 입구
    const sx = px + Math.cos(a) * (r + 0.25);
    const sz = pz + Math.sin(a) * (r + 0.25);
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), stoneMat);
    stone.position.set(sx, 0.2, sz);
    stone.scale.y = 0.7;
    stone.rotation.y = i;
    dockGroup.add(stone);
    colliders.push({ type: 'circle', x: sx, z: sz, r: 0.5 });
  }
  // 입구 양옆 물가 보호 콜라이더 (선착장 폭만 통과)
  for (const dz of [-1.35, 1.35]) {
    colliders.push({ type: 'box', x: px + r - 1.8, z: pz + dz, hw: 2.2, hd: 0.3, rot: 0 });
  }
  colliders.push({ type: 'box', x: px - 0.2, z: pz, hw: 0.3, hd: 1.4, rot: 0 }); // 선착장 끝 막음

  // 선착장 판자 (x: -13.5 ~ -18.6)
  const woodMat = mat(0xd9a56e);
  const darkWood = mat(0xa8744a);
  const startX = -6.5;
  const endX = px + 0.9;
  for (let x = startX; x >= endX; x -= 0.55) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 2.0), woodMat);
    plank.position.set(x, 0.16, pz);
    dockGroup.add(plank);
  }
  for (let x = startX; x >= endX; x -= 1.7) {
    for (const dz of [-0.95, 0.95]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 8), darkWood);
      post.position.set(x, 0.3, pz + dz);
      dockGroup.add(post);
    }
  }

  // 배 (선착장 끝 오른쪽 물 위)
  const boat = new THREE.Group();
  boat.name = 'village-boat';
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1.2), mat(0xff98b2));
  hull.position.y = 0.25;
  const hullTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.9), mat(0xffd6e2));
  hullTop.position.y = 0.55;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.9, 8), darkWood);
  mast.position.set(-0.1, 1.45, 0);
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.lineTo(1.0, 0);
  sailShape.lineTo(0, 1.5);
  const sail = new THREE.Mesh(
    new THREE.ShapeGeometry(sailShape),
    mat(0xfff7e8, { side: THREE.DoubleSide })
  );
  sail.position.set(0, 1.0, 0);
  sail.rotation.y = Math.PI / 2;
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 3), mat(0x5dade2));
  flag.position.set(-0.1, 2.5, 0);
  flag.rotation.z = Math.PI / 2;
  boat.add(hull, hullTop, mast, sail, flag);
  boat.position.set(px - 1.4, 0.05, pz + 0.2);
  dockGroup.add(boat);
  colliders.push({ type: 'circle', x: px - 1.4, z: pz + 0.2, r: 1.2 });

  // 부두 표지판
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.08), mat(0xfff0d6));
  sign.position.set(startX + 0.6, 1.2, pz - 1.4);
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), darkWood);
  signPost.position.set(startX + 0.6, 0.55, pz - 1.4);
  dockGroup.add(sign, signPost);

  group.add(dockGroup);

  return {
    x: px + 0.6,
    z: pz,
    radius: 3.0,
    prompt: '배를 타고 섬으로 떠나기 ⛵',
    // 섬에서 돌아왔을 때 도착 위치 (선착장 입구, 동쪽 육지를 바라봄)
    returnPos: new THREE.Vector3(startX + 0.3, 0.16, pz),
    returnYaw: -Math.PI / 2,
    boat
  };
}
