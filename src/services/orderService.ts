import type { Order, OrderStatus } from '@/types';
import { apiFetch } from '@/lib/api';
import { socket } from '@/lib/socket';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    // 1. Fetch base orders
    const ordersData = await apiFetch('/orders?order=created_at.desc');
    
    // 2. We have to manually fetch related data since we lost Supabase joins
    const itemsData = await apiFetch('/order_items').catch(() => []);
    const profilesData = await apiFetch('/profiles').catch(() => []);
    const tablesData = await apiFetch('/restaurant_tables').catch(() => []);

    return ordersData.map((o: any) => {
      // Manual joins
      const items = itemsData.filter((i: any) => i.order_id === o.id);
      const profile = profilesData.find((p: any) => p.id === o.customer_id);
      const table = tablesData.find((t: any) => String(t.number) === String(o.table_number));

      return {
        id: o.id,
        orderNumber: o.order_number,
        customerId: o.customer_id || profile?.id || '',
        customerName: o.customer_name || profile?.full_name || 'Guest Diner',
        tableNumber: table?.number || o.table_number || undefined,
        status: o.status as OrderStatus,
        total: Number(o.total),
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: items.map((item: any) => ({
          id: item.id,
          menuItemId: item.menu_item_id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.unit_price),
          notes: item.notes || undefined,
        })),
      };
    });
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
