# RestaurantOS

Intelligent Restaurant Management Platform for Vibeathon 6.0.

## Tech Stack

- React 19 + Vite + TypeScript
- TailwindCSS v4 + shadcn/ui
- React Router v7
- Framer Motion
- TanStack Query (configured)
- React Hook Form + Zod (schemas ready)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── providers/     # Global providers (Query, Tooltip)
│   └── routes/        # React Router configuration
├── components/
│   ├── ui/            # shadcn/ui primitives
│   ├── layout/        # Navbar, Sidebar
│   ├── shared/        # Reusable shared components
│   └── cards/         # Domain-specific card components
├── config/            # Navigation and app config
├── constants/         # Route constants, enums
├── hooks/             # Custom React hooks
├── layouts/           # Auth, Customer, Staff, Admin layouts
├── lib/               # Utilities and validations
├── mocks/             # Typed mock data (swap for Supabase later)
├── pages/             # Route pages (placeholders for now)
└── types/             # Shared TypeScript interfaces
```

## Architecture Notes

- **No backend integration yet** — all data comes from typed mock files in `src/mocks/`
- **Layouts are role-based** — Customer, Staff, Admin each have dedicated shells
- **Supabase-ready** — replace mock imports with service/hook layers without changing UI components

## Available Routes

| Area | Path |
|------|------|
| Landing | `/` |
| Auth | `/login`, `/signup`, `/forgot-password` |
| Customer | `/customer/*` |
| Staff | `/staff/*` |
| Admin | `/admin/*` |
