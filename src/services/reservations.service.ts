import { supabase } from '@/lib/supabase';
import type { Reservation, ReservationStatus } from '@/types';
import { mockReservations } from '@/mocks/reservations.mock';

export const reservationsService = {
  async getReservations(): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockReservations;
      }

      return data.map(r => ({
        id: r.id,
        customerId: r.customer_id || 'cust-1',
        customerName: r.customer_name,
        partySize: r.party_size,
        date: r.reservation_date,
        time: r.reservation_time,
        tableNumber: r.table_number || undefined,
        status: r.status as ReservationStatus,
        specialRequests: r.special_requests || undefined,
      }));
    } catch {
      return mockReservations;
    }
  },

  async createReservation(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          customer_id: reservation.customerId,
          customer_name: reservation.customerName,
          party_size: reservation.partySize,
          reservation_date: reservation.date,
          reservation_time: reservation.time,
          special_requests: reservation.specialRequests,
          status: reservation.status || 'confirmed',
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          customerId: data.customer_id,
          customerName: data.customer_name,
          partySize: data.party_size,
          date: data.reservation_date,
          time: data.reservation_time,
          status: data.status as ReservationStatus,
          specialRequests: data.special_requests,
        };
      }
    } catch (e) {
      console.warn('Reservation create fallback:', e);
    }
    return {
      id: `res-${Date.now()}`,
      ...reservation,
    };
  },
};
