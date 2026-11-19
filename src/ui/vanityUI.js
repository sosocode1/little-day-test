// LITTLE DAY - 집 내부 화장대(전신 거울) 뷰티 & 외형 스타일링 UI
export function createVanityUI(player) {
  // 1. 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-vanity-style';
  style.textContent = `
    .vanity-overlay {
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
    .vanity-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .vanity-window {
      width: 490px;
      max-width: 92vw;
      max-height: 88vh;
      background: rgba(255, 254, 251, 0.98);
      border-radius: 26px;
      box-shadow: 0 16px 44px rgba(120, 85, 110, 0.22), 0 0 0 2px #ffdfeb;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      color: #4a343e;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .vanity-overlay.visible .vanity-window {
      transform: scale(1) translateY(0);
    }

    /* 상단 헤더 */
    .vanity-header {
      padding: 16px 22px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px dashed #ffdfe8;
      background: linear-gradient(180deg, #fffcfd 0%, #fff0f5 100%);
    }
    .vanity-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vanity-title-icon {
      font-size: 24px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(255, 140, 170, 0.25));
    }
    .vanity-title {
      font-size: 17px;
      font-weight: 800;
      color: #8c3b54;
      letter-spacing: -0.3px;
    }
    .vanity-subtitle {
      font-size: 11.5px;
      font-weight: 600;
      color: #b07889;
      margin-top: 1px;
    }
    .vanity-close-btn {
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
    .vanity-close-btn:hover {
      background: #ffe6ee;
      transform: scale(1.08);
    }

    /* 바디 콘텐츠 */
    .vanity-body {
      padding: 18px 22px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-height: calc(88vh - 120px);
    }

    /* 섹션 공통 */
    .vanity-section {
      background: #ffffff;
      border: 1.5px solid #ffedf2;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 3px 8px rgba(180, 140, 155, 0.05);
    }
    .vanity-section-label {
      font-size: 13px;
      font-weight: 800;
      color: #7d3f52;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* 스타일 선택 카드 */
    .vanity-style-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .vanity-style-btn {
      padding: 10px 12px;
      border-radius: 14px;
      border: 2px solid #ffedf2;
      background: #fffbfa;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.15s ease;
      text-align: left;
    }
    .vanity-style-btn:hover {
      border-color: #ffb8cc;
      transform: translateY(-2px);
    }
    .vanity-style-btn.active {
      border-color: #ff8fad;
      background: #fff4f7;
      box-shadow: 0 4px 12px rgba(255, 143, 173, 0.25);
    }
    .vanity-style-icon {
      font-size: 22px;
      line-height: 1;
    }
    .vanity-style-text {
      font-size: 12.5px;
      font-weight: 800;
      color: #5a3845;
    }
    .vanity-style-sub {
      font-size: 10.5px;
      color: #a37283;
    }

    /* 컬러 선택 팔레트 그리드 */
    .vanity-color-palette {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .vanity-color-dot {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1), 0 0 0 1px #ffccd9;
      cursor: pointer;
      position: relative;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vanity-color-dot:hover {
      transform: scale(1.12);
    }
    .vanity-color-dot.active {
      transform: scale(1.15);
      border-color: #ffffff;
      box-shadow: 0 0 0 3px #ff8fad, 0 4px 12px rgba(255, 143, 173, 0.35);
    }
    .vanity-color-dot.active::after {
      content: '✓';
      color: #ffffff;
      font-size: 15px;
      font-weight: 900;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    /* 푸터 */
    .vanity-footer {
      padding: 10px 20px 14px;
      border-top: 1px dashed #ffe6ee;
      background: #fffcfd;
      font-size: 11px;
      color: #a88290;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .vanity-kbd {
      padding: 2px 6px;
      background: #ffeef3;
      border: 1px solid #ffd6e2;
      border-radius: 4px;
      font-weight: 700;
      color: #8c425b;
      font-size: 10px;
    }
  `;
  document.head.appendChild(style);

  // 2. DOM 생성
  const overlay = document.createElement('div');
  overlay.className = 'vanity-overlay';
  overlay.innerHTML = `
    <div class="vanity-window">
      <div class="vanity-header">
        <div class="vanity-title-box">
          <div class="vanity-title-icon">🪞</div>
          <div>
            <div class="vanity-title">화장대 & 거울</div>
            <div class="vanity-subtitle">헤어스타일과 컬러를 자유롭게 연출해 보세요</div>
          </div>
        </div>
        <button class="vanity-close-btn" title="닫기 (ESC)">✕</button>
      </div>

      <div class="vanity-body">
        <!-- 1. 헤어 스타일 -->
        <div class="vanity-section">
          <div class="vanity-section-label">✨ 헤어 스타일</div>
          <div class="vanity-style-options">
            <button class="vanity-style-btn" data-style="bobBuns">
              <span class="vanity-style-icon">🎀</span>
              <div>
                <div class="vanity-style-text">단발 양갈래 번</div>
                <div class="vanity-style-sub">러블리 파스텔 리본</div>
              </div>
            </button>
            <button class="vanity-style-btn" data-style="tufty">
              <span class="vanity-style-icon">🍃</span>
              <div>
                <div class="vanity-style-text">숏 삐침 컷</div>
                <div class="vanity-style-sub">자연스러운 활동형 숏</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. 헤어 컬러 -->
        <div class="vanity-section">
          <div class="vanity-section-label">🎨 헤어 컬러</div>
          <div class="vanity-color-palette" id="vanity-hair-colors"></div>
        </div>

        <!-- 3. 피부 톤 -->
        <div class="vanity-section">
          <div class="vanity-section-label">🌸 피부 톤</div>
          <div class="vanity-color-palette" id="vanity-skin-colors"></div>
        </div>

        <!-- 4. 눈동자 컬러 -->
        <div class="vanity-section">
          <div class="vanity-section-label">👀 눈동자 컬러</div>
          <div class="vanity-color-palette" id="vanity-eye-colors"></div>
        </div>
      </div>

      <div class="vanity-footer">
        <div>💡 선택 즉시 3D 캐릭터에 실시간 적용됩니다</div>
        <div><span class="vanity-kbd">ESC</span> 또는 ✕ 닫기</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 팔레트 데이터 정의
  const HAIR_COLORS = [
    { name: '체스트넛 브라운', color: 0xa8744f },
    { name: '허니 블론드', color: 0xdeb86a },
    { name: '로즈 핑크', color: 0xf4a6b8 },
    { name: '스위트 다크초코', color: 0x442c22 }
  ];

  const SKIN_COLORS = [
    { name: '로즈 피치', color: 0xffe2cc },
    { name: '부드러운 바닐라', color: 0xffece0 },
    { name: '내추럴 베이지', color: 0xf5d5be }
  ];

  const EYE_COLORS = [
    { name: '딥 헤이즐', color: 0x9a6038 },
    { name: '포레스트 그린', color: 0x4a8c66 },
    { name: '마린 블루', color: 0x4276a6 }
  ];

  const hairPaletteEl = overlay.querySelector('#vanity-hair-colors');
  const skinPaletteEl = overlay.querySelector('#vanity-skin-colors');
  const eyePaletteEl = overlay.querySelector('#vanity-eye-colors');
  const styleBtns = overlay.querySelectorAll('.vanity-style-btn');
  const closeBtn = overlay.querySelector('.vanity-close-btn');

  let isOpen = false;
  const toggleCallbacks = [];

  function hexToCss(c) {
    return '#' + c.toString(16).padStart(6, '0');
  }

  function renderPalette() {
    const current = (player && player.getAppearance) ? player.getAppearance() : {};

    // 1. 스타일 버튼 액티브 상태
    styleBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-style') === current.hairStyle);
    });

    // 2. 헤어 컬러 렌더링
    hairPaletteEl.innerHTML = '';
    HAIR_COLORS.forEach((item) => {
      const dot = document.createElement('div');
      dot.className = `vanity-color-dot ${current.hair === item.color ? 'active' : ''}`;
      dot.style.backgroundColor = hexToCss(item.color);
      dot.title = item.name;
      dot.addEventListener('click', () => {
        if (player && player.setAppearance) {
          player.setAppearance({ hairColor: item.color });
          renderPalette();
        }
      });
      hairPaletteEl.appendChild(dot);
    });

    // 3. 피부 톤 렌더링
    skinPaletteEl.innerHTML = '';
    SKIN_COLORS.forEach((item) => {
      const dot = document.createElement('div');
      dot.className = `vanity-color-dot ${current.skin === item.color ? 'active' : ''}`;
      dot.style.backgroundColor = hexToCss(item.color);
      dot.title = item.name;
      dot.addEventListener('click', () => {
        if (player && player.setAppearance) {
          player.setAppearance({ skinColor: item.color });
          renderPalette();
        }
      });
      skinPaletteEl.appendChild(dot);
    });

    // 4. 눈동자 컬러 렌더링
    eyePaletteEl.innerHTML = '';
    EYE_COLORS.forEach((item) => {
      const dot = document.createElement('div');
      dot.className = `vanity-color-dot ${current.eyeColor === item.color ? 'active' : ''}`;
      dot.style.backgroundColor = hexToCss(item.color);
      dot.title = item.name;
      dot.addEventListener('click', () => {
        if (player && player.setAppearance) {
          player.setAppearance({ eyeColor: item.color });
          renderPalette();
        }
      });
      eyePaletteEl.appendChild(dot);
    });
  }

  // 스타일 버튼 클릭
  styleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const styleType = btn.getAttribute('data-style');
      if (player && player.setAppearance) {
        player.setAppearance({ hairStyle: styleType });
        renderPalette();
      }
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

  function open() {
    if (isOpen) return;
    isOpen = true;
    renderPalette();
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
    }
  };
}
