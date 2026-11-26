// 퀘스트 진행 상태 패널 및 수집/보상 알림 UI
export function createQuestUI() {
  // 기존 잔존 요소 정리 (HMR 등 중복 방지)
  const existingStyle = document.getElementById('little-day-quest-style');
  if (existingStyle) existingStyle.remove();
  document.querySelectorAll('.quest-stack, .quest-panel, .collect-toast, .reward-modal-backdrop, .delivery-modal-backdrop').forEach((el) => el.remove());

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-quest-style';
  style.textContent = `
    /* 우측 상단 다중 퀘스트 스택 컨테이너 (월드맵 버튼 아래 배치) */
    .quest-stack {
      position: fixed;
      top: 76px;
      right: 24px;
      width: 260px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 100;
      pointer-events: none;
    }
    /* 우측 상단 퀘스트 패널 */
    .quest-panel {
      width: 100%;
      box-sizing: border-box;
      background: rgba(255, 253, 250, 0.94);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 15px 17px;
      box-shadow: 0 10px 30px rgba(180, 130, 150, 0.22);
      border: 2px solid #ffd6e2;
      font-family: "Pretendard", "Segoe UI", sans-serif;
      color: #4a343e;
      user-select: none;
      display: none;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .quest-panel.visible {
      display: block;
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
    .quest-panel.main-quest-panel {
      border-color: #d6ccfa;
      box-shadow: 0 10px 28px rgba(125, 112, 178, 0.22);
    }
    .quest-panel.main-quest-panel .quest-panel-header {
      color: #543e8a;
      border-bottom-color: #e4ddfb;
    }
    .quest-panel.main-quest-panel .quest-badge {
      background: #efe9ff;
      color: #5d439c;
    }
    .quest-panel.main-quest-panel .quest-badge.complete {
      background: #cfeedd;
      color: #2b7a4b;
    }
    .quest-panel.main-quest-panel .quest-progress-bar-bg {
      background: #eee9fa;
    }
    .quest-panel.main-quest-panel .quest-progress-bar-fill {
      background: linear-gradient(90deg, #a7b8ff, #8e9df7);
    }
    .quest-steps-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 6px 0 8px;
      padding: 0;
      list-style: none;
    }
    .quest-step-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.8px;
      font-weight: 700;
      color: #9b8ca8;
      line-height: 1.35;
    }
    .quest-step-item.done {
      color: #3f8a62;
      text-decoration: line-through;
      opacity: 0.84;
    }
    .quest-step-item.active {
      color: #4b3578;
      font-weight: 900;
    }
    .quest-step-dot {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9.5px;
      flex-shrink: 0;
      background: #eee9f8;
      color: #8d7ea8;
    }
    .quest-step-item.done .quest-step-dot {
      background: #d3f2e0;
      color: #27784b;
    }
    .quest-step-item.active .quest-step-dot {
      background: #92a2ff;
      color: #ffffff;
    }
    .quest-panel.pulse {
      animation: questProgressPulse 0.42s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .quest-panel.completed-celebrate {
      border-color: #8fd9ae;
      box-shadow:
        0 12px 32px rgba(80, 175, 120, 0.28),
        0 0 0 3px rgba(175, 235, 200, 0.45);
      animation: questProgressPulse 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes questProgressPulse {
      0% { transform: scale(1); }
      45% { transform: scale(1.045); }
      100% { transform: scale(1); }
    }
    @media (max-width: 1280px) {
      .quest-stack {
        width: 230px;
        right: 18px;
        top: 74px;
      }
      .quest-panel {
        padding: 13px 15px;
      }
    }
    @media (max-width: 768px) {
      .quest-stack {
        width: 205px;
        right: 12px;
        top: 70px;
      }
      .quest-panel {
        padding: 10px 12px;
      }
    }
    .quest-panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 800;
      color: #8c435c;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1.5px dashed #ffd6e2;
    }
    .quest-title-text {
      flex: 1;
    }
    .quest-badge {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 6px;
      background: #ffe3ec;
      color: #a04968;
      font-weight: 700;
    }
    .quest-badge.complete {
      background: #cfeedd;
      color: #2b7a4b;
    }
    .quest-goal-text {
      font-size: 13px;
      font-weight: 600;
      color: #5c454e;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .quest-progress-bar-bg {
      width: 100%;
      height: 8px;
      background: #f5e4ea;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 6px;
    }
    .quest-progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #ffb3c8, #ff8fad);
      border-radius: 999px;
      transition: width 0.35s ease;
    }
    .quest-progress-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
      color: #8c6071;
      margin-top: 5px;
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

  // 1. 퀘스트 스택 및 패널 DOM 생성 (메인 퀘스트 + 기존 폭시 퀘스트 동시 지원)
  const stackEl = document.createElement('div');
  stackEl.className = 'quest-stack';
  document.body.appendChild(stackEl);

  // (A) 메인 퀘스트 패널: 사라진 등대의 비밀 (5단계 실시간 갱신)
  const mainPanelEl = document.createElement('div');
  mainPanelEl.className = 'quest-panel main-quest-panel';
  mainPanelEl.innerHTML = `
    <div class="quest-panel-header">
      <span>🏛️</span>
      <span class="quest-title-text main-quest-title">사라진 등대의 비밀</span>
      <span class="quest-badge main-quest-badge">진행 중</span>
    </div>
    <ul class="quest-steps-list"></ul>
    <div class="quest-progress-bar-bg">
      <div class="quest-progress-bar-fill main-quest-fill"></div>
    </div>
    <div class="quest-progress-text">
      <span class="main-quest-hint">달빛 섬 등대 주변을 탐색해 보세요</span>
      <span class="main-quest-count">0/5</span>
    </div>
  `;
  stackEl.appendChild(mainPanelEl);

  const mainTitleEl = mainPanelEl.querySelector('.main-quest-title');
  const mainBadgeEl = mainPanelEl.querySelector('.main-quest-badge');
  const mainStepsEl = mainPanelEl.querySelector('.quest-steps-list');
  const mainFillEl = mainPanelEl.querySelector('.main-quest-fill');
  const mainHintEl = mainPanelEl.querySelector('.main-quest-hint');
  const mainCountEl = mainPanelEl.querySelector('.main-quest-count');

  // (B) 기존 퀘스트 패널: 폭시의 작은 부탁
  const panelEl = document.createElement('div');
  panelEl.className = 'quest-panel';
  panelEl.innerHTML = `
    <div class="quest-panel-header">
      <span>🌸</span>
      <span class="quest-title-text">폭시의 작은 부탁</span>
      <span class="quest-badge">진행 중</span>
    </div>
    <div class="quest-goal-text">분홍색 꽃 모으기</div>
    <div class="quest-progress-bar-bg">
      <div class="quest-progress-bar-fill"></div>
    </div>
    <div class="quest-progress-text">
      <span class="quest-status-hint">마을 주변을 찾아보세요</span>
      <span class="quest-count">0/3</span>
    </div>
  `;
  stackEl.appendChild(panelEl);

  const titleEl = panelEl.querySelector('.quest-title-text');
  const badgeEl = panelEl.querySelector('.quest-badge');
  const goalEl = panelEl.querySelector('.quest-goal-text');
  const fillEl = panelEl.querySelector('.quest-progress-bar-fill');
  const hintEl = panelEl.querySelector('.quest-status-hint');
  const countEl = panelEl.querySelector('.quest-count');

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
      }
    },
    true
  );

  return {
    showPanel() {
      panelEl.classList.add('visible');
    },
    hidePanel() {
      panelEl.classList.remove('visible');
    },
    // 메인 퀘스트 ('사라진 등대의 비밀' 등 다단계 퀘스트) 실시간 패널 갱신
    updateMainQuest(questState) {
      if (!questState || !questState.active) {
        mainPanelEl.classList.remove('visible');
        return;
      }

      mainPanelEl.classList.add('visible');
      mainTitleEl.textContent = questState.title || '사라진 등대의 비밀';

      const steps = Array.isArray(questState.steps) ? questState.steps : [];
      const completedSet = new Set(Array.isArray(questState.completedSteps) ? questState.completedSteps : []);
      const total = steps.length || 5;
      const doneCount = Math.min(total, completedSet.size);
      const isCompleted = Boolean(questState.completed || doneCount >= total);
      const pct = Math.min(100, (doneCount / total) * 100);

      mainFillEl.style.width = `${pct}%`;
      mainCountEl.textContent = `${doneCount}/${total}`;

      let firstPendingFound = false;
      mainStepsEl.innerHTML = steps
        .map((step, idx) => {
          const done = completedSet.has(step.id);
          let isActive = false;
          if (!done && !firstPendingFound) {
            firstPendingFound = true;
            isActive = true;
          }
          const extra =
            step.id === 'find_clues' && typeof questState.discoveredClueCount === 'number' && typeof questState.totalClues === 'number'
              ? ` (${questState.discoveredClueCount}/${questState.totalClues})`
              : '';
          const cls = done ? 'done' : isActive ? 'active' : '';
          const dotText = done ? '✓' : String(idx + 1);
          return `
            <li class="quest-step-item ${cls}">
              <span class="quest-step-dot">${dotText}</span>
              <span>${step.label}${extra}</span>
            </li>
          `;
        })
        .join('');

      mainPanelEl.classList.remove('pulse');
      void mainPanelEl.offsetWidth;

      if (isCompleted) {
        mainBadgeEl.textContent = '완료됨';
        mainBadgeEl.className = 'quest-badge main-quest-badge complete';
        mainHintEl.textContent = '오래된 항해 기록 획득 ✨';
        mainPanelEl.classList.add('completed-celebrate');
      } else {
        mainBadgeEl.textContent = '메인 진행';
        mainBadgeEl.className = 'quest-badge main-quest-badge';
        const activeStep = steps.find((s) => !completedSet.has(s.id));
        mainHintEl.textContent = activeStep ? `목표: ${activeStep.label}` : '등대의 비밀을 밝혀보세요';
        mainPanelEl.classList.remove('completed-celebrate');
        mainPanelEl.classList.add('pulse');
      }
    },
    // 퀘스트 진행 상태 업데이트 (5단계 상태 표시 지원)
    updateQuestProgress(current, target, isReady, isCompleted, stateOverride = null) {
      this.showPanel();
      const pct = Math.min(100, (current / target) * 100);
      fillEl.style.width = `${pct}%`;
      countEl.textContent = `${current}/${target}`;

      panelEl.classList.remove('pulse');
      void panelEl.offsetWidth;

      if (isCompleted || stateOverride === 'COMPLETED') {
        badgeEl.textContent = '완료됨';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달 완료!';
        hintEl.textContent = '반짝이는 조개 획득 ✨';
        panelEl.classList.add('completed-celebrate');
      } else if (stateOverride === 'DELIVERED') {
        badgeEl.textContent = '전달 완료';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달 완료!';
        hintEl.textContent = '보상을 받는 중... ✨';
        panelEl.classList.add('pulse');
      } else if (isReady || stateOverride === 'READY_TO_COMPLETE') {
        badgeEl.textContent = '전달 가능';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달하기';
        hintEl.textContent = '폭시에게 돌아가 전달하세요!';
        panelEl.classList.remove('completed-celebrate');
        panelEl.classList.add('pulse');
      } else {
        badgeEl.textContent = '진행 중';
        badgeEl.className = 'quest-badge';
        goalEl.textContent = '분홍색 꽃 모으기';
        hintEl.textContent = '마을 주변을 찾아보세요';
        panelEl.classList.remove('completed-celebrate');
        if (current > 0) {
          panelEl.classList.add('pulse');
        }
      }
    },
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
