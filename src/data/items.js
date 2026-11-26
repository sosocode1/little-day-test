// LITTLE DAY 아이템 데이터 정의 및 타입 상수

export const ItemType = {
  HEAD: 'head',       // 헤어 액세서리, 모자, 머리핀
  OUTFIT: 'outfit',   // 의상, 원피스, 셔츠
  BACK: 'back',       // 가방, 날개 등 등 장식
  SHOES: 'shoes',     // 신발
  COLLECTIBLE: 'collectible' // 탐험 수집품 (버섯, 꽃, 허브 등)
};

export const ItemTypeName = {
  [ItemType.HEAD]: '헤어 액세서리',
  [ItemType.OUTFIT]: '의상',
  [ItemType.BACK]: '가방/등',
  [ItemType.SHOES]: '신발',
  [ItemType.COLLECTIBLE]: '수집품'
};

export const ITEMS = {
  // 폭시의 퀘스트 완료 보상: 특별한 아이템 '달빛 브로치'
  moonlight_brooch: {
    id: 'moonlight_brooch',
    name: '달빛 브로치',
    type: ItemType.HEAD,
    categoryName: '헤어 액세서리',
    icon: '🌙',
    description: '은은한 달빛의 마법이 깃든 신비롭고 영롱한 수제 클레이 브로치입니다. 착용 시 은빛 달빛 기운이 머리칼에 감돕니다.',
    source: '폭시의 작은 부탁 퀘스트 완료 보상',
    modelType: 'moonlight_brooch',
    colors: {
      main: 0xa8c8ff,
      gold: 0xffe680,
      gem: 0xffffff,
      glow: 0x82b4ff
    }
  },

  // 폭시의 퀘스트 보상: 분홍 꽃 머리핀
  pink_flower_pin: {
    id: 'pink_flower_pin',
    name: '분홍 꽃 머리핀',
    type: ItemType.HEAD,
    categoryName: '헤어 액세서리',
    icon: '🌸',
    description: '폭시가 감사의 마음을 담아 선물한 귀여운 수제 꽃 머리핀입니다.',
    source: '폭시의 작은 부탁 퀘스트 보상',
    modelType: 'flower_pin',
    colors: {
      petal: 0xff6b8b,
      center: 0xffe070,
      leaf: 0x8ec89a
    }
  },

  // 밤 22:00 전용 미스터리 이벤트 보상: 신비로운 달빛 꽃
  moonflower: {
    id: 'moonflower',
    name: '신비로운 달빛 꽃',
    type: ItemType.HEAD,
    categoryName: '헤어 액세서리',
    icon: '🪻',
    description: '밤 22시 이후 차분한 달빛 아래 마을 외곽에서만 피어나는 신비로운 푸른빛 꽃입니다. 머리에 착용하면 은은한 달빛 기운이 감돕니다.',
    source: '밤의 미스터리: 사라진 달빛 꽃 이벤트 획득',
    modelType: 'moonflower',
    colors: {
      petal: 0x82b4ff,
      center: 0xf0f4ff,
      leaf: 0x7694bf,
      glow: 0x6e9eff
    }
  },

  // 헤어 장식 컬렉션
  mint_ribbon_beret: {
    id: 'mint_ribbon_beret',
    name: '민트 리본 베레모',
    type: ItemType.HEAD,
    categoryName: '헤어 액세서리',
    icon: '🎀',
    description: '부드러운 민트빛 펠트와 크림 리본이 어우러진 사랑스러운 베레모입니다.',
    source: '옷장 기본 컬렉션',
    modelType: 'beret',
    colors: {
      main: 0xb5e2cd,
      ribbon: 0xfff6ea,
      button: 0xfda5b8
    }
  },

  sunflower_clip: {
    id: 'sunflower_clip',
    name: '해바라기 헤어핀',
    type: ItemType.HEAD,
    categoryName: '헤어 액세서리',
    icon: '🌻',
    description: '마을 광장의 따스한 햇살을 머금은 노란 해바라기 머리핀입니다.',
    source: '옷장 기본 컬렉션',
    modelType: 'sunflower',
    colors: {
      petal: 0xffce42,
      center: 0x7c4932,
      leaf: 0x8ec89a
    }
  },

  // 의상 컬렉션
  spring_pastelle_dress: {
    id: 'spring_pastelle_dress',
    name: '봄빛 벚꽃 원피스',
    type: ItemType.OUTFIT,
    categoryName: '의상',
    icon: '👗',
    description: '부드러운 복숭아빛 원단과 사랑스러운 살구 프릴이 돋보이는 원피스입니다.',
    source: '옷장 기본 컬렉션',
    outfitType: 'dress',
    colors: {
      top: 0xffd9d3,
      bottom: 0xffe9e2,
      trim: 0xfffaf2,
      accent: 0xffa0b8
    }
  },

  lavender_ribbon_dress: {
    id: 'lavender_ribbon_dress',
    name: '라벤더 프릴 드레스',
    type: ItemType.OUTFIT,
    categoryName: '의상',
    icon: '👘',
    description: '은은한 라벤더 보랏빛과 우아한 순백 레이스가 사랑스러운 드레스입니다.',
    source: '옷장 기본 컬렉션',
    outfitType: 'dress',
    colors: {
      top: 0xd8cce8,
      bottom: 0xe6ddf2,
      trim: 0xffffff,
      accent: 0xb9a6d8
    }
  },

  adventurer_overalls: {
    id: 'adventurer_overalls',
    name: '모험가 데님 멜빵',
    type: ItemType.OUTFIT,
    categoryName: '의상',
    icon: '👕',
    description: '들판을 자유롭게 뛰어다니기 편한 산뜻한 하늘색 멜빵바지 세트입니다.',
    source: '옷장 기본 컬렉션',
    outfitType: 'pants',
    colors: {
      top: 0xfff6ea,
      bottom: 0x7ca1d4,
      trim: 0x5a7ca8,
      accent: 0xffbd59
    }
  },

  // 신발 컬렉션
  rose_strap_shoes: {
    id: 'rose_strap_shoes',
    name: '로즈 스트랩 로퍼',
    type: ItemType.SHOES,
    categoryName: '신발',
    icon: '👞',
    description: '폭신한 밑창과 사랑스러운 리본이 달린 장미빛 에나멜 로퍼입니다.',
    source: '옷장 기본 컬렉션',
    colors: {
      main: 0xf2b5c3,
      sole: 0xffffff,
      ribbon: 0xffe5ec
    }
  },

  mint_cookie_sneakers: {
    id: 'mint_cookie_sneakers',
    name: '민트 쿠키 스니커즈',
    type: ItemType.SHOES,
    categoryName: '신발',
    icon: '👟',
    description: '상쾌한 민트 컬러와 두툼한 쿠션으로 오래 걸어도 편안한 스니커즈입니다.',
    source: '옷장 기본 컬렉션',
    colors: {
      main: 0x98d9ba,
      sole: 0xf5f0ea,
      ribbon: 0x67c29b
    }
  },

  // 마을 수집품 및 추후 확장용 수집 아이템 데이터 (수량 관리 + NPC 전달 확장 구조)
  pink_flower: {
    id: 'pink_flower',
    name: '분홍색 꽃',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🌸',
    imageType: 'pink_flower',
    stackable: true,
    questId: 'fox_pink_flower',
    deliverable: true,
    description: '마을 주변에서 발견할 수 있는 예쁜 분홍색 꽃이다. 은은한 향기가 난다.',
    source: '마을 꽃밭 및 산책로 수집'
  },

  shiny_shell: {
    id: 'shiny_shell',
    name: '반짝이는 조개',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🐚',
    imageType: 'shiny_shell',
    stackable: true,
    deliverable: true,
    usableFor: ['quest', 'puzzle'],
    puzzleTag: 'island_shell_puzzle',
    description: '햇빛과 달빛을 받으면 영롱하게 빛나는 바닷가의 작은 조개껍데기다. 추후 이 섬의 다른 퀘스트나 숨겨진 퍼즐을 푸는 열쇠가 될지도 모른다.',
    source: '폭시의 작은 부탁 퀘스트 완료 보상'
  },

  old_letter: {
    id: 'old_letter',
    name: '오래된 편지',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '✉️',
    imageType: 'old_letter',
    stackable: true,
    deliverable: true,
    description: '세월의 흔적이 담긴 봉투 안에 섬의 옛 이야기가 적혀 있는 편지다.',
    source: '마을 미스터리 탐험 (추후 업데이트)'
  },

  mysterious_key: {
    id: 'mysterious_key',
    name: '수상한 열쇠',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🗝️',
    imageType: 'mysterious_key',
    stackable: true,
    deliverable: true,
    description: '어딘가 잠긴 문을 열 수 있을 것 같은 묵직하고 오래된 황동 열쇠다.',
    source: '숨겨진 장소 탐험 (추후 업데이트)'
  },

  island_clue: {
    id: 'island_clue',
    name: '섬의 비밀을 담은 단서',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🔍',
    imageType: 'island_clue',
    stackable: true,
    deliverable: true,
    description: '등대와 섬의 과거에 얽힌 진실을 풀기 위한 중요한 기록 조각이다.',
    source: '밤의 탐험 및 주민 대화 (추후 업데이트)'
  },

  // 첫 번째 환경 퍼즐(오래된 등대의 비밀) 완료 보상 단서 아이템
  old_voyage_log: {
    id: 'old_voyage_log',
    name: '오래된 항해 기록',
    type: ItemType.COLLECTIBLE,
    categoryName: '단서 기록',
    icon: '📜',
    imageType: 'old_voyage_log',
    stackable: false,
    questId: 'lighthouse_secret',
    deliverable: true,
    usableFor: ['quest', 'story'],
    description: '오래전 이 섬에서 사라진 사람들의 이름이 기록되어 있다.',
    source: '사라진 등대의 비밀 퍼즐 완료 보상'
  },

  // 속삭이는 숲 탐험 전용 수집 아이템 2종
  forest_dew_mushroom: {
    id: 'forest_dew_mushroom',
    name: '숲 이슬 버섯',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🍄',
    stackable: true,
    deliverable: true,
    description: '속삭이는 숲 그늘진 고목 아래에서 아침 이슬을 듬뿍 머금고 자란 통통하고 사랑스러운 붉은 버섯입니다. 달콤한 숲 향기가 납니다.',
    source: '속삭이는 숲 탐험 채집'
  },

  whisper_mint_herb: {
    id: 'whisper_mint_herb',
    name: '속삭임 민트 허브',
    type: ItemType.COLLECTIBLE,
    categoryName: '수집품',
    icon: '🌿',
    stackable: true,
    deliverable: true,
    description: '속삭이는 숲 맑은 시냇가 언덕에서 자라는 신선한 야생 허브입니다. 맑고 청량한 피톤치드 향이 주변에 은은하게 퍼집니다.',
    source: '속삭이는 숲 탐험 채집'
  }
};

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
