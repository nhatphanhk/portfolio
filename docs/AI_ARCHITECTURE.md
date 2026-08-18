# AI_ARCHITECTURE.md

> Technical architecture of the Portfolio system. Read alongside `AI_CONTEXT.md`
> (goals/scope) and `AI_RULES.md` (coding rules). For a condensed quick-reference, see
> `.github/copilot-instructions.md`.

---

## 1. High-Level Architecture

```
Client (Browser)
       |
Next.js App Router (Server Components + Server Actions + Route Handlers)
       |
Prisma ORM
       |
PostgreSQL
```

There is **no separate REST/Express backend**. Server Actions in `src/lib/actions/*.ts` are
the "backend" — they run on the server, call Prisma directly, and are called from Server
Components like a normal async function. Route Handlers under `src/app/api/*/route.ts`
exist only for the handful of things Server Actions can't do (see §5).

### Tech Stack

| Component | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 (CSS-first — see `src/app/globals.css`, no `tailwind.config.ts`) |
| UI components | shadcn/ui (New York style) + Radix primitives |
| ORM / DB | Prisma 7, PostgreSQL (client generated to `generated/prisma`, not the default location) |
| Auth | NextAuth v5 (beta), credentials provider, JWT session strategy |
| Forms | React Hook Form + Zod (client-side schema mirrored server-side in the action) |
| Hosting | Vercel |

---

## 2. Data Flow

### Public reads

```
Page (Server Component, async)
  → getPublic*() in src/lib/actions/{resource}.ts   e.g. getPublicBlogs, getPublicProjects
      → Prisma query, filtered to published/active content only
  → renders with the typed result
```

### Admin reads/writes

```
Admin page → Client component (form/table) → Server Action
  → ensureAdmin() first (src/lib/auth-utils.ts) — throws if not an authenticated admin
  → Prisma create/update/delete
  → revalidatePath() on the affected public + admin routes
```

`ensureAdmin()` checks the NextAuth session for either `role === 'ADMIN'` (a DB `User`, set
by the `jwt` callback in `src/auth.config.ts`) or an email match against the
`ADMIN_EMAIL` env var (the fallback admin). Every mutating action must call it first — this
is the real authorization boundary, not just the route matcher (see §4).

### DB-with-fallback pattern

A few `get*` functions in `src/lib/actions/about.ts` query the DB first and fall back to
the static data in `src/data/content.ts` (`PROFILE`, `EXPERIENCES`) only if the table is
empty — this is what makes the site render sensibly on a fresh install before the admin has
entered real data. Don't remove this fallback, and don't add it to new resources unless
there's a similar bootstrapping need.

---

## 3. Domain Modules

Every content type follows the same CRUD pattern, one Server Action file per Prisma model
(with one intentional exception — see below):

| Resource | Action file | Notes |
|---|---|---|
| Blog | `src/lib/actions/blog.ts` | draft/published/archived, tags |
| Project | `src/lib/actions/project.ts` | tags, images, featured flag |
| Skill | `src/lib/actions/skill.ts` | category enum, level 1–5 |
| Certification | `src/lib/actions/certification.ts` | active/expired |
| Contact | `src/lib/actions/contact.ts` | admin: status/notes/delete + visitor log; public: create only (via `/api/contact`, not a Server Action — see §5) |
| Profile / SocialLink / Experience / Education / Achievement / SpokenLanguage / Activity | `src/lib/actions/about.ts` | one file for all seven — they're all edited together on the single admin "Resume" page, unlike every other resource |
| Auth settings (change password) | `src/lib/actions/auth-settings.ts` | |

For list-style resources (Blog, Project, Skill, Certification), admin reads support search,
status/category filters, and bulk delete where the admin UI needs it — check the existing
action file for a resource before adding a new query pattern.

---

## 4. Authentication

- **`src/auth.config.ts`** — shared NextAuth config: JWT session (24h), `pages.signIn` =
  `/admin/login`, `authorized()` callback redirects unauthenticated `/admin/*` requests to
  the login page and redirects already-logged-in users away from it.
- **`src/auth.ts`** — Credentials provider: looks up `User` in Postgres via Prisma + bcrypt.
  If the DB is unreachable or the user doesn't exist, falls back to a single env-defined
  admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`) — this is the recovery path if the DB is
  down, keep it.
- **`src/proxy.ts`** — the Next.js 16 middleware (renamed from `middleware.ts`; don't
  recreate `middleware.ts`, having both causes a conflict). Matcher is `/admin/:path*`
  only — it's a UX-layer redirect, not the security boundary. The real guard is
  `ensureAdmin()`, called inside every mutating Server Action.
- Sessions carry `role` and `id` via the `jwt`/`session` callbacks in `auth.config.ts`.

---

## 5. Route Handlers (`src/app/api/*`)

Only used where a Server Action can't do the job (public POST without a form action,
framework-required routes, or serving raw JSON):

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth's own handler (`export const { GET, POST } = handlers`) |
| `/api/admin/create` | POST | One-time admin user creation, protected by `ADMIN_SETUP_KEY` |
| `/api/contact` | POST | Public contact form submission, rate-limited |
| `/api/visitor` | POST | Visitor logging (called from `VisitorModal`) |
| `/api/swagger` | GET | Serves the OpenAPI JSON spec (built by `src/lib/swagger.ts`) |

`/api-doc` (`src/app/api/../api-doc/page.tsx`, note: **not** under `src/app/api/`) is a
Swagger UI *page* that fetches the spec above and renders it via
`src/components/SwaggerUIClient.tsx` — it's auth-gated like the admin area even though it
lives outside `src/app/admin/`.

### Rate limiting

`src/lib/rate-limit.ts` — a simple in-memory `Map<ip, {count, expiresAt}>` limiter
(`checkRateLimit(ip, limit, windowMs)`), used by `/api/contact`. Being in-memory, it resets
on redeploy/cold-start and doesn't share state across serverless instances — acceptable for
this app's traffic level; swap for a durable store (e.g. Redis/Upstash) if that ever
becomes a real problem.

---

## 6. Database Schema

Source of truth: `prisma/schema.prisma`. Client generator output is `generated/prisma`
(not the default `node_modules/.prisma`) — run `npx prisma generate` after any schema
change (`npm run build` does this automatically).

**Models:** `User`, `Blog`, `BlogTag`, `Tag`, `Project`, `ProjectTag`, `ProjectImage`,
`Skill`, `Certification`, `SocialLink`, `Experience`, `Contact`, `Media`, `Profile`,
`Education`, `Achievement`, `SpokenLanguage`, `Activity`.

**Enums:** `Role` (ADMIN, SUPER_ADMIN) · `PostStatus` (DRAFT, PUBLISHED, ARCHIVED) ·
`SkillCategory` (FRONTEND, BACKEND, DEVOPS, TOOLS, OTHER, LANGUAGE, FRAMEWORK, DATABASE,
CLOUD, IAC, MONITORING, VERSION_CONTROL) · `CertStatus` (ACTIVE, EXPIRED) ·
`ContactStatus` (UNREAD, READ, REPLIED).

Notable relations: `Blog`/`Project` each belong to a `User` (`authorId`) and have a
many-to-many with `Tag` through `BlogTag`/`ProjectTag`; `Project` has many `ProjectImage`;
`Media` belongs to the `User` who uploaded it (`uploadedById`).

Indexes exist on `Blog`/`Project` (`status`, plus `publishedAt`/`slug` or `featured`) and
`Contact` (`status`, `createdAt`) for the list/filter queries the admin UI needs.

---

## 7. Environment Variables

See `.env.example` for the authoritative, up-to-date list with generation commands. Summary:

```bash
DATABASE_URL=            # PostgreSQL connection string (Neon / Prisma Postgres)
AUTH_SECRET=              # NextAuth session secret
AUTH_URL=                 # Production URL, no trailing slash
ADMIN_EMAIL=               # Env-based admin fallback login
ADMIN_PASSWORD_HASH=      # bcrypt hash for the above
ADMIN_SETUP_KEY=          # Required to call POST /api/admin/create
NEXT_PUBLIC_SITE_URL=      # Used for OpenGraph/canonical tags, sitemap.xml
```

> **Security note:** never commit `.env` with real values. `.env.example` holds only
> placeholders and is safe to commit.

---

## 8. Routing Notes

- Dynamic detail routes (`blog/[slug]`, `project/[slug]`) export `generateStaticParams`
  **and** `export const dynamic = 'force-dynamic'` — both are required, see
  `docs/KNOWN_ISSUES.md` for why removing `force-dynamic` silently breaks 404 status codes.
- `src/app/sitemap.ts` / `src/app/robots.ts` are generated from live DB content
  (`getPublicBlogs`/`getPublicProjects`) — add new public content-bearing routes there too.
- Global `src/app/not-found.tsx` and `src/app/error.tsx` match the site theme. **Do not**
  add a root `src/app/loading.tsx` — see `docs/KNOWN_ISSUES.md`.
- `src/app/template.tsx` adds a fade/slide route-change transition (Framer Motion) that
  runs on every navigation, including admin routes.

---

## 9. Deployment

Hosted on **Vercel**. `npm run build` runs `prisma generate && next build --turbopack` —
no separate migration step is wired into the build; run `npx prisma migrate deploy`
against production manually (or via a Vercel deploy hook) when the schema changes. Set all
variables from §7 in the Vercel project's environment settings.

---

## 10. Non-Functional Notes

- TypeScript throughout for type safety; prefer types derived from action return values
  (`Awaited<ReturnType<typeof getPublicBlogs>>[number]`) over hand-duplicated shapes.
- Semantic Tailwind color tokens (`text-foreground`, `bg-background`, etc., defined in
  `globals.css`) so components work in both light/dark themes automatically.
- No automated test suite yet (`npm test` is a no-op placeholder) — run
  `npm run type-check`, `npm run lint`, and for anything touching routing/rendering,
  `npm run build`, before considering a change done.
