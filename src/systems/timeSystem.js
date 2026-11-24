// LITTLE DAY 게임 시간 관리 시스템 (Game Time System)
// - 현실 시간보다 정확히 1시간 느리게 실시간 1:1 진행 (현실 19:00 -> 게임 18:00)
// - 가속 배속 시스템 제거, 24시간제 표시
// - 플레이어 수동 시간 조절 및 현실 시간 동기화(자동 진행) 모드 완벽 지원

export const TimePhase = {
  DAWN: 'dawn',     // 새벽: 05:00 ~ 05:59
  DAY: 'day',       // 낮:   06:00 ~ 17:59
  SUNSET: 'sunset', // 저녁: 18:00 ~ 19:59
  NIGHT: 'night'    // 밤:   20:00 ~ 04:59
};

export const PhaseInfo = {
  [TimePhase.DAWN]: {
    name: '새벽',
    icon: '🌄',
    startHour: 5,
    endHour: 6,
    color: '#9f91b8'
  },
  [TimePhase.DAY]: {
    name: '낮',
    icon: '☀️',
    startHour: 6,
    endHour: 18,
    color: '#ff9858'
  },
  [TimePhase.SUNSET]: {
    name: '저녁',
    icon: '🌇',
    startHour: 18,
    endHour: 20,
    color: '#ff6f61'
  },
  [TimePhase.NIGHT]: {
    name: '밤',
    icon: '🌙',
    startHour: 20,
    endHour: 5,
    color: '#6574a8'
  }
};

export function createTimeSystem() {
  // 현실 시간보다 1시간 느린 시간 계산 헬퍼
  function calculateRealTimeMinusOne() {
    const now = new Date();
    let h = now.getHours() - 1;
    if (h < 0) h += 24;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();
    return h + m / 60 + s / 3600 + ms / 3600000;
  }

  // 모드: 'auto' (현실 -1시간 자동 연동) | 'custom' (사용자 지정 시간)
  let mode = 'auto';
  let currentTime = calculateRealTimeMinusOne();
  let currentDay = 1;
  let isPaused = false;

  let lastHour = Math.floor(currentTime);
  let currentPhase = calculatePhase(currentTime);

  const tickListeners = new Set();
  const phaseListeners = new Set();
  const hourListeners = new Set();
  const modeListeners = new Set();

  function calculatePhase(t) {
    const norm = (t % 24.0 + 24.0) % 24.0;
    if (norm >= 5.0 && norm < 6.0) return TimePhase.DAWN;
    if (norm >= 6.0 && norm < 18.0) return TimePhase.DAY;
    if (norm >= 18.0 && norm < 20.0) return TimePhase.SUNSET;
    return TimePhase.NIGHT;
  }

  function notifyTick() {
    for (const cb of tickListeners) cb(currentTime, currentPhase);
  }

  function notifyPhase(newPhase, prevPhase) {
    for (const cb of phaseListeners) cb(newPhase, prevPhase);
  }

  function notifyHour(hour) {
    for (const cb of hourListeners) cb(hour, currentDay);
  }

  function notifyMode() {
    for (const cb of modeListeners) cb(mode, currentTime);
  }

  return {
    // 매 프레임 시간 갱신 (현실 시간 기반 1:1 진행)
    update(dt) {
      if (isPaused) return;

      if (mode === 'auto') {
        // 자동 모드: 현실 시간보다 정확히 1시간 느린 시간으로 동기화
        currentTime = calculateRealTimeMinusOne();
      } else {
        // 수동 모드: 설정된 시점부터 1:1 실제 초 단위로 자연스럽게 진행 (현실 1초 = 게임 1초)
        currentTime = (currentTime + dt / 3600) % 24.0;
        if (currentTime < 0) currentTime += 24.0;
      }

      const hour = Math.floor(currentTime);

      // 정시 변경 감지
      if (hour !== lastHour) {
        lastHour = hour;
        notifyHour(hour);
      }

      // 페이즈 변경 감지
      const newPhase = calculatePhase(currentTime);
      if (newPhase !== currentPhase) {
        const prevPhase = currentPhase;
        currentPhase = newPhase;
        notifyPhase(newPhase, prevPhase);
      }

      // 틱 리스너 호출
      notifyTick();
    },

    // 현재 부동소수점 시간 (0.0 ~ 24.0)
    getTime() {
      return currentTime;
    },

    // 현재 시간 모드 ('auto' | 'custom')
    getMode() {
      return mode;
    },

    isAutoMode() {
      return mode === 'auto';
    },

    // 플레이어 직접 시간 조절 (시: 0~23, 분: 0~59)
    // - 원하는 시간으로 즉시 변경
    // - 변경 후에도 1:1 자연스러운 흐름 유지
    setTime(targetHour, targetMinute = 0) {
      mode = 'custom';
      const cleanH = Math.max(0, Math.min(23, Math.floor(targetHour)));
      const cleanM = Math.max(0, Math.min(59, Math.floor(targetMinute)));
      currentTime = cleanH + cleanM / 60;
      lastHour = cleanH;

      const newPhase = calculatePhase(currentTime);
      const prevPhase = currentPhase;
      currentPhase = newPhase;

      if (newPhase !== prevPhase) {
        notifyPhase(newPhase, prevPhase);
      }
      notifyHour(cleanH);
      notifyTick();
      notifyMode();
    },

    // 현실 시간(-1시간) 자동 진행 모드로 즉시 복귀
    resetToRealTime() {
      mode = 'auto';
      currentTime = calculateRealTimeMinusOne();
      lastHour = Math.floor(currentTime);

      const newPhase = calculatePhase(currentTime);
      const prevPhase = currentPhase;
      currentPhase = newPhase;

      if (newPhase !== prevPhase) {
        notifyPhase(newPhase, prevPhase);
      }
      notifyHour(lastHour);
      notifyTick();
      notifyMode();
    },

    nextDay() {
      currentDay++;
      notifyHour(lastHour);
      return currentDay;
    },

    getDay() {
      return currentDay;
    },

    setDay(day) {
      currentDay = Math.max(1, Math.floor(day));
    },

    togglePause() {
      isPaused = !isPaused;
      return isPaused;
    },

    isPaused() {
      return isPaused;
    },

    getPhase() {
      return currentPhase;
    },

    getPhaseInfo() {
      return PhaseInfo[currentPhase];
    },

    isNight() {
      return currentPhase === TimePhase.NIGHT;
    },

    isDay() {
      return currentPhase === TimePhase.DAY;
    },

    // 현실 시간 정보 반환 (비교용)
    getRealTimeInfo() {
      const now = new Date();
      const rH = String(now.getHours()).padStart(2, '0');
      const rM = String(now.getMinutes()).padStart(2, '0');
      const rS = String(now.getSeconds()).padStart(2, '0');
      return {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        timeString: `${rH}:${rM}:${rS}`
      };
    },

    // 상세 포맷 정보 반환 (24시간제)
    getFormattedInfo() {
      const h = Math.floor(currentTime);
      const m = Math.floor((currentTime % 1) * 60);
      const s = Math.floor(((currentTime * 60) % 1) * 60);
      const sH = String(h).padStart(2, '0');
      const sM = String(m).padStart(2, '0');
      const info = PhaseInfo[currentPhase];

      return {
        time: currentTime,
        hour: h,
        minute: m,
        second: s,
        timeString: `${sH}:${sM}`,
        timeWithSeconds: `${sH}:${sM}:${String(s).padStart(2, '0')}`,
        day: currentDay,
        phase: currentPhase,
        phaseName: info.name,
        phaseIcon: info.icon,
        phaseColor: info.color,
        isAutoMode: mode === 'auto',
        mode,
        modeText: mode === 'auto' ? '현실 -1시간 자동 진행 중' : '사용자 지정 시간 진행 중',
        isPaused
      };
    },

    // 이벤트 리스너
    onTick(cb) {
      tickListeners.add(cb);
      return () => tickListeners.delete(cb);
    },

    onPhaseChange(cb) {
      phaseListeners.add(cb);
      return () => phaseListeners.delete(cb);
    },

    onHourChange(cb) {
      hourListeners.add(cb);
      return () => hourListeners.delete(cb);
    },

    onModeChange(cb) {
      modeListeners.add(cb);
      return () => modeListeners.delete(cb);
    },

    // 세이브 데이터로부터 시간 상태 복원 (수동 시간 및 자동 모드 완벽 지원)
    restore(savedData) {
      if (!savedData) return;
      if (typeof savedData.day === 'number') {
        currentDay = Math.max(1, Math.floor(savedData.day));
      }
      if (savedData.mode === 'custom' && typeof savedData.currentTime === 'number') {
        mode = 'custom';
        currentTime = (savedData.currentTime % 24.0 + 24.0) % 24.0;
        lastHour = Math.floor(currentTime);
        currentPhase = calculatePhase(currentTime);
        notifyPhase(currentPhase, currentPhase);
        notifyHour(lastHour);
        notifyTick();
        notifyMode();
      } else if (savedData.mode === 'auto') {
        this.resetToRealTime();
      }
    }
  };
}
