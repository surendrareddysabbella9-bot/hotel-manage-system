import type { DashboardStat, Order, InventoryItem } from '@/types';
import { apiFetch } from '@/lib/api';

export interface DashboardData {
  stats: DashboardStat[];
  lowStockItems: InventoryItem[];
  recentOrders: Order[];
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // 1. Total Customers count
      const profilesData = await apiFetch('/profiles');
      const customersCount = profilesData.length;

      // 2. Total Orders count & Sum of Revenue
      const ordersData = await apiFetch('/orders');
      const ordersCount = ordersData.length;
      const totalRevenue = ordersData.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0);

      // 3. Reservations count
      const resData = await apiFetch('/reservations');
      const reservationsCount = resData.length;

      // 4. Available Tables count
      const tblData = await apiFetch('/restaurant_tables?status=available');
      const availableTablesCount = tblData.length;

      // 5. Inventory Items count & Low Stock Items
      const inventoryData = await apiFetch('/inventory');
      const inventoryCount = inventoryData.length;

      const lowStockItems: InventoryItem[] = inventoryData
        .filter((i: any) => i.status !== 'in_stock')
        .map((i: any) => ({
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
      const recentOrdersData = [...ordersData].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
      
      // manual join for order_items
      const allItemsData = await apiFetch('/order_items');

      const recentOrders: Order[] = recentOrdersData.map((o: any) => {
        const orderItems = allItemsData.filter((i: any) => i.order_id === o.id);
        
        return {
          id: o.id,
          orderNumber: o.order_number,
          customerId: o.customer_id || '',
          customerName: o.customer_name || 'Guest Diner',
          tableNumber: o.table_number || undefined,
          status: o.status,
          total: Number(o.total),
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          items: orderItems.map((item: any) => ({
            id: item.id,
            menuItemId: item.menu_item_id || item.id,
            name: item.name,
            quantity: item.quantity,
            price: Number(item.unit_price),
            notes: item.notes || undefined,
          })),
        };
      });

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
          value: ordersCount || 0,
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
          value: inventoryCount || 0,
          changeLabel: 'Stock items',
          icon: 'TrendingUp',
        },
      ];

      return {
        stats,
        lowStockItems,
        recentOrders,
      };
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch dashboard data from custom backend');
    }
  },
};
