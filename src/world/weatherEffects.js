// LITTLE DAY 날씨 3D 시각 효과 및 사운드 관리 모듈 (Weather 3D Effects & Audio)
// - 클레이 토이 감성의 귀여운 빗방울(InstancedMesh) 및 바닥 물방울 파문
// - 부드러운 파스텔 구름 무리 및 은은한 안개
// - Web Audio API 기반의 절차적 빗소리 (외부 에셋 의존 없음)
// - 오두막 실내 날씨 차단 및 실내/실외 매끄러운 연동

import * as THREE from 'three';

// 날씨별 렌더링 파라미터 프리셋
const WEATHER_PRESETS = {
  sunny: {
    fogNear: 32,
    fogFar: 85,
    dirMult: 1.0,
    hemiMult: 1.0,
    shadowMult: 1.0,
    skyTint: { r: 1.0, g: 1.0, b: 1.0 },
    fogTint: { r: 1.0, g: 1.0, b: 1.0 },
    rainIntensity: 0.0,
    cloudOpacity: 0.0
  },
  cloudy: {
    fogNear: 26,
    fogFar: 68,
    dirMult: 0.60,
    hemiMult: 0.86,
    shadowMult: 0.65,
    skyTint: { r: 0.88, g: 0.88, b: 0.94 },
    fogTint: { r: 0.88, g: 0.88, b: 0.94 },
    rainIntensity: 0.0,
    cloudOpacity: 0.85
  },
  rainy: {
    fogNear: 18,
    fogFar: 52,
    dirMult: 0.42,
    hemiMult: 0.76,
    shadowMult: 0.50,
    skyTint: { r: 0.74, g: 0.79, b: 0.92 },
    fogTint: { r: 0.74, g: 0.79, b: 0.92 },
    rainIntensity: 1.0,
    cloudOpacity: 0.95
  },
  foggy: {
    fogNear: 6.5,
    fogFar: 28,
    dirMult: 0.32,
    hemiMult: 0.90,
    shadowMult: 0.30,
    skyTint: { r: 0.92, g: 0.89, b: 0.96 },
    fogTint: { r: 0.92, g: 0.89, b: 0.96 },
    rainIntensity: 0.0,
    cloudOpacity: 0.40
  }
};

// 절차적 Web Audio 빗소리 생성기 (외부 파일 로딩 오류 및 지연 없음)
class ProceduralRainSound {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.filterNode = null;
    this.targetVolume = 0;
    this.currentVolume = 0;
    this.isInitialized = false;

    // 사용자 제스처 시 오디오 컨텍스트 활성화
    const unlockAudio = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    }
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // 2초 길이의 핑크/소프트 노이즈 버퍼 생성 (포근하고 부드러운 빗소리)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.055;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // 차분한 빗소리를 위한 850Hz 로우패스 필터
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(850, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.8, this.ctx.currentTime);

      // 마스터 게인 (볼륨)
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      noiseSource.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      noiseSource.start(0);
      this.isInitialized = true;
    } catch (e) {
      // 자동 재생 정책이나 비지원 브라우저 예외 무시
    }
  }

  setVolume(vol, dt) {
    this.targetVolume = Math.max(0, Math.min(0.08, vol));
    if (!this.isInitialized && this.targetVolume > 0) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.targetVolume > 0) {
      this.ctx.resume().catch(() => {});
    }
    if (this.gainNode && this.ctx) {
      this.currentVolume += (this.targetVolume - this.currentVolume) * Math.min(1.0, dt * 2.5);
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }
}

export function createWeatherEffects(scene, weatherSystem) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'weather-effects';
  scene.add(rootGroup);

  // 1. 빗방울 파티클 시스템 (클레이 토이 감성의 선명하고 아기자기한 빗방울)
  const RAIN_COUNT = 480;
  const SPREAD_XZ = 18.0;
  const MAX_RAIN_Y = 10.0;
  const MIN_RAIN_Y = 0.05;

  // 상단은 살짝 가늘고 하단은 물방울처럼 통통한 테이퍼드 원통 (길이 0.44m, 하단 반경 0.024m)
  const rainGeo = new THREE.CylinderGeometry(0.010, 0.024, 0.44, 5);
  // 낙하 속도 및 바람 방향(-X, +Z)에 맞춘 자연스러운 기울임
  rainGeo.rotateZ(0.08);
  rainGeo.rotateX(-0.05);

  const rainMat = new THREE.MeshBasicMaterial({
    color: 0xd8ebfc, // 은은하고 촉촉한 파스텔 스카이 블루-화이트
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });
  const rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, RAIN_COUNT);
  rainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rainMesh.frustumCulled = false; // 동적 인스턴스 파티클 필수 설정: 카메라 회전/이동 시 컬링 방지
  rainMesh.renderOrder = 20; // 지형 및 반투명 오브젝트보다 위에서 선명하게 렌더링
  rootGroup.add(rainMesh);

  // 각 빗방울 위치 및 낙하 속도 상태
  const dummyMatrix = new THREE.Matrix4();
  const dummyPos = new THREE.Vector3();
  const dummyQuat = new THREE.Quaternion(); // THREE.Matrix4.compose는 Euler가 아닌 Quaternion(x,y,z,w) 필수!
  const rainScale = new THREE.Vector3(1, 1, 1);
  const rippleScale = new THREE.Vector3(1, 1, 1);

  let initializedWithPlayer = false;
  const drops = new Array(RAIN_COUNT).fill(0).map(() => ({
    x: (Math.random() - 0.5) * SPREAD_XZ,
    y: Math.random() * MAX_RAIN_Y,
    z: (Math.random() - 0.5) * SPREAD_XZ,
    speed: 10.5 + Math.random() * 3.5
  }));

  // 2. 바닥 빗방울 파문 (Ground Splash Ripples)
  const RIPPLE_COUNT = 40;
  // 도넛형 링 지오메트리 (내경 0.07m, 외경 0.20m)
  const rippleGeo = new THREE.RingGeometry(0.07, 0.20, 16);
  rippleGeo.rotateX(-Math.PI / 2);

  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending // 촉촉하게 빛나는 물방울 파문
  });

  const rippleMesh = new THREE.InstancedMesh(rippleGeo, rippleMat, RIPPLE_COUNT);
  rippleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rippleMesh.frustumCulled = false; // 카메라 이동 시 컬링 방지
  rippleMesh.renderOrder = 15;
  rootGroup.add(rippleMesh);

  // 개별 인스턴스 색상/알파 페이드용 Color 초기화
  const rippleColor = new THREE.Color();
  for (let i = 0; i < RIPPLE_COUNT; i++) {
    rippleMesh.setColorAt(i, new THREE.Color(0, 0, 0));
  }
  if (rippleMesh.instanceColor) {
    rippleMesh.instanceColor.needsUpdate = true;
  }

  const ripples = new Array(RIPPLE_COUNT).fill(0).map(() => ({
    x: 0,
    y: 0.052,
    z: 0,
    life: 1.0,
    maxLife: 0.45 + Math.random() * 0.15
  }));
  let nextRippleIndex = 0;

  function spawnRipple(x, z) {
    const r = ripples[nextRippleIndex];
    r.x = x;
    r.y = 0.052; // 잔디(0.0), 산책로(0.03), 광장(0.045) 위에 자연스럽게 겹치도록 설정
    r.z = z;
    r.life = 0.0;
    r.maxLife = 0.45 + Math.random() * 0.15;
    nextRippleIndex = (nextRippleIndex + 1) % RIPPLE_COUNT;
  }

  // 3. 부드러운 클레이 구름 무리 (흐림/비 날씨에 하늘에 나타남)
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'weather-clouds';
  rootGroup.add(cloudGroup);

  const cloudMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  });

  const cloudClusters = [];
  const cloudPositions = [
    { x: -16, y: 17, z: -24, scale: 1.4 },
    { x: 12, y: 19, z: -28, scale: 1.6 },
    { x: -6, y: 15, z: -18, scale: 1.2 },
    { x: 20, y: 18, z: -20, scale: 1.5 },
    { x: 0, y: 20, z: -30, scale: 1.8 }
  ];

  for (const pos of cloudPositions) {
    const cluster = new THREE.Group();
    // 3~4개의 둥글둥글한 클레이 구체 결합
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(3.5, 12, 10), cloudMat);
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 10), cloudMat);
    s2.position.set(2.4, -0.4, 0);
    const s3 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 10), cloudMat);
    s3.position.set(-2.2, -0.5, 0);
    const s4 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 10), cloudMat);
    s4.position.set(0.4, 1.2, 0.4);

    cluster.add(s1, s2, s3, s4);
    cluster.position.set(pos.x, pos.y, pos.z);
    cluster.scale.setScalar(pos.scale);
    cloudGroup.add(cluster);
    cloudClusters.push({ group: cluster, initX: pos.x, speed: 0.25 + Math.random() * 0.15 });
  }

  // 4. 절차적 빗소리 생성기
  const rainAudio = new ProceduralRainSound();

  // 현재 보간된 날씨 파라미터 값 (GC 방지용 인스턴스)
  const currentValues = {
    fogNear: 32,
    fogFar: 85,
    dirMult: 1.0,
    hemiMult: 1.0,
    shadowMult: 1.0,
    skyTint: new THREE.Color(1, 1, 1),
    fogTint: new THREE.Color(1, 1, 1),
    rainIntensity: 0.0,
    cloudOpacity: 0.0
  };

  return {
    getCurrentModifiers() {
      return currentValues;
    },

    // 매 프레임 날씨 시각 효과 및 파티클 갱신
    update(playerPos, isIndoor = false, dt = 0.016) {
      const curWeather = weatherSystem.getWeather();
      const tgtWeather = weatherSystem.getTargetWeather();
      const alpha = weatherSystem.getTransitionAlpha();

      const pA = WEATHER_PRESETS[curWeather] || WEATHER_PRESETS.sunny;
      const pB = WEATHER_PRESETS[tgtWeather] || WEATHER_PRESETS.sunny;

      // 1. 파라미터 선형 보간 (Lerp)
      currentValues.fogNear = pA.fogNear + (pB.fogNear - pA.fogNear) * alpha;
      currentValues.fogFar = pA.fogFar + (pB.fogFar - pA.fogFar) * alpha;
      currentValues.dirMult = pA.dirMult + (pB.dirMult - pA.dirMult) * alpha;
      currentValues.hemiMult = pA.hemiMult + (pB.hemiMult - pA.hemiMult) * alpha;
      currentValues.shadowMult = pA.shadowMult + (pB.shadowMult - pA.shadowMult) * alpha;
      currentValues.rainIntensity = pA.rainIntensity + (pB.rainIntensity - pA.rainIntensity) * alpha;
      currentValues.cloudOpacity = pA.cloudOpacity + (pB.cloudOpacity - pA.cloudOpacity) * alpha;

      currentValues.skyTint.r = pA.skyTint.r + (pB.skyTint.r - pA.skyTint.r) * alpha;
      currentValues.skyTint.g = pA.skyTint.g + (pB.skyTint.g - pA.skyTint.g) * alpha;
      currentValues.skyTint.b = pA.skyTint.b + (pB.skyTint.b - pA.skyTint.b) * alpha;

      currentValues.fogTint.r = pA.fogTint.r + (pB.fogTint.r - pA.fogTint.r) * alpha;
      currentValues.fogTint.g = pA.fogTint.g + (pB.fogTint.g - pA.fogTint.g) * alpha;
      currentValues.fogTint.b = pA.fogTint.b + (pB.fogTint.b - pA.fogTint.b) * alpha;

      // 2. 실내(오두막) 보호: 빗방울과 안개가 실내로 들어오지 않도록 차단
      if (isIndoor) {
        rainMesh.visible = false;
        rippleMesh.visible = false;
        cloudGroup.visible = false;
        rainAudio.setVolume(0, dt);
        // 실내에서는 안개를 멀리 밀어내어 방 내부가 선명하고 아늑하게 유지
        scene.fog.near = 90;
        scene.fog.far = 240;
        return;
      }

      // 3. 야외 파티클 렌더링 활성화
      const hasRain = currentValues.rainIntensity > 0.01;
      rainMesh.visible = hasRain;
      rippleMesh.visible = hasRain;
      cloudGroup.visible = currentValues.cloudOpacity > 0.02;

      // 4. 구름 업데이트 (천천히 유영 및 투명도 반영)
      cloudMat.opacity = currentValues.cloudOpacity * 0.85;
      cloudGroup.position.set(playerPos.x, 0, playerPos.z);
      for (const c of cloudClusters) {
        c.group.position.x += c.speed * dt;
        if (c.group.position.x > 38) {
          c.group.position.x = -38;
        }
      }

      // 5. 빗방울 및 바닥 파문 시뮬레이션
      if (hasRain) {
        // 플레이어 첫 진입 시 파티클을 플레이어 주변으로 즉시 재배치
        if (!initializedWithPlayer && playerPos) {
          for (const d of drops) {
            d.x = playerPos.x + (Math.random() - 0.5) * SPREAD_XZ;
            d.z = playerPos.z + (Math.random() - 0.5) * SPREAD_XZ;
          }
          initializedWithPlayer = true;
        }

        rainMat.opacity = Math.min(0.80, currentValues.rainIntensity * 0.78);

        for (let i = 0; i < RAIN_COUNT; i++) {
          const d = drops[i];
          d.y -= d.speed * dt;
          d.x -= dt * 1.1; // 은은한 바람에 날리는 빗줄기
          d.z += dt * 0.7;

          const dx = d.x - playerPos.x;
          const dz = d.z - playerPos.z;
          const distSq = dx * dx + dz * dz;

          // 바닥에 닿거나 플레이어 반경 밖으로 벗어나면 재스폰
          if (d.y <= MIN_RAIN_Y || distSq > 13.5 * 13.5) {
            // 바닥에 닿는 순간 플레이어 주변(반경 9.5m 이내)이면 물방울 파문 생성
            if (d.y <= MIN_RAIN_Y && distSq < 9.5 * 9.5) {
              spawnRipple(d.x, d.z);
            }
            d.y = 8.0 + Math.random() * 2.2;
            d.x = playerPos.x + (Math.random() - 0.5) * SPREAD_XZ;
            d.z = playerPos.z + (Math.random() - 0.5) * SPREAD_XZ;
          }

          dummyPos.set(d.x, d.y, d.z);
          dummyMatrix.compose(dummyPos, dummyQuat, rainScale);
          rainMesh.setMatrixAt(i, dummyMatrix);
        }
        rainMesh.instanceMatrix.needsUpdate = true;

        // 바닥 파문 업데이트 (생성 -> 자연스러운 확대 -> 부드러운 페이드아웃)
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          const r = ripples[i];
          if (r.life < r.maxLife) {
            r.life += dt;
            const p = Math.min(1.0, r.life / r.maxLife);
            // 부드럽게 퍼져나가는 파문 (0.25 -> 1.3 스케일 확장, 직경 약 0.1m -> 0.52m)
            const curScale = 0.25 + Math.sin(p * Math.PI * 0.5) * 1.05;
            dummyPos.set(r.x, r.y, r.z);
            rippleScale.set(curScale, 1.0, curScale);
            dummyMatrix.compose(dummyPos, dummyQuat, rippleScale);

            // 화사한 파스텔 물빛에서 자연스럽게 페이드아웃 (2차 곡선 페이드)
            const fade = Math.max(0.0, (1.0 - p) * (1.0 - p * 0.25));
            rippleColor.setRGB(0.42 * fade, 0.62 * fade, 0.85 * fade);
            rippleMesh.setColorAt(i, rippleColor);
          } else {
            dummyPos.set(0, -99, 0); // 화면 밖으로 숨김
            rippleScale.set(0.001, 0.001, 0.001);
            dummyMatrix.compose(dummyPos, dummyQuat, rippleScale);
            rippleColor.setRGB(0, 0, 0);
            rippleMesh.setColorAt(i, rippleColor);
          }
          rippleMesh.setMatrixAt(i, dummyMatrix);
        }
        rippleMesh.instanceMatrix.needsUpdate = true;
        if (rippleMesh.instanceColor) {
          rippleMesh.instanceColor.needsUpdate = true;
        }
      }

      // 6. 빗소리 볼륨 (야외 비 강도에 비례)
      rainAudio.setVolume(currentValues.rainIntensity * 0.07, dt);
    }
  };
}
