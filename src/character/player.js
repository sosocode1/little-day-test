import * as THREE from 'three';
import { createCharacter } from './character.js';
import { resolveCollisions, clampToBoundary, clampToBox } from '../systems/collision.js';

const SPEED = 5;
export const PLAYER_RADIUS = 0.3;
const TURN_SPEED = 14;

// type: 'female' | 'male' (추후 캐릭터 선택 UI에서 전달)
export function createPlayer(type = 'female', spawnPos = null) {
  const group = new THREE.Group();
  const character = createCharacter(type);
  group.add(character.root);
  group.userData.character = character;
  group.equipFlowerPin = () => character.equipFlowerPin();
  group.equipAccessory = (item) => character.equipAccessory(item);
  group.unequipAccessory = (slotType) => character.unequipAccessory(slotType);
  group.getEquippedAccessory = (slotType) => character.getEquippedAccessory(slotType);
  if (spawnPos) {
    group.position.copy(spawnPos);
  } else {
    group.position.set(0, 0, 18);
  }
  return group;
}

// cameraYaw: 카메라 기준 방향으로 이동. 이동 중이면 true 반환
export function updatePlayer(player, axis, cameraYaw, dt, colliders = [], boundaryRadius = null) {
  const moving = axis.x !== 0 || axis.y !== 0;

  if (moving) {
    // 카메라가 바라보는 전방/우측 벡터 (XZ 평면)
    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const dir = forward.multiplyScalar(axis.y).add(right.multiplyScalar(axis.x)).normalize();

    player.position.addScaledVector(dir, SPEED * dt);

    // 이동 방향을 향해 부드럽게 회전 (최단 각도)
    const target = Math.atan2(dir.x, dir.z);
    let diff = target - player.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    player.rotation.y += diff * (1 - Math.exp(-TURN_SPEED * dt));

    // 건물 및 프랍 충돌 해결
    if (colliders && colliders.length > 0) {
      resolveCollisions(player.position, PLAYER_RADIUS, colliders);
    }

    // 마을 또는 실내 경계 안으로 제한
    if (boundaryRadius != null) {
      if (typeof boundaryRadius === 'number') {
        clampToBoundary(player.position, boundaryRadius - PLAYER_RADIUS);
      } else if (boundaryRadius.minX !== undefined) {
        clampToBox(player.position, PLAYER_RADIUS, boundaryRadius);
      }
    }
    player.position.y = 0;
  }

  player.userData.character.update(dt, moving);
  return moving;
}
