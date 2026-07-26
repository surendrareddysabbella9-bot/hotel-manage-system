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
      customerId: r.customer_id || '',
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
        customer_id: reservation.customerId || null,
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
      customerId: data.customer_id || '',
      customerName: data.customer_name,
      partySize: data.party_size,
      date: data.reservation_date,
      time: data.reservation_time,
      status: data.status as ReservationStatus,
      specialRequests: data.special_requests,
    };
  },

  subscribeToReservations(onUpdate: (reservation: Reservation) => void) {
    const channelId = `reservations_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations' },
      (payload) => {
        if (payload.new) {
          const raw = payload.new as {
            id: string;
            customer_id?: string;
            customer_name: string;
            party_size: number;
            reservation_date: string;
            reservation_time: string;
            table_number?: number;
            status: string;
            special_requests?: string;
          };
          onUpdate({
            id: raw.id,
            customerId: raw.customer_id || '',
            customerName: raw.customer_name,
            partySize: raw.party_size,
            date: raw.reservation_date,
            time: raw.reservation_time,
            tableNumber: raw.table_number || undefined,
            status: raw.status as ReservationStatus,
            specialRequests: raw.special_requests || undefined,
          });
        }
      }
    );

    channel.subscribe();
    return channel;
  },
};
