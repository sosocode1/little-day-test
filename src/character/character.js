import * as THREE from 'three';
import { createFaceTextureSet } from './faceTexture.js';
import { buildClayHair, buildKnitBeret } from './hairBuilder.js';
import {
  getCableKnitTextures,
  getPlaidSkirtTexture,
  getRibbedSockTextures,
} from './clayTextures.js';

// LITTLE DAY 메인 캐릭터 (첨부 디자인 시트 기준 고퀄리티 3D 클레이 스타일, 키 ~1.50m)
// - 기본 모델: 긴 초콜릿 브라운 웨이브 헤어 + 크림색 니트 베레모 + 크림 케이블 니트 가디건
//   + 브라운 리본/단추 + 브라운 타탄 체크 플리츠 스커트 + 꽃 장식 브라운 크로스백
//   + 크림 골지 니삭스 + 브라운 레이스업 부츠
// - 목 변형 없는 안정적인 호흡(Idle) 및 Walk 애니메이션
// - 기존 외부 API 시그니처 100% 호환 + 디자인 시트 커스터마이징 확장 지원
export const CHARACTER_PRESETS = {
  female: {
    skin: 0xffe4d2,       // 부드러운 복숭아 크림 피부
    hair: 0x6b4432,       // 짙은 초콜릿 브라운
    hairAccent: 0x7c513c, // 부드러운 웨이브 입체 톤
    eyeColor: 0x523225,   // 크고 깊은 짙은 갈색 눈동자
    eyeStyle: 'round',    // 'round' | 'upturned' | 'dewy'
    expression: 'smile',  // 'smile' | 'happy' | 'excited' | 'surprised' | 'thinking' | 'sleepy'
    hairStyle: 'longWave', // 'longWave' | 'shortBob' | 'twinBraids' | 'topBun'
    outfit: 'daily',      // 'daily' (기본 시트 의상) | 'dress' | 'pants'
    hatVisible: true,     // 기본 크림색 니트 베레모 착용
    bagVisible: true,     // 기본 꽃 장식 브라운 크로스백 착용
    beret: 0xf0e0ca,      // 크림색 니트 베레모
    top: 0xf3e4cd,        // 크림색 니트 가디건
    blouse: 0xf8f0e4,     // 이너 크림 블라우스
    bottom: 0x6c423b,     // 브라운 타탄 체크 스커트
    trim: 0xf4e8d8,       // 크림색 니삭스/레이스
    accent: 0x6b4535,     // 브라운 리본/단추
    bag: 0x7b5139,        // 짙은 브라운 가죽 크로스백
    shoes: 0x6b4634,      // 브라운 레이스업 부츠
    sole: 0x4b2f23,       // 부츠 진한 브라운 밑창
    lashes: true,
  },
  male: {
    skin: 0xffe4d2,
    hair: 0x5d3d2e,
    hairAccent: 0x6e4a38,
    eyeColor: 0x4c3024,
    eyeStyle: 'round',
    expression: 'smile',
    hairStyle: 'shortBob',
    outfit: 'pants',
    hatVisible: false,
    bagVisible: false,
    beret: 0xf0e0ca,
    top: 0xa9d3ff,
    blouse: 0xf8f0e4,
    bottom: 0x6f7fb0,
    trim: 0xf4e8d8,
    accent: 0x6b4535,
    bag: 0x7b5139,
    shoes: 0x6b4634,
    sole: 0x4b2f23,
    lashes: false,
  },
};

// ---------- 매트 클레이 재질 캐시 (플라스틱 광택 금지, roughness 0.88~0.92) ----------
const clayMaterials = new Map();
function clayMat(color, opts = {}) {
  const ds = Boolean(opts.doubleSide);
  const rough = opts.roughness ?? 0.89;
  const key = `${color}_${ds ? 'ds' : 'fs'}_${rough}`;
  if (!clayMaterials.has(key)) {
    clayMaterials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: rough,
        metalness: 0.0,
        side: ds ? THREE.DoubleSide : THREE.FrontSide,
      })
    );
  }
  return clayMaterials.get(key);
}

const unitSphereGeo = new THREE.SphereGeometry(1, 20, 16);

function makeMesh(geo, material, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.scale.set(...scale);
  return m;
}

// ---------- 조각 지오메트리 빌더 ----------

/**
 * 첨부 디자인 시트 기준: 통통한 볼과 부드러운 U자 턱선의 둥근 모찌 얼굴형 (단일 연속 메시)
 * - 이마에서 턱으로 갈수록 좁아지는 구면 수축을 보상해 볼~하관의 폭을 충분히 확보
 * - V자 뾰족한 턱을 완전히 제거하고 넓고 부드러운 U자형 둥근 턱선으로 마감
 * - 좌우 완벽 대칭(Math.abs(nx) 기반) 및 45°/측면에서도 포근한 아기 볼살 실루엣 유지
 */
function createSculptedHeadGeometry() {
  const geo = new THREE.SphereGeometry(1, 56, 42, -Math.PI / 2, Math.PI * 2, 0, Math.PI);
  const pos = geo.attributes.position;

  const rx = 0.286;
  const ry = 0.264;
  const rz = 0.268;

  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i);
    const ny = pos.getY(i);
    const nz = pos.getZ(i);
    const absNx = Math.abs(nx);

    // 1. 이마~볼~하관의 자연스러운 폭 비율 곡선 (이마는 아담, 볼~하관은 넓고 통통하게)
    const upperTaper = 1 - 0.045 * THREE.MathUtils.smoothstep(ny, 0.15, 0.85);
    const lowerWide = 1 + 0.145 * THREE.MathUtils.smoothstep(-ny, 0.05, 0.68);
    // U자 턱선 보정: 아래쪽(-0.55 ~ -0.92)에서도 폭이 뾰족하게 무너지지 않고 넓고 둥글게 유지
    const uJawHold = 1 + 0.085 * Math.exp(-Math.pow((ny + 0.72) / 0.24, 2));

    let x = nx * rx * upperTaper * lowerWide * uJawHold;
    let y = ny * ry;
    let z = nz * rz * (1 + 0.055 * THREE.MathUtils.smoothstep(-ny, 0.08, 0.62));

    // 2. 광대~양 볼의 포근하고 연속적인 볼살 볼륨 (정면/45도/측면 모두 부드럽게 통통)
    const cheekY = Math.exp(-Math.pow((ny + 0.34) / 0.38, 2));
    const cheekX = Math.exp(-Math.pow((absNx - 0.56) / 0.42, 2));
    const cheekZ = THREE.MathUtils.smoothstep(nz, -0.25, 0.55);
    const cheekPuff = cheekY * cheekX * cheekZ;
    x += Math.sign(nx) * cheekPuff * 0.028;
    z += cheekPuff * 0.022;

    // 3. 턱 끝 V자 방지 -> 부드럽고 완만한 U자형 바닥 마감
    if (ny < -0.68) {
      const k = (-ny - 0.68) / 0.32; // 0 -> 1
      // 바닥을 살짝 완만하게 눌러 뾰족한 끝 대신 둥글고 포근한 U자 턱선 형성
      y += Math.pow(k, 1.85) * 0.026;
    }

    // 4. 정수리 자연스러운 둥근 볼륨
    const crownMask = THREE.MathUtils.smoothstep(ny, 0.48, 1.0);
    y += crownMask * 0.006;

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * 짧고 안정적인 목 LatheGeometry (몸통 내부 y=0.845 ~ U자 턱 내부 y=0.995 깊이 결합 → 절대 틈 없음)
 */
function createNeckGeometry() {
  const pts = [
    new THREE.Vector2(0.088, 0.845),
    new THREE.Vector2(0.072, 0.885),
    new THREE.Vector2(0.062, 0.935),
    new THREE.Vector2(0.066, 0.995),
  ];
  return new THREE.LatheGeometry(pts, 24);
}

/**
 * 이너 블라우스/상체 코어 LatheGeometry (y: 0.55 ~ 0.90)
 */
function createInnerTorsoGeometry() {
  const pts = [
    new THREE.Vector2(0.001, 0.545),
    new THREE.Vector2(0.135, 0.560),
    new THREE.Vector2(0.145, 0.615),
    new THREE.Vector2(0.162, 0.725),
    new THREE.Vector2(0.158, 0.835),
    new THREE.Vector2(0.118, 0.885),
    new THREE.Vector2(0.068, 0.902),
    new THREE.Vector2(0.001, 0.905),
  ];
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.scale(1.0, 1.0, 0.88);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 첨부 시트 기준: 앞이 살짝 열린 크림색 케이블 니트 가디건 쉘 (BufferGeometry)
 * - 블라우스 위를 포근하게 감싸며 앞 중앙 V넥과 버튼 라인을 열어 입체감 표현
 */
function createCardiganShellGeometry() {
  const segsU = 44;
  const segsV = 22;
  const positions = [];
  const uvs = [];
  const indices = [];

  // 프로파일 높이 y: 0.575(밑단) ~ 0.892(어깨/목선)
  const profile = [
    { y: 0.575, r: 0.166 }, // 밑단 골지 밴드
    { y: 0.610, r: 0.175 },
    { y: 0.690, r: 0.184 },
    { y: 0.780, r: 0.184 },
    { y: 0.848, r: 0.166 },
    { y: 0.888, r: 0.115 },
  ];

  function sampleProfile(v) {
    const f = v * (profile.length - 1);
    const idx = Math.min(profile.length - 2, Math.floor(f));
    const k = f - idx;
    return {
      y: THREE.MathUtils.lerp(profile[idx].y, profile[idx + 1].y, k),
      r: THREE.MathUtils.lerp(profile[idx].r, profile[idx + 1].r, k),
    };
  }

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV; // 0 = 밑단, 1 = 어깨 상단
    const { y, r } = sampleProfile(v);

    // 앞 중앙 열림 각도: 밑단은 좁게(±16°), 위쪽 V넥으로 갈수록 자연스럽게 열림(±34°)
    const openHalfAngle = THREE.MathUtils.lerp(0.24, 0.62, Math.pow(v, 1.35));

    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      // u=0 -> 오른쪽 앞 여밈(+openHalfAngle), u=0.5 -> 등 뒤(PI), u=1 -> 왼쪽 앞 여밈(2*PI - openHalfAngle)
      const angle = openHalfAngle + u * (Math.PI * 2 - openHalfAngle * 2);

      const x = Math.sin(angle) * r;
      const z = Math.cos(angle) * r * 0.90;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = (iv + 1) * stride + iu;
      const c = (iv + 1) * stride + (iu + 1);
      const d = iv * stride + (iu + 1);
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 첨부 시트 기준: 브라운 타탄 체크 플리츠 스커트 (18개 정갈한 아코디언 주름)
 * 로컬 y: 0.01(허리) ~ -0.235(밑단, 월드 y = 0.595 ~ 0.360)
 */
function createPleatedSkirtGeometry() {
  const segsU = 72; // 18주름 x 4세그먼트
  const segsV = 12;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV; // 0 = 허리, 1 = 밑단
    const y = THREE.MathUtils.lerp(0.015, -0.235, v);
    const baseR = THREE.MathUtils.lerp(0.148, 0.252, Math.pow(v, 0.92));

    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      const angle = u * Math.PI * 2;
      // 18개의 깔끔한 플리츠 주름 (아래로 갈수록 깊어짐)
      const pleatWave = Math.sin(angle * 18);
      const pleatAmt = (0.004 + 0.014 * Math.pow(v, 1.1)) * pleatWave;
      const r = baseR + pleatAmt;

      const x = Math.sin(angle) * r;
      const z = Math.cos(angle) * r * 0.92;

      positions.push(x, y, z);
      uvs.push(u, 1 - v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = (iv + 1) * stride + iu;
      const c = (iv + 1) * stride + (iu + 1);
      const d = iv * stride + (iu + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 원피스 호환용 플레어 스커트 (옷장 원피스 아이템 착용 시 사용)
 */
function createDressSkirtGeometry() {
  const pts = [
    new THREE.Vector2(0.140, 0.015),
    new THREE.Vector2(0.152, -0.015),
    new THREE.Vector2(0.200, -0.105),
    new THREE.Vector2(0.248, -0.205),
    new THREE.Vector2(0.268, -0.265),
    new THREE.Vector2(0.256, -0.278),
  ];
  const geo = new THREE.LatheGeometry(pts, 40);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const downT = THREE.MathUtils.clamp(-y / 0.27, 0, 1);
    const pleat = 1 + Math.sin(angle * 10) * 0.032 * Math.pow(downT, 1.4);
    pos.setXYZ(i, x * pleat, y, z * pleat * 0.92);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * 크림 니트 가디건 도톰한 긴팔 상완 소매 (어깨~팔꿈치: 둥글고 자연스러운 라운드 숄더)
 */
function createUpperSleeveGeometry() {
  const pts = [
    new THREE.Vector2(0.001, 0.062),
    new THREE.Vector2(0.036, 0.056),
    new THREE.Vector2(0.058, 0.034),
    new THREE.Vector2(0.069, -0.005),
    new THREE.Vector2(0.070, -0.065),
    new THREE.Vector2(0.062, -0.124),
    new THREE.Vector2(0.048, -0.134),
  ];
  return new THREE.LatheGeometry(pts, 22);
}

/**
 * 가디건 긴팔 하완 소매 + 골지 손목 커프스 (팔꿈치~손목)
 */
function createLowerSleeveGeometry() {
  const pts = [
    new THREE.Vector2(0.058, 0.025),
    new THREE.Vector2(0.066, -0.025),
    new THREE.Vector2(0.064, -0.075),
    new THREE.Vector2(0.050, -0.105), // 오므라드는 손목 리브
    new THREE.Vector2(0.044, -0.118),
  ];
  return new THREE.LatheGeometry(pts, 20);
}

/**
 * 크림색 골지 니삭스 지오메트리 (무릎 아래~부츠 위)
 */
function createKneeSockGeometry() {
  const pts = [
    new THREE.Vector2(0.056, 0.082), // 상단 리브
    new THREE.Vector2(0.062, 0.070),
    new THREE.Vector2(0.057, 0.020),
    new THREE.Vector2(0.054, -0.040),
    new THREE.Vector2(0.052, -0.090),
  ];
  return new THREE.LatheGeometry(pts, 20);
}

/**
 * 브라운 레이스업 워커 부츠 본체 (둥글고 도톰한 앞코 + 발목 통)
 */
function createBootFootGeometry() {
  const geo = new THREE.SphereGeometry(1, 24, 18);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 0.076;
    let y = pos.getY(i) * 0.058;
    let z = pos.getZ(i) * 0.126;

    // 바닥 평탄화
    if (y < -0.028) {
      y = -0.028 + (y + 0.028) * 0.22;
    }
    // 둥글고 폭신한 부츠 앞코
    if (z > 0) {
      x *= 1 + (z / 0.126) * 0.10;
      y += Math.max(0, y) * (z / 0.126) * 0.12;
    } else {
      x *= 1 + (z / 0.126) * 0.12;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function createBootShaftGeometry() {
  const pts = [
    new THREE.Vector2(0.068, 0.00),
    new THREE.Vector2(0.066, 0.055),
    new THREE.Vector2(0.070, 0.115),
    new THREE.Vector2(0.074, 0.132), // 부츠 발목 패딩 림
    new THREE.Vector2(0.060, 0.136),
  ];
  return new THREE.LatheGeometry(pts, 22);
}

/**
 * 둥근 사첼형 크로스백 본체 지오메트리
 */
function createSatchelBagGeometry() {
  const geo = new THREE.SphereGeometry(1, 24, 18);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * 0.105;
    let y = pos.getY(i) * 0.088;
    let z = pos.getZ(i) * 0.056;
    // 위쪽 살짝 평평, 아래쪽 둥글고 도톰한 파우치 실루엣
    if (y > 0.045) {
      y = 0.045 + (y - 0.045) * 0.55;
      x *= 0.94;
    } else {
      x *= 1 + Math.max(0, -y / 0.088) * 0.08;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

const headGeo = createSculptedHeadGeometry();
const neckGeo = createNeckGeometry();
const innerTorsoGeo = createInnerTorsoGeometry();
const cardiganShellGeo = createCardiganShellGeometry();
const pleatedSkirtGeo = createPleatedSkirtGeometry();
const dressSkirtGeo = createDressSkirtGeometry();
const upperSleeveGeo = createUpperSleeveGeometry();
const lowerSleeveGeo = createLowerSleeveGeometry();
const kneeSockGeo = createKneeSockGeometry();
const bootFootGeo = createBootFootGeometry();
const bootShaftGeo = createBootShaftGeometry();
const satchelBagGeo = createSatchelBagGeometry();

const bareForearmGeo = new THREE.CapsuleGeometry(0.036, 0.075, 8, 14);
const thighGeo = new THREE.CapsuleGeometry(0.058, 0.105, 8, 16);
const shinGeo = new THREE.CapsuleGeometry(0.048, 0.100, 8, 16);

// ---------- 장식 헬퍼 (나비 리본, 작은 꽃 장식) ----------

/**
 * 첨부 시트 기준 목 아래 브라운 나비 리본 (양쪽 루프 + 매듭 + 2줄 꼬리)
 */
function buildNeckRibbon(ribbonMat, scale = 1) {
  const g = new THREE.Group();
  const knot = makeMesh(unitSphereGeo, ribbonMat, [0, 0, 0.004], [0, 0, 0], [0.017, 0.015, 0.014]);
  g.add(knot);

  for (const s of [-1, 1]) {
    // 둥근 리본 날개
    const wing = makeMesh(
      unitSphereGeo,
      ribbonMat,
      [s * 0.030, 0.005, 0],
      [0, s * -0.18, s * 0.14],
      [0.032, 0.020, 0.012]
    );
    g.add(wing);

    // 아래로 자연스럽게 내려오는 리본 꼬리
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.006, -0.005, 0.004),
      new THREE.Vector3(s * 0.014, -0.036, 0.010),
      new THREE.Vector3(s * 0.022, -0.068, 0.014),
    ]);
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 8, 0.0085, 8, false), ribbonMat);
    g.add(tail);
  }
  g.scale.setScalar(scale);
  return g;
}

/**
 * 크로스백 및 액세서리용 5잎 클레이 꽃 장식
 */
function buildClayFlower(petalColor = 0xf8efe0, centerColor = 0xf0b84c, scale = 1) {
  const g = new THREE.Group();
  const pMat = clayMat(petalColor);
  const cMat = clayMat(centerColor);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI * 0.1;
    g.add(
      makeMesh(
        unitSphereGeo,
        pMat,
        [Math.cos(a) * 0.022, Math.sin(a) * 0.022, 0],
        [0, 0, a],
        [0.018, 0.020, 0.010]
      )
    );
  }
  g.add(makeMesh(unitSphereGeo, cMat, [0, 0, 0.008], [0, 0, 0], [0.015, 0.015, 0.010]));
  g.scale.setScalar(scale);
  return g;
}

/**
 * 퀘스트 완료 보상용 클레이 달빛 브로치 장식
 */
function buildClayBrooch(mainColor = 0xa8c8ff, goldColor = 0xffe680, scale = 1.45) {
  const g = new THREE.Group();
  const mMat = clayMat(goldColor, { roughness: 0.65 });
  const gemMat = clayMat(mainColor, { roughness: 0.5 });
  const starMat = clayMat(0xfff6cf, { roughness: 0.4 });

  // 달 형태: 클레이 구체들을 초승달 호를 따라 배치
  const points = 7;
  for (let i = 0; i < points; i++) {
    const t = (i / (points - 1)) * Math.PI * 0.85 - Math.PI * 0.42;
    const r = 0.025;
    const x = Math.cos(t) * r - 0.010;
    const y = Math.sin(t) * r;
    const scaleVal = 0.012 * Math.cos(t * 0.95);
    g.add(makeMesh(unitSphereGeo, mMat, [x, y, 0], [0, 0, 0], [scaleVal, scaleVal, scaleVal * 1.3]));
  }
  // 중앙 보석
  g.add(makeMesh(unitSphereGeo, gemMat, [0.006, 0.002, 0.008], [0, 0, 0], [0.011, 0.011, 0.009]));
  // 작은 별 장식
  g.add(makeMesh(unitSphereGeo, starMat, [0.016, 0.012, 0.005], [0, 0, 0], [0.006, 0.006, 0.006]));
  g.scale.setScalar(scale);
  return g;
}

/**
 * 첨부 시트 기준: 짙은 브라운 크로스백 + 대각선 가죽 스트랩 + 작은 꽃 장식 2개
 */
function buildCrossbodyBag(bagColor = 0x7b5139) {
  const group = new THREE.Group();
  group.name = 'defaultCrossbodyBag';

  const leatherMat = clayMat(bagColor, { roughness: 0.84 });
  const strapMat = clayMat(0x8a5d42, { roughness: 0.85 });
  const flapMat = clayMat(0x885c42, { roughness: 0.84 });
  const metalMat = clayMat(0xdcb46a, { roughness: 0.55 });

  // 1. 대각선 가죽 스트랩 (어깨/가디건 위를 클리핑 없이 매끈하게 감싸고 가방 D링에 정확히 연결)
  const strapCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.118, 0.896, 0.082),   // 오른쪽 어깨 앞
      new THREE.Vector3(0.025, 0.765, 0.194),   // 가슴 중앙 대각선 (가디건 바깥 여유)
      new THREE.Vector3(-0.105, 0.625, 0.198),  // 허리 앞쪽
      new THREE.Vector3(-0.178, 0.520, 0.160),  // 가방 우측(앞쪽) 고리 정확 연결
      new THREE.Vector3(-0.228, 0.495, 0.045),  // 가방 좌측(바깥) 고리 정확 연결
      new THREE.Vector3(-0.155, 0.615, -0.185), // 등 아래 대각선
      new THREE.Vector3(0.008, 0.770, -0.186),  // 등 중앙
      new THREE.Vector3(0.112, 0.892, -0.088),  // 오른쪽 어깨 뒤
    ],
    true
  );
  const strapGeo = new THREE.TubeGeometry(strapCurve, 48, 0.013, 8, true);
  const strap = new THREE.Mesh(strapGeo, strapMat);
  group.add(strap);

  // 2. 사첼 가방 본체 (치마와 간섭 없이 화면 왼쪽 옆구리에 자연스럽게 안착)
  const pouch = new THREE.Group();
  pouch.name = 'bagPouch';
  pouch.position.set(-0.205, 0.452, 0.112);
  pouch.rotation.set(0.06, -0.52, -0.12);

  const bodyMesh = new THREE.Mesh(satchelBagGeo, leatherMat);
  pouch.add(bodyMesh);

  // 앞 덮개(플랩)
  const flap = makeMesh(unitSphereGeo, flapMat, [0, 0.032, 0.020], [0.18, 0, 0], [0.104, 0.056, 0.048]);
  pouch.add(flap);

  // 양쪽 금속 D링 연결 고리 (스트랩 진입 지점에 정확히 정렬)
  for (const s of [-1, 1]) {
    const ring = makeMesh(
      new THREE.TorusGeometry(0.015, 0.0045, 8, 14),
      metalMat,
      [s * 0.072, 0.064, 0.004],
      [0, Math.PI * 0.5, 0]
    );
    pouch.add(ring);
  }

  // 첨부 시트 시그니처: 가방 앞면 크림색 작은 꽃 장식 2개 (큰 꽃 + 작은 꽃)
  const bigFlower = buildClayFlower(0xf8f0e2, 0xf2ba54, 1.32);
  bigFlower.position.set(-0.015, -0.012, 0.060);
  bigFlower.rotation.set(0.05, -0.08, 0.12);
  pouch.add(bigFlower);

  const smallFlower = buildClayFlower(0xf8f0e2, 0xf2ba54, 0.86);
  smallFlower.position.set(0.055, 0.030, 0.058);
  smallFlower.rotation.set(-0.08, 0.15, -0.2);
  pouch.add(smallFlower);

  group.add(pouch);
  return group;
}

// ---------- 머리 빌더 ----------
function buildHead(preset, faceTextures) {
  const head = new THREE.Group();
  head.name = 'head';

  // 1. CanvasTexture가 매핑된 매끈한 클레이 두상
  const headMat = new THREE.MeshStandardMaterial({
    map: faceTextures.open,
    roughness: 0.90,
    metalness: 0.0,
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.name = 'headBase';
  head.add(headMesh);

  // 2. 얼굴 보조 (작고 귀여운 코 + 동글동글한 귀 2개)
  const face = new THREE.Group();
  face.name = 'face';

  const skinMat = clayMat(preset.skin);
  const nose = makeMesh(unitSphereGeo, skinMat, [0, -0.062, 0.278], [0, 0, 0], [0.014, 0.010, 0.010]);
  nose.name = 'nose';
  face.add(nose);

  const ears = [];
  const earInnerMat = clayMat(0xf4c2b6);
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.name = s < 0 ? 'earL' : 'earR';
    ear.position.set(s * 0.304, -0.048, -0.014);
    const outer = makeMesh(unitSphereGeo, skinMat, [0, 0, 0], [0, 0, s * -0.10], [0.038, 0.048, 0.030]);
    const inner = makeMesh(unitSphereGeo, earInnerMat, [s * 0.005, -0.002, 0.017], [0, 0, 0], [0.019, 0.026, 0.011]);
    ear.add(outer, inner);
    face.add(ear);
    ears.push(outer);
  }
  head.add(face);

  // 3. 첨부 디자인 시트 기준 긴 웨이브 헤어 (기본)
  const hair = buildClayHair(preset, clayMat);
  head.add(hair);

  // 4. 첨부 디자인 시트 기준 크림색 니트 베레모 (기본 착용, 토글/교체 가능)
  const defaultHat = buildKnitBeret(preset.beret);
  defaultHat.visible = Boolean(preset.hatVisible);
  head.add(defaultHat);

  return { group: head, headMesh, headMat, face, nose, ears, hair, defaultHat };
}

// ---------- 몸통 & 기본 의상(가디건+체크스커트+크로스백) + 호환 의상(원피스/멜빵) ----------
function buildTorso(preset) {
  const body = new THREE.Group();
  body.name = 'torso';

  // 1. 짧고 단단하게 연결된 목 (절대 늘어나지 않음)
  const neck = new THREE.Mesh(neckGeo, clayMat(preset.skin));
  neck.name = 'neck';
  body.add(neck);

  // 2. 이너 크림 블라우스 상체 코어
  const chest = new THREE.Mesh(innerTorsoGeo, clayMat(preset.blouse));
  chest.name = 'chest';
  body.add(chest);

  // 3. 둥근 크림 칼라 (목과 의상 경계를 매끈하게 연결)
  const collarGroup = new THREE.Group();
  collarGroup.name = 'collar';
  const collarMat = clayMat(preset.blouse);
  const collarRing = makeMesh(
    new THREE.TorusGeometry(0.088, 0.018, 10, 24),
    collarMat,
    [0, 0.885, 0.004],
    [Math.PI * 0.5 + 0.08, 0, 0],
    [1.06, 0.94, 1.0]
  );
  collarGroup.add(collarRing);

  const collarFlaps = [];
  for (const s of [-1, 1]) {
    const flap = makeMesh(
      unitSphereGeo,
      collarMat,
      [s * 0.048, 0.868, 0.082],
      [0.36, s * 0.32, s * -0.16],
      [0.056, 0.015, 0.042]
    );
    collarGroup.add(flap);
    collarFlaps.push(flap);
  }
  body.add(collarGroup);

  // ========================================================
  // [A] 첨부 디자인 시트 기본 데일리룩 그룹 (가디건 + 체크 스커트 + 리본 + 단추 + 크로스백)
  // ========================================================
  const dailyGroup = new THREE.Group();
  dailyGroup.name = 'dailyOutfitGroup';

  const knitTex = getCableKnitTextures(preset.top);
  const cardiganMat = new THREE.MeshStandardMaterial({
    map: knitTex.map,
    bumpMap: knitTex.bumpMap,
    bumpScale: 0.012,
    roughness: 0.91,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const cardiganEdgeMat = clayMat(0xecd9be, { roughness: 0.92 });
  const buttonMat = clayMat(0x9a6d4d, { roughness: 0.82 });

  // (1) 케이블 니트 가디건 쉘
  const cardiganMesh = new THREE.Mesh(cardiganShellGeo, cardiganMat);
  cardiganMesh.name = 'cardiganShell';
  dailyGroup.add(cardiganMesh);

  // 가디건 밑단 골지 밴드 (양옆~등 뒤)
  const hemCurvePts = [];
  for (let i = 0; i <= 24; i++) {
    const a = 0.25 + (i / 24) * (Math.PI * 2 - 0.50);
    hemCurvePts.push(new THREE.Vector3(Math.sin(a) * 0.168, 0.580, Math.cos(a) * 0.168 * 0.90));
  }
  const hemBand = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hemCurvePts), 28, 0.016, 8, false),
    cardiganEdgeMat
  );
  dailyGroup.add(hemBand);

  // 앞 여밈 플래킷 2줄 (V넥 -> 밑단)
  for (const s of [-1, 1]) {
    const placketCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.068, 0.882, 0.095),
      new THREE.Vector3(s * 0.060, 0.785, 0.154),
      new THREE.Vector3(s * 0.044, 0.680, 0.162),
      new THREE.Vector3(s * 0.040, 0.580, 0.152),
    ]);
    const placket = new THREE.Mesh(new THREE.TubeGeometry(placketCurve, 16, 0.014, 8, false), cardiganEdgeMat);
    dailyGroup.add(placket);

    // 앞쪽 작은 니트 주머니
    const pocket = makeMesh(
      unitSphereGeo,
      cardiganEdgeMat,
      [s * 0.112, 0.642, 0.132],
      [0, s * 0.52, 0],
      [0.042, 0.036, 0.012]
    );
    dailyGroup.add(pocket);
  }

  // 작은 브라운 단추 3개 (첨부 이미지와 동일한 앞여밈 위치)
  for (const [by, bz] of [
    [0.758, 0.168],
    [0.685, 0.175],
    [0.614, 0.168],
  ]) {
    const btn = makeMesh(unitSphereGeo, buttonMat, [0.044, by, bz], [0, 0.22, 0], [0.013, 0.013, 0.008]);
    dailyGroup.add(btn);
  }

  // (2) 목 아래 브라운 나비 리본 (첨부 이미지 시그니처)
  const dailyRibbon = buildNeckRibbon(clayMat(preset.accent), 1.08);
  dailyRibbon.name = 'dailyNeckRibbon';
  dailyRibbon.position.set(0, 0.838, 0.132);
  dailyRibbon.rotation.x = -0.10;
  dailyGroup.add(dailyRibbon);

  // (3) 브라운 타탄 체크 플리츠 스커트
  const dailySkirtPivot = new THREE.Group();
  dailySkirtPivot.name = 'dailySkirtPivot';
  dailySkirtPivot.position.set(0, 0.595, 0);

  const plaidMat = new THREE.MeshStandardMaterial({
    map: getPlaidSkirtTexture(preset.bottom),
    roughness: 0.90,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const plaidSkirt = new THREE.Mesh(pleatedSkirtGeo, plaidMat);
  plaidSkirt.name = 'plaidSkirt';
  dailySkirtPivot.add(plaidSkirt);
  dailyGroup.add(dailySkirtPivot);

  // (4) 꽃 장식 짙은 브라운 크로스백
  const crossbodyBag = buildCrossbodyBag(preset.bag);
  crossbodyBag.visible = Boolean(preset.bagVisible);
  dailyGroup.add(crossbodyBag);

  dailyGroup.visible = preset.outfit === 'daily';
  body.add(dailyGroup);

  // ========================================================
  // [B] 옷장 호환 원피스 그룹 ('dress' — spring_pastelle_dress, lavender_ribbon_dress)
  // ========================================================
  const dressGroup = new THREE.Group();
  dressGroup.name = 'dressGroup';

  const dressSkirtPivot = new THREE.Group();
  dressSkirtPivot.position.set(0, 0.595, 0);

  const dressSkirt = new THREE.Mesh(dressSkirtGeo, clayMat(0xffeae3, { doubleSide: true }));
  const dressSkirtTrim = makeMesh(
    new THREE.TorusGeometry(0.258, 0.012, 8, 36),
    clayMat(preset.trim),
    [0, -0.268, 0],
    [Math.PI * 0.5, 0, 0],
    [1.0, 0.92, 1.0]
  );
  dressSkirtPivot.add(dressSkirt, dressSkirtTrim);
  dressGroup.add(dressSkirtPivot);

  const waistBelt = makeMesh(
    new THREE.TorusGeometry(0.148, 0.017, 10, 28),
    clayMat(0xb8dfc9),
    [0, 0.60, 0],
    [Math.PI * 0.5, 0, 0],
    [1.0, 0.90, 1.0]
  );
  const dressRibbon = buildNeckRibbon(clayMat(0xb8dfc9), 0.95);
  dressRibbon.position.set(0, 0.838, 0.132);
  dressGroup.add(waistBelt, dressRibbon);

  dressGroup.visible = preset.outfit === 'dress';
  body.add(dressGroup);

  // ========================================================
  // [C] 옷장 호환 멜빵바지 그룹 ('pants' — adventurer_overalls)
  // ========================================================
  const pantsGroup = new THREE.Group();
  pantsGroup.name = 'pantsGroup';

  const pelvis = makeMesh(unitSphereGeo, clayMat(0x7ca1d4), [0, 0.495, 0], [0, 0, 0], [0.164, 0.145, 0.146]);
  const overallsWaist = makeMesh(
    new THREE.TorusGeometry(0.148, 0.022, 10, 28),
    clayMat(0x7ca1d4),
    [0, 0.595, 0],
    [Math.PI * 0.5, 0, 0],
    [1.02, 0.92, 1.0]
  );
  const bib = makeMesh(unitSphereGeo, clayMat(0x7ca1d4), [0, 0.670, 0.125], [0, 0, 0], [0.095, 0.105, 0.042]);
  pantsGroup.add(pelvis, overallsWaist, bib);

  const straps = [overallsWaist];
  const buttons = [];
  for (const s of [-1, 1]) {
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.072, 0.730, 0.155),
      new THREE.Vector3(s * 0.092, 0.835, 0.125),
      new THREE.Vector3(s * 0.100, 0.895, 0.0),
      new THREE.Vector3(s * 0.092, 0.825, -0.128),
      new THREE.Vector3(s * 0.078, 0.605, -0.142),
    ]);
    const strap = new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 18, 0.015, 8, false), clayMat(0x7ca1d4));
    pantsGroup.add(strap);
    straps.push(strap);

    const btn = makeMesh(unitSphereGeo, clayMat(0xffbd59), [s * 0.072, 0.736, 0.165], [0, 0, 0], [0.015, 0.015, 0.009]);
    pantsGroup.add(btn);
    buttons.push(btn);
  }

  pantsGroup.visible = preset.outfit === 'pants';
  body.add(pantsGroup);

  return {
    group: body,
    neck,
    chest,
    collarRing,
    collarFlaps,
    dailyGroup,
    cardiganMat,
    dailySkirtPivot,
    plaidSkirt,
    crossbodyBag,
    dressGroup,
    dressSkirtPivot,
    dressSkirt,
    dressSkirtTrim,
    waistBelt,
    dressRibbon,
    pantsGroup,
    pelvis,
    bib,
    straps,
    buttons,
  };
}

// ---------- 팔 빌더 (가디건 니트 긴팔 소매 + 작은 손, 원피스/반팔 호환 전환 지원) ----------
function buildArm(side, preset, cardiganMat) {
  const pivot = new THREE.Group();
  pivot.name = `arm${side < 0 ? 'L' : 'R'}`;
  pivot.position.set(side * 0.168, 0.822, 0);
  pivot.rotation.z = side * 0.24;

  const isDaily = preset.outfit === 'daily';

  // 상완 니트 소매 (어깨 연결이 둥글고 자연스러움)
  const upperSleeve = new THREE.Mesh(upperSleeveGeo, isDaily ? cardiganMat : clayMat(preset.top));
  upperSleeve.name = 'upperSleeve';
  pivot.add(upperSleeve);

  // 팔꿈치 그룹 (y = -0.122)
  const elbow = new THREE.Group();
  elbow.name = 'elbow';
  elbow.position.set(0, -0.122, 0);

  // (a) 데일리룩용 도톰한 긴팔 하완 니트 소매 + 손목 골지 커프스
  const lowerSleeve = new THREE.Mesh(lowerSleeveGeo, cardiganMat);
  lowerSleeve.name = 'lowerSleeve';
  lowerSleeve.visible = isDaily;

  const wristCuff = makeMesh(
    new THREE.TorusGeometry(0.048, 0.016, 10, 20),
    clayMat(0xecd9be, { roughness: 0.92 }),
    [0, -0.106, 0],
    [Math.PI * 0.5, 0, 0]
  );
  wristCuff.name = 'wristCuff';
  wristCuff.visible = isDaily;

  // (b) 반팔 의상(원피스/멜빵)용 피부 팔뚝 + 소매단
  const skinMat = clayMat(preset.skin);
  const bareForearm = makeMesh(bareForearmGeo, skinMat, [0, -0.055, 0]);
  bareForearm.name = 'bareForearm';
  bareForearm.visible = !isDaily;

  const shortCuff = makeMesh(
    new THREE.TorusGeometry(0.054, 0.012, 8, 18),
    clayMat(preset.trim),
    [0, -0.004, 0],
    [Math.PI * 0.5, 0, 0]
  );
  shortCuff.visible = !isDaily;

  // (c) 작고 자연스러운 클레이 손 + 작은 엄지
  const hand = makeMesh(unitSphereGeo, skinMat, [0, -0.132, 0.006], [0, 0, 0], [0.040, 0.042, 0.038]);
  hand.name = 'hand';

  const thumb = makeMesh(
    unitSphereGeo,
    skinMat,
    [-side * 0.030, -0.124, 0.022],
    [0.2, 0, side * 0.45],
    [0.015, 0.022, 0.015]
  );
  thumb.name = 'thumb';

  elbow.add(lowerSleeve, wristCuff, bareForearm, shortCuff, hand, thumb);
  pivot.add(elbow);

  return { pivot, elbow, upperSleeve, lowerSleeve, wristCuff, bareForearm, shortCuff, hand, thumb };
}

// ---------- 다리, 크림 골지 니삭스, 브라운 레이스업 부츠 (발바닥 y = 0.000 접지) ----------
function buildLeg(side, preset) {
  const pivot = new THREE.Group();
  pivot.name = `leg${side < 0 ? 'L' : 'R'}`;
  pivot.position.set(side * 0.086, 0.425, 0);

  const isPants = preset.outfit === 'pants';
  const legMat = isPants ? clayMat(preset.bottom) : clayMat(preset.skin);

  // 허벅지
  const thigh = makeMesh(thighGeo, legMat, [0, -0.085, 0]);
  thigh.name = 'thigh';
  pivot.add(thigh);

  // 무릎 피벗 (월드 y = 0.425 - 0.165 = 0.260)
  const knee = new THREE.Group();
  knee.name = 'knee';
  knee.position.set(0, -0.165, 0);

  // 종아리 (바지 착용 시 바지색)
  const shin = makeMesh(shinGeo, legMat, [0, -0.072, 0]);
  shin.name = 'shin';
  shin.visible = isPants;

  // 크림색 골지 니삭스 (무릎 아래 ~ 부츠 위, 데일리룩 & 원피스용)
  const sockTex = getRibbedSockTextures(preset.trim);
  const sockMat = new THREE.MeshStandardMaterial({
    map: sockTex.map,
    bumpMap: sockTex.bumpMap,
    bumpScale: 0.008,
    roughness: 0.92,
    metalness: 0.0,
  });
  const sockGroup = new THREE.Group();
  sockGroup.name = 'kneeSockGroup';
  const sockMesh = makeMesh(kneeSockGeo, sockMat, [0, -0.072, 0]);
  const sockTopRim = makeMesh(
    new THREE.TorusGeometry(0.056, 0.012, 8, 20),
    clayMat(preset.trim),
    [0, 0.005, 0],
    [Math.PI * 0.5, 0, 0]
  );
  sockGroup.add(sockMesh, sockTopRim);
  sockGroup.visible = !isPants;

  // 브라운 레이스업 워커 부츠 (최하단 밑창: -0.215 - 0.045 = -0.260 → 월드 y = 0.000 정확 접지!)
  const bootGroup = new THREE.Group();
  bootGroup.name = 'bootGroup';
  bootGroup.position.set(0, -0.215, 0.025);

  const bootMat = clayMat(preset.shoes, { roughness: 0.85 });
  const soleMat = clayMat(preset.sole, { roughness: 0.90 });
  const laceMat = clayMat(0x4a2e22, { roughness: 0.88 });

  // 부츠 발 본체
  const bootFoot = new THREE.Mesh(bootFootGeo, bootMat);
  bootFoot.name = 'bootFoot';

  // 부츠 발목 통
  const bootShaft = makeMesh(bootShaftGeo, bootMat, [0, 0.008, -0.024]);
  bootShaft.name = 'bootShaft';

  // 부츠 두꺼운 밑창 (최하단 y = -0.036 - 0.009 = -0.045 → 월드 y = 0.000)
  const sole = makeMesh(unitSphereGeo, soleMat, [0, -0.035, 0], [0, 0, 0], [0.080, 0.010, 0.130]);
  sole.name = 'sole';

  // 앞쪽 교차 레이스업 신발끈 3단 (X자 + 상단 리본 매듭)
  const lacesGroup = new THREE.Group();
  lacesGroup.name = 'bootLaces';
  for (let i = 0; i < 3; i++) {
    const ly = 0.038 + i * 0.028;
    const lz = 0.058 - i * 0.008;
    for (const dir of [-1, 1]) {
      const laceCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.026 * dir, ly - 0.008, lz),
        new THREE.Vector3(0, ly + 0.002, lz + 0.010),
        new THREE.Vector3(0.026 * dir, ly + 0.012, lz),
      ]);
      lacesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(laceCurve, 6, 0.0045, 6, false), laceMat));
    }
  }
  // 상단 신발끈 리본 루프 2개
  for (const s of [-1, 1]) {
    const loop = makeMesh(
      new THREE.TorusGeometry(0.015, 0.0045, 6, 12),
      laceMat,
      [s * 0.018, 0.125, 0.045],
      [0.3, s * 0.4, s * -0.3]
    );
    lacesGroup.add(loop);
  }

  bootGroup.add(bootFoot, bootShaft, sole, lacesGroup);
  knee.add(shin, sockGroup, bootGroup);
  pivot.add(knee);

  return {
    pivot,
    knee,
    thigh,
    shin,
    sockGroup,
    sockMesh,
    sockTopRim,
    bootGroup,
    bootFoot,
    bootShaft,
    sole,
    lacesGroup,
  };
}

export function createCharacter(type = 'female') {
  const basePreset = CHARACTER_PRESETS[type] ?? CHARACTER_PRESETS.female;
  const preset = { ...basePreset };

  const root = new THREE.Group();
  root.name = `character-${type}`;

  const body = new THREE.Group(); // 목 변형 없는 전체 호흡/보행 바운스 컨테이너
  root.add(body);

  let faceTextures = createFaceTextureSet({
    skin: preset.skin,
    eyeColor: preset.eyeColor,
    hairColor: preset.hair,
    eyeStyle: preset.eyeStyle,
    expression: preset.expression,
    lashes: preset.lashes,
  });

  const torso = buildTorso(preset);
  const headObj = buildHead(preset, faceTextures);
  const head = headObj.group;
  head.position.y = 1.185; // 치비 비율: 발바닥 0 ~ 머리 상단 1.45m (베레모 포함 ~1.55m)

  // 장착 액세서리 소켓 슬롯 (머리, 등)
  const slots = {
    head: new THREE.Group(),
    back: new THREE.Group(),
  };
  slots.head.name = 'slot_head';
  slots.back.name = 'slot_back';
  head.add(slots.head);
  slots.back.position.set(0, 0.72, -0.17);
  torso.group.add(slots.back);

  const L = buildArm(-1, preset, torso.cardiganMat);
  const R = buildArm(1, preset, torso.cardiganMat);
  const legL = buildLeg(-1, preset);
  const legR = buildLeg(1, preset);

  body.add(torso.group, head, L.pivot, R.pivot, legL.pivot, legR.pivot);

  function applyShadows(target) {
    target.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
  applyShadows(root);

  let phase = 0;
  let walk = 0;
  let t = 0;
  let blinkTimer = 3.2;
  let blinkDuration = 0;

  const equippedSlots = { head: null, back: null, outfit: null, shoes: null };
  let equippedHeadIsHat = false;
  let currentOutfitType = preset.outfit;

  function clearSlot(slotGroup) {
    while (slotGroup.children.length > 0) {
      slotGroup.remove(slotGroup.children[0]);
    }
  }

  /**
   * 헤어스타일과 모자(기본 베레모 / 장착 모자)를 독립적으로 관리하며 충돌/관통을 방지하는 동기화 함수
   * - 모자 착용 시: 현재 헤어스타일의 최적 hatCompat 위치·각도·스케일을 적용하고,
   *   상단 묶음(topBun 등)의 돌출 파츠(topParts)만 깔끔히 숨김
   * - 모자 해제 시: 헤어스타일의 모든 파츠를 원래 위치·형태로 100% 복원
   */
  function syncHatAndHair() {
    const hairGroup = headObj.hair;
    const compat = (hairGroup && hairGroup.userData && hairGroup.userData.hatCompat) || {
      hatPos: [0.010, 0.200, -0.056],
      hatRot: [-0.34, 0.0, -0.05],
      hatScale: 1.03,
      hideTopPartsWhenHatOn: false,
    };

    // 1. 기본 베레모 가시성 (장착 모자가 있으면 기본 베레모 숨김)
    const showDefaultHat = Boolean(preset.hatVisible) && !equippedHeadIsHat;
    headObj.defaultHat.visible = showDefaultHat;

    // 2. 활성 모자(기본 베레모 또는 장착 베레모)에 현재 헤어스타일 맞춤 정렬 적용
    const isAnyHatActive = showDefaultHat || equippedHeadIsHat;
    if (showDefaultHat) {
      headObj.defaultHat.position.set(...compat.hatPos);
      headObj.defaultHat.rotation.set(...compat.hatRot);
      headObj.defaultHat.scale.setScalar(compat.hatScale);
    }
    if (equippedHeadIsHat && slots.head.children[0]) {
      const equippedHat = slots.head.children[0];
      equippedHat.position.set(...compat.hatPos);
      equippedHat.rotation.set(...compat.hatRot);
      equippedHat.scale.setScalar(compat.hatScale);
    }

    // 3. 상단 돌출 묶음(topBun 번 등) 관통 방지 토글 — 해제 시 손상 없이 원복
    const topParts = (hairGroup && hairGroup.userData && hairGroup.userData.topParts) || [];
    const hideTop = isAnyHatActive && Boolean(compat.hideTopPartsWhenHatOn);
    for (const part of topParts) {
      part.visible = !hideTop;
    }
  }

  function refreshFaceTextures() {
    const prev = faceTextures;
    faceTextures = createFaceTextureSet({
      skin: preset.skin,
      eyeColor: preset.eyeColor,
      hairColor: preset.hair,
      eyeStyle: preset.eyeStyle,
      expression: preset.expression,
      lashes: preset.lashes,
    });
    headObj.headMat.map = blinkDuration > 0 ? faceTextures.closed : faceTextures.open;
    headObj.headMat.needsUpdate = true;
    prev.dispose();
  }

  function rebuildHair() {
    const oldHair = head.getObjectByName('hair');
    if (oldHair) head.remove(oldHair);
    const newHair = buildClayHair(preset, clayMat);
    applyShadows(newHair);
    head.add(newHair);
    headObj.hair = newHair;
    parts.hair = newHair;
    syncHatAndHair();
  }

  // 초기 생성 시 모자·헤어 정렬 동기화 적용
  syncHatAndHair();

  // 기존 옷장/퀘스트 헤어 액세서리 빌더 (새 헤드/베레모 규격에 정밀 안착)
  function buildAccessoryMesh(item) {
    if (item.modelType === 'flower_pin' || item.id === 'pink_flower_pin') {
      const pin = buildClayFlower(
        (item.colors && item.colors.petal) || 0xff7597,
        (item.colors && item.colors.center) || 0xffe070,
        1.45
      );
      pin.name = `accessory_${item.id}`;
      pin.position.set(-0.205, 0.145, 0.245);
      pin.rotation.set(-0.25, -0.55, 0.15);
      applyShadows(pin);
      return pin;
    }

    if (item.modelType === 'beret' || item.id === 'mint_ribbon_beret') {
      const beret = buildKnitBeret((item.colors && item.colors.main) || 0xb5e2cd);
      beret.name = `accessory_${item.id}`;
      const rib = buildNeckRibbon(clayMat((item.colors && item.colors.ribbon) || 0xfff6ea), 0.9);
      rib.position.set(0.24, 0.01, 0.16);
      rib.rotation.set(0.1, 0.85, -0.15);
      beret.add(rib);
      applyShadows(beret);
      return beret;
    }

    if (item.modelType === 'sunflower' || item.id === 'sunflower_clip') {
      const sf = buildClayFlower(
        (item.colors && item.colors.petal) || 0xffce42,
        (item.colors && item.colors.center) || 0x7c4932,
        1.55
      );
      sf.name = `accessory_${item.id}`;
      sf.position.set(0.205, 0.145, 0.245);
      sf.rotation.set(-0.25, 0.55, -0.15);
      applyShadows(sf);
      return sf;
    }

    if (item.modelType === 'moonflower' || item.id === 'moonflower') {
      const pin = buildClayFlower(
        (item.colors && item.colors.petal) || 0x82b4ff,
        (item.colors && item.colors.center) || 0xf0f4ff,
        1.48
      );
      pin.name = `accessory_${item.id}`;
      pin.position.set(-0.205, 0.145, 0.245);
      pin.rotation.set(-0.25, -0.55, 0.15);
      applyShadows(pin);
      return pin;
    }

    if (item.modelType === 'moonlight_brooch' || item.id === 'moonlight_brooch') {
      const brooch = buildClayBrooch(
        (item.colors && item.colors.main) || 0xa8c8ff,
        (item.colors && item.colors.gold) || 0xffe680,
        1.45
      );
      brooch.name = `accessory_${item.id}`;
      brooch.position.set(-0.205, 0.145, 0.245);
      brooch.rotation.set(-0.25, -0.55, 0.15);
      applyShadows(brooch);
      return brooch;
    }

    return null;
  }

  function applyOutfitMode(mode, colors = {}) {
    currentOutfitType = mode;
    const isDaily = mode === 'daily';
    const isDress = mode === 'dress';
    const isPants = mode === 'pants';

    torso.dailyGroup.visible = isDaily;
    torso.dressGroup.visible = isDress;
    torso.pantsGroup.visible = isPants;

    // 상체 코어 색상
    const topColor = isDaily ? preset.blouse : (colors.top || preset.top);
    const trimColor = isDaily ? preset.blouse : (colors.trim || preset.trim);
    const bottomColor = colors.bottom || preset.bottom;
    const accentColor = colors.accent || preset.accent;

    torso.chest.material = clayMat(topColor);
    torso.collarRing.material = clayMat(isPants ? preset.blouse : trimColor);
    torso.collarFlaps.forEach((f) => {
      f.visible = !isPants;
      f.material = clayMat(trimColor);
    });

    // 소매 전환 (데일리룩 = 니트 긴팔, 원피스/멜빵 = 퍼프 반팔)
    for (const arm of [L, R]) {
      arm.upperSleeve.material = isDaily ? torso.cardiganMat : clayMat(topColor);
      arm.lowerSleeve.visible = isDaily;
      arm.wristCuff.visible = isDaily;
      arm.bareForearm.visible = !isDaily;
      arm.shortCuff.visible = !isDaily;
      arm.shortCuff.material = clayMat(isPants ? topColor : trimColor);
    }

    // 원피스 색상 갱신
    if (isDress) {
      torso.dressSkirt.material = clayMat(bottomColor, { doubleSide: true });
      torso.dressSkirtTrim.material = clayMat(trimColor);
      torso.waistBelt.material = clayMat(accentColor);
      torso.dressRibbon.traverse((c) => { if (c.isMesh) c.material = clayMat(accentColor); });
    }

    // 멜빵바지 색상 갱신
    if (isPants) {
      torso.pelvis.material = clayMat(bottomColor);
      torso.bib.material = clayMat(bottomColor);
      torso.straps.forEach((s) => { s.material = clayMat(bottomColor); });
      torso.buttons.forEach((b) => { b.material = clayMat(accentColor); });
    }

    // 다리 & 니삭스 전환
    const legColorMat = isPants ? clayMat(bottomColor) : clayMat(preset.skin);
    for (const leg of [legL, legR]) {
      leg.thigh.material = legColorMat;
      leg.shin.material = legColorMat;
      leg.shin.visible = isPants;
      leg.sockGroup.visible = !isPants;
    }
  }

  function applyShoeColors({ main, sole }) {
    const shoeMat = clayMat(main, { roughness: 0.85 });
    const soleMat = clayMat(sole, { roughness: 0.90 });
    for (const leg of [legL, legR]) {
      leg.bootFoot.material = shoeMat;
      leg.bootShaft.material = shoeMat;
      leg.sole.material = soleMat;
    }
  }

  const parts = {
    body,
    torso: torso.group,
    head,
    hair: headObj.hair,
    face: headObj.face,
    hat: headObj.defaultHat,
    bag: torso.crossbodyBag,
    armL: L.pivot,
    armR: R.pivot,
    legL: legL.pivot,
    legR: legR.pivot,
    slots,
  };

  return {
    root,
    parts,

    equipAccessory(item) {
      if (!item) return false;
      const slotType = item.type || 'head';

      if (slotType === 'head') {
        clearSlot(slots.head);
        const mesh = buildAccessoryMesh(item);
        if (mesh) {
          equippedHeadIsHat = item.modelType === 'beret' || item.modelType === 'hat';
          slots.head.add(mesh);
          equippedSlots.head = item.id;
          syncHatAndHair();
          return true;
        }
        return false;
      }

      if (slotType === 'outfit') {
        const mode = item.outfitType === 'pants' ? 'pants' : 'dress';
        applyOutfitMode(mode, item.colors || {});
        equippedSlots.outfit = item.id;
        return true;
      }

      if (slotType === 'shoes') {
        applyShoeColors({
          main: (item.colors && item.colors.main) || preset.shoes,
          sole: (item.colors && item.colors.sole) || preset.sole,
        });
        equippedSlots.shoes = item.id;
        return true;
      }

      if (slotType === 'back') {
        clearSlot(slots.back);
        const mesh = buildAccessoryMesh(item);
        if (mesh) {
          slots.back.add(mesh);
          equippedSlots.back = item.id;
          return true;
        }
        return false;
      }

      return false;
    },

    unequipAccessory(slotType = 'head') {
      if (slotType === 'head') {
        clearSlot(slots.head);
        equippedHeadIsHat = false;
        equippedSlots.head = null;
        syncHatAndHair();
        return true;
      }

      if (slotType === 'outfit') {
        applyOutfitMode(preset.outfit, {});
        equippedSlots.outfit = null;
        return true;
      }

      if (slotType === 'shoes') {
        applyShoeColors({ main: preset.shoes, sole: preset.sole });
        equippedSlots.shoes = null;
        return true;
      }

      if (slotType === 'back') {
        clearSlot(slots.back);
        equippedSlots.back = null;
        return true;
      }

      return false;
    },

    getEquippedAccessory(slotType = 'head') {
      return equippedSlots[slotType] || null;
    },

    setAppearance(options = {}) {
      let hairChanged = false;
      let faceChanged = false;

      if (options.hairStyle && options.hairStyle !== preset.hairStyle) {
        // 기존 vanityUI의 'bobBuns' 키를 기본 긴 웨이브('longWave')로 호환 매핑
        const mapped = options.hairStyle === 'bobBuns' ? 'longWave' : options.hairStyle;
        if (mapped !== preset.hairStyle) {
          preset.hairStyle = mapped;
          hairChanged = true;
        }
      }

      if (options.hairColor !== undefined && options.hairColor !== preset.hair) {
        preset.hair = options.hairColor;
        preset.hairAccent = options.hairAccent || options.hairColor;
        hairChanged = true;
        faceChanged = true;
      }

      if (hairChanged) {
        rebuildHair();
      }

      if (options.skinColor !== undefined && options.skinColor !== preset.skin) {
        preset.skin = options.skinColor;
        const skinMat = clayMat(preset.skin);

        torso.neck.material = skinMat;
        headObj.nose.material = skinMat;
        headObj.ears.forEach((e) => { e.material = skinMat; });

        for (const arm of [L, R]) {
          arm.bareForearm.material = skinMat;
          arm.hand.material = skinMat;
          arm.thumb.material = skinMat;
        }
        if (currentOutfitType !== 'pants') {
          legL.thigh.material = skinMat;
          legR.thigh.material = skinMat;
        }
        faceChanged = true;
      }

      if (options.eyeColor !== undefined && options.eyeColor !== preset.eyeColor) {
        preset.eyeColor = options.eyeColor;
        faceChanged = true;
      }

      if (options.eyeStyle && options.eyeStyle !== preset.eyeStyle) {
        preset.eyeStyle = options.eyeStyle;
        faceChanged = true;
      }

      if (options.expression && options.expression !== preset.expression) {
        preset.expression = options.expression;
        faceChanged = true;
      }

      if (options.hatVisible !== undefined) {
        preset.hatVisible = Boolean(options.hatVisible);
        syncHatAndHair();
      }

      if (options.bagVisible !== undefined) {
        preset.bagVisible = Boolean(options.bagVisible);
        torso.crossbodyBag.visible = preset.bagVisible;
      }

      if (faceChanged) {
        refreshFaceTextures();
      }

      return true;
    },

    getAppearance() {
      return { ...preset };
    },

    equipFlowerPin() {
      return this.equipAccessory({
        id: 'pink_flower_pin',
        type: 'head',
        modelType: 'flower_pin',
        colors: { petal: 0xff6b8b, center: 0xffe070, leaf: 0x8ec89a },
      });
    },

    /**
     * 안정적인 Idle / Walk 애니메이션 + 눈 깜빡임
     * - 중요: 목이나 상체의 Y축 스케일을 변형하지 않아 호흡 시 목이 늘어나거나
     *   머리와 몸통 사이에 틈이 생기는 현상을 원천 차단함.
     */
    update(dt, moving) {
      t += dt;
      walk += ((moving ? 1 : 0) - walk) * (1 - Math.exp(-10 * dt));
      if (moving) phase += dt * 9.2;

      // 1. 자연스러운 눈 깜빡임 (3.5~5.5초 주기)
      if (blinkDuration > 0) {
        blinkDuration -= dt;
        if (blinkDuration <= 0) {
          headObj.headMat.map = faceTextures.open;
          headObj.headMat.needsUpdate = true;
        }
      } else {
        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          blinkDuration = 0.13;
          blinkTimer = 3.5 + Math.random() * 2.0;
          headObj.headMat.map = faceTextures.closed;
          headObj.headMat.needsUpdate = true;
        }
      }

      const swing = Math.sin(phase);
      const idle = Math.sin(t * 2.0);
      const pos = (v) => Math.max(0, v);

      // 2. 다리 & 무릎 보행 스윙
      legL.pivot.rotation.x = swing * 0.54 * walk;
      legR.pivot.rotation.x = -swing * 0.54 * walk;
      legL.knee.rotation.x = pos(swing) * 0.50 * walk;
      legR.knee.rotation.x = pos(-swing) * 0.50 * walk;

      // 3. 팔 & 팔꿈치 자연스러운 스윙 (Idle 시 미세 호흡 흔들림)
      L.pivot.rotation.x = -swing * 0.48 * walk + idle * 0.028 * (1 - walk);
      R.pivot.rotation.x = swing * 0.48 * walk - idle * 0.028 * (1 - walk);
      L.pivot.rotation.z = -0.24 - idle * 0.014 * (1 - walk);
      R.pivot.rotation.z = 0.24 + idle * 0.014 * (1 - walk);
      L.elbow.rotation.x = -0.14 - pos(swing) * 0.28 * walk;
      R.elbow.rotation.x = -0.14 - pos(-swing) * 0.28 * walk;

      // 4. 목 변형 없는 포근한 전체 호흡 + 경쾌한 보행 바운스
      body.position.y = Math.abs(swing) * 0.032 * walk + idle * 0.005 * (1 - walk);
      body.rotation.z = swing * 0.026 * walk;

      // 5. 체크 스커트 / 원피스 스커트 보행 살랑임
      const activeSkirtPivot = currentOutfitType === 'daily' ? torso.dailySkirtPivot : torso.dressSkirtPivot;
      if (activeSkirtPivot) {
        activeSkirtPivot.rotation.z = -swing * 0.040 * walk;
        activeSkirtPivot.rotation.x = Math.abs(swing) * 0.026 * walk;
      }

      // 6. 머리 자연스러운 기울임 & 긴 웨이브 헤어 미세 살랑임
      head.rotation.z = Math.sin(t * 1.2) * 0.022 * (1 - walk) - swing * 0.018 * walk;
      head.rotation.x = Math.sin(phase * 2) * 0.022 * walk + idle * 0.010 * (1 - walk);

      if (headObj.hair && headObj.hair.userData) {
        const wb = headObj.hair.userData.waveBack;
        if (wb) {
          wb.rotation.x = 0.02 + Math.abs(swing) * 0.055 * walk + idle * 0.008 * (1 - walk);
        }
      }
    },
  };
}
