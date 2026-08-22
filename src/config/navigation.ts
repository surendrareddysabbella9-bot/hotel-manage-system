import { ROUTES } from "@/constants";
import type { NavItem } from "@/types";

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: ROUTES.admin.dashboard, icon: "LayoutDashboard" },
  { label: "Orders", href: ROUTES.admin.orders, icon: "ShoppingBag" },
  { label: "Menu", href: ROUTES.admin.menu, icon: "UtensilsCrossed" },
  { label: "Inventory", href: ROUTES.admin.inventory, icon: "Package" },
  { label: "Reservations", href: ROUTES.admin.reservations, icon: "Calendar" },
  { label: "Customers", href: ROUTES.admin.customers, icon: "Users" },
  { label: "Staff", href: ROUTES.admin.staff, icon: "UserCog" },
  { label: "Analytics", href: ROUTES.admin.analytics, icon: "BarChart3" },
  { label: "Settings", href: ROUTES.admin.settings, icon: "Settings" },
  { label: "Tables", href: ROUTES.admin.tables, icon: "Grid3X3" },
];

export const staffNavItems: NavItem[] = [
  { label: "Kitchen", href: ROUTES.staff.kitchen, icon: "ChefHat" },
  { label: "Orders", href: ROUTES.staff.orders, icon: "ClipboardList" },
  { label: "Tables", href: ROUTES.staff.tables, icon: "Grid3X3" },
  { label: "Inventory", href: ROUTES.staff.inventory, icon: "Package" },
];

export const customerNavItems: NavItem[] = [
  { label: "Home", href: ROUTES.customer.home, icon: "Home" },
  { label: "Menu", href: ROUTES.customer.menu, icon: "UtensilsCrossed" },
  { label: "Cart", href: ROUTES.customer.cart, icon: "ShoppingCart" },
  { label: "Reservations", href: ROUTES.customer.reservation, icon: "Calendar" },
  { label: "Tracking", href: ROUTES.customer.tracking, icon: "MapPin" },
  { label: "Profile", href: ROUTES.customer.profile, icon: "User" },
];
