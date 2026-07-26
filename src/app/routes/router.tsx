import { createBrowserRouter, Navigate } from "react-router-dom";

import { ROUTES } from "@/constants";
import {
  AdminLayout,
  AuthLayout,
  CustomerLayout,
  StaffLayout,
} from "@/layouts";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
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

  // Customer Portal Logins & Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: "/customer/login", element: <LoginPage /> },
      { path: "/admin/login", element: <LoginPage /> },
      { path: "/staff/login", element: <LoginPage /> },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.signup, element: <SignupPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },

  // 1. Customer Portal Route Tree
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerHomePage /> },
      { path: "menu", element: <DigitalMenuPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "reservations", element: <CustomerReservationPage /> },
      { path: "tracking", element: <OrderTrackingPage /> },
      { path: "profile", element: <CustomerProfilePage /> },
    ],
  },

  // 2. Admin Portal Route Tree
  {
    path: "/admin",
    element: <AdminLayout />,
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
    ],
  },

  // 3. Staff Portal Route Tree
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      { index: true, element: <Navigate to="/staff/kitchen" replace /> },
      { path: "kitchen", element: <KitchenDashboardPage /> },
      { path: "orders", element: <StaffOrdersPage /> },
      { path: "tables", element: <TableManagementPage /> },
      { path: "inventory", element: <InventoryPage /> },
    ],
  },

  // Fallback Catch-All
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
