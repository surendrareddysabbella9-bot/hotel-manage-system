import { Link } from "react-router-dom";
import { UtensilsCrossed, Calendar, ArrowRight, Sparkles, Clock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/cards/FoodCard";
import { ROUTES } from "@/constants";
import { mockMenuItems, mockOrders, mockReservations } from "@/mocks";

export function CustomerHomePage() {
  const featuredItems = mockMenuItems.slice(0, 3);
  const activeOrder = mockOrders.find((o) => o.status !== "served" && o.status !== "cancelled");
  const upcomingReservation = mockReservations.find((r) => r.status === "confirmed");

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 sm:p-8 border border-primary/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="size-3.5" />
            Welcome back, Sarah!
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready for a memorable dining experience?
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore our chef-curated menu, book your preferred table, or track your live order in real-time.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link to={ROUTES.customer.menu} className="gap-2">
                <UtensilsCrossed className="size-4" />
                Browse Menu
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={ROUTES.customer.reservation} className="gap-2">
                <Calendar className="size-4" />
                Book Table
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Status Widgets */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Active Order Card */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Active Order</CardTitle>
            <Badge variant="warning" className="capitalize">
              {activeOrder?.status || "Cooking"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrder ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Order #{activeOrder.orderNumber}</span>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="size-3" /> ~15 min remaining
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activeOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </p>
                <Button size="sm" variant="secondary" className="w-full gap-2" asChild>
                  <Link to={ROUTES.customer.tracking}>
                    Track Live Progress
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No active orders right now.</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reservation Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Reservation</CardTitle>
            <Badge variant="success">Confirmed</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReservation ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{upcomingReservation.date} at {upcomingReservation.time}</span>
                  <span className="text-muted-foreground text-xs">{upcomingReservation.partySize} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Table {upcomingReservation.tableNumber} (Main Dining)
                </div>
                <Button size="sm" variant="outline" className="w-full gap-2" asChild>
                  <Link to={ROUTES.customer.reservation}>
                    View Reservation Details
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming table reservations.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chef Recommendations / Popular Dishes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Chef&apos;s Highlights</h2>
            <p className="text-xs text-muted-foreground">Most ordered signature dishes of the week</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.customer.menu} className="gap-1 text-xs">
              View All <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
