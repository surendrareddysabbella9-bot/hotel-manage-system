import { AlertTriangle, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { InventoryItem } from "@/types";

interface InventoryCardProps {
  item: InventoryItem;
  onClick?: (item: InventoryItem) => void;
  className?: string;
}

const statusVariants: Record<
  InventoryItem["status"],
  "success" | "warning" | "destructive"
> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "destructive",
};

const statusLabels: Record<InventoryItem["status"], string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export function InventoryCard({ item, onClick, className }: InventoryCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        item.status !== "in_stock" && "border-warning/30",
        className,
      )}
      onClick={() => onClick?.(item)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
          </div>
          <Badge variant={statusVariants[item.status]}>
            {statusLabels[item.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {item.quantity}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {item.unit}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            Min: {item.minThreshold} {item.unit}
          </span>
        </div>
        {item.status !== "in_stock" && (
          <div className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="size-3" aria-hidden="true" />
            <span>Restock recommended</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Last restocked {formatDate(item.lastRestocked)}
        </p>
      </CardContent>
    </Card>
  );
}
