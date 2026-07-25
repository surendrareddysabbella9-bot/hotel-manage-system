import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReservationCard } from "@/components/cards/ReservationCard";
import { mockReservations } from "@/mocks";
import type { Reservation } from "@/types";

export function CustomerReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [date, setDate] = useState("2026-07-26");
  const [time, setTime] = useState("19:00");
  const [partySize, setPartySize] = useState("4");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      customerId: "user-002",
      customerName: "Sarah Chen",
      partySize: parseInt(partySize, 10),
      date,
      time,
      status: "confirmed",
      specialRequests: specialRequests || undefined,
    };

    setReservations([newReservation, ...reservations]);
    setIsSuccessOpen(true);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Table Reservation"
        description="Book your table in advance and secure your dining spot"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Booking Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" />
              Book a Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                  >
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partySize">Number of Guests</Label>
                <div className="flex items-center gap-2">
                  {[2, 4, 6, 8].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={partySize === num.toString() ? "default" : "outline"}
                      className="flex-1 gap-1"
                      onClick={() => setPartySize(num.toString())}
                    >
                      <Users className="size-3.5" />
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Input
                  id="specialRequests"
                  placeholder="e.g. Window seat preference, birthday celebration, high chair needed"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Confirm Reservation
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Reservations Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Your Reservations ({reservations.length})
          </h3>
          <div className="space-y-3">
            {reservations.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <CheckCircle2 className="size-12 text-success mb-2" />
            <DialogTitle>Reservation Confirmed!</DialogTitle>
            <DialogDescription>
              We look forward to hosting you on <span className="font-semibold text-foreground">{date}</span> at <span className="font-semibold text-foreground">{time}</span> for <span className="font-semibold text-foreground">{partySize} guests</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button className="w-full" onClick={() => setIsSuccessOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
