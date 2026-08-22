export const APP_NAME = "RestaurantOS";
export const APP_DESCRIPTION =
  "Intelligent Restaurant Management Platform powered by AI";

export const RESTAURANT_TAX_RATE = 0.05; // Configurable 5% GST tax rate constant

export const ROUTES = {
  landing: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  customer: {
    login: "/customer/login",
    home: "/customer",
    menu: "/customer/menu",
    cart: "/customer/cart",
    reservation: "/customer/reservations",
    tracking: "/customer/tracking",
    profile: "/customer/profile",
  },
  staff: {
    login: "/staff/login",
    home: "/staff",
    kitchen: "/staff/kitchen",
    orders: "/staff/orders",
    tables: "/staff/tables",
    inventory: "/staff/inventory",
  },
  admin: {
    login: "/admin/login",
    home: "/admin",
    dashboard: "/admin/dashboard",
    orders: "/admin/orders",
    menu: "/admin/menu",
    inventory: "/admin/inventory",
    reservations: "/admin/reservations",
    customers: "/admin/customers",
    staff: "/admin/staff",
    analytics: "/admin/analytics",
    settings: "/admin/settings",
    tables: "/admin/tables",
  },
  scan: {
    table: "/scan/table",
  },
} as const;

export const TABLE_STATUS_COLORS = {
  available: "success",
  occupied: "destructive",
  reserved: "warning",
  cleaning: "muted",
} as const;

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  cooking: "Cooking",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
} as const;

export const KITCHEN_COLUMNS = [
  { id: "pending", label: "Pending", color: "warning" },
  { id: "cooking", label: "Cooking", color: "primary" },
  { id: "ready", label: "Ready", color: "success" },
  { id: "served", label: "Served", color: "muted" },
] as const;
