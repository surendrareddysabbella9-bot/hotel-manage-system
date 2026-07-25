import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { adminNavItems } from "@/config/navigation";
import { mockCurrentUser, mockNotifications } from "@/mocks";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar
        user={mockCurrentUser}
        notifications={mockNotifications}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar
          items={adminNavItems}
          title="Admin Console"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"
        >
          <div className="page-container">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
}
