// LITTLE DAY 아이템 보관함(내 가방 / 인벤토리) 시스템
// - 아이템 보유 목록, 동일 아이템 수량(스택), 월드 수집 중복 방지(sourceId), 장착 슬롯, NPC 전달 확장 구조 지원
import { ITEMS, getItem, ItemType } from '../data/items.js';

export function createInventorySystem(player = null) {
  // 획득한 아이템 목록 (id -> item) 및 수량 (id -> count)
  const acquiredItems = new Map();
  const itemQuantities = new Map();
  // 월드에서 수집된 고유 오브젝트 ID 집합 (동일 꽃/아이템 중복 추가 방지)
  const collectedSourceIds = new Set();

  // 슬롯별 현재 장착된 아이템 ID (head, outfit, back, shoes)
  const equipped = {
    [ItemType.HEAD]: null,
    [ItemType.OUTFIT]: null,
    [ItemType.BACK]: null,
    [ItemType.SHOES]: null
  };

  const listeners = new Set();
  function notify() {
    const quantitiesObj = {};
    for (const [id, qty] of itemQuantities.entries()) {
      quantitiesObj[id] = qty;
    }
    for (const cb of listeners) {
      cb({
        acquiredItems: Array.from(acquiredItems.values()),
        quantities: quantitiesObj,
        equipped: { ...equipped }
      });
    }
  }

  function setItemInternal(item, qty = 1) {
    const cleanQty = Math.max(1, Math.floor(Number(qty) || 1));
    acquiredItems.set(item.id, item);
    itemQuantities.set(item.id, cleanQty);
  }

  // 옷장 및 인벤토리 기본 보유 아이템 초기 등록 (퀘스트 보상 및 기본 컬렉션)
  for (const item of Object.values(ITEMS)) {
    if (item.id === 'moonflower') {
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('littleday_event_moonflower_done') === '1') {
          setItemInternal(item, 1);
        }
      } catch (e) {}
    } else if (item.id === 'moonlight_brooch') {
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('littleday_item_moonlight_brooch') === '1') {
          setItemInternal(item, 1);
        }
      } catch (e) {}
    } else if (item.type === ItemType.COLLECTIBLE) {
      // 수집품은 실제로 수집해야 인벤토리에 추가됨 (이전 개별 localStorage 키 하위 호환)
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(`littleday_item_${item.id}`);
          if (raw) {
            const parsedQty = Math.max(1, parseInt(raw, 10) || 1);
            setItemInternal(item, parsedQty);
          }
        }
      } catch (e) {}
    } else {
      setItemInternal(item, 1);
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
      return acquiredItems.has(itemId) && (itemQuantities.get(itemId) || 0) > 0;
    },

    // 특정 아이템 보유 수량 반환
    getItemCount(itemId) {
      if (!acquiredItems.has(itemId)) return 0;
      return itemQuantities.get(itemId) || 1;
    },

    // 특정 수량 이상 보유 여부 확인 (퀘스트/NPC 전달 조건 체크용)
    hasAtLeast(itemId, requiredCount = 1) {
      return this.getItemCount(itemId) >= Math.max(1, Math.floor(requiredCount));
    },

    // 전체 수집품 총 개수 반환 (가방 배지 표시용)
    getTotalCollectibleCount() {
      let total = 0;
      for (const [id, item] of acquiredItems.entries()) {
        if (item.type === ItemType.COLLECTIBLE) {
          total += itemQuantities.get(id) || 1;
        }
      }
      return total;
    },

    // 아이템 획득 처리 (동일 아이템 수량 누적 + sourceId 기반 중복 수집 방지)
    addItem(itemIdOrItem, quantity = 1, options = {}) {
      const id = typeof itemIdOrItem === 'string' ? itemIdOrItem : itemIdOrItem?.id;
      if (!id) return false;

      const item = getItem(id) || (typeof itemIdOrItem === 'object' ? itemIdOrItem : null);
      if (!item) return false;

      // 동일 월드 오브젝트(예: flower_1)의 중복 수집/추가 원천 차단
      const sourceId = options?.sourceId || null;
      if (sourceId) {
        if (collectedSourceIds.has(sourceId)) {
          return false;
        }
        collectedSourceIds.add(sourceId);
      }

      const addQty = Math.max(1, Math.floor(Number(quantity) || 1));
      const alreadyHas = acquiredItems.has(id);
      const isStackable = Boolean(item.stackable || item.type === ItemType.COLLECTIBLE);

      if (alreadyHas) {
        if (isStackable) {
          const nextQty = (itemQuantities.get(id) || 1) + addQty;
          itemQuantities.set(id, nextQty);
        } else {
          // 비스택 장비 아이템은 중복 증가 없이 1개 유지
          itemQuantities.set(id, 1);
          return true;
        }
      } else {
        acquiredItems.set(id, item);
        itemQuantities.set(id, isStackable ? addQty : 1);
      }

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`littleday_item_${id}`, String(itemQuantities.get(id)));
        }
      } catch (e) {}

      notify();
      return true;
    },

    // 퀘스트 수집 ID 목록과 인벤토리 수집품 수량 동기화 (기존 세이브 하위 호환 및 일관성 보장)
    syncCollectibleSources(itemId, sourceIds = []) {
      const item = getItem(itemId);
      if (!item || !Array.isArray(sourceIds) || sourceIds.length === 0) return false;

      const uniqueIds = Array.from(new Set(sourceIds.filter(Boolean)));
      if (uniqueIds.length === 0) return false;

      let changed = false;
      for (const sid of uniqueIds) {
        if (!collectedSourceIds.has(sid)) {
          collectedSourceIds.add(sid);
          changed = true;
        }
      }

      const currentQty = this.getItemCount(itemId);
      if (currentQty < uniqueIds.length) {
        acquiredItems.set(itemId, item);
        itemQuantities.set(itemId, uniqueIds.length);
        changed = true;
      }

      if (changed) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`littleday_item_${itemId}`, String(itemQuantities.get(itemId)));
          }
        } catch (e) {}
        notify();
      }
      return changed;
    },

    // 아이템 수량 차감 / 소모 (추후 NPC 전달 또는 퀘스트 아이템 사용 확장용)
    consumeItem(itemId, quantity = 1) {
      const current = this.getItemCount(itemId);
      const consumeQty = Math.max(1, Math.floor(Number(quantity) || 1));
      if (current < consumeQty) return false;

      const remaining = current - consumeQty;
      if (remaining <= 0) {
        return this.removeItem(itemId);
      }

      itemQuantities.set(itemId, remaining);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`littleday_item_${itemId}`, String(remaining));
        }
      } catch (e) {}
      notify();
      return true;
    },

    // 추후 NPC에게 아이템 전달 기능을 위한 확장 인터페이스
    deliverItemToNpc(npcId, itemId, quantity = 1, { consume = true, onDelivered = null } = {}) {
      if (!npcId || !this.hasAtLeast(itemId, quantity)) return false;
      const item = acquiredItems.get(itemId);
      if (consume) {
        this.consumeItem(itemId, quantity);
      }
      if (typeof onDelivered === 'function') {
        onDelivered({ npcId, item, quantity });
      }
      return true;
    },

    // 아이템 제거
    removeItem(itemId) {
      if (this.isEquipped(itemId)) {
        this.unequip(itemId);
      }
      const removed = acquiredItems.delete(itemId);
      itemQuantities.delete(itemId);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(`littleday_item_${itemId}`);
        }
      } catch (e) {}
      if (removed) notify();
      return removed;
    },

    // 획득한 아이템 목록 반환 (수량 quantity 포함, 타입별 필터 지원)
    getAcquiredItems(typeFilter = null) {
      const items = Array.from(acquiredItems.values()).map((item) => ({
        ...item,
        quantity: itemQuantities.get(item.id) || 1
      }));
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
      if (!item || item.type === ItemType.COLLECTIBLE) return false;

      const slotType = item.type || ItemType.HEAD;
      equipped[slotType] = item.id;

      if (player && typeof player.equipAccessory === 'function') {
        player.equipAccessory(item);
      }

      notify();
      return true;
    },

    // 아이템 착용 해제 (itemId 또는 slotType 전달 가능)
    unequip(itemOrSlot) {
      let targetSlot = null;

      if (Object.keys(equipped).includes(itemOrSlot)) {
        targetSlot = itemOrSlot;
      } else {
        for (const [slot, id] of Object.entries(equipped)) {
          if (id === itemOrSlot) {
            targetSlot = slot;
            break;
          }
        }
      }

      if (!targetSlot || !equipped[targetSlot]) return false;

      equipped[targetSlot] = null;

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
    },

    setPlayer(p) {
      player = p;
    },

    // 세이브 데이터 추출 (기존 acquiredItemIds/equipped 유지 + quantities/collectedSourceIds 추가)
    getStateData() {
      const quantities = {};
      for (const [id, qty] of itemQuantities.entries()) {
        if (acquiredItems.has(id)) {
          quantities[id] = qty;
        }
      }
      return {
        acquiredItemIds: Array.from(acquiredItems.keys()),
        quantities,
        collectedSourceIds: Array.from(collectedSourceIds),
        equipped: { ...equipped }
      };
    },

    // 세이브 데이터 복원 (기존 세이브 포맷과 100% 하위 호환)
    restore(savedData) {
      if (!savedData) return;

      const savedQuantities =
        savedData.quantities && typeof savedData.quantities === 'object' ? savedData.quantities : {};

      if (Array.isArray(savedData.collectedSourceIds)) {
        for (const sid of savedData.collectedSourceIds) {
          if (sid) collectedSourceIds.add(sid);
        }
      }

      // 1. 보유 아이템 및 수량 복원
      if (Array.isArray(savedData.acquiredItemIds)) {
        for (const id of savedData.acquiredItemIds) {
          const item = getItem(id);
          if (item) {
            const qty = Math.max(1, Math.floor(Number(savedQuantities[id]) || 1));
            acquiredItems.set(id, item);
            itemQuantities.set(id, qty);
          }
        }
      }

      // quantities에만 존재하는 수집품도 안전하게 복원
      for (const [id, rawQty] of Object.entries(savedQuantities)) {
        const item = getItem(id);
        const qty = Math.floor(Number(rawQty) || 0);
        if (item && qty > 0) {
          acquiredItems.set(id, item);
          itemQuantities.set(id, qty);
        }
      }

      // 2. 장착 슬롯 복원
      if (savedData.equipped && typeof savedData.equipped === 'object') {
        for (const [slot, itemId] of Object.entries(savedData.equipped)) {
          if (itemId && acquiredItems.has(itemId)) {
            this.equip(itemId);
          } else if (!itemId && equipped[slot]) {
            this.unequip(slot);
          }
        }
      }

      notify();
    }
  };
}
