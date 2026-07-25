import { useEffect, useState, useCallback } from 'react';
import { menuService } from '@/services/menuService';
import type { MenuCategory, MenuItem } from '@/types';
import { mockMenuCategories, mockMenuItems } from '@/mocks/menu.mock';

export function useMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedCats, fetchedItems] = await Promise.all([
        menuService.getCategories().catch(() => mockMenuCategories),
        menuService.getMenuItems().catch(() => mockMenuItems),
      ]);
      setCategories(fetchedCats.length > 0 ? fetchedCats : mockMenuCategories);
      setItems(fetchedItems.length > 0 ? fetchedItems : mockMenuItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load menu data'));
      setCategories(mockMenuCategories);
      setItems(mockMenuItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const toggleAvailability = async (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;
    const newStatus = !target.available;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, available: newStatus } : item))
    );

    try {
      await menuService.toggleAvailability(itemId, newStatus);
    } catch {
      // Revert on failure
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, available: !newStatus } : item))
      );
    }
  };

  const addMenuItem = async (newItem: Omit<MenuItem, 'id'>) => {
    try {
      const created = await menuService.createMenuItem(newItem);
      setItems((prev) => [created, ...prev]);
    } catch {
      const fallback: MenuItem = {
        id: `item-${Date.now()}`,
        ...newItem,
      };
      setItems((prev) => [fallback, ...prev]);
    }
  };

  const isEmpty = !isLoading && items.length === 0;

  return {
    categories,
    items,
    setItems,
    isLoading,
    error,
    isEmpty,
    refetch: fetchMenu,
    toggleAvailability,
    addMenuItem,
  };
}
