// 키보드 입력과 마우스 드래그(카메라 회전) 상태 관리
export function createInput(domElement) {
  const keys = new Set();
  const look = { dx: 0, dy: 0 };
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
