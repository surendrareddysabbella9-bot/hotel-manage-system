import { supabase } from '@/lib/supabase';
import type { RestaurantTable, TableStatus } from '@/types';
import { mockTables } from '@/mocks/tables.mock';

export const tablesService = {
  async getTables(): Promise<RestaurantTable[]> {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('number', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockTables;
      }

      return data.map(t => ({
        id: t.id,
        number: t.number,
        capacity: t.capacity,
        status: t.status as TableStatus,
        section: t.section,
      }));
    } catch {
      return mockTables;
    }
  },

  async updateTableStatus(tableId: string, status: TableStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId);

      return !error;
    } catch {
      return false;
    }
  },

  subscribeToTables(onUpdate: (table: RestaurantTable) => void) {
    return supabase
      .channel('public:restaurant_tables')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_tables' },
        (payload) => {
          if (payload.new) {
            const raw = payload.new as { id: string; number: number; capacity: number; status: string; section: string };
            onUpdate({
              id: raw.id,
              number: raw.number,
              capacity: raw.capacity,
              status: raw.status as TableStatus,
              section: raw.section,
            });
          }
        }
      )
      .subscribe();
  },
};
