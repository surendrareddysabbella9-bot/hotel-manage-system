import type { Order, OrderStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import { socket } from '@/lib/socket';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    // We now use the optimized backend SQL JOIN endpoint
    const ordersData = await apiFetch('/orders-full');
    return ordersData as Order[];
  },

  async createOrder(orderData: any): Promise<any> {
    return apiFetch('/orders/create-full', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, updated_at: new Date().toISOString() })
      });
      return true;
    } catch {
      return false;
    }
  },

  subscribeToOrders(onUpdate: (order: Order) => void) {
    const handleCreated = async (payload: any) => {
      // payload is raw order row. We should probably refetch the single order with joins
      // For simplicity in hackathon, trigger a full refetch or handle it optimistically 
      // by the caller. But the prompt says `onUpdate(order)`
      // Let's just refetch all orders in the hook when this fires for safety
      onUpdate({ ...payload, _triggerRefetch: true } as any);
    };

    const handleUpdated = (payload: any) => {
      // payload is raw order row
      onUpdate({
        id: payload.id,
        status: payload.status,
        updatedAt: payload.updated_at,
        _isPartialUpdate: true
      } as any);
    };

    socket.on('orders_created', handleCreated);
    socket.on('orders_updated', handleUpdated);

    return {
      unsubscribe: () => {
        socket.off('orders_created', handleCreated);
        socket.off('orders_updated', handleUpdated);
      }
    };
  },
};
