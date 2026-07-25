import type { User, Notification } from "@/types";

export const mockCurrentUser: User = {
  id: "user-001",
  email: "admin@restaurantos.app",
  fullName: "Alex Morgan",
  avatarUrl: undefined,
  role: "admin",
  createdAt: "2025-01-15T08:00:00Z",
};

export const mockCustomerUser: User = {
  id: "user-002",
  email: "sarah@example.com",
  fullName: "Sarah Chen",
  avatarUrl: undefined,
  role: "customer",
  createdAt: "2025-03-20T10:30:00Z",
};

export const mockStaffUser: User = {
  id: "user-003",
  email: "chef@restaurantos.app",
  fullName: "Marco Rivera",
  avatarUrl: undefined,
  role: "staff",
  createdAt: "2025-02-01T06:00:00Z",
};

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    title: "New reservation",
    message: "Table for 4 confirmed at 7:30 PM tonight.",
    read: false,
    createdAt: "2026-07-25T10:15:00Z",
    type: "info",
  },
  {
    id: "notif-002",
    title: "Low inventory alert",
    message: "Salmon fillet stock is below threshold.",
    read: false,
    createdAt: "2026-07-25T09:45:00Z",
    type: "warning",
  },
  {
    id: "notif-003",
    title: "Order completed",
    message: "Order #1042 has been served successfully.",
    read: true,
    createdAt: "2026-07-25T08:30:00Z",
    type: "success",
  },
  {
    id: "notif-004",
    title: "Staff shift update",
    message: "Marco Rivera started the evening shift.",
    read: true,
    createdAt: "2026-07-25T17:00:00Z",
    type: "info",
  },
];
