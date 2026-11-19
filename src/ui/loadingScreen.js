// LITTLE DAY 지역 이동 전환 로딩 화면 (Cozy Pastel Loading Screen)

export function createLoadingScreen() {
  const style = document.createElement('style');
  style.id = 'little-day-loading-style';
  style.textContent = `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle at center, #fff9f6 0%, #faedf2 60%, #eedbe5 100%);
      z-index: 600;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: "Pretendard", "Segoe UI", sans-serif;
      user-select: none;
    }
    .loading-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .loading-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      border: 2px solid #ffd6e4;
      border-radius: 28px;
      padding: 32px 42px;
      box-shadow: 0 16px 40px rgba(180, 120, 150, 0.22);
      max-width: 420px;
      width: 90%;
      text-align: center;
      transform: scale(0.96);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .loading-overlay.visible .loading-card {
      transform: scale(1);
    }

    .loading-icon-circle {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: #fff0f5;
      border: 3px solid #ffccd9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      margin-bottom: 16px;
      animation: loading-pulse 1.8s infinite ease-in-out;
      box-shadow: 0 6px 18px rgba(255, 175, 195, 0.35);
    }

    @keyframes loading-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08) rotate(4deg); }
    }

    .loading-destination-title {
      font-size: 19px;
      font-weight: 900;
      color: #553342;
      margin-bottom: 6px;
    }

    .loading-destination-sub {
      font-size: 13px;
      color: #9c6c82;
      margin-bottom: 20px;
    }

    .loading-progress-bar-track {
      width: 100%;
      height: 8px;
      background: #ffe6ef;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 16px;
      position: relative;
    }

    .loading-progress-bar-fill {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #ff9eb5, #ff7597);
      border-radius: 999px;
      transition: width 0.3s ease;
      animation: loading-bar-indeterminate 1.5s infinite ease-in-out;
    }

    @keyframes loading-bar-indeterminate {
      0% { transform: translateX(-100%); width: 40%; }
      50% { width: 70%; }
      100% { transform: translateX(250%); width: 40%; }
    }

    .loading-tip-box {
      background: #fff8fa;
      border: 1px dashed #ffc5d6;
      border-radius: 14px;
      padding: 10px 14px;
      font-size: 11.5px;
      color: #7b4f62;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-card">
      <div class="loading-icon-circle">🌲</div>
      <div class="loading-destination-title">새로운 지역으로 이동하는 중...</div>
      <div class="loading-destination-sub">새로운 3D 월드와 자연을 로딩하고 있습니다</div>
      <div class="loading-progress-bar-track">
        <div class="loading-progress-bar-fill"></div>
      </div>
      <div class="loading-tip-box">
        💡 <strong>TIP:</strong> 언제든 월드맵(M)을 열어 원하는 지역으로 빠르게 이동할 수 있습니다.
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const iconEl = overlay.querySelector('.loading-icon-circle');
  const titleEl = overlay.querySelector('.loading-destination-title');
  const subEl = overlay.querySelector('.loading-destination-sub');
  const tipEl = overlay.querySelector('.loading-tip-box');

  const TIPS = [
    '속삭이는 숲의 버섯은 아침 이슬을 머금어 영롱하게 빛납니다. 🍄',
    '달빛 섬의 등대는 밤이 되면 바다를 은은하게 비춰줍니다. 🏝️',
    '오래된 저택의 앤틱 분수대에는 오랜 세월의 평온함이 깃들어 있습니다. 🏰',
    '보관함(I)에서 언제든 수집품과 의상을 확인할 수 있습니다. 🎒',
    '집 안의 침대에서 휴식을 취하면 언제든 기운을 차릴 수 있습니다. 🛏️'
  ];

  return {
    show(destinationName = '새로운 지역', icon = '✨', customSub = null) {
      iconEl.textContent = icon;
      titleEl.textContent = `${destinationName}(으)로 이동하는 중...`;
      subEl.textContent = customSub || '지역 리소스를 최적화하여 쾌적하게 로딩 중입니다';

      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      tipEl.innerHTML = `💡 <strong>TIP:</strong> ${randomTip}`;

      overlay.classList.add('visible');
      return new Promise((r) => setTimeout(r, 260));
    },
    hide() {
      overlay.classList.remove('visible');
      return new Promise((r) => setTimeout(r, 280));
    }
  };
}
