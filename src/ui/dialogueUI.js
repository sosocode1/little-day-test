// 대화창 및 상호작용 프롬프트 UI 관리
export function createDialogueUI() {
  const prevStyle = document.getElementById('little-day-dialogue-style');
  if (prevStyle) prevStyle.remove();

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-dialogue-style';
  style.textContent = `
    /* 화면 하단 중앙(캐릭터/화면 중앙 비침해) 작고 세련된 상호작용 안내 배지 */
    .interaction-prompt {
      position: fixed;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      max-width: calc(100vw - 32px);
      background: rgba(255, 253, 250, 0.92);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 7px 15px 7px 11px;
      border-radius: 999px;
      box-shadow: 0 6px 18px rgba(170, 115, 138, 0.22);
      border: 1.5px solid #ffd6e2;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-family: "Pretendard", "Segoe UI", sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #5f3d4b;
      letter-spacing: -0.01em;
      pointer-events: none;
      user-select: none;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      z-index: 100;
      white-space: nowrap;
    }
    .interaction-prompt.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    .interaction-prompt.visible:hover {
      transform: translateX(-50%) translateY(-1px);
      box-shadow: 0 8px 22px rgba(170, 115, 138, 0.28);
      border-color: #ffb8cc;
    }
    .interaction-prompt.visible:active {
      transform: translateX(-50%) scale(0.97);
    }

    .prompt-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 7px;
      background: linear-gradient(135deg, #ff9fb8, #ff7ea0);
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 800;
      border-radius: 7px;
      box-shadow: 0 2px 5px rgba(240, 100, 135, 0.28);
      line-height: 1;
      flex-shrink: 0;
    }
    .interaction-prompt.touch-mode .prompt-key {
      background: linear-gradient(135deg, #ff94b2, #ff7096);
      padding: 0 8px;
      font-size: 11px;
    }
    .prompt-icon {
      font-size: 14px;
      line-height: 1;
      flex-shrink: 0;
    }
    .prompt-text {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 640px) {
      .interaction-prompt {
        bottom: 22px;
        padding: 8px 14px 8px 11px;
        font-size: 12.5px;
      }
    }

    .dialogue-modal {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      width: min(90vw, 620px);
      background: rgba(255, 253, 250, 0.96);
      backdrop-filter: blur(12px);
      border-radius: 24px;
      padding: 24px 28px 20px;
      box-shadow: 0 16px 40px rgba(160, 110, 130, 0.28);
      border: 3px solid #ffe3ec;
      font-family: "Pretendard", "Segoe UI", sans-serif;
      color: #4a343e;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      z-index: 150;
      user-select: none;
    }
    .dialogue-modal.open {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }

    .dialogue-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .dialogue-name-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ffe9f0;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 16px;
      font-weight: 800;
      color: #8c435c;
      border: 1px solid #ffccd9;
    }
    .dialogue-close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #b08d9b;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.15s, color 0.15s;
    }
    .dialogue-close-btn:hover {
      background: #ffe3ec;
      color: #6a4c58;
    }

    .dialogue-content {
      font-size: 17px;
      line-height: 1.6;
      min-height: 54px;
      color: #4f3b44;
      font-weight: 500;
    }

    .dialogue-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 14px;
      font-size: 13px;
      color: #9c7b89;
      font-weight: 600;
      gap: 6px;
    }
    .dialogue-footer kbd {
      background: #f0dfe6;
      padding: 2px 8px;
      border-radius: 6px;
      color: #7a5464;
    }
  `;
  document.head.appendChild(style);

  // 상호작용 안내 프롬프트
  const promptEl = document.createElement('button');
  promptEl.type = 'button';
  promptEl.className = 'interaction-prompt';
  promptEl.setAttribute('aria-live', 'polite');
  promptEl.innerHTML = `<span class="prompt-icon">✨</span><span class="prompt-key">E</span><span class="prompt-text">키를 눌러 대화하기</span>`;
  document.body.appendChild(promptEl);

  const promptIconEl = promptEl.querySelector('.prompt-icon');
  const promptKeyEl = promptEl.querySelector('.prompt-key');
  const promptTextEl = promptEl.querySelector('.prompt-text');

  // 터치 / 데스크톱 입력 모드 자동 감지
  let isTouchMode =
    typeof window !== 'undefined' &&
    ((typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024));

  let lastActionText = '대화하기';
  let lastActionIcon = '✨';
  let onPromptTapCallback = null;

  function renderPromptContent() {
    const cleanText = String(lastActionText || '상호작용하기').trim();
    promptEl.classList.toggle('touch-mode', isTouchMode);
    if (promptIconEl) {
      promptIconEl.textContent = lastActionIcon || '✨';
      promptIconEl.style.display = lastActionIcon ? 'inline-flex' : 'none';
    }
    if (isTouchMode) {
      promptKeyEl.textContent = '터치';
      if (cleanText.startsWith('터치하여')) {
        promptTextEl.textContent = cleanText;
      } else {
        promptTextEl.textContent = `터치하여 ${cleanText}`;
      }
    } else {
      promptKeyEl.textContent = 'E';
      if (cleanText.startsWith('E 키를 눌러') || cleanText.startsWith('키를 눌러')) {
        promptTextEl.textContent = cleanText.replace(/^E\s*/, '');
      } else {
        promptTextEl.textContent = `키를 눌러 ${cleanText}`;
      }
    }
  }

  window.addEventListener('pointerdown', (e) => {
    const nextTouch = e.pointerType === 'touch';
    if (nextTouch !== isTouchMode) {
      isTouchMode = nextTouch;
      if (promptEl.classList.contains('visible')) {
        renderPromptContent();
      }
    }
  }, { passive: true });

  window.addEventListener('keydown', () => {
    const isCoarsePrimary = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (isTouchMode && !isCoarsePrimary) {
      isTouchMode = false;
      if (promptEl.classList.contains('visible')) {
        renderPromptContent();
      }
    }
  }, { passive: true });

  // 프롬프트 직접 클릭/터치 시 상호작용 실행 (모바일 터치 및 마우스 편의 지원)
  promptEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });
  promptEl.addEventListener('click', (e) => {
    e.stopPropagation();
    promptEl.blur();
    if (!promptEl.classList.contains('visible') || isOpen) return;
    if (typeof onPromptTapCallback === 'function') {
      onPromptTapCallback();
    }
  });

  // 대화창 모달
  const modalEl = document.createElement('div');
  modalEl.className = 'dialogue-modal';
  modalEl.innerHTML = `
    <div class="dialogue-header">
      <div class="dialogue-name-badge">
        <span class="npc-portrait"></span>
        <span class="npc-name"></span>
      </div>
      <button class="dialogue-close-btn" aria-label="닫기">✕</button>
    </div>
    <div class="dialogue-content"></div>
    <div class="dialogue-footer">
      <span class="dialogue-footer-hint"><kbd>E</kbd> 또는 클릭하여 계속</span>
    </div>
  `;
  document.body.appendChild(modalEl);

  const portraitEl = modalEl.querySelector('.npc-portrait');
  const nameEl = modalEl.querySelector('.npc-name');
  const contentEl = modalEl.querySelector('.dialogue-content');
  const closeBtn = modalEl.querySelector('.dialogue-close-btn');
  const footerHintEl = modalEl.querySelector('.dialogue-footer-hint');

  let currentNpc = null;
  let dialogueIndex = 0;
  let isOpen = false;
  let onCloseCallback = null;

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modalEl.classList.remove('open');
    currentNpc = null;
    dialogueIndex = 0;
    if (onCloseCallback) onCloseCallback();
  }

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  // 모달 자체 클릭 시 다음 대사로 넘어가기
  modalEl.addEventListener('click', () => {
    advance();
  });

  function advance() {
    if (!isOpen || !currentNpc) return;
    dialogueIndex++;
    if (dialogueIndex >= currentNpc.data.dialogues.length) {
      close();
    } else {
      contentEl.textContent = currentNpc.data.dialogues[dialogueIndex];
    }
  }

  return {
    onPromptTap(cb) {
      onPromptTapCallback = cb;
    },
    showPrompt(text = '대화하기', icon = '✨') {
      if (isOpen) {
        promptEl.classList.remove('visible');
        return;
      }
      lastActionText = text;
      lastActionIcon = icon;
      renderPromptContent();
      promptEl.classList.add('visible');
    },
    hidePrompt() {
      promptEl.classList.remove('visible');
    },
    openDialogue(npc, onClose = null) {
      currentNpc = npc;
      dialogueIndex = 0;
      isOpen = true;
      onCloseCallback = onClose;

      portraitEl.textContent = npc.data.portrait || '💬';
      nameEl.textContent = npc.data.name;
      contentEl.textContent = npc.data.dialogues[dialogueIndex];
      if (footerHintEl) {
        footerHintEl.innerHTML = isTouchMode
          ? '화면 터치하여 계속'
          : '<kbd>E</kbd> 또는 클릭하여 계속';
      }

      promptEl.classList.remove('visible');
      modalEl.classList.add('open');
    },
    advance,
    close,
    isOpen() {
      return isOpen;
    },
    getCurrentNpc() {
      return currentNpc;
    }
  };
}
