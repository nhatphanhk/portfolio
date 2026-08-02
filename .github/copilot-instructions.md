# AI Coding Agent Instructions — Portfolio Project

## Project Overview

A **Next.js 16** (App Router, Turbopack) personal portfolio with a full **database-backed admin CMS**. Public pages (home, blog, projects, skills, certifications, resume, contact) read content via Server Actions that query **Prisma + PostgreSQL**; the admin dashboard at `/admin` provides full CRUD for all content, protected by **NextAuth v5** (credentials login).

This is a real, deployed system — not a mock/MVP. Content editors (profile, experience, skills, blog, projects, certifications, social links, contact messages) all live in the database. Static fallback data in `src/data/*.ts` exists only as a seed/fallback when a table is empty (see "DB-with-fallback pattern" below) — do not treat it as the source of truth.

> Older docs in `docs/AI_CONTEXT.md`, `docs/AI_ARCHITECTURE.md`, `docs/AI_RULES.md`, and `docs/KNOWN_ISSUES.md` were rewritten to match this reality — read them for deeper detail. `docs/KNOWN_ISSUES.md` in particular documents a Next.js framework bug you can easily reintroduce; read it before touching `loading.tsx` or `notFound()`.

## Tech Stack Essentials

- **Next.js 16** with Turbopack — `npm run dev` and `npm run build` already pass `--turbopack`, don't add it again.
- **Prisma 7** ORM — client generated to `generated/prisma` (not the default `node_modules/.prisma`). Run `npx prisma generate` after editing `prisma/schema.prisma`; `npm run build` does this automatically.
- **NextAuth v5 (beta)** — credentials provider, JWT session strategy. See Auth section below.
- **Tailwind CSS v4** — CSS-variable based theme in `src/app/globals.css` (no `tailwind.config.ts` — v4 is CSS-first).
- **shadcn/ui** (New York style) — components in `src/components/ui/`.
- **React Hook Form + Zod** — form validation, mirrored by Zod schemas in the corresponding server action for server-side validation.
- **TanStack Table** — admin data tables.
- **Vercel Analytics / Speed Insights** — wired in root layout.

## Commands & Workflows

```bash
npm run dev              # Dev server with Turbopack
npm run build             # prisma generate && next build --turbopack
npm run start             # Serve the production build
npm run lint / lint:fix   # ESLint
npm run type-check        # tsc --noEmit
npm run format             # Prettier
npx prisma studio         # Browse the database
npx prisma migrate dev    # Create/apply a migration after schema changes
```

There is no real test suite yet (`npm test` is a no-op placeholder).

## Architecture

### Data flow (the pattern to follow for any new resource)

```
Page (Server Component, async)
  → calls a function from src/lib/actions/{resource}.ts
      → Prisma query against the DB
  → renders with the typed result
```

- **Public reads**: `getPublic*()` functions (e.g. `getPublicBlogs`, `getPublicProjects`, `getPublicSkillsByCategory`) — filter to published/active content only, shape data for the public UI.
- **Admin reads/writes**: `getAll*FromDb()`, `create*`, `update*`, `delete*` — each mutating action starts with `await ensureAdmin()` (see `src/lib/auth-utils.ts`) and calls `revalidatePath()` on the affected public + admin routes after writing.
- **DB-with-fallback pattern**: some `get*` functions (see `src/lib/actions/about.ts`) query the DB first and fall back to the static data in `src/data/content.ts` only if the table is empty (fresh install, no seed yet). Don't remove this fallback — it's what makes the site render sensibly before the admin has entered real data. Don't add it to *new* resources unless there's a similar bootstrapping need.
- All action files use `'use server'` at the top and live in `src/lib/actions/*.ts` — there is no separate REST/Express backend. Route Handlers under `src/app/api/*/route.ts` exist only for things Server Actions can't do (webhook-style POST from the public contact/visitor forms, NextAuth's own routes, the Swagger JSON).

### Auth

- `src/auth.config.ts` — NextAuth config: JWT session (24h), redirects unauthenticated `/admin/*` requests to `/admin/login`.
- `src/auth.ts` — Credentials provider: looks up `User` in Postgres via Prisma + bcrypt; if the DB is unreachable or the user doesn't exist, falls back to a single env-defined admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`). Keep this fallback — it's the recovery path if the DB is down.
- `src/proxy.ts` is the Next.js 16 middleware (renamed from `middleware.ts`; **don't recreate `middleware.ts`**, Next.js 16 conflicts if both exist). Matcher is `/admin/:path*` only — it does not touch public routes.
- Server actions that mutate data call `ensureAdmin()` (`src/lib/auth-utils.ts`) themselves — the proxy matcher is a UX-layer redirect, not the only guard.

### Layout System

- **Public pages**: wrap content in `<MainLayout>` (`src/components/MainLayout.tsx`) — includes `Header`, `Footer` (both fetch profile/social links themselves), and `VisitorModal`. `MainLayout` is applied per-page (in each `page.tsx`), not in the root layout — the root `src/app/layout.tsx` only provides `ThemeProvider`, `Toaster`, `CommandPalette`, and analytics.
- **Admin pages**: `src/app/admin/(dashboard)/layout.tsx` — sidebar (`AppSidebar`) + `SidebarInset`, auth-gated by the proxy matcher. `src/app/admin/login/page.tsx` is outside the `(dashboard)` group (no sidebar).
- Root `src/app/template.tsx` adds a fade/slide transition on every navigation (framer-motion) — this runs for every route including admin.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (regenerate via `npx shadcn@latest add <name>`, don't hand-edit generated internals beyond small fixes).
- `src/components/hero-section/` — homepage sections (Hero/About/BPSC/Contact), all accept server-fetched data as props (see Data flow above) rather than fetching themselves, except `ContactSection` which is a client component receiving `profile`/`socialLinks` as props.
- `src/components/admin/` — sidebar nav (`sidebar/`) + per-resource `*Dialog.tsx` create/edit modals. Admin list pages render plain `<table>` markup directly in each resource's `client.tsx` (no TanStack Table / generic `DataTable` component — an earlier, unused TanStack scaffold under `table/` was removed as dead code; don't reintroduce that pattern unless a resource actually needs client-side sorting/filtering it can't get from the existing search/pagination server actions).
- Barrel export: `src/components/index.ts` (Header/Footer/MainLayout only — not everything).

### Routing

- Dynamic detail routes (`blog/[slug]`, `project/[slug]`) export `generateStaticParams` **and** `export const dynamic = 'force-dynamic'`. Both are required — see `docs/KNOWN_ISSUES.md` for why removing `force-dynamic` silently breaks 404 status codes.
- `src/app/sitemap.ts` / `src/app/robots.ts` are generated from live DB content (`getPublicBlogs`/`getPublicProjects`) — new public content-bearing routes should be added here too.
- Global `src/app/not-found.tsx` and `src/app/error.tsx` exist and match the site theme. **Do not add a root `src/app/loading.tsx`** — see `docs/KNOWN_ISSUES.md`.

### Styling Conventions

- Utility-first Tailwind; use `cn()` from `@/lib/utils` for conditional classes.
- Semantic color tokens only (`text-foreground`, `bg-background`, `border-border`, `text-muted-foreground`, `bg-primary`, etc. — defined in `globals.css`) so components work in both themes automatically. Avoid hardcoded `gray-900`/`dark:white` pairs — they're inconsistent with the token system and easy to get wrong in one theme.
- Dark mode via `next-themes`, class-based, `defaultTheme="system"`.
- Fonts: `--font-inter` (body), `--font-jetbrains-mono` (code) — declared once in root `layout.tsx`, don't re-import `next/font/google` elsewhere.

## Key Patterns to Follow

### Import Aliases

```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components';
import { getPublicBlogs } from '@/lib/actions/blog';
```

### Server vs Client Components

- Default to Server Components. Add `'use client'` only for hooks, event handlers, browser APIs, or `next/navigation` hooks (`usePathname`, `useRouter`).
- A component can be `async` and a Server Component at once (e.g. `Footer`, all top-level `page.tsx` files) — this is how DB data gets fetched without a client-side effect.

### Icons for DB-driven social links

Social links store an `iconName` string (e.g. `"Github"`) rather than a fixed enum. The established pattern is:
```typescript
import * as Icons from 'lucide-react';
const ICON_MAP = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
const Icon = social.iconName ? ICON_MAP[social.iconName] || Icons.Link : Icons.Link;
```
Don't go back to a hand-maintained `{ Github, Linkedin, Twitter }` map — it silently drops any icon an admin picks that isn't in the map.

### Admin Data Tables

Each admin resource's `client.tsx` renders its list with plain `<table>` markup (styled via
Tailwind, not the shadcn `ui/table.tsx` primitive or a generic table component) and opens
its `*Dialog.tsx` for create/edit. Follow the existing pattern in e.g.
`src/app/admin/(dashboard)/certifications/client.tsx` for a new resource rather than adding
a TanStack Table dependency.

### Avoid re-defining components inside a render function and using them as JSX

If a component is defined *inside* another component's function body (common in the large admin editor clients, e.g. `resume/client.tsx`), calling it as `<InnerComponent />` gives it a new type identity every render — React unmounts/remounts the whole subtree on every keystroke. Call it as a function instead: `{InnerComponent()}`. This bit us once already (see `docs/KNOWN_ISSUES.md`) — check for the same pattern before adding new inline sub-components in those files.

## Common Pitfalls

- ❌ Don't add `src/app/loading.tsx` (or any ancestor `loading.tsx` above a route that calls `notFound()`) — breaks 404 status codes. Details: `docs/KNOWN_ISSUES.md`.
- ❌ Don't recreate `src/middleware.ts` — this project uses `src/proxy.ts` (Next.js 16 rename); having both causes a conflict.
- ❌ Don't import `Link` from `lucide-react` — it's an icon component, not `next/link`. (We shipped this exact bug once; watch for it in generated code.)
- ❌ Don't modify `src/components/ui/*` generated internals wholesale — regenerate via shadcn CLI, then re-apply any local patch.
- ❌ Don't add features beyond what's asked — this is a finished, real system now, not a scaffold; prefer small, targeted changes over speculative abstractions.
- ✅ Always define a `{Name}Props` interface for component props; prefer types derived from action return values (`Awaited<ReturnType<typeof getPublicBlogs>>[number]`) over hand-duplicated shapes or `any`.
- ✅ New mutating server actions must call `ensureAdmin()` first and `revalidatePath()` the affected routes after writing.
- ✅ Run `npm run type-check` and `npm run lint` before considering a change done; for anything touching routing/rendering behavior, also run `npm run build` — dev mode hides some of these bugs (see `docs/KNOWN_ISSUES.md`).

## Commit Convention

Conventional Commits, scope optional (both styles appear in history):

```
type: description
type(scope): description

feat(admin): add blog management table
fix: resolve mobile menu toggle
```
