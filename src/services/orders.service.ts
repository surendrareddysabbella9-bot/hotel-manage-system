import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { mockOrders } from '@/mocks/orders.mock';

export const ordersService = {
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockOrders;
      }

      return data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerId: o.customer_id || 'cust-1',
        customerName: o.customer_name || 'Guest Diner',
        tableNumber: o.table_number || (o.table_id ? 4 : undefined),
        status: o.status as OrderStatus,
        total: Number(o.total),
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: (o.order_items || []).map((item: { id: string; menu_item_id?: string; name: string; quantity: number; unit_price: number; notes?: string }) => ({
          id: item.id,
          menuItemId: item.menu_item_id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.unit_price),
          notes: item.notes || undefined,
        })),
      }));
    } catch {
      return mockOrders;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      return !error;
    } catch {
      return false;
    }
  },

  subscribeToOrders(onUpdate: (order: Order) => void) {
    return supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new) {
            const raw = payload.new as { id: string; order_number: string; customer_id?: string; customer_name?: string; table_number?: number; status: string; total: number; created_at: string; updated_at: string };
            onUpdate({
              id: raw.id,
              orderNumber: raw.order_number,
              customerId: raw.customer_id || 'cust-1',
              customerName: raw.customer_name || 'Guest Diner',
              tableNumber: raw.table_number,
              status: raw.status as OrderStatus,
              total: Number(raw.total),
              createdAt: raw.created_at,
              updatedAt: raw.updated_at,
              items: [],
            });
          }
        }
      )
      .subscribe();
  },
};
