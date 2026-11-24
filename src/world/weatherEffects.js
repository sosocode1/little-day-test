// LITTLE DAY 날씨 3D 시각 효과 및 사운드 관리 모듈 (Weather 3D Effects & Audio)
// - 클레이 토이 감성의 선명한 빗방울(InstancedMesh) 및 부드러운 물방울 파문(Shader InstancedMesh)
// - 360도 입체 클레이 구름 무리 (맑음: 소량 흰 구름, 흐림/비: 풍성한 다층 구름층)
// - 날씨별 하늘 그라데이션/안개/조명 파라미터 제공 (안개 날씨는 기존 몽환적 분위기 유지)
// - Web Audio API 기반의 절차적 빗소리 및 오두막 실내 날씨 차단

import * as THREE from 'three';

// 날씨별 렌더링 파라미터 프리셋
const WEATHER_PRESETS = {
  sunny: {
    fogNear: 36,
    fogFar: 95,
    dirMult: 1.12,
    hemiMult: 0.80,
    shadowMult: 1.05,
    skyTint: { r: 1.0, g: 1.0, b: 1.0 },
    fogTint: { r: 1.0, g: 1.0, b: 1.0 },
    daySkyOverride: 1.0,
    skyTop: 0x62b0f2,
    skyMid: 0x90cdf8,
    skyHorizon: 0xd6efff,
    dayFog: 0xd2ecfc,
    sunGlowColor: 0xfff2c2,
    sunGlowStrength: 0.92,
    hemiSkyTint: 0xf4faff,
    hemiGroundTint: 0xfff0ec,
    dirColorTint: 0xfff2cc,
    rainIntensity: 0.0,
    cloudOpacity: 0.92,
    cloudDensity: 0.25,
    cloudColor: 0xffffff,
    cloudEmissive: 0xeef6ff
  },
  cloudy: {
    fogNear: 26,
    fogFar: 68,
    dirMult: 0.38,
    hemiMult: 0.84,
    shadowMult: 0.40,
    skyTint: { r: 0.84, g: 0.86, b: 0.94 },
    fogTint: { r: 0.84, g: 0.86, b: 0.94 },
    daySkyOverride: 1.0,
    skyTop: 0x677999,
    skyMid: 0x8496b5,
    skyHorizon: 0xbcc8dc,
    dayFog: 0xbbc6d6,
    sunGlowColor: 0xeef2fa,
    sunGlowStrength: 0.10,
    hemiSkyTint: 0xdce4f2,
    hemiGroundTint: 0xd5d2de,
    dirColorTint: 0xe6eefc,
    rainIntensity: 0.0,
    cloudOpacity: 0.98,
    cloudDensity: 1.0,
    cloudColor: 0xffffff,
    cloudEmissive: 0xe6ecf8
  },
  rainy: {
    fogNear: 15,
    fogFar: 46,
    dirMult: 0.24,
    hemiMult: 0.68,
    shadowMult: 0.25,
    skyTint: { r: 0.68, g: 0.75, b: 0.90 },
    fogTint: { r: 0.68, g: 0.75, b: 0.90 },
    daySkyOverride: 1.0,
    skyTop: 0x43536e,
    skyMid: 0x5a6b88,
    skyHorizon: 0x8293ad,
    dayFog: 0x7e8fa8,
    sunGlowColor: 0xb8c8e0,
    sunGlowStrength: 0.0,
    hemiSkyTint: 0xb4c6e0,
    hemiGroundTint: 0x94a3bd,
    dirColorTint: 0xc4dbff,
    rainIntensity: 1.0,
    cloudOpacity: 0.96,
    cloudDensity: 1.0,
    cloudColor: 0x96a6c2,
    cloudEmissive: 0x627391
  },
  foggy: {
    fogNear: 6.5,
    fogFar: 28,
    dirMult: 0.32,
    hemiMult: 0.90,
    shadowMult: 0.30,
    skyTint: { r: 0.92, g: 0.89, b: 0.96 },
    fogTint: { r: 0.92, g: 0.89, b: 0.96 },
    daySkyOverride: 0.0,
    skyTop: 0xe7dde8,
    skyMid: 0xe7dde8,
    skyHorizon: 0xe7dde8,
    dayFog: 0xe7dde8,
    sunGlowColor: 0xffffff,
    sunGlowStrength: 0.0,
    hemiSkyTint: 0xffffff,
    hemiGroundTint: 0xffffff,
    dirColorTint: 0xffffff,
    rainIntensity: 0.0,
    cloudOpacity: 0.0,
    cloudDensity: 0.0,
    cloudColor: 0xede8f2,
    cloudEmissive: 0xd9d2e3
  }
};

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getDaylightFactor(timeSystem) {
  if (!timeSystem) return 1.0;
  const t = timeSystem.getTime() % 24.0;
  if (t >= 7.5 && t <= 17.0) return 1.0;
  if (t >= 5.5 && t < 7.5) return smoothstep(5.5, 7.5, t);
  if (t > 17.0 && t <= 19.5) return 1.0 - smoothstep(17.0, 19.5, t);
  return 0.0;
}

// 절차적 Web Audio 빗소리 생성기 (외부 파일 로딩 오류 및 지연 없음)
class ProceduralRainSound {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.filterNode = null;
    this.targetVolume = 0;
    this.currentVolume = 0;
    this.isInitialized = false;

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

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(850, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(0.8, this.ctx.currentTime);

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

export function createWeatherEffects(scene, weatherSystem, timeSystem = null) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'weather-effects';
  scene.add(rootGroup);

  // =====================================================================
  // 1. 빗방울 파티클 시스템 (전경/중경 2중 밀도 배치 + 낮/밤 선명한 가시성)
  // =====================================================================
  const NEAR_RAIN_COUNT = 360;
  const FAR_RAIN_COUNT = 460;
  const RAIN_COUNT = NEAR_RAIN_COUNT + FAR_RAIN_COUNT;
  const MIN_RAIN_Y = 0.04;

  // 클레이 스타일의 가볍고 선명한 테이퍼드 빗방울 스트릭 (길이 0.48m, 반경 0.008~0.019m)
  const rainGeo = new THREE.CylinderGeometry(0.008, 0.019, 0.48, 6);
  rainGeo.rotateZ(0.085);
  rainGeo.rotateX(-0.045);

  const rainDayColor = new THREE.Color(0xe6f4ff);
  const rainNightColor = new THREE.Color(0xcce7ff);
  const rainMat = new THREE.MeshBasicMaterial({
    color: rainDayColor.clone(),
    transparent: true,
    opacity: 0.76,
    depthWrite: false,
    fog: false // 중경 빗방울이 안개에 묻히지 않고 또렷하게 보이도록 설정
  });

  const rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, RAIN_COUNT);
  rainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rainMesh.frustumCulled = false;
  rainMesh.renderOrder = 20;
  rootGroup.add(rainMesh);

  const dummyMatrix = new THREE.Matrix4();
  const dummyPos = new THREE.Vector3();
  const dummyQuat = new THREE.Quaternion();
  const nearRainScale = new THREE.Vector3(1.0, 1.0, 1.0);
  const farRainScale = new THREE.Vector3(1.18, 1.15, 1.18);
  const rippleScale = new THREE.Vector3(1, 1, 1);

  function spawnDropPosition(drop, px, pz, randomY = false) {
    const angle = Math.random() * Math.PI * 2;
    const minR = drop.isNear ? 1.1 : 6.2;
    const maxR = drop.isNear ? 7.8 : 17.5;
    const r = Math.sqrt(Math.random()) * (maxR - minR) + minR;
    drop.x = px + Math.cos(angle) * r;
    drop.z = pz + Math.sin(angle) * r;
    const topY = drop.isNear ? 8.8 : 11.8;
    drop.y = randomY ? (MIN_RAIN_Y + Math.random() * topY) : (topY - Math.random() * 2.0);
    drop.maxR = maxR + 2.0;
  }

  let initializedWithPlayer = false;
  const drops = new Array(RAIN_COUNT).fill(0).map((_, idx) => {
    const isNear = idx < NEAR_RAIN_COUNT;
    const drop = {
      isNear,
      x: 0,
      y: 0,
      z: 0,
      maxR: isNear ? 9.8 : 19.5,
      speed: (isNear ? 9.6 : 10.6) + Math.random() * 3.2
    };
    spawnDropPosition(drop, 0, 0, true);
    return drop;
  });

  // =====================================================================
  // 2. 바닥 빗방울 파문 (부드러운 이중 동심원 + 중심 물방울 튀김 셰이더)
  // =====================================================================
  const RIPPLE_COUNT = 90;
  const rippleGeo = new THREE.PlaneGeometry(0.72, 0.72);
  rippleGeo.rotateX(-Math.PI / 2);

  const rippleProgressAttr = new THREE.InstancedBufferAttribute(new Float32Array(RIPPLE_COUNT), 1);
  rippleProgressAttr.setUsage(THREE.DynamicDrawUsage);
  rippleGeo.setAttribute('aProgress', rippleProgressAttr);

  const rippleMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(0xd8f1ff) },
      uGlobalAlpha: { value: 0.0 }
    },
    vertexShader: `
      attribute float aProgress;
      varying vec2 vUv;
      varying float vProgress;
      void main() {
        vUv = uv;
        vProgress = aProgress;
        vec4 worldPos = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          worldPos = instanceMatrix * worldPos;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uGlobalAlpha;
      varying vec2 vUv;
      varying float vProgress;

      void main() {
        if (vProgress >= 0.999 || uGlobalAlpha <= 0.01) discard;

        float dist = length(vUv - 0.5) * 2.0;
        if (dist > 1.0) discard;

        float p = clamp(vProgress, 0.0, 1.0);
        // 바깥으로 부드럽게 퍼지는 주 파문 링
        float r1 = 0.14 + pow(p, 0.72) * 0.78;
        float ring1 = exp(-pow((dist - r1) / 0.06, 2.0));

        // 뒤따라 퍼지는 2차 잔물결 링
        float p2 = clamp((p - 0.18) / 0.82, 0.0, 1.0);
        float r2 = 0.08 + pow(p2, 0.78) * 0.56;
        float ring2 = step(0.18, p) * exp(-pow((dist - r2) / 0.05, 2.0)) * 0.58 * (1.0 - p2);

        // 착지 직후 중앙 작은 물방울 튀김 하이라이트
        float splashDot = (1.0 - smoothstep(0.0, 0.14, dist)) * (1.0 - smoothstep(0.0, 0.22, p)) * 0.8;

        float shape = max(max(ring1, ring2), splashDot);
        float fade = pow(1.0 - p, 1.45);
        float alpha = clamp(shape * fade * 0.64 * uGlobalAlpha, 0.0, 0.72);
        if (alpha < 0.01) discard;

        vec3 col = mix(uColor, vec3(1.0), 0.30 * splashDot + 0.18 * ring1);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `
  });

  const rippleMesh = new THREE.InstancedMesh(rippleGeo, rippleMat, RIPPLE_COUNT);
  rippleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rippleMesh.frustumCulled = false;
  rippleMesh.renderOrder = 15;
  rootGroup.add(rippleMesh);

  const ripples = new Array(RIPPLE_COUNT).fill(0).map(() => ({
    x: 0,
    y: 0.056,
    z: 0,
    scale: 1.0,
    life: 1.0,
    maxLife: 0.6
  }));
  let nextRippleIndex = 0;

  function spawnRipple(x, z) {
    const r = ripples[nextRippleIndex];
    r.x = x;
    r.y = 0.056;
    r.z = z;
    r.scale = 0.85 + Math.random() * 0.45;
    r.life = 0.0;
    r.maxLife = 0.54 + Math.random() * 0.22;
    nextRippleIndex = (nextRippleIndex + 1) % RIPPLE_COUNT;
  }

  // =====================================================================
  // 3. 360도 입체 클레이 구름 시스템 (맑음: 소량 흰 구름 / 흐림·비: 다층 구름)
  // =====================================================================
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'weather-clouds';
  rootGroup.add(cloudGroup);

  const tierAMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xeef6ff,
    emissiveIntensity: 0.36,
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    opacity: 0.0,
    depthWrite: true, // 동일 구름 내부 구체 간 겹침 이음새 방지 (클레이 덩어리 질감)
    fog: false
  });

  const tierBMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe6ecf8,
    emissiveIntensity: 0.32,
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    opacity: 0.0,
    depthWrite: true,
    fog: false
  });

  // 공통 클레이 구름 덩어리 빌더 (둥글고 폭신한 클레이 토이 구체 조합)
  const sphereMed = new THREE.SphereGeometry(2.6, 14, 10);
  const sphereSmall = new THREE.SphereGeometry(2.0, 12, 9);
  const sphereLarge = new THREE.SphereGeometry(3.1, 14, 10);

  function buildClayCloudCluster(mat, variant = 0) {
    const cluster = new THREE.Group();
    const puffs = [
      { geo: sphereLarge, pos: [0, 0.15, 0], scale: [1.22, 0.84, 0.95] },
      { geo: sphereMed, pos: [2.25, -0.25, 0.2], scale: [1.08, 0.78, 0.92] },
      { geo: sphereMed, pos: [-2.15, -0.3, -0.15], scale: [1.05, 0.76, 0.90] },
      { geo: sphereSmall, pos: [0.65, 1.15, 0.25], scale: [1.05, 0.88, 0.92] },
      { geo: sphereSmall, pos: [-1.0, 0.85, -0.2], scale: [0.95, 0.82, 0.88] }
    ];
    if (variant % 2 === 1) {
      puffs.push({ geo: sphereSmall, pos: [3.6, -0.5, -0.1], scale: [0.95, 0.72, 0.85] });
    }
    for (const p of puffs) {
      const m = new THREE.Mesh(p.geo, mat);
      m.position.set(p.pos[0], p.pos[1], p.pos[2]);
      m.scale.set(p.scale[0], p.scale[1], p.scale[2]);
      m.castShadow = false;
      m.receiveShadow = false;
      m.renderOrder = -5;
      cluster.add(m);
    }
    return cluster;
  }

  // Tier A (5개): 맑음에서 소량 띄우는 흰색 구름 (타이틀 중앙을 가리지 않도록 좌우 배치)
  const tierASpecs = [
    { angle: 2.52, radius: 44, y: 10.6, scale: 0.68, speed: 0.009 },
    { angle: 3.74, radius: 45, y: 11.2, scale: 0.64, speed: 0.008 },
    { angle: 0.55, radius: 44, y: 10.2, scale: 0.66, speed: 0.010 },
    { angle: 1.68, radius: 43, y: 10.4, scale: 0.65, speed: 0.009 },
    { angle: 4.85, radius: 42, y: 10.0, scale: 0.68, speed: 0.011 }
  ];

  // Tier B (18개): 흐림/비에서 하늘을 포근하게 덮는 다층 오버랩 구름층 (높이/거리 교차 배치)
  const tierBSpecs = [];
  const TIER_B_COUNT = 18;
  for (let i = 0; i < TIER_B_COUNT; i++) {
    const baseAngle = (i / TIER_B_COUNT) * Math.PI * 2 + (i % 2 === 0 ? 0.08 : -0.06);
    const isUpper = i % 2 === 0;
    tierBSpecs.push({
      angle: baseAngle,
      radius: isUpper ? (34 + (i % 3) * 4.0) : (40 + (i % 4) * 2.5),
      y: isUpper ? (10.8 + (i % 3) * 1.4) : (7.0 + (i % 3) * 1.2),
      scale: isUpper ? (1.55 + (i % 3) * 0.25) : (1.75 + (i % 3) * 0.22),
      speed: 0.007 + (i % 4) * 0.0022
    });
  }

  const cloudClusters = [];
  tierASpecs.forEach((spec, idx) => {
    const cluster = buildClayCloudCluster(tierAMat, idx);
    cloudGroup.add(cluster);
    cloudClusters.push({
      group: cluster,
      tier: 'A',
      angle: spec.angle,
      radius: spec.radius,
      baseY: spec.y,
      baseScale: spec.scale,
      speed: spec.speed,
      bobPhase: idx * 1.3
    });
  });

  tierBSpecs.forEach((spec, idx) => {
    const cluster = buildClayCloudCluster(tierBMat, idx + 1);
    cloudGroup.add(cluster);
    cloudClusters.push({
      group: cluster,
      tier: 'B',
      angle: spec.angle,
      radius: spec.radius,
      baseY: spec.y,
      baseScale: spec.scale,
      speed: spec.speed,
      bobPhase: idx * 0.85
    });
  });

  // =====================================================================
  // 4. 절차적 빗소리 생성기
  // =====================================================================
  const rainAudio = new ProceduralRainSound();

  // 보간된 색상 및 수치 상태 (GC 방지)
  const _cA = new THREE.Color();
  const _cB = new THREE.Color();
  function lerpHex(hexA, hexB, alpha, target) {
    _cA.setHex(hexA);
    _cB.setHex(hexB);
    target.lerpColors(_cA, _cB, alpha);
  }

  const currentValues = {
    fogNear: 36,
    fogFar: 95,
    dirMult: 1.12,
    hemiMult: 0.80,
    shadowMult: 1.05,
    skyTint: new THREE.Color(1, 1, 1),
    fogTint: new THREE.Color(1, 1, 1),
    daySkyOverride: 1.0,
    skyTop: new THREE.Color(WEATHER_PRESETS.sunny.skyTop),
    skyMid: new THREE.Color(WEATHER_PRESETS.sunny.skyMid),
    skyHorizon: new THREE.Color(WEATHER_PRESETS.sunny.skyHorizon),
    dayFog: new THREE.Color(WEATHER_PRESETS.sunny.dayFog),
    sunGlowColor: new THREE.Color(WEATHER_PRESETS.sunny.sunGlowColor),
    sunGlowStrength: WEATHER_PRESETS.sunny.sunGlowStrength,
    hemiSkyTint: new THREE.Color(WEATHER_PRESETS.sunny.hemiSkyTint),
    hemiGroundTint: new THREE.Color(WEATHER_PRESETS.sunny.hemiGroundTint),
    dirColorTint: new THREE.Color(WEATHER_PRESETS.sunny.dirColorTint),
    rainIntensity: 0.0,
    cloudOpacity: 0.78,
    cloudDensity: 0.25
  };

  const curCloudColor = new THREE.Color();
  const curCloudEmissive = new THREE.Color();
  const nightCloudTint = new THREE.Color(0x4b5b7d);
  const nightCloudEmissive = new THREE.Color(0x2d3854);
  const tempRainScale = new THREE.Vector3(1, 1, 1);
  let animTime = 0;

  return {
    getCurrentModifiers() {
      return currentValues;
    },

    update(playerPos, isIndoor = false, dt = 0.016, cameraPos = null) {
      animTime += dt;
      const curWeather = weatherSystem.getWeather();
      const tgtWeather = weatherSystem.getTargetWeather();
      const alpha = weatherSystem.getTransitionAlpha();

      const pA = WEATHER_PRESETS[curWeather] || WEATHER_PRESETS.sunny;
      const pB = WEATHER_PRESETS[tgtWeather] || WEATHER_PRESETS.sunny;

      // 1. 스칼라 및 색상 파라미터 선형 보간 (4초 전환)
      currentValues.fogNear = pA.fogNear + (pB.fogNear - pA.fogNear) * alpha;
      currentValues.fogFar = pA.fogFar + (pB.fogFar - pA.fogFar) * alpha;
      currentValues.dirMult = pA.dirMult + (pB.dirMult - pA.dirMult) * alpha;
      currentValues.hemiMult = pA.hemiMult + (pB.hemiMult - pA.hemiMult) * alpha;
      currentValues.shadowMult = pA.shadowMult + (pB.shadowMult - pA.shadowMult) * alpha;
      currentValues.daySkyOverride = pA.daySkyOverride + (pB.daySkyOverride - pA.daySkyOverride) * alpha;
      currentValues.sunGlowStrength = pA.sunGlowStrength + (pB.sunGlowStrength - pA.sunGlowStrength) * alpha;
      currentValues.rainIntensity = pA.rainIntensity + (pB.rainIntensity - pA.rainIntensity) * alpha;
      currentValues.cloudOpacity = pA.cloudOpacity + (pB.cloudOpacity - pA.cloudOpacity) * alpha;
      currentValues.cloudDensity = pA.cloudDensity + (pB.cloudDensity - pA.cloudDensity) * alpha;

      currentValues.skyTint.r = pA.skyTint.r + (pB.skyTint.r - pA.skyTint.r) * alpha;
      currentValues.skyTint.g = pA.skyTint.g + (pB.skyTint.g - pA.skyTint.g) * alpha;
      currentValues.skyTint.b = pA.skyTint.b + (pB.skyTint.b - pA.skyTint.b) * alpha;

      currentValues.fogTint.r = pA.fogTint.r + (pB.fogTint.r - pA.fogTint.r) * alpha;
      currentValues.fogTint.g = pA.fogTint.g + (pB.fogTint.g - pA.fogTint.g) * alpha;
      currentValues.fogTint.b = pA.fogTint.b + (pB.fogTint.b - pA.fogTint.b) * alpha;

      lerpHex(pA.skyTop, pB.skyTop, alpha, currentValues.skyTop);
      lerpHex(pA.skyMid, pB.skyMid, alpha, currentValues.skyMid);
      lerpHex(pA.skyHorizon, pB.skyHorizon, alpha, currentValues.skyHorizon);
      lerpHex(pA.dayFog, pB.dayFog, alpha, currentValues.dayFog);
      lerpHex(pA.sunGlowColor, pB.sunGlowColor, alpha, currentValues.sunGlowColor);
      lerpHex(pA.hemiSkyTint, pB.hemiSkyTint, alpha, currentValues.hemiSkyTint);
      lerpHex(pA.hemiGroundTint, pB.hemiGroundTint, alpha, currentValues.hemiGroundTint);
      lerpHex(pA.dirColorTint, pB.dirColorTint, alpha, currentValues.dirColorTint);

      lerpHex(pA.cloudColor, pB.cloudColor, alpha, curCloudColor);
      lerpHex(pA.cloudEmissive, pB.cloudEmissive, alpha, curCloudEmissive);

      // 2. 실내(오두막) 보호: 빗방울, 구름, 안개, 빗소리 모두 차단
      if (isIndoor) {
        rainMesh.visible = false;
        rippleMesh.visible = false;
        cloudGroup.visible = false;
        rainAudio.setVolume(0, dt);
        scene.fog.near = 90;
        scene.fog.far = 240;
        return;
      }

      const dayFactor = getDaylightFactor(timeSystem);

      // 3. 야외 파티클 렌더링 활성화
      const hasRain = currentValues.rainIntensity > 0.01;
      rainMesh.visible = hasRain;
      rippleMesh.visible = hasRain;

      const tierAOpacity = currentValues.cloudOpacity;
      const tierBFactor = Math.max(0, Math.min(1, (currentValues.cloudDensity - 0.25) / 0.65));
      const tierBOpacity = currentValues.cloudOpacity * tierBFactor;
      cloudGroup.visible = tierAOpacity > 0.02 || tierBOpacity > 0.02;

      // 4. 구름 업데이트 (밤에는 은은한 달빛 톤으로 자연스럽게 어두워짐)
      if (cloudGroup.visible) {
        tierAMat.color.lerpColors(nightCloudTint, curCloudColor, dayFactor);
        tierAMat.emissive.lerpColors(nightCloudEmissive, curCloudEmissive, dayFactor);
        tierAMat.emissiveIntensity = 0.16 + dayFactor * 0.22;
        const nightCloudFade = 0.42 + dayFactor * 0.58;
        tierAMat.opacity = tierAOpacity * (tierBFactor > 0.1 ? 0.96 : nightCloudFade);

        tierBMat.color.copy(tierAMat.color);
        tierBMat.emissive.copy(tierAMat.emissive);
        tierBMat.emissiveIntensity = tierAMat.emissiveIntensity;
        tierBMat.opacity = tierBOpacity * 0.96;

        cloudGroup.position.set(playerPos.x, 0, playerPos.z);

        const tierAScaleBoost = 1.0 + tierBFactor * 1.15;
        for (const c of cloudClusters) {
          c.angle += c.speed * dt;
          const bob = Math.sin(animTime * 0.35 + c.bobPhase) * 0.22;
          const x = Math.sin(c.angle) * c.radius;
          const z = Math.cos(c.angle) * c.radius;
          c.group.position.set(x, c.baseY + bob, z);
          c.group.lookAt(playerPos.x, c.baseY + bob, playerPos.z);
          if (c.tier === 'A') {
            c.group.visible = tierAOpacity > 0.02;
            c.group.scale.setScalar(c.baseScale * tierAScaleBoost);
          } else {
            c.group.visible = tierBOpacity > 0.02;
            c.group.scale.setScalar(c.baseScale);
          }
        }
      }

      // 5. 빗방울 및 바닥 파문 시뮬레이션
      if (hasRain) {
        if (!initializedWithPlayer && playerPos) {
          for (const d of drops) {
            spawnDropPosition(d, playerPos.x, playerPos.z, true);
          }
          initializedWithPlayer = true;
        }

        // 낮과 밤 모두 선명하게 보이는 밝은 파스텔 블루-화이트 빗방울
        rainMat.color.lerpColors(rainNightColor, rainDayColor, dayFactor);
        rainMat.opacity = Math.min(0.82, currentValues.rainIntensity * (0.76 + (1.0 - dayFactor) * 0.06));

        for (let i = 0; i < RAIN_COUNT; i++) {
          const d = drops[i];
          d.y -= d.speed * dt;
          d.x -= dt * 1.05;
          d.z += dt * 0.55;

          const dx = d.x - playerPos.x;
          const dz = d.z - playerPos.z;
          const distSq = dx * dx + dz * dz;

          if (d.y <= MIN_RAIN_Y || distSq > d.maxR * d.maxR) {
            if (d.y <= MIN_RAIN_Y && distSq < 12.0 * 12.0) {
              spawnRipple(d.x, d.z);
            }
            spawnDropPosition(d, playerPos.x, playerPos.z, false);
          }

          // 카메라 렌즈 바로 앞(2.2m 이내)에 지나치게 굵게 걸리는 빗방울 완화
          let camFade = 1.0;
          if (cameraPos) {
            const cdx = d.x - cameraPos.x;
            const cdy = d.y - cameraPos.y;
            const cdz = d.z - cameraPos.z;
            const cDist = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz);
            if (cDist < 2.2) {
              camFade = Math.max(0.0, (cDist - 1.2) / 1.0);
            }
          }

          const baseScale = d.isNear ? nearRainScale : farRainScale;
          tempRainScale.set(baseScale.x * camFade, baseScale.y * camFade, baseScale.z * camFade);
          dummyPos.set(d.x, d.y, d.z);
          dummyMatrix.compose(dummyPos, dummyQuat, tempRainScale);
          rainMesh.setMatrixAt(i, dummyMatrix);
        }
        rainMesh.instanceMatrix.needsUpdate = true;

        // 바닥 파문 업데이트 (밤에도 은은하고 촉촉하게 빛나도록 색상 유지)
        rippleMat.uniforms.uGlobalAlpha.value = currentValues.rainIntensity;
        const rippleNight = 0.78 + dayFactor * 0.22;
        rippleMat.uniforms.uColor.value.setRGB(0.84 * rippleNight, 0.94 * rippleNight, 1.0 * rippleNight);

        const progressArr = rippleProgressAttr.array;
        for (let i = 0; i < RIPPLE_COUNT; i++) {
          const r = ripples[i];
          if (r.life < r.maxLife) {
            r.life += dt;
            const p = Math.min(1.0, r.life / r.maxLife);
            progressArr[i] = p;
            dummyPos.set(r.x, r.y, r.z);
            rippleScale.set(r.scale, 1.0, r.scale);
            dummyMatrix.compose(dummyPos, dummyQuat, rippleScale);
          } else {
            progressArr[i] = 1.0;
            dummyPos.set(0, -99, 0);
            rippleScale.set(0.001, 0.001, 0.001);
            dummyMatrix.compose(dummyPos, dummyQuat, rippleScale);
          }
          rippleMesh.setMatrixAt(i, dummyMatrix);
        }
        rippleMesh.instanceMatrix.needsUpdate = true;
        rippleProgressAttr.needsUpdate = true;
      }

      // 6. 빗소리 볼륨
      rainAudio.setVolume(currentValues.rainIntensity * 0.07, dt);
    }
  };
}
