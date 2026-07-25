import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { OrderCard } from "@/components/cards/OrderCard";
import { mockOrders } from "@/mocks";
import type { Order, OrderStatus } from "@/types";

export function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.includes(search) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Order Management"
        description="Fulfill customer orders, assign tables, and update live status"
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "cooking", "ready", "served"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              className="capitalize"
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={(o) => setSelectedOrder(o)} />
        ))}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
                <Badge variant="outline" className="capitalize">
                  {selectedOrder.status}
                </Badge>
              </div>
              <DialogDescription>
                Customer: <span className="font-medium text-foreground">{selectedOrder.customerName}</span> · Table {selectedOrder.tableNumber || "N/A"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Items</h4>
              <div className="divide-y divide-border border-y border-border py-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Update Order Status</h4>
                <div className="grid grid-cols-4 gap-2">
                  {(["pending", "cooking", "ready", "served"] as OrderStatus[]).map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={selectedOrder.status === st ? "default" : "outline"}
                      className="capitalize text-xs"
                      onClick={() => updateStatus(selectedOrder.id, st)}
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
