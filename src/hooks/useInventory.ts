import { useEffect, useState, useCallback } from 'react';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryItem, InventoryStatus } from '@/types';
import { mockInventory } from '@/mocks/inventory.mock';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await inventoryService.getInventory();
      setInventory(result.length > 0 ? result : mockInventory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load inventory data'));
      setInventory(mockInventory);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const restock = async (id: string, addedQuantity: number) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + addedQuantity;
    const newStatus: InventoryStatus =
      newQuantity >= item.minThreshold
        ? 'in_stock'
        : newQuantity > 0
        ? 'low_stock'
        : 'out_of_stock';

    // Optimistic UI update
    setInventory((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: newQuantity,
              status: newStatus,
              lastRestocked: new Date().toISOString(),
            }
          : i
      )
    );

    try {
      await inventoryService.restockItem(id, addedQuantity, item);
    } catch {
      fetchInventory();
    }
  };

  const lowStockCount = inventory.filter((i) => i.status !== 'in_stock').length;
  const isEmpty = !isLoading && inventory.length === 0;

  return {
    inventory,
    setInventory,
    lowStockCount,
    isLoading,
    error,
    isEmpty,
    refetch: fetchInventory,
    restockItem: restock,
  };
}
