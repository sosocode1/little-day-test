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
    time: 12.0, // 정오 (12:00) - 기존 LITTLE DAY 오리지널 파스텔 톤
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
  scene.background = new THREE.Color(0xfbeee4);
  scene.fog = new THREE.Fog(0xfbeee4, 32, 85);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffe3ee, 1.7);
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

  // 2. 하늘의 태양 & 달 3D 천체 오브젝트 생성 (클레이 토이 스타일)
  const skyGroup = new THREE.Group();
  skyGroup.name = 'celestial-sky';

  // (1) 태양: 따뜻한 꿀빛 클레이 구체 + 은은한 광배 링
  const sunGroup = new THREE.Group();
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xfff0a8 })
  );
  const sunHalo = new THREE.Mesh(
    new THREE.RingGeometry(2.1, 3.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  sunGroup.add(sunMesh, sunHalo);
  skyGroup.add(sunGroup);

  // (2) 달: 부드러운 크림빛 달 구체 + 작은 크레이터 느낌의 장식
  const moonGroup = new THREE.Group();
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xf4f3e6 })
  );
  const moonGlow = new THREE.Mesh(
    new THREE.RingGeometry(1.7, 2.7, 24),
    new THREE.MeshBasicMaterial({ color: 0xd0ddff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  moonGroup.add(moonMesh, moonGlow);
  skyGroup.add(moonGroup);

  scene.add(skyGroup);

  // 현재 보간된 색상 객체들 (GC 방지용 인스턴스 재사용)
  const currentSkyColor = new THREE.Color();
  const currentFogColor = new THREE.Color();
  const currentHemiSky = new THREE.Color();
  const currentHemiGround = new THREE.Color();
  const currentDirColor = new THREE.Color();

  return {
    sun: mainLight,
    hemiLight,
    skyGroup,

    // 매 프레임 시간 및 플레이어 위치 기반 환경 갱신
    update(playerPos) {
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

      // 3. 씬 배경 및 조명 적용
      scene.background.copy(currentSkyColor);
      scene.fog.color.copy(currentFogColor);

      hemiLight.color.copy(currentHemiSky);
      hemiLight.groundColor.copy(currentHemiGround);
      hemiLight.intensity = hemiInt;

      mainLight.color.copy(currentDirColor);
      mainLight.intensity = dirInt;

      // 4. 태양 & 달 궤도 공전 위치 계산
      // 06:00(동쪽 지평선), 12:00(남중 정오), 18:00(서쪽 일몰), 24:00(한밤중)
      const sunAngle = ((time - 6.0) / 24.0) * Math.PI * 2;
      const orbitRadius = 48.0;
      const orbitHeight = 32.0;

      const sunX = -Math.cos(sunAngle) * orbitRadius;
      const sunY = Math.sin(sunAngle) * orbitHeight;
      const sunZ = Math.sin(sunAngle) * 8.0 - 10.0;

      sunGroup.position.set(sunX, sunY, sunZ);
      sunHalo.lookAt(playerPos.x, playerPos.y, playerPos.z);
      sunGroup.visible = sunY > -4.0; // 지평선 아래로 내려가면 숨김

      // 달은 태양 반대편 (위상차 180도)
      const moonX = -sunX;
      const moonY = -sunY;
      const moonZ = -sunZ - 10.0;

      moonGroup.position.set(moonX, moonY, moonZ);
      moonGlow.lookAt(playerPos.x, playerPos.y, playerPos.z);
      moonGroup.visible = moonY > -4.0;

      // 천체 그룹의 중심을 플레이어 상공으로 부드럽게 추적
      skyGroup.position.set(playerPos.x, 0, playerPos.z);

      // 5. 방향광(Directional Light) 위치 및 타겟 설정
      // 낮에는 태양 쪽에서, 밤에는 달 쪽에서 비춘다
      const isDaytime = sunY >= 0;
      const lightSource = isDaytime ? sunGroup.position : moonGroup.position;

      // 그림자 떨림을 줄이기 위해 플레이어 위치를 2칸 단위로 스냅
      const snapX = Math.round(playerPos.x / 2) * 2;
      const snapZ = Math.round(playerPos.z / 2) * 2;

      mainLight.target.position.set(snapX, 0, snapZ);

      // 방향 벡터를 정규화하여 일정한 거리에서 그림자 광선 투사
      const dirNorm = lightSource.clone().normalize();
      const lightDistance = 24.0;
      mainLight.position.set(
        snapX + dirNorm.x * lightDistance,
        Math.max(10.0, lightDistance * Math.abs(dirNorm.y)),
        snapZ + dirNorm.z * lightDistance
      );

      // 밤/낮에 따른 그림자 강도 조절 (밤에는 부드러운 그림자)
      mainLight.shadow.intensity = isDaytime ? 0.45 : 0.32;
    }
  };
}
