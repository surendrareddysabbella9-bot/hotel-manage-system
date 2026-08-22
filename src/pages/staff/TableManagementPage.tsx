import { useState } from "react";
import { Grid3X3, Download, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableCard } from "@/components/cards/TableCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTables } from "@/hooks/useTables";
import type { RestaurantTable, TableStatus } from "@/types";

export function TableManagementPage() {
  const { tables, isLoading, updateTableStatus } = useTables();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const sections = Array.from(new Set(tables.map((t) => t.section)));

  const handleStatusUpdate = async (tableId: string, newStatus: TableStatus) => {
    await updateTableStatus(tableId, newStatus);
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable({ ...selectedTable, status: newStatus });
    }
  };

  const handleDownloadQR = async (table: RestaurantTable) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://hotel-manage-system.onrender.com";
    const url = `${baseUrl}/scan/table/${table.number}`;
    
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
      const link = document.createElement("a");
      link.download = `table-${table.number}-qr.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visual Floor & Table Management"
        description="Monitor table occupancy, manage seating availability, and assign servers"
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "available", "occupied", "reserved", "cleaning"].map((st) => (
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

      {isLoading ? (
        <LoadingSkeleton variant="table" count={6} />
      ) : tables.length === 0 ? (
        <EmptyState
          title="No tables configured"
          description="There are currently no restaurant tables found in the floor plan database."
        />
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => {
            const secTables = tables.filter(
              (t) => t.section === sec && (statusFilter === "all" || t.status === statusFilter)
            );
            if (secTables.length === 0) return null;

            return (
              <div key={sec} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Grid3X3 className="size-4 text-primary" /> {sec}
                  </h3>
                  <Badge variant="outline">{secTables.length} Tables</Badge>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {secTables.map((tbl) => (
                    <TableCard key={tbl.id} table={tbl} onClick={(t) => setSelectedTable(t)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        {selectedTable && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Table #{selectedTable.number}</DialogTitle>
              <DialogDescription>
                Section: {selectedTable.section} · Capacity: {selectedTable.capacity} Seats
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-end border-b pb-4 mb-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadQR(selectedTable)} className="gap-2">
                  <QrCode className="size-4" />
                  <Download className="size-3" /> QR Code
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Change Table Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(["available", "occupied", "reserved", "cleaning"] as TableStatus[]).map((st) => (
                    <Button
                      key={st}
                      variant={selectedTable.status === st ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => handleStatusUpdate(selectedTable.id, st)}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
