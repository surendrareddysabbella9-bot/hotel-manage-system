export type UserRole = "customer" | "staff" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "info" | "success" | "warning" | "error";
}

export type OrderStatus =
  | "pending"
  | "cooking"
  | "ready"
  | "served"
  | "cancelled";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  tableNumber?: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  section: string;
  currentOrderId?: string;
  reservationId?: string;
}

export type ReservationStatus =
  | "confirmed"
  | "pending"
  | "seated"
  | "completed"
  | "cancelled";

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  partySize: number;
  date: string;
  time: string;
  tableNumber?: number;
  status: ReservationStatus;
  specialRequests?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  preparationTime: number;
  available: boolean;
  popular?: boolean;
  tags: string[];
}

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: InventoryStatus;
  lastRestocked: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: "chef" | "waiter" | "manager" | "host";
  status: "active" | "off_duty" | "on_break";
  avatarUrl?: string;
  shift: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface ChartPlaceholderConfig {
  id: string;
  title: string;
  description: string;
  height?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
