import * as THREE from 'three';

const DISTANCE = 5;
const HEIGHT_OFFSET = 1.0;
const MIN_PITCH = 0.1;
const MAX_PITCH = 1.3;
const SENSITIVITY = 0.005;

// 3인칭 추적 카메라 (yaw/pitch는 마우스 드래그로 조작)
export function createFollowCamera(camera) {
  const state = { yaw: 0, pitch: 0.5 };
  const target = new THREE.Vector3();

  return {
    get yaw() {
      return state.yaw;
    },
    set yaw(val) {
      state.yaw = val;
    },
    get pitch() {
      return state.pitch;
    },
    set pitch(val) {
      state.pitch = THREE.MathUtils.clamp(val, MIN_PITCH, MAX_PITCH);
    },
    setOrientation(yaw, pitch = 0.45) {
      state.yaw = yaw;
      if (pitch != null) {
        state.pitch = THREE.MathUtils.clamp(pitch, MIN_PITCH, MAX_PITCH);
      }
    },
    snap(playerPos) {
      target.set(playerPos.x, playerPos.y + HEIGHT_OFFSET, playerPos.z);
      const offset = new THREE.Vector3(
        Math.sin(state.yaw) * Math.cos(state.pitch),
        Math.sin(state.pitch),
        Math.cos(state.yaw) * Math.cos(state.pitch)
      ).multiplyScalar(DISTANCE);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
    },
    update(playerPos, look, dt) {
      state.yaw -= look.dx * SENSITIVITY;
      state.pitch = THREE.MathUtils.clamp(state.pitch + look.dy * SENSITIVITY, MIN_PITCH, MAX_PITCH);

      target.set(playerPos.x, playerPos.y + HEIGHT_OFFSET, playerPos.z);
      const offset = new THREE.Vector3(
        Math.sin(state.yaw) * Math.cos(state.pitch),
        Math.sin(state.pitch),
        Math.cos(state.yaw) * Math.cos(state.pitch)
      ).multiplyScalar(DISTANCE);

      const desired = target.clone().add(offset);
      camera.position.lerp(desired, 1 - Math.exp(-12 * dt));
      camera.lookAt(target);
    },
  };
}
