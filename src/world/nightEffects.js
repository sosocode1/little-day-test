// LITTLE DAY 야간 연출 관리 모듈 (가로등 점등, 창문 불빛, 반딧불이 시스템)
import * as THREE from 'three';

export function createNightEffects(scene, villageGroup) {
  const lamps = [];
  const windows = [];

  // 1. 마을 씬에서 가로등 및 창문 메쉬 수집
  villageGroup.traverse((obj) => {
    if (obj.name === 'lamp') {
      const bulb = obj.getObjectByName('lamp-bulb');
      const light = obj.getObjectByName('lamp-light');
      if (bulb) {
        lamps.push({ bulb, light });
      }
    } else if (obj.name === 'window-glass' && obj.isMesh) {
      windows.push({
        mesh: obj,
        baseColor: obj.material.color.clone()
      });
    }
  });

  // 2. 반딧불이 (Fireflies) 파티클 시스템 생성
  const firefliesGroup = new THREE.Group();
  firefliesGroup.name = 'fireflies-system';

  const FIREFLY_COUNT = 45;
  const fireflyData = [];
  const fireflyGeo = new THREE.SphereGeometry(0.048, 8, 6);

  // 반딧불이들이 서식할 아기자기한 주요 스팟들 (광장 화단, 분수대 주변, 별장 정원, 산책로 숲)
  const spawnZones = [
    { x: 0, z: 0, r: 4.5 },       // 분수대 광장
    { x: -14, z: -7, r: 5.0 },    // 플레이어 별장 정원
    { x: -5, z: 9, r: 3.5 },      // 입구 서쪽 화단
    { x: 5, z: 9, r: 3.5 },       // 입구 동쪽 화단
    { x: 0, z: -15, r: 4.0 },     // 북쪽 산책로 벚나무
    { x: 14, z: -8, r: 4.5 },     // 이웃집 정원
  ];

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const zone = spawnZones[i % spawnZones.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * zone.r;
    const baseX = zone.x + Math.cos(angle) * dist;
    const baseZ = zone.z + Math.sin(angle) * dist;
    const baseY = 0.5 + Math.random() * 1.8; // 지상 0.5m ~ 2.3m

    const mat = new THREE.MeshBasicMaterial({
      color: 0xd4ff70, // 은은한 형광 연두빛 노랑
      transparent: true,
      opacity: 0
    });
    const mesh = new THREE.Mesh(fireflyGeo, mat);
    mesh.position.set(baseX, baseY, baseZ);
    firefliesGroup.add(mesh);

    fireflyData.push({
      mesh,
      mat,
      basePos: new THREE.Vector3(baseX, baseY, baseZ),
      speedX: 0.6 + Math.random() * 0.8,
      speedY: 0.8 + Math.random() * 1.0,
      speedZ: 0.5 + Math.random() * 0.7,
      blinkSpeed: 2.5 + Math.random() * 3.0,
      phaseOffset: Math.random() * Math.PI * 2
    });
  }

  scene.add(firefliesGroup);

  let animTime = 0;
  const DAY_WINDOW_COLOR = new THREE.Color(0xcfeaf7);
  const NIGHT_WINDOW_COLOR = new THREE.Color(0xffe6a3);
  const NIGHT_WINDOW_EMISSIVE = new THREE.Color(0xff9838);

  return {
    firefliesGroup,

    // 야간 요소 업데이트 (가로등, 창문, 반딧불이)
    update(dt, timeSystem, isIndoor = false) {
      animTime += dt;
      const time = timeSystem.getTime() % 24.0;

      // 1. 야간 계수(nightFactor: 0.0 ~ 1.0) 계산
      // 06:00 ~ 18:00: 0.0 (낮)
      // 18:00 ~ 20:00: 0.0 -> 1.0 (저녁 점등)
      // 20:00 ~ 04:30: 1.0 (한밤중)
      // 04:30 ~ 06:00: 1.0 -> 0.0 (새벽 소등)
      let nightFactor = 0;
      if (time >= 20.0 || time < 4.5) {
        nightFactor = 1.0;
      } else if (time >= 18.0 && time < 20.0) {
        nightFactor = (time - 18.0) / 2.0;
      } else if (time >= 4.5 && time < 6.0) {
        nightFactor = 1.0 - (time - 4.5) / 1.5;
      }

      // 2. 가로등 점등/소등 제어
      const bulbIntensity = 0.1 + nightFactor * 2.2;
      const lightIntensity = nightFactor * 1.5;

      for (const lamp of lamps) {
        if (lamp.bulb && lamp.bulb.material) {
          lamp.bulb.material.emissiveIntensity = bulbIntensity;
        }
        if (lamp.light) {
          lamp.light.intensity = lightIntensity;
        }
      }

      // 3. 집 창문 불빛 제어 (은은한 실내 조명 연출)
      for (const win of windows) {
        const mat = win.mesh.material;
        if (!mat) continue;

        if (nightFactor > 0.02) {
          mat.color.lerpColors(DAY_WINDOW_COLOR, NIGHT_WINDOW_COLOR, nightFactor);
          mat.emissive.copy(NIGHT_WINDOW_EMISSIVE);
          mat.emissiveIntensity = nightFactor * 0.95;
        } else {
          mat.color.copy(win.baseColor);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }

      // 4. 반딧불이 부유 및 깜빡임 애니메이션 (야간에만 활성화)
      if (nightFactor > 0.02 && !isIndoor && villageGroup.visible) {
        firefliesGroup.visible = true;

        for (let i = 0; i < fireflyData.length; i++) {
          const f = fireflyData[i];
          const t = animTime + f.phaseOffset;

          // 3차원 유기적 부유 곡선 이동
          f.mesh.position.x = f.basePos.x + Math.sin(t * f.speedX) * 0.75;
          f.mesh.position.y = f.basePos.y + Math.sin(t * f.speedY) * 0.4 + 0.15;
          f.mesh.position.z = f.basePos.z + Math.cos(t * f.speedZ) * 0.75;

          // 부드러운 깜빡임 (생체 발광 느낌)
          const blink = Math.sin(t * f.blinkSpeed) * 0.5 + 0.5;
          f.mat.opacity = (0.2 + blink * 0.8) * nightFactor;
        }
      } else {
        firefliesGroup.visible = false;
      }
    }
  };
}
