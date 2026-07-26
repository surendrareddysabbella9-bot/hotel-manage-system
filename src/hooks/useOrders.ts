import { useEffect, useState, useCallback } from 'react';

import { orderService } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrders();
      setOrders(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load orders data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = orderService.subscribeToOrders((updatedOrder: any) => {
      if (updatedOrder._triggerRefetch) {
        fetchOrders();
      } else if (updatedOrder._isPartialUpdate) {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt } : o))
        );
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
      }
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
