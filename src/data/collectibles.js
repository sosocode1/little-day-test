// LITTLE DAY 월드 수집 아이템 정의 및 스폰 레지스트리 (확장 가능한 수집 시스템 구조)
// 향후 반짝이는 조개, 오래된 편지, 수상한 열쇠, 섬의 비밀 단서 등을
// COLLECTIBLE_DEFINITIONS와 스폰 목록에 추가하면 동일한 수집 파이프라인으로 동작합니다.

export const CollectibleCategory = {
  FLOWER: 'flower',
  SHELL: 'shell',
  LETTER: 'letter',
  KEY: 'key',
  CLUE: 'clue'
};

export const COLLECTIBLE_DEFINITIONS = {
  pink_flower: {
    type: 'pink_flower',
    category: CollectibleCategory.FLOWER,
    name: '분홍색 꽃',
    icon: '🌸',
    prompt: '수집하기',
    interactRadius: 2.1,
    questId: 'fox_pink_flower',
    sparkleColors: [0xff9eb8, 0xffe484, 0xffffff, 0xffc6d9]
  },

  // 추후 확장을 위한 타입 스키마 예약 (이번 작업에서는 월드에 배치하지 않음)
  shiny_shell: {
    type: 'shiny_shell',
    category: CollectibleCategory.SHELL,
    name: '반짝이는 조개',
    icon: '🐚',
    prompt: '수집하기',
    interactRadius: 2.0,
    sparkleColors: [0xb8e4ff, 0xfff5c8, 0xffffff]
  },
  old_letter: {
    type: 'old_letter',
    category: CollectibleCategory.LETTER,
    name: '오래된 편지',
    icon: '✉️',
    prompt: '줍기',
    interactRadius: 2.0,
    sparkleColors: [0xf7dfb8, 0xfff8e6, 0xffd18c]
  },
  mysterious_key: {
    type: 'mysterious_key',
    category: CollectibleCategory.KEY,
    name: '수상한 열쇠',
    icon: '🗝️',
    prompt: '수집하기',
    interactRadius: 2.0,
    sparkleColors: [0xffe07d, 0xc9b8ff, 0xffffff]
  },
  island_clue: {
    type: 'island_clue',
    category: CollectibleCategory.CLUE,
    name: '섬의 비밀 단서',
    icon: '🔍',
    prompt: '조사하기',
    interactRadius: 2.1,
    sparkleColors: [0x9ec8ff, 0xdcc8ff, 0xffffff]
  }
};

// 마을 월드 분홍색 꽃 3개 배치 좌표 (기존 지형/꽃밭/산책로와 자연스럽고 충돌 없이 접근 가능한 위치)
export const VILLAGE_COLLECTIBLE_SPAWNS = [
  {
    id: 'flower_1',
    type: 'pink_flower',
    x: -3.5,
    z: 8.6,
    label: '마을 입구 꽃밭 옆'
  },
  {
    id: 'flower_2',
    type: 'pink_flower',
    x: -12.2,
    z: -3.8,
    label: '별장 앞 정원 꽃밭'
  },
  {
    id: 'flower_3',
    type: 'pink_flower',
    x: 2.5,
    z: -13.0,
    label: '북쪽 산책로 벚꽃나무 길목'
  }
];

export function getCollectibleDefinition(type) {
  return COLLECTIBLE_DEFINITIONS[type] || COLLECTIBLE_DEFINITIONS.pink_flower;
}
