import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { adminNavItems } from "@/config/navigation";
import { useAuth } from "@/app/providers/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { useReservations } from "@/hooks/useReservations";
import { useNotifications } from "@/hooks/useNotifications";
import type { User, NavItem } from "@/types";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { orders } = useOrders();
  const { lowStockCount } = useInventory();
  const { reservations } = useReservations();
  const { notifications, markAllAsRead } = useNotifications();

  const activeOrdersCount = orders.filter((o) => o.status !== "served" && o.status !== "cancelled").length;
  const activeReservationsCount = reservations.filter((r) => r.status === "confirmed").length;

  const dynamicNavItems: NavItem[] = adminNavItems.map((item) => {
    if (item.label === "Orders") {
      return { ...item, badge: activeOrdersCount };
    }
    if (item.label === "Inventory") {
      return { ...item, badge: lowStockCount };
    }
    if (item.label === "Reservations") {
      return { ...item, badge: activeReservationsCount };
    }
    return item;
  });

  const currentUser: User = user || {
    id: "admin-1",
    fullName: "System Admin",
    email: "admin@restaurantos.app",
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar
        user={currentUser}
        notifications={notifications}
        onClearNotifications={markAllAsRead}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar
          items={dynamicNavItems}
          title="Admin Console"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
