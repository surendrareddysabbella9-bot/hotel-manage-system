import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";
import type { Notification, User } from "@/types";

interface NavbarProps {
  user: User;
  notifications: Notification[];
  onClearNotifications?: () => void;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
  className?: string;
}

export function Navbar({
  user,
  notifications,
  onClearNotifications,
  onMenuToggle,
  sidebarOpen,
  className,
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6",
        className,
      )}
    >
      {onMenuToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      )}

      <Link
        to="/"
        className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">R</span>
        </div>
        <span className="hidden sm:inline">{APP_NAME}</span>
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <NotificationDropdown notifications={notifications} onClearAll={onClearNotifications} />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
