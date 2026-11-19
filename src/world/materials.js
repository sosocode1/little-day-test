import * as THREE from 'three';

// 마을 공용 재질: 무광 클레이. 같은 색은 하나만 만들어 공유한다.
const cache = new Map();

export function clay(color) {
  if (!cache.has(color)) {
    cache.set(color, new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 }));
  }
  return cache.get(color);
}

// 가로등 불빛 등 은은하게 빛나는 재질 (실제 광원은 쓰지 않는다)
export function glow(color) {
  const key = `glow-${color}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, roughness: 1 })
    );
  }
  return cache.get(key);
}

// 간단한 시드 난수 (배치가 매번 같도록)
export function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
