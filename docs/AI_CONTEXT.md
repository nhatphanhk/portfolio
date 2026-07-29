# AI_CONTEXT.md

> Project context for AI assistants (Copilot/Claude/...) working on this codebase. Read
> alongside `AI_ARCHITECTURE.md` (technical architecture) and `AI_RULES.md` (coding rules).
> For a condensed quick-reference, see `.github/copilot-instructions.md`.

---

## 1. Project Overview

**Project:** Personal Portfolio Website with an admin CMS
**Tech stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4, Prisma 7 +
PostgreSQL, NextAuth v5

This is a **real, deployed system**, not a prototype or an MVP-in-progress. It has two areas:

1. **Public website** — visitors read profile info, blog posts, projects, skills,
   certifications, and can send a contact message.
2. **Admin dashboard** (`/admin`, authenticated) — full CRUD content management for every
   public content type, plus a contact inbox and visitor log.

All content is database-backed via Prisma. A handful of static files in `src/data/*.ts`
exist only as **fallback seed data** for a fresh install with an empty database (see
`docs/PROJECT_STRUCTURE.md`) — they are never the source of truth once real content has been
saved through the admin.

---

## 2. What's Actually Built

### Public site

| Route | Purpose |
|---|---|
| `/` | Home — hero, about, and a highlights section (recent blog posts / featured projects / active certifications) |
| `/blog`, `/blog/[slug]` | Blog list + detail |
| `/project`, `/project/[slug]` | Project list + detail |
| `/skills` | Skills grouped by category, with proficiency levels |
| `/certifications` | Certifications list |
| `/resume` | Resume/CV view (incl. a 3D resume card viewer) |
| `/contact` | Contact form (rate-limited) |
| `/sitemap.xml`, `/robots.txt` | Generated from live DB content (published blogs/projects) |

### Admin dashboard (`/admin`, NextAuth-gated)

Full CRUD for: Blog posts (draft/published/archived, tags), Projects (with images, tags,
featured flag), Skills (category + level), Certifications, Social links, Experience,
Education, Achievements, Spoken languages, Activities, and the Profile/About content. Plus:
a contact-message inbox (status: unread/read/replied, notes), a visitor log, an
analytics/dashboard home, a change-password flow, and a Swagger UI (`/api-doc`) documenting
the JSON API routes.

### What does **not** exist (don't build unless asked)

- A separate REST/Express backend — reads/writes go through Server Actions, not a
  standalone API layer (see `AI_ARCHITECTURE.md`).
- Multi-language / i18n support.
- Public-facing (non-admin) user accounts.
- A newsletter, payments, or e-commerce features.

---

## 3. How AI Should Approach This Codebase

- Treat this as a **finished, live system** — prefer small, targeted changes over
  speculative abstractions or scaffolding for hypothetical future needs.
- Keep the **Public vs Admin** responsibility split clear: public reads are unauthenticated
  and only ever return published/active content; admin reads/writes require
  `ensureAdmin()` (see `src/lib/auth-utils.ts`).
- Reuse the existing per-resource pattern (Page → Server Action → Prisma) instead of
  inventing a new data-access style for a new feature — see `AI_ARCHITECTURE.md` §3.
- Follow the naming/structure conventions in `AI_RULES.md`, and check
  `docs/KNOWN_ISSUES.md` before touching routing/rendering edge cases
  (`loading.tsx`, `notFound()`, inline component definitions in render bodies).
- Don't add features outside what's asked — this project has already been through one
  round of "aspirational docs describing a system that doesn't exist"; keep documentation
  and code in sync going forward.

---

## 4. Related Documents

- `docs/AI_ARCHITECTURE.md` — technical architecture, data model, API surface, auth,
  deployment.
- `docs/AI_RULES.md` — naming conventions, CRUD/security/git rules.
- `docs/KNOWN_ISSUES.md` — framework quirks that are easy to reintroduce.
- `docs/PROJECT_STRUCTURE.md` — map of `src/` and what lives where.
- `.github/copilot-instructions.md` — condensed quick-reference; read this first for a fast
  orientation, then the docs above for depth.
