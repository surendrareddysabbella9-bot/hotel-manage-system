import { useEffect, useState, useCallback } from 'react';
import { tableService } from '@/services/tableService';
import type { RestaurantTable, TableStatus } from '@/types';
import { mockTables } from '@/mocks/tables.mock';

export function useTables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tableService.getTables();
      setTables(result.length > 0 ? result : mockTables);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load table floor plan'));
      setTables(mockTables);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();

    // Realtime listener for table status updates across staff devices
    const channel = tableService.subscribeToTables((updatedTable) => {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTable.id ? updatedTable : t))
      );
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchTables]);

  const updateStatus = async (tableId: string, newStatus: TableStatus) => {
    // Optimistic UI update
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t))
    );

    try {
      await tableService.updateTableStatus(tableId, newStatus);
    } catch {
      // Revert on failure
      fetchTables();
    }
  };

  const isEmpty = !isLoading && tables.length === 0;

  return {
    tables,
    setTables,
    isLoading,
    error,
    isEmpty,
    refetch: fetchTables,
    updateTableStatus: updateStatus,
  };
}
