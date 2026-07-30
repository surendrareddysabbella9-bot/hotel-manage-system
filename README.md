# 🍽️ RestaurantOS — Intelligent Restaurant Management Platform

> **Vibeathon 6.0 Project** | Next-Generation Full-Stack Restaurant Operating System featuring Real-Time POS, Kitchen Display System (KDS), Customer Digital Ordering, AI Insights, and Enterprise Admin Dashboard.

---

## 📋 Executive Summary

**RestaurantOS** is an all-in-one, enterprise-grade restaurant management ecosystem designed to streamline hospitality operations, automate order workflows, optimize kitchen queue management, and enhance the customer dining experience. Built with a modern **React 19 + Vite + TypeScript** frontend, a **Node.js Express + Socket.io** real-time engine, and a **Supabase PostgreSQL** backend with strict Row Level Security (RLS).

---

## 🏆 Hackathon Submission Details

**Team Name:** SPIDY
**Hosted Application Link:** [https://hotel-manage-system.onrender.com](https://hotel-manage-system.onrender.com) (Deployed on Render)

### 🚀 User Stories Completed

We have successfully completed all tiers of the challenge (Bronze to Platinum):

**Bronze Level – User Experience**
* **User Story 1:** Built a responsive, modern interface with a unified dark theme and intuitive navigation for Customers, Staff, and Admins.

**Silver Level – Authentication & Digital Operations**
* **User Story 2:** Implemented role-based secure authentication (Email/Password & Google OAuth).
* **User Story 3:** Digitized core workflows including a Digital Menu, Smart Cart, Live Order Tracking, Table Reservations, and Staff KDS.

**Gold Level – Restaurant Management**
* **User Story 4:** Developed a comprehensive Admin Dashboard to manage Orders, Tables, Inventory, Staff, Customers, and Sales Analytics.

**Platinum Level – Intelligent Operations**
* **User Story 5:** Integrated intelligent features such as AI Predictive Search for dishes, Smart Notifications, Inventory Low-Stock Triggers, and an Agentic AI Chatbot for customers.

### 🤖 AI Usage
The platform utilizes AI for two major features:
1. **Agentic AI Chatbot (`/customer`)**: Helps users decide what to eat by analyzing their preferences and providing personalized menu recommendations.
2. **AI Predictive Autocomplete**: Enhances the digital menu search experience by intelligently suggesting dish names and ingredients as users type, using Google Gemini API.

---

## 🚀 Feature Analysis Report

RestaurantOS is structured into **four core operational portals**:

### 1. 📱 Customer Portal (Digital Dining & Mobile Ordering)
* **Interactive Digital Menu (`/customer/menu`)**: Dynamic menu catalog with real-time availability tags, dietary filters (Vegetarian, Vegan, Gluten-Free), preparation time badges, search, and dynamic pricing.
* **Smart Cart & Instant Checkout (`/customer/cart`)**: Item customization with special instructions, instant tip calculator, tax/service fee computation, and flexible fulfillment choices (Dine-in, Takeout, Delivery).
* **Live Order Tracking (`/customer/order-tracking`)**: Real-time status pipeline powered by WebSockets (`Pending` ➔ `Cooking` ➔ `Ready` ➔ `Served`).
* **Table Reservations (`/customer/reservation`)**: Online table booking engine supporting party size selection, date/time pickers, seating section selection (Main Dining, Terrace, VIP), and special request notes.
* **Customer Profile & Loyalty CRM (`/customer/profile`)**: Member loyalty tier progression (Silver, Gold, Platinum), accumulated reward points, saved delivery addresses, and historical order receipts.

### 2. 👨‍🍳 Staff & POS Portal (Kitchen & Floor Operations)
* **Redesigned Admin-Style Staff Login (`/staff/login`)**: Secure, sleek authentication portal for Waiters, Chefs, and Floor Managers.
* **Kitchen Display System - KDS (`/staff/kitchen`)**: Real-time order queue for kitchen staff displaying order tickets, prep countdown timers, item notes, and one-tap status updates (`Cooking` ➔ `Ready`).
* **Interactive Floor Plan & Table Management (`/staff/tables`)**: Live visual dining room map showing real-time table statuses (`Available`, `Occupied`, `Reserved`, `Cleaning`) with instant table assignment and waiter dispatch.
* **Staff Order Entry (`/staff/orders`)**: High-speed Point of Sale (POS) interface for quick table order taking, bill splitting, and instant kitchen transmission.

### 3. 📊 Admin & Executive Dashboard (`/admin/*`)
* **Executive Metrics Dashboard (`/admin`)**: Real-time business KPIs including daily gross revenue, order volume, active table occupancy, low-stock inventory alerts, and top-selling items.
* **Menu Management Engine (`/admin/menu`)**: Full CRUD capabilities for menu categories and dishes, price adjustment, preparation time configuration, popularity tagging, and availability toggles.
* **Inventory & Supply Chain Control (`/admin/inventory`)**: Automatic inventory tracking, custom low-stock threshold triggers (`In Stock`, `Low Stock`, `Out of Stock`), manual restock logging, and spoilage audit trails (`inventory_logs`).
* **Master Order & Payment Management (`/admin/orders`)**: Complete operational view of all historical and active orders, payment status tracking (`Pending`, `Completed`, `Failed`, `Refunded`), payment method filters (Cash, Card, UPI), and refund processing.
* **Analytics & Business Intelligence (`/admin/analytics`)**: Detailed sales analytics, peak hour traffic distribution, revenue growth metrics, and daily sales aggregate reports (`daily_sales`).
* **Staff Directory & Shift Management (`/admin/staff`)**: Staff profile administration, role assignment (`Manager`, `Chef`, `Waiter`, `Host`), status tracking (`Active`, `Off Duty`, `On Break`), and activity audits (`staff_activity`).
* **Customer Relationship Management (`/admin/customers`)**: Database of registered guests, loyalty tier overrides, and customer feedback reviews.
* **System Settings (`/admin/settings`)**: Platform-wide configuration including tax percentages, service fees, operating hours, and notification rules.

### 4. 🤖 AI & Intelligent Services (`/api/ai/*`)
* **AI Dish & Description Generator**: Automated enticing menu description copy creation based on ingredients and culinary style.
* **Dynamic Pricing & Demand Suggestions**: Intelligent pricing recommendations based on inventory velocity and popularity.
* **Smart Search & Semantic Discovery**: Natural language item search across menu items and inventory.

---

## 🏗️ Architecture & System Design Report

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Vite)                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │   Customer Portal    │  │   Staff / POS Portal │  │   Admin Portal    │  │
│  │ (React 19 / Tailwind)│  │ (React 19 / Tailwind)│  │ (React 19 / UI)   │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
└─────────────┼─────────────────────────┼────────────────────────┼────────────┘
              │                         │                        │             
              ▼                         ▼                        ▼             
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION & REAL-TIME LAYER                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                 React Router v7 + TanStack Query                    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                       │
│          REST APIs & WebSockets      │ Socket.io Real-Time Events            │
│          ┌───────────────────────────┴────────────────────────────┐         │
│          ▼                                                        ▼         │
│  ┌───────────────┐                                       ┌────────────────┐ │
│  │ Express REST  │                                       │ Socket.io Server│ │
│  │ Node.js API   │                                       │  (Port 3001)   │ │
│  └───────┬───────┘                                       └───────┬────────┘ │
└──────────┼───────────────────────────────────────────────────────┼──────────┘
           │                                                       │           
           ▼                                                       ▼           
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE & AUTH LAYER                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Supabase PostgreSQL Database                       │  │
│  │   • 15 Relational Tables with PL/pgSQL Triggers                       │  │
│  │   • Row Level Security (RLS) Policies with SECURITY DEFINER Helpers   │  │
│  │   • 11 Custom ENUM Types & Automated Indexes                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
restaurantos/
├── database/                   # Database schemas and seed data
│   ├── schema.sql              # Supabase PostgreSQL relational schema (15 tables, 11 enums)
│   ├── seed.sql                # Production seed data (menu, tables, inventory, roles)
│   └── policies.sql            # Row Level Security (RLS) policies & helper functions
├── server/                     # Node.js Express + Socket.io backend server
│   ├── index.js                # Server entry point & WebSocket event handler
│   ├── db.js                   # Database connector setup
│   └── routes/                 # Express REST API routes
│       ├── ai.js               # AI recommendations & smart search endpoints
│       ├── api.js              # Orders, inventory, tables, and reservations APIs
│       ├── auth.js             # Authentication & user profile endpoints
│       └── search.js           # Full-text and filter search endpoints
├── src/                        # React 19 Frontend application
│   ├── app/                    # Application core setup
│   │   ├── providers/          # Global providers (AuthContext, QueryClientProvider)
│   │   └── routes/             # App routing configuration
│   ├── components/             # UI Components
│   │   ├── ui/                 # shadcn/ui primitive components
│   │   ├── layout/             # Top Navbar, Admin Sidebar, Footer
│   │   ├── shared/             # Reusable modal, badge, and loader components
│   │   └── cards/              # Menu item cards, order cards, table status cards
│   ├── config/                 # Navigation menus & app configuration
│   ├── constants/              # Route constants, roles, and status enums
│   ├── hooks/                  # Custom hooks (useAuth, useOrders, useInventory)
│   ├── layouts/                # Auth Layout, Customer Layout, Staff Layout, Admin Layout
│   ├── lib/                    # Utility functions (cn, formatters, validators)
│   ├── mocks/                  # Typed mock data fallbacks
│   ├── pages/                  # Application views
│   │   ├── admin/              # Dashboard, Menu, Inventory, Analytics, Orders, Staff
│   │   ├── auth/               # StaffLogin, Customer Login, Signup, Password Reset
│   │   ├── customer/           # DigitalMenu, Cart, OrderTracking, Reservation, Profile
│   │   ├── landing/            # Landing page hero & features showcase
│   │   └── staff/              # Kitchen KDS, Table Management, POS Orders
│   ├── services/               # Supabase & API client service layer
│   └── types/                  # TypeScript interfaces (Order, MenuItem, Table, User)
├── index.html                  # HTML entry point
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite bundle builder configuration
```

### Database Schema & Security Architecture

The platform runs on **Supabase PostgreSQL** with 15 normalized tables:

| Table Name | Description | Key Features & Constraints |
| :--- | :--- | :--- |
| `roles` | User access levels | Standardized roles: `Admin`, `Staff`, `Customer` |
| `profiles` | Extended user records | Linked to `auth.users`, includes loyalty tier & points |
| `menu_categories` | Food & drink categories | Display ordering, unique slugs |
| `menu_items` | Dishes & beverages | Price checks, prep time, availability & popular flags |
| `restaurant_tables` | Physical table layout | Table number, section (Main, Terrace, VIP), capacity, status |
| `reservations` | Table bookings | Date, time, party size, reservation status |
| `orders` | Transactional orders | Order number generator, tax/fee/subtotal, status pipeline |
| `order_items` | Line items in an order | Menu item reference, quantity, unit price, item notes |
| `inventory` | Raw ingredients & stock | Minimum threshold alerts, unit of measure, stock status |
| `inventory_logs` | Stock audit trail | Tracks `restock`, `usage`, `spoilage`, and `adjustment` |
| `payments` | Financial transactions | Payment method (Cash, Card, UPI), transaction reference |
| `notifications` | In-app alerts | User-scoped notification queue with read states |
| `feedback` | Customer ratings | 1–5 star ratings linked to orders |
| `staff_activity` | Staff action audit log | Action logs with JSONB detail payloads |
| `daily_sales` | Historical sales aggregates | Unique per sale date, total revenue, tax, discounts |

#### Security & Row Level Security (RLS)
Security is enforced at the database level via **PL/pgSQL functions** and **RLS policies**:
* **`get_auth_role()`**: Cached function resolving user role without RLS recursion.
* **`is_admin()`**, **`is_manager_or_admin()`**, **`is_staff_member()`**: Security definer helpers ensuring tight access control.
* **Customer Policies**: Customers can only view/update their own orders, reservations, and profile.
* **Staff Policies**: Staff can manage orders, table statuses, and inventory logs.
* **Admin Policies**: Full CRUD permissions across all system entities.

---

## 💻 Technology Stack Report

| Component Layer | Technology / Library | Version / Detail |
| :--- | :--- | :--- |
| **Frontend Framework** | React | `v19.1.0` |
| **Build Tooling** | Vite | `v6.3.5` |
| **Language** | TypeScript | `v5.8.3` |
| **Styling Engine** | TailwindCSS | `v4.1.10` |
| **UI Primitives** | shadcn/ui (Radix UI) | Dialog, Dropdown, Tabs, Tooltip, Avatar, Select |
| **Icons** | Lucide React | `v0.514.0` |
| **Animations** | Framer Motion | `v12.18.1` |
| **Routing** | React Router DOM | `v7.6.2` |
| **State & Data Fetching** | TanStack React Query | `v5.80.7` |
| **Form Validation** | React Hook Form + Zod | `v7.57` / `v3.25` |
| **Backend Runtime** | Node.js + Express | `Express v4.x` |
| **Real-Time WebSockets** | Socket.io / Socket.io-client | `v4.8.1` |
| **Database & Auth** | Supabase PostgreSQL | PostgreSQL with Row Level Security |

---

## ⚡ Installation & Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/surendrareddysabbella9-bot/hotel-manage-system.git
   cd hotel-manage-system
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Configuration**:
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

5. **Start Development Servers**:

   * **Start Frontend**:
     ```bash
     npm run dev
     ```
     Access the application at [http://localhost:5173/](http://localhost:5173/)

   * **Start Backend Server**:
     ```bash
     cd server
     npm start
     ```
     Backend runs at [http://localhost:3001/](http://localhost:3001/)

---

## 🔐 Database Setup Guide

1. Open your **Supabase Dashboard** or PostgreSQL server instance.
2. Run `database/schema.sql` (or `schema.sql`) in the SQL Editor to create tables, ENUM types, indexes, and triggers.
3. Run `database/policies.sql` (or `policies.sql`) to enable Row Level Security and deploy security helper functions.
4. Run `database/seed.sql` (or `seed.sql`) to load default categories, menu items, restaurant tables, and system roles.

---

## 📜 License & Credits

Built with ❤️ for **Vibeathon 6.0**. Designed & developed by **Surendra Reddy Sabbella**.
