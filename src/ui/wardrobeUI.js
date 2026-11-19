// LITTLE DAY - 집 내부 옷장 상호작용 UI
import { ItemType, ItemTypeName } from '../data/items.js';

export function createWardrobeUI(inventorySystem) {
  // 1. 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-wardrobe-style';
  style.textContent = `
    .wardrobe-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(45, 30, 38, 0.25);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 160;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wardrobe-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .wardrobe-window {
      width: 520px;
      max-width: 92vw;
      max-height: 86vh;
      background: rgba(255, 253, 250, 0.98);
      border-radius: 26px;
      box-shadow: 0 16px 44px rgba(130, 85, 105, 0.22), 0 0 0 2px #ffe2ec;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      color: #4a343e;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .wardrobe-overlay.visible .wardrobe-window {
      transform: scale(1) translateY(0);
    }

    /* 상단 헤더 */
    .wardrobe-header {
      padding: 16px 22px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px dashed #ffdfe8;
      background: linear-gradient(180deg, #fffcfd 0%, #fff0f5 100%);
    }
    .wardrobe-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .wardrobe-title-icon {
      font-size: 24px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(255, 140, 170, 0.25));
    }
    .wardrobe-title {
      font-size: 17px;
      font-weight: 800;
      color: #8c3b54;
      letter-spacing: -0.3px;
    }
    .wardrobe-subtitle {
      font-size: 11.5px;
      font-weight: 600;
      color: #b07889;
      margin-top: 1px;
    }
    .wardrobe-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid #ffccd9;
      background: #ffffff;
      color: #9d4865;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .wardrobe-close-btn:hover {
      background: #ffe6ee;
      transform: scale(1.08);
    }

    /* 탭 메뉴 (전체 / 의상 / 헤어 장식 / 신발) */
    .wardrobe-tabs {
      display: flex;
      gap: 6px;
      padding: 10px 18px 8px;
      background: #fff8fa;
      border-bottom: 1px solid #ffedf2;
      overflow-x: auto;
    }
    .wardrobe-tab {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid #ffd6e2;
      background: #ffffff;
      color: #8c586c;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .wardrobe-tab:hover {
      background: #fff0f5;
    }
    .wardrobe-tab.active {
      background: #ff8fad;
      color: #ffffff;
      border-color: #ff8fad;
      box-shadow: 0 3px 8px rgba(255, 143, 173, 0.35);
    }

    /* 메인 그리드 바디 */
    .wardrobe-body {
      padding: 16px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 260px;
      max-height: calc(86vh - 120px);
    }
    .wardrobe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(138px, 1fr));
      gap: 12px;
    }

    /* 아이템 카드 */
    .wardrobe-card {
      background: #ffffff;
      border: 2px solid #ffedf2;
      border-radius: 18px;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 10px rgba(180, 140, 155, 0.08);
    }
    .wardrobe-card:hover {
      transform: translateY(-2px);
      border-color: #ffb8cc;
      box-shadow: 0 6px 16px rgba(180, 140, 155, 0.15);
    }
    .wardrobe-card.equipped {
      border-color: #72cf9f;
      background: #f7fdf9;
    }

    /* 착용 뱃지 */
    .wardrobe-badge-equipped {
      position: absolute;
      top: 6px;
      right: 6px;
      font-size: 10px;
      font-weight: 800;
      color: #1f774e;
      background: #d4f7e5;
      padding: 2px 6px;
      border-radius: 6px;
      border: 1px solid #b3eccf;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .wardrobe-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 15px;
      background: linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 8px;
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 2px 5px rgba(190, 140, 160, 0.1);
    }
    .wardrobe-item-name {
      font-size: 12.5px;
      font-weight: 800;
      color: #5a3845;
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .wardrobe-item-type {
      font-size: 10.5px;
      font-weight: 600;
      color: #a37283;
    }

    /* 하단 안내 및 단축키 안내 */
    .wardrobe-footer {
      padding: 10px 20px 14px;
      border-top: 1px dashed #ffe6ee;
      background: #fffcfd;
      font-size: 11px;
      color: #a88290;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .wardrobe-tip {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .wardrobe-kbd {
      padding: 2px 6px;
      background: #ffeef3;
      border: 1px solid #ffd6e2;
      border-radius: 4px;
      font-weight: 700;
      color: #8c425b;
      font-size: 10px;
    }

    /* 반응형 모바일 */
    @media (max-width: 480px) {
      .wardrobe-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .wardrobe-window {
        border-radius: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. DOM 생성
  const overlay = document.createElement('div');
  overlay.className = 'wardrobe-overlay';
  overlay.innerHTML = `
    <div class="wardrobe-window">
      <div class="wardrobe-header">
        <div class="wardrobe-title-box">
          <div class="wardrobe-title-icon">🚪</div>
          <div>
            <div class="wardrobe-title">아늑한 옷장</div>
            <div class="wardrobe-subtitle">보유한 의상과 장식을 마음에 들게 착용해 보세요</div>
          </div>
        </div>
        <button class="wardrobe-close-btn" title="닫기 (ESC)">✕</button>
      </div>

      <div class="wardrobe-tabs">
        <button class="wardrobe-tab active" data-type="all">🌸 전체</button>
        <button class="wardrobe-tab" data-type="${ItemType.OUTFIT}">👗 의상</button>
        <button class="wardrobe-tab" data-type="${ItemType.HEAD}">🎀 헤어 장식</button>
        <button class="wardrobe-tab" data-type="${ItemType.SHOES}">👞 신발</button>
      </div>

      <div class="wardrobe-body">
        <div class="wardrobe-grid" id="wardrobe-grid"></div>
      </div>

      <div class="wardrobe-footer">
        <div class="wardrobe-tip">
          💡 <span class="wardrobe-kbd">클릭</span>으로 즉시 착용 및 해제
        </div>
        <div><span class="wardrobe-kbd">ESC</span> 또는 ✕ 닫기</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const gridEl = overlay.querySelector('#wardrobe-grid');
  const tabs = overlay.querySelectorAll('.wardrobe-tab');
  const closeBtn = overlay.querySelector('.wardrobe-close-btn');

  let isOpen = false;
  let currentFilter = 'all';
  const toggleCallbacks = [];

  function selectTab(type) {
    currentFilter = type;
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-type') === type);
    });
    render();
  }

  function render() {
    gridEl.innerHTML = '';
    const items = inventorySystem.getAcquiredItems(currentFilter);

    if (items.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 10px; text-align: center; color: #a47688;">
          <div style="font-size: 38px; margin-bottom: 8px;">📦</div>
          <div style="font-weight: 700; font-size: 13.5px;">해당 분류의 옷장 아이템이 없습니다</div>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const isEquipped = inventorySystem.isEquipped(item.id);
      const card = document.createElement('div');
      card.className = `wardrobe-card ${isEquipped ? 'equipped' : ''}`;
      card.innerHTML = `
        ${isEquipped ? '<div class="wardrobe-badge-equipped">✓ 착용 중</div>' : ''}
        <div class="wardrobe-icon-box">${item.icon || '✨'}</div>
        <div class="wardrobe-item-name">${item.name}</div>
        <div class="wardrobe-item-type">${item.categoryName || ItemTypeName[item.type] || '아이템'}</div>
      `;

      card.addEventListener('click', () => {
        // 즉시 착용 / 해제 토글
        inventorySystem.toggleEquip(item.id);
        render();
      });

      gridEl.appendChild(card);
    });
  }

  // 탭 클릭
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectTab(tab.getAttribute('data-type'));
    });
  });

  // 닫기 버튼
  closeBtn.addEventListener('click', () => close());

  // 오버레이 클릭 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // ESC 키 지원
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && isOpen) {
      close();
    }
  });

  // 인벤토리 상태 변경 시 실시간 동기화
  inventorySystem.subscribe(() => {
    if (isOpen) render();
  });

  function open(defaultTab = 'all') {
    if (isOpen) return;
    isOpen = true;
    currentFilter = defaultTab;
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-type') === defaultTab);
    });
    render();
    overlay.classList.add('visible');
    notifyToggle(true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('visible');
    notifyToggle(false);
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function notifyToggle(state) {
    for (const cb of toggleCallbacks) cb(state);
  }

  return {
    open,
    close,
    toggle,
    isOpen() {
      return isOpen;
    },
    onToggle(cb) {
      toggleCallbacks.push(cb);
    },
    selectTab
  };
}
