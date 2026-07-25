import { useEffect, useState, useCallback } from 'react';
import { reservationService } from '@/services/reservationService';
import type { Reservation } from '@/types';
import { mockReservations } from '@/mocks/reservations.mock';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reservationService.getReservations();
      setReservations(result.length > 0 ? result : mockReservations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load reservations'));
      setReservations(mockReservations);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const createReservation = async (newRes: Omit<Reservation, 'id'>) => {
    try {
      const created = await reservationService.createReservation(newRes);
      setReservations((prev) => [created, ...prev]);
    } catch {
      const fallback: Reservation = {
        id: `res-${Date.now()}`,
        ...newRes,
      };
      setReservations((prev) => [fallback, ...prev]);
    }
  };

  const isEmpty = !isLoading && reservations.length === 0;

  return {
    reservations,
    setReservations,
    isLoading,
    error,
    isEmpty,
    refetch: fetchReservations,
    createReservation,
  };
}
