import { Users } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TABLE_STATUS_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import type { RestaurantTable } from "@/types";

interface TableCardProps {
  table: RestaurantTable;
  onClick?: (table: RestaurantTable) => void;
  className?: string;
}

const statusLabels: Record<RestaurantTable["status"], string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
  cleaning: "Cleaning",
};

export function TableCard({ table, onClick, className }: TableCardProps) {
  const badgeVariant = TABLE_STATUS_COLORS[table.status];

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(table)}
      className={cn("text-left", className)}
      aria-label={`Table ${table.number}, ${statusLabels[table.status]}, seats ${table.capacity}`}
    >
      <Card
        className={cn(
          "cursor-pointer transition-shadow hover:shadow-md",
          table.status === "occupied" && "border-destructive/30",
          table.status === "reserved" && "border-warning/30",
          table.status === "available" && "border-success/30",
        )}
      >
        <CardContent className="flex flex-col items-center gap-2 p-4">
          <span className="text-2xl font-bold">{table.number}</span>
          <Badge variant={badgeVariant}>{statusLabels[table.status]}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{table.capacity} seats</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{table.section}</span>
        </CardContent>
      </Card>
    </motion.button>
  );
}
