import type { StaffMember } from '@/types';
import { apiFetch } from '@/lib/api';

export const staffService = {
  async getStaffMembers(): Promise<StaffMember[]> {
    const profilesData = await apiFetch('/profiles?order=created_at.desc');
    const rolesData = await apiFetch('/roles');

    return profilesData
      .filter((p: any) => {
        const roleRecord = rolesData.find((r: any) => r.id === p.role_id);
        const rName = (roleRecord?.name || '').toString().toLowerCase();
        return rName !== 'customer' && rName !== '';
      })
      .map((p: any) => {
        const roleRecord = rolesData.find((r: any) => r.id === p.role_id);
        const rawRoleName = (roleRecord?.name || '').toString().toLowerCase();
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
    const rolesData = await apiFetch('/roles');
    const roleRecord = rolesData.find((r: any) => r.name.toLowerCase() === newStaff.role.toLowerCase());

    const roleId = roleRecord?.id;

    if (!roleId) {
      throw new Error(`Role '${newStaff.role}' not found in database roles table.`);
    }

    const data = await apiFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({
        role_id: roleId,
        email: newStaff.email,
        full_name: newStaff.fullName,
      })
    });

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
