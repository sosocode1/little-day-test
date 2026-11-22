// LITTLE DAY - 첨부 디자인 시트 기준 고퀄리티 3D 클레이 헤어 & 니트 베레모 빌더
// - 기본 스타일('longWave', 기존 'bobBuns' 호환): 짙은 초콜릿 브라운 긴 웨이브 헤어
// - 확장 스타일: 'shortBob'('tufty' 호환), 'twinBraids'(양갈래), 'topBun'(묶음머리)
// - 헤어스타일과 모자 장착 시스템의 독립 관리:
//   각 헤어 그룹은 hatCompat(최적 모자 위치/각도/스케일)과 topParts(모자 착용 시 관통 방지 숨김 대상)를 제공한다.
import * as THREE from 'three';
import { getBeretKnitTextures } from './clayTextures.js';

/**
 * 경로(CatmullRomCurve3)를 따라 단면 반지름(rx, ry)이 부드럽게 변하는
 * 테이퍼드 클레이 머리카락 가닥(BufferGeometry)을 생성한다.
 */
export function createTaperedStrandGeometry(
  controlPoints,
  {
    radiusX = 0.052,
    radiusY = 0.032,
    tubularSegments = 26,
    radialSegments = 12,
    taperPower = 0.62,
    rootTaper = 0.68,
    bulgeAt = 0.38,
    bulgeAmt = 0.12,
  } = {}
) {
  const curve = new THREE.CatmullRomCurve3(
    controlPoints.map((p) => (p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p)))
  );
  const frames = curve.computeFrenetFrames(tubularSegments, false);

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const p = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    let profile;
    if (t < 0.15) {
      const k = t / 0.15;
      profile = rootTaper + (1 - rootTaper) * Math.sin(k * Math.PI * 0.5);
    } else {
      const k = (t - 0.15) / 0.85;
      profile = Math.pow(Math.max(0, Math.cos(k * Math.PI * 0.5)), taperPower);
    }
    profile *= 1 + bulgeAmt * Math.exp(-Math.pow((t - bulgeAt) / 0.28, 2));
    if (i === tubularSegments) profile = 0.001;

    const rx = radiusX * profile;
    const ry = radiusY * profile;

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const cos = Math.cos(v);
      const sin = Math.sin(v);

      const vx = p.x + rx * cos * N.x + ry * sin * B.x;
      const vy = p.y + rx * cos * N.y + ry * sin * B.y;
      const vz = p.z + rx * cos * N.z + ry * sin * B.z;

      positions.push(vx, vy, vz);
      uvs.push(j / radialSegments, t);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
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
 * 통통한 U자 모찌 얼굴형(볼 폭 ~0.304)을 매끈하게 감싸는 베이스 헤어 캡
 * - 정수리 높이를 베레모 안쪽으로 깔끔히 정리해 베레모 관통을 원천 방지한다.
 */
function createHairBaseCapGeometry({
  bottomSideY = -0.14,
  bottomBackY = -0.25,
  bobFlareAmt = 0.035,
  segsU = 54,
  segsV = 28,
} = {}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV;
    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      const theta = (u - 0.5) * Math.PI * 2;
      const absTheta = Math.abs(theta);

      const frontMask = THREE.MathUtils.smoothstep(absTheta, 0.48, 1.42);
      const backMask = THREE.MathUtils.smoothstep(absTheta, 1.48, 2.35);

      const foreheadY = 0.148;
      const targetBottomY =
        THREE.MathUtils.lerp(foreheadY, bottomSideY, frontMask) * (1 - backMask) +
        bottomBackY * backMask;

      const yTop = 0.292;
      let y;
      let radialScale;

      if (v <= 0.88) {
        const t = v / 0.88;
        const maxAngle = Math.PI * 0.5 + 0.56 * frontMask;
        const domeAngle = t * maxAngle;
        const rawY = Math.cos(domeAngle);
        const minRawY = Math.cos(maxAngle);
        const normT = (1 - rawY) / Math.max(0.001, 1 - minRawY);
        y = THREE.MathUtils.lerp(yTop, targetBottomY, normT);

        const baseR = Math.sin(Math.min(domeAngle, Math.PI * 0.54));
        const flare = Math.sin(Math.max(0, t - 0.35) / 0.65 * Math.PI) * bobFlareAmt * frontMask;
        const curlIn = Math.pow(Math.max(0, t - 0.72) / 0.28, 2.0) * 0.042 * frontMask;
        radialScale = Math.max(0.001, baseR + flare - curlIn);
      } else {
        const k = (v - 0.88) / 0.12;
        const edgeR = 0.88 - 0.042 * frontMask;
        y = targetBottomY + Math.sin(k * Math.PI * 0.5) * 0.020 * frontMask;
        radialScale = Math.max(0.001, edgeR * (1 - 0.14 * k));
      }

      // 통통해진 얼굴형(볼 폭 ~0.304)을 파고들지 않고 부드럽게 감싸는 외경
      const rx = 0.328;
      const rz = 0.308;
      const backVol = 1 + 0.052 * Math.max(0, -Math.cos(theta)) * Math.sin(v * Math.PI);
      const partGroove = 1 - 0.012 * Math.exp(-Math.pow((theta - 0.05) * 5.0, 2)) * Math.pow(1 - v, 1.5);

      const x = Math.sin(theta) * rx * radialScale * backVol;
      const z = Math.cos(theta) * rz * radialScale * backVol - 0.014;

      positions.push(x, y * partGroove, z);
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
 * 첨부 디자인 시트 기준: 부드럽고 섬세하게 흐르는 곡선 앞머리
 * - 모든 가닥의 뿌리를 정수리 가르마 안쪽(베레모/베이스 캡 내부)에 통일해
 *   베레모 아래에서 들뜨거나 가로 경계선이 비치지 않고 하나의 자연스러운 흐름으로 이어진다.
 */
function addSignatureBangs(hairGroup, hairMat) {
  const specs = [
    // 중앙 메인 앞머리 (살짝 왼쪽으로 자연스럽게 휘어지며 눈썹 위를 덮음)
    {
      pts: [
        [0.012, 0.265, 0.020],
        [0.008, 0.218, 0.242],
        [-0.012, 0.132, 0.292],
        [-0.036, 0.044, 0.284],
      ],
      rx: 0.062,
      ry: 0.028,
    },
    // 가르마 오른쪽 메인 앞머리 (부드러운 곡선으로 우측으로 흐름)
    {
      pts: [
        [0.028, 0.265, 0.020],
        [0.072, 0.215, 0.236],
        [0.104, 0.128, 0.280],
        [0.128, 0.036, 0.264],
      ],
      rx: 0.062,
      ry: 0.028,
    },
    // 중앙 좌측 앞머리
    {
      pts: [
        [-0.022, 0.265, 0.020],
        [-0.088, 0.212, 0.232],
        [-0.126, 0.122, 0.272],
        [-0.148, 0.028, 0.252],
      ],
      rx: 0.062,
      ry: 0.028,
    },
    // 가르마 중앙 연결 가닥 (이마 상단 빈틈 완전 커버)
    {
      pts: [
        [0.018, 0.265, 0.025],
        [0.036, 0.212, 0.244],
        [0.046, 0.128, 0.289],
        [0.050, 0.054, 0.282],
      ],
      rx: 0.050,
      ry: 0.024,
    },
    // 좌측 관자놀이 연결 앞머리 (베이스 캡 경계선을 자연스럽게 덮으며 옆머리로 이어짐)
    {
      pts: [
        [-0.065, 0.258, 0.015],
        [-0.168, 0.198, 0.205],
        [-0.226, 0.100, 0.222],
        [-0.252, -0.015, 0.198],
      ],
      rx: 0.058,
      ry: 0.028,
    },
    // 우측 관자놀이 연결 앞머리
    {
      pts: [
        [0.065, 0.258, 0.015],
        [0.168, 0.198, 0.205],
        [0.226, 0.100, 0.222],
        [0.252, -0.015, 0.198],
      ],
      rx: 0.058,
      ry: 0.028,
    },
  ];

  for (const s of specs) {
    const geo = createTaperedStrandGeometry(s.pts, {
      radiusX: s.rx,
      radiusY: s.ry,
      tubularSegments: 22,
      radialSegments: 10,
      taperPower: 0.56,
      rootTaper: 0.65,
      bulgeAt: 0.42,
      bulgeAmt: 0.08,
    });
    hairGroup.add(new THREE.Mesh(geo, hairMat));
  }
}

/**
 * 1. 기본 헤어스타일: 첨부 디자인 시트의 짙은 초콜릿 브라운 긴 웨이브 헤어 ('longWave' / 'bobBuns')
 * - 통통해진 U자 모찌 볼을 파고들지 않고 바깥에서 우아하게 감싸며 부드러운 S자 웨이브로 흐른다.
 */
function buildLongWaveHair(hairMat, accentHairMat) {
  const hair = new THREE.Group();
  hair.name = 'hair';

  const capGeo = createHairBaseCapGeometry({
    bottomSideY: -0.14,
    bottomBackY: -0.25,
    bobFlareAmt: 0.032,
  });
  const cap = new THREE.Mesh(capGeo, hairMat);
  cap.name = 'hairBaseCap';
  hair.add(cap);

  addSignatureBangs(hair, hairMat);

  // 얼굴 양옆을 감싸는 긴 S자 웨이브 옆머리 (통통한 볼 외곽에 맞춘 부드러운 곡선, 뭉툭함 최소화)
  const waveSides = [];
  for (const s of [-1, 1]) {
    const sideGroup = new THREE.Group();
    sideGroup.name = s < 0 ? 'sideWaveL' : 'sideWaveR';

    // (a) 볼 옆을 따라 부드럽게 감아 내려오는 앞쪽 웨이브 락 (끝이 섬세하게 바깥 컬)
    const frontLockGeo = createTaperedStrandGeometry(
      [
        [s * 0.225, 0.195, 0.130],
        [s * 0.312, 0.065, 0.142],
        [s * 0.336, -0.105, 0.112],
        [s * 0.298, -0.265, 0.082],
        [s * 0.358, -0.415, 0.068],
        [s * 0.312, -0.535, 0.064],
      ],
      { radiusX: 0.050, radiusY: 0.034, tubularSegments: 28, radialSegments: 12, taperPower: 0.66, bulgeAt: 0.52, bulgeAmt: 0.14 }
    );
    sideGroup.add(new THREE.Mesh(frontLockGeo, hairMat));

    // (b) 메인 풍성한 측면 S자 웨이브
    const mainSideGeo = createTaperedStrandGeometry(
      [
        [s * 0.262, 0.165, 0.030],
        [s * 0.348, 0.005, 0.022],
        [s * 0.380, -0.165, -0.028],
        [s * 0.332, -0.335, -0.052],
        [s * 0.398, -0.475, -0.058],
        [s * 0.336, -0.595, -0.044],
      ],
      { radiusX: 0.068, radiusY: 0.048, tubularSegments: 30, radialSegments: 12, taperPower: 0.64, bulgeAt: 0.58, bulgeAmt: 0.15 }
    );
    sideGroup.add(new THREE.Mesh(mainSideGeo, accentHairMat));

    // (c) 측후면 볼륨 웨이브 (측면과 뒷머리 연결)
    const sideBackGeo = createTaperedStrandGeometry(
      [
        [s * 0.242, 0.138, -0.095],
        [s * 0.328, -0.042, -0.148],
        [s * 0.356, -0.222, -0.198],
        [s * 0.296, -0.382, -0.218],
        [s * 0.346, -0.515, -0.238],
        [s * 0.268, -0.608, -0.196],
      ],
      { radiusX: 0.070, radiusY: 0.050, tubularSegments: 30, radialSegments: 12, taperPower: 0.62, bulgeAt: 0.58, bulgeAmt: 0.15 }
    );
    sideGroup.add(new THREE.Mesh(sideBackGeo, hairMat));

    hair.add(sideGroup);
    waveSides.push(sideGroup);
  }

  // 등 뒤 허리선까지 자연스럽게 나뉘어 흐르는 7가닥 긴 웨이브 뒷머리
  const backGroup = new THREE.Group();
  backGroup.name = 'backWaves';

  const backAngles = [-0.88, -0.58, -0.30, 0.0, 0.30, 0.58, 0.88];
  backAngles.forEach((ang, idx) => {
    const sinA = Math.sin(ang);
    const cosA = Math.cos(ang);
    const waveDir = idx % 2 === 0 ? 1 : -1;
    const lenExtra = (1 - Math.abs(ang) * 0.25) * 0.045;

    const pts = [
      [sinA * 0.20, 0.155, -cosA * 0.225],
      [sinA * 0.30, -0.035, -cosA * 0.302],
      [sinA * 0.32 + waveDir * 0.018, -0.215, -cosA * 0.322 - 0.025],
      [sinA * 0.29 - waveDir * 0.015, -0.385, -cosA * 0.292 - 0.015],
      [sinA * 0.33 + waveDir * 0.022, -0.515 - lenExtra * 0.5, -cosA * 0.330 - 0.044],
      [sinA * 0.27, -0.600 - lenExtra, -cosA * 0.262 - 0.012],
    ];

    const strandGeo = createTaperedStrandGeometry(pts, {
      radiusX: idx === 3 ? 0.080 : 0.072,
      radiusY: 0.054,
      tubularSegments: 30,
      radialSegments: 12,
      taperPower: 0.60,
      rootTaper: 0.82,
      bulgeAt: 0.62,
      bulgeAmt: 0.16,
    });
    backGroup.add(new THREE.Mesh(strandGeo, idx % 2 === 1 ? accentHairMat : hairMat));
  });

  hair.add(backGroup);
  hair.userData.waveBack = backGroup;
  hair.userData.waveSides = waveSides;
  hair.userData.topParts = [];
  hair.userData.hatCompat = {
    hatPos: [0.010, 0.200, -0.056],
    hatRot: [-0.34, 0.0, -0.05],
    hatScale: 1.03,
    hideTopPartsWhenHatOn: false,
  };
  return hair;
}

/**
 * 2. 확장 헤어스타일: 단발 보브 ('shortBob' / 기존 'tufty' 호환)
 */
function buildShortBobHair(hairMat) {
  const hair = new THREE.Group();
  hair.name = 'hair';

  const capGeo = createHairBaseCapGeometry({
    bottomSideY: -0.228,
    bottomBackY: -0.248,
    bobFlareAmt: 0.052,
  });
  hair.add(new THREE.Mesh(capGeo, hairMat));
  addSignatureBangs(hair, hairMat);

  for (const s of [-1, 1]) {
    const lockGeo = createTaperedStrandGeometry(
      [
        [s * 0.22, 0.195, 0.130],
        [s * 0.312, 0.065, 0.142],
        [s * 0.320, -0.095, 0.130],
        [s * 0.258, -0.225, 0.112],
      ],
      { radiusX: 0.048, radiusY: 0.030, tubularSegments: 20, radialSegments: 10, taperPower: 0.65 }
    );
    hair.add(new THREE.Mesh(lockGeo, hairMat));
  }

  hair.userData.topParts = [];
  hair.userData.hatCompat = {
    hatPos: [0.010, 0.198, -0.054],
    hatRot: [-0.33, 0.0, -0.05],
    hatScale: 1.03,
    hideTopPartsWhenHatOn: false,
  };
  return hair;
}

/**
 * 3. 확장 헤어스타일: 양갈래 땋은 머리 ('twinBraids' — 디자인 시트 '양갈래')
 */
function buildTwinBraidsHair(hairMat, ribbonMat) {
  const hair = new THREE.Group();
  hair.name = 'hair';

  const capGeo = createHairBaseCapGeometry({ bottomSideY: -0.15, bottomBackY: -0.20, bobFlareAmt: 0.025 });
  hair.add(new THREE.Mesh(capGeo, hairMat));
  addSignatureBangs(hair, hairMat);

  const puffGeo = new THREE.SphereGeometry(1, 16, 12);
  const tieGeo = new THREE.TorusGeometry(0.036, 0.011, 8, 16);

  for (const s of [-1, 1]) {
    const braid = new THREE.Group();
    braid.position.set(s * 0.275, -0.14, 0.02);

    for (let i = 0; i < 5; i++) {
      const k = 1 - i * 0.10;
      const seg = new THREE.Mesh(puffGeo, hairMat);
      seg.scale.set(0.050 * k, 0.054 * k, 0.042 * k);
      seg.position.set(s * (0.015 + i * 0.008) + (i % 2 === 0 ? 0.012 : -0.012), -i * 0.068, i * 0.012);
      braid.add(seg);
    }

    const tie = new THREE.Mesh(tieGeo, ribbonMat);
    tie.rotation.x = Math.PI * 0.5;
    tie.position.set(s * 0.052, -0.34, 0.055);
    braid.add(tie);

    const tip = new THREE.Mesh(puffGeo, hairMat);
    tip.scale.set(0.036, 0.060, 0.034);
    tip.position.set(s * 0.056, -0.395, 0.062);
    braid.add(tip);

    hair.add(braid);
  }

  hair.userData.topParts = [];
  hair.userData.hatCompat = {
    hatPos: [0.010, 0.200, -0.054],
    hatRot: [-0.33, 0.0, -0.05],
    hatScale: 1.03,
    hideTopPartsWhenHatOn: false,
  };
  return hair;
}

/**
 * 4. 확장 헤어스타일: 묶음머리 번 ('topBun' — 디자인 시트 '묶음머리 (번)')
 * - 상단 묶음(번 + 리본 밴드)을 별도 topParts 그룹으로 분리하여,
 *   베레모 착용 시 모자 위로 튀어나오지 않게 깔끔히 수납(숨김)하고 해제 시 100% 원복한다.
 */
function buildTopBunHair(hairMat, ribbonMat) {
  const hair = new THREE.Group();
  hair.name = 'hair';

  const capGeo = createHairBaseCapGeometry({ bottomSideY: -0.10, bottomBackY: -0.16, bobFlareAmt: 0.01 });
  hair.add(new THREE.Mesh(capGeo, hairMat));
  addSignatureBangs(hair, hairMat);

  // 얼굴 양옆의 짧은 애교머리
  for (const s of [-1, 1]) {
    const lockGeo = createTaperedStrandGeometry(
      [
        [s * 0.22, 0.19, 0.12],
        [s * 0.305, 0.06, 0.132],
        [s * 0.300, -0.08, 0.120],
        [s * 0.268, -0.155, 0.102],
      ],
      { radiusX: 0.036, radiusY: 0.022, tubularSegments: 16, radialSegments: 10, taperPower: 0.65 }
    );
    hair.add(new THREE.Mesh(lockGeo, hairMat));
  }

  // 상단 묶음 파츠 (모자 착용 시 관통 방지를 위해 독립 제어됨)
  const bunTopGroup = new THREE.Group();
  bunTopGroup.name = 'topBunExtension';

  const bunGeo = new THREE.SphereGeometry(1, 24, 18);
  const bun = new THREE.Mesh(bunGeo, hairMat);
  bun.scale.set(0.145, 0.125, 0.145);
  bun.position.set(0, 0.342, -0.095);
  bunTopGroup.add(bun);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.018, 10, 24), ribbonMat);
  band.rotation.x = Math.PI * 0.5 - 0.35;
  band.position.set(0, 0.282, -0.075);
  bunTopGroup.add(band);

  hair.add(bunTopGroup);

  hair.userData.topParts = [bunTopGroup];
  hair.userData.hatCompat = {
    hatPos: [0.008, 0.200, -0.052],
    hatRot: [-0.32, 0.0, -0.05],
    hatScale: 1.03,
    hideTopPartsWhenHatOn: true,
  };
  return hair;
}

/**
 * 첨부 디자인 시트 기본 모자: 크림색 니트 베레모 (폭신한 돔 + 털실 질감 + 상단 꼭지)
 * - 두상과 헤어 베이스 캡을 여유 있게 감싸 어떤 각도에서도 머리카락 관통이 없도록 설계
 */
export function buildKnitBeret(beretColor = 0xf0e0ca) {
  const group = new THREE.Group();
  group.name = 'defaultKnitBeret';

  const knitTex = getBeretKnitTextures(beretColor);
  const beretMat = new THREE.MeshStandardMaterial({
    map: knitTex.map,
    bumpMap: knitTex.bumpMap,
    bumpScale: 0.008,
    roughness: 0.92,
    metalness: 0.0,
  });

  const pts = [
    new THREE.Vector2(0.258, -0.052),
    new THREE.Vector2(0.305, -0.028),
    new THREE.Vector2(0.372, 0.018),
    new THREE.Vector2(0.380, 0.072),
    new THREE.Vector2(0.344, 0.130),
    new THREE.Vector2(0.258, 0.174),
    new THREE.Vector2(0.132, 0.198),
    new THREE.Vector2(0.001, 0.204),
  ];
  const domeGeo = new THREE.LatheGeometry(pts, 40);
  const dome = new THREE.Mesh(domeGeo, beretMat);
  dome.name = 'beretDome';
  group.add(dome);

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.198, 0),
    new THREE.Vector3(0.004, 0.228, -0.004),
    new THREE.Vector3(0.012, 0.244, -0.010),
  ]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 8, 0.017, 10, false), beretMat);
  const stemTip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 10), beretMat);
  stemTip.position.set(0.012, 0.244, -0.010);
  group.add(stem, stemTip);

  group.position.set(0.010, 0.200, -0.056);
  group.rotation.set(-0.34, 0.0, -0.05);

  return group;
}

/**
 * 프리셋 기반 헤어 그룹 생성
 * - 기본값('longWave' 또는 기존 'bobBuns'): 첨부 이미지의 짙은 초콜릿 브라운 긴 웨이브 헤어
 */
export function buildClayHair(preset, matFn) {
  const hairMat = matFn(preset.hair);
  const accentHairMat = matFn(preset.hairAccent || preset.hair);
  const ribbonMat = matFn(preset.accent || 0x6b4535);

  const style = preset.hairStyle || 'longWave';
  if (style === 'shortBob' || style === 'tufty') {
    return buildShortBobHair(hairMat);
  }
  if (style === 'twinBraids') {
    return buildTwinBraidsHair(hairMat, ribbonMat);
  }
  if (style === 'topBun') {
    return buildTopBunHair(hairMat, ribbonMat);
  }
  return buildLongWaveHair(hairMat, accentHairMat);
}
