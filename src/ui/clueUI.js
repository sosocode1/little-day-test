// LITTLE DAY 단서 조사 및 기록 열람 클레이 안내창 UI (Clue & Lore Inspection Modal)

export function createClueUI() {
  const existingStyle = document.getElementById('little-day-clue-style');
  if (existingStyle) existingStyle.remove();
  document.querySelectorAll('.clue-modal-backdrop').forEach((el) => el.remove());

  const style = document.createElement('style');
  style.id = 'little-day-clue-style';
  style.textContent = `
    .clue-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(46, 32, 44, 0.42);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 360;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.24s ease, visibility 0.24s ease;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      user-select: none;
    }
    .clue-modal-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .clue-card {
      width: min(92vw, 480px);
      max-height: 86vh;
      overflow-y: auto;
      background: linear-gradient(180deg, #fffdf9 0%, #fff7f1 100%);
      border-radius: 30px;
      padding: 26px 26px 22px;
      border: 3.5px solid #f2d5c4;
      box-shadow:
        0 24px 56px rgba(102, 72, 86, 0.34),
        inset 0 4px 10px rgba(255, 255, 255, 0.94),
        inset 0 -5px 12px rgba(235, 196, 175, 0.34);
      color: #4f3834;
      transform: scale(0.9) translateY(14px);
      transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
      text-align: left;
    }
    .clue-modal-backdrop.open .clue-card {
      transform: scale(1) translateY(0);
    }

    .clue-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 14px;
    }
    .clue-location-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 13px;
      border-radius: 999px;
      background: #f4ecff;
      border: 1.5px solid #d9c8f7;
      color: #5e4494;
      font-size: 12px;
      font-weight: 800;
    }
    .clue-new-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      background: linear-gradient(135deg, #ff99b6, #ff789e);
      color: #ffffff;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 0 3px 10px rgba(255, 120, 158, 0.32);
    }
    .clue-new-badge.hidden {
      display: none;
    }

    .clue-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 2px dashed #f3dccb;
    }
    .clue-icon-circle {
      width: 58px;
      height: 58px;
      border-radius: 20px;
      background: linear-gradient(135deg, #fff5eb 0%, #ffe8d9 100%);
      border: 2.5px solid #ffffff;
      box-shadow: 0 6px 14px rgba(196, 146, 120, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      flex-shrink: 0;
    }
    .clue-title {
      font-size: 19px;
      font-weight: 900;
      color: #5d3640;
      letter-spacing: -0.3px;
      margin-bottom: 3px;
    }
    .clue-progress-meta {
      font-size: 12px;
      font-weight: 700;
      color: #9b7369;
    }

    .clue-body-box {
      background: #ffffff;
      border: 2px solid #f5e2d4;
      border-radius: 22px;
      padding: 16px 18px;
      margin-bottom: 14px;
      box-shadow: inset 0 2px 6px rgba(244, 224, 210, 0.35);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .clue-paragraph {
      font-size: 14.5px;
      line-height: 1.68;
      font-weight: 600;
      color: #523b37;
      word-break: keep-all;
      margin: 0;
    }
    .clue-paragraph.quote {
      background: #fdf8f2;
      border-left: 4px solid #c9a6f0;
      padding: 10px 14px;
      border-radius: 0 14px 14px 0;
      color: #46355c;
      font-weight: 700;
    }

    .clue-hint-box {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 11px 14px;
      border-radius: 16px;
      background: linear-gradient(180deg, #f3f7ff 0%, #ebf2ff 100%);
      border: 1.5px dashed #b9cef5;
      color: #3f588a;
      font-size: 12.8px;
      font-weight: 800;
      line-height: 1.48;
      margin-bottom: 18px;
      word-break: keep-all;
    }
    .clue-hint-box.hidden {
      display: none;
    }

    .clue-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .clue-key-tip {
      font-size: 11.5px;
      font-weight: 700;
      color: #a47e74;
    }
    .clue-confirm-btn {
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      color: #ffffff;
      border: 2px solid #ffccd9;
      padding: 11px 28px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 900;
      cursor: pointer;
      box-shadow:
        0 6px 16px rgba(240, 110, 148, 0.36),
        inset 0 2px 4px rgba(255, 255, 255, 0.5);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .clue-confirm-btn:hover {
      transform: translateY(-1.5px);
      box-shadow: 0 8px 20px rgba(240, 110, 148, 0.45);
    }
    .clue-confirm-btn:active {
      transform: translateY(1px);
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'clue-modal-backdrop';
  backdrop.innerHTML = `
    <div class="clue-card" role="dialog" aria-modal="true" aria-label="단서 조사 안내창">
      <div class="clue-top-row">
        <span class="clue-location-badge"></span>
        <span class="clue-new-badge hidden">✨ 새 단서 발견!</span>
      </div>
      <div class="clue-header">
        <div class="clue-icon-circle">🔍</div>
        <div>
          <div class="clue-title">단서 제목</div>
          <div class="clue-progress-meta">등대 주변 단서 기록</div>
        </div>
      </div>
      <div class="clue-body-box"></div>
      <div class="clue-hint-box hidden">
        <span>💡</span>
        <span class="clue-hint-text"></span>
      </div>
      <div class="clue-footer">
        <span class="clue-key-tip">[E] 또는 [Esc]로 닫기</span>
        <button type="button" class="clue-confirm-btn">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const locationEl = backdrop.querySelector('.clue-location-badge');
  const newBadgeEl = backdrop.querySelector('.clue-new-badge');
  const iconEl = backdrop.querySelector('.clue-icon-circle');
  const titleEl = backdrop.querySelector('.clue-title');
  const metaEl = backdrop.querySelector('.clue-progress-meta');
  const bodyEl = backdrop.querySelector('.clue-body-box');
  const hintBoxEl = backdrop.querySelector('.clue-hint-box');
  const hintTextEl = backdrop.querySelector('.clue-hint-text');
  const confirmBtn = backdrop.querySelector('.clue-confirm-btn');

  let openState = false;
  let onCloseCallback = null;
  let openedAt = 0;

  function close() {
    if (!openState) return;
    openState = false;
    backdrop.classList.remove('open');
    const cb = onCloseCallback;
    onCloseCallback = null;
    if (typeof cb === 'function') cb();
  }

  confirmBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  backdrop.addEventListener('pointerdown', (e) => e.stopPropagation());
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  window.addEventListener(
    'keydown',
    (e) => {
      if (!openState) return;
      if (performance.now() - openedAt < 180) return;
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    },
    true
  );

  return {
    open(options = {}, onClose = null) {
      onCloseCallback = onClose;
      openedAt = performance.now();

      locationEl.textContent = `📍 ${options.location || '달빛 섬 등대'}`;
      newBadgeEl.classList.toggle('hidden', !options.isNew);
      iconEl.textContent = options.icon || '🔍';
      titleEl.textContent = options.title || '오래된 단서';

      if (typeof options.discoveredCount === 'number' && typeof options.totalClues === 'number') {
        metaEl.textContent = `발견한 등대 단서: ${options.discoveredCount} / ${options.totalClues}`;
      } else {
        metaEl.textContent = options.subtitle || '등대 탐험 기록';
      }

      const paragraphs = Array.isArray(options.body)
        ? options.body
        : options.body
          ? [String(options.body)]
          : [];
      bodyEl.innerHTML = paragraphs
        .map((line) => {
          const isQuote = line.trim().startsWith('"') || line.trim().startsWith('“');
          return `<p class="clue-paragraph ${isQuote ? 'quote' : ''}">${line}</p>`;
        })
        .join('');

      if (options.hintSummary) {
        hintTextEl.textContent = options.hintSummary;
        hintBoxEl.classList.remove('hidden');
      } else {
        hintBoxEl.classList.add('hidden');
      }

      confirmBtn.textContent = options.buttonText || '확인';

      openState = true;
      backdrop.classList.add('open');
    },
    close,
    isOpen() {
      return openState;
    }
  };
}
