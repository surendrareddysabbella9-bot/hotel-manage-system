# RestaurantOS — AI Instructions

Single source of truth for project conventions. Follow these rules for all contributions.

## Architecture

- **Feature-based pages** under `src/pages/{domain}/`
- **Reusable UI** in `src/components/` — never duplicate layout or card patterns in pages
- **Mock data** in `src/mocks/` — pages consume data via imports; future Supabase layer replaces mocks only
- **Types** in `src/types/` — shared interfaces used across mocks, components, and future API layer
- **Layouts** in `src/layouts/` — one layout per user role (Auth, Customer, Staff, Admin)

## Folder Structure

```
src/
├── app/providers/       # React Query, Tooltip, future auth context
├── app/routes/          # Router definition
├── components/ui/       # shadcn/ui primitives
├── components/layout/   # Navbar, Sidebar
├── components/shared/   # PageHeader, SearchBar, EmptyState, etc.
├── components/cards/    # FoodCard, OrderCard, TableCard, etc.
├── config/              # Navigation items, feature flags
├── constants/           # ROUTES, status maps
├── hooks/               # Custom hooks
├── layouts/             # Role-based page shells
├── lib/                 # cn(), formatters, Zod schemas
├── mocks/               # Typed mock data files
├── pages/               # Route-level page components
└── types/               # Shared TypeScript types
```

## Design System

- Dark theme first (`.dark` on `<html>`)
- Colors via CSS variables in `src/index.css`
- Spacing: Tailwind scale, `page-container` utility for content width
- Radius: `--radius: 0.625rem`
- Typography: Inter/system sans, semibold headings, muted-foreground for secondary text
- Motion: Framer Motion for page enter and card hover — subtle, never flashy

## Coding Standards

- TypeScript strict mode
- No inline styles; Tailwind classes only
- No inline mock arrays in pages — use `src/mocks/`
- Components under 250 lines; extract when larger
- Semantic HTML and ARIA labels on interactive elements
- `cn()` for conditional class merging

## Naming Conventions

- Components: PascalCase (`FoodCard.tsx`)
- Hooks: camelCase with `use` prefix (`useMediaQuery.ts`)
- Mocks: `{domain}.mock.ts`
- Types: PascalCase interfaces in `types/index.ts`
- Routes: centralized in `constants/index.ts` as `ROUTES`

## Do's

- Reuse existing components before creating new ones
- Keep pages thin — compose from shared components
- Prepare types matching future Supabase schema shape
- Use React Router `NavLink` for sidebar navigation

## Don'ts

- Do not integrate Supabase, auth, or APIs until explicitly requested
- Do not hardcode data inside page components
- Do not change folder architecture without explicit instruction
- Do not use childish colors or flashy gradients

## Future Scalability

When adding Supabase:

1. Create `src/services/` or `src/api/` for data fetching
2. Replace mock imports in pages with TanStack Query hooks
3. Add auth context in `src/app/providers/`
4. UI components and types remain unchanged
