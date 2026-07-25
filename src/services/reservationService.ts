import { supabase } from '@/lib/supabase';
import type { Reservation, ReservationStatus } from '@/types';

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch reservations');
    }

    return data.map((r) => ({
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
  },

  async createReservation(reservation: Omit<Reservation, 'id'>): Promise<Reservation> {
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

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create reservation');
    }

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
  },
};
