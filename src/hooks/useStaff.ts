import { useEffect, useState, useCallback } from 'react';
import { staffService } from '@/services/staffService';
import type { StaffMember } from '@/types';
import { mockStaff } from '@/mocks/staff.mock';

export function useStaff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await staffService.getStaffMembers();
      setStaffList(result.length > 0 ? result : mockStaff);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load staff list'));
      setStaffList(mockStaff);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addStaff = async (newStaff: Omit<StaffMember, 'id'>) => {
    try {
      const created = await staffService.addStaffMember(newStaff);
      setStaffList((prev) => [created, ...prev]);
    } catch {
      const fallback: StaffMember = {
        id: `staff-${Date.now()}`,
        ...newStaff,
      };
      setStaffList((prev) => [fallback, ...prev]);
    }
  };

  const isEmpty = !isLoading && staffList.length === 0;

  return {
    staffList,
    setStaffList,
    isLoading,
    error,
    isEmpty,
    refetch: fetchStaff,
    addStaffMember: addStaff,
  };
}
