# AI_RULES.md

> Mandatory rules for AI (Copilot/Claude/...) when generating code or proposing changes for the Portfolio project. Read alongside `AI_CONTEXT.md` (goals/scope) and `AI_ARCHITECTURE.md` (technical architecture).

---

## 1. General Rules

* Always follow the existing project structure; do not arbitrarily restructure directories.
* Prefer clean, readable code over "shortest code possible."
* Do not create unnecessary files.
* Reuse existing components/services instead of writing them from scratch.
* Before generating new code: understand the current architecture → follow current naming conventions → reuse existing patterns → avoid unnecessary complexity.
* Do not arbitrarily add features outside the MVP scope defined in `AI_CONTEXT.md` (full blog CMS, GitHub/LinkedIn API integration, multi-language support, newsletter, PDF resume, analytics, testimonials) unless explicitly requested.

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

### Reference Frontend Directory Structure

```
src/
├── components/
│   ├── ui/           # Shared UI components
│   ├── layout/       # Header, Footer, overall layout
│   ├── sections/     # Hero, About, Projects...
│   └── forms/        # Form components
├── app/
│   ├── (pages)/      # Route groups
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   └── types.ts
├── data/
│   ├── projects.ts
│   ├── skills.ts
│   └── content.ts
└── styles/
    ├── components.css
    └── utilities.css
```

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

## 3. Backend Rules

* **Controller** only handles request/response; contains no business logic.
* **Service** contains all business logic.
* **Repository** handles database operations.
* **DTO** must be used for data transfer between layers.

### Reference Backend Structure

```
backend/
├── controllers/   # Route handlers
├── middleware/    # auth, validation, rateLimit, upload, errorHandler
├── models/        # Database models / entities
├── routes/        # API routes
├── services/       # Business logic
├── utils/         # database, jwt, validation, fileUtils, helpers
├── config/        # database, jwt, upload, cors
└── tests/
```

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
* Use authentication middleware (JWT) consistently for every admin route.
* Sanitize input against XSS; use parameterized queries against SQL injection.
* Apply rate limiting to endpoints prone to abuse (login, contact form, upload).
* Hash passwords with bcrypt, minimum 12 rounds.
* Use environment variables (`.env.local`) for secrets/API keys — never commit secrets to git.
* Validate environment variables on application startup.
* Use `dangerouslySetInnerHTML` sparingly; sanitize content beforehand if it must be used.
* Comply with OWASP and GDPR requirements when handling contact data (cookie consent, right to data deletion).

(For technical details on JWT, rate limiting, upload validation: see `AI_ARCHITECTURE.md`.)

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

### Daily Workflow

```bash
# Start of day
git pull origin main
git checkout -b feature/day-[X]-[description]

# During development — commit frequently
git add .
git commit -m "type(scope): description"
git push origin feature/day-[X]-[description]

# End of day
git add .
git commit -m "chore(daily): complete day [X] development tasks"
git push origin feature/day-[X]-[description]
# Create a PR, review, then merge into main
```

---

## 9. Daily Development Workflow

### Before Starting Work

* Pull the latest changes from `main`.
* Create a feature branch for the day's work.
* Review the project board/priorities.
* Check for any urgent issues or feedback.

### During Development

* Commit changes frequently with clear messages.
* Test on multiple screen sizes.
* Check the console for errors/warnings.
* Validate accessibility.
* Monitor performance impact.

### End of Day

* Push the feature branch to remote.
* Create a Pull Request if the feature is complete.
* Update project documentation if needed.
* Plan the next day's priorities.

### Daily Success Criteria

* All features planned for the day are functional.
* Code has been committed with proper messages.
* No console errors in the browser.
* Responsive design works correctly on mobile.
* Performance remains at an acceptable level.

---

## 10. Emergency Procedures

### Production Issues

1. Create a hotfix branch from `main`.
2. Implement a minimal fix.
3. Test thoroughly before deploying.
4. Deploy via the fast-track process.
5. Notify stakeholders immediately, document the issue and resolution, schedule a post-mortem if significant, update monitoring to prevent recurrence.

### Data Loss Prevention

* Daily automated backups.
* Test restore procedures monthly.
* Keep multiple backup versions.
* Document recovery procedures.

### If Behind Schedule (relative to the MVP plan)

1. Prioritize MVP features only.
2. Cut non-essential animations.
3. Use placeholder content if needed.
4. Focus on core functionality.

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

### When Developing a New Feature

For each new feature (following the 3-layer backend architecture), create the full set:

```
Model/Entity
DTO
Repository
Service
Controller
Frontend UI
API Integration
```

### Response Style When Explaining Code

When explaining code, the AI should:

* Explain **why** that approach was chosen.
* Mention any **trade-offs** involved.
* Suggest improvements when appropriate.

---

## 12. Source References

This file synthesizes: `development_rules.md`, `daily_checklist.md`, the "Coding Rules" and "Copilot Instructions" sections from the original documents, plus the API rules in `api-documentation.md` / `api-implementation-guide.md` (technical details in `AI_ARCHITECTURE.md`).