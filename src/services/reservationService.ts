import type { Reservation, ReservationStatus } from '@/types';
import { apiFetch } from '@/lib/api';

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    const data = await apiFetch('/reservations?order=reservation_date.asc');

    return data.map((r: any) => ({
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
    const data = await apiFetch('/reservations', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: reservation.customerId || null,
        customer_name: reservation.customerName,
        party_size: reservation.partySize,
        reservation_date: reservation.date,
        reservation_time: reservation.time,
        special_requests: reservation.specialRequests,
        status: reservation.status || 'confirmed',
      })
    });

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
    let isPolling = true;
    let lastKnownReservations: Record<string, string> = {};

    const poll = async () => {
      if (!isPolling) return;
      try {
        const currentReservations = await this.getReservations();
        
        for (const res of currentReservations) {
          if (lastKnownReservations[res.id] !== res.status) {
            onUpdate(res);
          }
          lastKnownReservations[res.id] = res.status;
        }
      } catch (err) {
        console.error('Polling error', err);
      }
      
      if (isPolling) {
        setTimeout(poll, 5000);
      }
    };

    poll();

    return {
      unsubscribe: () => {
        isPolling = false;
      }
    };
  },
};
