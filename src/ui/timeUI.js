// LITTLE DAY 게임 시간 표시 및 플레이어 시간 조절 설정 패널 UI
import { TimePhase } from '../systems/timeSystem.js';

export function createTimeUI(timeSystem, moonflowerEvent = null) {
  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-time-style';
  style.textContent = `
    /* 좌측 상단 시간 표시 캡슐 위젯 */
    .time-widget-container {
      position: fixed;
      top: 24px;
      left: 24px;
      z-index: 120;
      font-family: "Pretendard", "Segoe UI", sans-serif;
      user-select: none;
    }

    .time-badge-pill {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 0 14px;
      height: 40px;
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
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 12px;
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
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #4a2839;
    }

    .time-mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      background: #eafaf1;
      color: #27ae60;
      border: 1px solid #c2eed5;
    }
    .time-mode-badge.custom {
      background: #fef9e7;
      color: #d4ac0d;
      border-color: #fae588;
    }

    .time-toggle-arrow {
      font-size: 10px;
      color: #a88494;
      transition: transform 0.2s;
    }
    .time-widget-container.open .time-toggle-arrow {
      transform: rotate(180deg);
    }

    /* 드롭다운 시간 조절 설정 패널 */
    .time-control-panel {
      position: absolute;
      top: 48px;
      left: 0;
      width: 280px;
      background: rgba(255, 253, 250, 0.98);
      backdrop-filter: blur(14px);
      border-radius: 20px;
      border: 2px solid #ffd6e2;
      box-shadow: 0 14px 34px rgba(160, 100, 130, 0.28);
      padding: 16px 18px;
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

    .time-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1.5px solid #ffeef4;
      padding-bottom: 8px;
    }
    .time-panel-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #553342;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* 자동 진행 상태 안내 배너 */
    .time-status-banner {
      background: #fdf6f9;
      border: 1px solid #ffdbe7;
      border-radius: 12px;
      padding: 8px 10px;
      margin-bottom: 12px;
      font-size: 11.5px;
      color: #6a4758;
      line-height: 1.45;
    }
    .time-status-banner strong {
      display: block;
      color: #8b3c58;
      font-size: 12px;
      margin-bottom: 2px;
    }

    /* 시/분 컨트롤러 폼 */
    .time-custom-control-box {
      background: #ffffff;
      border: 1.5px solid #ffccd9;
      border-radius: 14px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .time-inputs-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .time-select-input {
      height: 34px;
      padding: 0 8px;
      border: 1.5px solid #ffd0de;
      border-radius: 8px;
      background: #fffafa;
      font-size: 14px;
      font-weight: 800;
      color: #553342;
      outline: none;
      cursor: pointer;
    }
    .time-select-input:focus {
      border-color: #ff85a2;
      background: #ffffff;
    }
    .time-colon-separator {
      font-size: 16px;
      font-weight: 900;
      color: #b05072;
    }
    .time-apply-btn {
      width: 100%;
      height: 32px;
      background: #ff8fa7;
      border: none;
      border-radius: 9px;
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      box-shadow: 0 3px 8px rgba(255, 140, 165, 0.35);
    }
    .time-apply-btn:hover {
      background: #ff7594;
      transform: translateY(-1px);
    }
    .time-apply-btn:active {
      transform: scale(0.98);
    }

    /* 현실 시간 자동 모드 복귀 버튼 */
    .time-reset-auto-btn {
      width: 100%;
      height: 32px;
      background: #edfbf3;
      border: 1.5px solid #a3e8c0;
      border-radius: 9px;
      color: #218c4e;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-bottom: 12px;
      transition: all 0.15s ease;
    }
    .time-reset-auto-btn:hover {
      background: #dcf7e7;
      border-color: #7bdba3;
      transform: translateY(-1px);
    }

    /* 시간대 빠른 점프 버튼 그리드 */
    .time-jump-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 10px;
    }
    .time-jump-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      height: 30px;
      border: 1.5px solid #ffccd9;
      background: #ffffff;
      border-radius: 8px;
      font-size: 11.5px;
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

    .time-hotkey-hint {
      font-size: 10.5px;
      color: #b08d9e;
      text-align: center;
      border-top: 1px dashed #ffd6e2;
      padding-top: 7px;
    }
  `;
  document.head.appendChild(style);

  // 시(0~23) 및 분(0~59) 셀렉트 옵션 HTML 생성
  let hourOptions = '';
  for (let i = 0; i < 24; i++) {
    const s = String(i).padStart(2, '0');
    hourOptions += `<option value="${i}">${s}시</option>`;
  }
  let minuteOptions = '';
  for (let i = 0; i < 60; i += 5) {
    const s = String(i).padStart(2, '0');
    minuteOptions += `<option value="${i}">${s}분</option>`;
  }

  // DOM 구조 생성
  const container = document.createElement('div');
  container.className = 'time-widget-container';
  container.innerHTML = `
    <div class="time-badge-pill" title="클릭하여 시간 제어 및 게임 설정 열기">
      <span class="time-phase-tag phase-day">
        <span class="time-icon">☀️</span>
        <span class="time-phase-text">낮</span>
      </span>
      <span class="time-clock-text">18:00</span>
      <span class="time-mode-badge auto">🟢 자동 진행</span>
      <span class="time-toggle-arrow">▾</span>
    </div>

    <div class="time-control-panel">
      <div class="time-panel-header">
        <span class="time-panel-title">⏱️ 게임 시간 설정</span>
        <span style="font-size:11px;color:#a87e90;font-weight:700;">24시간제</span>
      </div>

      <!-- 현재 진행 모드 상태 안내 -->
      <div class="time-status-banner">
        <strong id="time-status-title">🟢 현실 -1시간 자동 진행 모드</strong>
        <span id="time-status-desc">현실 시간보다 정확히 1시간 느리게 1:1 실시간으로 진행 중입니다.</span>
      </div>

      <!-- 플레이어 직접 시간 조절 -->
      <div class="time-custom-control-box">
        <div style="font-size:11px;font-weight:800;color:#8a5068;margin-bottom:6px;">🕒 시와 분 직접 선택</div>
        <div class="time-inputs-row">
          <select class="time-select-input" id="time-select-hour">
            ${hourOptions}
          </select>
          <span class="time-colon-separator">:</span>
          <select class="time-select-input" id="time-select-minute">
            ${minuteOptions}
          </select>
        </div>
        <button class="time-apply-btn" id="btn-apply-time">✨ 선택한 시간으로 즉시 변경</button>
      </div>

      <!-- 현실 시간 자동 모드 복귀 버튼 -->
      <button class="time-reset-auto-btn" id="btn-reset-real-time">
        🔄 현실 시간(-1시간) 자동 모드로 복귀
      </button>

      <!-- 빠른 시간 프리셋 버튼 -->
      <div style="font-size:11px;font-weight:800;color:#8a5068;margin-bottom:6px;">⚡ 빠른 시간대 프리셋</div>
      <div class="time-jump-grid">
        <button class="time-jump-btn" data-hour="9" data-minute="0">☀️ 낮 (09:00)</button>
        <button class="time-jump-btn" data-hour="18" data-minute="30">🌇 저녁 (18:30)</button>
        <button class="time-jump-btn" data-hour="22" data-minute="0">🌙 밤 (22:00)</button>
        <button class="time-jump-btn" data-hour="5" data-minute="15">🌄 새벽 (05:15)</button>
      </div>

      ${moonflowerEvent ? `
      <div style="margin-top:8px;border-top:1px dashed #ffd6e2;padding-top:7px;">
        <div style="font-size:11px;font-weight:800;color:#9b6b80;margin-bottom:4px;">🌙 사라진 달빛 꽃 (밤 22:00~)</div>
        <button class="time-event-reset-btn" style="width:100%;height:26px;border:1.5px dashed #ff9bb5;background:#fff5f8;border-radius:8px;font-size:11px;font-weight:800;color:#b0466c;cursor:pointer;transition:background 0.15s;">
          🔄 달빛 꽃 이벤트 리셋
        </button>
      </div>
      ` : ''}

      <div class="time-hotkey-hint">단축키: 숫자 1(낮) 2(저녁) 3(밤 22:00) 4(새벽)</div>
    </div>
  `;
  document.body.appendChild(container);

  const pill = container.querySelector('.time-badge-pill');
  const phaseTag = container.querySelector('.time-phase-tag');
  const phaseIcon = container.querySelector('.time-icon');
  const phaseText = container.querySelector('.time-phase-text');
  const clockText = container.querySelector('.time-clock-text');
  const modeBadge = container.querySelector('.time-mode-badge');

  const statusTitle = container.querySelector('#time-status-title');
  const statusDesc = container.querySelector('#time-status-desc');
  const selectHour = container.querySelector('#time-select-hour');
  const selectMinute = container.querySelector('#time-select-minute');
  const btnApply = container.querySelector('#btn-apply-time');
  const btnResetAuto = container.querySelector('#btn-reset-real-time');
  const jumpBtns = container.querySelectorAll('.time-jump-btn');

  function togglePanel() {
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
      const info = timeSystem.getFormattedInfo();
      selectHour.value = String(info.hour);
      // 가장 가까운 5분 단위로 매칭
      const roundedM = Math.floor(info.minute / 5) * 5;
      selectMinute.value = String(roundedM);
    }
  }

  pill.addEventListener('click', togglePanel);

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });

  // 시간 직접 변경 적용
  btnApply.addEventListener('click', (e) => {
    e.stopPropagation();
    const h = parseInt(selectHour.value, 10);
    const m = parseInt(selectMinute.value, 10);
    timeSystem.setTime(h, m);
    btnApply.textContent = '✅ 변경 완료!';
    setTimeout(() => {
      btnApply.textContent = '✨ 선택한 시간으로 즉시 변경';
    }, 1200);
  });

  // 현실 시간(-1시간) 자동 모드로 복귀
  btnResetAuto.addEventListener('click', (e) => {
    e.stopPropagation();
    timeSystem.resetToRealTime();
    btnResetAuto.textContent = '✨ 자동 진행 모드로 복귀 완료!';
    setTimeout(() => {
      btnResetAuto.textContent = '🔄 현실 시간(-1시간) 자동 모드로 복귀';
    }, 1200);
  });

  // 프리셋 점프 버튼
  jumpBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const h = parseInt(btn.dataset.hour, 10);
      const m = parseInt(btn.dataset.minute, 10);
      timeSystem.setTime(h, m);
      selectHour.value = String(h);
      selectMinute.value = String(Math.floor(m / 5) * 5);
    });
  });

  // 달빛 꽃 이벤트 리셋 버튼
  const resetBtn = container.querySelector('.time-event-reset-btn');
  if (resetBtn && moonflowerEvent) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moonflowerEvent.resetEvent();
      resetBtn.textContent = '✨ 달빛 꽃 리셋 완료!';
      setTimeout(() => {
        resetBtn.textContent = '🔄 달빛 꽃 이벤트 리셋';
      }, 1600);
    });
  }

  // 숫자 키 단축키 (1: 낮 09:00, 2: 저녁 18:30, 3: 밤 22:00, 4: 새벽 05:15)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Digit1') {
      timeSystem.setTime(9, 0);
    } else if (e.code === 'Digit2') {
      timeSystem.setTime(18, 30);
    } else if (e.code === 'Digit3') {
      timeSystem.setTime(22, 0);
    } else if (e.code === 'Digit4') {
      timeSystem.setTime(5, 15);
    }
  });

  let lastPhase = null;
  let lastMode = null;

  return {
    open() {
      container.classList.add('open');
    },
    close() {
      container.classList.remove('open');
    },
    update() {
      const info = timeSystem.getFormattedInfo();
      clockText.textContent = info.timeString;

      // 페이즈 갱신
      if (info.phase !== lastPhase) {
        lastPhase = info.phase;
        phaseIcon.textContent = info.phaseIcon;
        phaseText.textContent = info.phaseName;
        phaseTag.className = `time-phase-tag phase-${info.phase}`;
      }

      // 모드 갱신
      if (info.isAutoMode !== lastMode) {
        lastMode = info.isAutoMode;
        if (info.isAutoMode) {
          modeBadge.className = 'time-mode-badge auto';
          modeBadge.textContent = '🟢 자동 진행';
          statusTitle.textContent = '🟢 현실 -1시간 자동 진행 모드';
          statusDesc.textContent = '현실 시간보다 정확히 1시간 느리게 1:1 실시간으로 진행 중입니다.';
        } else {
          modeBadge.className = 'time-mode-badge custom';
          modeBadge.textContent = '🟡 사용자 지정';
          statusTitle.textContent = '🟡 사용자 지정 시간 모드';
          statusDesc.textContent = '플레이어가 설정한 시간부터 1:1 실시간으로 자연스럽게 진행 중입니다.';
        }
      }
    }
  };
}
