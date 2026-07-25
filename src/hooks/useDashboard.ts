import { useEffect, useState, useCallback } from 'react';
import { dashboardService, type DashboardData } from '@/services/dashboardService';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const isEmpty = !data || (data.stats.length === 0 && data.recentOrders.length === 0);

  return {
    data,
    isLoading,
    error,
    isEmpty,
    refetch: fetchDashboard,
  };
}
