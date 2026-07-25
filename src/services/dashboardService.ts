import { supabase } from '@/lib/supabase';
import type { DashboardStat, Order, InventoryItem } from '@/types';

export interface DashboardData {
  stats: DashboardStat[];
  lowStockItems: InventoryItem[];
  recentOrders: Order[];
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    // 1. Total Customers count
    const { count: customersCount, error: custError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 2. Total Orders count & Sum of Revenue
    const { data: ordersData, count: ordersCount, error: ordError } = await supabase
      .from('orders')
      .select('*');

    const totalRevenue = (ordersData || []).reduce((acc, curr) => acc + Number(curr.total || 0), 0);

    // 3. Reservations count
    const { count: reservationsCount, error: resError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true });

    // 4. Available Tables count
    const { count: availableTablesCount, error: tblError } = await supabase
      .from('restaurant_tables')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    // 5. Inventory Items count & Low Stock Items
    const { data: inventoryData, count: inventoryCount, error: invError } = await supabase
      .from('inventory')
      .select('*');

    const lowStockItems: InventoryItem[] = (inventoryData || [])
      .filter((i) => i.status !== 'in_stock')
      .map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        quantity: Number(i.quantity),
        unit: i.unit,
        minThreshold: Number(i.min_threshold),
        status: i.status,
        lastRestocked: i.last_restocked,
      }));

    // 6. Recent Orders
    const { data: recentOrdersData, error: recentOrdError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(5);

    const recentOrders: Order[] = (recentOrdersData || []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id || 'cust-1',
      customerName: o.customer_name || 'Guest Diner',
      tableNumber: o.table_number || (o.table_id ? 4 : undefined),
      status: o.status,
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

    if (custError && ordError && resError && tblError && invError && recentOrdError) {
      throw new Error('Failed to fetch dashboard data from Supabase');
    }

    const stats: DashboardStat[] = [
      {
        id: 'total_revenue',
        label: 'Revenue',
        value: `₹${totalRevenue.toLocaleString('en-IN')}`,
        change: 12.5,
        changeLabel: 'vs last month',
        icon: 'DollarSign',
      },
      {
        id: 'total_orders',
        label: 'Total Orders',
        value: ordersCount || ordersData?.length || 0,
        change: 8.2,
        changeLabel: 'vs last month',
        icon: 'ShoppingBag',
      },
      {
        id: 'total_customers',
        label: 'Total Customers',
        value: customersCount || 0,
        change: 18.3,
        changeLabel: 'vs last month',
        icon: 'Users',
      },
      {
        id: 'reservations',
        label: 'Reservations',
        value: reservationsCount || 0,
        change: -2.4,
        changeLabel: 'vs last week',
        icon: 'Calendar',
      },
      {
        id: 'available_tables',
        label: 'Available Tables',
        value: availableTablesCount || 0,
        changeLabel: 'Live status',
        icon: 'Clock',
      },
      {
        id: 'inventory_items',
        label: 'Inventory Items',
        value: inventoryCount || inventoryData?.length || 0,
        changeLabel: 'Stock items',
        icon: 'TrendingUp',
      },
    ];

    return {
      stats,
      lowStockItems,
      recentOrders,
    };
  },
};
