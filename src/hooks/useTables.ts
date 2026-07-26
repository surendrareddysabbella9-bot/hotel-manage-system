import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { tableService } from '@/services/tableService';
import type { RestaurantTable, TableStatus } from '@/types';

export function useTables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tableService.getTables();
      setTables(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load table floor plan'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();

    const channel = tableService.subscribeToTables((updatedTable) => {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTable.id ? updatedTable : t))
      );
    });

    return () => {
      supabase.removeChannel(channel);
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
