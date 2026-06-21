# AI Coding Agent Instructions - Portfolio Project

## Project Overview

This is a **Next.js 16** portfolio website with an admin dashboard, built with **TypeScript**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui** components. The project uses the **App Router** with a dual-layout architecture: public portfolio pages and an admin management system.

## Tech Stack Essentials

- **Next.js 16** with Turbopack: Use `npm run dev` (not `npm run dev --turbo`)
- **Tailwind v4** with CSS variables (`tailwind.config.ts`)
- **shadcn/ui** (New York style): Components in `src/components/ui/`
- **TanStack Table**: For admin data tables (`@tanstack/react-table`)
- **React Hook Form + Zod**: Form validation patterns
- **TypeScript 5**: Strict mode enabled

## Commands & Workflows

```bash
npm run dev              # Development with Turbopack
npm run build            # Production build with Turbopack
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript validation
```

## Architecture Patterns

### Layout System

- **Public pages**: Use `MainLayout` component ([src/components/MainLayout.tsx](src/components/MainLayout.tsx))
  - Wraps content with `Header` and `Footer`
  - Homepage gets special full-screen treatment (`pt-16` applied conditionally)
- **Admin pages**: Use admin layout ([src/app/admin/layout.tsx](src/app/admin/layout.tsx))
  - Sidebar navigation via `AppSidebar` component
  - Breadcrumb system with `SidebarInset`

### Component Organization

- **UI primitives**: `src/components/ui/` - shadcn/ui components (don't modify directly)
- **Feature sections**: `src/components/hero-section/` - Full-screen homepage sections
- **Admin components**: `src/components/admin/` - Data tables, sidebar navigation
- **Layouts**: `src/components/` - Header, Footer, MainLayout
- **Export pattern**: Use barrel exports via `src/components/index.ts`

### Data Patterns

- **Type definitions**: `src/types/` (see [BlogData.ts](src/types/BlogData.ts) for examples)
- **Static data**: Inline in type files or create dedicated files in `src/types/`
- **Admin tables**: Use `DataTable` component with column definitions
  - Column files: `src/components/admin/table/{resource}/column.tsx`
  - Example: [src/components/admin/table/blog/column.tsx](src/components/admin/table/blog/column.tsx)

### Styling Conventions

- **Utility-first**: Use Tailwind classes exclusively
- **cn utility**: Import from `@/lib/utils` for conditional classes
- **Font variables**:
  - `--font-inter` for body text
  - `--font-jetbrains-mono` for code
- **Dark mode**: Class-based (`darkMode: 'class'` in tailwind config)
- **Typography**: `@tailwindcss/typography` plugin available

### Page Routing

- **App Router**: File-based routing in `src/app/`
- **Route groups**: Use parentheses for organization without affecting URLs
- **Dynamic routes**: `[slug]/page.tsx` pattern (see [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx))
- **Not found**: Custom 404s via `not-found.tsx` in route folders

## Development Rules (from [docs/development_rules.md](docs/development_rules.md))

### Component Standards

- **TypeScript interfaces**: Always define props with `ComponentNameProps` interface
- **File naming**:
  - PascalCase for React components: `ContactForm.tsx`
  - camelCase for utilities: `formatDate.ts`
  - kebab-case for folders: `hero-section/`
- **Component structure**:
  1. Imports
  2. Interface definitions
  3. Component function (with typed props)
  4. Hooks → Handlers → Render logic

### Commit Format

```
type(scope): description

Examples:
feat(admin): add blog management table
fix(header): resolve mobile menu toggle
docs(readme): update setup instructions
```

## Planned API Architecture

The project includes comprehensive API documentation for a **future backend**:

- **Documentation**: [docs/api-documentation.md](docs/api-documentation.md) and [docs/api-implementation-guide.md](docs/api-implementation-guide.md)
- **Planned stack**: PostgreSQL, JWT auth, file uploads
- **Current state**: Frontend only - API endpoints not implemented yet
- **Data fetching pattern**: See `getData()` in [src/app/admin/blogs/page.tsx](src/app/admin/blogs/page.tsx) - currently returns mock data

## shadcn/ui Integration

Configuration: [components.json](components.json)

- **Style**: `new-york`
- **Base color**: `neutral`
- **Path aliases**: `@/components`, `@/lib`, `@/hooks`, `@/ui`
- **Adding components**: Use `npx shadcn@latest add <component-name>`

## Key Patterns to Follow

### 1. Import Aliases

Always use path aliases defined in [tsconfig.json](tsconfig.json):

```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components';
```

### 2. Server vs Client Components

- Default to **Server Components** (no 'use client')
- Add `'use client'` only when using:
  - React hooks (useState, useEffect, etc.)
  - Event handlers
  - Browser APIs
  - `usePathname`, `useRouter` from `next/navigation`

### 3. Admin Data Tables

Pattern from [src/components/admin/table/DataTable.tsx](src/components/admin/table/DataTable.tsx):

```typescript
// Define columns separately
const columns: ColumnDef<Type>[] = [...]

// Use DataTable component
<DataTable columns={columns} data={data} />
```

### 4. Homepage Full-Screen Sections

Each section should be wrapped in `h-screen flex flex-col` (see [src/app/page.tsx](src/app/page.tsx))

## Common Pitfalls

- ❌ Don't use `npm run dev --turbo` - it's already configured in package.json
- ❌ Don't modify files in `src/components/ui/` directly - regenerate with shadcn CLI
- ❌ Don't import from `next/font/google` in components - fonts defined in root layout
- ❌ Don't forget `'use client'` when using hooks or `usePathname`
- ✅ Always use TypeScript interfaces for props
- ✅ Use `cn()` utility for conditional class merging
- ✅ Check [docs/development_rules.md](docs/development_rules.md) for detailed standards

## AI Development Rules

AI assistants must read:

/docs/AI_CONTEXT.md
/docs/AI_ARCHITECTURE.md
/docs/AI_RULES.md

before modifying code.