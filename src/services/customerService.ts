import { supabase } from '@/lib/supabase';

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
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, orders(id, total)')
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      throw new Error(error?.message || 'Failed to fetch customer profiles');
    }

    return profiles.map((p) => {
      const orders = p.orders || [];
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
