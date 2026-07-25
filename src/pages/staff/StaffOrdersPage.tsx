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
import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/types";

export function StaffOrdersPage() {
  const { orders, isLoading, error, isEmpty, refetch, updateOrderStatus } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.includes(search) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const map: Record<OrderStatus, OrderStatus> = {
      pending: "cooking",
      cooking: "ready",
      ready: "served",
      served: "served",
      cancelled: "cancelled",
    };
    await updateOrderStatus(orderId, map[currentStatus]);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: map[currentStatus] });
    }
  };

  const columns: DataTableColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (o) => `#${o.orderNumber}` },
    { key: "customerName", header: "Customer Name" },
    { key: "tableNumber", header: "Table", render: (o) => o.tableNumber ? `Table ${o.tableNumber}` : "Takeout" },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge variant={o.status === "served" ? "muted" : o.status === "ready" ? "success" : "warning"} className="capitalize">
          {o.status}
        </Badge>
      ),
    },
    { key: "total", header: "Total", render: (o) => `₹${o.total.toFixed(2)}` },
    {
      key: "actions",
      header: "Action",
      render: (o) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(o)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Order Floor Control" description="Active table tickets, server assignments, and quick order updates" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "cooking", "ready", "served"].map((st) => (
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

      {isLoading ? (
        <LoadingSkeleton variant="table" count={5} />
      ) : error ? (
        <ErrorState title="Failed to load floor orders" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No floor orders found" description="There are currently no active orders." />
      ) : (
        <DataTable data={filteredOrders} columns={columns} keyExtractor={(o) => o.id} />
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ticket Summary #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>Customer: {selectedOrder.customerName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-sm">
              <div className="divide-y divide-border border-y border-border py-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total Amount</span>
                <span className="text-primary">₹{selectedOrder.total.toFixed(2)}</span>
              </div>

              {selectedOrder.status !== "served" && (
                <Button className="w-full mt-2" onClick={() => advanceStatus(selectedOrder.id, selectedOrder.status)}>
                  Advance Status ({selectedOrder.status} → Next)
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
