import { useEffect, useState, useCallback } from 'react';
import { analyticsService, type AnalyticsData } from '@/services/analyticsService';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getAnalytics();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load analytics data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const isEmpty = !isLoading && !data;

  return {
    data,
    isLoading,
    error,
    isEmpty,
    refetch: fetchAnalytics,
  };
}
