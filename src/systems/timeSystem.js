// LITTLE DAY 게임 시간 관리 시스템 (Day & Night Time Engine)

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

export function createTimeSystem({
  initialTime = 10.0, // 기본 오전 10:00 시작 (상쾌한 낮)
  realSecondsPerDay = 480, // 현실 480초(8분) = 게임 내 24시간
  timeScale = 1.0
} = {}) {
  let currentTime = initialTime % 24; // 0.0 ~ 24.0 부동소수점 시간
  let currentDay = 1;
  let scale = timeScale;
  let isPaused = false;

  let lastHour = Math.floor(currentTime);
  let currentPhase = calculatePhase(currentTime);

  const tickListeners = new Set();
  const phaseListeners = new Set();
  const hourListeners = new Set();

  function calculatePhase(t) {
    if (t >= 5.0 && t < 6.0) return TimePhase.DAWN;
    if (t >= 6.0 && t < 18.0) return TimePhase.DAY;
    if (t >= 18.0 && t < 20.0) return TimePhase.SUNSET;
    return TimePhase.NIGHT;
  }

  return {
    // 매 프레임 시간 갱신
    update(dt) {
      if (isPaused || scale <= 0) return;

      // 현실 dt 초 동안 흐를 게임 시간(시간 단위) 계산
      const hoursPassed = (dt * 24) / realSecondsPerDay * scale;
      currentTime += hoursPassed;

      if (currentTime >= 24.0) {
        currentTime = currentTime % 24.0;
        currentDay++;
      } else if (currentTime < 0.0) {
        currentTime = (currentTime % 24.0 + 24.0) % 24.0;
      }

      const hour = Math.floor(currentTime);
      const minute = Math.floor((currentTime % 1) * 60);

      // 정시 변경 감지
      if (hour !== lastHour) {
        lastHour = hour;
        for (const cb of hourListeners) {
          cb(hour, currentDay);
        }
      }

      // 페이즈 변경 감지
      const newPhase = calculatePhase(currentTime);
      if (newPhase !== currentPhase) {
        const prevPhase = currentPhase;
        currentPhase = newPhase;
        for (const cb of phaseListeners) {
          cb(newPhase, prevPhase);
        }
      }

      // 틱 리스너 호출
      for (const cb of tickListeners) {
        cb(currentTime, newPhase);
      }
    },

    // 현재 부동소수점 시간 (0.0 ~ 24.0)
    getTime() {
      return currentTime;
    },

    // 시간 직접 설정 (시간, 분) - 테스트 및 빠른 전환용
    setTime(targetHour, targetMinute = 0) {
      currentTime = (targetHour + targetMinute / 60) % 24.0;
      lastHour = Math.floor(currentTime);
      const newPhase = calculatePhase(currentTime);
      if (newPhase !== currentPhase) {
        const prev = currentPhase;
        currentPhase = newPhase;
        for (const cb of phaseListeners) cb(newPhase, prev);
      }
      for (const cb of tickListeners) cb(currentTime, currentPhase);
    },

    // 시간 배속 설정 (1 = 기본, 5 = 5배속, 20 = 20배속)
    setTimeScale(newScale) {
      scale = Math.max(0, newScale);
    },

    getTimeScale() {
      return scale;
    },

    togglePause() {
      isPaused = !isPaused;
      return isPaused;
    },

    isPaused() {
      return isPaused;
    },

    // 현재 페이즈 (dawn, day, sunset, night)
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

    // 상세 포맷 정보 반환
    getFormattedInfo() {
      const h = Math.floor(currentTime);
      const m = Math.floor((currentTime % 1) * 60);
      const sH = String(h).padStart(2, '0');
      const sM = String(m).padStart(2, '0');
      const info = PhaseInfo[currentPhase];
      return {
        time: currentTime,
        hour: h,
        minute: m,
        timeString: `${sH}:${sM}`,
        day: currentDay,
        phase: currentPhase,
        phaseName: info.name,
        phaseIcon: info.icon,
        phaseColor: info.color,
        timeScale: scale,
        isPaused
      };
    },

    // 이벤트 리스너 등록
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
    }
  };
}
