import { supabase } from '@/lib/supabase';
import type { StaffMember } from '@/types';

export const staffService = {
  async getStaffMembers(): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles!inner(name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch staff members');
    }

    return data
      .filter((p) => {
        const rName = (p.roles?.name || '').toString().toLowerCase();
        return rName !== 'customer';
      })
      .map((p) => {
        const rawRoleName = (p.roles?.name || '').toString().toLowerCase();
        const roleVal: StaffMember['role'] =
          rawRoleName === 'chef'
            ? 'chef'
            : rawRoleName === 'manager'
            ? 'manager'
            : rawRoleName === 'host'
            ? 'host'
            : 'waiter';

        return {
          id: p.id,
          fullName: p.full_name,
          email: p.email,
          role: roleVal,
          status: 'active',
          avatarUrl: p.avatar_url,
          shift: 'Evening Shift',
        };
      });
  },

  async addStaffMember(newStaff: Omit<StaffMember, 'id'>): Promise<StaffMember> {
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .ilike('name', newStaff.role)
      .maybeSingle();

    const roleId = roleData?.id;

    if (!roleId) {
      throw new Error(`Role '${newStaff.role}' not found in database roles table.`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        role_id: roleId,
        email: newStaff.email,
        full_name: newStaff.fullName,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to register staff profile in Supabase');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      role: newStaff.role,
      status: 'active',
      shift: newStaff.shift,
    };
  },
};
