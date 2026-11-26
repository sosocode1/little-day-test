// 동물 NPC 머리 위 이름표 및 말풍선/느낌표/밤 단서 표시 UI (3D -> 2D 투영)
import * as THREE from 'three';

export function createNpcOverheadUI() {
  const prevStyle = document.getElementById('little-day-npc-overhead-style');
  if (prevStyle) prevStyle.remove();
  const prevLayer = document.getElementById('npc-overhead-layer');
  if (prevLayer) prevLayer.remove();

  const style = document.createElement('style');
  style.id = 'little-day-npc-overhead-style';
  style.textContent = `
    #npc-overhead-layer {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 92;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .npc-overhead-tag {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.22s ease;
      will-change: transform, opacity;
      user-select: none;
    }
    .npc-overhead-tag.visible {
      opacity: 1;
    }

    /* 말풍선 / 느낌표 / 밤 단서 아이콘 배지 */
    .npc-overhead-bubble {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 30px;
      height: 30px;
      padding: 0 8px;
      border-radius: 999px;
      background: linear-gradient(180deg, #fffdf9 0%, #fff1e8 100%);
      border: 2px solid #f2cbb8;
      box-shadow:
        0 5px 14px rgba(145, 95, 88, 0.24),
        inset 0 2px 3px rgba(255, 255, 255, 0.92),
        inset 0 -2px 4px rgba(235, 188, 170, 0.3);
      font-size: 14px;
      font-weight: 900;
      color: #8f4d48;
      position: relative;
      animation: npcOverheadFloat 2.1s ease-in-out infinite;
    }
    .npc-overhead-bubble::after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 50%;
      width: 8px;
      height: 8px;
      background: #fff2ea;
      border-right: 2px solid #f2cbb8;
      border-bottom: 2px solid #f2cbb8;
      transform: translateX(-50%) rotate(45deg);
    }

    /* 퀘스트 제안 가능 느낌표(!) 강조 */
    .npc-overhead-tag.type-quest .npc-overhead-bubble {
      background: linear-gradient(135deg, #ffbe66 0%, #ff8b66 100%);
      border-color: #fff3dd;
      color: #ffffff;
      font-size: 16px;
      box-shadow:
        0 6px 16px rgba(235, 118, 76, 0.42),
        inset 0 2px 4px rgba(255, 255, 255, 0.65);
    }
    .npc-overhead-tag.type-quest .npc-overhead-bubble::after {
      background: #ff9866;
      border-right-color: #fff3dd;
      border-bottom-color: #fff3dd;
    }

    /* 밤 시간대 수인/단서 말풍선 강조 */
    .npc-overhead-tag.type-night .npc-overhead-bubble {
      background: linear-gradient(135deg, #6c64a8 0%, #48407a 100%);
      border-color: #cfc6ff;
      color: #fff5c4;
      font-size: 14px;
      box-shadow:
        0 6px 18px rgba(72, 62, 130, 0.48),
        inset 0 2px 4px rgba(255, 255, 255, 0.35);
    }
    .npc-overhead-tag.type-night .npc-overhead-bubble::after {
      background: #524989;
      border-right-color: #cfc6ff;
      border-bottom-color: #cfc6ff;
    }

    /* 이름 배지 */
    .npc-overhead-name {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(255, 252, 248, 0.94);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1.8px solid #f2d2dc;
      box-shadow:
        0 4px 12px rgba(120, 82, 92, 0.2),
        inset 0 1px 3px rgba(255, 255, 255, 0.9);
      font-size: 12.5px;
      font-weight: 800;
      color: #5a3c45;
      letter-spacing: -0.01em;
      white-space: nowrap;
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .npc-overhead-tag.is-night .npc-overhead-name {
      background: rgba(46, 40, 72, 0.92);
      border-color: #9e93d6;
      color: #f4eeff;
      box-shadow: 0 4px 14px rgba(28, 22, 54, 0.42);
    }

    /* 상호작용 가능 거리(E 대화 가능) 진입 시 강조 */
    .npc-overhead-tag.in-range .npc-overhead-name {
      transform: scale(1.06);
      border-color: #ff9eb8;
      background: rgba(255, 253, 250, 0.98);
      box-shadow:
        0 6px 18px rgba(230, 125, 155, 0.3),
        0 0 0 3px rgba(255, 198, 214, 0.38);
      color: #6b3548;
    }
    .npc-overhead-tag.is-night.in-range .npc-overhead-name {
      border-color: #d6c8ff;
      background: rgba(58, 50, 92, 0.96);
      color: #ffffff;
      box-shadow:
        0 6px 18px rgba(96, 82, 175, 0.45),
        0 0 0 3px rgba(190, 178, 255, 0.35);
    }

    @keyframes npcOverheadFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @media (max-width: 768px) {
      .npc-overhead-bubble {
        min-width: 26px;
        height: 26px;
        font-size: 13px;
      }
      .npc-overhead-name {
        padding: 3px 10px;
        font-size: 11.5px;
      }
    }
  `;
  document.head.appendChild(style);

  const layerEl = document.createElement('div');
  layerEl.id = 'npc-overhead-layer';
  document.body.appendChild(layerEl);

  const markers = new Map();
  const projected = new THREE.Vector3();

  function getOrCreateMarker(npc) {
    const key = npc.id || npc.type;
    if (markers.has(key)) return markers.get(key);

    const el = document.createElement('div');
    el.className = 'npc-overhead-tag';
    el.dataset.npcId = key;
    el.innerHTML = `
      <div class="npc-overhead-bubble" aria-hidden="true">💬</div>
      <div class="npc-overhead-name"></div>
    `;
    layerEl.appendChild(el);

    const entry = {
      el,
      bubbleEl: el.querySelector('.npc-overhead-bubble'),
      nameEl: el.querySelector('.npc-overhead-name')
    };
    markers.set(key, entry);
    return entry;
  }

  function hideAll() {
    for (const entry of markers.values()) {
      entry.el.classList.remove('visible', 'in-range');
    }
  }

  return {
    hideAll,
    update({ npcs = [], playerPos = null, camera = null, visible = true, isNight = false, getIndicatorType = null }) {
      if (!visible || !camera || !playerPos || !Array.isArray(npcs) || npcs.length === 0) {
        hideAll();
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const activeKeys = new Set();

      for (const npc of npcs) {
        if (!npc || !npc.position || npc.talkable === false) continue;
        const key = npc.id || npc.type;
        activeKeys.add(key);

        const entry = getOrCreateMarker(npc);
        const dx = playerPos.x - npc.position.x;
        const dz = playerPos.z - npc.position.z;
        const dist = Math.hypot(dx, dz);
        const showDist = npc.overheadRadius ?? 5.5;
        const interactDist = npc.interactRadius ?? 2.8;

        if (dist > showDist) {
          entry.el.classList.remove('visible', 'in-range');
          continue;
        }

        projected.set(npc.position.x, (npc.position.y || 0) + (npc.headHeight ?? 1.82), npc.position.z);
        projected.project(camera);

        if (projected.z > 1 || projected.z < -1) {
          entry.el.classList.remove('visible', 'in-range');
          continue;
        }

        const screenX = (projected.x * 0.5 + 0.5) * width;
        const screenY = (-projected.y * 0.5 + 0.5) * height;

        if (screenX < -80 || screenX > width + 80 || screenY < -80 || screenY > height + 80) {
          entry.el.classList.remove('visible', 'in-range');
          continue;
        }

        const indicatorType = typeof getIndicatorType === 'function' ? getIndicatorType(key, isNight) : 'talk';
        const isQuest = indicatorType === 'quest';
        const isNightIndicator = indicatorType === 'night';

        entry.el.classList.toggle('is-night', Boolean(isNight));
        entry.el.classList.toggle('type-quest', isQuest);
        entry.el.classList.toggle('type-night', isNightIndicator);
        entry.el.classList.toggle('in-range', dist <= interactDist);
        entry.bubbleEl.textContent = isQuest ? '!' : isNightIndicator ? '🌙' : '💬';
        entry.nameEl.textContent = npc.data?.displayName || npc.data?.name || key;

        entry.el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -100%)`;
        entry.el.classList.add('visible');
      }

      for (const [key, entry] of markers.entries()) {
        if (!activeKeys.has(key)) {
          entry.el.classList.remove('visible', 'in-range');
        }
      }
    }
  };
}
