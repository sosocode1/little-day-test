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
      top: 80px;
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

    /* 보상 획득 모달 */
    .reward-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(70, 40, 50, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .reward-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .reward-card {
      width: min(90vw, 420px);
      background: #fffcf8;
      border-radius: 28px;
      padding: 28px 26px 22px;
      box-shadow: 0 20px 50px rgba(180, 100, 130, 0.35);
      border: 4px solid #ffd6e2;
      text-align: center;
      font-family: "Segoe UI", sans-serif;
      transform: scale(0.9);
      transition: transform 0.25s ease;
    }
    .reward-modal-backdrop.open .reward-card {
      transform: scale(1);
    }
    .reward-header {
      font-size: 20px;
      font-weight: 900;
      color: #ff6584;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .reward-icon-circle {
      width: 76px;
      height: 76px;
      margin: 14px auto 10px;
      background: #ffe9f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      box-shadow: 0 4px 14px rgba(230, 130, 160, 0.25);
      border: 2px solid #ffccd9;
    }
    .reward-name {
      font-size: 18px;
      font-weight: 800;
      color: #6a4050;
      margin-bottom: 4px;
    }
    .reward-desc {
      font-size: 14px;
      color: #8c6a78;
      line-height: 1.5;
      margin-bottom: 18px;
      padding: 0 10px;
    }
    .reward-confirm-btn {
      background: linear-gradient(135deg, #ff9bb5, #ff7b9d);
      color: white;
      border: none;
      padding: 10px 28px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(240, 110, 140, 0.35);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .reward-confirm-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(240, 110, 140, 0.45);
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

  // 3. 보상 모달 DOM
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'reward-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="reward-card">
      <div class="reward-header">🎊 퀘스트 완료!</div>
      <div class="reward-icon-circle">🌸</div>
      <div class="reward-name">분홍 꽃 머리핀</div>
      <div class="reward-desc">헤어 액세서리를 획득하여 캐릭터 머리에 착용했습니다!</div>
      <button class="reward-confirm-btn">확인</button>
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

      if (isCompleted) {
        badgeEl.textContent = '완료됨';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달 완료!';
        hintEl.textContent = '보상 수령 완료 ✨';
      } else if (isReady) {
        badgeEl.textContent = '목표 달성';
        badgeEl.className = 'quest-badge complete';
        goalEl.textContent = '폭시에게 꽃 전달하기';
        hintEl.textContent = '폭시에게 돌아가세요!';
      } else {
        badgeEl.textContent = '진행 중';
        badgeEl.className = 'quest-badge';
        goalEl.textContent = '분홍색 꽃 모으기';
        hintEl.textContent = '마을 주변을 찾아보세요';
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
    // 보상 획득 모달 표시
    showRewardModal(reward, onClose = null) {
      onRewardClose = onClose;
      modalBackdrop.querySelector('.reward-name').textContent = reward.name;
      modalBackdrop.querySelector('.reward-desc').textContent = reward.description;
      modalBackdrop.classList.add('open');
    },
    isRewardModalOpen() {
      return modalBackdrop.classList.contains('open');
    },
    closeRewardModal: closeReward
  };
}
