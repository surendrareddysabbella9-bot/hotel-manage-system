import { apiFetch } from '@/lib/api';

export interface ScannedTable {
  id: string;
  number: number;
  capacity: number;
  status: string;
  section: string;
}

export interface BookingResult {
  success: boolean;
  table: ScannedTable;
  reservation: {
    id: string;
    customerId: string | null;
    customerName: string;
    partySize: number;
    date: string;
    time: string;
    status: string;
    tableNumber: number;
    section: string;
  };
}

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || '/api';
};

export const scanService = {
  /** Public endpoint — no auth required. Fetches table info by number. */
  async getTableByNumber(tableNumber: number): Promise<ScannedTable> {
    const response = await fetch(`${getBaseUrl()}/scan/table/${tableNumber}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Table ${tableNumber} not found`);
    }
    return response.json();
  },

  /** Authenticated endpoint — books the table for the current user (guest or customer). */
  async bookTable(tableNumber: number, partySize: number = 1): Promise<BookingResult> {
    return apiFetch('/book-table', {
      method: 'POST',
      body: JSON.stringify({ tableNumber, partySize }),
    });
  },
};
