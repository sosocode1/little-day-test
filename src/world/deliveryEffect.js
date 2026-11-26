// LITTLE DAY NPC 아이템 전달 3D 연출 매니저
// - 플레이어가 NPC에게 꽃을 건네는 포물선 전달 연출 + NPC 기쁨 반응 + 꽃잎/반짝임 파티클 버스트
import * as THREE from 'three';

const petalGeo = new THREE.SphereGeometry(0.07, 10, 8);
const sparkleGeo = new THREE.OctahedronGeometry(0.065, 0);

function buildDeliveryBouquetMesh() {
  const group = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xff8fad, roughness: 0.9, metalness: 0 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xffdf70, roughness: 0.9, metalness: 0 });
  const wrapMat = new THREE.MeshStandardMaterial({ color: 0xfff5eb, roughness: 1, metalness: 0 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd6e6, transparent: true, opacity: 0.4 });

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 12), wrapMat);
  cone.rotation.x = Math.PI;
  cone.position.y = -0.05;
  group.add(cone);

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), petalMat);
    flower.position.set(Math.cos(a) * 0.08, 0.12, Math.sin(a) * 0.08);
    group.add(flower);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), centerMat);
    core.position.set(Math.cos(a) * 0.08, 0.16, Math.sin(a) * 0.08);
    group.add(core);
  }

  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), glowMat);
  glow.position.y = 0.08;
  group.add(glow);

  return { group, materials: [petalMat, centerMat, wrapMat, glowMat] };
}

export function createDeliveryEffectManager(scene) {
  const activeDeliveries = [];
  const activeBursts = [];

  function spawnCelebrationBurst(origin) {
    const group = new THREE.Group();
    group.position.set(origin.x, (origin.y || 0) + 1.05, origin.z);

    const palette = [0xff8fad, 0xffc2d6, 0xffe27a, 0xffffff, 0xb8e4ff];
    const particles = [];
    const COUNT = 26;

    for (let i = 0; i < COUNT; i++) {
      const isPetal = i % 2 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(isPetal ? petalGeo : sparkleGeo, mat);
      if (isPetal) {
        mesh.scale.set(1.3, 0.42, 0.9);
      } else {
        mesh.scale.setScalar(1.05);
      }

      const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const speed = 1.0 + Math.random() * 1.45;
      const vy = 1.6 + Math.random() * 1.8;

      group.add(mesh);
      particles.push({
        mesh,
        mat,
        isPetal,
        vx: Math.cos(angle) * speed,
        vy,
        vz: Math.sin(angle) * speed,
        spinX: (Math.random() - 0.5) * 9,
        spinY: (Math.random() - 0.5) * 9
      });
    }

    scene.add(group);
    activeBursts.push({
      group,
      particles,
      age: 0,
      duration: 1.55
    });
  }

  return {
    // 플레이어 → NPC 꽃 전달 포물선 연출 + 도착 시 NPC 기쁨 반응 + 꽃잎/반짝임 버스트
    playItemDelivery(player, npc) {
      if (!player || !npc || !npc.position) return;

      // 플레이어가 NPC 쪽을 바라보며 건네는 각도 정렬
      const dx = npc.position.x - player.position.x;
      const dz = npc.position.z - player.position.z;
      player.rotation.y = Math.atan2(dx, dz);

      const start = new THREE.Vector3(player.position.x, 0.95, player.position.z);
      const end = new THREE.Vector3(npc.position.x, 1.0, npc.position.z);
      const bouquet = buildDeliveryBouquetMesh();
      bouquet.group.position.copy(start);
      scene.add(bouquet.group);

      activeDeliveries.push({
        bouquet,
        start,
        end,
        npc,
        age: 0,
        duration: 0.52,
        arrived: false
      });
    },

    update(dt) {
      // 1. 포물선 꽃 전달 애니메이션
      for (let i = activeDeliveries.length - 1; i >= 0; i--) {
        const d = activeDeliveries[i];
        d.age += dt;
        const t = Math.min(1, d.age / d.duration);

        d.bouquet.group.position.lerpVectors(d.start, d.end, t);
        d.bouquet.group.position.y += Math.sin(t * Math.PI) * 0.72;
        d.bouquet.group.rotation.y += dt * 7;
        const scale = t < 0.8 ? 1 : Math.max(0.05, 1 - (t - 0.8) / 0.2);
        d.bouquet.group.scale.setScalar(scale);

        if (t >= 1 && !d.arrived) {
          d.arrived = true;
          if (d.npc && typeof d.npc.playJoyReaction === 'function') {
            d.npc.playJoyReaction(2.3);
          }
          spawnCelebrationBurst(d.npc.position);
          scene.remove(d.bouquet.group);
          for (const m of d.bouquet.materials) m.dispose();
          activeDeliveries.splice(i, 1);
        }
      }

      // 2. 꽃잎 & 반짝임 파티클 버스트 갱신
      for (let i = activeBursts.length - 1; i >= 0; i--) {
        const b = activeBursts[i];
        b.age += dt;
        const progress = Math.min(1, b.age / b.duration);

        for (const p of b.particles) {
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          // 꽃잎은 살랑살랑 천천히 낙하, 반짝임은 살짝 더 가볍게
          p.vy -= (p.isPetal ? 2.1 : 2.8) * dt;
          p.vx *= 1 - dt * 0.8;
          p.vz *= 1 - dt * 0.8;
          p.mesh.rotation.x += p.spinX * dt;
          p.mesh.rotation.y += p.spinY * dt;
          p.mat.opacity = Math.max(0, 1 - progress * progress);
        }

        if (progress >= 1) {
          scene.remove(b.group);
          for (const p of b.particles) p.mat.dispose();
          activeBursts.splice(i, 1);
        }
      }
    }
  };
}
