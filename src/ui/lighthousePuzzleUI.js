// LITTLE DAY 오래된 등대의 장치 퍼즐 UI (Warm Pastel Clay Style)
// - 화면 중앙 모달, 4개 기호 버튼 선택, 4칸 순서 슬롯, 정답/오답 애니메이션, 발견한 단서 메모 연동

import {
  LIGHTHOUSE_SYMBOLS,
  LIGHTHOUSE_SOLUTION,
  getLighthouseSymbol
} from '../data/lighthousePuzzle.js';

export function createLighthousePuzzleUI(puzzleSystem) {
  const existingStyle = document.getElementById('little-day-lighthouse-puzzle-style');
  if (existingStyle) existingStyle.remove();
  document.querySelectorAll('.lighthouse-puzzle-backdrop').forEach((el) => el.remove());

  const style = document.createElement('style');
  style.id = 'little-day-lighthouse-puzzle-style';
  style.textContent = `
    .lighthouse-puzzle-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(40, 32, 52, 0.46);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      z-index: 365;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.24s ease, visibility 0.24s ease;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      user-select: none;
    }
    .lighthouse-puzzle-backdrop.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .lp-window {
      width: min(94vw, 540px);
      max-height: 90vh;
      overflow-y: auto;
      background: linear-gradient(180deg, #fffdf9 0%, #fff6f2 100%);
      border-radius: 32px;
      border: 4px solid #f0d2df;
      box-shadow:
        0 26px 60px rgba(72, 52, 92, 0.36),
        inset 0 4px 10px rgba(255, 255, 255, 0.94),
        inset 0 -6px 14px rgba(228, 190, 212, 0.34);
      padding: 24px 24px 20px;
      color: #4f3742;
      transform: scale(0.9) translateY(16px);
      transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .lighthouse-puzzle-backdrop.open .lp-window {
      transform: scale(1) translateY(0);
    }

    .lp-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 2px dashed #f2d8e4;
    }
    .lp-title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .lp-title-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f0ecff 0%, #e1edff 100%);
      border: 2px solid #ffffff;
      box-shadow: 0 5px 14px rgba(130, 150, 210, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      flex-shrink: 0;
    }
    .lp-title {
      font-size: 19px;
      font-weight: 900;
      color: #5b3752;
      letter-spacing: -0.3px;
    }
    .lp-subtitle {
      font-size: 12.5px;
      font-weight: 600;
      color: #8f6b7d;
      margin-top: 2px;
    }
    .lp-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid #f0c9d8;
      background: #fff9fb;
      color: #9c6a80;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .lp-close-btn:hover {
      background: #ffe9f1;
      color: #c8436e;
      transform: scale(1.06);
    }

    /* 4칸 문양 순서 슬롯 */
    .lp-slots-panel {
      background: linear-gradient(180deg, #faf7ff 0%, #f4f1fc 100%);
      border: 2.5px solid #dfd3f5;
      border-radius: 24px;
      padding: 16px 14px 14px;
      margin-bottom: 14px;
      box-shadow: inset 0 3px 8px rgba(255, 255, 255, 0.88);
    }
    .lp-slots-panel.shake {
      animation: lpShake 0.44s ease;
      border-color: #f3a1b2;
      background: linear-gradient(180deg, #fff5f7 0%, #ffeaef 100%);
    }
    .lp-slots-panel.solved {
      border-color: #8fd9ae;
      background: linear-gradient(180deg, #f2fff7 0%, #e7f8ff 100%);
      box-shadow:
        0 0 0 3px rgba(143, 217, 174, 0.35),
        inset 0 3px 8px rgba(255, 255, 255, 0.92);
      animation: lpGlowPulse 0.7s ease;
    }
    @keyframes lpShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    @keyframes lpGlowPulse {
      0% { transform: scale(1); }
      45% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }
    @keyframes lpSlotPop {
      0% { transform: scale(0.76); }
      70% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }

    .lp-slots-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      color: #6b588c;
      margin-bottom: 10px;
      padding: 0 4px;
    }
    .lp-slots-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .lp-slot {
      height: 82px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      border: 2px dashed #cfc2e8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      position: relative;
      transition: all 0.18s ease;
    }
    .lp-slot.filled {
      border-style: solid;
      background: #ffffff;
      box-shadow:
        0 6px 14px rgba(125, 110, 175, 0.16),
        inset 0 2px 5px rgba(255, 255, 255, 0.9);
      animation: lpSlotPop 0.24s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .lp-slot-num {
      position: absolute;
      top: 6px;
      left: 8px;
      font-size: 10.5px;
      font-weight: 900;
      color: #9e8ec0;
    }
    .lp-slot-icon {
      font-size: 28px;
      line-height: 1;
    }
    .lp-slot-name {
      font-size: 11.5px;
      font-weight: 800;
      color: #55426b;
    }
    .lp-slot-empty-dot {
      font-size: 20px;
      color: #cfc4e3;
      font-weight: 900;
    }

    /* 상태 피드백 배너 */
    .lp-feedback {
      min-height: 40px;
      padding: 9px 14px;
      border-radius: 16px;
      font-size: 12.8px;
      font-weight: 800;
      line-height: 1.45;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff7ee;
      border: 1.5px solid #f4dec4;
      color: #7c5640;
      word-break: keep-all;
    }
    .lp-feedback.error {
      background: #fff1f4;
      border-color: #f6b6c6;
      color: #a63d5a;
    }
    .lp-feedback.success {
      background: #eefcf4;
      border-color: #a6e0be;
      color: #256e46;
    }

    /* 기호 선택 버튼 그리드 */
    .lp-symbols-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .lp-symbol-btn {
      padding: 13px 8px 11px;
      border-radius: 20px;
      border: 2.5px solid var(--sym-border, #e8d5df);
      background: var(--sym-bg, #ffffff);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      font-family: inherit;
      box-shadow:
        0 6px 14px rgba(155, 120, 145, 0.16),
        inset 0 2px 5px rgba(255, 255, 255, 0.9);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }
    .lp-symbol-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 9px 20px rgba(145, 110, 155, 0.25);
    }
    .lp-symbol-btn:active:not(:disabled) {
      transform: scale(0.95);
    }
    .lp-symbol-btn:disabled {
      opacity: 0.46;
      cursor: not-allowed;
      transform: none;
    }
    .lp-symbol-btn-icon {
      font-size: 28px;
      line-height: 1;
    }
    .lp-symbol-btn-name {
      font-size: 13px;
      font-weight: 900;
      color: #4f3a4d;
    }

    /* 조작 버튼 바 */
    .lp-actions {
      display: flex;
      gap: 9px;
      margin-bottom: 14px;
    }
    .lp-btn {
      padding: 11px 14px;
      border-radius: 999px;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 900;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .lp-btn-secondary {
      background: #f6eaef;
      border: 2px solid #e8cfd9;
      color: #7c4d60;
      flex: 0.7;
    }
    .lp-btn-secondary:hover:not(:disabled) {
      background: #f0dce5;
    }
    .lp-btn-primary {
      flex: 1.5;
      background: linear-gradient(135deg, #ff8fad 0%, #ff6e94 100%);
      border: 2px solid #ffccd9;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(240, 110, 148, 0.36);
    }
    .lp-btn-primary:hover:not(:disabled) {
      transform: translateY(-1.5px);
      box-shadow: 0 8px 20px rgba(240, 110, 148, 0.45);
    }
    .lp-btn:disabled {
      opacity: 0.48;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* 발견한 단서 메모 패널 */
    .lp-clues-box {
      background: #ffffff;
      border: 2px solid #f2e0d4;
      border-radius: 20px;
      padding: 12px 14px;
    }
    .lp-clues-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 900;
      color: #6b4553;
      margin-bottom: 8px;
    }
    .lp-clues-count {
      padding: 2px 9px;
      border-radius: 999px;
      background: #f4ecff;
      color: #5c4394;
      font-size: 11px;
      font-weight: 800;
    }
    .lp-clues-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lp-clue-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.45;
      font-weight: 700;
      word-break: keep-all;
    }
    .lp-clue-row.discovered {
      background: #f8f5ff;
      border: 1px solid #e1d5f7;
      color: #49386b;
    }
    .lp-clue-row.undiscovered {
      background: #faf6f3;
      border: 1px dashed #e6d5ca;
      color: #a88f84;
    }

    @media (max-width: 520px) {
      .lp-slots-grid,
      .lp-symbols-grid {
        gap: 7px;
      }
      .lp-slot {
        height: 70px;
      }
      .lp-slot-icon,
      .lp-symbol-btn-icon {
        font-size: 24px;
      }
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'lighthouse-puzzle-backdrop';
  backdrop.innerHTML = `
    <div class="lp-window" role="dialog" aria-modal="true" aria-label="오래된 등대의 장치 퍼즐">
      <div class="lp-header">
        <div class="lp-title-wrap">
          <div class="lp-title-icon">🏛️</div>
          <div>
            <div class="lp-title">오래된 등대의 장치</div>
            <div class="lp-subtitle">단서에 적힌 순서대로 네 개의 문양을 선택해 작동시켜 보세요</div>
          </div>
        </div>
        <button type="button" class="lp-close-btn" title="닫기 (Esc)" aria-label="퍼즐 닫기">✕</button>
      </div>

      <div class="lp-slots-panel">
        <div class="lp-slots-label">
          <span>✨ 입력된 문양 순서</span>
          <span class="lp-slots-counter">0 / ${LIGHTHOUSE_SOLUTION.length}</span>
        </div>
        <div class="lp-slots-grid"></div>
      </div>

      <div class="lp-feedback">
        <span>🔍</span>
        <span class="lp-feedback-text">등대 주변에서 발견한 단서를 참고해 문양을 순서대로 눌러 주세요.</span>
      </div>

      <div class="lp-symbols-grid"></div>

      <div class="lp-actions">
        <button type="button" class="lp-btn lp-btn-secondary" data-action="undo">↩ 지우기</button>
        <button type="button" class="lp-btn lp-btn-secondary" data-action="reset">🔄 초기화</button>
        <button type="button" class="lp-btn lp-btn-primary" data-action="submit">✨ 장치 작동하기</button>
      </div>

      <div class="lp-clues-box">
        <div class="lp-clues-header">
          <span>📓 발견한 등대 단서 메모</span>
          <span class="lp-clues-count">0 / 4</span>
        </div>
        <div class="lp-clues-list"></div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const closeBtn = backdrop.querySelector('.lp-close-btn');
  const slotsPanel = backdrop.querySelector('.lp-slots-panel');
  const slotsCounter = backdrop.querySelector('.lp-slots-counter');
  const slotsGrid = backdrop.querySelector('.lp-slots-grid');
  const feedbackEl = backdrop.querySelector('.lp-feedback');
  const feedbackTextEl = backdrop.querySelector('.lp-feedback-text');
  const symbolsGrid = backdrop.querySelector('.lp-symbols-grid');
  const undoBtn = backdrop.querySelector('[data-action="undo"]');
  const resetBtn = backdrop.querySelector('[data-action="reset"]');
  const submitBtn = backdrop.querySelector('[data-action="submit"]');
  const cluesCountEl = backdrop.querySelector('.lp-clues-count');
  const cluesListEl = backdrop.querySelector('.lp-clues-list');

  let openState = false;
  let selectedSequence = [];
  let onSolvedCallback = null;
  let onCloseCallback = null;
  let feedbackMode = 'info';
  let feedbackMessage = '등대 주변에서 발견한 단서를 참고해 문양을 순서대로 눌러 주세요.';

  function setFeedback(mode, icon, message) {
    feedbackMode = mode;
    feedbackMessage = message;
    feedbackEl.className = `lp-feedback ${mode === 'error' ? 'error' : mode === 'success' ? 'success' : ''}`;
    feedbackEl.querySelector('span:first-child').textContent = icon;
    feedbackTextEl.textContent = message;
  }

  function render() {
    const state = puzzleSystem.getState();
    const solved = state.puzzleSolved;
    const displaySeq = solved ? LIGHTHOUSE_SOLUTION : selectedSequence;

    slotsCounter.textContent = `${displaySeq.length} / ${LIGHTHOUSE_SOLUTION.length}`;
    slotsPanel.classList.toggle('solved', solved);

    // 1. 4칸 슬롯 렌더링
    let slotsHtml = '';
    for (let i = 0; i < LIGHTHOUSE_SOLUTION.length; i++) {
      const symId = displaySeq[i];
      const sym = symId ? getLighthouseSymbol(symId) : null;
      if (sym) {
        slotsHtml += `
          <div class="lp-slot filled" style="border-color: ${sym.border}; background: ${sym.bg};">
            <span class="lp-slot-num">${i + 1}</span>
            <span class="lp-slot-icon">${sym.icon}</span>
            <span class="lp-slot-name">${sym.name}</span>
          </div>
        `;
      } else {
        slotsHtml += `
          <div class="lp-slot">
            <span class="lp-slot-num">${i + 1}</span>
            <span class="lp-slot-empty-dot">·</span>
          </div>
        `;
      }
    }
    slotsGrid.innerHTML = slotsHtml;

    // 2. 기호 선택 버튼 렌더링
    let symHtml = '';
    for (const sym of LIGHTHOUSE_SYMBOLS) {
      const alreadyChosen = !solved && selectedSequence.includes(sym.id);
      const disabled = solved || alreadyChosen || selectedSequence.length >= LIGHTHOUSE_SOLUTION.length;
      symHtml += `
        <button
          type="button"
          class="lp-symbol-btn"
          data-symbol="${sym.id}"
          style="--sym-bg: ${sym.bg}; --sym-border: ${sym.border};"
          ${disabled ? 'disabled' : ''}
        >
          <span class="lp-symbol-btn-icon">${sym.icon}</span>
          <span class="lp-symbol-btn-name">${sym.name}</span>
        </button>
      `;
    }
    symbolsGrid.innerHTML = symHtml;

    symbolsGrid.querySelectorAll('.lp-symbol-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const symId = btn.getAttribute('data-symbol');
        if (!symId || puzzleSystem.isPuzzleSolved()) return;
        if (selectedSequence.length >= LIGHTHOUSE_SOLUTION.length) return;
        if (selectedSequence.includes(symId)) return;

        selectedSequence.push(symId);
        puzzleSystem.sound.playSymbolTap(selectedSequence.length - 1);
        slotsPanel.classList.remove('shake');

        if (selectedSequence.length === LIGHTHOUSE_SOLUTION.length) {
          setFeedback('info', '✨', '네 개의 문양이 모두 선택되었습니다! "장치 작동하기"를 눌러 결과를 확인해 보세요.');
        } else {
          setFeedback('info', '🔹', `${selectedSequence.length}번째 문양을 선택했습니다. (${selectedSequence.length}/${LIGHTHOUSE_SOLUTION.length})`);
        }
        render();
      });
    });

    // 3. 조작 버튼 상태 갱신
    if (solved) {
      undoBtn.disabled = true;
      resetBtn.disabled = true;
      submitBtn.disabled = false;
      submitBtn.textContent = state.rewardClaimed ? '닫기' : '비밀 석함 확인하러 가기 ✨';
    } else {
      undoBtn.disabled = selectedSequence.length === 0;
      resetBtn.disabled = selectedSequence.length === 0;
      submitBtn.disabled = selectedSequence.length < LIGHTHOUSE_SOLUTION.length;
      submitBtn.textContent = '✨ 장치 작동하기';
    }

    // 4. 발견한 단서 메모 렌더링
    const clues = puzzleSystem.getAllCluesWithStatus();
    const foundCount = clues.filter((c) => c.discovered).length;
    cluesCountEl.textContent = `${foundCount} / ${clues.length}`;
    cluesListEl.innerHTML = clues
      .map((clue) => {
        if (clue.discovered) {
          return `
            <div class="lp-clue-row discovered">
              <span>${clue.icon}</span>
              <span><strong>${clue.title}:</strong> ${clue.hintSummary}</span>
            </div>
          `;
        }
        return `
          <div class="lp-clue-row undiscovered">
            <span>❓</span>
            <span>아직 발견하지 못한 단서 (${clue.location} 주변을 탐색해 보세요)</span>
          </div>
        `;
      })
      .join('');
  }

  function handleSubmit() {
    if (puzzleSystem.isPuzzleSolved()) {
      close();
      return;
    }
    if (selectedSequence.length < LIGHTHOUSE_SOLUTION.length) return;

    const result = puzzleSystem.submitSequence([...selectedSequence]);
    if (result.ok) {
      setFeedback(
        'success',
        '🌟',
        '정답입니다! 등대 장치가 힘차게 깨어나며 왼쪽 기단 아래 숨겨진 비밀 석함이 열렸습니다!'
      );
      render();
      if (typeof onSolvedCallback === 'function') {
        onSolvedCallback(result);
      }
    } else {
      slotsPanel.classList.remove('shake');
      void slotsPanel.offsetWidth;
      slotsPanel.classList.add('shake');
      setFeedback('error', '⚠️', result.message || '순서가 맞지 않습니다. 다시 시도해 보세요!');
      // 오답 후 바로 다시 선택할 수 있도록 슬롯 초기화
      selectedSequence = [];
      render();
    }
  }

  undoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (puzzleSystem.isPuzzleSolved() || selectedSequence.length === 0) return;
    selectedSequence.pop();
    puzzleSystem.sound.playSymbolTap(0);
    setFeedback('info', '↩️', '마지막으로 선택한 문양을 지웠습니다.');
    render();
  });

  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (puzzleSystem.isPuzzleSolved()) return;
    selectedSequence = [];
    slotsPanel.classList.remove('shake');
    setFeedback('info', '🔄', '문양 선택을 초기화했습니다. 단서를 보며 다시 선택해 보세요.');
    render();
  });

  submitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSubmit();
  });

  function close() {
    if (!openState) return;
    openState = false;
    backdrop.classList.remove('open');
    const cb = onCloseCallback;
    onCloseCallback = null;
    if (typeof cb === 'function') cb();
  }

  closeBtn.addEventListener('click', (e) => {
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
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    },
    true
  );

  return {
    open({ onSolved = null, onClose = null } = {}) {
      onSolvedCallback = onSolved;
      onCloseCallback = onClose;
      selectedSequence = [];
      slotsPanel.classList.remove('shake');

      const state = puzzleSystem.getState();
      if (state.puzzleSolved) {
        if (state.rewardClaimed) {
          setFeedback('success', '✨', '등대의 고대 장치가 이미 완벽히 작동하여 비밀이 밝혀졌습니다.');
        } else {
          setFeedback('success', '🌟', '장치가 작동했습니다! 등대 왼쪽 기단에 열린 비밀 석함에서 오래된 항해 기록을 확인해 보세요.');
        }
      } else if (state.discoveredClueCount === 0) {
        setFeedback('info', '🔍', '아직 등대 주변 단서를 찾지 못했어요. 먼저 주변의 표지판과 기록들을 조사해 보세요!');
      } else {
        setFeedback('info', '🔍', `발견한 단서(${state.discoveredClueCount}/${state.totalClues})를 참고해 문양 4개를 순서대로 선택하세요.`);
      }

      render();
      openState = true;
      backdrop.classList.add('open');
    },
    close,
    isOpen() {
      return openState;
    }
  };
}
