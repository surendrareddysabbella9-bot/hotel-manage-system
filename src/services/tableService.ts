import { supabase } from '@/lib/supabase';
import type { RestaurantTable, TableStatus } from '@/types';

export const tableService = {
  async getTables(): Promise<RestaurantTable[]> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('number', { ascending: true });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch restaurant tables');
    }

    return data.map((t) => ({
      id: t.id,
      number: t.number,
      capacity: t.capacity,
      status: t.status as TableStatus,
      section: t.section,
    }));
  },

  async updateTableStatus(tableId: string, status: TableStatus): Promise<boolean> {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', tableId);

    return !error;
  },

  subscribeToTables(onUpdate: (table: RestaurantTable) => void) {
    const channelId = `tables_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'restaurant_tables' },
      (payload) => {
        if (payload.new) {
          const raw = payload.new as {
            id: string;
            number: number;
            capacity: number;
            status: string;
            section: string;
          };
          onUpdate({
            id: raw.id,
            number: raw.number,
            capacity: raw.capacity,
            status: raw.status as TableStatus,
            section: raw.section,
          });
        }
      }
    );

    channel.subscribe();
    return channel;
  },
};
