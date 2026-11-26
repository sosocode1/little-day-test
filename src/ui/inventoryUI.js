// LITTLE DAY 클레이 스타일 '내 가방' 인벤토리 UI (수량 슬롯 + 빈 슬롯 + 상세 정보 + 가방 HUD 버튼)
import { ItemType, ItemTypeName } from '../data/items.js';

const MIN_BAG_SLOTS = 12;

// 수집 아이템용 클레이 감성 SVG 일러스트 (추후 아이템 추가 시 확장 가능)
function createItemVisualMarkup(item, sizeClass = '') {
  const type = item?.imageType || item?.id;

  if (type === 'pink_flower') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <radialGradient id="pfGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stop-color="#fff8fb"/>
            <stop offset="100%" stop-color="#ffe1ec"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#pfGlow)"/>
        <!-- 줄기와 잎사귀 -->
        <path d="M32 34 L32 54" stroke="#7fc474" stroke-width="4.2" stroke-linecap="round"/>
        <ellipse cx="24" cy="46" rx="7" ry="3.8" transform="rotate(-24 24 46)" fill="#8ecc82"/>
        <ellipse cx="40" cy="46" rx="7" ry="3.8" transform="rotate(24 40 46)" fill="#8ecc82"/>
        <!-- 5장 분홍 꽃잎 -->
        <circle cx="32" cy="18" r="8.2" fill="#ff8fad"/>
        <circle cx="42.5" cy="25.5" r="8.2" fill="#ff8fad"/>
        <circle cx="38.5" cy="37.5" r="8.2" fill="#ff8fad"/>
        <circle cx="25.5" cy="37.5" r="8.2" fill="#ff8fad"/>
        <circle cx="21.5" cy="25.5" r="8.2" fill="#ff8fad"/>
        <!-- 꽃잎 하이라이트 -->
        <circle cx="30" cy="16" r="2.2" fill="#ffc4d6" opacity="0.8"/>
        <circle cx="41" cy="23.5" r="2.2" fill="#ffc4d6" opacity="0.8"/>
        <!-- 중앙 노란 꽃술 -->
        <circle cx="32" cy="28" r="7.2" fill="#ffdf70"/>
        <circle cx="30" cy="26" r="2.1" fill="#fff6c4"/>
      </svg>
    `;
  }

  if (type === 'shiny_shell') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#eaf6ff"/>
        <path d="M14 40 C14 22, 50 22, 50 40 C44 48, 20 48, 14 40 Z" fill="#b8e4ff" stroke="#8bc8f0" stroke-width="2"/>
        <path d="M32 23 L32 45 M23 26 L27 45 M41 26 L37 45" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
        <circle cx="44" cy="18" r="3" fill="#fff2a6"/>
      </svg>
    `;
  }

  if (type === 'old_letter') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#fff4e3"/>
        <rect x="14" y="20" width="36" height="24" rx="5" fill="#f7dfb8" stroke="#dbb987" stroke-width="2"/>
        <path d="M16 22 L32 34 L48 22" fill="none" stroke="#c99e67" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="32" cy="34" r="4" fill="#e57a7a"/>
      </svg>
    `;
  }

  if (type === 'mysterious_key') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#f3eeff"/>
        <circle cx="24" cy="28" r="9" fill="none" stroke="#e2b44c" stroke-width="4.5"/>
        <path d="M33 28 L50 28 L50 36 M43 28 L43 34" stroke="#e2b44c" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `;
  }

  if (type === 'island_clue') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#edf1ff"/>
        <circle cx="28" cy="28" r="11" fill="#ffffff" stroke="#859ee6" stroke-width="3.5"/>
        <path d="M36 36 L48 48" stroke="#6d86cf" stroke-width="5" stroke-linecap="round"/>
        <circle cx="25" cy="25" r="3" fill="#c7d8ff"/>
      </svg>
    `;
  }

  if (type === 'old_voyage_log') {
    return `
      <svg class="inv-item-svg ${sizeClass}" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="#f2f0ff"/>
        <rect x="17" y="15" width="30" height="34" rx="6" fill="#f7e4c2" stroke="#cca571" stroke-width="2.4"/>
        <rect x="14" y="14" width="36" height="7" rx="3.5" fill="#e9cca0" stroke="#c49a64" stroke-width="2"/>
        <rect x="14" y="43" width="36" height="7" rx="3.5" fill="#e9cca0" stroke="#c49a64" stroke-width="2"/>
        <path d="M23 26 H41 M23 32 H39 M23 38 H35" stroke="#8f6c47" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="44" cy="20" r="4.5" fill="#89a8f5"/>
        <circle cx="44" cy="20" r="2" fill="#ffffff"/>
      </svg>
    `;
  }

  return `<span class="inv-item-emoji ${sizeClass}">${item?.icon || '📦'}</span>`;
}

export function createInventoryUI(inventorySystem) {
  const prevStyle = document.getElementById('little-day-inventory-style');
  if (prevStyle) prevStyle.remove();
  document.querySelectorAll('.inv-overlay, .bag-hud-btn').forEach((el) => el.remove());

  const style = document.createElement('style');
  style.id = 'little-day-inventory-style';
  style.textContent = `
    /* 우측 하단 플로팅 가방 아이콘 버튼 */
    .bag-hud-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 120;
      height: 48px;
      padding: 0 16px 0 13px;
      background: linear-gradient(180deg, rgba(255, 253, 249, 0.96) 0%, rgba(255, 244, 236, 0.95) 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 2.5px solid #f4cbb6;
      box-shadow:
        0 8px 22px rgba(155, 105, 92, 0.24),
        inset 0 2px 4px rgba(255, 255, 255, 0.92),
        inset 0 -3px 5px rgba(236, 192, 168, 0.34);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #6b4338;
      cursor: pointer;
      user-select: none;
      transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .bag-hud-btn:hover {
      transform: translateY(-2px) scale(1.02);
      border-color: #f0a489;
      box-shadow:
        0 10px 26px rgba(170, 110, 96, 0.32),
        inset 0 2px 5px rgba(255, 255, 255, 0.95);
    }
    .bag-hud-btn:active {
      transform: scale(0.96);
    }
    .bag-hud-btn.open-active {
      border-color: #ff8fad;
      background: linear-gradient(135deg, #fff2f6 0%, #ffe3ec 100%);
      color: #8c3d59;
    }
    .bag-hud-icon {
      font-size: 20px;
      line-height: 1;
    }
    .bag-hud-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      border-radius: 6px;
      background: #f6e1d3;
      color: #8c523e;
      font-size: 11px;
      font-weight: 900;
    }
    .bag-hud-count {
      display: none;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff99b6, #ff749b);
      color: #ffffff;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 0 3px 8px rgba(240, 108, 145, 0.35);
    }
    .bag-hud-count.has-items {
      display: inline-flex;
    }
    @media (max-width: 640px) {
      .bag-hud-btn {
        bottom: 18px;
        right: 14px;
        height: 44px;
        padding: 0 13px 0 11px;
        font-size: 12.5px;
      }
      .bag-hud-key {
        display: none;
      }
    }

    /* 화면 중앙 가방 모달 오버레이 */
    .inv-overlay {
      position: fixed;
      inset: 0;
      background: rgba(52, 34, 38, 0.34);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px 16px 16px;
      box-sizing: border-box;
      z-index: 350;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.24s ease, visibility 0.24s ease;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .inv-overlay.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    /* 클레이 가방 본체 래퍼 (상단 가방 손잡이 포함) */
    .inv-bag-shell {
      position: relative;
      width: min(94vw, 620px);
      max-height: 86vh;
      display: flex;
      flex-direction: column;
      transform: scale(0.92) translateY(18px);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      user-select: none;
    }
    .inv-overlay.visible .inv-bag-shell {
      transform: scale(1) translateY(0);
    }

    /* 가방 상단 클레이 손잡이 아치 */
    .inv-bag-handle {
      width: 118px;
      height: 22px;
      margin: 0 auto -6px;
      border-radius: 24px 24px 0 0;
      border: 6px solid #e9b99d;
      border-bottom: none;
      background: transparent;
      box-shadow:
        0 -4px 10px rgba(155, 102, 82, 0.16),
        inset 0 2px 3px rgba(255, 255, 255, 0.65);
      pointer-events: none;
    }

    .inv-window {
      width: 100%;
      max-height: calc(86vh - 18px);
      background: linear-gradient(180deg, #fffdf9 0%, #fff6ef 100%);
      border-radius: 32px;
      border: 4px solid #f4cfb8;
      box-shadow:
        0 24px 56px rgba(120, 76, 68, 0.3),
        0 4px 12px rgba(120, 76, 68, 0.12),
        inset 0 4px 10px rgba(255, 255, 255, 0.95),
        inset 0 -6px 14px rgba(235, 192, 168, 0.36);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #4f362f;
    }

    /* 가방 헤더 */
    .inv-header {
      padding: 18px 24px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 2px dashed #f2d2c0;
      background: linear-gradient(180deg, #fffaf4 0%, #fff0e6 100%);
    }
    .inv-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .inv-title-icon {
      width: 38px;
      height: 38px;
      border-radius: 14px;
      background: linear-gradient(135deg, #ffe5d4 0%, #ffd5c2 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(195, 128, 100, 0.22);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .inv-title {
      font-size: 19px;
      font-weight: 900;
      color: #7a4232;
      letter-spacing: -0.02em;
    }
    .inv-slot-summary {
      font-size: 11.5px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 999px;
      background: #fff8f2;
      border: 1.5px solid #f0ceb9;
      color: #9e6550;
    }
    .inv-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid #f2c8b6;
      background: #ffffff;
      color: #9e5946;
      font-size: 15px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .inv-close-btn:hover {
      background: #ffe6da;
      transform: scale(1.07);
    }

    /* 카테고리 탭 */
    .inv-tabs {
      display: flex;
      gap: 7px;
      padding: 11px 22px 10px;
      background: rgba(255, 249, 243, 0.92);
      border-bottom: 1.5px solid #f7dfd1;
      overflow-x: auto;
    }
    .inv-tab {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1.5px solid #f0d0be;
      background: #ffffff;
      color: #8c5e4f;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.16s ease;
    }
    .inv-tab:hover {
      background: #fff2e8;
      border-color: #eab598;
    }
    .inv-tab.active {
      background: linear-gradient(135deg, #ff99b4 0%, #f57a9b 100%);
      color: #ffffff;
      border-color: #f57a9b;
      box-shadow: 0 4px 10px rgba(245, 122, 155, 0.34);
    }

    /* 본문 (슬롯 그리드 + 선택 아이템 상세 카드) */
    .inv-body {
      padding: 18px 22px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 300px;
    }

    /* 4열 클레이 가방 슬롯 그리드 */
    .inv-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 11px;
    }
    @media (max-width: 560px) {
      .inv-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
      }
    }

    /* 아이템 슬롯 카드 */
    .inv-slot {
      min-height: 112px;
      background: linear-gradient(180deg, #ffffff 0%, #fff9f5 100%);
      border: 2.5px solid #f5d8c8;
      border-radius: 20px;
      padding: 10px 8px 9px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition:
        transform 0.16s cubic-bezier(0.22, 1, 0.36, 1),
        border-color 0.16s ease,
        box-shadow 0.16s ease,
        background 0.16s ease;
      box-shadow:
        0 5px 14px rgba(170, 122, 106, 0.1),
        inset 0 2px 4px rgba(255, 255, 255, 0.9);
    }
    .inv-slot:hover:not(.empty) {
      transform: translateY(-2px);
      border-color: #f4a4b8;
      box-shadow: 0 9px 18px rgba(185, 120, 138, 0.18);
    }
    .inv-slot.selected {
      border-color: #ff82a4;
      background: linear-gradient(180deg, #fffdfd 0%, #fff0f5 100%);
      box-shadow:
        0 0 0 3px rgba(255, 150, 178, 0.32),
        0 8px 18px rgba(200, 115, 142, 0.2);
    }
    .inv-slot.equipped {
      border-color: #93dbb6;
      background: linear-gradient(180deg, #fbfffe 0%, #f0fcf6 100%);
    }

    /* 빈 슬롯 스타일 */
    .inv-slot.empty {
      background: rgba(248, 234, 224, 0.42);
      border: 2px dashed #ead0c0;
      box-shadow: inset 0 2px 6px rgba(185, 142, 120, 0.1);
      cursor: default;
    }
    .inv-empty-slot-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(235, 208, 192, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #cfb09d;
      font-size: 13px;
      font-weight: 800;
    }
    .inv-empty-slot-label {
      margin-top: 6px;
      font-size: 10.5px;
      font-weight: 700;
      color: #c7a996;
    }

    /* 수량 배지 (× 1, × 2, × 3) */
    .inv-qty-badge {
      position: absolute;
      top: 7px;
      right: 7px;
      padding: 2px 7px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff99b4 0%, #f4779a 100%);
      color: #ffffff;
      font-size: 11px;
      font-weight: 900;
      line-height: 1.2;
      box-shadow: 0 3px 7px rgba(235, 110, 145, 0.34);
      letter-spacing: -0.01em;
    }

    /* 착용 상태 배지 */
    .inv-badge-equipped {
      position: absolute;
      top: 6px;
      left: 6px;
      font-size: 9.5px;
      font-weight: 800;
      color: #1f774e;
      background: #d4f7e5;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid #b3eccf;
    }

    .inv-item-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: linear-gradient(135deg, #fff4f8 0%, #ffe8f0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 6px;
      box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.9),
        0 3px 8px rgba(190, 140, 155, 0.12);
      overflow: hidden;
    }
    .inv-item-svg {
      width: 46px;
      height: 46px;
      display: block;
    }
    .inv-item-svg.large {
      width: 56px;
      height: 56px;
    }
    .inv-item-emoji {
      font-size: 28px;
      line-height: 1;
    }
    .inv-item-emoji.large {
      font-size: 34px;
    }

    .inv-item-name {
      font-size: 12px;
      font-weight: 800;
      color: #5b3b34;
      line-height: 1.28;
      word-break: keep-all;
    }

    /* 아이템 상세 정보 카드 */
    .inv-detail-card {
      background: #ffffff;
      border: 2.5px solid #f4d3c2;
      border-radius: 24px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow:
        0 8px 20px rgba(170, 120, 108, 0.12),
        inset 0 2px 4px rgba(255, 255, 255, 0.95);
    }
    .inv-detail-empty {
      background: rgba(255, 251, 247, 0.85);
      border: 2px dashed #edd1c0;
      border-radius: 22px;
      padding: 16px 18px;
      text-align: center;
      color: #9e7564;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.5;
    }
    .inv-detail-main {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .inv-detail-icon {
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: linear-gradient(135deg, #fff3f7 0%, #ffe3ec 100%);
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 14px rgba(235, 155, 178, 0.25);
    }
    .inv-detail-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .inv-detail-title-row {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
    }
    .inv-detail-name {
      font-size: 16px;
      font-weight: 900;
      color: #6b3640;
    }
    .inv-detail-category-badge {
      font-size: 11px;
      font-weight: 800;
      color: #a44865;
      background: #ffe5ee;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .inv-detail-qty-pill {
      font-size: 11.5px;
      font-weight: 900;
      color: #8c4b22;
      background: #fff0dd;
      border: 1px solid #f4cfa4;
      padding: 2px 9px;
      border-radius: 999px;
    }
    .inv-detail-desc {
      font-size: 13px;
      line-height: 1.52;
      color: #634942;
      font-weight: 600;
      word-break: keep-all;
      margin-top: 2px;
    }
    .inv-detail-source {
      font-size: 11.5px;
      color: #a67c6f;
      font-weight: 700;
    }

    .inv-detail-actions {
      display: flex;
      gap: 10px;
      border-top: 1.5px dashed #f5ddd0;
      padding-top: 11px;
    }
    .inv-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 15px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.16s ease;
    }
    .inv-btn-equip {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(255, 110, 148, 0.35);
    }
    .inv-btn-equip:hover {
      background: linear-gradient(135deg, #ff7e9f 0%, #ff5d86 100%);
      transform: translateY(-1px);
    }
    .inv-btn-unequip {
      background: #f7e8ee;
      color: #914861;
      border: 1.5px solid #ffccd9;
    }
    .inv-btn-unequip:hover {
      background: #f2dbe4;
    }
    .inv-btn-collectible {
      background: linear-gradient(180deg, #f3faf5 0%, #e7f5ec 100%);
      color: #2c744c;
      border: 1.5px solid #bee2ca;
      cursor: default;
    }

    .inv-footer-hint {
      font-size: 11.5px;
      font-weight: 700;
      text-align: center;
      color: #ad8475;
      padding: 6px 16px 12px;
      background: rgba(255, 248, 242, 0.7);
    }
    .inv-footer-hint kbd {
      background: #f3dfd3;
      border: 1px solid #e4c6b5;
      border-radius: 5px;
      padding: 1px 6px;
      font-family: inherit;
      font-size: 11px;
      color: #7d4c3b;
    }

    @media (max-width: 640px) {
      .inv-header {
        padding: 14px 16px 12px;
      }
      .inv-tabs {
        padding: 9px 14px;
      }
      .inv-body {
        padding: 14px 14px 10px;
      }
      .inv-slot {
        min-height: 98px;
        border-radius: 16px;
      }
      .inv-detail-card {
        padding: 13px 14px;
      }
      .inv-detail-icon {
        width: 56px;
        height: 56px;
      }
    }
  `;
  document.head.appendChild(style);

  // 1. 우측 하단 가방 HUD 아이콘 버튼 생성
  const bagHudBtn = document.createElement('button');
  bagHudBtn.type = 'button';
  bagHudBtn.className = 'bag-hud-btn';
  bagHudBtn.setAttribute('aria-label', '내 가방 열기/닫기 (I)');
  bagHudBtn.innerHTML = `
    <span class="bag-hud-icon">🎒</span>
    <span class="bag-hud-label">내 가방</span>
    <span class="bag-hud-count" aria-label="수집 아이템 수">0</span>
    <span class="bag-hud-key">I</span>
  `;
  document.body.appendChild(bagHudBtn);
  const bagHudCountEl = bagHudBtn.querySelector('.bag-hud-count');

  // 2. 화면 중앙 '내 가방' 모달 DOM 생성
  const overlay = document.createElement('div');
  overlay.className = 'inv-overlay';
  overlay.innerHTML = `
    <div class="inv-bag-shell">
      <div class="inv-bag-handle" aria-hidden="true"></div>
      <div class="inv-window" role="dialog" aria-modal="true" aria-label="내 가방">
        <div class="inv-header">
          <div class="inv-title-group">
            <span class="inv-title-icon">🎒</span>
            <span class="inv-title">내 가방</span>
            <span class="inv-slot-summary">0 / ${MIN_BAG_SLOTS}칸</span>
          </div>
          <button type="button" class="inv-close-btn" title="닫기 (I 또는 Esc)" aria-label="가방 닫기">✕</button>
        </div>
        <div class="inv-tabs">
          <button type="button" class="inv-tab active" data-type="${ItemType.COLLECTIBLE}">수집품</button>
          <button type="button" class="inv-tab" data-type="all">전체</button>
          <button type="button" class="inv-tab" data-type="${ItemType.HEAD}">헤어 액세서리</button>
          <button type="button" class="inv-tab" data-type="${ItemType.OUTFIT}">의상</button>
          <button type="button" class="inv-tab" data-type="${ItemType.SHOES}">신발</button>
        </div>
        <div class="inv-body">
          <div class="inv-grid-container"></div>
          <div class="inv-detail-container"></div>
        </div>
        <div class="inv-footer-hint">
          단축키 <kbd>I</kbd> 또는 <kbd>ESC</kbd>로 내 가방을 닫을 수 있습니다
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.inv-close-btn');
  const slotSummaryEl = overlay.querySelector('.inv-slot-summary');
  const tabs = overlay.querySelectorAll('.inv-tab');
  const gridContainer = overlay.querySelector('.inv-grid-container');
  const detailContainer = overlay.querySelector('.inv-detail-container');

  // 기본 탭: 수집품 (수집한 분홍색 꽃 수량과 빈 슬롯을 한눈에 확인)
  let currentTab = ItemType.COLLECTIBLE;
  let selectedItemId = null;
  let isOpen = false;
  let canOpenPredicate = null;
  const toggleCallbacks = [];

  function updateHudBadge() {
    const collectibleTotal =
      typeof inventorySystem.getTotalCollectibleCount === 'function'
        ? inventorySystem.getTotalCollectibleCount()
        : inventorySystem.getAcquiredItems(ItemType.COLLECTIBLE).reduce((sum, it) => sum + (it.quantity || 1), 0);

    bagHudCountEl.textContent = String(collectibleTotal);
    bagHudCountEl.classList.toggle('has-items', collectibleTotal > 0);
    bagHudBtn.classList.toggle('open-active', isOpen);
  }

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
    updateHudBadge();
    const items = inventorySystem.getAcquiredItems(currentTab);
    const totalSlots = Math.max(MIN_BAG_SLOTS, Math.ceil(items.length / 4) * 4);
    slotSummaryEl.textContent = `${items.length} / ${totalSlots}칸`;

    if (items.length > 0) {
      if (!selectedItemId || !items.some((it) => it.id === selectedItemId)) {
        selectedItemId = items[0].id;
      }
    } else {
      selectedItemId = null;
    }

    // 1. 슬롯 그리드 렌더링 (보유 아이템 슬롯 + 빈 슬롯)
    let gridHtml = '<div class="inv-grid">';
    for (let i = 0; i < totalSlots; i++) {
      const item = items[i];
      if (!item) {
        gridHtml += `
          <div class="inv-slot empty" aria-label="빈 슬롯">
            <span class="inv-empty-slot-dot">·</span>
            <span class="inv-empty-slot-label">비어 있음</span>
          </div>
        `;
        continue;
      }

      const isSelected = item.id === selectedItemId;
      const isEquipped = inventorySystem.isEquipped(item.id);
      const qty = item.quantity ?? inventorySystem.getItemCount(item.id);
      const showQty = item.type === ItemType.COLLECTIBLE || item.stackable || qty > 1;

      gridHtml += `
        <button
          type="button"
          class="inv-slot ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}"
          data-id="${item.id}"
          aria-pressed="${isSelected ? 'true' : 'false'}"
        >
          ${isEquipped ? '<span class="inv-badge-equipped">착용 중</span>' : ''}
          ${showQty ? `<span class="inv-qty-badge">× ${qty}</span>` : ''}
          <div class="inv-item-icon-box">${createItemVisualMarkup(item)}</div>
          <div class="inv-item-name">${item.name}</div>
        </button>
      `;
    }
    gridHtml += '</div>';
    gridContainer.innerHTML = gridHtml;

    gridContainer.querySelectorAll('.inv-slot[data-id]').forEach((slot) => {
      slot.addEventListener('click', () => {
        selectItem(slot.getAttribute('data-id'));
      });
    });

    // 2. 선택된 아이템 상세 정보 카드 렌더링
    const selectedItem = items.find((it) => it.id === selectedItemId);
    if (!selectedItem) {
      detailContainer.innerHTML = `
        <div class="inv-detail-empty">
          🎒 가방에 보관된 수집 아이템이 아직 없어요.<br />
          마을 주변에서 반짝이는 분홍색 꽃을 수집해 보세요!
        </div>
      `;
      return;
    }

    const isEquipped = inventorySystem.isEquipped(selectedItem.id);
    const qty = selectedItem.quantity ?? inventorySystem.getItemCount(selectedItem.id);
    const isCollectible = selectedItem.type === ItemType.COLLECTIBLE;
    const questHint =
      selectedItem.id === 'pink_flower'
        ? '🌸 폭시의 작은 부탁 퀘스트 연동 아이템 · 보관 중'
        : selectedItem.id === 'shiny_shell'
          ? '🐚 퀘스트 완료 보상 · 추후 퀘스트/퍼즐에 활용 가능'
          : selectedItem.id === 'old_voyage_log'
            ? '📜 사라진 등대의 비밀 단서 기록 · 섬의 과거와 연결된 단서'
            : '🎒 가방에 안전하게 보관 중';

    detailContainer.innerHTML = `
      <div class="inv-detail-card">
        <div class="inv-detail-main">
          <div class="inv-detail-icon">${createItemVisualMarkup(selectedItem, 'large')}</div>
          <div class="inv-detail-meta">
            <div class="inv-detail-title-row">
              <span class="inv-detail-name">${selectedItem.name}</span>
              <span class="inv-detail-category-badge">${selectedItem.categoryName || ItemTypeName[selectedItem.type] || '아이템'}</span>
              <span class="inv-detail-qty-pill">보유 수량: ${qty}개 (× ${qty})</span>
            </div>
            <div class="inv-detail-desc">${selectedItem.description}</div>
            ${selectedItem.source ? `<div class="inv-detail-source">획득처: ${selectedItem.source}</div>` : ''}
          </div>
        </div>
        <div class="inv-detail-actions">
          ${
            isCollectible
              ? `<div class="inv-btn inv-btn-collectible">${questHint}</div>`
              : isEquipped
                ? `<button type="button" class="inv-btn inv-btn-unequip" id="btn-unequip-item">✕ 착용 해제</button>`
                : `<button type="button" class="inv-btn inv-btn-equip" id="btn-equip-item">✨ 착용하기</button>`
          }
        </div>
      </div>
    `;

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

  // 탭 클릭
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectTab(tab.getAttribute('data-type'));
    });
  });

  // 가방 HUD 버튼 클릭으로 열기/닫기
  bagHudBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  bagHudBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    bagHudBtn.blur();
    if (isOpen) {
      close();
    } else {
      if (typeof canOpenPredicate === 'function' && !canOpenPredicate()) return;
      open();
    }
  });

  // 닫기 버튼 & 오버레이 외부 클릭
  closeBtn.addEventListener('click', () => close());
  overlay.addEventListener('pointerdown', (e) => e.stopPropagation());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // 인벤토리 오픈 시 ESC 닫기 및 이동/상호작용 키 차단
  window.addEventListener(
    'keydown',
    (e) => {
      if (!isOpen) return;

      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
        return;
      }

      // I 키는 main.js의 토글 흐름으로 닫히게 허용하되, 기타 이동/상호작용 키는 차단
      if (
        e.code === 'KeyE' ||
        e.code === 'Space' ||
        e.code === 'KeyM' ||
        e.code === 'KeyW' ||
        e.code === 'KeyA' ||
        e.code === 'KeyS' ||
        e.code === 'KeyD' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  // 인벤토리 상태 변경 구독 (배지 실시간 업데이트 + 열려있으면 즉시 리렌더)
  inventorySystem.subscribe(() => {
    updateHudBadge();
    if (isOpen) {
      render();
    }
  });

  updateHudBadge();

  function open() {
    if (isOpen) return;
    isOpen = true;
    render();
    overlay.classList.add('visible');
    bagHudBtn.classList.add('open-active');
    notifyToggle(true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('visible');
    bagHudBtn.classList.remove('open-active');
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
    setCanOpenPredicate(fn) {
      canOpenPredicate = fn;
    },
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
