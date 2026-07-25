import { supabase } from '@/lib/supabase';
import type { DashboardStat } from '@/types';

const defaultStats: DashboardStat[] = [
  {
    id: 'total_revenue',
    label: 'Total Revenue',
    value: '₹1,24,500',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: 'DollarSign',
  },
  {
    id: 'active_orders',
    label: 'Total Orders',
    value: 300,
    change: 8.2,
    changeLabel: 'vs last month',
    icon: 'ShoppingBag',
  },
  {
    id: 'reservations',
    label: 'Reservations',
    value: 60,
    change: -2.4,
    changeLabel: 'vs last week',
    icon: 'Calendar',
  },
  {
    id: 'active_customers',
    label: 'Active Customers',
    value: 100,
    change: 18.3,
    changeLabel: 'vs last month',
    icon: 'Users',
  },
];

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStat[]> {
    try {
      const { data: sales, error } = await supabase
        .from('daily_sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .limit(30);

      if (error || !sales || sales.length === 0) {
        return defaultStats;
      }

      const totalRev = sales.reduce((acc, curr) => acc + Number(curr.total_revenue), 0);
      const totalOrdersCount = sales.reduce((acc, curr) => acc + curr.total_orders, 0);

      return [
        {
          id: 'total_revenue',
          label: 'Total Revenue',
          value: `₹${totalRev.toLocaleString('en-IN')}`,
          change: 12.5,
          changeLabel: 'vs last month',
          icon: 'DollarSign',
        },
        {
          id: 'active_orders',
          label: 'Total Orders',
          value: totalOrdersCount,
          change: 8.2,
          changeLabel: 'vs last month',
          icon: 'ShoppingBag',
        },
        {
          id: 'reservations',
          label: 'Reservations',
          value: '60',
          change: -2.4,
          changeLabel: 'vs last week',
          icon: 'Calendar',
        },
        {
          id: 'active_customers',
          label: 'Active Customers',
          value: '100',
          change: 18.3,
          changeLabel: 'vs last month',
          icon: 'Users',
        },
      ];
    } catch {
      return defaultStats;
    }
  },
};
