// LITTLE DAY 낮과 밤 환경 및 조명 관리 모듈 (Day & Night Lighting & Atmosphere)
import * as THREE from 'three';

// 24시간 색상 및 조명 키프레임 정의
const KEYFRAMES = [
  {
    time: 0.0, // 한밤중 (00:00)
    sky: 0x1c2237,
    fog: 0x1c2237,
    hemiSky: 0x364366,
    hemiGround: 0x20253b,
    hemiInt: 0.72,
    dirColor: 0x8ea8e6,
    dirInt: 0.42
  },
  {
    time: 4.5, // 새벽 전 (04:30)
    sky: 0x252a42,
    fog: 0x252a42,
    hemiSky: 0x404d73,
    hemiGround: 0x282e47,
    hemiInt: 0.78,
    dirColor: 0x8ea8e6,
    dirInt: 0.44
  },
  {
    time: 5.3, // 새벽 미명 (05:18)
    sky: 0x755e78,
    fog: 0x755e78,
    hemiSky: 0xa285a3,
    hemiGround: 0x644c5a,
    hemiInt: 1.08,
    dirColor: 0xf7beaa,
    dirInt: 0.65
  },
  {
    time: 6.5, // 아침 일출 (06:30)
    sky: 0xfde3d4,
    fog: 0xfde3d4,
    hemiSky: 0xfff4eb,
    hemiGround: 0xffd9e4,
    hemiInt: 1.50,
    dirColor: 0xffe4cb,
    dirInt: 0.95
  },
  {
    time: 12.0, // 정오 (12:00) - 기존 기준 키프레임 (안개 등 레거시 호환)
    sky: 0xfbeee4,
    fog: 0xfbeee4,
    hemiSky: 0xffffff,
    hemiGround: 0xffe3ee,
    hemiInt: 1.70,
    dirColor: 0xfff1dd,
    dirInt: 1.15
  },
  {
    time: 17.5, // 늦은 오후 골든 아워 (17:30)
    sky: 0xfce4d6,
    fog: 0xfce4d6,
    hemiSky: 0xffeedb,
    hemiGround: 0xf5c7d5,
    hemiInt: 1.55,
    dirColor: 0xffdbbe,
    dirInt: 1.10
  },
  {
    time: 18.5, // 저녁 노을 (18:30)
    sky: 0xf09d80,
    fog: 0xf09d80,
    hemiSky: 0xff9c80,
    hemiGround: 0xd96684,
    hemiInt: 1.30,
    dirColor: 0xff7b56,
    dirInt: 0.90
  },
  {
    time: 19.7, // 황혼 (19:42)
    sky: 0x453754,
    fog: 0x453754,
    hemiSky: 0x6d567d,
    hemiGround: 0x3f3148,
    hemiInt: 0.92,
    dirColor: 0xa47096,
    dirInt: 0.52
  },
  {
    time: 21.0, // 밤 (21:00)
    sky: 0x1c2237,
    fog: 0x1c2237,
    hemiSky: 0x364366,
    hemiGround: 0x20253b,
    hemiInt: 0.72,
    dirColor: 0x8ea8e6,
    dirInt: 0.42
  },
  {
    time: 24.0, // 자정 랩어라운드 (24:00)
    sky: 0x1c2237,
    fog: 0x1c2237,
    hemiSky: 0x364366,
    hemiGround: 0x20253b,
    hemiInt: 0.72,
    dirColor: 0x8ea8e6,
    dirInt: 0.42
  }
];

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// 보간 헬퍼: 두 색상 선형 보간
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
function lerpColor(hexA, hexB, alpha, target) {
  _c1.setHex(hexA);
  _c2.setHex(hexB);
  target.lerpColors(_c1, _c2, alpha);
  return target;
}

export function createDayNightCycle(scene, timeSystem) {
  // 1. 기본 환경 조명 초기화
  scene.background = new THREE.Color(0xd6efff);
  scene.fog = new THREE.Fog(0xd2ecfc, 36, 95);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffe3ee, 1.5);
  scene.add(hemiLight);

  const mainLight = new THREE.DirectionalLight(0xfff1dd, 1.15);
  mainLight.name = 'celestial-light';
  mainLight.castShadow = true;
  mainLight.shadow.intensity = 0.45;
  mainLight.shadow.mapSize.set(2048, 2048);
  const cam = mainLight.shadow.camera;
  cam.left = cam.bottom = -16;
  cam.right = cam.top = 16;
  cam.near = 1;
  cam.far = 70;
  mainLight.shadow.bias = -0.0005;
  scene.add(mainLight, mainLight.target);

  // 2. 하늘 그라데이션 스카이돔 (지평선 -> 중층 -> 상공 그라데이션 + 태양 산란광)
  const skyUniforms = {
    uTopColor: { value: new THREE.Color(0x62b0f2) },
    uMidColor: { value: new THREE.Color(0x90cdf8) },
    uHorizonColor: { value: new THREE.Color(0xd6efff) },
    uSunDir: { value: new THREE.Vector3(-0.6, 0.5, -0.2).normalize() },
    uSunGlowColor: { value: new THREE.Color(0xfff2c2) },
    uSunGlowStrength: { value: 0.9 }
  };

  const skyDomeMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uSunDir;
      uniform vec3 uSunGlowColor;
      uniform float uSunGlowStrength;
      varying vec3 vWorldDir;

      void main() {
        vec3 dir = normalize(vWorldDir);
        float h = clamp(dir.y, 0.0, 1.0);

        // 지평선(0.0) -> 중층 하늘(0.18) -> 상공(0.56)으로 자연스럽게 이어지는 그라데이션
        float midT = smoothstep(0.0, 0.18, h);
        float topT = smoothstep(0.14, 0.56, h);

        vec3 col = mix(uHorizonColor, uMidColor, midT);
        col = mix(col, uTopColor, topT);

        // 맑은 날 따뜻한 햇살 산란광 연출
        if (uSunGlowStrength > 0.001) {
          vec3 sDir = normalize(uSunDir);
          float sunDot = max(dot(dir, sDir), 0.0);
          float wideGlow = pow(sunDot, 3.2) * 0.30 * uSunGlowStrength;
          float tightGlow = pow(sunDot, 22.0) * 0.48 * uSunGlowStrength;

          vec2 dirXZ = normalize(dir.xz + vec2(1e-5));
          vec2 sunXZ = normalize(sDir.xz + vec2(1e-5));
          float azGlow = pow(max(dot(dirXZ, sunXZ), 0.0), 2.0)
            * (1.0 - smoothstep(0.0, 0.42, h))
            * 0.16 * uSunGlowStrength;

          col = mix(col, uSunGlowColor, clamp(wideGlow + tightGlow + azGlow, 0.0, 0.85));
        }

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `
  });

  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(75, 32, 24), skyDomeMat);
  skyDome.name = 'sky-dome';
  skyDome.renderOrder = -100;
  skyDome.frustumCulled = false;
  scene.add(skyDome);

  // 3. 하늘의 태양 & 달 3D 천체 오브젝트 생성 (클레이 토이 스타일)
  const skyGroup = new THREE.Group();
  skyGroup.name = 'celestial-sky';

  const sunGroup = new THREE.Group();
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0a8, fog: false });
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1.8, 18, 14), sunMat);
  const sunHaloMat = new THREE.MeshBasicMaterial({
    color: 0xffe28a,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    fog: false
  });
  const sunHalo = new THREE.Mesh(new THREE.RingGeometry(2.1, 3.4, 24), sunHaloMat);
  sunGroup.add(sunMesh, sunHalo);
  skyGroup.add(sunGroup);

  const moonGroup = new THREE.Group();
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xf4f3e6, fog: false });
  const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 14), moonMat);
  const moonGlowMat = new THREE.MeshBasicMaterial({
    color: 0xd0ddff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    fog: false
  });
  const moonGlow = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.7, 24), moonGlowMat);
  moonGroup.add(moonMesh, moonGlow);
  skyGroup.add(moonGroup);

  scene.add(skyGroup);

  // 현재 보간된 색상 객체들 (GC 방지용 인스턴스 재사용)
  const currentSkyColor = new THREE.Color();
  const currentFogColor = new THREE.Color();
  const currentHemiSky = new THREE.Color();
  const currentHemiGround = new THREE.Color();
  const currentDirColor = new THREE.Color();

  const baseSky = new THREE.Color();
  const baseFog = new THREE.Color();
  const nightTop = new THREE.Color();
  const nightMid = new THREE.Color();
  const nightHorizon = new THREE.Color();
  const tintedColor = new THREE.Color();
  const sunDirNorm = new THREE.Vector3();

  return {
    sun: mainLight,
    hemiLight,
    skyGroup,
    skyDome,

    setIndoor(isIndoor) {
      skyDome.visible = !isIndoor;
      skyGroup.visible = !isIndoor;
    },

    // 매 프레임 시간 및 플레이어 위치 기반 환경 갱신 (날씨 모디파이어 지원)
    update(playerPos, weatherMod = null) {
      const time = timeSystem.getTime() % 24.0;

      // 1. 키프레임 보간 파라미터 계산
      let kPrev = KEYFRAMES[0];
      let kNext = KEYFRAMES[1];
      for (let i = 0; i < KEYFRAMES.length - 1; i++) {
        if (time >= KEYFRAMES[i].time && time <= KEYFRAMES[i + 1].time) {
          kPrev = KEYFRAMES[i];
          kNext = KEYFRAMES[i + 1];
          break;
        }
      }

      const alpha = Math.max(0, Math.min(1, (time - kPrev.time) / (kNext.time - kPrev.time)));

      // 2. 색상 보간 적용
      lerpColor(kPrev.sky, kNext.sky, alpha, currentSkyColor);
      lerpColor(kPrev.fog, kNext.fog, alpha, currentFogColor);
      lerpColor(kPrev.hemiSky, kNext.hemiSky, alpha, currentHemiSky);
      lerpColor(kPrev.hemiGround, kNext.hemiGround, alpha, currentHemiGround);
      lerpColor(kPrev.dirColor, kNext.dirColor, alpha, currentDirColor);

      const hemiInt = kPrev.hemiInt + (kNext.hemiInt - kPrev.hemiInt) * alpha;
      const dirInt = kPrev.dirInt + (kNext.dirInt - kPrev.dirInt) * alpha;

      // 낮 비중 계산 (07:30~17:00 = 1.0, 밤 = 0.0, 새벽/황혼 부드럽게 전환)
      let dayFactor = 0.0;
      if (time >= 7.5 && time <= 17.0) {
        dayFactor = 1.0;
      } else if (time >= 5.5 && time < 7.5) {
        dayFactor = smoothstep(5.5, 7.5, time);
      } else if (time > 17.0 && time <= 19.5) {
        dayFactor = 1.0 - smoothstep(17.0, 19.5, time);
      }

      // 3. 씬 배경, 스카이돔, 안개 및 조명 적용 (날씨 모디파이어 결합)
      skyDome.position.set(playerPos.x, 0, playerPos.z);

      if (weatherMod) {
        baseSky.setRGB(
          currentSkyColor.r * weatherMod.skyTint.r,
          currentSkyColor.g * weatherMod.skyTint.g,
          currentSkyColor.b * weatherMod.skyTint.b
        );
        baseFog.setRGB(
          currentFogColor.r * weatherMod.fogTint.r,
          currentFogColor.g * weatherMod.fogTint.g,
          currentFogColor.b * weatherMod.fogTint.b
        );

        const override = weatherMod.daySkyOverride ?? 0.0;
        const skyBlend = override * dayFactor;

        // 밤/노을 기본 그라데이션 (안개 날씨는 override=0으로 기존 균일 파스텔 안개 유지)
        nightTop.copy(baseSky).multiplyScalar(1.0 - override * 0.36);
        nightMid.copy(baseSky);
        nightHorizon.copy(baseSky).multiplyScalar(1.0 + override * 0.24);

        skyUniforms.uTopColor.value.lerpColors(nightTop, weatherMod.skyTop, skyBlend);
        skyUniforms.uMidColor.value.lerpColors(nightMid, weatherMod.skyMid, skyBlend);
        skyUniforms.uHorizonColor.value.lerpColors(nightHorizon, weatherMod.skyHorizon, skyBlend);

        scene.background.copy(skyUniforms.uMidColor.value);
        scene.fog.color.lerpColors(baseFog, weatherMod.dayFog, skyBlend);
        scene.fog.near = weatherMod.fogNear;
        scene.fog.far = weatherMod.fogFar;

        // 낮 시간에 맞춘 방향광/환경광 색감 보정 (안개는 0xffffff 곱셈으로 무변경)
        tintedColor.copy(currentHemiSky).multiply(weatherMod.hemiSkyTint);
        hemiLight.color.lerpColors(currentHemiSky, tintedColor, dayFactor);

        tintedColor.copy(currentHemiGround).multiply(weatherMod.hemiGroundTint);
        hemiLight.groundColor.lerpColors(currentHemiGround, tintedColor, dayFactor);
        hemiLight.intensity = hemiInt * weatherMod.hemiMult;

        tintedColor.copy(currentDirColor).multiply(weatherMod.dirColorTint);
        mainLight.color.lerpColors(currentDirColor, tintedColor, dayFactor);
        mainLight.intensity = dirInt * weatherMod.dirMult;

        skyUniforms.uSunGlowColor.value.copy(weatherMod.sunGlowColor);
        skyUniforms.uSunGlowStrength.value = weatherMod.sunGlowStrength * Math.max(dayFactor, 0.15 * (time >= 5.0 && time <= 19.2 ? 1.0 : 0.0));
      } else {
        scene.background.copy(currentSkyColor);
        scene.fog.color.copy(currentFogColor);
        skyUniforms.uTopColor.value.copy(currentSkyColor);
        skyUniforms.uMidColor.value.copy(currentSkyColor);
        skyUniforms.uHorizonColor.value.copy(currentSkyColor);
        skyUniforms.uSunGlowStrength.value = 0.0;

        hemiLight.color.copy(currentHemiSky);
        hemiLight.groundColor.copy(currentHemiGround);
        hemiLight.intensity = hemiInt;

        mainLight.color.copy(currentDirColor);
        mainLight.intensity = dirInt;
      }

      // 4. 태양 & 달 궤도 공전 위치 계산
      const sunAngle = ((time - 6.0) / 24.0) * Math.PI * 2;
      const orbitRadius = 48.0;
      const orbitHeight = 32.0;

      const sunX = -Math.cos(sunAngle) * orbitRadius;
      const sunY = Math.sin(sunAngle) * orbitHeight;
      const sunZ = Math.sin(sunAngle) * 8.0 - 10.0;

      sunGroup.position.set(sunX, sunY, sunZ);
      sunHalo.lookAt(playerPos.x, playerPos.y, playerPos.z);
      const glowFactor = weatherMod ? weatherMod.sunGlowStrength : 1.0;
      sunGroup.visible = sunY > -4.0 && glowFactor > 0.05;
      sunHaloMat.opacity = 0.48 * glowFactor;

      sunDirNorm.set(sunX, Math.max(sunY, 2.0), sunZ).normalize();
      skyUniforms.uSunDir.value.copy(sunDirNorm);

      // 달은 태양 반대편 (위상차 180도)
      const moonX = -sunX;
      const moonY = -sunY;
      const moonZ = -sunZ - 10.0;

      moonGroup.position.set(moonX, moonY, moonZ);
      moonGlow.lookAt(playerPos.x, playerPos.y, playerPos.z);
      moonGroup.visible = moonY > -4.0;
      const moonVisibility = weatherMod ? Math.max(0.25, 1.0 - (weatherMod.rainIntensity || 0) * 0.7) : 1.0;
      moonGlowMat.opacity = 0.35 * moonVisibility;

      // 천체 그룹의 중심을 플레이어 상공으로 부드럽게 추적
      skyGroup.position.set(playerPos.x, 0, playerPos.z);

      // 5. 방향광(Directional Light) 위치 및 타겟 설정
      const isDaytime = sunY >= 0;
      const lightSource = isDaytime ? sunGroup.position : moonGroup.position;

      const snapX = Math.round(playerPos.x / 2) * 2;
      const snapZ = Math.round(playerPos.z / 2) * 2;

      mainLight.target.position.set(snapX, 0, snapZ);

      const dirNorm = lightSource.clone().normalize();
      const lightDistance = 24.0;
      mainLight.position.set(
        snapX + dirNorm.x * lightDistance,
        Math.max(10.0, lightDistance * Math.abs(dirNorm.y)),
        snapZ + dirNorm.z * lightDistance
      );

      const shadowFactor = weatherMod?.shadowMult ?? 1.0;
      mainLight.shadow.intensity = (isDaytime ? 0.45 : 0.32) * shadowFactor;
    }
  };
}
