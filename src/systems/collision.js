// 단순 2D(XZ 평면) 충돌: 원형 / 회전 박스(OBB) 콜라이더 + 마을 경계.
// 콜라이더: { type:'circle', x, z, r } | { type:'box', x, z, hw, hd, rot }  (rot = Y축 회전)

// 원(pos, radius)이 콜라이더와 겹치면 밖으로 밀어낸다.
export function resolveCollisions(pos, radius, colliders) {
  for (let iter = 0; iter < 2; iter++) {
    for (const c of colliders) {
      if (c.type === 'circle') {
        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const min = c.r + radius;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.0001;
          pos.x = c.x + (dx / d) * min;
          pos.z = c.z + (dz / d) * min;
        }
      } else {
        pushOutOfBox(pos, radius, c);
      }
    }
  }
}

function pushOutOfBox(pos, radius, c) {
  const cos = Math.cos(c.rot);
  const sin = Math.sin(c.rot);
  const dx = pos.x - c.x;
  const dz = pos.z - c.z;
  // 월드 → 박스 로컬
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  const cx = Math.max(-c.hw, Math.min(c.hw, lx));
  const cz = Math.max(-c.hd, Math.min(c.hd, lz));
  let nx = lx - cx;
  let nz = lz - cz;
  const d2 = nx * nx + nz * nz;
  let px;
  let pz;
  if (d2 > 0) {
    if (d2 >= radius * radius) return;
    const d = Math.sqrt(d2);
    px = cx + (nx / d) * radius;
    pz = cz + (nz / d) * radius;
  } else {
    // 중심이 박스 안: 가장 가까운 면으로 탈출
    const ox = c.hw - Math.abs(lx);
    const oz = c.hd - Math.abs(lz);
    if (ox < oz) {
      px = Math.sign(lx || 1) * (c.hw + radius);
      pz = lz;
    } else {
      px = lx;
      pz = Math.sign(lz || 1) * (c.hd + radius);
    }
  }
  // 로컬 → 월드
  pos.x = c.x + px * cos + pz * sin;
  pos.z = c.z - px * sin + pz * cos;
}

// 마을 경계(원형) 밖으로 나가지 못하게 한다.
export function clampToBoundary(pos, boundaryRadius) {
  const d = Math.hypot(pos.x, pos.z);
  if (d > boundaryRadius) {
    pos.x *= boundaryRadius / d;
    pos.z *= boundaryRadius / d;
  }
}

// 실내 경계(사각 바운딩 박스) 밖으로 나가지 못하게 한다.
export function clampToBox(pos, radius, box) {
  pos.x = Math.max(box.minX + radius, Math.min(box.maxX - radius, pos.x));
  pos.z = Math.max(box.minZ + radius, Math.min(box.maxZ - radius, pos.z));
}

// 카메라 등 점이 콜라이더 안(또는 margin 이내)에 있는지
export function isBlocked(x, z, margin, colliders) {
  const p = { x, z };
  for (const c of colliders) {
    if (c.type === 'circle') {
      if (Math.hypot(x - c.x, z - c.z) < c.r + margin) return true;
    } else {
      const cos = Math.cos(c.rot);
      const sin = Math.sin(c.rot);
      const dx = p.x - c.x;
      const dz = p.z - c.z;
      const lx = dx * cos - dz * sin;
      const lz = dx * sin + dz * cos;
      if (Math.abs(lx) < c.hw + margin && Math.abs(lz) < c.hd + margin) return true;
    }
  }
  return false;
}
