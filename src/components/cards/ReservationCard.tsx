import { Calendar, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { Reservation } from "@/types";

interface ReservationCardProps {
  reservation: Reservation;
  onClick?: (reservation: Reservation) => void;
  className?: string;
}

const statusVariants: Record<
  Reservation["status"],
  "success" | "warning" | "default" | "muted" | "destructive"
> = {
  confirmed: "success",
  pending: "warning",
  seated: "default",
  completed: "muted",
  cancelled: "destructive",
};

export function ReservationCard({
  reservation,
  onClick,
  className,
}: ReservationCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
      onClick={() => onClick?.(reservation)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{reservation.customerName}</CardTitle>
          <Badge variant={statusVariants[reservation.status]}>
            {reservation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" aria-hidden="true" />
          <span>
            {formatDate(reservation.date)} at {reservation.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" aria-hidden="true" />
          <span>Party of {reservation.partySize}</span>
          {reservation.tableNumber && (
            <span>· Table {reservation.tableNumber}</span>
          )}
        </div>
        {reservation.specialRequests && (
          <p className="text-xs text-muted-foreground italic">
            {reservation.specialRequests}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
