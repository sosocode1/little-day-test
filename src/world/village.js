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
    returnPos: new THREE.Vector3(-3.8, 0, -18.8),
    returnYaw: Math.PI // 마을 광장을 바라보는 각도
  };

  return {
    group,
    colliders,
    spawn: new THREE.Vector3(0, 0, 18),
    houses,
    npcs,
    doorFronts,
    cottageEntrance,
    forestEntrance
  };
}
