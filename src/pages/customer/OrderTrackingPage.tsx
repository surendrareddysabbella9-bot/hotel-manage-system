import { Clock, CheckCircle2, ChefHat, UtensilsCrossed, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrders } from "@/hooks/useOrders";

export function OrderTrackingPage() {
  const { orders, isLoading } = useOrders();

  const currentOrder = orders[0];

  const steps = [
    { id: "pending", label: "Order Received", icon: Clock, desc: "Your order ticket has reached the kitchen." },
    { id: "cooking", label: "Cooking & Preparation", icon: ChefHat, desc: "Our executive chef is preparing your meal." },
    { id: "ready", label: "Ready for Pickup/Service", icon: UtensilsCrossed, desc: "Your dishes are hot and plated." },
    { id: "served", label: "Order Completed", icon: CheckCircle2, desc: "Enjoy your dining experience!" },
  ];

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (!currentOrder) {
    return (
      <EmptyState
        title="No active order found"
        description="You have no current active order tickets in progress."
      />
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentOrder.status);
  const progressPercent = Math.max(25, ((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <PageHeader
        title={`Live Ticket Tracking #${currentOrder.orderNumber}`}
        description="Real-time kitchen status progression and live order ticket updates"
      />

      {/* Main Order Tracker Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Ticket #{currentOrder.orderNumber}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Placed at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <Badge variant={currentOrder.status === "served" ? "success" : "warning"} className="capitalize px-3 py-1 text-xs">
            {currentOrder.status}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Preparation Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-xs"
                      : isDone
                      ? "border-success/40 bg-success/5"
                      : "border-border opacity-50"
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${
                      isCurrent
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : isDone
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h4 className="font-semibold text-xs">{step.label}</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Ticket Items Summary */}
          <div className="border-t border-border pt-4 space-y-2">
            <h4 className="font-semibold text-xs uppercase text-muted-foreground">Order Ticket Contents</h4>
            <div className="divide-y divide-border text-xs">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="py-2 flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
