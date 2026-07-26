import { useState, useRef } from "react";
import { Search, XCircle, Printer, CheckCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/types";

export function AdminOrdersPage() {
  const { orders, isLoading, error, isEmpty, refetch, updateOrderStatus } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.includes(search) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "cancelled");
    setSelectedOrder(null);
  };

  const handleMarkPaid = async (orderId: string) => {
    // In a real app we would create a payment record
    // Here we just update order status to served (which implies paid/completed in this demo)
    await updateOrderStatus(orderId, "served");
    setSelectedOrder(null);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const columns: DataTableColumn<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (o) => `#${o.orderNumber}` },
    { key: "customerName", header: "Customer Name" },
    { key: "tableNumber", header: "Table", render: (o) => o.tableNumber ? `Table ${o.tableNumber}` : "Takeout" },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge variant={o.status === "served" ? "muted" : o.status === "ready" ? "success" : o.status === "cancelled" ? "destructive" : "warning"} className="capitalize">
          {o.status}
        </Badge>
      ),
    },
    { key: "total", header: "Total", render: (o) => `₹${o.total.toFixed(2)}` },
    { key: "createdAt", header: "Time", render: (o) => new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
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
      <PageHeader title="Order Management" description="Monitor and review all active and historical restaurant orders" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "cooking", "ready", "served", "cancelled"].map((st) => (
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
        <ErrorState title="Failed to load orders" message={error.message} onRetry={refetch} />
      ) : isEmpty ? (
        <EmptyState title="No orders found" description="There are currently no orders in the database." />
      ) : (
        <DataTable data={filteredOrders} columns={columns} keyExtractor={(o) => o.id} />
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Summary #{selectedOrder.orderNumber}</DialogTitle>
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
              <div className="flex justify-between text-muted-foreground pt-2">
                <span>Subtotal</span>
                <span>₹{(selectedOrder.total / 1.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes (5% GST)</span>
                <span>₹{(selectedOrder.total - (selectedOrder.total / 1.05)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                <span>Total Amount Due</span>
                <span className="text-primary">₹{selectedOrder.total.toFixed(2)}</span>
              </div>

              {selectedOrder.status !== "served" && selectedOrder.status !== "cancelled" && (
                <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button variant="outline" size="sm" onClick={handlePrintInvoice} className="w-full sm:w-auto gap-2">
                    <Printer className="size-4" /> Invoice
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleMarkPaid(selectedOrder.id)} className="w-full sm:w-auto gap-2">
                    <CheckCircle className="size-4" /> Mark Paid
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(selectedOrder.id)} className="w-full sm:w-auto gap-2">
                    <XCircle className="size-4" /> Cancel
                  </Button>
                </DialogFooter>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
