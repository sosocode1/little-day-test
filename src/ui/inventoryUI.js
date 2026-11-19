// LITTLE DAY 아이템 보관함 및 캐릭터 꾸미기 UI
import { ItemType, ItemTypeName } from '../data/items.js';

export function createInventoryUI(inventorySystem) {
  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-inventory-style';
  style.textContent = `
    .inv-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(45, 30, 38, 0.28);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 150;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .inv-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .inv-window {
      width: 480px;
      max-width: 90vw;
      max-height: 85vh;
      background: rgba(255, 253, 250, 0.96);
      backdrop-filter: blur(14px);
      border-radius: 28px;
      box-shadow: 0 16px 40px rgba(160, 105, 125, 0.25), 0 0 0 2px #ffd8e4;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      color: #4a343e;
      transform: scale(0.94) translateY(12px);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .inv-overlay.visible .inv-window {
      transform: scale(1) translateY(0);
    }

    /* 헤더 */
    .inv-header {
      padding: 18px 22px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px dashed #ffd6e2;
      background: linear-gradient(180deg, #fffafd 0%, #fff4f7 100%);
    }
    .inv-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 800;
      color: #833951;
      letter-spacing: -0.3px;
    }
    .inv-title-icon {
      font-size: 22px;
      line-height: 1;
    }
    .inv-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid #ffccd9;
      background: #ffffff;
      color: #9d4865;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .inv-close-btn:hover {
      background: #ffe6ee;
      transform: scale(1.06);
    }

    /* 탭 네비게이션 */
    .inv-tabs {
      display: flex;
      gap: 8px;
      padding: 12px 20px 8px;
      background: #fff8fa;
      border-bottom: 1px solid #ffeef3;
    }
    .inv-tab {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid #ffd6e2;
      background: #ffffff;
      color: #8c586c;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .inv-tab:hover {
      background: #fff0f5;
    }
    .inv-tab.active {
      background: #ff8fad;
      color: #ffffff;
      border-color: #ff8fad;
      box-shadow: 0 3px 8px rgba(255, 143, 173, 0.35);
    }

    /* 메인 콘텐츠 바디 (아이템 목록 & 상세 정보) */
    .inv-body {
      padding: 16px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 280px;
      max-height: calc(85vh - 120px);
    }

    /* 아이템 그리드 */
    .inv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
    }

    /* 아이템 카드 */
    .inv-item-card {
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
      box-shadow: 0 4px 12px rgba(180, 140, 155, 0.08);
    }
    .inv-item-card:hover {
      transform: translateY(-2px);
      border-color: #ffb8cc;
      box-shadow: 0 8px 18px rgba(180, 140, 155, 0.16);
    }
    .inv-item-card.selected {
      border-color: #ff8fad;
      background: #fffbfc;
      box-shadow: 0 0 0 2px rgba(255, 143, 173, 0.3), 0 8px 20px rgba(180, 140, 155, 0.18);
    }
    .inv-item-card.equipped {
      border-color: #a4e2c5;
      background: #f7fdfa;
    }
    .inv-item-card.equipped.selected {
      border-color: #67cfa1;
      box-shadow: 0 0 0 2px rgba(103, 207, 161, 0.3);
    }

    /* 착용 상태 뱃지 */
    .inv-badge-equipped {
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

    .inv-item-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, #fff0f5 0%, #ffe4ec 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 8px;
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 3px 6px rgba(190, 140, 160, 0.1);
    }
    .inv-item-name {
      font-size: 12.5px;
      font-weight: 800;
      color: #5a3845;
      margin-bottom: 2px;
      line-height: 1.3;
    }
    .inv-item-type {
      font-size: 10.5px;
      font-weight: 600;
      color: #a37283;
    }

    /* 빈 인벤토리 상태 */
    .inv-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #9d7585;
    }
    .inv-empty-icon {
      font-size: 44px;
      margin-bottom: 12px;
      opacity: 0.85;
    }
    .inv-empty-text {
      font-size: 14.5px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #7b4b5e;
    }
    .inv-empty-sub {
      font-size: 12px;
      color: #b08a98;
    }

    /* 아이템 상세 정보 및 착용/해제 버튼 패널 */
    .inv-detail-card {
      background: #ffffff;
      border: 1.5px solid #ffd8e4;
      border-radius: 20px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 6px 16px rgba(180, 140, 155, 0.08);
      margin-top: auto;
    }
    .inv-detail-main {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .inv-detail-icon {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      background: linear-gradient(135deg, #fff0f5 0%, #ffe1eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(255, 180, 200, 0.25);
    }
    .inv-detail-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .inv-detail-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .inv-detail-name {
      font-size: 15px;
      font-weight: 800;
      color: #633042;
    }
    .inv-detail-category-badge {
      font-size: 11px;
      font-weight: 700;
      color: #a44865;
      background: #ffe3ec;
      padding: 2px 7px;
      border-radius: 6px;
    }
    .inv-detail-desc {
      font-size: 12px;
      line-height: 1.45;
      color: #6f505d;
      margin-top: 2px;
    }
    .inv-detail-source {
      font-size: 11px;
      color: #b07e90;
      font-weight: 600;
    }

    .inv-detail-actions {
      display: flex;
      gap: 10px;
      border-top: 1px dashed #ffe0ea;
      padding-top: 12px;
    }
    .inv-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 14px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.18s ease;
    }
    .inv-btn-equip {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(255, 110, 148, 0.35);
    }
    .inv-btn-equip:hover {
      background: linear-gradient(135deg, #ff7e9f 0%, #ff5d86 100%);
      transform: translateY(-1.5px);
      box-shadow: 0 6px 16px rgba(255, 110, 148, 0.45);
    }
    .inv-btn-unequip {
      background: #f7e8ee;
      color: #914861;
      border: 1.5px solid #ffccd9;
    }
    .inv-btn-unequip:hover {
      background: #f2dbe4;
      color: #7b3850;
    }

    /* 하단 안내 텍스트 */
    .inv-footer-hint {
      font-size: 11px;
      text-align: center;
      color: #b58d9b;
      margin-top: -6px;
      padding-bottom: 2px;
    }
  `;
  document.head.appendChild(style);

  // DOM 생성
  const overlay = document.createElement('div');
  overlay.className = 'inv-overlay';
  overlay.innerHTML = `
    <div class="inv-window" role="dialog" aria-modal="true" aria-label="아이템 보관함">
      <div class="inv-header">
        <div class="inv-title">
          <span class="inv-title-icon">🎒</span>
          <span>아이템 보관함</span>
        </div>
        <button class="inv-close-btn" title="닫기 (I 또는 Esc)">✕</button>
      </div>
      <div class="inv-tabs">
        <button class="inv-tab active" data-type="all">전체</button>
        <button class="inv-tab" data-type="${ItemType.HEAD}">헤어 액세서리</button>
        <button class="inv-tab" data-type="${ItemType.OUTFIT}">의상</button>
      </div>
      <div class="inv-body">
        <div class="inv-grid-container"></div>
        <div class="inv-detail-container"></div>
      </div>
      <div class="inv-footer-hint">
        단축키 [I] 또는 [Esc]로 보관함을 닫을 수 있습니다
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.inv-close-btn');
  const tabs = overlay.querySelectorAll('.inv-tab');
  const gridContainer = overlay.querySelector('.inv-grid-container');
  const detailContainer = overlay.querySelector('.inv-detail-container');

  let currentTab = 'all';
  let selectedItemId = null;
  let isOpen = false;
  let toggleCallbacks = [];

  function selectTab(type) {
    currentTab = type;
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-type') === type);
    });
    render();
  }

  function selectItem(itemId) {
    selectedItemId = itemId;
    render();
  }

  function render() {
    const items = inventorySystem.getAcquiredItems(currentTab);

    // 1. 만약 현재 선택된 아이템이 목록에 없거나 선택되지 않은 경우 첫 번째 아이템 기본 선택
    if (items.length > 0) {
      if (!selectedItemId || !items.some((it) => it.id === selectedItemId)) {
        selectedItemId = items[0].id;
      }
    } else {
      selectedItemId = null;
    }

    // 2. 그리드 렌더링
    if (items.length === 0) {
      gridContainer.innerHTML = `
        <div class="inv-empty">
          <div class="inv-empty-icon">🍃</div>
          <div class="inv-empty-text">보관함이 비어 있습니다.</div>
          <div class="inv-empty-sub">마을 주민과 대화하고 퀘스트를 완료해 아이템을 모아보세요!</div>
        </div>
      `;
      detailContainer.innerHTML = '';
      return;
    }

    let gridHtml = '<div class="inv-grid">';
    for (const item of items) {
      const isSelected = item.id === selectedItemId;
      const isEquipped = inventorySystem.isEquipped(item.id);
      gridHtml += `
        <div class="inv-item-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}" data-id="${item.id}">
          ${isEquipped ? '<div class="inv-badge-equipped">✨ 착용 중</div>' : ''}
          <div class="inv-item-icon-box">${item.icon || '📦'}</div>
          <div class="inv-item-name">${item.name}</div>
          <div class="inv-item-type">${item.categoryName || ItemTypeName[item.type] || '액세서리'}</div>
        </div>
      `;
    }
    gridHtml += '</div>';
    gridContainer.innerHTML = gridHtml;

    // 카드 클릭 이벤트 바인딩
    gridContainer.querySelectorAll('.inv-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectItem(card.getAttribute('data-id'));
      });
    });

    // 3. 상세 정보 카드 렌더링
    const selectedItem = items.find((it) => it.id === selectedItemId);
    if (!selectedItem) {
      detailContainer.innerHTML = '';
      return;
    }

    const isEquipped = inventorySystem.isEquipped(selectedItem.id);
    detailContainer.innerHTML = `
      <div class="inv-detail-card">
        <div class="inv-detail-main">
          <div class="inv-detail-icon">${selectedItem.icon || '🌸'}</div>
          <div class="inv-detail-meta">
            <div class="inv-detail-title-row">
              <span class="inv-detail-name">${selectedItem.name}</span>
              <span class="inv-detail-category-badge">${selectedItem.categoryName || '헤어 액세서리'}</span>
            </div>
            <div class="inv-detail-desc">${selectedItem.description}</div>
            ${selectedItem.source ? `<div class="inv-detail-source">획득처: ${selectedItem.source}</div>` : ''}
          </div>
        </div>
        <div class="inv-detail-actions">
          ${
            isEquipped
              ? `<button class="inv-btn inv-btn-unequip" id="btn-unequip-item">✕ 착용 해제</button>`
              : `<button class="inv-btn inv-btn-equip" id="btn-equip-item">✨ 착용하기</button>`
          }
        </div>
      </div>
    `;

    // 착용/해제 버튼 이벤트 바인딩
    const equipBtn = detailContainer.querySelector('#btn-equip-item');
    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        inventorySystem.equip(selectedItem.id);
        render();
      });
    }

    const unequipBtn = detailContainer.querySelector('#btn-unequip-item');
    if (unequipBtn) {
      unequipBtn.addEventListener('click', () => {
        inventorySystem.unequip(selectedItem.id);
        render();
      });
    }
  }

  // 탭 클릭 이벤트
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectTab(tab.getAttribute('data-type'));
    });
  });

  // 닫기 버튼
  closeBtn.addEventListener('click', () => {
    close();
  });

  // 배경 오버레이 클릭 시 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Esc 키 지원
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && isOpen) {
      close();
    }
  });

  // 인벤토리 상태 변경 구독
  inventorySystem.subscribe(() => {
    if (isOpen) {
      render();
    }
  });

  function open() {
    if (isOpen) return;
    isOpen = true;
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

  function notifyToggle(openState) {
    for (const cb of toggleCallbacks) {
      cb(openState);
    }
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
    selectTab,
    render
  };
}
