// LITTLE DAY 첫 번째 환경 탐험 퍼즐 데이터: 오래된 등대의 비밀 (The Secret of the Old Lighthouse)

export const LIGHTHOUSE_PUZZLE_ID = 'old_lighthouse_device';

// 장치에 새겨진 4개의 고대 문양
export const LIGHTHOUSE_SYMBOLS = [
  {
    id: 'moon',
    name: '달빛',
    icon: '🌙',
    color: '#7c9ef5',
    bg: '#eef3ff',
    border: '#bfd2ff',
    description: '가장 밝은 달빛이 비추는 첫 번째 문양'
  },
  {
    id: 'bell',
    name: '종소리',
    icon: '🔔',
    color: '#e5a336',
    bg: '#fff7e4',
    border: '#f5d48a',
    description: '세 번 울리며 잠든 등대를 깨우는 종의 문양'
  },
  {
    id: 'wave',
    name: '파도',
    icon: '🌊',
    color: '#43a7c7',
    bg: '#e8f7fc',
    border: '#a5dced',
    description: '밀려오는 바다와 물길을 뜻하는 파도 문양'
  },
  {
    id: 'star',
    name: '길잡이별',
    icon: '⭐',
    color: '#c97ae0',
    bg: '#f7ecff',
    border: '#dcb8f5',
    description: '밤하늘 끝에서 길을 비추는 마지막 별 문양'
  }
];

// 단서를 통해 논리적으로 추론되는 정답 순서: 달빛 -> 종소리 -> 파도 -> 길잡이별
export const LIGHTHOUSE_SOLUTION = ['moon', 'bell', 'wave', 'star'];

// 달빛 섬 등대 주변 배치 단서 4종 (실제 3D 오브젝트 좌표 + 조사 내용 + 퍼즐 힌트)
export const LIGHTHOUSE_CLUES = [
  {
    id: 'clue_lighthouse_sign',
    order: 1,
    symbolId: 'moon',
    propType: 'signpost',
    title: '오래된 나무 표지판',
    location: '등대 진입로 왼편',
    icon: '🪧',
    prompt: '오래된 나무 표지판 조사하기',
    position: { x: -4.8, z: -9.2 },
    interactRadius: 2.3,
    body: [
      '바닷바람에 닳아 글자가 희미해진 오래된 나무 표지판이다.',
      '"등대의 불빛은 세 번 울리는 종소리와 함께 깨어난다. 달빛이 가장 밝을 때 첫 번째 문양을 찾아라."'
    ],
    hintSummary: '① 첫 번째 문양은 🌙 달빛 — 달빛이 가장 밝을 때 첫 문양이 깨어난다.'
  },
  {
    id: 'clue_lighthouse_journal',
    order: 2,
    symbolId: 'bell',
    propType: 'crate_journal',
    title: '낡은 항해 기록 조각',
    location: '등대 오른편 모래 언덕',
    icon: '📖',
    prompt: '낡은 항해 기록 조각 조사하기',
    position: { x: 5.2, z: -9.5 },
    interactRadius: 2.3,
    body: [
      '오래된 나무 상자 위에 젖었다 마른 항해 일지 한 장이 놓여 있다.',
      '"안개가 짙어지던 밤, 등대지기는 달빛이 떠오른 직후 두 번째로 낡은 종을 울렸다. 세 번의 종소리가 바닷바람을 가르자 돌기둥의 장치가 미세하게 떨리기 시작했다."'
    ],
    hintSummary: '② 두 번째 문양은 🔔 종소리 — 달빛 다음으로 종을 울려 장치를 깨운다.'
  },
  {
    id: 'clue_lighthouse_carving',
    order: 3,
    symbolId: 'wave',
    propType: 'wall_tablet',
    title: '벽에 새겨진 기호',
    location: '등대 서쪽 돌벽 아래',
    icon: '🪨',
    prompt: '벽에 새겨진 기호 조사하기',
    position: { x: -3.2, z: -15.4 },
    interactRadius: 2.4,
    body: [
      '등대 서쪽 기단 돌벽에 누군가 급히 새겨 둔 문장과 물결 표시가 남아 있다.',
      '"종소리가 바다에 닿으면 세 번째는 밀려오는 파도의 문양을 눌러 물길을 열어라."'
    ],
    hintSummary: '③ 세 번째 문양은 🌊 파도 — 종소리 다음으로 파도 문양을 선택한다.'
  },
  {
    id: 'clue_lighthouse_paper',
    order: 4,
    symbolId: 'star',
    propType: 'driftwood_note',
    title: '오래된 종이 조각',
    location: '등대 동쪽 바위 틈',
    icon: '🗒️',
    prompt: '오래된 종이 조각 조사하기',
    position: { x: 5.8, z: -15.0 },
    interactRadius: 2.4,
    body: [
      '바위 틈 작은 조약돌 아래 접혀 있던 누런 종이 조각이다.',
      '"파도가 잠잠해진 뒤, 마지막 네 번째 문양은 밤하늘의 길잡이별이다. 네 개의 문양이 모두 맞물리면 등대 아래 숨겨진 기록이 모습을 드러내리라."'
    ],
    hintSummary: '④ 네 번째 문양은 ⭐ 길잡이별 — 파도 뒤 마지막 문양은 길잡이별이다.'
  }
];

// 등대 입구 및 숨겨진 비밀 석함 조사 텍스트
export const LIGHTHOUSE_LORE = {
  entranceLocked: {
    title: '굳게 잠긴 등대 입구',
    location: '하얀 등대 정면 출입구',
    icon: '🚪',
    body: [
      '소금기에 바랜 오래된 아치형 철문이 단단히 닫혀 있다. 내부로 들어가는 문은 녹슬어 열리지 않는다.',
      '문 오른쪽 돌기둥에 네 개의 문양이 새겨진 고대 장치가 설치되어 있으며, 주변 모래사장과 돌벽 곳곳에 등대지기가 남긴 단서가 흩어져 있다.'
    ],
    hintSummary: '등대 주변 단서를 모아 오른쪽 기호 장치의 순서를 맞춰 보세요.'
  },
  entranceUnlocked: {
    title: '깨어난 하얀 등대',
    location: '하얀 등대 정면 출입구',
    icon: '🗼',
    body: [
      '고대 기호 장치가 작동하자 등대 꼭대기에서 은은하고 신비로운 푸른 달빛 불빛이 되살아났다.',
      '문은 여전히 오래되어 열리지 않지만, 등대 왼쪽 기단 아래 숨겨져 있던 비밀 석함이 열려 오래된 항해 기록을 드러냈다.'
    ],
    hintSummary: '등대의 첫 번째 비밀이 밝혀졌습니다.'
  },
  vaultLocked: {
    title: '봉인된 돌 석함',
    location: '등대 왼쪽 기단 아래',
    icon: '🔒',
    body: [
      '등대 기단 아래 단단히 맞물린 작은 돌 석함이 숨겨져 있다. 틈새로 희미한 푸른 빛이 새어 나오지만 손으로는 열 수 없다.',
      '오른쪽의 오래된 등대 장치를 올바른 문양 순서로 작동시키면 봉인이 풀릴 것 같다.'
    ],
    hintSummary: '오래된 등대 장치의 퍼즐을 해결하면 이 석함이 열립니다.'
  },
  voyageLogStory: {
    title: '오래된 항해 기록',
    location: '등대 비밀 석함에서 발견',
    icon: '📜',
    body: [
      '열린 비밀 석함 안에서 방수 가죽으로 감싼 낡은 항해 기록부를 발견했다.',
      '"붉은 달이 뜬 밤, 안개 너머로 떠난 배들은 끝내 돌아오지 못했다. 나는 사라진 이들의 이름을 이 기록에 남기고, 누군가 다시 등대의 불빛을 깨울 날을 기다린다..."',
      '빛바랜 종이에는 오래전 이 섬에서 사라진 사람들의 이름과 알 수 없는 날짜들이 빼곡히 적혀 있다.'
    ],
    hintSummary: '새로운 이야기 단서 획득! 내 가방 [I]에서 "오래된 항해 기록"을 확인할 수 있습니다.'
  }
};

export function getLighthouseSymbol(symbolId) {
  return LIGHTHOUSE_SYMBOLS.find((s) => s.id === symbolId) || null;
}

export function getLighthouseClue(clueId) {
  return LIGHTHOUSE_CLUES.find((c) => c.id === clueId) || null;
}
