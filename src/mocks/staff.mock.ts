import type { StaffMember, DashboardStat } from "@/types";

export const mockStaff: StaffMember[] = [
  {
    id: "staff-001",
    fullName: "Marco Rivera",
    email: "chef@restaurantos.app",
    role: "chef",
    status: "active",
    shift: "Evening",
  },
  {
    id: "staff-002",
    fullName: "Elena Vasquez",
    email: "elena@restaurantos.app",
    role: "waiter",
    status: "active",
    shift: "Evening",
  },
  {
    id: "staff-003",
    fullName: "Tom Bradley",
    email: "tom@restaurantos.app",
    role: "manager",
    status: "active",
    shift: "Evening",
  },
  {
    id: "staff-004",
    fullName: "Nina Patel",
    email: "nina@restaurantos.app",
    role: "host",
    status: "on_break",
    shift: "Evening",
  },
  {
    id: "staff-005",
    fullName: "Chris O'Brien",
    email: "chris@restaurantos.app",
    role: "waiter",
    status: "off_duty",
    shift: "Morning",
  },
];

export const mockDashboardStats: DashboardStat[] = [
  {
    id: "stat-001",
    label: "Today's Revenue",
    value: "$4,280",
    change: 12.5,
    changeLabel: "vs yesterday",
    icon: "DollarSign",
  },
  {
    id: "stat-002",
    label: "Active Orders",
    value: 18,
    change: -3.2,
    changeLabel: "vs last hour",
    icon: "ShoppingBag",
  },
  {
    id: "stat-003",
    label: "Reservations Tonight",
    value: 24,
    change: 8.0,
    changeLabel: "vs last week",
    icon: "Calendar",
  },
  {
    id: "stat-004",
    label: "Table Occupancy",
    value: "78%",
    change: 5.1,
    changeLabel: "vs average",
    icon: "Users",
  },
];
