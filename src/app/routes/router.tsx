import { createBrowserRouter, Navigate } from "react-router-dom";

import { ROUTES } from "@/constants";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  AdminLayout,
  AuthLayout,
  CustomerLayout,
  StaffLayout,
} from "@/layouts";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { CustomerLogin } from "@/pages/auth/CustomerLogin";
import { AdminLogin } from "@/pages/auth/AdminLogin";
import { StaffLogin } from "@/pages/auth/StaffLogin";
import { SignupPage } from "@/pages/auth/SignupPage";
import {
  AdminDashboardPage,
  AdminOrdersPage,
  AdminReservationsPage,
  AnalyticsPage,
  CustomersPage,
  InventoryPage,
  MenuManagementPage,
  SettingsPage,
  StaffManagementPage,
} from "@/pages/admin";
import {
  CartPage,
  CustomerHomePage,
  CustomerProfilePage,
  CustomerReservationPage,
  DigitalMenuPage,
  OrderTrackingPage,
} from "@/pages/customer";
import { LandingPage } from "@/pages/landing/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import {
  KitchenDashboardPage,
  StaffOrdersPage,
  TableManagementPage,
} from "@/pages/staff";

export const router = createBrowserRouter([
  // Landing Page Root
  {
    path: ROUTES.landing,
    element: <LandingPage />,
  },

  // Distinct Login Pages (No shared AuthLayout to allow custom full-screen designs)
  { path: "/customer/login", element: <CustomerLogin /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/staff/login", element: <StaffLogin /> },
  { path: ROUTES.login, element: <CustomerLogin /> },

  // Auth Logins & Recovery (Shared Layout)
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.signup, element: <SignupPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },

  // 1. Protected Customer Portal
  {
    path: "/customer",
    element: (
      <ProtectedRoute allowedRole="customer" loginPath="/customer/login">
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CustomerHomePage /> },
      { path: "menu", element: <DigitalMenuPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "reservations", element: <CustomerReservationPage /> },
      { path: "tracking", element: <OrderTrackingPage /> },
      { path: "profile", element: <CustomerProfilePage /> },
    ],
  },

  // 2. Protected Admin Portal
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRole="admin" loginPath="/admin/login">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "menu", element: <MenuManagementPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "reservations", element: <AdminReservationsPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "staff", element: <StaffManagementPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <CustomerProfilePage /> },
    ],
  },

  // 3. Protected Staff Portal
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRole="staff" loginPath="/staff/login">
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/kitchen" replace /> },
      { path: "kitchen", element: <KitchenDashboardPage /> },
      { path: "orders", element: <StaffOrdersPage /> },
      { path: "tables", element: <TableManagementPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "profile", element: <CustomerProfilePage /> },
    ],
  },

  // Fallback Catch-All
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
