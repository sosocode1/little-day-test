// LITTLE DAY - 첨부 디자인 시트 기반 프로시저럴 클레이/니트/체크 PBR 텍스처 생성기
// - 크림 니트 가디건 케이블 짜임 (Color + Bump)
// - 크림 니트 베레모 털실 질감 (Color + Bump)
// - 브라운 타탄 체크 플리츠 스커트 패턴
// - 크림 골지 니삭스 패턴 (Color + Bump)
import * as THREE from 'three';

function toHex(colorInt) {
  return '#' + (colorInt & 0xffffff).toString(16).padStart(6, '0');
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function configureTex(canvas, { repeatX = 1, repeatY = 1, isColor = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 크림 니트 가디건용 케이블 니트(꽈배기 + 골지) 컬러 & 범프 텍스처 세트
 */
const cableCache = new Map();
export function getCableKnitTextures(baseColor = 0xf3e4cd) {
  if (cableCache.has(baseColor)) return cableCache.get(baseColor);

  const W = 512;
  const H = 512;
  const colorCanvas = makeCanvas(W, H);
  const bumpCanvas = makeCanvas(W, H);
  const cctx = colorCanvas.getContext('2d');
  const bctx = bumpCanvas.getContext('2d');

  // 베이스
  cctx.fillStyle = toHex(baseColor);
  cctx.fillRect(0, 0, W, H);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, W, H);

  // 1. 미세한 니트 뜨개코(V자 스티치) 격자
  const cols = 32;
  const rows = 48;
  const cw = W / cols;
  const ch = H / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cw;
      const py = y * ch;
      cctx.strokeStyle = 'rgba(165, 132, 98, 0.14)';
      cctx.lineWidth = 1.4;
      cctx.beginPath();
      cctx.moveTo(px + 2, py + 2);
      cctx.lineTo(px + cw * 0.5, py + ch - 2);
      cctx.lineTo(px + cw - 2, py + 2);
      cctx.stroke();

      bctx.strokeStyle = 'rgba(210, 210, 210, 0.35)';
      bctx.lineWidth = 1.8;
      bctx.beginPath();
      bctx.moveTo(px + 2, py + 2);
      bctx.lineTo(px + cw * 0.5, py + ch - 2);
      bctx.lineTo(px + cw - 2, py + 2);
      bctx.stroke();
    }
  }

  // 2. 세로 케이블 꼬임(브레이드) 컬럼 4줄 + 골지 구분선
  const numCables = 4;
  const segW = W / numCables;
  for (let k = 0; k < numCables; k++) {
    const cx = (k + 0.5) * segW;

    // 골지 세로 음영 라인
    for (const dx of [-segW * 0.36, segW * 0.36]) {
      cctx.fillStyle = 'rgba(150, 118, 86, 0.16)';
      cctx.fillRect(cx + dx - 3, 0, 6, H);
      bctx.fillStyle = 'rgba(55, 55, 55, 0.6)';
      bctx.fillRect(cx + dx - 3, 0, 6, H);
    }

    // 꽈배기 케이블 S자 교차
    const twists = 4;
    const twistH = H / twists;
    for (let t = -1; t <= twists; t++) {
      const y0 = t * twistH;
      const yMid = y0 + twistH * 0.5;
      const y1 = y0 + twistH;

      // 왼쪽 -> 오른쪽 꼬임
      const drawCableStrand = (ctx, stroke, width, flip) => {
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const s = flip ? -1 : 1;
        ctx.moveTo(cx - s * 16, y0);
        ctx.bezierCurveTo(cx - s * 22, y0 + twistH * 0.33, cx + s * 22, y0 + twistH * 0.66, cx + s * 16, y1);
        ctx.stroke();
        ctx.restore();
      };

      // 그림자 + 밝은 볼륨 하이라이트
      drawCableStrand(cctx, 'rgba(155, 122, 90, 0.22)', 20, false);
      drawCableStrand(cctx, 'rgba(255, 250, 240, 0.35)', 12, false);
      drawCableStrand(bctx, 'rgba(235, 235, 235, 0.72)', 16, false);

      drawCableStrand(cctx, 'rgba(155, 122, 90, 0.22)', 20, true);
      drawCableStrand(cctx, 'rgba(255, 250, 240, 0.38)', 12, true);
      drawCableStrand(bctx, 'rgba(245, 245, 245, 0.78)', 16, true);

      // 교차 지점 중앙 부드러운 음영
      cctx.fillStyle = 'rgba(145, 112, 82, 0.12)';
      cctx.beginPath();
      cctx.arc(cx, yMid, 9, 0, Math.PI * 2);
      cctx.fill();
    }
  }

  const result = {
    map: configureTex(colorCanvas, { repeatX: 2.5, repeatY: 1.4, isColor: true }),
    bumpMap: configureTex(bumpCanvas, { repeatX: 2.5, repeatY: 1.4, isColor: false }),
  };
  cableCache.set(baseColor, result);
  return result;
}

/**
 * 크림 니트 베레모용 부드러운 털실 편직 컬러 & 범프 텍스처
 */
const beretCache = new Map();
export function getBeretKnitTextures(baseColor = 0xf0e0ca) {
  if (beretCache.has(baseColor)) return beretCache.get(baseColor);

  const W = 512;
  const H = 512;
  const colorCanvas = makeCanvas(W, H);
  const bumpCanvas = makeCanvas(W, H);
  const cctx = colorCanvas.getContext('2d');
  const bctx = bumpCanvas.getContext('2d');

  cctx.fillStyle = toHex(baseColor);
  cctx.fillRect(0, 0, W, H);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, W, H);

  // 부드러운 세로/가로 니트 리브 + 포근한 털실 결
  const cols = 48;
  const rows = 56;
  const cw = W / cols;
  const ch = H / rows;

  for (let x = 0; x < cols; x++) {
    const px = x * cw;
    const isRidge = x % 2 === 0;
    cctx.fillStyle = isRidge ? 'rgba(255, 250, 242, 0.10)' : 'rgba(168, 136, 106, 0.05)';
    cctx.fillRect(px, 0, cw, H);
    bctx.fillStyle = isRidge ? '#929292' : '#727272';
    bctx.fillRect(px, 0, cw, H);
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cw;
      const py = y * ch;
      cctx.strokeStyle = 'rgba(155, 124, 94, 0.11)';
      cctx.lineWidth = 1.2;
      cctx.beginPath();
      cctx.moveTo(px + 1, py + 1);
      cctx.lineTo(px + cw * 0.5, py + ch - 1);
      cctx.lineTo(px + cw - 1, py + 1);
      cctx.stroke();

      bctx.strokeStyle = 'rgba(230, 230, 230, 0.35)';
      bctx.lineWidth = 1.3;
      bctx.beginPath();
      bctx.moveTo(px + 1, py + 1);
      bctx.lineTo(px + cw * 0.5, py + ch - 1);
      bctx.lineTo(px + cw - 1, py + 1);
      bctx.stroke();
    }
  }

  const result = {
    map: configureTex(colorCanvas, { repeatX: 2.2, repeatY: 1.5, isColor: true }),
    bumpMap: configureTex(bumpCanvas, { repeatX: 2.2, repeatY: 1.5, isColor: false }),
  };
  beretCache.set(baseColor, result);
  return result;
}

/**
 * 첨부 이미지의 브라운 타탄 체크 플리츠 스커트 텍스처
 * - 다크 코코아/로즈 브라운 베이스 + 짙은 브라운 밴드 + 크림/베이지 교차 체크선
 */
const plaidCache = new Map();
export function getPlaidSkirtTexture(baseColor = 0x6c423b) {
  if (plaidCache.has(baseColor)) return plaidCache.get(baseColor);

  const S = 512;
  const canvas = makeCanvas(S, S);
  const ctx = canvas.getContext('2d');

  // 1. 따뜻한 코코아 로즈 브라운 바탕
  ctx.fillStyle = toHex(baseColor);
  ctx.fillRect(0, 0, S, S);

  // 2. 두꺼운 짙은 초코 브라운 체크 밴드 (가로 + 세로)
  const bandPositions = [0, 256];
  ctx.fillStyle = 'rgba(66, 36, 32, 0.52)';
  for (const pos of bandPositions) {
    ctx.fillRect(pos, 0, 96, S);
    ctx.fillRect(0, pos, S, 96);
  }

  // 3. 중간 버건디/모카 톤 교차 밴드
  ctx.fillStyle = 'rgba(138, 78, 68, 0.36)';
  for (const pos of [128, 384]) {
    ctx.fillRect(pos, 0, 52, S);
    ctx.fillRect(0, pos, S, 52);
  }

  // 4. 가는 크림 아이보리 체크 포인트 라인 (첨부 시트의 선명하고 사랑스러운 타탄 격자)
  ctx.fillStyle = 'rgba(244, 228, 206, 0.78)';
  for (const pos of [44, 300]) {
    ctx.fillRect(pos, 0, 8, S);
    ctx.fillRect(0, pos, S, 8);
  }

  // 5. 보조 베이지 더블 핀스트라이프
  ctx.fillStyle = 'rgba(216, 182, 146, 0.55)';
  for (const pos of [150, 162, 406, 418]) {
    ctx.fillRect(pos, 0, 4, S);
    ctx.fillRect(0, pos, S, 4);
  }

  // 6. 은은한 모직 원단 직조감
  ctx.fillStyle = 'rgba(255, 245, 232, 0.05)';
  for (let i = 0; i < S; i += 4) {
    ctx.fillRect(i, 0, 1, S);
    ctx.fillRect(0, i, S, 1);
  }

  const tex = configureTex(canvas, { repeatX: 4.5, repeatY: 1.25, isColor: true });
  plaidCache.set(baseColor, tex);
  return tex;
}

/**
 * 크림색 골지 니삭스 텍스처 (세로 주름 + 부드러운 범프)
 */
const sockCache = new Map();
export function getRibbedSockTextures(baseColor = 0xf4e8d8) {
  if (sockCache.has(baseColor)) return sockCache.get(baseColor);

  const W = 256;
  const H = 256;
  const colorCanvas = makeCanvas(W, H);
  const bumpCanvas = makeCanvas(W, H);
  const cctx = colorCanvas.getContext('2d');
  const bctx = bumpCanvas.getContext('2d');

  cctx.fillStyle = toHex(baseColor);
  cctx.fillRect(0, 0, W, H);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, W, H);

  const ribs = 24;
  const rw = W / ribs;
  for (let i = 0; i < ribs; i++) {
    const px = i * rw;
    cctx.fillStyle = i % 2 === 0 ? 'rgba(255, 252, 246, 0.28)' : 'rgba(176, 148, 120, 0.16)';
    cctx.fillRect(px, 0, rw, H);
    bctx.fillStyle = i % 2 === 0 ? '#bcbcbc' : '#585858';
    bctx.fillRect(px, 0, rw, H);
  }

  const result = {
    map: configureTex(colorCanvas, { repeatX: 1, repeatY: 1, isColor: true }),
    bumpMap: configureTex(bumpCanvas, { repeatX: 1, repeatY: 1, isColor: false }),
  };
  sockCache.set(baseColor, result);
  return result;
}
