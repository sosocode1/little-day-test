import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(6, 5, 8);
  camera.lookAt(0, 0.8, 0);
  return camera;
}
