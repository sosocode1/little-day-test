// 퀘스트 상태 상수(5단계) 및 확장 가능한 퀘스트 데이터 (NPC 아이템 전달 & 보상 구조)
export const QuestState = {
  NOT_STARTED: 'NOT_STARTED',             // 1. 진행 전
  IN_PROGRESS: 'IN_PROGRESS',             // 2. 아이템 수집 중
  READY_TO_COMPLETE: 'READY_TO_COMPLETE', // 3. 아이템 전달 가능
  DELIVERED: 'DELIVERED',                 // 4. 전달 완료
  COMPLETED: 'COMPLETED'                  // 5. 보상 지급 완료
};

export const QuestStateLabel = {
  [QuestState.NOT_STARTED]: '진행 전',
  [QuestState.IN_PROGRESS]: '아이템 수집 중',
  [QuestState.READY_TO_COMPLETE]: '아이템 전달 가능',
  [QuestState.DELIVERED]: '전달 완료',
  [QuestState.COMPLETED]: '보상 지급 완료'
};

export const QUEST_DATA = {
  id: 'fox_pink_flower',
  title: '폭시의 작은 부탁',
  giverNpcId: 'fox',
  deliveryNpcId: 'fox',
  targetCount: 3,
  // 확장 가능한 요구 아이템 목록 (여러 종류의 요구 아이템 추가 가능)
  requirements: [
    {
      itemId: 'pink_flower',
      name: '분홍색 꽃',
      icon: '🌸',
      count: 3
    }
  ],
  // 다단계 퀘스트 구조
  steps: [
    { id: 'collect_pink_flower', label: '분홍색 꽃 3개 모으기' },
    { id: 'deliver_to_fox', label: '폭시에게 꽃 전달하기' }
  ],
  // 확장 가능한 보상 목록 (여러 종류의 보상 아이템 추가 가능)
  rewards: [
    {
      itemId: 'shiny_shell',
      name: '반짝이는 조개',
      icon: '🐚',
      count: 1,
      description: '햇빛과 달빛을 받으면 영롱하게 빛나는 바닷가의 작은 조개껍데기다. 추후 이 섬의 다른 퀘스트나 숨겨진 퍼즐을 푸는 열쇠가 될지도 모른다.'
    }
  ],
  // 기존 단일 reward 참조 하위 호환
  reward: {
    id: 'shiny_shell',
    name: '반짝이는 조개',
    icon: '🐚',
    count: 1,
    description: '햇빛과 달빛을 받으면 영롱하게 빛나는 바닷가의 작은 조개껍데기다. 추후 이 섬의 다른 퀘스트나 숨겨진 퍼즐을 푸는 열쇠가 될지도 모른다.'
  },
  dialogues: {
    not_started: [
      '안녕! 날씨가 정말 따뜻하고 화창해서 기분이 좋아.',
      '혹시 마을 주변에서 분홍색 꽃 3개를 찾아줄 수 있어? 소중한 친구에게 줄 꽃다발을 만들고 싶거든!',
      '마을 정원 꽃밭과 산책로 주변을 잘 살펴보면 찾을 수 있을 거야. 부탁할게!'
    ],
    in_progress: (current, target) => [
      '분홍색 꽃을 찾고 있구나! 마을 주변에 활짝 피어 있을 거야.',
      `아직 꽃이 부족해서 전달할 수 없어! (보유 중: ${current}/${target}개)`
    ],
    ready_to_complete: [
      '우와! 정말 예쁜 꽃이야!\n이렇게 많이 모아주다니 정말 고마워!',
      '고마운 마음을 담아 바닷가에서 주운 반짝이는 조개를 선물로 줄게.\n분명 앞으로 이 섬의 비밀을 푸는 데 도움이 될 거야!'
    ],
    completed: [
      '네가 건네준 분홍색 꽃으로 정말 예쁜 꽃다발을 만들었어!',
      '선물로 건넨 반짝이는 조개는 가방에 잘 보관해 두렴. 언제든 또 놀러와!'
    ]
  }
};

// 첫 번째 메인 환경 탐험 퀘스트: 사라진 등대의 비밀
export const LIGHTHOUSE_QUEST_DATA = {
  id: 'lighthouse_secret',
  category: 'main',
  title: '사라진 등대의 비밀',
  icon: '🏛️',
  steps: [
    { id: 'explore_lighthouse', label: '등대 주변 탐색' },
    { id: 'find_clues', label: '오래된 단서 발견' },
    { id: 'inspect_device', label: '등대 장치 조사' },
    { id: 'solve_puzzle', label: '퍼즐 해결' },
    { id: 'obtain_log', label: '숨겨진 기록 획득' }
  ],
  rewards: [
    {
      itemId: 'old_voyage_log',
      name: '오래된 항해 기록',
      icon: '📜',
      count: 1,
      description: '오래전 이 섬에서 사라진 사람들의 이름이 기록되어 있다.'
    }
  ]
};

// 추후 NPC별/다단계 퀘스트 등록을 위한 퀘스트 레지스트리
export const QUEST_REGISTRY = {
  [QUEST_DATA.id]: QUEST_DATA,
  [LIGHTHOUSE_QUEST_DATA.id]: LIGHTHOUSE_QUEST_DATA
};

// 대화 선택지 → 퀘스트 연동용 훅 ID 상수
export const DIALOGUE_QUEST_HOOKS = {
  START_FOX_FLOWER: 'start_fox_pink_flower',
  REQUEST_FOX_FLOWER_DELIVERY: 'request_fox_pink_flower_delivery',
  COMPLETE_FOX_FLOWER: 'complete_fox_pink_flower',
  HINT_LIGHTHOUSE_DAY: 'hint_lighthouse_day',
  DISCOVER_LIGHTHOUSE_CLUE: 'discover_lighthouse_clue',
  DISCOVER_ISLAND_PAST_CLUE: 'discover_island_past_clue'
};
