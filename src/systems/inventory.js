// LITTLE DAY 아이템 보관함(인벤토리) 시스템
import { ITEMS, getItem, ItemType } from '../data/items.js';

export function createInventorySystem(player = null) {
  // 획득한 아이템 목록 (id -> item)
  const acquiredItems = new Map();

  // 슬롯별 현재 장착된 아이템 ID (head, outfit, back, shoes)
  const equipped = {
    [ItemType.HEAD]: null,
    [ItemType.OUTFIT]: null,
    [ItemType.BACK]: null,
    [ItemType.SHOES]: null
  };

  const listeners = new Set();
  function notify() {
    for (const cb of listeners) {
      cb({
        acquiredItems: Array.from(acquiredItems.values()),
        equipped: { ...equipped }
      });
    }
  }

  // 옷장 및 인벤토리 기본 보유 아이템 초기 등록 (퀘스트 보상 및 기본 컬렉션)
  for (const item of Object.values(ITEMS)) {
    // 달빛 꽃(moonflower)은 밤 22:00 미스터리 이벤트를 완료해야 획득 (완료 기록이 있을 때만 복원)
    if (item.id === 'moonflower') {
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('littleday_event_moonflower_done') === '1') {
          acquiredItems.set(item.id, item);
        }
      } catch (e) {}
    } else if (item.type === ItemType.COLLECTIBLE) {
      // 숲 수집품(버섯, 허브 등)은 직접 채집해야 인벤토리에 들어옴 (이전 채집 기록 복원 지원)
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem(`littleday_item_${item.id}`) === '1') {
          acquiredItems.set(item.id, item);
        }
      } catch (e) {}
    } else {
      acquiredItems.set(item.id, item);
    }
  }

  return {
    // 이벤트 리스너 등록
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    // 아이템 보유 여부 확인
    hasItem(itemId) {
      return acquiredItems.has(itemId);
    },

    // 아이템 획득 처리
    addItem(itemIdOrItem) {
      const id = typeof itemIdOrItem === 'string' ? itemIdOrItem : itemIdOrItem.id;
      const item = getItem(id) || (typeof itemIdOrItem === 'object' ? itemIdOrItem : null);
      if (!item) return false;

      acquiredItems.set(id, item);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`littleday_item_${id}`, '1');
        }
      } catch (e) {}
      notify();
      return true;
    },

    // 아이템 제거
    removeItem(itemId) {
      if (this.isEquipped(itemId)) {
        this.unequip(itemId);
      }
      const removed = acquiredItems.delete(itemId);
      if (removed) notify();
      return removed;
    },

    // 획득한 아이템 목록 반환 (타입별 필터 지원)
    getAcquiredItems(typeFilter = null) {
      const items = Array.from(acquiredItems.values());
      if (!typeFilter || typeFilter === 'all') return items;
      return items.filter((item) => item.type === typeFilter);
    },

    // 특정 아이템 장착 여부
    isEquipped(itemId) {
      return Object.values(equipped).includes(itemId);
    },

    // 특정 슬롯에 장착된 아이템 ID 반환
    getEquippedInSlot(slotType) {
      return equipped[slotType] || null;
    },

    // 아이템 장착
    equip(itemId) {
      const item = acquiredItems.get(itemId);
      if (!item) return false;

      const slotType = item.type || ItemType.HEAD;
      equipped[slotType] = item.id;

      // 실제 플레이어 캐릭터 메시 갱신
      if (player && typeof player.equipAccessory === 'function') {
        player.equipAccessory(item);
      }

      notify();
      return true;
    },

    // 아이템 착용 해제 (itemId 또는 slotType 전달 가능)
    unequip(itemOrSlot) {
      let targetSlot = null;

      // 1. slotType 직접 전달된 경우
      if (Object.keys(equipped).includes(itemOrSlot)) {
        targetSlot = itemOrSlot;
      } else {
        // 2. itemId가 전달된 경우 슬롯 탐색
        for (const [slot, id] of Object.entries(equipped)) {
          if (id === itemOrSlot) {
            targetSlot = slot;
            break;
          }
        }
      }

      if (!targetSlot || !equipped[targetSlot]) return false;

      equipped[targetSlot] = null;

      // 실제 플레이어 캐릭터 메시에서 제거
      if (player && typeof player.unequipAccessory === 'function') {
        player.unequipAccessory(targetSlot);
      }

      notify();
      return true;
    },

    // 장착/해제 토글
    toggleEquip(itemId) {
      if (this.isEquipped(itemId)) {
        return this.unequip(itemId);
      } else {
        return this.equip(itemId);
      }
    }
  };
}
