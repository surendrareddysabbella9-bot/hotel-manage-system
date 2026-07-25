import { supabase } from '@/lib/supabase';
import type { StaffMember } from '@/types';
import { mockStaff } from '@/mocks/staff.mock';

export const staffService = {
  async getStaffMembers(): Promise<StaffMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, roles!inner(name)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockStaff;
      }

      return data.map(p => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        role: (p.roles?.name?.toLowerCase() as 'chef' | 'waiter' | 'manager' | 'host') || 'waiter',
        status: 'active',
        shift: 'Evening (4 PM - 12 AM)',
      }));
    } catch {
      return mockStaff;
    }
  },
};
