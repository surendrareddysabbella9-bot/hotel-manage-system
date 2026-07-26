import type { RestaurantTable, TableStatus } from '@/types';
import { apiFetch } from '@/lib/api';

export const tableService = {
  async getTables(): Promise<RestaurantTable[]> {
    const data = await apiFetch('/restaurant_tables?order=number.asc');

    return data.map((t: any) => ({
      id: t.id,
      number: t.number,
      capacity: t.capacity,
      status: t.status as TableStatus,
      section: t.section,
    }));
  },

  async updateTableStatus(tableId: string, status: TableStatus): Promise<boolean> {
    try {
      await apiFetch(`/restaurant_tables/${tableId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, updated_at: new Date().toISOString() })
      });
      return true;
    } catch {
      return false;
    }
  },

  subscribeToTables(onUpdate: (table: RestaurantTable) => void) {
    let isPolling = true;
    let lastKnownStatuses: Record<string, string> = {};

    const poll = async () => {
      if (!isPolling) return;
      try {
        const currentTables = await this.getTables();
        
        for (const table of currentTables) {
          if (lastKnownStatuses[table.id] !== table.status) {
            onUpdate(table);
          }
          lastKnownStatuses[table.id] = table.status;
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
