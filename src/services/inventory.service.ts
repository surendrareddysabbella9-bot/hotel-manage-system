import { supabase } from '@/lib/supabase';
import type { InventoryItem, InventoryStatus } from '@/types';
import { mockInventory } from '@/mocks/inventory.mock';

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockInventory;
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity),
        unit: item.unit,
        minThreshold: Number(item.min_threshold),
        status: item.status as InventoryStatus,
        lastRestocked: item.last_restocked,
      }));
    } catch {
      return mockInventory;
    }
  },

  async updateQuantity(id: string, newQuantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity, last_restocked: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },
};
