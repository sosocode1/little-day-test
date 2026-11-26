// 키보드 입력과 마우스 드래그(카메라 회전), 휠 줌 상태 관리
export function createInput(domElement) {
  const keys = new Set();
  const look = { dx: 0, dy: 0 };
  let zoomDelta = 0;
  let dragging = false;
  let interactTriggered = false;
  let inventoryTriggered = false;

  window.addEventListener('keydown', (e) => {
    if (!keys.has(e.code)) {
      if (e.code === 'KeyE' || e.code === 'Space') {
        interactTriggered = true;
      }
      if (e.code === 'KeyI') {
        inventoryTriggered = true;
      }
    }
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  domElement.addEventListener('pointerdown', (e) => {
    dragging = true;
    domElement.setPointerCapture(e.pointerId);
  });
  domElement.addEventListener('pointerup', () => (dragging = false));
  domElement.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    look.dx += e.movementX;
    look.dy += e.movementY;
  });

  // 마우스 휠 줌 (위로 굴리면 줌 인, 아래로 굴리면 줌 아웃)
  // 스크롤 가능한 UI 모달 및 오버레이 상단에 마우스가 있을 때는 카메라 줌 제외
  window.addEventListener(
    'wheel',
    (e) => {
      const isOverUI =
        e.target &&
        typeof e.target.closest === 'function' &&
        e.target.closest(
          '.inv-overlay, .inv-modal, .wardrobe-overlay, .wardrobe-card, .vanity-overlay, .vanity-card, .time-control-panel, .dialogue-stage, .dialogue-modal, .dialogue-choices-panel, .quest-panel, .quest-stack, .quest-hud-container, .quest-journal-backdrop, .worldmap-overlay, .worldmap-modal, .reward-modal-backdrop, .delivery-modal-backdrop, .clue-modal-backdrop, .lighthouse-puzzle-backdrop'
        );
      if (isOverUI) return;

      e.preventDefault();
      zoomDelta += e.deltaY;
    },
    { passive: false }
  );

  const down = (...codes) => codes.some((c) => keys.has(c));

  return {
    // 이동 축: x = 좌(-1)/우(+1), y = 앞(+1)/뒤(-1)
    getMoveAxis() {
      return {
        x: (down('KeyD', 'ArrowRight') ? 1 : 0) - (down('KeyA', 'ArrowLeft') ? 1 : 0),
        y: (down('KeyW', 'ArrowUp') ? 1 : 0) - (down('KeyS', 'ArrowDown') ? 1 : 0),
      };
    },
    // 마지막 호출 이후 누적된 마우스 이동량
    consumeLook() {
      const out = { dx: look.dx, dy: look.dy };
      look.dx = look.dy = 0;
      return out;
    },
    // 마지막 호출 이후 누적된 마우스 휠 줌 델타 소모
    consumeZoom() {
      const val = zoomDelta;
      zoomDelta = 0;
      return val;
    },
    // 상호작용 키(E) 한 번 눌림 소모
    consumeInteract() {
      const val = interactTriggered;
      interactTriggered = false;
      return val;
    },
    // 인벤토리 키(I) 한 번 눌림 소모
    consumeInventoryToggle() {
      const val = inventoryTriggered;
      inventoryTriggered = false;
      return val;
    },
    isDown(...codes) {
      return down(...codes);
    }
  };
}
