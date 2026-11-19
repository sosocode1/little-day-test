// 퀘스트 상태 상수 및 퀘스트 데이터
export const QuestState = {
  NOT_STARTED: 'NOT_STARTED',         // 시작 전
  IN_PROGRESS: 'IN_PROGRESS',         // 진행 중 (꽃 모으는 중)
  READY_TO_COMPLETE: 'READY_TO_COMPLETE', // 수집 완료 (폭시에게 전달 가능)
  COMPLETED: 'COMPLETED'              // 퀘스트 완료 (보상 수령 완료)
};

export const QUEST_DATA = {
  id: 'fox_pink_flower',
  title: '폭시의 작은 부탁',
  targetCount: 3,
  reward: {
    id: 'pink_flower_pin',
    name: '분홍 꽃 머리핀',
    icon: '🌸',
    description: '폭시가 감사의 마음을 담아 선물한 귀여운 수제 꽃 머리핀'
  },
  dialogues: {
    // 1. 시작 전 (퀘스트 제안 및 수락)
    not_started: [
      '안녕! 날씨가 정말 따뜻하고 화창해서 기분이 좋아.',
      '혹시 마을 주변에서 분홍색 꽃 3개를 찾아줄 수 있어? 소중한 친구에게 줄 꽃다발을 만들고 싶거든!',
      '마을 정원 꽃밭과 산책로 주변을 잘 살펴보면 찾을 수 있을 거야. 부탁할게!'
    ],
    // 2. 진행 중 (꽃 수집 미완료)
    in_progress: (current, target) => [
      `분홍색 꽃을 찾고 있구나! 마을 주변에 활짝 피어 있을 거야.`,
      `아직 꽃이 더 필요해! (현재 모은 꽃: ${current}/${target}개)`
    ],
    // 3. 수집 완료 (꽃 3개 모두 모음 -> 전달)
    ready_to_complete: [
      '우와! 분홍색 꽃 3개를 모두 모아왔구나!',
      '정말 고마워! 덕분에 아주 예쁘고 향기로운 꽃다발을 만들 수 있겠어!',
      '이건 내 고마운 마음을 담은 작은 선물이야. 너에게 정말 잘 어울릴 거야!'
    ],
    // 4. 완료 후 (반복 보상 없음)
    completed: [
      '안녕! 네가 모아준 꽃으로 만든 꽃다발, 친구가 정말 좋아했어!',
      '머리에 단 분홍 꽃 머리핀이 정말 사랑스럽다! 언제든 놀러오렴.'
    ]
  }
};
