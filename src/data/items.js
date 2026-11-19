// LITTLE DAY 아이템 데이터 정의 및 타입 상수

export const ItemType = {
  HEAD: 'head',       // 헤어 액세서리, 모자, 머리핀
  OUTFIT: 'outfit',   // 의상, 원피스, 셔츠
  BACK: 'back',       // 가방, 날개 등 등 장식
  SHOES: 'shoes'      // 신발
};

export const ItemTypeName = {
  [ItemType.HEAD]: '헤어 액세서리',
  [ItemType.OUTFIT]: '의상',
  [ItemType.BACK]: '가방/등',
  [ItemType.SHOES]: '신발'
};

export const ITEMS = {
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
  }
};

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
