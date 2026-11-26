// LITTLE DAY 클레이 스타일 동물 NPC 대화창, 낮/밤 초상화, 분기 선택지 및 상호작용 프롬프트 UI

// 동물 NPC별 클레이 감성 SVG 얼굴 초상화 생성기 (낮: 동물 주민 / 밤: 수인 분위기)
function createPortraitMarkup(npcData, isNight = false) {
  const type = npcData?.portraitType || npcData?.species || npcData?.id;

  if (type === 'rabbit') {
    if (isNight) {
      return `
        <svg class="npc-portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
          <defs>
            <radialGradient id="rbNightBg" cx="35%" cy="25%" r="80%">
              <stop offset="0%" stop-color="#473f73"/>
              <stop offset="100%" stop-color="#262044"/>
            </radialGradient>
          </defs>
          <rect width="96" height="96" rx="24" fill="url(#rbNightBg)"/>
          <circle cx="19" cy="20" r="1.8" fill="#fff3be" opacity="0.9"/>
          <circle cx="77" cy="18" r="1.4" fill="#d9d2ff" opacity="0.85"/>
          <circle cx="80" cy="34" r="1.1" fill="#fff3be" opacity="0.7"/>
          <!-- 밤 수인 토끼 귀 (은빛 달빛 윤곽) -->
          <ellipse cx="36" cy="24" rx="7.6" ry="20.5" transform="rotate(-11 36 24)" fill="#f3eefb"/>
          <ellipse cx="36" cy="25" rx="4.2" ry="14" transform="rotate(-11 36 25)" fill="#c9a5e6"/>
          <ellipse cx="60" cy="24" rx="7.6" ry="20.5" transform="rotate(11 60 24)" fill="#f3eefb"/>
          <ellipse cx="60" cy="25" rx="4.2" ry="14" transform="rotate(11 60 25)" fill="#c9a5e6"/>
          <!-- 밤 망토 칼라 -->
          <ellipse cx="48" cy="91" rx="28" ry="18" fill="#52467c"/>
          <path d="M31 76 Q48 85 65 76 L62 86 Q48 92 34 86 Z" fill="#7768ad"/>
          <circle cx="48" cy="82" r="3" fill="#ffe89c"/>
          <!-- 얼굴 -->
          <ellipse cx="48" cy="56" rx="22.5" ry="20" fill="#f7f3fc"/>
          <!-- 은은한 앞머리 깃 -->
          <path d="M29 47 Q38 35 48 41 Q58 35 67 47 Q57 42 48 44 Q39 42 29 47 Z" fill="#e6def5"/>
          <!-- 신비로운 달빛 눈동자 -->
          <ellipse cx="39" cy="55" rx="3.4" ry="3.8" fill="#2d234a"/>
          <ellipse cx="57" cy="55" rx="3.4" ry="3.8" fill="#2d234a"/>
          <circle cx="39" cy="55.6" r="1.7" fill="#ffd97a"/>
          <circle cx="57" cy="55.6" r="1.7" fill="#ffd97a"/>
          <circle cx="38" cy="53.6" r="1" fill="#ffffff"/>
          <circle cx="56" cy="53.6" r="1" fill="#ffffff"/>
          <ellipse cx="32.5" cy="60.5" rx="4" ry="2.2" fill="#d79ce0" opacity="0.55"/>
          <ellipse cx="63.5" cy="60.5" rx="4" ry="2.2" fill="#d79ce0" opacity="0.55"/>
          <ellipse cx="48" cy="59.5" rx="2.1" ry="1.6" fill="#d89bc8"/>
          <path d="M44.5 64 Q48 63 51.5 64" fill="none" stroke="#6c5987" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
    }
    return `
      <svg class="npc-portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <radialGradient id="rbDayBg" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stop-color="#fff4f8"/>
            <stop offset="100%" stop-color="#ffdce8"/>
          </radialGradient>
        </defs>
        <rect width="96" height="96" rx="24" fill="url(#rbDayBg)"/>
        <!-- 긴 토끼 귀 -->
        <ellipse cx="36" cy="24" rx="8" ry="20" transform="rotate(-10 36 24)" fill="#fffcf7"/>
        <ellipse cx="36" cy="25" rx="4.5" ry="14" transform="rotate(-10 36 25)" fill="#ffc2d4"/>
        <ellipse cx="60" cy="24" rx="8" ry="20" transform="rotate(10 60 24)" fill="#fffcf7"/>
        <ellipse cx="60" cy="25" rx="4.5" ry="14" transform="rotate(10 60 25)" fill="#ffc2d4"/>
        <!-- 민트 원피스 -->
        <ellipse cx="48" cy="90" rx="26" ry="16" fill="#bfe3d0"/>
        <!-- 얼굴 -->
        <ellipse cx="48" cy="56" rx="23" ry="20" fill="#fffcf7"/>
        <!-- 볼터치 -->
        <ellipse cx="33" cy="60" rx="4.5" ry="2.8" fill="#ffa8b8" opacity="0.72"/>
        <ellipse cx="63" cy="60" rx="4.5" ry="2.8" fill="#ffa8b8" opacity="0.72"/>
        <!-- 눈 & 코 & 미소 -->
        <circle cx="39" cy="54" r="3.2" fill="#3a2520"/>
        <circle cx="57" cy="54" r="3.2" fill="#3a2520"/>
        <circle cx="38" cy="52.8" r="1.1" fill="#ffffff"/>
        <circle cx="56" cy="52.8" r="1.1" fill="#ffffff"/>
        <ellipse cx="48" cy="58.5" rx="2.3" ry="1.8" fill="#ffa2bd"/>
        <path d="M44.5 62.5 Q48 65.2 51.5 62.5" fill="none" stroke="#8a5a64" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  if (type === 'fox') {
    if (isNight) {
      return `
        <svg class="npc-portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
          <defs>
            <radialGradient id="fxNightBg" cx="35%" cy="25%" r="80%">
              <stop offset="0%" stop-color="#4b3c6e"/>
              <stop offset="100%" stop-color="#241c3d"/>
            </radialGradient>
          </defs>
          <rect width="96" height="96" rx="24" fill="url(#fxNightBg)"/>
          <circle cx="18" cy="22" r="1.5" fill="#ffe9a8" opacity="0.9"/>
          <circle cx="78" cy="20" r="1.8" fill="#ffe9a8" opacity="0.85"/>
          <!-- 밤 수인 여우 귀 -->
          <polygon points="23,43 29,12 45,35" fill="#df7f4e"/>
          <polygon points="27,39 30,19 41,34" fill="#f7ecdf"/>
          <polygon points="27,17 29,12 33,18" fill="#322130"/>
          <polygon points="73,43 67,12 51,35" fill="#df7f4e"/>
          <polygon points="69,39 66,19 55,34" fill="#f7ecdf"/>
          <polygon points="69,17 67,12 63,18" fill="#322130"/>
          <!-- 밤 망토 조끼 -->
          <ellipse cx="48" cy="91" rx="28" ry="18" fill="#3f3466"/>
          <path d="M30 76 L48 86 L66 76 L62 88 L48 92 L34 88 Z" fill="#6b5699"/>
          <!-- 얼굴 -->
          <ellipse cx="48" cy="54" rx="24" ry="20" fill="#df7f4e"/>
          <ellipse cx="48" cy="62" rx="16" ry="11" fill="#f9f2ea"/>
          <!-- 또렷한 금빛 밤 눈동자 -->
          <ellipse cx="39" cy="52" rx="3.4" ry="3.2" fill="#281c2e"/>
          <ellipse cx="57" cy="52" rx="3.4" ry="3.2" fill="#281c2e"/>
          <circle cx="39" cy="52.3" r="1.8" fill="#ffcf66"/>
          <circle cx="57" cy="52.3" r="1.8" fill="#ffcf66"/>
          <circle cx="38" cy="50.8" r="0.95" fill="#ffffff"/>
          <circle cx="56" cy="50.8" r="0.95" fill="#ffffff"/>
          <ellipse cx="48" cy="58" rx="3" ry="2.1" fill="#2d1d24"/>
          <path d="M44 63 Q48 65.5 52.5 62.2" fill="none" stroke="#5f3b32" stroke-width="1.9" stroke-linecap="round"/>
        </svg>
      `;
    }
    return `
      <svg class="npc-portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <radialGradient id="fxDayBg" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stop-color="#fff7eb"/>
            <stop offset="100%" stop-color="#ffe2c4"/>
          </radialGradient>
        </defs>
        <rect width="96" height="96" rx="24" fill="url(#fxDayBg)"/>
        <!-- 여우 귀 -->
        <polygon points="24,42 30,14 45,35" fill="#ee8f5a"/>
        <polygon points="28,38 31,20 41,34" fill="#fffcf7"/>
        <polygon points="72,42 66,14 51,35" fill="#ee8f5a"/>
        <polygon points="68,38 65,20 55,34" fill="#fffcf7"/>
        <!-- 조끼 -->
        <ellipse cx="48" cy="90" rx="26" ry="16" fill="#ffdfba"/>
        <!-- 얼굴 -->
        <ellipse cx="48" cy="54" rx="24" ry="20" fill="#ee8f5a"/>
        <ellipse cx="48" cy="62" rx="16" ry="11" fill="#fffcf7"/>
        <!-- 볼터치 -->
        <ellipse cx="32" cy="59" rx="4.5" ry="2.8" fill="#ffa080" opacity="0.68"/>
        <ellipse cx="64" cy="59" rx="4.5" ry="2.8" fill="#ffa080" opacity="0.68"/>
        <!-- 눈 & 코 & 미소 -->
        <circle cx="39" cy="52" r="3.1" fill="#3a2018"/>
        <circle cx="57" cy="52" r="3.1" fill="#3a2018"/>
        <circle cx="38" cy="50.8" r="1.05" fill="#ffffff"/>
        <circle cx="56" cy="50.8" r="1.05" fill="#ffffff"/>
        <ellipse cx="48" cy="58" rx="3" ry="2.1" fill="#3a2018"/>
        <path d="M44.5 63 Q48 65.5 51.5 63" fill="none" stroke="#6b4232" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  return `<span class="npc-portrait-emoji">${npcData?.portrait || '💬'}</span>`;
}

export function createDialogueUI() {
  const prevStyle = document.getElementById('little-day-dialogue-style');
  if (prevStyle) prevStyle.remove();
  document.querySelectorAll('.interaction-prompt, .dialogue-stage, .dialogue-modal').forEach((el) => el.remove());

  // 스타일 주입
  const style = document.createElement('style');
  style.id = 'little-day-dialogue-style';
  style.textContent = `
    /* 화면 하단 중앙 상호작용 안내 배지 (E 대화하기) */
    .interaction-prompt {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      max-width: calc(100vw - 32px);
      background: linear-gradient(180deg, rgba(255, 253, 249, 0.96) 0%, rgba(255, 246, 242, 0.94) 100%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 8px 18px 8px 12px;
      border-radius: 999px;
      box-shadow:
        0 8px 22px rgba(155, 105, 122, 0.24),
        inset 0 2px 4px rgba(255, 255, 255, 0.9),
        inset 0 -2px 4px rgba(235, 194, 204, 0.32);
      border: 2px solid #ffd4e0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #5c3c48;
      letter-spacing: -0.01em;
      pointer-events: none;
      user-select: none;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.15s ease, border-color 0.15s ease;
      z-index: 110;
      white-space: nowrap;
    }
    .interaction-prompt.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    .interaction-prompt.visible:hover {
      transform: translateX(-50%) translateY(-2px);
      box-shadow: 0 10px 26px rgba(165, 110, 128, 0.3);
      border-color: #ffb2c8;
    }
    .interaction-prompt.visible:active {
      transform: translateX(-50%) scale(0.97);
    }

    .prompt-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      background: linear-gradient(135deg, #ff9fb8 0%, #ff7ea0 100%);
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      border-radius: 8px;
      box-shadow:
        0 3px 6px rgba(235, 108, 142, 0.32),
        inset 0 1px 2px rgba(255, 255, 255, 0.55);
      line-height: 1;
      flex-shrink: 0;
    }
    .interaction-prompt.touch-mode .prompt-key {
      padding: 0 9px;
      font-size: 11.5px;
    }
    .prompt-icon {
      font-size: 15px;
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

    /* ----------------- 클레이 대화창 스테이지 ----------------- */
    .dialogue-stage {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding: 16px 24px 28px;
      box-sizing: border-box;
      background: linear-gradient(180deg, rgba(40, 26, 32, 0) 52%, rgba(44, 28, 36, 0.24) 100%);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.26s ease, visibility 0.26s ease;
      z-index: 180;
      font-family: "Pretendard", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
    }
    .dialogue-stage.night-mode {
      background: linear-gradient(180deg, rgba(16, 14, 34, 0) 45%, rgba(18, 15, 42, 0.42) 100%);
    }
    .dialogue-stage.open {
      opacity: 1;
      visibility: visible;
    }

    .dialogue-wrapper {
      width: min(94vw, 860px);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      pointer-events: none;
    }

    /* 우측 대화 선택지 스택 */
    .dialogue-choices-panel {
      align-self: flex-end;
      width: min(100%, 360px);
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
      opacity: 0;
      transform: translateY(10px) scale(0.97);
      transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .dialogue-choices-panel.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .dialogue-choices-hint {
      align-self: flex-end;
      font-size: 11.5px;
      font-weight: 800;
      color: #fffaf7;
      background: rgba(94, 62, 72, 0.7);
      backdrop-filter: blur(6px);
      padding: 3px 11px;
      border-radius: 999px;
      letter-spacing: 0.01em;
    }
    .dialogue-stage.night-mode .dialogue-choices-hint {
      background: rgba(42, 36, 74, 0.82);
      color: #ebe4ff;
      border: 1px solid rgba(175, 162, 235, 0.35);
    }

    .dialogue-choice-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      padding: 11px 16px 11px 12px;
      border-radius: 20px;
      background: linear-gradient(180deg, #fffdf9 0%, #fff4f0 100%);
      border: 2.5px solid #f4cfd9;
      box-shadow:
        0 8px 20px rgba(130, 82, 98, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.95),
        inset 0 -3px 6px rgba(235, 195, 205, 0.3);
      color: #4f353f;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.35;
      cursor: pointer;
      transition:
        transform 0.16s cubic-bezier(0.22, 1, 0.36, 1),
        background 0.16s ease,
        border-color 0.16s ease,
        box-shadow 0.16s ease,
        color 0.16s ease;
    }
    .dialogue-choice-btn:hover,
    .dialogue-choice-btn.active {
      transform: translateX(-4px) translateY(-1px);
      background: linear-gradient(135deg, #fff2f6 0%, #ffe0ea 100%);
      border-color: #ff94b2;
      color: #84334f;
      box-shadow:
        0 10px 24px rgba(225, 120, 150, 0.3),
        0 0 0 3px rgba(255, 196, 214, 0.45),
        inset 0 2px 5px rgba(255, 255, 255, 0.9);
    }
    .dialogue-choice-btn:active {
      transform: translateX(-2px) scale(0.985);
    }

    /* 밤 수인 모드 선택지 테마 */
    .dialogue-stage.night-mode .dialogue-choice-btn {
      background: linear-gradient(180deg, rgba(54, 47, 86, 0.96) 0%, rgba(40, 34, 68, 0.96) 100%);
      border-color: #8276b8;
      color: #f4eeff;
      box-shadow:
        0 10px 24px rgba(16, 12, 36, 0.48),
        inset 0 2px 4px rgba(255, 255, 255, 0.12),
        inset 0 -3px 6px rgba(18, 14, 40, 0.4);
    }
    .dialogue-stage.night-mode .dialogue-choice-btn:hover,
    .dialogue-stage.night-mode .dialogue-choice-btn.active {
      background: linear-gradient(135deg, #564a8f 0%, #443878 100%);
      border-color: #d6c8ff;
      color: #fff6cf;
      box-shadow:
        0 10px 26px rgba(90, 76, 168, 0.5),
        0 0 0 3px rgba(188, 174, 255, 0.32),
        inset 0 2px 5px rgba(255, 255, 255, 0.2);
    }

    .dialogue-choice-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 999px;
      background: #fde3ec;
      color: #9e4866;
      font-size: 12px;
      font-weight: 900;
      flex-shrink: 0;
      transition: background 0.16s ease, color 0.16s ease;
    }
    .dialogue-choice-btn:hover .dialogue-choice-num,
    .dialogue-choice-btn.active .dialogue-choice-num {
      background: linear-gradient(135deg, #ff99b6, #f27298);
      color: #ffffff;
    }
    .dialogue-stage.night-mode .dialogue-choice-num {
      background: rgba(154, 142, 214, 0.28);
      color: #dfd6ff;
    }
    .dialogue-stage.night-mode .dialogue-choice-btn:hover .dialogue-choice-num,
    .dialogue-stage.night-mode .dialogue-choice-btn.active .dialogue-choice-num {
      background: linear-gradient(135deg, #ffd884, #f0ae5b);
      color: #2b2042;
    }

    .dialogue-choice-label {
      flex: 1;
    }
    .dialogue-choice-arrow {
      font-size: 14px;
      color: #d694a8;
      opacity: 0.45;
      transform: translateX(0);
      transition: opacity 0.16s ease, transform 0.16s ease, color 0.16s ease;
    }
    .dialogue-choice-btn:hover .dialogue-choice-arrow,
    .dialogue-choice-btn.active .dialogue-choice-arrow {
      opacity: 1;
      color: #ea6c92;
      transform: translateX(2px);
    }
    .dialogue-stage.night-mode .dialogue-choice-arrow {
      color: #c7bbff;
    }
    .dialogue-stage.night-mode .dialogue-choice-btn:hover .dialogue-choice-arrow,
    .dialogue-stage.night-mode .dialogue-choice-btn.active .dialogue-choice-arrow {
      color: #ffe294;
    }

    /* 하단 넓은 클레이 대화 패널 */
    .dialogue-modal {
      position: relative;
      width: 100%;
      min-height: 158px;
      box-sizing: border-box;
      background: linear-gradient(180deg, rgba(255, 253, 250, 0.98) 0%, rgba(255, 246, 244, 0.97) 100%);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: 30px;
      padding: 20px 26px 18px 22px;
      border: 3.5px solid #ffd6e2;
      box-shadow:
        0 20px 48px rgba(130, 82, 102, 0.28),
        0 4px 12px rgba(130, 82, 102, 0.12),
        inset 0 4px 10px rgba(255, 255, 255, 0.95),
        inset 0 -5px 12px rgba(240, 198, 212, 0.34);
      color: #4a343e;
      display: flex;
      align-items: stretch;
      gap: 20px;
      pointer-events: none;
      transform: translateY(28px) scale(0.96);
      transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
      cursor: pointer;
    }
    .dialogue-stage.open .dialogue-modal {
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* 밤 수인 모드 하단 대화창 테마 */
    .dialogue-stage.night-mode .dialogue-modal {
      background: linear-gradient(180deg, rgba(46, 40, 74, 0.97) 0%, rgba(33, 28, 56, 0.97) 100%);
      border-color: #9386cc;
      color: #f6f1ff;
      box-shadow:
        0 22px 54px rgba(14, 10, 34, 0.56),
        inset 0 3px 8px rgba(210, 198, 255, 0.18),
        inset 0 -5px 12px rgba(16, 12, 36, 0.46);
    }

    /* 왼쪽 NPC 얼굴 프로필 */
    .dialogue-portrait-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dialogue-portrait-frame {
      width: 96px;
      height: 96px;
      border-radius: 26px;
      padding: 5px;
      box-sizing: border-box;
      background: linear-gradient(145deg, #fff5f8, #ffd9e5);
      border: 3px solid #ffffff;
      box-shadow:
        0 8px 20px rgba(175, 115, 138, 0.24),
        inset 0 2px 5px rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .dialogue-stage.night-mode .dialogue-portrait-frame {
      background: linear-gradient(145deg, #5c5096, #352d5c);
      border-color: #c8bcff;
      box-shadow:
        0 8px 24px rgba(18, 12, 46, 0.5),
        0 0 14px rgba(175, 160, 255, 0.28);
    }
    .npc-portrait-svg {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      display: block;
    }
    .npc-portrait-emoji {
      font-size: 46px;
      line-height: 1;
    }

    /* 중앙/우측 본문 */
    .dialogue-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }

    .dialogue-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .dialogue-speaker-group {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .dialogue-name-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #ffeaf0 0%, #ffd9e5 100%);
      padding: 5px 16px;
      border-radius: 999px;
      font-size: 15.5px;
      font-weight: 900;
      color: #883d58;
      border: 1.8px solid #ffbfd2;
      box-shadow:
        0 3px 8px rgba(190, 110, 138, 0.14),
        inset 0 1px 2px rgba(255, 255, 255, 0.85);
    }
    .dialogue-stage.night-mode .dialogue-name-badge {
      background: linear-gradient(135deg, #62549e 0%, #4b3f82 100%);
      border-color: #b7a9f5;
      color: #fff5ce;
      box-shadow: 0 3px 10px rgba(22, 16, 52, 0.35);
    }

    .dialogue-role-tag {
      font-size: 11.5px;
      font-weight: 800;
      color: #9e6b7c;
      background: rgba(255, 245, 248, 0.92);
      border: 1px solid #f5cfd9;
      padding: 3px 10px;
      border-radius: 999px;
    }
    .dialogue-stage.night-mode .dialogue-role-tag {
      background: rgba(84, 72, 136, 0.65);
      border-color: #9b8ed6;
      color: #e4dcff;
    }

    .dialogue-time-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 999px;
      background: #fff5df;
      border: 1px solid #f3d79e;
      color: #a66c1f;
    }
    .dialogue-stage.night-mode .dialogue-time-pill {
      background: rgba(255, 224, 138, 0.16);
      border-color: rgba(255, 224, 138, 0.45);
      color: #ffe79e;
    }

    .dialogue-close-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(246, 228, 234, 0.72);
      border: 1.5px solid #eecbd6;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      color: #8f6272;
      cursor: pointer;
      padding: 5px 11px;
      border-radius: 999px;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .dialogue-close-btn:hover {
      background: #ffdfe9;
      color: #6b3549;
      transform: scale(1.03);
    }
    .dialogue-stage.night-mode .dialogue-close-btn {
      background: rgba(98, 86, 152, 0.45);
      border-color: #8d80c4;
      color: #e5deff;
    }
    .dialogue-stage.night-mode .dialogue-close-btn:hover {
      background: rgba(124, 110, 184, 0.68);
      color: #ffffff;
    }

    .dialogue-content {
      font-size: 17px;
      line-height: 1.66;
      min-height: 62px;
      color: #4a343e;
      font-weight: 600;
      white-space: pre-line;
      word-break: keep-all;
      letter-spacing: -0.01em;
    }
    .dialogue-stage.night-mode .dialogue-content {
      color: #f6f1ff;
    }

    .dialogue-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 6px;
      border-top: 1.5px dashed #f3d5df;
      font-size: 12.5px;
      color: #9b7080;
      font-weight: 700;
    }
    .dialogue-stage.night-mode .dialogue-footer {
      border-top-color: rgba(168, 154, 230, 0.35);
      color: #c7bde8;
    }
    .dialogue-shortcuts {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .dialogue-shortcuts kbd {
      background: #f5e0e8;
      border: 1px solid #e9c5d2;
      padding: 2px 7px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 800;
      color: #7c485c;
    }
    .dialogue-stage.night-mode .dialogue-shortcuts kbd {
      background: rgba(145, 132, 206, 0.28);
      border-color: rgba(186, 174, 240, 0.45);
      color: #f0eaff;
    }

    .dialogue-next-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #c95a7e;
      font-weight: 800;
      font-size: 13px;
      white-space: nowrap;
    }
    .dialogue-stage.night-mode .dialogue-next-indicator {
      color: #ffe18f;
    }
    .dialogue-next-arrow {
      display: inline-block;
      animation: dialogueBounce 1.15s ease-in-out infinite;
    }
    @keyframes dialogueBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(3px); }
    }

    /* 반응형 레이아웃 */
    @media (max-width: 768px) {
      .dialogue-stage {
        padding: 12px 12px 18px;
      }
      .dialogue-wrapper {
        width: 100%;
        gap: 10px;
      }
      .dialogue-choices-panel {
        width: 100%;
        max-width: 380px;
      }
      .dialogue-choice-btn {
        padding: 10px 14px 10px 11px;
        font-size: 13.5px;
        border-radius: 17px;
      }
      .dialogue-modal {
        padding: 15px 16px 14px;
        border-radius: 24px;
        gap: 14px;
        min-height: 136px;
      }
      .dialogue-portrait-frame {
        width: 72px;
        height: 72px;
        border-radius: 20px;
      }
      .npc-portrait-emoji {
        font-size: 36px;
      }
      .dialogue-name-badge {
        font-size: 14px;
        padding: 4px 13px;
      }
      .dialogue-content {
        font-size: 15px;
        min-height: 52px;
      }
      .dialogue-shortcuts {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .dialogue-portrait-frame {
        width: 58px;
        height: 58px;
        border-radius: 16px;
      }
      .dialogue-content {
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(style);

  // ---------------- 1. 상호작용 안내 프롬프트 ----------------
  const promptEl = document.createElement('button');
  promptEl.type = 'button';
  promptEl.className = 'interaction-prompt';
  promptEl.setAttribute('aria-live', 'polite');
  promptEl.innerHTML = `<span class="prompt-icon">💬</span><span class="prompt-key">E</span><span class="prompt-text">대화하기</span>`;
  document.body.appendChild(promptEl);

  const promptIconEl = promptEl.querySelector('.prompt-icon');
  const promptKeyEl = promptEl.querySelector('.prompt-key');
  const promptTextEl = promptEl.querySelector('.prompt-text');

  let isTouchMode =
    typeof window !== 'undefined' &&
    ((typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024));

  let lastActionText = '대화하기';
  let lastActionIcon = '💬';
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
      promptTextEl.textContent = cleanText.startsWith('터치하여') ? cleanText : `터치하여 ${cleanText}`;
    } else {
      promptKeyEl.textContent = 'E';
      promptTextEl.textContent = cleanText.replace(/^E\s*키를\s*눌러\s*/, '').replace(/^키를\s*눌러\s*/, '');
    }
  }

  window.addEventListener('pointerdown', (e) => {
    const nextTouch = e.pointerType === 'touch';
    if (nextTouch !== isTouchMode) {
      isTouchMode = nextTouch;
      if (promptEl.classList.contains('visible')) renderPromptContent();
    }
  }, { passive: true });

  window.addEventListener('keydown', () => {
    const isCoarsePrimary = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (isTouchMode && !isCoarsePrimary) {
      isTouchMode = false;
      if (promptEl.classList.contains('visible')) renderPromptContent();
    }
  }, { passive: true });

  promptEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  promptEl.addEventListener('click', (e) => {
    e.stopPropagation();
    promptEl.blur();
    if (!promptEl.classList.contains('visible') || isOpen) return;
    if (typeof onPromptTapCallback === 'function') {
      onPromptTapCallback();
    }
  });

  // ---------------- 2. 클레이 대화창 + 우측 선택지 ----------------
  const stageEl = document.createElement('div');
  stageEl.className = 'dialogue-stage';
  stageEl.innerHTML = `
    <div class="dialogue-wrapper">
      <div class="dialogue-choices-panel" role="listbox" aria-label="대화 선택지"></div>
      <div class="dialogue-modal" role="dialog" aria-modal="true" aria-label="NPC 대화창">
        <div class="dialogue-portrait-col">
          <div class="dialogue-portrait-frame"></div>
        </div>
        <div class="dialogue-body">
          <div class="dialogue-header">
            <div class="dialogue-speaker-group">
              <span class="dialogue-name-badge"></span>
              <span class="dialogue-role-tag"></span>
              <span class="dialogue-time-pill"></span>
            </div>
            <button type="button" class="dialogue-close-btn" aria-label="대화 종료">ESC ✕</button>
          </div>
          <div class="dialogue-content"></div>
          <div class="dialogue-footer">
            <div class="dialogue-shortcuts"></div>
            <div class="dialogue-next-indicator">
              <span class="dialogue-next-label">다음</span>
              <span class="dialogue-next-arrow">▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(stageEl);

  const choicesPanelEl = stageEl.querySelector('.dialogue-choices-panel');
  const modalEl = stageEl.querySelector('.dialogue-modal');
  const portraitFrameEl = stageEl.querySelector('.dialogue-portrait-frame');
  const nameBadgeEl = stageEl.querySelector('.dialogue-name-badge');
  const roleTagEl = stageEl.querySelector('.dialogue-role-tag');
  const timePillEl = stageEl.querySelector('.dialogue-time-pill');
  const closeBtn = stageEl.querySelector('.dialogue-close-btn');
  const contentEl = stageEl.querySelector('.dialogue-content');
  const shortcutsEl = stageEl.querySelector('.dialogue-shortcuts');
  const nextLabelEl = stageEl.querySelector('.dialogue-next-label');
  const nextArrowEl = stageEl.querySelector('.dialogue-next-arrow');

  // 대화 상태
  let isOpen = false;
  let currentNpc = null;
  let currentPeriod = 'day';
  let onCloseCallback = null;

  // 세션 상태 (트리 분기 및 선형 대사 모두 지원)
  let activeTree = null;
  let currentNode = null;
  let currentLines = [];
  let lineIndex = 0;
  let activeChoices = [];
  let highlightedChoiceIdx = 0;
  let selectedChoices = [];
  let triggeredQuestHooks = [];
  let discoveredClues = [];

  // 타이핑 효과 상태
  let fullLineText = '';
  let typedLength = 0;
  let isTyping = false;
  let typingTimer = null;

  function stopTyping(revealAll = false) {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    if (revealAll && isTyping) {
      typedLength = fullLineText.length;
      contentEl.textContent = fullLineText;
    }
    isTyping = false;
    updateChoicesAndFooter();
  }

  function startTyping(text) {
    stopTyping(false);
    fullLineText = String(text || '');
    typedLength = 0;
    contentEl.textContent = '';

    if (fullLineText.length === 0) {
      isTyping = false;
      updateChoicesAndFooter();
      return;
    }

    isTyping = true;
    hideChoices();
    updateFooter();

    typingTimer = setInterval(() => {
      typedLength += 1;
      contentEl.textContent = fullLineText.slice(0, typedLength);
      if (typedLength >= fullLineText.length) {
        stopTyping(false);
      }
    }, 20);
  }

  function hideChoices() {
    choicesPanelEl.classList.remove('visible');
    choicesPanelEl.innerHTML = '';
    activeChoices = [];
  }

  function renderChoices(choices) {
    activeChoices = Array.isArray(choices) ? choices : [];
    highlightedChoiceIdx = 0;

    if (activeChoices.length === 0) {
      hideChoices();
      return;
    }

    choicesPanelEl.innerHTML = `<div class="dialogue-choices-hint">선택지 고르기 (↑↓ / 1-${activeChoices.length} / 클릭)</div>`;

    activeChoices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `dialogue-choice-btn${idx === highlightedChoiceIdx ? ' active' : ''}`;
      btn.setAttribute('role', 'option');
      btn.dataset.choiceIndex = String(idx);
      btn.innerHTML = `
        <span class="dialogue-choice-num">${idx + 1}</span>
        <span class="dialogue-choice-label">${choice.text}</span>
        <span class="dialogue-choice-arrow">▶</span>
      `;
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('mouseenter', () => {
        setHighlightedChoice(idx);
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectChoice(idx);
      });
      choicesPanelEl.appendChild(btn);
    });

    choicesPanelEl.classList.add('visible');
  }

  function setHighlightedChoice(idx) {
    if (activeChoices.length === 0) return;
    highlightedChoiceIdx = (idx + activeChoices.length) % activeChoices.length;
    const buttons = choicesPanelEl.querySelectorAll('.dialogue-choice-btn');
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === highlightedChoiceIdx);
    });
  }

  function updateFooter() {
    const isLastLineOfNode = lineIndex >= currentLines.length - 1;
    const hasChoicesNow =
      !isTyping && isLastLineOfNode && currentNode && Array.isArray(currentNode.choices) && currentNode.choices.length > 0;

    if (hasChoicesNow) {
      shortcutsEl.innerHTML = `<kbd>↑↓</kbd> 이동 · <kbd>Enter</kbd> / <kbd>1-${currentNode.choices.length}</kbd> 선택 · <kbd>ESC</kbd> 닫기`;
      nextLabelEl.textContent = '선택지 선택';
      nextArrowEl.textContent = '✨';
    } else if (isTyping) {
      shortcutsEl.innerHTML = `<kbd>Space</kbd> / <kbd>Enter</kbd> 전체 보기 · <kbd>ESC</kbd> 닫기`;
      nextLabelEl.textContent = '대화 중...';
      nextArrowEl.textContent = '…';
    } else {
      const isFinalEnd =
        isLastLineOfNode &&
        (!currentNode || (!currentNode.next && (!currentNode.choices || currentNode.choices.length === 0)));
      shortcutsEl.innerHTML = isTouchMode
        ? '대화창을 터치하여 계속'
        : `<kbd>Space</kbd> / <kbd>Enter</kbd> 계속 · <kbd>ESC</kbd> 닫기`;
      nextLabelEl.textContent = isFinalEnd ? '대화 마치기' : '다음 대사';
      nextArrowEl.textContent = isFinalEnd ? '✓' : '▼';
    }
  }

  function updateChoicesAndFooter() {
    const isLastLineOfNode = lineIndex >= currentLines.length - 1;
    if (!isTyping && isLastLineOfNode && currentNode && Array.isArray(currentNode.choices) && currentNode.choices.length > 0) {
      renderChoices(currentNode.choices);
    } else {
      hideChoices();
    }
    updateFooter();
  }

  function recordNodeRewards(node) {
    if (!node) return;
    if (node.questHook && !triggeredQuestHooks.includes(node.questHook)) {
      triggeredQuestHooks.push(node.questHook);
    }
    if (node.clueId && !discoveredClues.some((c) => c.id === node.clueId)) {
      discoveredClues.push({ id: node.clueId, title: node.clueTitle || node.clueId });
    }
  }

  function enterNode(nodeId) {
    if (!activeTree || !activeTree.nodes || !activeTree.nodes[nodeId]) {
      close({ completed: true });
      return;
    }
    currentNode = activeTree.nodes[nodeId];
    currentLines = Array.isArray(currentNode.lines) ? currentNode.lines : [''];
    lineIndex = 0;
    recordNodeRewards(currentNode);
    startTyping(currentLines[lineIndex]);
  }

  function selectChoice(idx) {
    if (!isOpen || activeChoices.length === 0) return;
    const choice = activeChoices[idx];
    if (!choice) return;

    selectedChoices.push(choice.id || choice.text);
    if (choice.questHook && !triggeredQuestHooks.includes(choice.questHook)) {
      triggeredQuestHooks.push(choice.questHook);
    }
    if (choice.clueId && !discoveredClues.some((c) => c.id === choice.clueId)) {
      discoveredClues.push({ id: choice.clueId, title: choice.clueTitle || choice.clueId });
    }

    hideChoices();

    if (choice.next && activeTree?.nodes?.[choice.next]) {
      enterNode(choice.next);
    } else if (Array.isArray(choice.lines) && choice.lines.length > 0) {
      currentNode = { lines: choice.lines, next: choice.afterNext || null };
      currentLines = choice.lines;
      lineIndex = 0;
      startTyping(currentLines[0]);
    } else {
      close({ completed: true });
    }
  }

  function advance() {
    if (!isOpen || !currentNpc) return;

    if (isTyping) {
      stopTyping(true);
      return;
    }

    if (activeChoices.length > 0) {
      selectChoice(highlightedChoiceIdx);
      return;
    }

    if (lineIndex + 1 < currentLines.length) {
      lineIndex += 1;
      startTyping(currentLines[lineIndex]);
      return;
    }

    if (currentNode && currentNode.next && activeTree?.nodes?.[currentNode.next]) {
      enterNode(currentNode.next);
      return;
    }

    close({ completed: true });
  }

  function close(meta = { completed: false }) {
    if (!isOpen) return;
    stopTyping(false);
    hideChoices();

    const finishedNpc = currentNpc;
    const cb = onCloseCallback;
    const result = {
      completed: Boolean(meta?.completed),
      npcId: finishedNpc?.id || finishedNpc?.type || null,
      period: currentPeriod,
      selectedChoices: [...selectedChoices],
      triggeredQuestHooks: [...triggeredQuestHooks],
      discoveredClues: [...discoveredClues]
    };

    isOpen = false;
    currentNpc = null;
    activeTree = null;
    currentNode = null;
    currentLines = [];
    lineIndex = 0;
    selectedChoices = [];
    triggeredQuestHooks = [];
    discoveredClues = [];
    onCloseCallback = null;

    stageEl.classList.remove('open');

    if (typeof cb === 'function') {
      cb(result);
    }
  }

  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close({ completed: false });
  });

  modalEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  modalEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeChoices.length > 0 && !isTyping) return;
    advance();
  });

  // 키보드 단축키 핸들러 (캡처 단계에서 처리하여 게임 이동/상호작용 키로 새지 않도록 완전 차단)
  window.addEventListener(
    'keydown',
    (e) => {
      if (!isOpen) return;

      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close({ completed: false });
        return;
      }

      if (activeChoices.length > 0 && !isTyping) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setHighlightedChoice(highlightedChoiceIdx - 1);
          return;
        }
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          e.stopImmediatePropagation();
          setHighlightedChoice(highlightedChoiceIdx + 1);
          return;
        }
        if (e.code.startsWith('Digit')) {
          const num = parseInt(e.code.replace('Digit', ''), 10);
          if (num >= 1 && num <= activeChoices.length) {
            e.preventDefault();
            e.stopImmediatePropagation();
            selectChoice(num - 1);
            return;
          }
        }
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          e.stopImmediatePropagation();
          selectChoice(highlightedChoiceIdx);
          return;
        }
      } else {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          e.stopImmediatePropagation();
          advance();
          return;
        }
      }

      // 대화 중 게임 이동 및 기타 단축키 누수 방지
      if (
        e.code === 'KeyE' ||
        e.code === 'KeyI' ||
        e.code === 'KeyM' ||
        e.code === 'KeyW' ||
        e.code === 'KeyA' ||
        e.code === 'KeyS' ||
        e.code === 'KeyD' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  return {
    onPromptTap(cb) {
      onPromptTapCallback = cb;
    },
    showPrompt(text = '대화하기', icon = '💬') {
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
    /**
     * 동물 NPC 대화 시작
     * @param {object} npc - NPC 객체
     * @param {function} onClose - 종료 콜백 ({ completed, npcId, period, selectedChoices, triggeredQuestHooks, discoveredClues })
     * @param {object} options - { isNight, resolvedTree, customLines }
     */
    openDialogue(npc, onClose = null, options = {}) {
      if (!npc || !npc.data) return;

      const isNight = Boolean(options.isNight);
      currentPeriod = isNight ? 'night' : 'day';
      currentNpc = npc;
      onCloseCallback = onClose;
      selectedChoices = [];
      triggeredQuestHooks = [];
      discoveredClues = [];
      isOpen = true;

      // 낮/밤 테마 및 동물 초상화 반영
      stageEl.classList.toggle('night-mode', isNight);
      portraitFrameEl.innerHTML = createPortraitMarkup(npc.data, isNight);
      nameBadgeEl.textContent = npc.data.displayName || npc.data.name || '주민';

      const roleText = isNight
        ? npc.data.nightRole || npc.data.role || '밤의 모습'
        : npc.data.dayRole || npc.data.role || '마을 주민';
      roleTagEl.textContent = roleText;
      roleTagEl.style.display = 'inline-flex';
      timePillEl.textContent = isNight ? '🌙 달빛에 깨어난 모습' : '☀️ 낮 · 일상';

      promptEl.classList.remove('visible');
      stageEl.classList.add('open');

      // 1) 낮/밤 분기 대화 트리
      const tree = options.resolvedTree || null;
      if (tree && tree.nodes && tree.startNode) {
        activeTree = tree;
        enterNode(tree.startNode);
        return;
      }

      // 2) 단순 선형 대사 폴백
      activeTree = null;
      const lines =
        Array.isArray(options.customLines) && options.customLines.length > 0
          ? options.customLines
          : Array.isArray(npc.data.dialogues) && npc.data.dialogues.length > 0
            ? npc.data.dialogues
            : ['안녕! 오늘도 좋은 하루 보내!'];

      currentNode = { lines, next: null };
      currentLines = lines;
      lineIndex = 0;
      startTyping(currentLines[0]);
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
