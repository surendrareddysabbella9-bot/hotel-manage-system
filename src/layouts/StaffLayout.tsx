import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { staffNavItems } from "@/config/navigation";
import { useAuth } from "@/app/providers/AuthContext";
import type { User } from "@/types";

export function StaffLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const currentUser: User = user || {
    id: "staff-1",
    fullName: "Floor Staff",
    email: "staff@restaurantos.app",
    role: "staff",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar
        user={currentUser}
        notifications={[]}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar
          items={staffNavItems}
          title="Floor Roster"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4 md:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
