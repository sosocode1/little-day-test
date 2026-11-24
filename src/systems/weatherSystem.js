// LITTLE DAY 날씨 변화 시스템 (Weather System)
// - 4가지 날씨: 맑음(sunny), 흐림(cloudy), 비(rainy), 안개(foggy)
// - 부드러운 전환 보간 (lerp)
// - 일정 시간 간격 자동 변경 및 플레이어 수동 날씨 변경 지원
// - 낮과 밤 시간대 시스템 및 세이브 시스템과 완벽 연동

export const WeatherType = {
  SUNNY: 'sunny',   // 맑음: 밝은 햇빛, 따뜻한 파스텔 조명, 선명한 시야
  CLOUDY: 'cloudy', // 흐림: 차분하고 부드러운 산란광, 파스텔 구름
  RAINY: 'rainy',   // 비: 귀여운 클레이 빗방울, 바닥 물방울 파문, 부드러운 빗소리
  FOGGY: 'foggy'    // 안개: 몽환적인 파스텔 안개, 부드러운 산란 효과
};

export const WeatherInfo = {
  [WeatherType.SUNNY]: {
    id: WeatherType.SUNNY,
    name: '맑음',
    icon: '☀️',
    color: '#ff9858',
    bgColor: '#fff2e6',
    desc: '화창하고 따뜻한 햇살이 내리쬡니다.'
  },
  [WeatherType.CLOUDY]: {
    id: WeatherType.CLOUDY,
    name: '흐림',
    icon: '☁️',
    color: '#7b879e',
    bgColor: '#eef2f7',
    desc: '포근한 구름이 드리워져 차분한 분위기입니다.'
  },
  [WeatherType.RAINY]: {
    id: WeatherType.RAINY,
    name: '비',
    icon: '🌧️',
    color: '#497ec7',
    bgColor: '#e8f0fe',
    desc: '촉촉하고 귀여운 빗방울이 토닥토닥 내립니다.'
  },
  [WeatherType.FOGGY]: {
    id: WeatherType.FOGGY,
    name: '안개',
    icon: '🌫️',
    color: '#8b709e',
    bgColor: '#f3eef8',
    desc: '은은하고 몽환적인 파스텔 안개가 감쌉니다.'
  }
};

export function createWeatherSystem(initialWeather = WeatherType.SUNNY) {
  let currentWeather = initialWeather;
  let targetWeather = initialWeather;
  let transitionAlpha = 1.0; // 0.0 ~ 1.0 (1.0 = 전환 완료)
  const transitionDuration = 4.0; // 자연스러운 전환 시간 (4초)
  let transitionTimer = transitionDuration;

  let autoCycle = true;
  const changeInterval = 150.0; // 2.5분 간격 자동 순환
  let cycleTimer = 0;

  const changeListeners = new Set();
  const tickListeners = new Set();

  function notifyChange(newWeather, prevWeather) {
    for (const cb of changeListeners) {
      try {
        cb(newWeather, prevWeather);
      } catch (e) {
        console.warn('[WeatherSystem] Listener error:', e);
      }
    }
  }

  // 가중치 기반 다음 날씨 선택 (맑음과 흐림이 가장 자연스럽게 자주 등장)
  function pickNextWeather() {
    const pool = [
      WeatherType.SUNNY,
      WeatherType.SUNNY,
      WeatherType.CLOUDY,
      WeatherType.CLOUDY,
      WeatherType.RAINY,
      WeatherType.FOGGY
    ];
    // 현재 날씨를 제외한 목록에서 선택
    const candidates = pool.filter((w) => w !== targetWeather);
    return candidates[Math.floor(Math.random() * candidates.length)] || WeatherType.SUNNY;
  }

  return {
    getWeather() {
      return currentWeather;
    },
    getTargetWeather() {
      return targetWeather;
    },
    getTransitionAlpha() {
      return transitionAlpha;
    },
    isTransitioning() {
      return transitionAlpha < 1.0;
    },
    isAutoCycle() {
      return autoCycle;
    },
    setAutoCycle(enabled) {
      autoCycle = !!enabled;
      cycleTimer = 0;
    },

    // 날씨 변경 (immediate: 즉시 변경 여부)
    setWeather(newWeather, immediate = false) {
      if (!WeatherInfo[newWeather]) return;
      if (targetWeather === newWeather && transitionAlpha >= 1.0) return;

      const prev = currentWeather;
      targetWeather = newWeather;

      if (immediate) {
        currentWeather = newWeather;
        transitionAlpha = 1.0;
        transitionTimer = transitionDuration;
      } else {
        transitionAlpha = 0.0;
        transitionTimer = 0;
      }

      cycleTimer = 0;
      notifyChange(targetWeather, prev);
    },

    onChange(cb) {
      changeListeners.add(cb);
      return () => changeListeners.delete(cb);
    },

    onTick(cb) {
      tickListeners.add(cb);
      return () => tickListeners.delete(cb);
    },

    // 매 프레임 업데이트 (전환 보간 및 자동 순환 타이머)
    update(dt) {
      // 1. 부드러운 날씨 전환 보간
      if (transitionAlpha < 1.0) {
        transitionTimer += dt;
        transitionAlpha = Math.min(1.0, transitionTimer / transitionDuration);
        if (transitionAlpha >= 1.0) {
          const prev = currentWeather;
          currentWeather = targetWeather;
          notifyChange(currentWeather, prev);
        }
      }

      // 2. 자동 날씨 순환 (야외/실내 무관하게 시간 흐름 지속)
      if (autoCycle) {
        cycleTimer += dt;
        if (cycleTimer >= changeInterval) {
          cycleTimer = 0;
          const next = pickNextWeather();
          this.setWeather(next, false);
        }
      }

      // 틱 알림
      for (const cb of tickListeners) {
        try {
          cb(currentWeather, targetWeather, transitionAlpha);
        } catch (e) {}
      }
    },

    // 세이브 데이터 연동
    exportData() {
      return {
        current: targetWeather,
        autoCycle
      };
    },
    restore(savedData) {
      if (!savedData) return;
      if (savedData.current && WeatherInfo[savedData.current]) {
        this.setWeather(savedData.current, true);
      }
      if (savedData.autoCycle !== undefined) {
        autoCycle = !!savedData.autoCycle;
      }
    }
  };
}
