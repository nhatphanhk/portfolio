# Portfolio

A personal portfolio website built with Next.js — a public site (home, blog, projects,
skills, certifications, resume, contact) backed by a database-driven admin CMS at `/admin`
for managing all of that content without touching code.

This is a real, deployed application, not a static template: every content type (profile,
experience, education, skills, blog posts, projects, certifications, social links, contact
messages, visitor logs) lives in PostgreSQL via Prisma and is edited through the admin
dashboard.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) |
| UI components | shadcn/ui (New York style), Radix primitives, `lucide-react` icons |
| Data / ORM | Prisma 7 + PostgreSQL (client output to `generated/prisma`) |
| Auth | NextAuth v5 (beta) — credentials provider, JWT session |
| Forms | React Hook Form + Zod validation |
| Animation | Framer Motion, GSAP |
| 3D | React Three Fiber / Three.js (resume viewer) |
| Analytics | Vercel Analytics + Speed Insights |
| API docs | `swagger-ui-react` + `next-swagger-doc`, served at `/api-doc` |
| Hosting | Vercel |

There is no separate REST/Express backend — reads and writes go through Next.js **Server
Actions** in `src/lib/actions/*.ts`, which call Prisma directly. See
[`docs/AI_ARCHITECTURE.md`](docs/AI_ARCHITECTURE.md) for the full data-flow diagram.

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech) or Prisma Postgres)

### Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` (see [`.env.example`](.env.example) for the full list and generation
commands for secrets):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth session secret (`openssl rand -hex 32`) |
| `AUTH_URL` | Production URL, no trailing slash |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | Env-defined admin fallback login, used if the DB is unreachable or has no `User` row yet (`node -e "require('bcryptjs').hash('yourpassword',12).then(console.log)"`) |
| `ADMIN_SETUP_KEY` | Key required to call the one-time admin-creation endpoint |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for OpenGraph/canonical tags |

Then set up the database and run the app:

```bash
npx prisma migrate dev   # create the schema in your database
npm run dev              # start the dev server (Turbopack) at http://localhost:3000
```

Log in to the admin dashboard at `/admin/login` with your `ADMIN_EMAIL` /
matching password, or create a DB-backed admin user via the `/api/admin/create` endpoint
(protected by `ADMIN_SETUP_KEY`).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | `prisma generate && next build --turbopack` |
| `npm run start` | Serve the production build |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format` / `npm run format:check` | Prettier |
| `npx prisma studio` | Browse the database |
| `npx prisma migrate dev` | Create/apply a migration after editing `prisma/schema.prisma` |

There is no automated test suite yet (`npm test` is a no-op placeholder).

## Project Structure

See [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for a full map of `src/` and
the reasoning behind how it's organized.

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) | Product goals, scope, feature list |
| [`docs/AI_ARCHITECTURE.md`](docs/AI_ARCHITECTURE.md) | Technical architecture, data model, API surface, auth, deployment |
| [`docs/AI_RULES.md`](docs/AI_RULES.md) | Coding conventions and rules for this codebase |
| [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) | Framework quirks/bugs that are easy to reintroduce |
| [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) | Map of `src/` and what lives where |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Condensed quick-reference for AI coding assistants |

## Deployment

Deployed on [Vercel](https://vercel.com). `npm run build` runs `prisma generate`
automatically, so no extra build step is needed beyond setting the environment variables
above in the Vercel project settings.
