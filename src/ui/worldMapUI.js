// LITTLE DAY 감성 섬 월드맵 UI (바다 위에 떠 있는 섬 선택 + 배 이동 확인)
// - 마을 부두의 배(E키)에서 열면 출항 가능, M키로 열면 열람 전용
// - 지역 데이터는 areaManager.AREA_CONFIGS (map 좌표/terrain 포함)를 그대로 사용
import { AREA_CONFIGS } from '../world/areaManager.js';

const TERRAIN_DECOR = {
  meadow: ['🏡', '🌸', '🌳'],
  forest: ['🌲', '🍄', '🌿'],
  moon: ['🌙', '✨', '🐚'],
  mansion: ['🏰', '🍂', '🕯️'],
  fog: ['☁️', '❓', '☁️']
};

export function createWorldMapUI(areaManager, questSystem, inventorySystem) {
  const style = document.createElement('style');
  style.id = 'little-day-worldmap-style';
  style.textContent = `
    .worldmap-open-pill {
      position: fixed; top: 24px; right: 24px; z-index: 120; height: 40px; padding: 0 16px;
      background: rgba(255, 253, 250, 0.94); backdrop-filter: blur(10px);
      border-radius: 999px; border: 2px solid #ffd6e2;
      box-shadow: 0 4px 14px rgba(180, 130, 150, 0.2);
      color: #6a4050; font-size: 13.5px; font-weight: 800; cursor: pointer;
      display: flex; align-items: center; gap: 7px; transition: all 0.15s ease;
      font-family: "Pretendard", "Segoe UI", sans-serif; user-select: none;
    }
    .worldmap-open-pill:hover { transform: translateY(-1px); border-color: #ffb8cc; background: #fff; }
    .worldmap-open-pill:active { transform: scale(0.97); }

    .worldmap-overlay {
      position: fixed; inset: 0; background: rgba(45, 30, 38, 0.4); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; z-index: 550;
      opacity: 0; pointer-events: none; transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: "Pretendard", "Segoe UI", sans-serif; user-select: none;
    }
    .worldmap-overlay.visible { opacity: 1; pointer-events: auto; }
    .worldmap-window {
      width: 980px; max-width: 95vw; max-height: 94vh; background: #fffdfa; border-radius: 28px;
      border: 2.5px solid #ffd6e4; box-shadow: 0 20px 50px rgba(160, 90, 120, 0.32);
      padding: 20px 24px 16px; display: flex; flex-direction: column;
      transform: scale(0.95); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .worldmap-overlay.visible .worldmap-window { transform: scale(1); }
    .worldmap-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; border-bottom: 2px dashed #ffe1ec; padding-bottom: 10px;
    }
    .worldmap-title { font-size: 18px; font-weight: 900; color: #553342; display: flex; align-items: center; gap: 8px; }
    .worldmap-mode-tag { font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: #eafaf1; color: #27ae60; border: 1px solid #a9dfbf; }
    .worldmap-mode-tag.view { background: #f4f1f3; color: #8d7380; border-color: #e0d5db; }
    .worldmap-close-btn {
      width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #ffd0de; background: #fffafa;
      color: #9c6c82; font-size: 16px; cursor: pointer; transition: all 0.15s;
    }
    .worldmap-close-btn:hover { background: #ffeef4; color: #d6336c; transform: scale(1.08); }

    .worldmap-body { display: flex; gap: 16px; min-height: 0; }
    .worldmap-sea {
      position: relative; flex: 1 1 560px; min-width: 0; aspect-ratio: 16 / 11; border-radius: 22px; overflow: hidden;
      border: 3px solid #bfe6f2;
      background:
        radial-gradient(circle at 20% 15%, rgba(255,255,255,0.45), transparent 35%),
        repeating-radial-gradient(circle at 50% 120%, rgba(255,255,255,0.0) 0 22px, rgba(255,255,255,0.18) 22px 26px),
        linear-gradient(180deg, #a8def0 0%, #7cc7e4 100%);
      box-shadow: inset 0 6px 18px rgba(60, 130, 170, 0.25);
    }
    .worldmap-sea::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(100deg, transparent 0 40px, rgba(255,255,255,0.08) 40px 44px);
      animation: wm-drift 12s linear infinite;
    }
    @keyframes wm-drift { from { background-position: 0 0; } to { background-position: 88px 0; } }

    .wm-island {
      position: absolute; transform: translate(-50%, -50%); border: none; background: none; padding: 0;
      cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 2;
      font-family: inherit; transition: transform 0.18s ease;
    }
    .wm-island:hover, .wm-island:focus-visible { transform: translate(-50%, -54%) scale(1.06); outline: none; }
    .wm-island.selected .wm-blob { box-shadow: 0 0 0 4px #fff, 0 0 0 7px #ff85a2, 0 8px 0 rgba(0,0,0,0.12); }
    .wm-blob {
      position: relative; width: var(--s); aspect-ratio: 1.25; border-radius: 52% 48% 55% 45% / 58% 52% 48% 42%;
      display: flex; align-items: center; justify-content: center; font-size: clamp(16px, 2.4vw, 30px);
      box-shadow: 0 8px 0 rgba(0,0,0,0.12), inset 0 -6px 0 rgba(0,0,0,0.08), inset 0 5px 0 rgba(255,255,255,0.35);
      animation: wm-bob 4s ease-in-out infinite;
    }
    .wm-island:nth-child(2n) .wm-blob { animation-delay: -1.5s; }
    .wm-island:nth-child(3n) .wm-blob { animation-delay: -2.6s; }
    @keyframes wm-bob { 0%, 100% { margin-top: 0; } 50% { margin-top: -4px; } }
    .wm-blob::before { content: ''; position: absolute; inset: 14% 12%; border-radius: inherit; background: var(--top); }
    .wm-decor { position: relative; z-index: 1; display: flex; gap: 2px; letter-spacing: -2px; }
    .wm-terrain-meadow { --s: 15%; background: #f2dcae; --top: #bfe69a; }
    .wm-terrain-forest { background: #d9c79b; --top: #6fc08a; }
    .wm-terrain-moon { background: #f5efe0; --top: #b9c7ee; }
    .wm-terrain-mansion { background: #cdbfb0; --top: #b8a0cc; }
    .wm-terrain-fog { background: #cfd5d8; --top: #e4e8ea; }
    .wm-island.locked .wm-blob { filter: grayscale(0.85) brightness(0.92); }
    .wm-island.locked .wm-decor { opacity: 0.35; }
    .wm-lock {
      position: absolute; right: -6px; top: -8px; z-index: 3; font-size: 16px; background: #fff;
      border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .wm-here {
      position: absolute; left: 50%; top: -22px; transform: translateX(-50%); z-index: 3; font-size: 11px; font-weight: 900;
      background: #ff85a2; color: #fff; padding: 2px 8px; border-radius: 999px; white-space: nowrap;
    }
    .wm-label {
      font-size: 12px; font-weight: 900; color: #3d5560; background: rgba(255,255,255,0.88);
      padding: 2px 9px; border-radius: 999px; white-space: nowrap;
    }
    .wm-island.locked .wm-label { color: #7b8a90; }

    .worldmap-panel {
      flex: 0 0 280px; display: flex; flex-direction: column; gap: 10px; background: #fff;
      border: 2px solid #ffccd9; border-radius: 20px; padding: 16px; box-shadow: 0 4px 12px rgba(220, 170, 190, 0.15);
    }
    .wm-p-head { display: flex; align-items: center; gap: 10px; }
    .wm-p-icon { width: 48px; height: 48px; border-radius: 14px; background: #fff0f5; display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .wm-p-name { font-size: 16px; font-weight: 900; color: #4a2839; }
    .wm-p-sub { font-size: 11px; font-weight: 700; color: #a87e90; }
    .wm-p-badge { align-self: flex-start; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px; }
    .wm-p-badge.current { background: #ffe6ef; color: #b03a62; border: 1px solid #ffb3cc; }
    .wm-p-badge.unlocked { background: #eafaf1; color: #27ae60; border: 1px solid #a9dfbf; }
    .wm-p-badge.locked { background: #f2f3f4; color: #7f8c8d; border: 1px solid #d5dbdb; }
    .wm-p-desc { font-size: 12.5px; color: #6a4758; line-height: 1.5; flex-grow: 1; }
    .wm-p-cond { background: #fff5f8; border: 1px dashed #ffb8cc; border-radius: 10px; padding: 8px 10px; font-size: 11.5px; color: #944d67; line-height: 1.4; }
    .wm-p-actions { display: flex; gap: 6px; }
    .wm-btn {
      flex: 1; height: 38px; border: none; border-radius: 12px; background: #ff85a2; color: #fff;
      font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 3px 8px rgba(255, 133, 162, 0.3); transition: all 0.15s;
      font-family: inherit;
    }
    .wm-btn:hover { background: #ff6f91; transform: translateY(-1px); }
    .wm-btn.secondary { background: #f4e9ee; color: #8a6677; box-shadow: none; flex: 0 0 76px; }
    .wm-btn:disabled { background: #f0e6eb; color: #b89ca9; cursor: not-allowed; box-shadow: none; transform: none; }
    .worldmap-footer-hint { text-align: center; font-size: 11px; color: #a88494; border-top: 1px dashed #ffd6e2; padding-top: 10px; margin-top: 12px; }

    @media (max-width: 860px) {
      .worldmap-body { flex-direction: column; overflow-y: auto; }
      .worldmap-panel { flex-basis: auto; }
    }
  `;
  document.head.appendChild(style);

  const openBtn = document.createElement('button');
  openBtn.className = 'worldmap-open-pill';
  openBtn.innerHTML = '<span>🗺️</span> <span>월드맵 (M)</span>';
  document.body.appendChild(openBtn);

  const overlay = document.createElement('div');
  overlay.className = 'worldmap-overlay';
  overlay.innerHTML = `
    <div class="worldmap-window" role="dialog" aria-modal="true" aria-label="섬 월드맵">
      <div class="worldmap-header">
        <div class="worldmap-title"><span>🗺️</span><span>LITTLE DAY 섬 지도</span><span class="worldmap-mode-tag"></span></div>
        <button class="worldmap-close-btn" title="닫기 (M 또는 Esc)" aria-label="닫기">✕</button>
      </div>
      <div class="worldmap-body">
        <div class="worldmap-sea" id="wm-sea"></div>
        <aside class="worldmap-panel" id="wm-panel" aria-live="polite"></aside>
      </div>
      <div class="worldmap-footer-hint">섬을 클릭해 정보를 확인하세요. 마을 부두의 배에서 [E]를 누르면 출항할 수 있어요. [M] 또는 [Esc]로 닫기</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const sea = overlay.querySelector('#wm-sea');
  const panel = overlay.querySelector('#wm-panel');
  const closeBtn = overlay.querySelector('.worldmap-close-btn');
  const modeTag = overlay.querySelector('.worldmap-mode-tag');

  let isOpen = false;
  let canTravel = false;
  let selectedId = null;
  let confirming = false;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  function renderSea() {
    const frag = document.createDocumentFragment();
    const currentId = areaManager.getCurrentAreaId();
    for (const [id, area] of Object.entries(AREA_CONFIGS)) {
      const unlocked = areaManager.isUnlocked(id);
      const btn = el('button', `wm-island ${unlocked ? '' : 'locked'} ${id === selectedId ? 'selected' : ''}`);
      btn.type = 'button';
      btn.dataset.area = id;
      btn.style.left = `${area.map.x}%`;
      btn.style.top = `${area.map.y}%`;
      btn.style.setProperty('--s', `${area.map.size * 6.2}px`);
      btn.setAttribute('aria-label', `${area.name}${unlocked ? '' : ' (잠김)'}`);

      const blob = el('div', `wm-blob wm-terrain-${area.terrain}`);
      blob.style.setProperty('--s', `clamp(70px, ${area.map.size * 0.75}vw, ${area.map.size * 8}px)`);
      blob.appendChild(el('div', 'wm-decor', (TERRAIN_DECOR[area.terrain] || []).join('')));
      if (!unlocked) blob.appendChild(el('div', 'wm-lock', '🔒'));
      if (id === currentId) blob.appendChild(el('div', 'wm-here', '⛵ 현재 위치'));
      btn.appendChild(blob);
      btn.appendChild(el('span', 'wm-label', area.name));
      frag.appendChild(btn);
    }
    sea.replaceChildren(frag);
  }

  function renderPanel() {
    const area = AREA_CONFIGS[selectedId];
    const currentId = areaManager.getCurrentAreaId();
    const unlocked = areaManager.isUnlocked(selectedId);
    const isCurrent = selectedId === currentId;

    const head = el('div', 'wm-p-head');
    head.appendChild(el('div', 'wm-p-icon', area.icon));
    const names = el('div');
    names.appendChild(el('div', 'wm-p-name', area.name));
    names.appendChild(el('div', 'wm-p-sub', area.subtitle));
    head.appendChild(names);

    const badgeKind = isCurrent ? 'current' : unlocked ? 'unlocked' : 'locked';
    const badgeText = isCurrent ? '🚩 현재 위치' : area.comingSoon ? '🚧 준비 중' : unlocked ? '✨ 방문 가능' : '🔒 잠김';

    const desc = el('div', 'wm-p-desc', area.description);
    const cond = el('div', 'wm-p-cond');
    const strong = el('strong', null, unlocked ? '방문 조건: ' : '🔒 방문 조건: ');
    cond.append(strong, area.conditionText);

    const actions = el('div', 'wm-p-actions');
    const go = el('button', 'wm-btn');
    go.type = 'button';
    if (isCurrent) {
      go.textContent = '🚩 머무는 중';
      go.disabled = true;
    } else if (!unlocked) {
      go.textContent = area.comingSoon ? '🚧 준비 중인 지역' : '🔒 지역 잠김';
      go.disabled = true;
    } else if (!canTravel) {
      go.textContent = '⛵ 부두의 배에서 출항해요';
      go.disabled = true;
    } else if (!confirming) {
      go.textContent = '⛵ 이 섬으로 이동';
      go.addEventListener('click', () => {
        confirming = true;
        renderPanel();
      });
    } else {
      go.textContent = `출항하기!`;
      go.addEventListener('click', async () => {
        const dest = selectedId;
        close();
        await areaManager.travelTo(dest);
      });
      const cancel = el('button', 'wm-btn secondary', '취소');
      cancel.type = 'button';
      cancel.addEventListener('click', () => {
        confirming = false;
        renderPanel();
      });
      actions.append(go, cancel);
    }
    if (!actions.childNodes.length) actions.appendChild(go);

    const nodes = [head, el('div', `wm-p-badge ${badgeKind}`, badgeText), desc, cond];
    if (confirming && canTravel) nodes.push(el('div', 'wm-p-sub', `${area.name}(으)로 배를 타고 떠날까요?`));
    nodes.push(actions);
    panel.replaceChildren(...nodes);
  }

  function render() {
    renderSea();
    renderPanel();
  }

  sea.addEventListener('click', (e) => {
    const btn = e.target.closest('.wm-island');
    if (!btn) return;
    selectedId = btn.dataset.area;
    confirming = false;
    render();
  });

  function open(opts = {}) {
    if (areaManager.isTransitioning()) return;
    areaManager.evaluateUnlocks?.();
    canTravel = !!opts.canTravel;
    modeTag.textContent = canTravel ? '⛵ 출항 가능' : '👀 열람 전용';
    modeTag.className = `worldmap-mode-tag ${canTravel ? '' : 'view'}`;
    confirming = false;
    const currentId = areaManager.getCurrentAreaId();
    selectedId = AREA_CONFIGS[currentId] ? currentId : 'village';
    isOpen = true;
    render();
    overlay.classList.add('visible');
  }

  function close() {
    isOpen = false;
    confirming = false;
    overlay.classList.remove('visible');
  }

  function toggle() {
    if (isOpen) close();
    else open({ canTravel: false });
  }

  openBtn.addEventListener('click', toggle);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.code === 'KeyM') {
      toggle();
    } else if (e.code === 'Escape' && isOpen) {
      close();
    }
  });

  return {
    open,
    close,
    toggle,
    isOpen() {
      return isOpen;
    }
  };
}
