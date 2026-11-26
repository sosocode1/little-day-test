// LITTLE DAY 세 번째 독립 탐험 지역: 달빛 섬 (Moonlight Island)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';
import { createPathSegment } from './paths.js';
import { LIGHTHOUSE_CLUES } from '../data/lighthousePuzzle.js';

const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);
const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

// 1. 하얀 등대 제작 (Lighthouse + 정면 출입구 문 + 깨어나는 회전 불빛 연출)
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

  // 정면 아치형 오래된 등대 출입구 (기존 등대 형태를 해치지 않고 자연스럽게 부착)
  const entranceGroup = new THREE.Group();
  entranceGroup.position.set(0, 0, 2.72);
  const archFrame = new THREE.Mesh(rbox(1.55, 2.25, 0.55, 0.14), clay(0x9b9088));
  archFrame.position.y = 1.12;
  archFrame.castShadow = true;
  archFrame.receiveShadow = true;
  entranceGroup.add(archFrame);

  const doorPanel = new THREE.Mesh(rbox(1.12, 1.88, 0.24, 0.08), clay(0x6d5650));
  doorPanel.position.set(0, 1.0, 0.2);
  doorPanel.castShadow = true;
  entranceGroup.add(doorPanel);

  // 문 장식 띠 & 황동 손잡이
  const strapMat = clay(0x4b4046);
  for (const sy of [0.58, 1.38]) {
    const strap = new THREE.Mesh(rbox(1.06, 0.09, 0.06, 0.02), strapMat);
    strap.position.set(0, sy, 0.33);
    entranceGroup.add(strap);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), clay(0xe8c47a));
  knob.position.set(0.36, 0.98, 0.36);
  entranceGroup.add(knob);

  // 문 위 작은 달 문양 장식 (퍼즐 해제 시 은은하게 발광)
  const crestMat = new THREE.MeshStandardMaterial({
    color: 0xd8e5ff,
    emissive: 0x7ba8ff,
    emissiveIntensity: 0.15,
    roughness: 0.45
  });
  const crest = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 8, 18, Math.PI * 1.45), crestMat);
  crest.position.set(0, 2.02, 0.32);
  crest.rotation.z = 0.6;
  entranceGroup.add(crest);
  g.add(entranceGroup);

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
  const beaconLight = new THREE.PointLight(0xffea9f, 0.5, 28.0, 1.2);
  beaconLight.position.set(0, 9.6, 0);
  g.add(beaconLight);

  // 퍼즐 작동 시 깨어나는 등대 회전 빛줄기 (양방향 콘)
  const beaconBeamGroup = new THREE.Group();
  beaconBeamGroup.position.set(0, 9.55, 0);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xb6dcff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const beamGeo = new THREE.ConeGeometry(2.1, 14, 16, 1, true);
  for (const dir of [-1, 1]) {
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.z = dir * (Math.PI / 2);
    beam.position.x = dir * 7.2;
    beaconBeamGroup.add(beam);
  }
  g.add(beaconBeamGroup);

  // 등대 뾰족 지붕 (코랄 돔)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.4, 16), coralMat);
  roof.position.y = 11.1;
  roof.castShadow = true;
  g.add(roof);

  return { root: g, beaconLight, glassMat, crestMat, beaconBeamGroup, beamMat };
}

// 1-B. 오래된 등대의 기호 장치 (퍼즐 오브젝트)
function createLighthouseDevice() {
  const g = new THREE.Group();
  g.name = 'old_lighthouse_device';

  // 돌 받침대
  const plinth = new THREE.Mesh(cyl(0.68, 0.82, 0.32, 12), clay(0xa89f97));
  plinth.position.y = 0.16;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  g.add(plinth);

  const pillar = new THREE.Mesh(rbox(0.86, 1.05, 0.72, 0.12), clay(0xd7cec5));
  pillar.position.y = 0.78;
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  g.add(pillar);

  // 상단 경사진 문양 판
  const topSlab = new THREE.Mesh(rbox(0.96, 0.16, 0.8, 0.06), clay(0xbdb4ac));
  topSlab.position.set(0, 1.32, 0.04);
  topSlab.rotation.x = 0.28;
  topSlab.castShadow = true;
  g.add(topSlab);

  // 4개 문양 발광 타일
  const runeColors = [0x8fb2ff, 0xffd57a, 0x79d2eb, 0xd7a6ff];
  const runeMats = [];
  for (let i = 0; i < 4; i++) {
    const rm = new THREE.MeshStandardMaterial({
      color: runeColors[i],
      emissive: runeColors[i],
      emissiveIntensity: 0.32,
      roughness: 0.4
    });
    runeMats.push(rm);
    const tile = new THREE.Mesh(rbox(0.16, 0.06, 0.16, 0.025), rm);
    tile.position.set(-0.27 + i * 0.18, 0.1, 0.06);
    topSlab.add(tile);
  }

  // 회전하는 황동 다이얼 링 & 부유 구체
  const dialGroup = new THREE.Group();
  dialGroup.position.set(0, 1.72, -0.05);
  const dialRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.045, 10, 24),
    new THREE.MeshStandardMaterial({ color: 0xe6c37a, roughness: 0.35, metalness: 0.35 })
  );
  dialGroup.add(dialRing);

  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xdceaff,
    emissive: 0x7eaaff,
    emissiveIntensity: 0.65,
    roughness: 0.25
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), orbMat);
  dialGroup.add(orb);
  g.add(dialGroup);

  // 작동 시 위로 솟구치는 빛 기둥
  const surgeMat = new THREE.MeshBasicMaterial({
    color: 0xaad4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const surgeBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.38, 7.5, 14, 1, true), surgeMat);
  surgeBeam.position.set(0, 4.6, 0);
  g.add(surgeBeam);

  const deviceLight = new THREE.PointLight(0x8bb8ff, 0.45, 5.5, 1.4);
  deviceLight.position.set(0, 1.85, 0.2);
  g.add(deviceLight);

  return { root: g, dialGroup, orb, orbMat, runeMats, surgeBeam, surgeMat, deviceLight };
}

// 1-C. 숨겨진 비밀 석함 (퍼즐 완료 시 열리며 '오래된 항해 기록' 노출)
function createSecretVault() {
  const g = new THREE.Group();
  g.name = 'lighthouse_secret_vault';

  // 석함 몸체
  const boxBody = new THREE.Mesh(rbox(1.05, 0.62, 0.76, 0.1), clay(0xa79e98));
  boxBody.position.y = 0.31;
  boxBody.castShadow = true;
  boxBody.receiveShadow = true;
  g.add(boxBody);

  // 봉인 틈새 빛
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0xbad7ff,
    emissive: 0x78aaff,
    emissiveIntensity: 0.45,
    roughness: 0.3
  });
  const seam = new THREE.Mesh(rbox(0.84, 0.07, 0.79, 0.02), seamMat);
  seam.position.y = 0.56;
  g.add(seam);

  // 열리는 석함 뚜껑 (뒤쪽 경첩 피벗)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.62, -0.35);
  const lidMesh = new THREE.Mesh(rbox(1.1, 0.2, 0.8, 0.08), clay(0xbdb4ac));
  lidMesh.position.set(0, 0.1, 0.35);
  lidMesh.castShadow = true;
  lidPivot.add(lidMesh);

  const clasp = new THREE.Mesh(rbox(0.22, 0.16, 0.08, 0.03), clay(0xe4c17a));
  clasp.position.set(0, 0.02, 0.76);
  lidPivot.add(clasp);
  g.add(lidPivot);

  // 내부의 '오래된 항해 기록' 두루마리 (열린 후 미획득 시 빛나며 부유)
  const scrollGroup = new THREE.Group();
  scrollGroup.position.set(0, 0.85, 0);
  const parchment = new THREE.Mesh(cyl(0.11, 0.11, 0.52, 12), clay(0xf8e5c2));
  parchment.rotation.z = Math.PI / 2;
  scrollGroup.add(parchment);

  const ribbon = new THREE.Mesh(cyl(0.125, 0.125, 0.1, 12), clay(0x88a8f5));
  ribbon.rotation.z = Math.PI / 2;
  scrollGroup.add(ribbon);
  scrollGroup.visible = false;
  g.add(scrollGroup);

  // 비밀 석함 개방 빛 기둥 & 파티클
  const vaultBeamMat = new THREE.MeshBasicMaterial({
    color: 0xffe8a3,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const vaultBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 3.4, 14, 1, true), vaultBeamMat);
  vaultBeam.position.set(0, 2.0, 0);
  g.add(vaultBeam);

  const vaultLight = new THREE.PointLight(0xffdf8e, 0.0, 6.5, 1.3);
  vaultLight.position.set(0, 1.35, 0);
  g.add(vaultLight);

  return { root: g, lidPivot, scrollGroup, seamMat, vaultBeamMat, vaultLight };
}

// 1-D. 등대 주변 단서 3D 오브젝트 빌더
function createClueProp(clue) {
  const g = new THREE.Group();
  g.name = `lighthouse_clue_${clue.id}`;

  if (clue.propType === 'signpost') {
    const post = new THREE.Mesh(cyl(0.08, 0.1, 1.35, 8), clay(0x8c6449));
    post.position.y = 0.67;
    post.castShadow = true;
    g.add(post);

    const board = new THREE.Mesh(rbox(0.95, 0.5, 0.1, 0.04), clay(0xc79c73));
    board.position.set(0, 1.15, 0.06);
    board.rotation.z = -0.05;
    board.castShadow = true;
    g.add(board);

    const textBar1 = new THREE.Mesh(rbox(0.62, 0.05, 0.03, 0.01), clay(0x694833));
    textBar1.position.set(0, 1.22, 0.12);
    g.add(textBar1);
    const textBar2 = new THREE.Mesh(rbox(0.48, 0.05, 0.03, 0.01), clay(0x694833));
    textBar2.position.set(-0.04, 1.09, 0.12);
    g.add(textBar2);
  } else if (clue.propType === 'crate_journal') {
    const crate = new THREE.Mesh(rbox(0.86, 0.72, 0.86, 0.07), clay(0xb3845d));
    crate.position.y = 0.36;
    crate.castShadow = true;
    crate.receiveShadow = true;
    g.add(crate);

    const bookCover = new THREE.Mesh(rbox(0.46, 0.07, 0.36, 0.02), clay(0x6f5578));
    bookCover.position.set(0, 0.75, 0);
    bookCover.rotation.y = 0.25;
    g.add(bookCover);

    const page = new THREE.Mesh(rbox(0.4, 0.04, 0.3, 0.01), clay(0xfbf1da));
    page.position.set(0, 0.79, 0);
    page.rotation.y = 0.25;
    g.add(page);
  } else if (clue.propType === 'wall_tablet') {
    const tablet = new THREE.Mesh(rbox(0.85, 1.15, 0.24, 0.09), clay(0x9ea0a6));
    tablet.position.y = 0.56;
    tablet.rotation.x = -0.14;
    tablet.castShadow = true;
    tablet.receiveShadow = true;
    g.add(tablet);

    const glyphMat = new THREE.MeshStandardMaterial({
      color: 0x99e0ff,
      emissive: 0x56b6e0,
      emissiveIntensity: 0.6,
      roughness: 0.4
    });
    const glyph = new THREE.Mesh(rbox(0.45, 0.09, 0.04, 0.02), glyphMat);
    glyph.position.set(0, 0.68, 0.12);
    glyph.rotation.x = -0.14;
    g.add(glyph);
  } else {
    // driftwood_note
    const stump = new THREE.Mesh(cyl(0.32, 0.4, 0.48, 10), clay(0x9b795c));
    stump.position.y = 0.24;
    stump.castShadow = true;
    stump.receiveShadow = true;
    g.add(stump);

    const note = new THREE.Mesh(rbox(0.36, 0.03, 0.28, 0.01), clay(0xfff4d9));
    note.position.set(0, 0.5, 0);
    note.rotation.y = -0.35;
    g.add(note);

    const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), clay(0x88b4e8));
    pebble.scale.set(1.2, 0.65, 1.0);
    pebble.position.set(0.08, 0.54, 0.03);
    g.add(pebble);
  }

  // 부유 반짝임 표시기 (발견 전: 은은한 보라-달빛 / 발견 후: 차분한 민트빛)
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xd8c8ff,
    emissive: 0xa48bff,
    emissiveIntensity: 0.85,
    roughness: 0.2
  });
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), markerMat);
  marker.position.y = 1.62;
  g.add(marker);

  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xcbb8ff,
    transparent: true,
    opacity: 0.28
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), haloMat);
  halo.position.y = 1.62;
  g.add(halo);

  return { clue, root: g, marker, markerMat, halo, haloMat, discovered: false };
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
  circleCollider(0, -16, 2.95);

  // 3-B. 오래된 등대의 기호 장치 (등대 정면 오른편: x: 3.4, z: -12.8)
  const devicePos = { x: 3.4, z: -12.8 };
  const lighthouseDevice = createLighthouseDevice();
  place(lighthouseDevice.root, devicePos.x, devicePos.z, -0.32);
  circleCollider(devicePos.x, devicePos.z, 0.72);

  // 3-C. 숨겨진 비밀 석함 (등대 정면 왼편: x: -3.2, z: -12.8)
  const vaultPos = { x: -3.2, z: -12.8 };
  const secretVault = createSecretVault();
  place(secretVault.root, vaultPos.x, vaultPos.z, 0.32);
  circleCollider(vaultPos.x, vaultPos.z, 0.72);

  // 3-D. 등대 주변 조사 가능한 단서 4종 배치
  const clueProps = [];
  for (const clue of LIGHTHOUSE_CLUES) {
    const prop = createClueProp(clue);
    const rotY = Math.atan2(-clue.position.x, -clue.position.z - 6);
    place(prop.root, clue.position.x, clue.position.z, rotY);
    circleCollider(clue.position.x, clue.position.z, 0.48);
    clueProps.push(prop);
  }

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

  // 퍼즐 시각 상태 및 작동 연출 타이머
  let puzzleSolvedVisual = false;
  let rewardClaimedVisual = false;
  let celebrationTimer = 0;
  let timeAnim = 0;

  function syncPuzzleState(state = {}) {
    puzzleSolvedVisual = Boolean(state.puzzleSolved);
    rewardClaimedVisual = Boolean(state.rewardClaimed);
    const discoveredSet = new Set(Array.isArray(state.discoveredClueIds) ? state.discoveredClueIds : []);

    for (const prop of clueProps) {
      prop.discovered = discoveredSet.has(prop.clue.id);
      if (prop.discovered) {
        prop.markerMat.color.setHex(0xbef2d4);
        prop.markerMat.emissive.setHex(0x63c792);
        prop.markerMat.emissiveIntensity = 0.45;
        prop.haloMat.color.setHex(0x9ce3bc);
        prop.haloMat.opacity = 0.16;
      } else {
        prop.markerMat.color.setHex(0xd8c8ff);
        prop.markerMat.emissive.setHex(0xa48bff);
        prop.markerMat.emissiveIntensity = 0.85;
        prop.haloMat.color.setHex(0xcbb8ff);
        prop.haloMat.opacity = 0.28;
      }
    }

    // 비밀 석함 두루마리 노출 여부
    secretVault.scrollGroup.visible = puzzleSolvedVisual && !rewardClaimedVisual;
  }

  function triggerSolveCelebration() {
    puzzleSolvedVisual = true;
    celebrationTimer = 3.4;
    secretVault.scrollGroup.visible = !rewardClaimedVisual;
  }

  function update(dt, isNight = false) {
    timeAnim += dt;
    if (celebrationTimer > 0) {
      celebrationTimer = Math.max(0, celebrationTimer - dt);
    }

    const boost = celebrationTimer > 0 ? Math.sin((celebrationTimer / 3.4) * Math.PI) : 0;

    // (1) 등대 야간 조명 및 퍼즐 작동 후 푸른 달빛 비콘 회전
    const targetBeacon = puzzleSolvedVisual ? (isNight ? 3.8 : 2.1) + boost * 3.0 : isNight ? 2.2 : 0.2;
    lighthouse.beaconLight.intensity = THREE.MathUtils.lerp(
      lighthouse.beaconLight.intensity,
      targetBeacon,
      dt * 3.2
    );
    lighthouse.beaconLight.color.lerp(
      new THREE.Color(puzzleSolvedVisual ? 0xaad4ff : 0xffea9f),
      dt * 2.5
    );
    lighthouse.glassMat.emissive.lerp(
      new THREE.Color(puzzleSolvedVisual ? 0x8ec8ff : 0xffd97d),
      dt * 2.5
    );
    lighthouse.glassMat.emissiveIntensity = THREE.MathUtils.lerp(
      lighthouse.glassMat.emissiveIntensity,
      puzzleSolvedVisual ? 2.1 + boost * 1.4 : isNight ? 1.4 : 0.3,
      dt * 3.2
    );
    lighthouse.crestMat.emissiveIntensity = THREE.MathUtils.lerp(
      lighthouse.crestMat.emissiveIntensity,
      puzzleSolvedVisual ? 1.3 : 0.18,
      dt * 3.0
    );

    // 등대 회전 빛줄기
    lighthouse.beaconBeamGroup.rotation.y += dt * (puzzleSolvedVisual ? 0.65 + boost * 1.6 : 0.2);
    lighthouse.beamMat.opacity = THREE.MathUtils.lerp(
      lighthouse.beamMat.opacity,
      puzzleSolvedVisual ? (isNight ? 0.24 : 0.14) + boost * 0.18 : 0,
      dt * 3.0
    );

    // (2) 오래된 등대 장치 애니메이션 (다이얼 회전 + 룬 발광 + 작동 시 빛 기둥)
    const spinSpeed = puzzleSolvedVisual ? 1.8 + boost * 4.5 : 0.55;
    lighthouseDevice.dialGroup.rotation.y += dt * spinSpeed;
    lighthouseDevice.dialGroup.position.y = 1.72 + Math.sin(timeAnim * 2.2) * 0.05;
    lighthouseDevice.orbMat.emissiveIntensity = THREE.MathUtils.lerp(
      lighthouseDevice.orbMat.emissiveIntensity,
      puzzleSolvedVisual ? 1.8 + boost * 1.6 : 0.6 + Math.sin(timeAnim * 2.8) * 0.2,
      dt * 4.0
    );
    lighthouseDevice.deviceLight.intensity = THREE.MathUtils.lerp(
      lighthouseDevice.deviceLight.intensity,
      puzzleSolvedVisual ? 1.8 + boost * 2.2 : 0.45,
      dt * 3.5
    );
    lighthouseDevice.surgeMat.opacity = THREE.MathUtils.lerp(
      lighthouseDevice.surgeMat.opacity,
      boost * 0.42,
      dt * 6.0
    );
    lighthouseDevice.runeMats.forEach((rm, idx) => {
      const targetIntensity = puzzleSolvedVisual
        ? 1.35 + Math.sin(timeAnim * 4 + idx) * 0.25
        : 0.28 + Math.sin(timeAnim * 2.4 + idx * 1.1) * 0.12;
      rm.emissiveIntensity = THREE.MathUtils.lerp(rm.emissiveIntensity, targetIntensity, dt * 4.0);
    });

    // (3) 숨겨진 비밀 석함 뚜껑 개방 및 항해 기록 부유 애니메이션
    const targetLidRot = puzzleSolvedVisual ? -1.78 : 0;
    secretVault.lidPivot.rotation.x = THREE.MathUtils.lerp(
      secretVault.lidPivot.rotation.x,
      targetLidRot,
      dt * 3.5
    );
    const vaultHasUnclaimedReward = puzzleSolvedVisual && !rewardClaimedVisual;
    secretVault.scrollGroup.visible = vaultHasUnclaimedReward;
    if (vaultHasUnclaimedReward) {
      secretVault.scrollGroup.position.y = 0.92 + Math.sin(timeAnim * 2.8) * 0.09;
      secretVault.scrollGroup.rotation.y += dt * 1.1;
    }
    secretVault.vaultBeamMat.opacity = THREE.MathUtils.lerp(
      secretVault.vaultBeamMat.opacity,
      vaultHasUnclaimedReward ? 0.22 + Math.sin(timeAnim * 3.2) * 0.06 : 0,
      dt * 3.5
    );
    secretVault.vaultLight.intensity = THREE.MathUtils.lerp(
      secretVault.vaultLight.intensity,
      vaultHasUnclaimedReward ? 2.1 : puzzleSolvedVisual ? 0.4 : 0.0,
      dt * 3.5
    );

    // (4) 단서 오브젝트 반짝임 부유 애니메이션
    for (let i = 0; i < clueProps.length; i++) {
      const prop = clueProps[i];
      const bobY = 1.56 + Math.sin(timeAnim * 2.4 + i * 1.4) * 0.09;
      prop.marker.position.y = bobY;
      prop.marker.rotation.y += dt * (prop.discovered ? 0.8 : 1.9);
      prop.halo.position.y = bobY;
      const pulse = prop.discovered ? 0.9 : 1.0 + Math.sin(timeAnim * 3.5 + i) * 0.14;
      prop.halo.scale.setScalar(pulse);
    }

    // (5) 부두 랜턴
    pier.lanternLight.intensity = THREE.MathUtils.lerp(
      pier.lanternLight.intensity,
      isNight ? 1.4 : 0,
      dt * 3.0
    );

    // (6) 해안 반딧불이 애니메이션
    const targetFlyOp = isNight ? 0.8 : puzzleSolvedVisual ? 0.35 : 0;
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

  const interactables = {
    lighthouseCenter: { x: 0, z: -16 },
    approachRadius: 10.5,
    entrance: { x: 0, z: -12.6, radius: 2.3 },
    device: { x: devicePos.x, z: devicePos.z, radius: 2.3 },
    vault: { x: vaultPos.x, z: vaultPos.z, radius: 2.3 },
    clues: LIGHTHOUSE_CLUES
  };

  return {
    group,
    colliders,
    boundaryRadius: BOUNDARY_RADIUS,
    spawnPos,
    interactables,
    syncPuzzleState,
    triggerSolveCelebration,
    update,
    dispose
  };
}
