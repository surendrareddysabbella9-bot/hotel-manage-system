import { Link } from "react-router-dom";
import { Utensils, Calendar, Clock, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodCard } from "@/components/cards/FoodCard";
import { ReservationCard } from "@/components/cards/ReservationCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ROUTES } from "@/constants";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useReservations } from "@/hooks/useReservations";

export function CustomerHomePage() {
  const { items: menuItems, isLoading: isMenuLoading } = useMenu();
  const { orders, isLoading: isOrdersLoading } = useOrders();
  const { reservations, isLoading: isResLoading } = useReservations();

  const featuredItems = menuItems.slice(0, 3);
  const activeOrder = orders.find((o) => o.status !== "served" && o.status !== "cancelled");
  const upcomingReservation = reservations.find((r) => r.status === "confirmed");

  const isLoading = isMenuLoading || isOrdersLoading || isResLoading;

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/90 via-primary to-amber-600 p-8 sm:p-12 text-primary-foreground shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-300" />
            Chef's Special Tasting Menu Available
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Savor Authentic Culinary Excellence
          </h1>
          <p className="text-sm sm:text-base opacity-90 leading-relaxed">
            Order fresh meals right from your phone, reserve private tables, or track your kitchen ticket in real time.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" variant="secondary" className="rounded-full gap-2 font-semibold shadow-md" asChild>
              <Link to={ROUTES.customer.menu}>
                <Utensils className="size-4" /> Order Food Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2 font-semibold" asChild>
              <Link to={ROUTES.customer.reservation}>
                <Calendar className="size-4" /> Reserve a Table
              </Link>
            </Button>
          </div>
        </div>

        {/* Ambient Overlay Design Glow */}
        <div className="absolute -right-12 -top-12 size-96 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Active Ticket Banner / Upcoming Reservation Notification */}
      <div className="grid gap-6 md:grid-cols-2">
        {activeOrder && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary animate-pulse" />
                Active Kitchen Order #{activeOrder.orderNumber}
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs gap-1" asChild>
                <Link to={ROUTES.customer.tracking}>Track Status <ArrowRight className="size-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Your order is currently <span className="font-semibold text-primary capitalize">{activeOrder.status}</span>. Estimated prep time ~15 mins.
              </p>
            </CardContent>
          </Card>
        )}

        {upcomingReservation && (
          <Card className="border-success/30 bg-success/5">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-success" />
                Upcoming Table Reservation
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs gap-1" asChild>
                <Link to={ROUTES.customer.reservation}>View All <ArrowRight className="size-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <ReservationCard reservation={upcomingReservation} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Featured Chef Specials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Popular Dishes Today</h2>
            <p className="text-xs text-muted-foreground">Top-rated favorites handpicked by our executive chef</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.customer.menu} className="gap-1 text-xs">
              View Full Menu <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} onAddToCart={() => {}} />
          ))}
        </div>
      </section>
    </div>
  );
}
