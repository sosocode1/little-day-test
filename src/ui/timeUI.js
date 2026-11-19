// LITTLE DAY 게임 시간 표시 및 빠른 시간 조작 패널 UI (Time Display & Test Controller)
import { TimePhase } from '../systems/timeSystem.js';

export function createTimeUI(timeSystem) {
  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-time-style';
  style.textContent = `
    /* 좌측 상단 시간 표시 캡슐 위젯 */
    .time-widget-container {
      position: fixed;
      top: 72px;
      left: 24px;
      z-index: 120;
      font-family: "Segoe UI", sans-serif;
      user-select: none;
    }

    .time-badge-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 14px;
      height: 38px;
      background: rgba(255, 253, 250, 0.94);
      backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 4px 14px rgba(180, 130, 150, 0.2);
      color: #6a4050;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s ease;
    }
    .time-badge-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(180, 130, 150, 0.28);
      border-color: #ffb8cc;
    }
    .time-badge-pill:active {
      transform: scale(0.98);
    }

    .time-phase-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 800;
      background: #ffe6ef;
      color: #b04e70;
      transition: background 0.3s, color 0.3s;
    }
    .time-phase-tag.phase-day {
      background: #fff0d6;
      color: #b86e28;
    }
    .time-phase-tag.phase-sunset {
      background: #ffe2d9;
      color: #c44f33;
    }
    .time-phase-tag.phase-night {
      background: #e2e8f8;
      color: #475a96;
    }
    .time-phase-tag.phase-dawn {
      background: #efe4f7;
      color: #7b4f9c;
    }

    .time-clock-text {
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #553342;
    }

    .time-day-counter {
      font-size: 10.5px;
      font-weight: 700;
      color: #a88494;
      margin-left: 2px;
    }

    .time-toggle-arrow {
      font-size: 10px;
      color: #a88494;
      transition: transform 0.2s;
    }
    .time-widget-container.open .time-toggle-arrow {
      transform: rotate(180deg);
    }

    /* 드롭다운 테스트 컨트롤러 패널 */
    .time-control-panel {
      position: absolute;
      top: 44px;
      left: 0;
      width: 228px;
      background: rgba(255, 253, 250, 0.98);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 12px 30px rgba(160, 100, 130, 0.28);
      padding: 14px 16px;
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .time-widget-container.open .time-control-panel {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .time-panel-section-title {
      font-size: 11px;
      font-weight: 800;
      color: #a87e90;
      margin-bottom: 7px;
      display: flex;
      justify-content: space-between;
    }

    /* 시간대 빠른 점프 버튼 그리드 */
    .time-jump-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 12px;
    }
    .time-jump-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      height: 32px;
      border: 1.5px solid #ffccd9;
      background: #ffffff;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      color: #6a4050;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .time-jump-btn:hover {
      background: #fff2f6;
      border-color: #ff9bb5;
      transform: translateY(-1px);
    }
    .time-jump-btn:active {
      transform: scale(0.97);
    }

    /* 배속 조절 바 */
    .time-speed-row {
      display: flex;
      gap: 4px;
    }
    .time-speed-btn {
      flex: 1;
      height: 28px;
      border: 1.5px solid #ffe1ec;
      background: #fff8fa;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #7a5062;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .time-speed-btn:hover {
      background: #ffffff;
      border-color: #ffb8cc;
    }
    .time-speed-btn.active {
      background: #ff94b0;
      border-color: #ff7597;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(240, 110, 140, 0.3);
    }

    .time-hotkey-hint {
      margin-top: 9px;
      font-size: 10.5px;
      color: #b08d9e;
      text-align: center;
      border-top: 1px dashed #ffd6e2;
      padding-top: 7px;
    }
  `;
  document.head.appendChild(style);

  // DOM 구조 생성
  const container = document.createElement('div');
  container.className = 'time-widget-container';
  container.innerHTML = `
    <div class="time-badge-pill" title="클릭하여 시간 제어 패널 열기">
      <span class="time-phase-tag phase-day">
        <span class="time-icon">☀️</span>
        <span class="time-phase-text">낮</span>
      </span>
      <span class="time-clock-text">10:00</span>
      <span class="time-day-counter">Day 1</span>
      <span class="time-toggle-arrow">▾</span>
    </div>

    <div class="time-control-panel">
      <div class="time-panel-section-title">
        <span>시간대 빠른 변경 (테스트)</span>
      </div>
      <div class="time-jump-grid">
        <button class="time-jump-btn" data-time="9">☀️ 낮 (09:00)</button>
        <button class="time-jump-btn" data-time="18.5">🌇 저녁 (18:30)</button>
        <button class="time-jump-btn" data-time="22">🌙 밤 (22:00)</button>
        <button class="time-jump-btn" data-time="5.3">🌄 새벽 (05:18)</button>
      </div>

      <div class="time-panel-section-title">
        <span>진행 속도</span>
      </div>
      <div class="time-speed-row">
        <button class="time-speed-btn active" data-scale="1">1x</button>
        <button class="time-speed-btn" data-scale="5">5x</button>
        <button class="time-speed-btn" data-scale="20">20x</button>
        <button class="time-speed-btn" data-scale="0">일시정지</button>
      </div>

      <div class="time-hotkey-hint">단축키: 숫자 1(낮) 2(저녁) 3(밤) 4(새벽)</div>
    </div>
  `;
  document.body.appendChild(container);

  const pill = container.querySelector('.time-badge-pill');
  const phaseTag = container.querySelector('.time-phase-tag');
  const phaseIcon = container.querySelector('.time-icon');
  const phaseText = container.querySelector('.time-phase-text');
  const clockText = container.querySelector('.time-clock-text');
  const dayCounter = container.querySelector('.time-day-counter');
  const speedBtns = container.querySelectorAll('.time-speed-btn');
  const jumpBtns = container.querySelectorAll('.time-jump-btn');

  function togglePanel() {
    container.classList.toggle('open');
  }

  pill.addEventListener('click', togglePanel);

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });

  // 빠른 시간 점프 버튼 이벤트
  jumpBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetT = parseFloat(btn.dataset.time);
      const h = Math.floor(targetT);
      const m = Math.floor((targetT % 1) * 60);
      timeSystem.setTime(h, m);
    });
  });

  // 배속 버튼 이벤트
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = parseFloat(btn.dataset.scale);
      timeSystem.setTimeScale(s);
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // 숫자 키 단축키 (1: 낮, 2: 저녁, 3: 밤, 4: 새벽)
  window.addEventListener('keydown', (e) => {
    // 텍스트 인풋 중이 아닐 때만 작동
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Digit1') {
      timeSystem.setTime(9, 0); // 09:00 낮
    } else if (e.code === 'Digit2') {
      timeSystem.setTime(18, 30); // 18:30 저녁
    } else if (e.code === 'Digit3') {
      timeSystem.setTime(22, 0); // 22:00 밤
    } else if (e.code === 'Digit4') {
      timeSystem.setTime(5, 18); // 05:18 새벽
    }
  });

  let lastPhase = null;

  return {
    update() {
      const info = timeSystem.getFormattedInfo();
      clockText.textContent = info.timeString;
      dayCounter.textContent = `Day ${info.day}`;

      if (info.phase !== lastPhase) {
        lastPhase = info.phase;
        phaseIcon.textContent = info.phaseIcon;
        phaseText.textContent = info.phaseName;

        phaseTag.className = `time-phase-tag phase-${info.phase}`;
      }
    }
  };
}
