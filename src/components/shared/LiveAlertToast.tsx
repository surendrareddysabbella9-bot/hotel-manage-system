import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { socket } from "@/lib/socket";

interface LiveAlert {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
}

const ALERT_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const ALERT_STYLES = {
  info: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-success/10 border-success/20 text-success",
  warning: "bg-warning/10 border-warning/20 text-warning",
  error: "bg-destructive/10 border-destructive/20 text-destructive",
};

export function LiveAlertToast() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    // Listen for live_alert events from Socket.io
    const handleLiveAlert = (alert: Omit<LiveAlert, "id">) => {
      const newAlert: LiveAlert = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setAlerts((prev) => [...prev, newAlert]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => removeAlert(newAlert.id), 6000);
    };

    // Listen for order status updates
    const handleOrderUpdate = (data: any) => {
      if (data?.status) {
        const statusMessages: Record<string, string> = {
          cooking: "Your order is now being prepared! 👨‍🍳",
          ready: "Your order is ready for pickup! 🔔",
          served: "Your order has been served. Enjoy! 🍽️",
        };
        const msg = statusMessages[data.status];
        if (msg) {
          handleLiveAlert({
            type: data.status === "ready" ? "success" : "info",
            title: `Order #${data.order_number || ""}`,
            message: msg,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    // Listen for table booking events
    const handleTableBooked = (data: any) => {
      handleLiveAlert({
        type: "info",
        title: "Table Update",
        message: `Table #${data?.table?.number || ""} has been booked`,
        timestamp: new Date().toISOString(),
      });
    };

    socket.on("live_alert", handleLiveAlert);
    socket.on("orders_updated", handleOrderUpdate);
    socket.on("table_booked", handleTableBooked);

    return () => {
      socket.off("live_alert", handleLiveAlert);
      socket.off("orders_updated", handleOrderUpdate);
      socket.off("table_booked", handleTableBooked);
    };
  }, [removeAlert]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl ${ALERT_STYLES[alert.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAlert(alert.id)}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 6, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-current/20 origin-left rounded-b-xl"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
