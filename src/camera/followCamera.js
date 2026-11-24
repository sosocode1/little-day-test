import * as THREE from 'three';

const DEFAULT_DISTANCE = 5.0;
const HEIGHT_OFFSET = 1.0;
const MIN_PITCH = 0.1;
const MAX_PITCH = 1.3;
const SENSITIVITY = 0.005;
const ZOOM_SENSITIVITY = 0.003;

// 3인칭 추적 카메라 (yaw/pitch는 마우스 드래그, 줌은 마우스 휠, 실내/실외 가변 범위 및 영역 바운드 지원)
export function createFollowCamera(camera) {
  const state = {
    yaw: 0,
    pitch: 0.5,
    distance: DEFAULT_DISTANCE,
    targetDistance: DEFAULT_DISTANCE,
    minDistance: 2.0,
    maxDistance: 8.5,
    bounds: null
  };
  const target = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const fadedMeshes = new Map(); // mesh -> origMaterial
  let occluders = [];
  let occluderRoot = null;

  function fadeMesh(mesh) {
    if (fadedMeshes.has(mesh)) return;
    const origMat = mesh.material;
    fadedMeshes.set(mesh, origMat);

    const mat = origMat.clone();
    mat.transparent = true;
    mat.opacity = 0.22;
    mat.depthWrite = false;
    mesh.material = mat;
  }

  function restoreMesh(mesh) {
    const origMat = fadedMeshes.get(mesh);
    if (!origMat) return;
    mesh.material.dispose();
    mesh.material = origMat;
    fadedMeshes.delete(mesh);
  }

  function clearAllFaded() {
    for (const [mesh, origMat] of fadedMeshes.entries()) {
      mesh.material.dispose();
      mesh.material = origMat;
    }
    fadedMeshes.clear();
  }

  function clampToBounds(pos) {
    if (!state.bounds) return;
    if (state.bounds.minX != null && state.bounds.maxX != null) {
      pos.x = THREE.MathUtils.clamp(pos.x, state.bounds.minX, state.bounds.maxX);
    }
    if (state.bounds.minY != null && state.bounds.maxY != null) {
      pos.y = THREE.MathUtils.clamp(pos.y, state.bounds.minY, state.bounds.maxY);
    }
    if (state.bounds.minZ != null && state.bounds.maxZ != null) {
      pos.z = THREE.MathUtils.clamp(pos.z, state.bounds.minZ, state.bounds.maxZ);
    }
  }

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
    get distance() {
      return state.distance;
    },
    set distance(val) {
      const clamped = THREE.MathUtils.clamp(val, state.minDistance, state.maxDistance);
      state.targetDistance = clamped;
      state.distance = clamped;
    },
    get targetDistance() {
      return state.targetDistance;
    },
    get minDistance() {
      return state.minDistance;
    },
    get maxDistance() {
      return state.maxDistance;
    },
    setDistance(d, immediate = false) {
      const clamped = THREE.MathUtils.clamp(d, state.minDistance, state.maxDistance);
      state.targetDistance = clamped;
      if (immediate) {
        state.distance = clamped;
      }
    },
    setDistanceRange(min, max) {
      state.minDistance = Math.max(0.5, min);
      state.maxDistance = Math.max(state.minDistance, max);
      state.targetDistance = THREE.MathUtils.clamp(state.targetDistance, state.minDistance, state.maxDistance);
      state.distance = THREE.MathUtils.clamp(state.distance, state.minDistance, state.maxDistance);
    },
    zoom(delta) {
      if (!delta) return;
      const safeDelta = THREE.MathUtils.clamp(delta, -400, 400);
      state.targetDistance = THREE.MathUtils.clamp(
        state.targetDistance + safeDelta * ZOOM_SENSITIVITY,
        state.minDistance,
        state.maxDistance
      );
    },
    setBounds(box) {
      state.bounds = box ? { ...box } : null;
    },
    clearBounds() {
      state.bounds = null;
    },
    getBounds() {
      return state.bounds;
    },
    setOccluders(list, rootGroup = null) {
      clearAllFaded();
      occluders = Array.isArray(list) ? list : [];
      occluderRoot = rootGroup || null;
    },
    clearOccluders() {
      clearAllFaded();
      occluders = [];
      occluderRoot = null;
    },
    setOrientation(yaw, pitch = 0.45) {
      state.yaw = yaw;
      if (pitch != null) {
        state.pitch = THREE.MathUtils.clamp(pitch, MIN_PITCH, MAX_PITCH);
      }
    },
    snap(playerPos) {
      state.distance = state.targetDistance;
      target.set(playerPos.x, playerPos.y + HEIGHT_OFFSET, playerPos.z);
      const offset = new THREE.Vector3(
        Math.sin(state.yaw) * Math.cos(state.pitch),
        Math.sin(state.pitch),
        Math.cos(state.yaw) * Math.cos(state.pitch)
      ).multiplyScalar(state.distance);
      camera.position.copy(target).add(offset);
      clampToBounds(camera.position);

      if (occluders && occluders.length > 0) {
        const rayDir = camera.position.clone().sub(target);
        const dist = rayDir.length();
        if (dist > 0.1) {
          rayDir.normalize();
          raycaster.set(target, rayDir);
          raycaster.near = 0.1;
          raycaster.far = dist;
          const hits = raycaster.intersectObjects(occluders, true);
          if (hits.length > 0) {
            const safeDist = Math.max(state.minDistance, hits[0].distance - 0.25);
            if (safeDist < dist) {
              camera.position.copy(target).addScaledVector(rayDir, safeDist);
              clampToBounds(camera.position);
            }
          }
        }
      }

      camera.lookAt(target);
    },
    update(playerPos, look, dt, zoomDelta = 0) {
      state.yaw -= look.dx * SENSITIVITY;
      state.pitch = THREE.MathUtils.clamp(state.pitch + look.dy * SENSITIVITY, MIN_PITCH, MAX_PITCH);

      if (zoomDelta) {
        const safeDelta = THREE.MathUtils.clamp(zoomDelta, -400, 400);
        state.targetDistance = THREE.MathUtils.clamp(
          state.targetDistance + safeDelta * ZOOM_SENSITIVITY,
          state.minDistance,
          state.maxDistance
        );
      }

      // 부드러운 거리 보간 (lerp)
      state.distance += (state.targetDistance - state.distance) * (1 - Math.exp(-12 * dt));

      target.set(playerPos.x, playerPos.y + HEIGHT_OFFSET, playerPos.z);
      const offset = new THREE.Vector3(
        Math.sin(state.yaw) * Math.cos(state.pitch),
        Math.sin(state.pitch),
        Math.cos(state.yaw) * Math.cos(state.pitch)
      ).multiplyScalar(state.distance);

      const desired = target.clone().add(offset);
      clampToBounds(desired);

      // 장애물 충돌 감지 및 가림 투명도 처리 (Raycasting)
      const currentOccludingMeshes = new Set();
      if (occluders && occluders.length > 0) {
        const rayDir = desired.clone().sub(target);
        const desiredDist = rayDir.length();
        if (desiredDist > 0.1) {
          rayDir.normalize();
          raycaster.set(target, rayDir);
          raycaster.near = 0.1;
          raycaster.far = desiredDist;
          const hits = raycaster.intersectObjects(occluders, true);
          if (hits.length > 0) {
            const closest = hits[0];
            // 카메라와 장애물 사이에 안전 여유 거리(offset 0.25m) 적용하여 당김
            const safeDist = Math.max(state.minDistance, closest.distance - 0.25);
            if (safeDist < desiredDist) {
              desired.copy(target).addScaledVector(rayDir, safeDist);
              clampToBounds(desired);
            }

            // 시야를 가리는 장애물 오브젝트(및 그 가구 그룹 전체) 반투명 처리
            for (const hit of hits) {
              let topObj = hit.object;
              while (
                topObj.parent &&
                topObj.parent !== occluderRoot &&
                topObj.parent.type !== 'Scene'
              ) {
                topObj = topObj.parent;
              }
              topObj.traverse((child) => {
                if (child.isMesh) {
                  currentOccludingMeshes.add(child);
                }
              });
            }
          }
        }
      }

      // 더 이상 가리지 않는 오브젝트는 원래 불투명 재질로 즉시 복원
      for (const [mesh] of fadedMeshes.entries()) {
        if (!currentOccludingMeshes.has(mesh)) {
          restoreMesh(mesh);
        }
      }
      // 현재 가리고 있는 오브젝트 반투명 처리
      for (const mesh of currentOccludingMeshes) {
        fadeMesh(mesh);
      }

      camera.position.lerp(desired, 1 - Math.exp(-12 * dt));
      clampToBounds(camera.position);
      camera.lookAt(target);
    },
  };
}
