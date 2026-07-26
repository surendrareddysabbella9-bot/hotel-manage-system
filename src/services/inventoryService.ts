import type { InventoryItem, InventoryStatus } from '@/types';
import { apiFetch } from '@/lib/api';

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    const data = await apiFetch('/inventory?order=name.asc');

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: Number(item.quantity),
      unit: item.unit,
      minThreshold: Number(item.min_threshold),
      status: item.status as InventoryStatus,
      lastRestocked: item.last_restocked,
    }));
  },

  async restockItem(id: string, addedQuantity: number, currentItem: InventoryItem): Promise<boolean> {
    const newQuantity = currentItem.quantity + addedQuantity;
    const newStatus: InventoryStatus =
      newQuantity >= currentItem.minThreshold
        ? 'in_stock'
        : newQuantity > 0
        ? 'low_stock'
        : 'out_of_stock';

    const now = new Date().toISOString();

    try {
      await apiFetch(`/inventory/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: newQuantity,
          status: newStatus,
          last_restocked: now,
          updated_at: now,
        })
      });

      // Log restock in inventory_logs table
      await apiFetch('/inventory_logs', {
        method: 'POST',
        body: JSON.stringify({
          inventory_id: id,
          change_type: 'restock',
          quantity_changed: addedQuantity,
          previous_quantity: currentItem.quantity,
          new_quantity: newQuantity,
          notes: `Restocked ${addedQuantity} ${currentItem.unit}`,
        })
      });

      return true;
    } catch {
      return false;
    }
  },

  subscribeToInventory(onUpdate: (item: InventoryItem) => void) {
    let isPolling = true;
    let lastKnownQuantities: Record<string, number> = {};

    const poll = async () => {
      if (!isPolling) return;
      try {
        const currentInventory = await this.getInventory();
        
        for (const item of currentInventory) {
          if (lastKnownQuantities[item.id] !== item.quantity) {
            onUpdate(item);
          }
          lastKnownQuantities[item.id] = item.quantity;
        }
      } catch (err) {
        console.error('Polling error', err);
      }
      
      if (isPolling) {
        setTimeout(poll, 5000);
      }
    };

    poll();

    return {
      unsubscribe: () => {
        isPolling = false;
      }
    };
  },
};
