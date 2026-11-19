// 대화창 및 상호작용 프롬프트 UI 관리
export function createDialogueUI() {
  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-dialogue-style';
  style.textContent = `
    .interaction-prompt {
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      padding: 10px 22px;
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(180, 130, 150, 0.25);
      border: 2px solid #ffd6e2;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: "Segoe UI", sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #6a4c58;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      z-index: 100;
    }
    .interaction-prompt.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .prompt-key {
      background: #ffb3c8;
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(220, 100, 130, 0.3);
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
      font-family: "Segoe UI", sans-serif;
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
  const promptEl = document.createElement('div');
  promptEl.className = 'interaction-prompt';
  promptEl.innerHTML = `<span class="prompt-key">E</span> <span class="prompt-text">대화하기</span>`;
  document.body.appendChild(promptEl);

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
      <span><kbd>E</kbd> 또는 클릭하여 계속</span>
    </div>
  `;
  document.body.appendChild(modalEl);

  const portraitEl = modalEl.querySelector('.npc-portrait');
  const nameEl = modalEl.querySelector('.npc-name');
  const contentEl = modalEl.querySelector('.dialogue-content');
  const closeBtn = modalEl.querySelector('.dialogue-close-btn');

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
    showPrompt(text = '대화하기') {
      if (isOpen) {
        promptEl.classList.remove('visible');
        return;
      }
      promptEl.querySelector('.prompt-text').textContent = text;
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
