import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface SidebarProps {
  items: NavItem[];
  title?: string;
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({
  items,
  title = "Navigation",
  open = true,
  onClose,
  className,
}: SidebarProps) {
  const sidebarContent = (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label={title}>
        {items.map((item) => {
          const Icon = (Icons[item.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Circle;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="secondary" className="ml-auto size-5 justify-center p-0 text-[10px]">
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebarContent}</div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
