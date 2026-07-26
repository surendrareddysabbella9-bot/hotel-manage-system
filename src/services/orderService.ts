import type { Order, OrderStatus } from '@/types';
import { apiFetch } from '@/lib/api';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    // 1. Fetch base orders
    const ordersData = await apiFetch('/orders?order=created_at.desc');
    
    // 2. We have to manually fetch related data since we lost Supabase joins
    const itemsData = await apiFetch('/order_items');
    const profilesData = await apiFetch('/profiles');
    const tablesData = await apiFetch('/restaurant_tables');

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
    // We lost Supabase Realtime WebSockets.
    // Falling back to 5-second polling for hackathon purposes.
    let isPolling = true;
    let lastKnownOrders: Record<string, string> = {};

    const poll = async () => {
      if (!isPolling) return;
      try {
        const currentOrders = await this.getOrders();
        
        // Find orders that changed status or are new
        for (const order of currentOrders) {
          if (!lastKnownOrders[order.id] || lastKnownOrders[order.id] !== order.status) {
            onUpdate(order);
          }
          lastKnownOrders[order.id] = order.status;
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
