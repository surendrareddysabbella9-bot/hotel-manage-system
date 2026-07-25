import { Clock, ChefHat, CheckCircle2, Utensils, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockOrders } from "@/mocks";
import type { OrderStatus } from "@/types";

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending", label: "Received", icon: Clock },
  { status: "cooking", label: "Cooking", icon: ChefHat },
  { status: "ready", label: "Ready", icon: CheckCircle2 },
  { status: "served", label: "Served", icon: Utensils },
];

export function OrderTrackingPage() {
  const currentOrder = mockOrders[0]; // Order #1042 (status: cooking)

  const getStepStatus = (stepStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ["pending", "cooking", "ready", "served"];
    const currentIndex = statusOrder.indexOf(currentOrder.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader
        title={`Order #${currentOrder.orderNumber} Status`}
        description="Track your dish from preparation to table delivery in real-time"
      />

      {/* Progress Timeline Card */}
      <Card className="border-primary/20 bg-gradient-to-b from-card to-background">
        <CardHeader className="text-center pb-2">
          <Badge variant="warning" className="mx-auto uppercase tracking-wider text-xs px-3 py-1 mb-2">
            Status: {currentOrder.status}
          </Badge>
          <CardTitle className="text-2xl font-bold">Estimated Time: ~12 Mins</CardTitle>
          <p className="text-xs text-muted-foreground">Kitchen team is actively cooking your meals</p>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Visual Timeline Steps */}
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-muted">
              <div className="h-full bg-primary transition-all duration-500 w-1/2" />
            </div>

            {steps.map((step) => {
              const state = getStepStatus(step.status);
              const Icon = step.icon;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full border-2 transition-all ${
                      state === "completed"
                        ? "border-primary bg-primary text-primary-foreground"
                        : state === "current"
                        ? "border-primary bg-background text-primary ring-4 ring-primary/20 animate-pulse"
                        : "border-muted bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      state === "current" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Itemized Receipt Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Order Details</CardTitle>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3.5" /> Table {currentOrder.tableNumber}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border text-sm">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold">{item.quantity}x {item.name}</p>
                  <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Paid</span>
            <span className="text-primary">${currentOrder.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
