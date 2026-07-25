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
  {
    path: ROUTES.landing,
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.signup, element: <SignupPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <CustomerLayout />,
    children: [
      { path: ROUTES.customer.home, element: <CustomerHomePage /> },
      { path: ROUTES.customer.menu, element: <DigitalMenuPage /> },
      { path: ROUTES.customer.cart, element: <CartPage /> },
      { path: ROUTES.customer.reservation, element: <CustomerReservationPage /> },
      { path: ROUTES.customer.tracking, element: <OrderTrackingPage /> },
      { path: ROUTES.customer.profile, element: <CustomerProfilePage /> },
    ],
  },
  {
    element: <StaffLayout />,
    children: [
      { path: ROUTES.staff.kitchen, element: <KitchenDashboardPage /> },
      { path: ROUTES.staff.orders, element: <StaffOrdersPage /> },
      { path: ROUTES.staff.tables, element: <TableManagementPage /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: ROUTES.admin.dashboard, element: <AdminDashboardPage /> },
      { path: ROUTES.admin.orders, element: <AdminOrdersPage /> },
      { path: ROUTES.admin.menu, element: <MenuManagementPage /> },
      { path: ROUTES.admin.inventory, element: <InventoryPage /> },
      { path: ROUTES.admin.reservations, element: <AdminReservationsPage /> },
      { path: ROUTES.admin.customers, element: <CustomersPage /> },
      { path: ROUTES.admin.staff, element: <StaffManagementPage /> },
      { path: ROUTES.admin.analytics, element: <AnalyticsPage /> },
      { path: ROUTES.admin.settings, element: <SettingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <Navigate to={ROUTES.admin.dashboard} replace />,
  },
  {
    path: "/customer",
    element: <Navigate to={ROUTES.customer.home} replace />,
  },
  {
    path: "/staff",
    element: <Navigate to={ROUTES.staff.kitchen} replace />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
