// 퀘스트 진행 상태 패널 및 수집/보상 알림 UI
export function createQuestUI() {
  // 기존 잔존 요소 정리 (HMR 등 중복 방지)
  const existingStyle = document.getElementById('little-day-quest-style');
  if (existingStyle) existingStyle.remove();
  document.querySelectorAll('.quest-panel, .collect-toast, .reward-modal-backdrop').forEach((el) => el.remove());

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-quest-style';
  style.textContent = `
    /* 우측 상단 퀘스트 패널 (월드맵 버튼 아래 배치) */
    .quest-panel {
      position: fixed;
      top: 76px;
      right: 24px;
      width: 250px;
      background: rgba(255, 253, 250, 0.94);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 16px 18px;
      box-shadow: 0 10px 30px rgba(180, 130, 150, 0.22);
      border: 2px solid #ffd6e2;
      font-family: "Segoe UI", sans-serif;
      color: #4a343e;
      user-select: none;
      z-index: 100;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }
    .quest-panel.visible {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
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
      .quest-panel {
        width: 220px;
        right: 18px;
        top: 74px;
        padding: 13px 15px;
      }
    }
    @media (max-width: 768px) {
      .quest-panel {
        width: 195px;
        right: 12px;
        top: 70px;
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
  `;
  document.head.appendChild(style);

  // 1. 퀘스트 패널 DOM 생성
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
  document.body.appendChild(panelEl);

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
      <div class="reward-subheader">분홍색 꽃 3개를 모두 모았습니다!</div>
      <div class="reward-item-box">
        <div class="reward-icon-circle">🌙</div>
        <div class="reward-name-row">
          <span class="reward-name">달빛 브로치</span>
          <span class="reward-count-pill">+ 1개 획득</span>
        </div>
        <div class="reward-desc">은은한 달빛의 마법이 깃든 신비롭고 영롱한 수제 클레이 브로치입니다.</div>
        <div class="reward-inventory-hint">
          <span>🎒</span>
          <span>아이템 보관함 [I] 키에서 확인하실 수 있습니다</span>
        </div>
      </div>
      <button class="reward-confirm-btn">보상 받기</button>
    </div>
  `;
  document.body.appendChild(modalBackdrop);
  const rewardConfirmBtn = modalBackdrop.querySelector('.reward-confirm-btn');

  let onRewardClose = null;
  function closeReward() {
    modalBackdrop.classList.remove('open');
    if (onRewardClose) {
      onRewardClose();
      onRewardClose = null;
    }
  }
  rewardConfirmBtn.addEventListener('click', closeReward);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeReward();
  });

  // 단축키 (Esc / Enter / Space)로 팝업 닫기 지원
  window.addEventListener('keydown', (e) => {
    if (modalBackdrop.classList.contains('open') && (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space')) {
      e.preventDefault();
      closeReward();
    }
  });

  return {
    showPanel() {
      panelEl.classList.add('visible');
    },
    hidePanel() {
      panelEl.classList.remove('visible');
    },
    // 퀘스트 진행 상태 업데이트
    updateQuestProgress(current, target, isReady, isCompleted) {
      this.showPanel();
      const pct = Math.min(100, (current / target) * 100);
      fillEl.style.width = `${pct}%`;
      countEl.textContent = `${current}/${target}`;

      panelEl.classList.remove('pulse');
      // 리플로우 트리거로 연속 수집 시에도 매번 부드러운 갱신 펄스 재생
      void panelEl.offsetWidth;

      if (isCompleted) {
        badgeEl.textContent = '완료됨';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '분홍색 꽃 3개 수집 완료!';
        hintEl.textContent = '폭시에게 말을 걸어보세요 ✨';
        panelEl.classList.add('completed-celebrate');
      } else if (isReady) {
        badgeEl.textContent = '목표 달성';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달하기';
        hintEl.textContent = '폭시에게 돌아가세요!';
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
        if (reward.name) modalBackdrop.querySelector('.reward-name').textContent = reward.name;
        if (reward.description) modalBackdrop.querySelector('.reward-desc').textContent = reward.description;
        if (reward.icon) modalBackdrop.querySelector('.reward-icon-circle').textContent = reward.icon;
      }
      modalBackdrop.classList.add('open');
    },
    isRewardModalOpen() {
      return modalBackdrop.classList.contains('open');
    },
    closeRewardModal: closeReward
  };
}
