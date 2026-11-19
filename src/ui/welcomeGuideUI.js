// LITTLE DAY 게임 최초 진입 환영 안내 및 조작법 팝업 UI
export function createWelcomeGuideUI() {
  const STORAGE_KEY = 'littleday_welcome_seen';

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-welcome-style';
  style.textContent = `
    /* 좌측 상단 조작 안내(도움말) 다시보기 버튼 */
    .welcome-help-trigger {
      position: fixed;
      top: 74px;
      left: 24px;
      height: 38px;
      padding: 0 16px;
      background: rgba(255, 253, 250, 0.94);
      backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 6px 18px rgba(180, 130, 150, 0.22);
      color: #8c435c;
      font-family: "Segoe UI", sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 120;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      user-select: none;
    }
    .welcome-help-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(180, 130, 150, 0.32);
      background: #ffffff;
    }
    .welcome-help-trigger:active {
      transform: scale(0.97);
    }

    /* 환영 안내 팝업 백드롭 */
    .welcome-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(45, 30, 42, 0.48);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 600;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
      font-family: "Segoe UI", sans-serif;
    }
    .welcome-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* 안내 카드 본체 */
    .welcome-card {
      width: 440px;
      max-width: 90vw;
      background: rgba(255, 253, 250, 0.98);
      border-radius: 28px;
      border: 2.5px solid #ffd6e2;
      box-shadow: 0 20px 50px rgba(160, 100, 130, 0.32);
      padding: 30px 28px 26px;
      text-align: center;
      box-sizing: border-box;
      transform: scale(0.92) translateY(12px);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .welcome-modal-backdrop.open .welcome-card {
      transform: scale(1) translateY(0);
    }

    /* 상단 배지 및 타이틀 */
    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 14px;
      background: #ffe6ef;
      color: #b04e70;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
    }
    .welcome-title {
      font-size: 21px;
      font-weight: 900;
      color: #5a3848;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .welcome-desc {
      font-size: 13.5px;
      color: #8a6878;
      line-height: 1.55;
      margin: 0 0 20px;
      padding: 0 6px;
      word-break: keep-all;
    }

    /* 키 조작 가이드 그리드 */
    .controls-grid {
      display: flex;
      flex-direction: column;
      gap: 9px;
      background: #fff8fb;
      border: 1.5px solid #ffe1ec;
      border-radius: 18px;
      padding: 16px 18px;
      margin-bottom: 22px;
      text-align: left;
    }
    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }
    .key-capsule {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .key-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      min-width: 20px;
      background: #ffffff;
      border: 1.5px solid #ffccd9;
      box-shadow: 0 2px 4px rgba(200, 140, 160, 0.15), 0 1px 0 #ffd6e2;
      border-radius: 6px;
      color: #8c435c;
      font-family: inherit;
      font-size: 11.5px;
      font-weight: 800;
    }
    .key-desc {
      color: #6a4959;
      font-weight: 700;
    }

    /* 시작하기 버튼 */
    .welcome-start-btn {
      width: 100%;
      height: 48px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff98b2, #ff7297);
      color: #ffffff;
      font-family: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(240, 100, 135, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .welcome-start-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(240, 100, 135, 0.45);
    }
    .welcome-start-btn:active {
      transform: scale(0.98);
    }

    .welcome-footer-hint {
      margin-top: 10px;
      font-size: 11.5px;
      color: #a88a98;
    }
  `;
  document.head.appendChild(style);

  // 1. 좌측 상단 상시 안내 버튼 생성
  const helpBtn = document.createElement('button');
  helpBtn.className = 'welcome-help-trigger';
  helpBtn.innerHTML = `<span>💡</span><span>조작 안내</span>`;
  document.body.appendChild(helpBtn);

  // 2. 환영 모달 백드롭 및 카드 생성
  const backdrop = document.createElement('div');
  backdrop.className = 'welcome-modal-backdrop';
  backdrop.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-badge">🌱 동화 마을 라이프</div>
      <h2 class="welcome-title">LITTLE DAY에 오신 것을<br>환영합니다! 🏡✨</h2>
      <p class="welcome-desc">
        따스한 햇살과 꽃들이 가득한 작은 마을에서 나만의 여유롭고 행복한 하루를 편안하게 시작해보세요.
      </p>

      <div class="controls-grid">
        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">W</span>
            <span class="key-badge">A</span>
            <span class="key-badge">S</span>
            <span class="key-badge">D</span>
            <span style="font-size:11px;color:#a88a98;">/ 방향키</span>
          </div>
          <span class="key-desc">캐릭터 이동</span>
        </div>

        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">마우스 드래그</span>
          </div>
          <span class="key-desc">카메라 시점 조작</span>
        </div>

        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">E</span>
            <span style="font-size:11px;color:#a88a98;">또는</span>
            <span class="key-badge">Space</span>
          </div>
          <span class="key-desc">주민 대화 &amp; 상호작용</span>
        </div>

        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">I</span>
          </div>
          <span class="key-desc">아이템 보관함(인벤토리)</span>
        </div>

        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">M</span>
          </div>
          <span class="key-desc">월드맵 &amp; 지역 이동</span>
        </div>

        <div class="control-row">
          <div class="key-capsule">
            <span class="key-badge">ESC</span>
          </div>
          <span class="key-desc">열린 창 닫기</span>
        </div>
      </div>

      <button class="welcome-start-btn">🌱 모험 시작하기</button>
      <div class="welcome-footer-hint">언제든 좌측 상단의 [💡 조작 안내] 버튼으로 다시 볼 수 있어요.</div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const startBtn = backdrop.querySelector('.welcome-start-btn');

  function open() {
    backdrop.classList.add('open');
  }

  function close() {
    backdrop.classList.remove('open');
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // 로컬 스토리지 비활성화 환경 대비 안전 처리
    }
  }

  helpBtn.addEventListener('click', open);
  startBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && backdrop.classList.contains('open')) {
      close();
    }
  });

  // 최초 진입 시 자동 표시 (방문 기록이 없을 때만)
  let hasSeen = false;
  try {
    hasSeen = localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    hasSeen = false;
  }

  if (!hasSeen) {
    // 게임 리소스 로딩 후 부드럽게 팝업되도록 미세 지연 실행
    setTimeout(open, 350);
  }

  return {
    open,
    close,
    toggle() {
      if (backdrop.classList.contains('open')) close();
      else open();
    },
    isOpen() {
      return backdrop.classList.contains('open');
    }
  };
}
