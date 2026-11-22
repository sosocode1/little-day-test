// LITTLE DAY - 단독 캐릭터 턴어라운드 및 커스터마이징 검증 스튜디오
import * as THREE from 'three';
import { createCharacter } from './character.js';

const stage = document.getElementById('stage');
const controlsEl = document.getElementById('controls');

// 1. 렌더러 & 따뜻한 클레이 스튜디오 씬
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8eee4);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 50);

// 2. 부드러운 3점 클레이 스튜디오 조명 (과도한 그림자 및 번들거림 방지)
const hemiLight = new THREE.HemisphereLight(0xfff9f0, 0xe8d4c4, 1.35);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.15);
keyLight.position.set(2.4, 4.2, 3.6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.bias = -0.0008;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 12;
keyLight.shadow.camera.left = -2;
keyLight.shadow.camera.right = 2;
keyLight.shadow.camera.top = 2.5;
keyLight.shadow.camera.bottom = -1;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffe6d8, 0.45);
fillLight.position.set(-2.8, 2.2, 1.8);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xfff4e0, 0.40);
rimLight.position.set(0, 2.8, -3.5);
scene.add(rimLight);

// 3. 스튜디오 바닥 받침대 (발바닥 y=0 접지 검증용)
const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.12, 0.06, 48),
  new THREE.MeshStandardMaterial({ color: 0xf1e1d0, roughness: 0.95, metalness: 0 })
);
floor.position.y = -0.03;
floor.receiveShadow = true;
scene.add(floor);

// 4. 메인 캐릭터 생성
const character = createCharacter('female');
scene.add(character.root);

// 5. 오빗 카메라 상태 (정면: yaw = 0 -> +Z 방향에서 정면 응시)
let yaw = 0;
let pitch = 0.14;
let distance = 3.25;
let targetYaw = 0;
let targetPitch = 0.14;
let targetDist = 3.25;
let isWalking = false;
let dragging = false;
let lastX = 0;
let lastY = 0;

stage.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointerup', () => { dragging = false; });
stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  targetYaw -= dx * 0.008;
  targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.006, -0.25, 0.9);
});
stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  targetDist = THREE.MathUtils.clamp(targetDist + e.deltaY * 0.0025, 1.6, 5.2);
}, { passive: false });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. 우측 검증 컨트롤 패널
function addSection(title, builder) {
  const sec = document.createElement('div');
  const h = document.createElement('div');
  h.className = 'section-title';
  h.textContent = title;
  sec.appendChild(h);
  builder(sec);
  controlsEl.appendChild(sec);
}

// (1) 턴어라운드 뷰 프리셋
addSection('카메라 턴어라운드', (sec) => {
  const row = document.createElement('div');
  row.className = 'btn-row';
  const views = [
    { label: '정면 전신', yaw: 0, pitch: 0.12, dist: 3.15 },
    { label: '정면 얼굴', yaw: 0, pitch: 0.08, dist: 1.78 },
    { label: '45° 얼굴', yaw: -0.78, pitch: 0.08, dist: 1.82 },
    { label: '측면 얼굴', yaw: -Math.PI * 0.5, pitch: 0.08, dist: 1.85 },
    { label: '측면 전신', yaw: -Math.PI * 0.5, pitch: 0.12, dist: 3.2 },
    { label: '후면 전신', yaw: Math.PI, pitch: 0.12, dist: 3.2 },
  ];
  views.forEach((v, i) => {
    const btn = document.createElement('button');
    btn.className = `chip ${i === 0 ? 'active' : ''}`;
    btn.textContent = v.label;
    btn.onclick = () => {
      row.querySelectorAll('.chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      targetYaw = v.yaw;
      targetPitch = v.pitch;
      targetDist = v.dist;
    };
    row.appendChild(btn);
  });
  sec.appendChild(row);
});

// (2) 애니메이션 & 기본 소품 토글
addSection('동작 & 소품', (sec) => {
  const row = document.createElement('div');
  row.className = 'btn-row';

  const idleBtn = document.createElement('button');
  idleBtn.className = 'chip active';
  idleBtn.textContent = 'Idle 대기';
  const walkBtn = document.createElement('button');
  walkBtn.className = 'chip';
  walkBtn.textContent = 'Walk 걷기';

  idleBtn.onclick = () => { isWalking = false; idleBtn.classList.add('active'); walkBtn.classList.remove('active'); };
  walkBtn.onclick = () => { isWalking = true; walkBtn.classList.add('active'); idleBtn.classList.remove('active'); };

  const hatBtn = document.createElement('button');
  hatBtn.className = 'chip active';
  hatBtn.textContent = '베레모 ON';
  hatBtn.onclick = () => {
    const cur = character.getAppearance().hatVisible;
    character.setAppearance({ hatVisible: !cur });
    hatBtn.classList.toggle('active', !cur);
    hatBtn.textContent = !cur ? '베레모 ON' : '베레모 OFF';
  };

  const bagBtn = document.createElement('button');
  bagBtn.className = 'chip active';
  bagBtn.textContent = '크로스백 ON';
  bagBtn.onclick = () => {
    const cur = character.getAppearance().bagVisible;
    character.setAppearance({ bagVisible: !cur });
    bagBtn.classList.toggle('active', !cur);
    bagBtn.textContent = !cur ? '크로스백 ON' : '크로스백 OFF';
  };

  row.append(idleBtn, walkBtn, hatBtn, bagBtn);
  sec.appendChild(row);
});

// (3) 헤어스타일 4종
addSection('헤어스타일', (sec) => {
  const row = document.createElement('div');
  row.className = 'btn-row';
  const styles = [
    { id: 'longWave', label: '기본 웨이브' },
    { id: 'shortBob', label: '단발 보브' },
    { id: 'twinBraids', label: '양갈래' },
    { id: 'topBun', label: '묶음머리' },
  ];
  styles.forEach((st, i) => {
    const btn = document.createElement('button');
    btn.className = `chip ${i === 0 ? 'active' : ''}`;
    btn.textContent = st.label;
    btn.onclick = () => {
      row.querySelectorAll('.chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      character.setAppearance({ hairStyle: st.id });
    };
    row.appendChild(btn);
  });
  sec.appendChild(row);
});

// (4) 표정 6종
addSection('기본 표정', (sec) => {
  const row = document.createElement('div');
  row.className = 'btn-row';
  const exps = [
    { id: 'smile', label: '미소' },
    { id: 'happy', label: '활짝 웃음' },
    { id: 'excited', label: '신남' },
    { id: 'surprised', label: '놀람' },
    { id: 'thinking', label: '생각 중' },
    { id: 'sleepy', label: '졸림' },
  ];
  exps.forEach((ex, i) => {
    const btn = document.createElement('button');
    btn.className = `chip ${i === 0 ? 'active' : ''}`;
    btn.textContent = ex.label;
    btn.onclick = () => {
      row.querySelectorAll('.chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      character.setAppearance({ expression: ex.id });
    };
    row.appendChild(btn);
  });
  sec.appendChild(row);
});

// (5) 눈 스타일 & 컬러
addSection('눈 스타일', (sec) => {
  const row = document.createElement('div');
  row.className = 'btn-row';
  [
    { id: 'round', label: '동근 눈' },
    { id: 'upturned', label: '살짝 올라간 눈' },
    { id: 'dewy', label: '촉촉한 눈' },
  ].forEach((es, i) => {
    const btn = document.createElement('button');
    btn.className = `chip ${i === 0 ? 'active' : ''}`;
    btn.textContent = es.label;
    btn.onclick = () => {
      row.querySelectorAll('.chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      character.setAppearance({ eyeStyle: es.id });
    };
    row.appendChild(btn);
  });
  sec.appendChild(row);
});

addSection('눈동자 컬러', (sec) => {
  const row = document.createElement('div');
  row.className = 'swatches';
  [0x523225, 0x9b6434, 0x5c8554, 0x567aa6, 0x876ca6].forEach((c, i) => {
    const dot = document.createElement('div');
    dot.className = `swatch ${i === 0 ? 'active' : ''}`;
    dot.style.background = '#' + c.toString(16).padStart(6, '0');
    dot.onclick = () => {
      row.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
      dot.classList.add('active');
      character.setAppearance({ eyeColor: c });
    };
    row.appendChild(dot);
  });
  sec.appendChild(row);
});

addSection('피부 톤', (sec) => {
  const row = document.createElement('div');
  row.className = 'swatches';
  [0xffe4d2, 0xffece0, 0xf3cca8].forEach((c, i) => {
    const dot = document.createElement('div');
    dot.className = `swatch ${i === 0 ? 'active' : ''}`;
    dot.style.background = '#' + c.toString(16).padStart(6, '0');
    dot.onclick = () => {
      row.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
      dot.classList.add('active');
      character.setAppearance({ skinColor: c });
    };
    row.appendChild(dot);
  });
  sec.appendChild(row);
});

// 7. 렌더 루프
let last = performance.now();
const lookTarget = new THREE.Vector3(0, 0.80, 0);

renderer.setAnimationLoop((now) => {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  yaw += (targetYaw - yaw) * (1 - Math.exp(-10 * dt));
  pitch += (targetPitch - pitch) * (1 - Math.exp(-10 * dt));
  distance += (targetDist - distance) * (1 - Math.exp(-10 * dt));

  const lookY = distance < 2.2 ? 1.16 : 0.80;
  lookTarget.y += (lookY - lookTarget.y) * (1 - Math.exp(-10 * dt));

  camera.position.set(
    Math.sin(yaw) * Math.cos(pitch) * distance,
    lookTarget.y + Math.sin(pitch) * distance,
    Math.cos(yaw) * Math.cos(pitch) * distance
  );
  camera.lookAt(lookTarget);

  character.update(dt, isWalking);
  renderer.render(scene, camera);
});
