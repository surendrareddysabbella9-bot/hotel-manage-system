import { useEffect, useState, useCallback } from 'react';
import { orderService } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { mockOrders } from '@/mocks/orders.mock';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrders();
      setOrders(result.length > 0 ? result : mockOrders);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load orders data'));
      setOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = orderService.subscribeToOrders((updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    try {
      await orderService.updateOrderStatus(orderId, status);
    } catch {
      fetchOrders();
    }
  };

  const isEmpty = !isLoading && orders.length === 0;

  return {
    orders,
    setOrders,
    isLoading,
    error,
    isEmpty,
    refetch: fetchOrders,
    updateOrderStatus: updateStatus,
  };
}
