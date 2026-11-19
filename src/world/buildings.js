import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { clay } from './materials.js';

const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);

function mk(geo, color, [x, y, z], ry = 0) {
  const m = new THREE.Mesh(geo, clay(color));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  return m;
}

// 작은 유럽풍 집 (그레이박스). 정면은 로컬 +z. 나중에 GLB로 통째로 교체 가능한 Group.
export function createHouse({
  width = 5,
  depth = 4.4,
  height = 2.6,
  roofHeight = 2.2,
  wall = 0xffdcc8,
  roof = 0xb7d5f5,
  door = 0x9fc7ea,
  trim = 0xfffaf2,
  chimney = 0xe8b7a6,
  glass = 0xcfeaf7,
  isPlayerHouse = false,
} = {}) {
  const g = new THREE.Group();
  g.name = isPlayerHouse ? 'player-cottage' : 'house';

  g.add(mk(rbox(width + 0.3, 0.35, depth + 0.3, 0.1), trim, [0, 0.175, 0])); // 기단
  const body = mk(rbox(width, height, depth, 0.28), wall, [0, height / 2 + 0.05, 0]);
  g.add(body);

  // 지붕 (사각뿔) – 처마가 살짝 튀어나오게
  const roofGeo = new THREE.ConeGeometry(Math.SQRT2, roofHeight, 4, 1).rotateY(Math.PI / 4);
  const roofMesh = mk(roofGeo, roof, [0, height + roofHeight / 2 - 0.05, 0]);
  roofMesh.scale.set(width / 2 + 0.5, 1, depth / 2 + 0.5);
  g.add(roofMesh);

  g.add(mk(rbox(0.6, 1.2, 0.6, 0.1), chimney, [width * 0.22, height + roofHeight * 0.38, -depth * 0.15]));

  // 문
  const zf = depth / 2;
  g.add(mk(rbox(1.2, 1.75, 0.1, 0.06), trim, [0, 0.95, zf + 0.01]));
  g.add(mk(rbox(0.95, 1.55, 0.14, 0.06), door, [0, 0.9, zf + 0.04]));
  g.add(mk(new THREE.SphereGeometry(0.06, 10, 8), 0xfff1a8, [0.3, 0.9, zf + 0.13]));
  g.add(mk(rbox(1.6, 0.12, 0.7, 0.05), trim, [0, 0.06, zf + 0.4])); // 현관 계단

  // 앞/옆 창문 (야간 창문 점등 연출을 위해 전용 유리 메쉬 설정)
  const wy = height * 0.6 + 0.05;
  for (const s of [-1, 1]) {
    const wx = s * (width / 2 - 0.95);
    g.add(mk(rbox(1.0, 1.0, 0.1, 0.06), trim, [wx, wy, zf + 0.01]));

    const frontGlass = mk(rbox(0.78, 0.78, 0.12, 0.05), glass, [wx, wy, zf + 0.04]);
    frontGlass.name = 'window-glass';
    frontGlass.material = new THREE.MeshStandardMaterial({ color: glass, roughness: 1, metalness: 0 });
    g.add(frontGlass);

    g.add(mk(rbox(0.2, 0.9, 0.1, 0.05), door, [wx + s * 0.62, wy, zf + 0.03])); // 덧창
    g.add(mk(rbox(1.0, 0.18, 0.28, 0.06), door, [wx, wy - 0.62, zf + 0.15])); // 꽃 상자

    g.add(mk(rbox(0.1, 1.0, 1.0, 0.06), trim, [s * (width / 2 + 0.01), wy, 0]));
    const sideGlass = mk(rbox(0.12, 0.78, 0.78, 0.05), glass, [s * (width / 2 + 0.04), wy, 0]);
    sideGlass.name = 'window-glass';
    sideGlass.material = new THREE.MeshStandardMaterial({ color: glass, roughness: 1, metalness: 0 });
    g.add(sideGlass);
  }

  // 플레이어 별장 전용 외관 장식 (문패, 우편함, 꽃 화분)
  if (isPlayerHouse) {
    // 1. [문패] "MY LITTLE HOME" 현관문 상단 목재 명판
    g.add(mk(rbox(1.4, 0.36, 0.05, 0.04), 0x9c6644, [0, 2.05, zf + 0.04])); // 원목 프레임
    g.add(mk(rbox(1.3, 0.28, 0.06, 0.03), 0xfffbf2, [0, 2.05, zf + 0.05])); // 크림색 명판

    // 고해상도 캔버스 문패 텍스처
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fffdf7';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#d49b80';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 112);
        ctx.fillStyle = '#6b3f2c';
        ctx.font = 'bold 44px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏡 MY LITTLE HOME', 256, 64);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const plaqueMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.26), plaqueMat);
        textPlane.position.set(0, 2.05, zf + 0.09);
        g.add(textPlane);
      }
    }

    // 2. [우편함] 현관 우측 원목 기둥 + 파스텔 핑크 우편함 + 빨간 깃발
    g.add(mk(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 8), 0x8a5a40, [1.25, 0.475, zf + 0.55]));
    g.add(mk(rbox(0.3, 0.26, 0.42, 0.05), 0xffe2eb, [1.25, 0.96, zf + 0.55]));
    const domeMesh = mk(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 16, 1, false, 0, Math.PI), 0xffccd9, [1.25, 1.09, zf + 0.55]);
    domeMesh.rotation.z = Math.PI / 2;
    g.add(domeMesh);
    g.add(mk(rbox(0.16, 0.025, 0.02, 0.01), 0x5a3d48, [1.25, 0.98, zf + 0.77])); // 투입구
    // 빨간 깃발
    const flagArm = mk(rbox(0.02, 0.16, 0.02, 0.01), 0xff4d6d, [1.42, 1.05, zf + 0.55]);
    flagArm.rotation.x = 0.35;
    g.add(flagArm);
    g.add(mk(rbox(0.02, 0.08, 0.11, 0.01), 0xff3b5c, [1.42, 1.13, zf + 0.51]));

    // 3. [화분 소품] 현관 좌측 테라코타 꽃화분 + 라벤더 화분
    // (1) 대형 테라코타 꽃화분
    g.add(mk(new THREE.CylinderGeometry(0.24, 0.18, 0.36, 12), 0xde7b59, [-1.25, 0.18, zf + 0.55]));
    g.add(mk(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), 0x422f20, [-1.25, 0.35, zf + 0.55]));
    // 풍성한 잎사귀 덩어리
    g.add(mk(new THREE.SphereGeometry(0.14, 8, 6), 0x76b889, [-1.25, 0.42, zf + 0.55]));
    g.add(mk(new THREE.SphereGeometry(0.1, 8, 6), 0x8ec89a, [-1.15, 0.44, zf + 0.58]));
    g.add(mk(new THREE.SphereGeometry(0.1, 8, 6), 0x6ca37d, [-1.35, 0.43, zf + 0.52]));
    // 알록달록 꽃송이들
    g.add(mk(new THREE.SphereGeometry(0.045, 6, 6), 0xff8fa3, [-1.22, 0.52, zf + 0.56])); // 핑크
    g.add(mk(new THREE.SphereGeometry(0.04, 6, 6), 0xffde59, [-1.14, 0.49, zf + 0.62]));  // 옐로우
    g.add(mk(new THREE.SphereGeometry(0.042, 6, 6), 0xffffff, [-1.34, 0.48, zf + 0.58])); // 화이트

    // (2) 소형 라벤더 화분
    g.add(mk(new THREE.CylinderGeometry(0.17, 0.13, 0.28, 12), 0xc5b3e6, [-1.65, 0.14, zf + 0.42]));
    g.add(mk(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 12), 0x422f20, [-1.65, 0.27, zf + 0.42]));
    g.add(mk(new THREE.ConeGeometry(0.12, 0.26, 8), 0x9370db, [-1.65, 0.4, zf + 0.42]));
    g.add(mk(new THREE.ConeGeometry(0.09, 0.22, 8), 0xb39ddb, [-1.58, 0.37, zf + 0.45]));
  }

  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

// 충돌 박스 정보 (집 중심, 로컬 크기 → 콜라이더)
export function houseCollider(x, z, rot, { width = 5, depth = 4.4 } = {}) {
  return { type: 'box', x, z, hw: width / 2 + 0.15, hd: depth / 2 + 0.15, rot };
}
