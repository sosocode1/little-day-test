// 퀘스트 저널 UI, 우측 상단 요약 HUD 및 수집/보상 알림 UI
function formatCompletedDate(timestamp) {
  if (!timestamp) return '완료됨';
  try {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return '완료됨';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day} 완료`;
  } catch (e) {
    return '완료됨';
  }
}

export function createQuestUI() {
  // 기존 잔존 요소 정리 (HMR 등 중복 방지)
  const existingStyle = document.getElementById('little-day-quest-style');
  if (existingStyle) existingStyle.remove();
  document
    .querySelectorAll(
      '.quest-hud-container, .quest-journal-backdrop, .quest-stack, .quest-panel, .collect-toast, .reward-modal-backdrop, .delivery-modal-backdrop'
    )
    .forEach((el) => el.remove());

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-quest-style';
  style.textContent = `
    /* 우측 상단 퀘스트 HUD (월드맵 버튼 아래 단일 버튼 + 추적 요약 패널 1개) */
    .quest-hud-container {
      position: fixed;
      top: 74px;
      right: 24px;
      z-index: 120;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: none;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      user-select: none;
    }
    .quest-hud-container.journal-open {
      z-index: 390;
    }

    /* '📜 퀘스트' 전용 버튼 */
    .quest-journal-pill {
      height: 40px;
      padding: 0 14px 0 15px;
      background: rgba(255, 253, 250, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 4px 14px rgba(180, 130, 150, 0.2);
      color: #6a4050;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      pointer-events: auto;
    }
    .quest-journal-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(180, 130, 150, 0.28);
      border-color: #ffb8cc;
      background: #ffffff;
    }
    .quest-journal-pill:active {
      transform: scale(0.97);
    }
    .quest-journal-pill.open-active {
      border-color: #ff8fad;
      background: #fff2f6;
      color: #8c3d59;
    }
    .quest-hud-count {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 999px;
      background: #f4e6ec;
      color: #9b6c7e;
      font-size: 11px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .quest-hud-count.has-active {
      background: linear-gradient(135deg, #ff99b6, #ff769c);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(240, 108, 145, 0.35);
    }

    /* 현재 추적 중인 퀘스트 단일 요약 패널 */
    .quest-tracker-card {
      width: 226px;
      box-sizing: border-box;
      background: rgba(255, 253, 249, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 18px;
      padding: 11px 14px;
      border: 2px solid #ffd8e4;
      box-shadow: 0 8px 22px rgba(175, 125, 145, 0.2);
      color: #523842;
      text-align: left;
      cursor: pointer;
      display: none;
      pointer-events: auto;
      transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
    }
    .quest-tracker-card.visible {
      display: block;
    }
    .quest-tracker-card:hover {
      transform: translateY(-1px);
      border-color: #ffb8cc;
      box-shadow: 0 10px 26px rgba(175, 125, 145, 0.28);
    }
    .quest-tracker-card.pulse {
      animation: questProgressPulse 0.42s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .quest-tracker-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .quest-tracker-tag {
      font-size: 10px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 999px;
      background: #ffe6ef;
      color: #a6496b;
      flex-shrink: 0;
    }
    .quest-tracker-tag.main {
      background: #fff0d9;
      color: #9e5d20;
    }
    .quest-tracker-title {
      font-size: 13px;
      font-weight: 900;
      color: #6b384b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .quest-tracker-objective {
      font-size: 12px;
      font-weight: 700;
      color: #7a5c67;
      line-height: 1.4;
      word-break: keep-all;
    }

    @keyframes questProgressPulse {
      0% { transform: scale(1); }
      45% { transform: scale(1.035); }
      100% { transform: scale(1); }
    }

    @media (max-width: 1280px) {
      .quest-hud-container {
        right: 18px;
        top: 72px;
      }
      .quest-tracker-card {
        width: 210px;
      }
    }
    @media (max-width: 768px) {
      .quest-hud-container {
        right: 12px;
        top: 68px;
      }
      .quest-journal-pill {
        padding: 0 12px;
        font-size: 12.5px;
      }
      .quest-tracker-card {
        width: 190px;
        padding: 9px 12px;
      }
    }

    /* 화면 중앙 퀘스트 저널 모달 (동화책 크림·연핑크 감성) */
    .quest-journal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(54, 36, 44, 0.38);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      box-sizing: border-box;
      z-index: 380;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.24s ease, visibility 0.24s ease;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      user-select: none;
    }
    .quest-journal-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .quest-journal-window {
      width: min(92vw, 680px);
      height: min(82vh, 560px);
      max-height: 86vh;
      background: linear-gradient(180deg, #fffdf9 0%, #fff7f9 100%);
      border-radius: 28px;
      border: 3.5px solid #ffd6e2;
      box-shadow:
        0 24px 56px rgba(145, 90, 115, 0.32),
        inset 0 4px 10px rgba(255, 255, 255, 0.94),
        inset 0 -5px 12px rgba(242, 200, 214, 0.32);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: #4f3540;
      transform: scale(0.93) translateY(14px);
      transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .quest-journal-backdrop.open .quest-journal-window {
      transform: scale(1) translateY(0);
    }

    .qj-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 22px 13px;
      border-bottom: 2px dashed #ffe0ea;
      background: rgba(255, 255, 255, 0.55);
      flex-shrink: 0;
    }
    .qj-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .qj-title {
      font-size: 18.5px;
      font-weight: 900;
      color: #6b3648;
      letter-spacing: -0.3px;
    }
    .qj-summary-pill {
      font-size: 11.5px;
      font-weight: 800;
      color: #9e536d;
      background: #ffeaf1;
      border: 1px solid #ffd0df;
      padding: 3px 10px;
      border-radius: 999px;
    }
    .qj-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid #ffd0de;
      background: #fffafc;
      color: #9c6a80;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .qj-close-btn:hover {
      background: #ffeef4;
      color: #cf3d6d;
      transform: scale(1.06);
    }

    /* 상단 3개 탭 */
    .qj-tabs {
      display: flex;
      gap: 8px;
      padding: 12px 22px 10px;
      flex-shrink: 0;
    }
    .qj-tab {
      flex: 1;
      height: 38px;
      border-radius: 14px;
      border: 2px solid #f6dce5;
      background: #fff9fb;
      color: #8c5e70;
      font-family: inherit;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.16s ease;
    }
    .qj-tab:hover {
      border-color: #ffb8cc;
      background: #ffffff;
    }
    .qj-tab.active {
      background: linear-gradient(135deg, #ff96b4 0%, #ff789e 100%);
      border-color: #ff8fad;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(240, 110, 148, 0.3);
    }
    .qj-tab-count {
      min-width: 19px;
      height: 19px;
      padding: 0 5px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(160, 90, 115, 0.12);
      color: #8c4d64;
    }
    .qj-tab.active .qj-tab-count {
      background: rgba(255, 255, 255, 0.28);
      color: #ffffff;
    }

    /* 2단 동화책 본문 */
    .qj-body {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 14px;
      padding: 4px 22px 14px;
      overflow: hidden;
    }

    .qj-list-pane {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .qj-list-item {
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding: 12px 13px;
      border-radius: 18px;
      border: 2px solid #f5dce5;
      background: #ffffff;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.16s ease;
      box-shadow: 0 3px 10px rgba(190, 145, 165, 0.1);
    }
    .qj-list-item:hover {
      border-color: #ffb8cc;
      transform: translateY(-1px);
    }
    .qj-list-item.selected {
      border-color: #ff8fad;
      background: #fff5f8;
      box-shadow: 0 5px 14px rgba(240, 120, 155, 0.2);
    }
    .qj-list-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 5px;
    }
    .qj-list-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #5b3343;
      line-height: 1.3;
      word-break: keep-all;
    }
    .qj-list-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      color: #956d7c;
    }
    .qj-mini-badge {
      font-size: 10.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
      background: #ffe8f0;
      color: #a34968;
      flex-shrink: 0;
    }
    .qj-mini-badge.tracked {
      background: #fff0d6;
      color: #a35d18;
      border: 1px solid #f4d29a;
    }
    .qj-mini-badge.done {
      background: #d9f4e4;
      color: #27784b;
    }

    /* 우측 상세 패널 */
    .qj-detail-pane {
      background: #ffffff;
      border: 2px solid #f6dde6;
      border-radius: 22px;
      padding: 18px 18px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: inset 0 2px 6px rgba(250, 232, 238, 0.45);
    }
    .qj-detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1.5px dashed #f7dce6;
    }
    .qj-detail-tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 5px;
    }
    .qj-detail-title {
      font-size: 18px;
      font-weight: 900;
      color: #5c3142;
      letter-spacing: -0.3px;
    }
    .qj-npc-row {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 800;
      color: #8c5568;
      background: #fff6f9;
      border: 1px solid #ffdbe6;
      padding: 4px 11px;
      border-radius: 999px;
      align-self: flex-start;
    }
    .qj-desc {
      font-size: 13.5px;
      line-height: 1.6;
      font-weight: 600;
      color: #634952;
      word-break: keep-all;
      margin: 0;
    }

    .qj-section-label {
      font-size: 12px;
      font-weight: 900;
      color: #9c5b72;
      margin-bottom: 6px;
    }
    .qj-steps-box {
      background: #fffaf9;
      border: 1.5px solid #f7e2e8;
      border-radius: 16px;
      padding: 11px 13px;
    }
    .qj-steps-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .qj-step-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #9a7d87;
      line-height: 1.4;
    }
    .qj-step-row.done {
      color: #368058;
      text-decoration: line-through;
      opacity: 0.85;
    }
    .qj-step-row.active {
      color: #5d3043;
      font-weight: 900;
    }
    .qj-step-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 10.5px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #f3e4ea;
      color: #9d7584;
    }
    .qj-step-row.done .qj-step-dot {
      background: #d2f2e0;
      color: #27784b;
    }
    .qj-step-row.active .qj-step-dot {
      background: #ff8fad;
      color: #ffffff;
    }

    .qj-progress-wrap {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .qj-progress-top {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 800;
      color: #8c5c6e;
    }
    .qj-progress-bg {
      width: 100%;
      height: 9px;
      border-radius: 999px;
      background: #f7e6ec;
      overflow: hidden;
    }
    .qj-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #ffb0c7, #ff82a5);
      transition: width 0.3s ease;
    }
    .qj-progress-fill.done {
      background: linear-gradient(90deg, #8edbb0, #5ec48c);
    }

    .qj-rewards-box {
      background: #fff8f2;
      border: 1.5px dashed #f2d3be;
      border-radius: 16px;
      padding: 10px 13px;
    }
    .qj-rewards-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .qj-reward-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 11px;
      border-radius: 999px;
      background: #ffffff;
      border: 1.5px solid #f4d8c6;
      font-size: 12.5px;
      font-weight: 800;
      color: #6b4338;
    }

    .qj-detail-actions {
      margin-top: auto;
      padding-top: 8px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .qj-track-btn {
      padding: 8px 16px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 900;
      cursor: pointer;
      flex-shrink: 0;
      white-space: nowrap;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .qj-track-btn.primary {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      border: 2px solid #ffccd9;
      color: #ffffff;
      box-shadow: 0 5px 14px rgba(240, 110, 148, 0.34);
    }
    .qj-track-btn.primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 7px 18px rgba(240, 110, 148, 0.44);
    }
    .qj-track-btn.untrack {
      background: #f9edf1;
      border: 2px solid #f0cfd9;
      color: #8c4d63;
    }
    .qj-track-btn.untrack:hover {
      background: #f3dfe7;
    }

    .qj-empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 28px 16px;
      color: #9e7785;
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.6;
      word-break: keep-all;
    }

    .qj-footer {
      text-align: center;
      font-size: 11.5px;
      font-weight: 700;
      color: #a98190;
      padding: 9px 18px 13px;
      border-top: 1.5px dashed #ffe1ec;
      background: rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .quest-journal-window {
        height: min(86vh, 580px);
      }
      .qj-tabs {
        padding: 10px 14px 8px;
        gap: 6px;
      }
      .qj-tab {
        font-size: 12px;
        height: 36px;
      }
      .qj-body {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        padding: 4px 14px 12px;
      }
      .qj-list-pane {
        max-height: 138px;
      }
    }

    /* 수집 토스트 알림 (화면 상단 중앙) */
    .collect-toast {
      position: fixed;
      top: 130px;
      left: 50%;
      transform: translateX(-50%) translateY(-15px);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 10px 24px;
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(220, 110, 140, 0.25);
      border: 2px solid #ffb3c8;
      font-family: "Segoe UI", sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #8c435c;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      z-index: 200;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .collect-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* 클레이 팝업 애니메이션 */
    @keyframes clayModalPop {
      0% {
        transform: scale(0.7) translateY(20px);
        opacity: 0;
      }
      65% {
        transform: scale(1.04) translateY(-4px);
        opacity: 1;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    @keyframes clayFloat {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }
    @keyframes claySparkle {
      0%, 100% {
        transform: scale(1) rotate(0deg);
        opacity: 0.85;
      }
      50% {
        transform: scale(1.2) rotate(15deg);
        opacity: 1;
      }
    }

    /* 화면 중앙 클레이 감성 QUEST COMPLETE 팝업 */
    .reward-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(55, 35, 45, 0.45);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
    }
    .reward-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .reward-card {
      width: min(90vw, 440px);
      background: #fffdf9;
      border-radius: 32px;
      padding: 28px 26px 24px;
      box-shadow:
        0 24px 60px rgba(160, 95, 125, 0.35),
        0 4px 16px rgba(160, 95, 125, 0.15),
        inset 0 4px 10px rgba(255, 255, 255, 0.9),
        inset 0 -5px 12px rgba(240, 195, 210, 0.35);
      border: 4px solid #ffd8e4;
      text-align: center;
      transform: scale(0.85);
      transition: transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
    }
    .reward-modal-backdrop.open .reward-card {
      transform: scale(1);
      animation: clayModalPop 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* QUEST COMPLETE 상단 배너 */
    .reward-badge-banner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 6px 18px;
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 1.5px;
      border-radius: 999px;
      box-shadow:
        0 4px 14px rgba(255, 110, 148, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.6),
        inset 0 -2px 4px rgba(190, 50, 90, 0.25);
      border: 2px solid #ffb8cc;
      margin-bottom: 12px;
      user-select: none;
    }
    .reward-badge-sparkle {
      display: inline-block;
      animation: claySparkle 1.8s ease-in-out infinite;
    }

    .reward-header {
      font-size: 21px;
      font-weight: 900;
      color: #7b3850;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .reward-subheader {
      font-size: 13.5px;
      font-weight: 600;
      color: #a87285;
      margin-bottom: 14px;
    }

    /* 클레이 보상 카드 내부 컨테이너 */
    .reward-item-box {
      background: linear-gradient(180deg, #fff5f8 0%, #ffedf2 100%);
      border: 2.5px solid #ffccd9;
      border-radius: 24px;
      padding: 16px 16px 14px;
      margin-bottom: 18px;
      box-shadow:
        inset 0 2px 8px rgba(255, 255, 255, 0.9),
        0 6px 18px rgba(210, 130, 155, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .reward-icon-circle {
      width: 80px;
      height: 80px;
      margin: 0 auto 10px;
      background: linear-gradient(135deg, #ffffff 0%, #eef5ff 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      box-shadow:
        0 8px 20px rgba(140, 175, 230, 0.3),
        inset 0 3px 6px #ffffff,
        inset 0 -3px 6px rgba(170, 200, 245, 0.4);
      border: 3px solid #b8d4ff;
      animation: clayFloat 2.6s ease-in-out infinite;
    }

    .reward-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .reward-name {
      font-size: 18.5px;
      font-weight: 900;
      color: #3b4d75;
      letter-spacing: -0.2px;
    }
    .reward-count-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      background: #e6f0ff;
      color: #2b5cb8;
      border-radius: 999px;
      border: 1px solid #c2daff;
    }

    .reward-desc {
      font-size: 13px;
      color: #6d5563;
      line-height: 1.45;
      margin-bottom: 10px;
      padding: 0 8px;
    }

    .reward-inventory-hint {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      color: #925368;
      background: rgba(255, 255, 255, 0.75);
      padding: 5px 14px;
      border-radius: 999px;
      border: 1px dashed #ffb8cc;
    }

    .reward-confirm-btn {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      color: white;
      border: 2px solid #ffccd9;
      padding: 12px 42px;
      border-radius: 999px;
      font-size: 15.5px;
      font-weight: 900;
      cursor: pointer;
      box-shadow:
        0 6px 18px rgba(240, 110, 148, 0.38),
        inset 0 2px 4px rgba(255, 255, 255, 0.5),
        inset 0 -2px 4px rgba(180, 50, 90, 0.2);
      transition: all 0.16s ease;
      letter-spacing: 0.5px;
    }
    .reward-confirm-btn:hover {
      transform: translateY(-2px);
      box-shadow:
        0 9px 24px rgba(240, 110, 148, 0.48),
        inset 0 2px 4px rgba(255, 255, 255, 0.6);
      background: linear-gradient(135deg, #ff7e9f 0%, #ff5d86 100%);
    }
    .reward-confirm-btn:active {
      transform: translateY(1px);
      box-shadow: 0 3px 8px rgba(240, 110, 148, 0.3);
    }

    /* 아이템 전달 확인 클레이 모달 */
    .delivery-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(52, 34, 42, 0.45);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 320;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.24s ease, visibility 0.24s ease;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
    }
    .delivery-modal-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    .delivery-card {
      width: min(92vw, 430px);
      background: linear-gradient(180deg, #fffdf9 0%, #fff6ef 100%);
      border-radius: 30px;
      padding: 26px 24px 22px;
      border: 3.5px solid #f4cfb8;
      box-shadow:
        0 24px 56px rgba(135, 84, 78, 0.34),
        inset 0 4px 10px rgba(255, 255, 255, 0.94),
        inset 0 -5px 12px rgba(235, 192, 168, 0.34);
      text-align: center;
      transform: scale(0.9) translateY(14px);
      transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
      color: #4f362f;
    }
    .delivery-modal-backdrop.open .delivery-card {
      transform: scale(1) translateY(0);
    }
    .delivery-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      background: #ffe8ef;
      border: 1.5px solid #ffc6d8;
      color: #9e4564;
      font-size: 12px;
      font-weight: 900;
      margin-bottom: 10px;
    }
    .delivery-title {
      font-size: 19px;
      font-weight: 900;
      color: #6b3640;
      margin-bottom: 4px;
    }
    .delivery-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #9a6d62;
      margin-bottom: 16px;
    }
    .delivery-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .delivery-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 18px;
      background: #ffffff;
      border: 2px solid #f5d8c8;
      box-shadow: 0 4px 12px rgba(175, 120, 108, 0.1);
    }
    .delivery-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 14.5px;
      color: #5b3b34;
    }
    .delivery-item-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #fff0f5, #ffe2ec);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .delivery-item-qty {
      font-size: 12.5px;
      font-weight: 900;
      color: #2c7a4c;
      background: #e3f7eb;
      border: 1px solid #bde6ce;
      padding: 4px 10px;
      border-radius: 999px;
    }
    .delivery-reward-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 9px 14px;
      border-radius: 16px;
      background: linear-gradient(180deg, #f3f9ff 0%, #e7f3ff 100%);
      border: 1.5px dashed #b4d5f7;
      font-size: 12.5px;
      font-weight: 800;
      color: #3a5c8a;
      margin-bottom: 18px;
    }
    .delivery-actions {
      display: flex;
      gap: 10px;
    }
    .delivery-btn {
      flex: 1;
      padding: 11px 16px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 900;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .delivery-btn-cancel {
      background: #f6e7e0;
      border: 2px solid #e8cfc2;
      color: #84594c;
    }
    .delivery-btn-cancel:hover {
      background: #efdbd2;
    }
    .delivery-btn-confirm {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      border: 2px solid #ffccd9;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(240, 110, 148, 0.36);
    }
    .delivery-btn-confirm:hover {
      transform: translateY(-1.5px);
      box-shadow: 0 8px 20px rgba(240, 110, 148, 0.46);
    }
  `;
  document.head.appendChild(style);

  // 1. 우측 상단 퀘스트 HUD (전용 '📜 퀘스트' 버튼 + 단일 추적 요약 패널)
  const hudContainer = document.createElement('div');
  hudContainer.className = 'quest-hud-container';
  hudContainer.innerHTML = `
    <button type="button" class="quest-journal-pill" aria-label="퀘스트 저널 열기">
      <span>📜</span>
      <span>퀘스트</span>
      <span class="quest-hud-count">0</span>
    </button>
    <button type="button" class="quest-tracker-card" aria-label="추적 중인 퀘스트 보기">
      <div class="quest-tracker-title-row">
        <span class="quest-tracker-tag">메인</span>
        <span class="quest-tracker-title"></span>
      </div>
      <div class="quest-tracker-objective"></div>
    </button>
  `;
  document.body.appendChild(hudContainer);

  const journalOpenBtn = hudContainer.querySelector('.quest-journal-pill');
  const hudCountEl = hudContainer.querySelector('.quest-hud-count');
  const trackerCardEl = hudContainer.querySelector('.quest-tracker-card');
  const trackerTagEl = hudContainer.querySelector('.quest-tracker-tag');
  const trackerTitleEl = hudContainer.querySelector('.quest-tracker-title');
  const trackerObjectiveEl = hudContainer.querySelector('.quest-tracker-objective');

  // 1-B. 화면 중앙 퀘스트 저널 모달 DOM
  const journalBackdrop = document.createElement('div');
  journalBackdrop.className = 'quest-journal-backdrop';
  journalBackdrop.innerHTML = `
    <div class="quest-journal-window" role="dialog" aria-modal="true" aria-label="퀘스트 저널">
      <div class="qj-header">
        <div class="qj-title-group">
          <span class="qj-title">📜 퀘스트 저널</span>
          <span class="qj-summary-pill">진행 중 0개</span>
        </div>
        <button type="button" class="qj-close-btn" title="닫기 (Esc)" aria-label="퀘스트 저널 닫기">✕</button>
      </div>
      <div class="qj-tabs" role="tablist">
        <button type="button" class="qj-tab active" data-tab="main" role="tab" aria-selected="true">
          <span>메인 퀘스트</span>
          <span class="qj-tab-count" data-count="main">0</span>
        </button>
        <button type="button" class="qj-tab" data-tab="sub" role="tab" aria-selected="false">
          <span>서브 퀘스트</span>
          <span class="qj-tab-count" data-count="sub">0</span>
        </button>
        <button type="button" class="qj-tab" data-tab="completed" role="tab" aria-selected="false">
          <span>완료한 퀘스트</span>
          <span class="qj-tab-count" data-count="completed">0</span>
        </button>
      </div>
      <div class="qj-body">
        <div class="qj-list-pane"></div>
        <div class="qj-detail-pane"></div>
      </div>
      <div class="qj-footer">
        퀘스트 버튼 다시 클릭 또는 [ESC] 키로 저널을 닫을 수 있습니다
      </div>
    </div>
  `;
  document.body.appendChild(journalBackdrop);

  const qjSummaryEl = journalBackdrop.querySelector('.qj-summary-pill');
  const qjCloseBtn = journalBackdrop.querySelector('.qj-close-btn');
  const qjTabBtns = journalBackdrop.querySelectorAll('.qj-tab');
  const qjListPane = journalBackdrop.querySelector('.qj-list-pane');
  const qjDetailPane = journalBackdrop.querySelector('.qj-detail-pane');

  let journalOpen = false;
  let activeTab = 'main';
  let selectedQuestId = null;
  let lastJournalData = {
    main: [],
    sub: [],
    completed: [],
    activeCount: 0,
    trackedQuestId: null,
    trackedQuest: null
  };
  let lastTrackerSignature = '';
  let onToggleTrackHandler = null;
  let canOpenPredicate = null;

  function renderJournalModal() {
    const data = lastJournalData;
    const completedCount = data.completed.length;
    qjSummaryEl.textContent = `진행 중 ${data.activeCount}개 · 완료 ${completedCount}개`;

    const counts = {
      main: data.main.length,
      sub: data.sub.length,
      completed: data.completed.length
    };

    qjTabBtns.forEach((btn) => {
      const tabKey = btn.getAttribute('data-tab');
      const isSelected = tabKey === activeTab;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const countSpan = btn.querySelector('.qj-tab-count');
      if (countSpan) countSpan.textContent = String(counts[tabKey] || 0);
    });

    const list = data[activeTab] || [];
    if (list.length === 0) {
      selectedQuestId = null;
      const emptyMessages = {
        main: '현재 진행 중인 메인 퀘스트가 없습니다.\n마을 주민들과 대화하거나 달빛 섬을 탐험해 보세요.',
        sub: '현재 진행 중인 서브 퀘스트가 없습니다.\n마을의 동물 친구들에게 말을 걸어 부탁을 들어보세요.',
        completed: '아직 완료한 퀘스트가 없습니다.\n진행 중인 퀘스트를 완료하면 이곳에 기록됩니다.'
      };
      qjListPane.innerHTML = `<div class="qj-empty-state">목록이 비어 있어요</div>`;
      qjDetailPane.innerHTML = `<div class="qj-empty-state">${emptyMessages[activeTab].replace(/\n/g, '<br />')}</div>`;
      return;
    }

    if (!selectedQuestId || !list.some((q) => q.id === selectedQuestId)) {
      selectedQuestId = list[0].id;
    }

    qjListPane.innerHTML = list
      .map((q) => {
        const isSel = q.id === selectedQuestId;
        const badgeClass = q.status === 'completed' ? 'done' : q.isTracked ? 'tracked' : '';
        const badgeLabel = q.status === 'completed' ? '완료됨' : q.isTracked ? '추적 중' : q.statusLabel;
        const subMeta =
          activeTab === 'completed'
            ? formatCompletedDate(q.completedAt)
            : q.category === 'sub' && q.giverNpcName
              ? q.giverNpcName.split(' ')[0]
              : q.progressText;
        return `
          <button type="button" class="qj-list-item ${isSel ? 'selected' : ''}" data-quest-id="${q.id}">
            <div class="qj-list-top">
              <span class="qj-list-title">${q.title}</span>
              <span class="qj-mini-badge ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="qj-list-meta">
              <span>${subMeta}</span>
              <span>${q.progressText}</span>
            </div>
          </button>
        `;
      })
      .join('');

    qjListPane.querySelectorAll('.qj-list-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedQuestId = btn.getAttribute('data-quest-id');
        renderJournalModal();
      });
    });

    const q = list.find((item) => item.id === selectedQuestId) || list[0];
    const isCompleted = q.status === 'completed';

    const stepsHtml = (q.steps || [])
      .map((step, idx) => {
        const cls = step.done ? 'done' : step.active ? 'active' : '';
        const dot = step.done ? '✓' : String(idx + 1);
        const extra = step.extraText ? ` ${step.extraText}` : '';
        return `
          <li class="qj-step-row ${cls}">
            <span class="qj-step-dot">${dot}</span>
            <span>${step.label}${extra}</span>
          </li>
        `;
      })
      .join('');

    const rewardsHtml = (q.rewards || [])
      .map(
        (r) => `
        <span class="qj-reward-chip">
          <span>${r.icon || '🎁'}</span>
          <span>${r.name} × ${r.count || 1}</span>
        </span>
      `
      )
      .join('');

    const statusBadgeClass = isCompleted ? 'done' : q.isTracked ? 'tracked' : '';
    const statusBadgeText = isCompleted ? formatCompletedDate(q.completedAt) : q.isTracked ? '추적 중' : q.statusLabel;

    qjDetailPane.innerHTML = `
      <div class="qj-detail-header">
        <div>
          <div class="qj-detail-tags">
            <span class="qj-mini-badge">${q.category === 'main' ? '메인 퀘스트' : '서브 퀘스트'}</span>
            <span class="qj-mini-badge ${statusBadgeClass}">${statusBadgeText}</span>
          </div>
          <div class="qj-detail-title">${q.title}</div>
        </div>
        ${
          !isCompleted
            ? `
          <button
            type="button"
            class="qj-track-btn ${q.isTracked ? 'untrack' : 'primary'}"
            data-track-quest="${q.id}"
          >
            ${q.isTracked ? '추적 해제' : '추적하기'}
          </button>
        `
            : ''
        }
      </div>

      ${
        q.category === 'sub' && q.giverNpcName
          ? `<div class="qj-npc-row">의뢰인 · ${q.giverNpcName}</div>`
          : ''
      }

      ${q.description ? `<p class="qj-desc">${q.description}</p>` : ''}

      <div class="qj-steps-box">
        <div class="qj-section-label">${isCompleted ? '완료한 목표' : '세부 목표 및 진행 상태'}</div>
        <ul class="qj-steps-list">${stepsHtml}</ul>
      </div>

      <div class="qj-progress-wrap">
        <div class="qj-progress-top">
          <span>현재 진행도</span>
          <span>${q.progressText} (${q.progressPercent}%)</span>
        </div>
        <div class="qj-progress-bg">
          <div class="qj-progress-fill ${isCompleted ? 'done' : ''}" style="width: ${q.progressPercent}%"></div>
        </div>
      </div>

      ${
        rewardsHtml
          ? `
        <div class="qj-rewards-box">
          <div class="qj-section-label">${isCompleted ? '획득한 보상' : '완료 보상'}</div>
          <div class="qj-rewards-list">${rewardsHtml}</div>
        </div>
      `
          : ''
      }
    `;

    const trackBtn = qjDetailPane.querySelector('[data-track-quest]');
    if (trackBtn) {
      trackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = trackBtn.getAttribute('data-track-quest');
        if (typeof onToggleTrackHandler === 'function') {
          onToggleTrackHandler(targetId);
        }
      });
    }
  }

  function renderHudSummary() {
    const data = lastJournalData;
    hudCountEl.textContent = String(data.activeCount);
    hudCountEl.classList.toggle('has-active', data.activeCount > 0);
    journalOpenBtn.classList.toggle('open-active', journalOpen);

    const tracked = data.trackedQuest;
    if (!tracked) {
      trackerCardEl.classList.remove('visible');
      lastTrackerSignature = '';
      return;
    }

    trackerTagEl.textContent = tracked.category === 'main' ? '메인' : '서브';
    trackerTagEl.classList.toggle('main', tracked.category === 'main');
    trackerTitleEl.textContent = tracked.title;
    trackerObjectiveEl.textContent = tracked.currentObjective;
    trackerCardEl.classList.add('visible');

    const nextSig = `${tracked.id}:${tracked.currentObjective}`;
    if (lastTrackerSignature && lastTrackerSignature !== nextSig) {
      trackerCardEl.classList.remove('pulse');
      void trackerCardEl.offsetWidth;
      trackerCardEl.classList.add('pulse');
    }
    lastTrackerSignature = nextSig;
  }

  function openJournal(preferredTab = null, preferredQuestId = null) {
    if (typeof canOpenPredicate === 'function' && !journalOpen && !canOpenPredicate()) {
      return;
    }
    if (preferredTab && ['main', 'sub', 'completed'].includes(preferredTab)) {
      activeTab = preferredTab;
    } else {
      const currentList = lastJournalData[activeTab] || [];
      if (currentList.length === 0) {
        if (lastJournalData.trackedQuest) {
          activeTab = lastJournalData.trackedQuest.category === 'main' ? 'main' : 'sub';
        } else if (lastJournalData.main.length > 0) {
          activeTab = 'main';
        } else if (lastJournalData.sub.length > 0) {
          activeTab = 'sub';
        } else if (lastJournalData.completed.length > 0) {
          activeTab = 'completed';
        }
      }
    }
    if (preferredQuestId) {
      selectedQuestId = preferredQuestId;
    } else if (lastJournalData.trackedQuest && (lastJournalData[activeTab] || []).some((q) => q.id === lastJournalData.trackedQuest.id)) {
      selectedQuestId = lastJournalData.trackedQuest.id;
    }

    journalOpen = true;
    hudContainer.classList.add('journal-open');
    renderJournalModal();
    renderHudSummary();
    journalBackdrop.classList.add('open');
  }

  function closeJournal() {
    if (!journalOpen) return;
    journalOpen = false;
    hudContainer.classList.remove('journal-open');
    journalBackdrop.classList.remove('open');
    renderHudSummary();
  }

  function toggleJournal() {
    if (journalOpen) closeJournal();
    else openJournal();
  }

  journalOpenBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  journalOpenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    journalOpenBtn.blur();
    toggleJournal();
  });

  trackerCardEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  trackerCardEl.addEventListener('click', (e) => {
    e.stopPropagation();
    trackerCardEl.blur();
    const tracked = lastJournalData.trackedQuest;
    if (tracked) {
      openJournal(tracked.category === 'main' ? 'main' : 'sub', tracked.id);
    } else {
      openJournal();
    }
  });

  qjCloseBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  qjCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeJournal();
  });

  qjTabBtns.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeTab = btn.getAttribute('data-tab') || 'main';
      selectedQuestId = null;
      renderJournalModal();
    });
  });

  journalBackdrop.addEventListener('pointerdown', (e) => e.stopPropagation());
  journalBackdrop.addEventListener('click', (e) => {
    if (e.target === journalBackdrop) {
      e.stopPropagation();
      closeJournal();
    }
  });

  // 2. 수집 토스트 DOM
  const toastEl = document.createElement('div');
  toastEl.className = 'collect-toast';
  document.body.appendChild(toastEl);
  let toastTimer = null;

  // 3. 보상 모달 DOM (화면 중앙 클레이 감성 QUEST COMPLETE 팝업)
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'reward-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="reward-card" role="dialog" aria-modal="true" aria-label="퀘스트 완료">
      <div class="reward-badge-banner">
        <span class="reward-badge-sparkle">✨</span>
        <span>QUEST COMPLETE</span>
        <span class="reward-badge-sparkle">✨</span>
      </div>
      <div class="reward-header">폭시의 작은 부탁</div>
      <div class="reward-subheader">폭시에게 분홍색 꽃 3개를 전달했습니다!</div>
      <div class="reward-item-box">
        <div class="reward-icon-circle">🐚</div>
        <div class="reward-name-row">
          <span class="reward-name">반짝이는 조개</span>
          <span class="reward-count-pill">+ 1개 획득</span>
        </div>
        <div class="reward-desc">햇빛과 달빛을 받으면 영롱하게 빛나는 바닷가의 작은 조개껍데기다.</div>
        <div class="reward-inventory-hint">
          <span>🎒</span>
          <span>내 가방 [I] 키에서 보상 아이템 상세 정보를 확인하세요</span>
        </div>
      </div>
      <button class="reward-confirm-btn">보상 받기</button>
    </div>
  `;
  document.body.appendChild(modalBackdrop);
  const rewardConfirmBtn = modalBackdrop.querySelector('.reward-confirm-btn');

  // 4. 아이템 전달 확인 모달 DOM (확장 가능한 NPC 전달 확인창)
  const deliveryBackdrop = document.createElement('div');
  deliveryBackdrop.className = 'delivery-modal-backdrop';
  deliveryBackdrop.innerHTML = `
    <div class="delivery-card" role="dialog" aria-modal="true" aria-label="아이템 전달 확인">
      <div class="delivery-badge"><span>🌸</span><span>아이템 전달 확인</span></div>
      <div class="delivery-title">폭시에게 꽃을 전달할까요?</div>
      <div class="delivery-subtitle">전달하면 가방에서 해당 수량만큼 차감됩니다.</div>
      <div class="delivery-items-list"></div>
      <div class="delivery-reward-preview"></div>
      <div class="delivery-actions">
        <button type="button" class="delivery-btn delivery-btn-cancel">취소</button>
        <button type="button" class="delivery-btn delivery-btn-confirm">전달하기 ✨</button>
      </div>
    </div>
  `;
  document.body.appendChild(deliveryBackdrop);
  const deliveryTitleEl = deliveryBackdrop.querySelector('.delivery-title');
  const deliverySubtitleEl = deliveryBackdrop.querySelector('.delivery-subtitle');
  const deliveryListEl = deliveryBackdrop.querySelector('.delivery-items-list');
  const deliveryRewardEl = deliveryBackdrop.querySelector('.delivery-reward-preview');
  const deliveryCancelBtn = deliveryBackdrop.querySelector('.delivery-btn-cancel');
  const deliveryConfirmBtn = deliveryBackdrop.querySelector('.delivery-btn-confirm');

  let onDeliveryConfirm = null;
  let onDeliveryCancel = null;

  function closeDelivery(confirmed = false) {
    if (!deliveryBackdrop.classList.contains('open')) return;
    deliveryBackdrop.classList.remove('open');
    const confirmCb = onDeliveryConfirm;
    const cancelCb = onDeliveryCancel;
    onDeliveryConfirm = null;
    onDeliveryCancel = null;
    if (confirmed) {
      if (typeof confirmCb === 'function') confirmCb();
    } else {
      if (typeof cancelCb === 'function') cancelCb();
    }
  }

  deliveryCancelBtn.addEventListener('click', () => closeDelivery(false));
  deliveryConfirmBtn.addEventListener('click', () => closeDelivery(true));
  deliveryBackdrop.addEventListener('pointerdown', (e) => e.stopPropagation());
  deliveryBackdrop.addEventListener('click', (e) => {
    if (e.target === deliveryBackdrop) closeDelivery(false);
  });

  let onRewardClose = null;
  function closeReward() {
    modalBackdrop.classList.remove('open');
    if (onRewardClose) {
      onRewardClose();
      onRewardClose = null;
    }
  }
  rewardConfirmBtn.addEventListener('click', closeReward);
  modalBackdrop.addEventListener('pointerdown', (e) => e.stopPropagation());
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeReward();
  });

  // 단축키 (Esc / Enter / Space) 지원 (전달 확인 모달 및 보상 모달)
  window.addEventListener(
    'keydown',
    (e) => {
      if (deliveryBackdrop.classList.contains('open')) {
        if (e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeDelivery(false);
          return;
        }
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeDelivery(true);
          return;
        }
        return;
      }

      if (modalBackdrop.classList.contains('open') && (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeReward();
        return;
      }

      if (journalOpen && e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeJournal();
      }
    },
    true
  );

  return {
    bindJournalHandlers({ onToggleTrack = null } = {}) {
      onToggleTrackHandler = onToggleTrack;
    },
    setCanOpenPredicate(fn) {
      canOpenPredicate = typeof fn === 'function' ? fn : null;
    },
    renderJournal(data) {
      if (!data) return;
      lastJournalData = data;
      renderHudSummary();
      if (journalOpen) {
        renderJournalModal();
      }
    },
    openJournal,
    closeJournal,
    toggleJournal,
    isJournalOpen() {
      return journalOpen;
    },
    // 기존 호출 하위 호환 유지 (더 이상 다중 카드를 화면에 나열하지 않음)
    showPanel() {},
    hidePanel() {},
    updateMainQuest() {},
    updateQuestProgress() {},
    // NPC 아이템 전달 확인창 표시
    showDeliveryConfirmModal(options = {}, onConfirm = null, onCancel = null) {
      onDeliveryConfirm = onConfirm;
      onDeliveryCancel = onCancel;
      deliveryTitleEl.textContent = options.title || `${options.npcName || '폭시'}에게 아이템을 전달할까요?`;
      deliverySubtitleEl.textContent = options.subtitle || '전달 완료 시 내 가방에서 해당 아이템이 차감됩니다.';

      const reqs = Array.isArray(options.requirements) ? options.requirements : [];
      deliveryListEl.innerHTML = reqs
        .map(
          (req) => `
          <div class="delivery-item-row">
            <div class="delivery-item-left">
              <span class="delivery-item-icon">${req.icon || '🌸'}</span>
              <span>${req.name}</span>
            </div>
            <span class="delivery-item-qty">보유 ${req.owned}개 / 전달 ${req.count}개</span>
          </div>
        `
        )
        .join('');

      const rewards = Array.isArray(options.rewards) ? options.rewards : [];
      if (rewards.length > 0) {
        const rewardText = rewards.map((r) => `${r.icon || '🎁'} ${r.name} × ${r.count || 1}`).join(', ');
        deliveryRewardEl.innerHTML = `<span>🎁 완료 보상:</span> <span>${rewardText}</span>`;
        deliveryRewardEl.style.display = 'flex';
      } else {
        deliveryRewardEl.style.display = 'none';
      }

      deliveryBackdrop.classList.add('open');
    },
    isDeliveryModalOpen() {
      return deliveryBackdrop.classList.contains('open');
    },
    closeDeliveryModal: () => closeDelivery(false),
    // 범용 토스트 알림 팝업
    showToast(message, icon = '✨', duration = 2400) {
      if (toastTimer) clearTimeout(toastTimer);
      toastEl.innerHTML = `<span>${icon}</span> ${message}`;
      toastEl.classList.add('show');
      toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
      }, duration);
    },
    // 꽃 수집 토스트 팝업 (꽃 수집 전용)
    showCollectToast(current, target) {
      this.showToast(`분홍색 꽃 수집! (${current}/${target})`, '🌸', 2200);
    },
    // 화면 중앙 클레이 QUEST COMPLETE 보상 획득 모달 표시
    showRewardModal(reward, onClose = null) {
      onRewardClose = onClose;
      if (reward) {
        if (reward.title) modalBackdrop.querySelector('.reward-header').textContent = reward.title;
        if (reward.subtitle) modalBackdrop.querySelector('.reward-subheader').textContent = reward.subtitle;
        if (reward.name) modalBackdrop.querySelector('.reward-name').textContent = reward.name;
        if (reward.description) modalBackdrop.querySelector('.reward-desc').textContent = reward.description;
        if (reward.icon) modalBackdrop.querySelector('.reward-icon-circle').textContent = reward.icon;
        const countPill = modalBackdrop.querySelector('.reward-count-pill');
        if (countPill) countPill.textContent = `+ ${reward.count || 1}개 획득`;
      }
      modalBackdrop.classList.add('open');
    },
    isRewardModalOpen() {
      return modalBackdrop.classList.contains('open');
    },
    closeRewardModal: closeReward
  };
}
