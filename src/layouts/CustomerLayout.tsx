import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AgenticChatbot } from "@/components/customer/AgenticChatbot";
import { customerNavItems } from "@/config/navigation";
import { useAuth } from "@/app/providers/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { User } from "@/types";

export function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, markAllAsRead } = useNotifications();

  const currentUser: User = user || {
    id: "cust-1",
    fullName: "Customer Diner",
    email: "customer@restaurantos.app",
    role: "customer",
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
          items={customerNavItems}
          title="Dining Guest"
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
      <AgenticChatbot />
    </div>
  );
}
