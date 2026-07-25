import { Clock, ArrowRight } from "lucide-react";

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
            const colOrders = orders.filter((o) => o.status === col.id);
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
                  {colOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary shadow-xs">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle className="text-base font-bold">Ticket #{order.orderNumber}</CardTitle>
                          <p className="text-xs text-muted-foreground">Table {order.tableNumber || "Takeout"}</p>
                        </div>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Clock className="size-3" /> 12m ago
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-3">
                        <div className="space-y-1 text-xs border-y border-border/50 py-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between font-medium">
                              <span>{item.quantity}x {item.name}</span>
                            </div>
                          ))}
                        </div>

                        {order.status !== "served" && (
                          <Button
                            size="sm"
                            className="w-full gap-2 text-xs"
                            onClick={() => advanceOrderStatus(order.id, order.status)}
                          >
                            Mark as Next Status
                            <ArrowRight className="size-3.5" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}

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
