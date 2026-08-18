# AI_RULES.md

> Mandatory rules for AI (Copilot/Claude/...) when generating code or proposing changes for the Portfolio project. Read alongside `AI_CONTEXT.md` (goals/scope) and `AI_ARCHITECTURE.md` (technical architecture). For a condensed quick-reference (and the definitive source for patterns specific to this codebase), see `.github/copilot-instructions.md`.

---

## 1. General Rules

* Always follow the existing project structure; do not arbitrarily restructure directories.
* Prefer clean, readable code over "shortest code possible."
* Do not create unnecessary files.
* Reuse existing components/services instead of writing them from scratch.
* Before generating new code: understand the current architecture → follow current naming conventions → reuse existing patterns → avoid unnecessary complexity.
* Do not arbitrarily add features beyond what's asked — this is a finished, live system (see `AI_CONTEXT.md` §2 for what's built and what's explicitly out of scope), not a scaffold to keep expanding speculatively.

---

## 2. Frontend Rules

* Create reusable UI components.
* Keep pages lightweight — push complex logic outward (small components, custom hooks, services).
* Move all API call logic into dedicated service files; do not call fetch directly inside components.
* Avoid duplicate UI code.
* Use meaningful, clear naming.

**Naming example:**

Good:
```
components/
  BlogCard.tsx
```

Bad:
```
components/
  BlogCardFinalNew.tsx
```

### Detailed Naming Conventions

* **Folders:** kebab-case, e.g. `project-showcase`.
* **React components:** PascalCase for both file name and component name, e.g. `ContactForm.tsx` → `ContactForm`.
* **Utility functions:** camelCase, e.g. `formatDate.ts`.
* **Props interfaces:** suffixed with `Props`, e.g. `ContactFormProps`.
* **CSS:** prefer Tailwind utility classes; custom classes use kebab-case (`.hero-gradient`); component-specific classes use BEM-style (`.contact-form__input`).

### Actual Directory Structure

This is the real, current layout — see `docs/PROJECT_STRUCTURE.md` for the full breakdown
of what lives where and why.

```
src/
├── app/                  # Routes (App Router) — public pages, admin/, api/*, api-doc/
├── components/
│   ├── ui/               # shadcn/ui primitives (regenerate via CLI, don't hand-edit internals)
│   ├── admin/             # Dialogs, sidebar nav — admin-only components
│   ├── hero-section/      # Homepage sections (Hero/About/Highlights/Contact)
│   └── Header.tsx, Footer.tsx, MainLayout.tsx  # top-level, barrel-exported via index.ts
├── lib/
│   ├── actions/            # 'use server' Server Actions — one file per Prisma model (the real "backend", see AI_ARCHITECTURE.md)
│   ├── auth-utils.ts, db.ts, rate-limit.ts, swagger.ts, utils.ts
├── data/                  # DB-fallback seed data ONLY — not the source of truth, see AI_ARCHITECTURE.md §2
├── hooks/                 # Custom React hooks
├── auth.ts, auth.config.ts, proxy.ts   # NextAuth v5 config + middleware
```

There is no `src/components/layout/`, `sections/`, or `forms/` folder, no `src/lib/types.ts`,
and no `src/styles/` folder — don't recreate these; the structure above is what's actually
used. There is also no `src/types/` folder — types are colocated or derived from action
return values (see below).

### TypeScript Standards

* Always define interfaces for props.
* Use strict TypeScript configuration.
* No `any` types unless absolutely necessary.
* Define return types for functions.

```typescript
interface ProjectProps {
  title: string;
  description: string;
  technologies: string[];
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### Component Structure Standard

```typescript
interface ComponentProps {
  // Props definition
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // Event handlers
  // Render logic

  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}
```

* Keep components under 200 lines.
* Extract complex logic into custom hooks.
* Include JSDoc comments for complex components.

### Frontend Performance

* Use the Next.js `Image` component for all images, always with `alt` text.
* Prefer WebP format where possible; lazy-load below-the-fold images.
* Use dynamic imports for large components; implement route-based code splitting.
* Import only what's needed from libraries (tree-shaking friendly); monitor bundle size.

---

## 3. Backend Rules (Server Actions)

There is no Express-style controller/service/repository backend in this project — see
`AI_ARCHITECTURE.md` §1–§3 for the full explanation. The equivalent layering is:

* **Page (Server Component)** — calls an action, renders the typed result. No business logic.
* **Server Action** (`src/lib/actions/{resource}.ts`, `'use server'`) — contains all
  business logic: validation, authorization (`ensureAdmin()` for every mutation),
  `revalidatePath()` after writes.
* **Prisma** — the only thing that talks to the database directly; queries live inside the
  action functions (no separate repository layer — keep it that way, don't introduce one).
* One action file per Prisma model, with the single documented exception of
  `about.ts` (covers Profile/SocialLink/Experience/Education/Achievement/SpokenLanguage/
  Activity — all edited on one admin page). Follow this file-per-resource convention for
  any new resource rather than adding a generic "backend" folder.

Route Handlers (`src/app/api/*/route.ts`) are the exception, not the default — use them
only for what a Server Action genuinely can't do (see `AI_ARCHITECTURE.md` §5: NextAuth's
own routes, a public POST that isn't a form action, serving raw JSON).

### Database Rules

* Keep entities normalized; avoid duplicated data.
* Relationships between tables must be clear (foreign keys, appropriate ON DELETE behavior).
* Use transactions for multi-step operations.
* Apply soft deletes for important data where needed.
* Index frequently queried/filtered fields (status, slug, created_at, foreign keys...).
* Perform regular backups with a tested recovery procedure.

---

## 4. CRUD Rules

Every admin management module must support:

```
Create
Read
Update
Delete
```

**Modules covered:**

* Blog
* Project
* Skill
* Certificate
* Social Media
* Certification (issuer, issue/expiry date, credential ID/URL)
* Contact (Read/Update status/Delete only — no Create from admin, since contacts are created via the public form)

For modules with larger datasets (Blog, Project, Skill, Certification), also support:

* Pagination (`page`, `limit`, default `limit=10`, max `100`).
* Sorting (`sort`, `order`).
* Search/filter by relevant fields (`search`, `status`, `tags`, `featured`...).
* Bulk delete (`POST /bulk-delete` with an `ids` array).
* A dedicated statistics endpoint (`/stats`) when needed for dashboard display.

---

## 5. Security Rules

* Validate all user input (both frontend and backend).
* Protect all admin APIs with authentication middleware — no admin endpoint should be left without token verification.
* Never expose sensitive data (password hashes, secret tokens, internal information) in responses.
* Every mutating Server Action must call `ensureAdmin()` (`src/lib/auth-utils.ts`) first — this is the real authorization boundary, not just the `src/proxy.ts` route matcher (which is UX-layer only).
* Sanitize input against XSS; use parameterized queries against SQL injection.
* Apply rate limiting to endpoints prone to abuse (login, contact form, upload).
* Hash passwords with bcrypt, minimum 12 rounds.
* Use environment variables (`.env.local`) for secrets/API keys — never commit secrets to git.
* Validate environment variables on application startup.
* Use `dangerouslySetInnerHTML` sparingly; sanitize content beforehand if it must be used.
* Comply with OWASP and GDPR requirements when handling contact data (cookie consent, right to data deletion).

(For technical details on auth and rate limiting, see `AI_ARCHITECTURE.md` §4–§5.)

---

## 6. Testing Rules

* **Unit tests:** placed next to the corresponding component/file (`ContactForm.test.tsx`), using `.test.tsx`/`.spec.tsx` extensions; test both happy paths and error cases.
* Test user interactions, not implementation details; use React Testing Library for component tests.
* Maintain minimum **80% code coverage**.
* Write descriptive test names clearly describing the behavior under test.
* **Integration tests:** test complete user flows (e.g. the full contact form submission flow end-to-end), test responsive behavior, test accessibility features.
* **API testing checklist:** unit tests for every endpoint, integration tests for complete workflows, load testing for performance, security testing, error handling validation, rate limiting verification.

---

## 7. Documentation Rules

* Write JSDoc for complex components/functions, clearly describing parameters and return values.
* Document complex business logic and any side effects.
* Always keep the README current when: setup instructions change, new features are added, troubleshooting guidance is needed, or deployment process changes.

```typescript
/**
 * ContactForm component for handling user inquiries
 * @param onSubmit - Callback function called when form is submitted
 * @param loading - Whether the form is in loading state
 */
export default function ContactForm({
  onSubmit,
  loading,
}: ContactFormProps) {
  // Component implementation
}
```

---

## 8. Git Rules

### Commit Format

```
type(scope): description

[optional body]
[optional footer]
```

### Commit Types

* `feat` – New feature
* `fix` – Bug fix
* `docs` – Documentation changes
* `style` – Code formatting changes (no logic impact)
* `refactor` – Code refactoring
* `test` – Adding/updating tests
* `chore` – Maintenance work (setup, dependencies, etc.)

**Examples:**

```
feat(navigation): add responsive mobile menu
fix(contact): resolve form validation issue
docs(readme): update installation instructions
style(components): format button component
```

### Branch Management

* Protect the `main` branch: all changes must go through a pull request; no direct commits to `main`.
* Require at least one review before merging a PR.
* Create feature branches from `main` with descriptive names: `feature/contact-form`, `fix/mobile-responsive`.
* Delete branches after merging.

### Typical Workflow

```bash
git pull origin main
git checkout -b feature/short-description

# commit frequently with clear messages
git add .
git commit -m "type(scope): description"
git push origin feature/short-description
# open a PR, get a review, merge into main
```

---

## 9. Development Workflow

### Before Starting Work

* Pull the latest changes from `main`.
* Create a feature branch with a descriptive name.
* Check for any related open issues.

### During Development

* Commit changes frequently with clear messages.
* Test on multiple screen sizes.
* Check the console for errors/warnings.
* Validate accessibility.
* Monitor performance impact.
* Run `npm run type-check` and `npm run lint` before opening a PR; run `npm run build` too if the change touches routing/rendering (see `docs/KNOWN_ISSUES.md` for bugs that only show up in a production build).

### Before Merging

* Push the feature branch to remote.
* Open a Pull Request; get at least one review.
* Update `README.md`/`docs/` if the change affects setup, structure, or a documented convention.

---

## 10. Emergency Procedures

### Production Issues

1. Create a hotfix branch from `main`.
2. Implement a minimal fix.
3. Test thoroughly before deploying.
4. Deploy via the fast-track process.
5. Notify stakeholders immediately, document the issue and resolution, schedule a post-mortem if significant, update monitoring to prevent recurrence.

### Data Loss Prevention

* Automated backups of the production database.
* Test restore procedures periodically.
* Keep multiple backup versions.
* Document recovery procedures.

---

## 11. Guidance for AI Coding Assistants (Copilot/Claude...)

### Understand the Project Before Coding

You are assisting development of a **personal Portfolio CMS system**, consisting of two main areas:

* The public portfolio website (public).
* The management dashboard (admin).

### Coding Behavior

Before generating code:

1. Understand the existing architecture.
2. Follow the current naming convention.
3. Reuse existing patterns.
4. Avoid unnecessary complexity.

### When Developing a New Content Resource

Follow the existing per-resource pattern (see `AI_ARCHITECTURE.md` §2–§3) rather than
inventing a new one:

```
Prisma model + migration (prisma/schema.prisma, npx prisma migrate dev)
Server Action file (src/lib/actions/{resource}.ts — public get*, admin CRUD, ensureAdmin() on writes)
Admin UI (page.tsx + client.tsx under src/app/admin/(dashboard)/{resource}/, dialogs in src/components/admin/ if needed)
Public UI (page.tsx under src/app/{resource}/ if the resource has a public-facing view)
Wire into sitemap.ts/robots.ts if it's publicly indexable content
```

### Response Style When Explaining Code

When explaining code, the AI should:

* Explain **why** that approach was chosen.
* Mention any **trade-offs** involved.
* Suggest improvements when appropriate.

---

## 12. Related Documents

* `docs/AI_CONTEXT.md` — product goals, scope, feature list.
* `docs/AI_ARCHITECTURE.md` — technical architecture, data model, API surface, auth, deployment.
* `docs/KNOWN_ISSUES.md` — framework quirks that are easy to reintroduce.
* `docs/PROJECT_STRUCTURE.md` — map of `src/` and what lives where.
* `.github/copilot-instructions.md` — condensed quick-reference; the definitive source when it and this file disagree on a codebase-specific detail.