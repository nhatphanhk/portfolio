# KNOWN_ISSUES.md

> Framework quirks and past bugs in this codebase that are easy to reintroduce by accident.
> Read this before touching `loading.tsx`, `notFound()`, or any large admin client
> component with inline sub-components. Referenced from `.github/copilot-instructions.md`.

---

## 1. `loading.tsx` above a route that calls `notFound()` breaks the 404 status code

**Symptom:** A dynamic detail route (e.g. `blog/[slug]`, `project/[slug]`) that calls
`notFound()` for a missing slug should return an HTTP `404`, but instead returns `200` with
the 404 page's HTML — search engines and monitoring tools see it as a normal, successful
page.

**Cause:** In the Next.js App Router, when an ancestor segment has a `loading.tsx`, that
segment is wrapped in a `<Suspense>` boundary. Rendering inside `<Suspense>` streams the
response, and by the time `notFound()` throws deep in the tree, the HTTP status code has
already been sent as `200` — it can no longer be changed to `404`. This only happens when a
`loading.tsx` exists **above** the segment that calls `notFound()`; a scoped `not-found.tsx`
at the same level as the page is fine.

**Current state (what keeps public 404s correct today):**

- There is **no root `src/app/loading.tsx`** and no `loading.tsx` above any public route.
  The public detail routes (`blog/[slug]`, `project/[slug]`, `blog/series/[slug]`) call
  `notFound()` right after their first data read, before any Suspense boundary, so the
  status code can still be set to `404`.
- They no longer export `dynamic = 'force-dynamic'` / `generateStaticParams` for this — the
  root layout reads the locale cookie, which already makes every route dynamic (see #4).
  Their `revalidate` exports are inert for the same reason.
- `src/app/blog/[slug]/not-found.tsx` and `src/app/not-found.tsx` both render the shared
  `NotFoundView` (a route-scoped 404 UI, not a `loading.tsx`).
- Public list pages show loading state with `<Suspense fallback={<CardGridSkeleton />}>`
  inside the page, not with a route `loading.tsx`.
- **Accepted exception:** the admin area has route `loading.tsx` files —
  `src/app/nhatphanhk102/(dashboard)/loading.tsx` plus one per admin route, built from the
  primitives in `src/components/admin/AdminSkeletons.tsx`. The only
  `notFound()` beneath them is the blog editor (`blogs/editor/[id]`); a missing id there
  streams the 404 UI with HTTP `200` + `noindex`. That route is behind auth and never
  crawled, so the status code doesn't matter.

**Rule:** ❌ Don't add `src/app/loading.tsx` (or any `loading.tsx` in an ancestor of a
*public* route that calls `notFound()`). Use an in-page `<Suspense>` skeleton instead, or
document the tradeoff here as was done for the admin.

---

## 2. Defining a component inside another component's function body causes a full remount on every keystroke

**Symptom:** Hit in the large admin editor clients (e.g. `src/app/nhatphanhk102/(dashboard)/resume/client.tsx`,
which edits Profile/Experience/Education/etc. on one page). Typing into a text field inside
one of these forms caused the entire form section to lose focus / remount after every
character.

**Cause:** A sub-component defined *inside* another component's function body (a common
pattern when a section only makes sense in the context of its parent) gets a **new function
identity on every render** of the parent. React's reconciliation identifies component types
by reference, so `<InnerComponent />` looks like a brand-new component type on every render
— React unmounts the old instance and mounts a new one, discarding all local state
(including input focus) every time the parent re-renders (e.g. on every keystroke that
updates parent state).

```tsx
// ❌ Bug: InnerComponent is redefined every render of Parent
function Parent() {
  function InnerComponent() {
    return <input />;
  }
  return <InnerComponent />; // new type every render → full remount
}
```

**The fix:** call it as a plain function instead of rendering it as JSX, so it doesn't go
through React's type-identity reconciliation:

```tsx
// ✅ Fixed: called as a function, not rendered as a new component type
function Parent() {
  function InnerComponent() {
    return <input />;
  }
  return InnerComponent(); // same as inlining its JSX — no separate component type
}
```

(The proper long-term fix is to hoist the sub-component out of the parent's function body
entirely — do that when convenient. The inline-call fix above is the minimal patch when
the sub-component genuinely needs closure access to the parent's local variables.)

**Rule:** ✅ Before adding a new inline sub-component to a large client component (especially
in the admin editors), check whether it's defined inside the parent's function body and
rendered as JSX — if so, either hoist it out or call it as `{InnerComponent()}`.

---

## 3. Serverless In-Memory Rate Limiting Boundaries (Zero-Cost Tradeoff)

**Symptom:** In a serverless environment (e.g. Vercel), rate limiting records are stored in Node.js process memory (`src/lib/rate-limit.ts`). If multiple lambda instances scale out simultaneously, an attacker could theoretically make a few requests across different instances before hitting the threshold on one.

**Cause:** Serverless lambdas do not share memory across instances or across cold restarts.

**The mitigation in place:**
- Memory auto-cleanup garbage collection (`cleanupExpiredRecords`) ensures no memory leakage.
- Read traffic is **not** absorbed by ISR: every page renders dynamically (see #4), so each
  public request runs a function. Data reads are cached with `unstable_cache` / tags, which
  keeps the DB load low, but the functions themselves still run.
- Rate-limited endpoints (per IP): mutating `/api/contact`, `/api/visitor`, `/api/upload`,
  `/api/resume/parse-pdf`, `/api/translate`, `/api/blogs/[id]/view`, `/api/admin/create`,
  and the read-only (but expensive to abuse) `/api/swagger`. Credentials sign-in is
  rate-limited in `src/auth.ts`.
- Client IP resolution (`getClientIp` in `src/lib/rate-limit.ts`) prefers
  `x-vercel-forwarded-for`, then the first `x-forwarded-for` hop, and only then
  `cf-connecting-ip` — the site is not behind Cloudflare, so that header is client-forgeable.
- Zero-cost (0đ): Perfectly suitable for normal personal portfolio traffic (< 1,000 req/day).

**Rule:** ✅ If the portfolio ever transitions to a massive enterprise scale with thousands of requests per second, plug in Upstash Redis via distributed key-value store, or configure Cloudflare WAF at the DNS edge.

---

## 4. The root layout's cookie read makes every route dynamic

**Symptom:** `export const revalidate = 3600` (and similar ISR settings) on public pages has
no effect; `next build` lists every route as dynamic (ƒ) rather than static/ISR.

**Cause:** `src/app/layout.tsx` calls `getServerLocale()`, which reads the `locale` cookie
(and `Accept-Language`). Reading request data in the root layout opts the whole tree into
dynamic rendering. The locale lives in a cookie rather than in the URL.

**The fix in place:** none — accepted for now. Data reads are cached at the Server Action
level (`unstable_cache` + `revalidateTag`), so the cost is function execution, not DB load.

**Rule:** ✅ Don't "fix" this by removing the cookie read or adding `force-static`; the page
would render in the wrong language. The real fix is `[locale]` URL segments (`/en/...`,
`/vi/...`) with `generateStaticParams` + hreflang, which is an architectural change and
out of scope until decided explicitly.

---

## 5. Reporting a new issue here

If you hit another framework-level gotcha (not an ordinary bug in this codebase's own
logic, but a Next.js/React/Prisma/NextAuth behavior that's non-obvious and could easily be
reintroduced), add a numbered section above following the same format: **Symptom → Cause →
Fix in place → Rule**.
