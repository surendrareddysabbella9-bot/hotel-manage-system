import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { mockReservations } from "@/mocks";
import type { Reservation } from "@/types";

export function AdminReservationsPage() {
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const filtered = reservations.filter((r) => {
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: DataTableColumn<Reservation>[] = [
    { key: "customerName", header: "Customer" },
    { key: "partySize", header: "Party Size", render: (r) => `${r.partySize} guests` },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "tableNumber", header: "Table", render: (r) => r.tableNumber ? `Table ${r.tableNumber}` : "Unassigned" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={r.status === "confirmed" ? "success" : r.status === "seated" ? "default" : "warning"} className="capitalize">
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Action",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedRes(r)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reservations & Bookings" description="Manage table bookings, guest arrivals, and seating arrangements" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search guest name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "confirmed", "pending", "seated"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              className="capitalize text-xs"
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      <DataTable data={filtered} columns={columns} keyExtractor={(r) => r.id} />

      <Dialog open={!!selectedRes} onOpenChange={(open) => !open && setSelectedRes(null)}>
        {selectedRes && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reservation: {selectedRes.customerName}</DialogTitle>
              <DialogDescription>
                {selectedRes.date} at {selectedRes.time} · {selectedRes.partySize} Guests
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <p><span className="font-semibold">Special Requests:</span> {selectedRes.specialRequests || "None"}</p>
              <p><span className="font-semibold">Assigned Table:</span> {selectedRes.tableNumber ? `Table ${selectedRes.tableNumber}` : "Not assigned yet"}</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
