import { apiFetch } from '@/lib/api';

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyTier: 'Gold' | 'Silver' | 'Platinum';
}

export const customerService = {
  async getCustomers(): Promise<CustomerRecord[]> {
    const profiles = await apiFetch('/profiles?order=created_at.desc');
    const allOrders = await apiFetch('/orders');

    return profiles.map((p: any) => {
      const orders = allOrders.filter((o: any) => o.customer_id === p.id);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum: number, o: { total: number }) => sum + Number(o.total || 0), 0);

      const rawTier = p.loyalty_tier;
      const loyaltyTier: 'Gold' | 'Silver' | 'Platinum' =
        rawTier === 'Platinum' ? 'Platinum' : rawTier === 'Gold' ? 'Gold' : 'Silver';

      return {
        id: p.id,
        name: p.full_name || 'Customer',
        email: p.email,
        phone: p.phone || 'N/A',
        totalOrders,
        totalSpent,
        loyaltyTier,
      };
    });
  },
};
