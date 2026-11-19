// LITTLE DAY 감성 월드맵 UI (World Map & Fast Travel System)
import { AREA_CONFIGS } from '../world/areaManager.js';

export function createWorldMapUI(areaManager, questSystem, inventorySystem) {
  const style = document.createElement('style');
  style.id = 'little-day-worldmap-style';
  style.textContent = `
    /* 우측 상단 월드맵 열기 버튼 */
    .worldmap-open-pill {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 120;
      height: 40px;
      padding: 0 16px;
      background: rgba(255, 253, 250, 0.94);
      backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 4px 14px rgba(180, 130, 150, 0.2);
      color: #6a4050;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all 0.15s ease;
      font-family: "Pretendard", "Segoe UI", sans-serif;
      user-select: none;
    }
    .worldmap-open-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(180, 130, 150, 0.28);
      border-color: #ffb8cc;
      background: #ffffff;
    }
    .worldmap-open-pill:active {
      transform: scale(0.97);
    }

    /* 월드맵 모달 오버레이 */
    .worldmap-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(45, 30, 38, 0.35);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 550;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: "Pretendard", "Segoe UI", sans-serif;
      user-select: none;
    }
    .worldmap-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .worldmap-window {
      width: 780px;
      max-width: 92vw;
      background: #fffdfa;
      border-radius: 28px;
      border: 2.5px solid #ffd6e4;
      box-shadow: 0 20px 50px rgba(160, 90, 120, 0.32);
      padding: 24px 28px 20px;
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .worldmap-overlay.visible .worldmap-window {
      transform: scale(1);
    }

    .worldmap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 2px dashed #ffe1ec;
      padding-bottom: 12px;
    }
    .worldmap-title {
      font-size: 18px;
      font-weight: 900;
      color: #553342;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .worldmap-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid #ffd0de;
      background: #fffafa;
      color: #9c6c82;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .worldmap-close-btn:hover {
      background: #ffeef4;
      color: #d6336c;
      transform: scale(1.08);
    }

    /* 4개 지역 그리드 */
    .worldmap-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 16px;
    }

    .area-card {
      background: #ffffff;
      border: 2px solid #ffccd9;
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(220, 170, 190, 0.15);
    }
    .area-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(220, 160, 185, 0.25);
      border-color: #ff9fb8;
    }
    .area-card.current {
      border-color: #ff85a2;
      background: #fff8fa;
      box-shadow: 0 0 0 3px rgba(255, 133, 162, 0.2);
    }
    .area-card.locked {
      background: #fbfbfc;
      border-color: #e5d8de;
      opacity: 0.88;
    }

    .area-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .area-icon-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .area-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #fff0f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 2px 8px rgba(240, 160, 180, 0.2);
    }
    .area-name-block {
      display: flex;
      flex-direction: column;
    }
    .area-name {
      font-size: 15.5px;
      font-weight: 900;
      color: #4a2839;
    }
    .area-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #a87e90;
    }

    .area-badge {
      font-size: 10.5px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
    }
    .area-badge.current {
      background: #ffe6ef;
      color: #b03a62;
      border: 1px solid #ffb3cc;
    }
    .area-badge.unlocked {
      background: #eafaf1;
      color: #27ae60;
      border: 1px solid #a9dfbf;
    }
    .area-badge.locked {
      background: #f2f3f4;
      color: #7f8c8d;
      border: 1px solid #d5dbdb;
    }

    .area-desc {
      font-size: 12px;
      color: #6a4758;
      line-height: 1.45;
      margin-bottom: 12px;
      flex-grow: 1;
    }

    .area-condition-box {
      background: #fff5f8;
      border: 1px dashed #ffb8cc;
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 11px;
      color: #944d67;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .area-action-row {
      display: flex;
      gap: 6px;
      margin-top: auto;
    }
    .area-travel-btn {
      flex: 1;
      height: 34px;
      background: #ff85a2;
      border: none;
      border-radius: 10px;
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s ease;
      box-shadow: 0 3px 8px rgba(255, 133, 162, 0.3);
    }
    .area-travel-btn:hover {
      background: #ff6f91;
      transform: translateY(-1px);
    }
    .area-travel-btn.disabled {
      background: #f0e6eb;
      color: #b89ca9;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .area-unlock-btn {
      height: 34px;
      padding: 0 12px;
      background: #fdf2e9;
      border: 1.5px solid #f8c471;
      border-radius: 10px;
      color: #d35400;
      font-size: 11.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .area-unlock-btn:hover {
      background: #fae5d3;
      transform: translateY(-1px);
    }

    .worldmap-footer-hint {
      text-align: center;
      font-size: 11px;
      color: #a88494;
      border-top: 1px dashed #ffd6e2;
      padding-top: 10px;
    }
  `;
  document.head.appendChild(style);

  // 우측 상단 플로팅 열기 버튼
  const openBtn = document.createElement('button');
  openBtn.className = 'worldmap-open-pill';
  openBtn.innerHTML = `<span>🗺️</span> <span>월드맵 (M)</span>`;
  document.body.appendChild(openBtn);

  // 모달 오버레이
  const overlay = document.createElement('div');
  overlay.className = 'worldmap-overlay';
  overlay.innerHTML = `
    <div class="worldmap-window" role="dialog" aria-modal="true" aria-label="월드맵">
      <div class="worldmap-header">
        <div class="worldmap-title">
          <span>🗺️</span>
          <span>LITTLE DAY 월드맵</span>
        </div>
        <button class="worldmap-close-btn" title="닫기 (M 또는 Esc)">✕</button>
      </div>

      <div class="worldmap-grid" id="worldmap-grid"></div>

      <div class="worldmap-footer-hint">
        단축키 [M] 또는 [Esc]로 월드맵을 여닫을 수 있으며, 잠금 해제된 지역으로 언제든 이동할 수 있습니다.
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const gridContainer = overlay.querySelector('#worldmap-grid');
  const closeBtn = overlay.querySelector('.worldmap-close-btn');

  let isOpen = false;

  function renderCards() {
    const currentId = areaManager.getCurrentAreaId();
    let html = '';

    for (const [id, area] of Object.entries(AREA_CONFIGS)) {
      const isCurrent = currentId === id;
      const isUnlocked = areaManager.isUnlocked(id);

      html += `
        <div class="area-card ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}">
          <div class="area-top-row">
            <div class="area-icon-title">
              <div class="area-icon">${area.icon}</div>
              <div class="area-name-block">
                <span class="area-name">${area.name}</span>
                <span class="area-subtitle">${area.subtitle}</span>
              </div>
            </div>
            <div class="area-badge ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}">
              ${isCurrent ? '🚩 현재 위치' : isUnlocked ? '✨ 해금됨' : '🔒 잠김'}
            </div>
          </div>

          <div class="area-desc">${area.description}</div>

          ${
            !isUnlocked
              ? `<div class="area-condition-box">🔒 <strong>해금 조건:</strong> ${area.conditionText}</div>`
              : ''
          }

          <div class="area-action-row">
            ${
              isCurrent
                ? `<button class="area-travel-btn disabled" disabled>🚩 머무는 중</button>`
                : isUnlocked
                  ? `<button class="area-travel-btn" data-travel="${id}">🚀 지금 이동하기</button>`
                  : `
                    <button class="area-travel-btn disabled" disabled>🔒 지역 잠김</button>
                    <button class="area-unlock-btn" data-unlock="${id}">🔓 해금하기</button>
                  `
            }
          </div>
        </div>
      `;
    }

    gridContainer.innerHTML = html;

    // 이동 버튼 이벤트
    gridContainer.querySelectorAll('[data-travel]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const destId = btn.getAttribute('data-travel');
        close();
        await areaManager.travelTo(destId);
      });
    });

    // 해금 버튼 이벤트
    gridContainer.querySelectorAll('[data-unlock]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const unlockId = btn.getAttribute('data-unlock');
        areaManager.unlockArea(unlockId);
        if (questSystem?.ui?.showToast) {
          const cfg = AREA_CONFIGS[unlockId];
          questSystem.ui.showToast(`[${cfg.name}] 지역이 새롭게 해금되었습니다! ${cfg.icon}✨`, cfg.icon, 3000);
        }
        renderCards();
      });
    });
  }

  function open() {
    isOpen = true;
    renderCards();
    overlay.classList.add('visible');
  }

  function close() {
    isOpen = false;
    overlay.classList.remove('visible');
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  openBtn.addEventListener('click', toggle);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // M 키 단축키로 월드맵 토글
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
