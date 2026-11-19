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
  }
};

export function getItem(itemId) {
  return ITEMS[itemId] || null;
}
