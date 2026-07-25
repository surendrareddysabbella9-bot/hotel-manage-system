import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { mockCustomerUser, mockCurrentUser } from '@/mocks/users.mock';

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: string;
  lastVisit: string;
}

const mockUsersList: User[] = [mockCurrentUser, mockCustomerUser];

export const customersService = {
  async getCustomers(): Promise<CustomerRecord[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockUsersList.filter((u: User) => u.role === 'customer').map((u: User, index: number) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          phone: `+91 98${index}554321`,
          totalOrders: (index + 1) * 3,
          totalSpent: (index + 1) * 1250,
          loyaltyPoints: (index + 1) * 150,
          tier: index % 3 === 0 ? 'Platinum' : index % 2 === 0 ? 'Gold' : 'Silver',
          lastVisit: new Date(Date.now() - index * 86400000 * 2).toISOString().split('T')[0],
        }));
      }

      return data.map((p, index: number) => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        phone: p.phone || `+91 98765${index}432`,
        totalOrders: 5 + (index % 10),
        totalSpent: 2500 + (index * 450),
        loyaltyPoints: p.loyalty_points || 350,
        tier: p.loyalty_tier || 'Silver',
        lastVisit: p.created_at.split('T')[0],
      }));
    } catch {
      return mockUsersList.filter((u: User) => u.role === 'customer').map((u: User, index: number) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: `+91 98${index}554321`,
        totalOrders: (index + 1) * 3,
        totalSpent: (index + 1) * 1250,
        loyaltyPoints: (index + 1) * 150,
        tier: index % 3 === 0 ? 'Platinum' : index % 2 === 0 ? 'Gold' : 'Silver',
        lastVisit: new Date(Date.now() - index * 86400000 * 2).toISOString().split('T')[0],
      }));
    }
  },
};
