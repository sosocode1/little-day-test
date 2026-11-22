// LITTLE DAY - 첨부 디자인 시트 기반 고해상도 CanvasTexture 얼굴 렌더러
// - 첨부 이미지의 둥글고 깊은 초코 브라운 클레이 눈 + 자연스러운 속눈썹 + 은은한 복숭아 볼터치 + 반달 미소 재현
// - 디자인 시트 6종 표정(smile/happy/excited/surprised/thinking/sleepy) + 눈 스타일 3종(round/upturned/dewy) 지원
// - 자동 눈 깜빡임(open/closed) 텍스처 쌍 제공
import * as THREE from 'three';

const TEX_W = 1024;
const TEX_H = 512;

function toHex(colorInt) {
  return '#' + (colorInt & 0xffffff).toString(16).padStart(6, '0');
}

function mixRgb(c1, c2, ratio) {
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 첨부 디자인 시트 기준: 크고 둥글며 표면에 매끄럽게 밀착된 클레이 눈
 * (흰자가 튀어나오지 않고 깊은 다크 브라운 구슬 + 부드러운 하단 그라데이션 + 은은한 하이라이트)
 */
function drawClayEye(ctx, cx, cy, side, { eyeColor, eyeStyle = 'round', expression = 'smile', hasLashes = true }) {
  ctx.save();
  ctx.translate(cx, cy);

  // 활짝 웃음 / 졸림은 전용 감은 눈 곡선으로 렌더링
  if (expression === 'happy') {
    ctx.beginPath();
    ctx.moveTo(-22, 4);
    ctx.quadraticCurveTo(0, -16, 22, 4);
    ctx.strokeStyle = '#472a20';
    ctx.lineWidth = 6.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (expression === 'sleepy') {
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.quadraticCurveTo(0, 14, 22, 2);
    ctx.strokeStyle = '#472a20';
    ctx.lineWidth = 5.4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 눈 스타일별 형태 비율 (첨부 시트 '눈 스타일' 3종 기준)
  let rx = 21.5;
  let ry = 25.5;
  let tilt = 0;

  if (eyeStyle === 'upturned') {
    rx = 19.5;
    ry = 25.5;
    tilt = side * -0.11;
  } else if (eyeStyle === 'dewy') {
    rx = 22.5;
    ry = 26.5;
  }

  if (expression === 'surprised') {
    rx *= 1.05;
    ry *= 1.08;
  }

  ctx.rotate(tilt);

  // 1. 눈 주변 아주 은은한 점토 눈확 음영 (돌출감 없이 포근하게 안착)
  const socketGrad = ctx.createRadialGradient(0, 2, rx * 0.65, 0, 2, rx * 1.48);
  socketGrad.addColorStop(0, 'rgba(175, 118, 98, 0.18)');
  socketGrad.addColorStop(1, 'rgba(175, 118, 98, 0)');
  ctx.fillStyle = socketGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2, rx * 1.48, ry * 1.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. 눈 본체 (첨부 시트처럼 크고 동글동글한 깊은 초코 브라운 홍채 중심)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  // 위쪽은 깊고 진하게, 아래쪽은 따뜻한 브라운/선택 눈동자 색으로 부드럽게 그라데이션
  const baseGrad = ctx.createLinearGradient(0, -ry, 0, ry);
  baseGrad.addColorStop(0, mixRgb(eyeColor, 0x1e100b, 0.68));
  baseGrad.addColorStop(0.48, mixRgb(eyeColor, 0x2b1710, 0.35));
  baseGrad.addColorStop(0.84, toHex(eyeColor));
  baseGrad.addColorStop(1, mixRgb(eyeColor, 0xffdfc4, 0.36));

  ctx.fillStyle = baseGrad;
  ctx.fillRect(-rx - 4, -ry - 4, rx * 2 + 8, ry * 2 + 8);

  // 하단 부드러운 반사광 초승달 (촉촉하고 따뜻한 눈빛)
  const crescentAlpha = eyeStyle === 'dewy' || expression === 'excited' ? 0.38 : 0.24;
  ctx.beginPath();
  ctx.ellipse(0, ry * 0.48, rx * 0.68, ry * 0.34, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 224, 194, ${crescentAlpha})`;
  ctx.fill();

  // 중앙 부드러운 동공 (경계가 날카롭지 않게 방사형 그라데이션으로 융합)
  const gazeShiftX = expression === 'thinking' ? 5.5 : 0;
  const gazeShiftY = expression === 'thinking' ? -3.5 : -1.5;
  const pupilGrad = ctx.createRadialGradient(
    gazeShiftX,
    gazeShiftY,
    2,
    gazeShiftX,
    gazeShiftY,
    rx * 0.56
  );
  pupilGrad.addColorStop(0, 'rgba(30, 16, 12, 0.78)');
  pupilGrad.addColorStop(0.7, 'rgba(38, 21, 16, 0.42)');
  pupilGrad.addColorStop(1, 'rgba(38, 21, 16, 0)');
  ctx.fillStyle = pupilGrad;
  ctx.beginPath();
  ctx.ellipse(gazeShiftX, gazeShiftY, rx * 0.56, ry * 0.56, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. 과하지 않고 맑은 하이라이트 (첨부 이미지 기준: 좌상단 부드러운 원형 1개 + 촉촉/신남일 때 작은 보조점)
  ctx.beginPath();
  ctx.ellipse(-rx * 0.33 + gazeShiftX * 0.3, -ry * 0.34, 6.2, 6.8, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 253, 250, 0.94)';
  ctx.fill();

  if (eyeStyle === 'dewy' || expression === 'excited') {
    ctx.beginPath();
    ctx.arc(rx * 0.30, ry * 0.32, 3.0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 252, 248, 0.85)';
    ctx.fill();
  }

  ctx.restore(); // 눈 클립 해제

  // 4. 부드러운 눈 테두리 & 자연스러운 속눈썹 (검은 윤곽선 대신 따뜻한 다크 코코아)
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.06, Math.PI * 1.94);
  ctx.strokeStyle = '#3b2219';
  ctx.lineWidth = hasLashes ? 4.4 : 3.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  if (hasLashes) {
    // 바깥쪽 끝에 과하지 않고 섬세한 속눈썹 포인트
    ctx.strokeStyle = '#3b2219';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.lineWidth = 3.2;
    ctx.moveTo(side * (rx - 2), -ry * 0.30);
    ctx.quadraticCurveTo(side * (rx + 4.5), -ry * 0.42, side * (rx + 6.5), -ry * 0.56);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2.4;
    ctx.moveTo(side * (rx - 0.5), -ry * 0.08);
    ctx.quadraticCurveTo(side * (rx + 4.0), -ry * 0.14, side * (rx + 5.8), -ry * 0.24);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEyeBlink(ctx, cx, cy, side, hasLashes) {
  ctx.save();
  ctx.translate(cx, cy + 5);
  ctx.beginPath();
  ctx.moveTo(-21, 1);
  ctx.quadraticCurveTo(0, -10, 21, 1);
  ctx.strokeStyle = '#42261c';
  ctx.lineWidth = hasLashes ? 4.8 : 3.8;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawMouth(ctx, cx, cy, expression) {
  ctx.save();
  ctx.translate(cx, cy);

  if (expression === 'happy') {
    // 활짝 웃는 반달 입
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.quadraticCurveTo(0, -5, 16, -2);
    ctx.quadraticCurveTo(13, 18, 0, 18);
    ctx.quadraticCurveTo(-13, 18, -16, -2);
    ctx.closePath();
    ctx.fillStyle = '#e48382';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 10, 9, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5a8a4';
    ctx.fill();
  } else if (expression === 'excited') {
    // 신난 동그란 웃음 입
    ctx.beginPath();
    ctx.ellipse(0, 4, 10.5, 11.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e07d7d';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 8, 6.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f4a5a2';
    ctx.fill();
  } else if (expression === 'surprised') {
    // 작은 동그란 놀란 입
    ctx.beginPath();
    ctx.ellipse(0, 4, 7.5, 9.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#de8180';
    ctx.fill();
  } else if (expression === 'thinking') {
    // 생각 중인 작은 오므린 입
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.quadraticCurveTo(0, 0.5, 7, 3.5);
    ctx.strokeStyle = '#c97170';
    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.stroke();
  } else if (expression === 'sleepy') {
    // 졸린 작은 미소
    ctx.beginPath();
    ctx.moveTo(-8, 3);
    ctx.quadraticCurveTo(0, 7, 8, 3);
    ctx.strokeStyle = '#ca7474';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.stroke();
  } else {
    // 첨부 디자인 시트 기본 미소: 작고 사랑스러운 코랄 핑크 반달 미소
    // 아랫입술 은은한 혈색 음영
    const shade = ctx.createRadialGradient(0, 7, 1, 0, 7, 16);
    shade.addColorStop(0, 'rgba(235, 130, 126, 0.24)');
    shade.addColorStop(1, 'rgba(235, 130, 126, 0)');
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(0, 7, 16, 0, Math.PI * 2);
    ctx.fill();

    // 앙증맞은 반달 열린 미소 (시트 왼쪽 대표 캐릭터 표정)
    ctx.beginPath();
    ctx.moveTo(-12.5, -1);
    ctx.quadraticCurveTo(0, -3.5, 12.5, -1);
    ctx.quadraticCurveTo(10.5, 12.5, 0, 12.5);
    ctx.quadraticCurveTo(-10.5, 12.5, -12.5, -1);
    ctx.closePath();
    ctx.fillStyle = '#e18280';
    ctx.fill();

    // 입 안쪽 밝은 복숭아 톤 (부드럽고 입체감 있게)
    ctx.beginPath();
    ctx.ellipse(0, 7.2, 6.8, 3.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5aba6';
    ctx.fill();

    // 윗입술 경계 부드러운 정리선
    ctx.beginPath();
    ctx.moveTo(-12.5, -1);
    ctx.quadraticCurveTo(0, -3.2, 12.5, -1);
    ctx.strokeStyle = '#c86c6c';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.restore();
}

function renderFaceCanvas(options, isBlink = false) {
  const {
    skin = 0xffe4d2,
    eyeColor = 0x523225,
    hairColor = 0x6b4432,
    eyeStyle = 'round',
    expression = 'smile',
    lashes = true,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');

  // 1. 부드럽고 따뜻한 클레이 피부 베이스
  ctx.fillStyle = toHex(skin);
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  const centerX = TEX_W * 0.5;

  // 얼굴 정면 부드러운 하이라이트 & 턱 아래 따뜻한 음영 (점토 인형 볼륨감)
  const softLight = ctx.createRadialGradient(centerX, 275, 18, centerX, 275, 200);
  softLight.addColorStop(0, 'rgba(255, 250, 245, 0.16)');
  softLight.addColorStop(1, 'rgba(255, 250, 245, 0)');
  ctx.fillStyle = softLight;
  ctx.fillRect(centerX - 210, 90, 420, 380);

  // 2. 은은하고 넓은 복숭아색 볼터치 (새로 넓고 통통해진 양 볼 중앙에 포근하게 배치)
  const blushOffsetX = 98;
  const blushY = 320;
  for (const s of [-1, 1]) {
    const bx = centerX + s * blushOffsetX;
    ctx.save();
    ctx.translate(bx, blushY);
    ctx.scale(1.48, 0.92);
    const blushGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 38);
    blushGrad.addColorStop(0, 'rgba(255, 138, 132, 0.46)');
    blushGrad.addColorStop(0.55, 'rgba(255, 152, 146, 0.22)');
    blushGrad.addColorStop(1, 'rgba(255, 152, 146, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. 크고 둥근 갈색 눈 (통통한 U자 얼굴형 비율에 맞게 넓고 안정적으로 배치)
  const eyeOffsetX = 66;
  const eyeY = 289;
  for (const s of [-1, 1]) {
    if (isBlink && expression !== 'happy' && expression !== 'sleepy') {
      drawEyeBlink(ctx, centerX + s * eyeOffsetX, eyeY, s, lashes);
    } else {
      drawClayEye(ctx, centerX + s * eyeOffsetX, eyeY, s, {
        eyeColor,
        eyeStyle,
        expression,
        hasLashes: lashes,
      });
    }
  }

  // 4. 부드러운 짧은 눈썹 (앞머리 아래 은은하게 보임)
  const browColor = mixRgb(hairColor, 0x3b2218, 0.35);
  ctx.strokeStyle = browColor;
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const bx = centerX + s * eyeOffsetX;
    let by = eyeY - 39;
    if (expression === 'surprised') by -= 7;
    if (expression === 'thinking' && s > 0) by -= 5;

    ctx.beginPath();
    ctx.moveTo(bx - s * 14, by + 2);
    ctx.quadraticCurveTo(bx, by - 4.5, bx + s * 15, by + 2.5);
    ctx.stroke();
  }

  // 5. 작은 코 아래 아주 은은한 복숭아 음영 (3D 단추코와 일체화)
  const noseShade = ctx.createRadialGradient(centerX, 314, 1, centerX, 314, 8);
  noseShade.addColorStop(0, 'rgba(202, 134, 114, 0.20)');
  noseShade.addColorStop(1, 'rgba(202, 134, 114, 0)');
  ctx.fillStyle = noseShade;
  ctx.beginPath();
  ctx.arc(centerX, 314, 8, 0, Math.PI * 2);
  ctx.fill();

  // 6. 작고 사랑스러운 반달 미소 (통통한 볼과 둥근 U자 턱선 사이의 자연스러운 위치)
  drawMouth(ctx, centerX, 336, expression);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export function createFaceTextureSet(options = {}) {
  const open = renderFaceCanvas(options, false);
  const closed = renderFaceCanvas(options, true);
  return {
    open,
    closed,
    dispose() {
      open.dispose();
      closed.dispose();
    },
  };
}
