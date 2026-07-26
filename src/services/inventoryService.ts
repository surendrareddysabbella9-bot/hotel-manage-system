import { supabase } from '@/lib/supabase';
import type { InventoryItem, InventoryStatus } from '@/types';

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch inventory items');
    }

    return data.map((item) => ({
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

    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        status: newStatus,
        last_restocked: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) return false;

    // Log restock in inventory_logs table
    await supabase.from('inventory_logs').insert({
      inventory_id: id,
      change_type: 'restock',
      quantity_changed: addedQuantity,
      previous_quantity: currentItem.quantity,
      new_quantity: newQuantity,
      notes: `Restocked ${addedQuantity} ${currentItem.unit}`,
    });

    return true;
  },

  subscribeToInventory(onUpdate: (item: InventoryItem) => void) {
    const channelId = `inventory_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory' },
      (payload) => {
        if (payload.new) {
          const raw = payload.new as {
            id: string;
            name: string;
            category: string;
            quantity: number;
            unit: string;
            min_threshold: number;
            status: string;
            last_restocked: string;
          };
          onUpdate({
            id: raw.id,
            name: raw.name,
            category: raw.category,
            quantity: Number(raw.quantity),
            unit: raw.unit,
            minThreshold: Number(raw.min_threshold),
            status: raw.status as InventoryStatus,
            lastRestocked: raw.last_restocked,
          });
        }
      }
    );

    channel.subscribe();
    return channel;
  },
};
