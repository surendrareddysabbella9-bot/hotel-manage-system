import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/constants";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
  compact?: boolean;
  className?: string;
}

const statusVariants: Record<
  Order["status"],
  "warning" | "default" | "success" | "muted" | "destructive"
> = {
  pending: "warning",
  cooking: "default",
  ready: "success",
  served: "muted",
  cancelled: "destructive",
};

export function OrderCard({
  order,
  onClick,
  compact = false,
  className,
}: OrderCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
      onClick={() => onClick?.(order)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick(order);
        }
      }}
    >
      <CardHeader className={cn("pb-2", compact && "p-4")}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            Order #{order.orderNumber}
          </CardTitle>
          <Badge variant={statusVariants[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-2", compact && "p-4 pt-0")}>
        <p className="text-sm text-muted-foreground">{order.customerName}</p>
        {order.tableNumber && (
          <p className="text-xs text-muted-foreground">
            Table {order.tableNumber}
          </p>
        )}
        {!compact && (
          <ul className="space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold">{formatCurrency(order.total)}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" aria-hidden="true" />
            {formatRelativeTime(order.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
