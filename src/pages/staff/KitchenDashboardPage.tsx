import { Clock, ArrowRight, ChefHat, CheckCircle2, UtensilsCrossed } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { KITCHEN_COLUMNS } from "@/constants";
import { useOrders } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";

export function KitchenDashboardPage() {
  const { orders, isLoading, updateOrderStatus } = useOrders();

  // Filter out orders older than 12 hours to keep KDS clean for the current shift
  const activeShiftOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    return orderDate >= twelveHoursAgo;
  });

  const advanceOrderStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      pending: "cooking",
      cooking: "ready",
      ready: "served",
      served: "served",
      cancelled: "cancelled",
    };

    await updateOrderStatus(orderId, nextStatusMap[currentStatus]);
  };

  const getColBadgeVariant = (colId: string): "warning" | "default" | "success" | "muted" => {
    if (colId === "pending") return "warning";
    if (colId === "cooking") return "default";
    if (colId === "ready") return "success";
    return "muted";
  };

  const getActionButtonLabel = (status: OrderStatus) => {
    if (status === "pending") return "Start Cooking";
    if (status === "cooking") return "Mark Ready";
    if (status === "ready") return "Mark Served";
    return "Completed";
  };

  const getActionButtonIcon = (status: OrderStatus) => {
    if (status === "pending") return ChefHat;
    if (status === "cooking") return UtensilsCrossed;
    if (status === "ready") return CheckCircle2;
    return CheckCircle2;
  };

  const calculateElapsedTime = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const diffMins = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Display System (KDS)"
        description="Real-time order ticket Kanban for kitchen operations and prep timing"
      />

      {isLoading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {KITCHEN_COLUMNS.map((col) => {
            // Filter orders for this column using only active shift orders
            let colOrders = activeShiftOrders.filter((o) => o.status === col.id);
            
            // Limit 'served' orders to recent 10 to avoid clutter
            if (col.id === 'served') {
              colOrders = colOrders.slice(0, 10);
            }

            return (
              <div key={col.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                    <Badge variant={getColBadgeVariant(col.id)}>
                      {colOrders.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {colOrders.map((order) => {
                    const ActionIcon = getActionButtonIcon(order.status);
                    return (
                      <Card key={order.id} className="border-l-4 border-l-primary shadow-xs">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                          <div>
                            <CardTitle className="text-base font-bold">Ticket #{order.orderNumber}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              Table {order.tableNumber ? `#${order.tableNumber}` : "Takeout"} · {order.customerName}
                            </p>
                          </div>
                          <Badge variant="outline" className="gap-1 text-[11px]">
                            <Clock className="size-3" /> {calculateElapsedTime(order.createdAt)}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-3">
                          <div className="space-y-1.5 text-xs border-y border-border/50 py-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="space-y-0.5">
                                <div className="flex justify-between font-medium">
                                  <span>{item.quantity}x {item.name}</span>
                                </div>
                                {item.notes && (
                                  <p className="text-[10px] text-amber-500 italic">Note: {item.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>

                          {order.status !== "served" && order.status !== "cancelled" && (
                            <Button
                              size="sm"
                              className="w-full gap-2 text-xs font-semibold"
                              onClick={() => advanceOrderStatus(order.id, order.status)}
                            >
                              <ActionIcon className="size-3.5" />
                              {getActionButtonLabel(order.status)}
                              <ArrowRight className="size-3 ml-auto" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {colOrders.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      No orders in {col.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
