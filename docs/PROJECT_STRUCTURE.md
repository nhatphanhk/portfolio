# PROJECT_STRUCTURE.md

> A maintenance-oriented map of `src/` — what lives where, and why. For the request/data
> flow through these pieces, see `AI_ARCHITECTURE.md`; for naming/coding conventions, see
> `AI_RULES.md`.

---

## `src/app/` — Routes (App Router)

```
app/
├── layout.tsx, template.tsx, globals.css      # Root layout (ThemeProvider/Toaster/analytics only) + route-change transition
├── error.tsx, not-found.tsx                   # Global error boundary / 404
├── robots.ts, sitemap.ts                      # Generated from live DB content
├── page.tsx                                   # Home
├── blog/, project/, skills/, certifications/, resume/, contact/   # Public content pages (skills/[slug] = skill detail)
├── journey/page.tsx                           # Public growth timeline + activity heatmap (lib/journey.ts)
├── api-doc/page.tsx                           # Swagger UI page (auth-gated, NOT under api/)
├── api/
│   ├── auth/[...nextauth]/route.ts            # NextAuth handler
│   ├── admin/create/route.ts                  # One-time admin creation (ADMIN_SETUP_KEY, rate-limited)
│   ├── contact/route.ts, visitor/route.ts     # Public POST endpoints (rate-limited)
│   ├── track/route.ts                         # Page-view beacon from <PageViewTracker /> (rate-limited, no cookies/IP)
│   ├── upload/route.ts                        # Authenticated upload endpoint (rate-limited)
│   ├── resume/parse-pdf/route.ts              # Authenticated CV parsing with Gemini AI (rate-limited)
│   └── swagger/route.ts                       # Raw OpenAPI JSON (rate-limited, what api-doc/ renders)
└── nhatphanhk102/                              # The admin CMS, served at /nhatphanhk102
    ├── login/page.tsx                          # Outside (dashboard) group — no sidebar
    └── (dashboard)/
        ├── layout.tsx                          # Sidebar (AppSidebar) + SidebarInset; ensureAdmin() role check
        ├── loading.tsx, error.tsx              # Admin-only skeleton + error boundary (see KNOWN_ISSUES #1)
        ├── page.tsx                            # Dashboard home
        ├── analytics/page.tsx                  # Page views, referrers, countries, devices, blog views, visitor sign-ups
        └── {blogs,projects,certifications,contacts,skills,resume,visitors,media,landing}/
            ├── page.tsx                        # Server Component, fetches data
            └── client.tsx                      # Client Component, the actual form/table UI
```

The admin UI is **Vietnamese-only** (hard-coded strings, no i18n); the public site is
bilingual via `src/lib/i18n/locales/{en,vi}.ts`.

`blogs/` and `projects/` additionally have a nested `dashboard/page.tsx` (analytics
sub-route) — the other resources don't. This is an intentional asymmetry (those two
resources have dedicated stats views), not an inconsistency to "fix" by adding empty
`dashboard/` stubs to every resource.

`api-doc` (a page) and `api/swagger` (the JSON it fetches) are easy to conflate by name —
`api-doc` is not part of the `api/` route-handler tree.

---

## `src/components/`

```
components/
├── Header.tsx, Footer.tsx, MainLayout.tsx   # Barrel-exported via index.ts — used by every public page
├── VisitorModal.tsx                          # Single-use, imported directly by MainLayout (not barrel-exported)
├── SwaggerUIClient.tsx                       # Single-use, imported directly by app/api-doc/page.tsx
├── ui/                                        # shadcn/ui primitives — regenerate via `npx shadcn@latest add <name>`
│                                              #   + hand-authored PublicPageHeader, CardGridSkeleton, PaginationControl
├── admin/                                     # Admin-only: *Dialog.tsx (create/edit modals), sidebar/,
│                                              #   AdminPageHeader + ADMIN_PAGE_CLASS, StatusBadge,
│                                              #   DeleteDialog + useConfirmDialog() (use instead of window.confirm)
└── hero-section/                              # Homepage sections: Hero, About, BPSCSection, Contact
```

**`ui/` casing note:** most files here are shadcn-generated and kebab-case
(`dropdown-menu.tsx`); a handful are hand-authored and PascalCase
(`CommandPalette.tsx`, `Resume3DViewer.tsx`, `ResumeCard3D.tsx`, `ThemeToggle.tsx`). This
split is intentional — it signals "generated, don't hand-edit" vs. "hand-authored,
edit freely" — not an inconsistency to normalize. Forcing shadcn-generated files to
PascalCase would just be undone by the next `shadcn add` regeneration.

**`hero-section/BPSCSection.tsx`** — the name is short for **B**log/**P**roject/**S**kill/
**C**ertification: the homepage "highlights" section that previews recent posts, featured
projects, and active certifications.

**Only `Header`/`Footer`/`MainLayout` are barrel-exported** (`components/index.ts`) — that's
deliberate, not an oversight; `VisitorModal` and `SwaggerUIClient` each have exactly one
call site and are imported directly.

---

## `src/lib/`

```
lib/
├── actions/            # 'use server' Server Actions — the real "backend" (see AI_ARCHITECTURE.md)
│   ├── blog.ts, project.ts, skill.ts, certification.ts, contact.ts   # one file per Prisma model
│   ├── about.ts         # exception: covers Profile/SocialLink/Experience/Education/
│   │                     # Achievement/SpokenLanguage/Activity — all edited on one admin page
│   └── auth-settings.ts # change-password action
├── analytics.ts         # server-only: admin analytics read model (page_views, blog_views, visitor logs)
├── journey.ts           # server-only: cached /journey feed (journal, capabilities, certs, posts, projects)
├── auth-utils.ts        # ensureAdmin() — the real authorization guard for every mutation
├── db.ts                # Prisma client singleton
├── rate-limit.ts         # In-memory sliding-window limiter with Auto-GC & presets (protects all API routes)
├── swagger.ts            # Builds the OpenAPI spec object
├── constants.ts          # Site-wide constants (SITE_NAME, NAV_LINKS, ...)
└── utils.ts               # cn() Tailwind class-merge helper
```

---

## `src/data/` — DB-fallback seed data only

```
data/
└── content.ts   # PROFILE, EXPERIENCES — fallback used by lib/actions/about.ts when the
                  # Profile/Experience tables are empty (fresh install, no admin data yet)
```

Public skill-category labels live in the locale files (`skills.categories.*`), shared by
`/skills` and the public résumé. The admin's Vietnamese labels and the enum value lists
(work vs. non-work categories, `SkillStatus`, `EvidenceType`) live in `src/lib/skill-constants.ts`.

### Skills: capabilities, evidence, learning journal

Skills are **not ranked** (the old `Skill.level` 1–5 column is kept only for old rows and
is never written). Instead each skill records what it lets you do:

- `SkillCapability` — one "I can do X" statement per row, ordered.
- `SkillEvidence` — proof (course, certificate, image, link, PDF, project), attached to the
  whole skill or to one capability. A `CERTIFICATE` can link an existing `Certification`.
  Uploaded files go through `/api/upload` with `fileType: 'skill'`; `deleteMedia` refuses to
  delete a file still used as evidence.
- `SkillLog` — dated learning-journal entries with optional hours.
- `Skill.status` (`LEARNING` / `ACHIEVED` / `PAUSED`) + `startedAt` / `achievedAt`.

Admin: `/nhatphanhk102/skills` (list) → `/nhatphanhk102/skills/[id]` (tabs for the three
lists). Public: `/skills` (filter chips: work / beyond work / learning) → `/skills/[slug]`
(calls `notFound()` before any Suspense boundary, see KNOWN_ISSUES #1).

**Nothing in this folder is the source of truth.** Once the admin has saved real content
via the database, these files stop being read. Don't add new "static content" files here
expecting them to be edited directly — add a real Prisma model + Server Action instead, and
only add a fallback here if the resource needs to render sensibly before the DB is seeded
(the same bootstrapping need `about.ts` has).

There used to be additional files here (`blogs.ts`, `projects.ts`, `certifications.ts`,
full mock datasets) and a `src/types/` folder (hand-written interfaces) — both were removed
as dead code (zero imports anywhere in `src`) once the DB-backed implementation fully
replaced them. Types now come from Server Action return values
(`Awaited<ReturnType<typeof getPublicBlogs>>[number]`) rather than a separate types folder —
follow that pattern for new resources instead of recreating `src/types/`.

---

## `src/hooks/`

Just `use-mobile.ts` (`useIsMobile()`, 768px breakpoint). Add new shared hooks here.

---

## Root-level auth files

`src/auth.ts` (Credentials provider), `src/auth.config.ts` (shared NextAuth config),
`src/proxy.ts` (Next.js 16 middleware — **not** `middleware.ts`, see `AI_ARCHITECTURE.md`
§4). These sit at `src/` root rather than inside `lib/` because they're framework-required
entry points (Next.js looks for `proxy.ts`/`middleware.ts` by convention), not general
utilities.
