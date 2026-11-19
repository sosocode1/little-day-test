import * as THREE from 'three';

const SKY = 0xfbeee4;
const SUN_OFFSET = new THREE.Vector3(8, 16, 12);

// 하늘색/안개/조명. 그림자는 플레이어 주변만 그리도록 태양이 플레이어를 따라간다.
export function createEnvironment(scene) {
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 32, 80);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe3ee, 1.7));

  const sun = new THREE.DirectionalLight(0xfff1dd, 1.0);
  sun.castShadow = true;
  sun.shadow.intensity = 0.45;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = cam.bottom = -16;
  cam.right = cam.top = 16;
  cam.near = 1;
  cam.far = 60;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);

  return {
    sun,
    update(playerPos) {
      // 2칸 단위로 스냅해 그림자 떨림을 줄인다
      const x = Math.round(playerPos.x / 2) * 2;
      const z = Math.round(playerPos.z / 2) * 2;
      sun.target.position.set(x, 0, z);
      sun.position.set(x + SUN_OFFSET.x, SUN_OFFSET.y, z + SUN_OFFSET.z);
    },
  };
}
