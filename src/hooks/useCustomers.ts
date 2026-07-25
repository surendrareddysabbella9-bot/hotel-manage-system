import { useEffect, useState, useCallback } from 'react';
import { customerService, type CustomerRecord } from '@/services/customerService';

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await customerService.getCustomers();
      setCustomers(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load customers'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const isEmpty = !isLoading && customers.length === 0;

  return {
    customers,
    isLoading,
    error,
    isEmpty,
    refetch: fetchCustomers,
  };
}
