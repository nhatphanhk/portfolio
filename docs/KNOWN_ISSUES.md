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

**The fix already in place:**

- `src/app/blog/[slug]/not-found.tsx` — a route-scoped 404 UI, not a `loading.tsx`.
- `src/app/blog/[slug]/page.tsx` (and `project/[slug]/page.tsx`) export **both**
  `generateStaticParams()` **and** `export const dynamic = 'force-dynamic'`. Both are
  required — `force-dynamic` opts the route out of the streaming/prerender path that
  causes the status-code bug, while `generateStaticParams` is kept so the route is still
  known to the router/sitemap generation.
- There is **no root `src/app/loading.tsx`**, and none should be added. If a global loading
  UI is ever needed, scope it to a segment that never calls `notFound()`, or accept the
  tradeoff explicitly and document it here.

**Rule:** ❌ Don't add `src/app/loading.tsx` (or any `loading.tsx` in an ancestor of a route
that calls `notFound()`) without re-checking this behavior first.

---

## 2. Defining a component inside another component's function body causes a full remount on every keystroke

**Symptom:** Hit in the large admin editor clients (e.g. `src/app/admin/(dashboard)/resume/client.tsx`,
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

## 3. Reporting a new issue here

If you hit another framework-level gotcha (not an ordinary bug in this codebase's own
logic, but a Next.js/React/Prisma/NextAuth behavior that's non-obvious and could easily be
reintroduced), add a numbered section above following the same format: **Symptom → Cause →
Fix in place → Rule**.
