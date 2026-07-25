import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReservations } from "@/hooks/useReservations";
import type { Reservation } from "@/types";

export function AdminReservationsPage() {
  const { reservations, isLoading, error, isEmpty, refetch } = useReservations();
  const [search, setSearch] = useState("");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const filtered = reservations.filter((r) =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) || r.date.includes(search)
  );

  const columns: DataTableColumn<Reservation>[] = [
    { key: "customerName", header: "Customer Name" },
    { key: "partySize", header: "Party Size", render: (r) => `${r.partySize} Guests` },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "tableNumber", header: "Table", render: (r) => r.tableNumber ? `Table ${r.tableNumber}` : "Unassigned" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={r.status === "confirmed" ? "success" : r.status === "cancelled" ? "destructive" : "muted"} className="capitalize">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedRes(r)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reservation System" description="Manage table bookings, view customer guest counts, and assign tables" />

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search by customer or date..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : error ? (
        <ErrorState title="Failed to load reservations" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No table reservations found" description="There are currently no table bookings." />
      ) : (
        <DataTable data={filtered} columns={columns} keyExtractor={(r) => r.id} />
      )}

      <Dialog open={!!selectedRes} onOpenChange={(open) => !open && setSelectedRes(null)}>
        {selectedRes && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>Booking for {selectedRes.customerName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-sm">
              <p><span className="font-semibold">Date & Time:</span> {selectedRes.date} at {selectedRes.time}</p>
              <p><span className="font-semibold">Party Size:</span> {selectedRes.partySize} People</p>
              <p><span className="font-semibold">Assigned Table:</span> {selectedRes.tableNumber ? `Table ${selectedRes.tableNumber}` : "Unassigned"}</p>
              <p><span className="font-semibold">Special Requests:</span> {selectedRes.specialRequests || "None"}</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
