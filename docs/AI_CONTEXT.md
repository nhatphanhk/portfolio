# AI_CONTEXT.md

> Project context document for AI (Copilot/Claude/...) when assisting with development of the personal Portfolio system. Read this file before generating code to understand the goals, scope, and current status of the project.

---

## 1. Project Overview

**Project Name:** Professional Portfolio Website
**Type:** Personal portfolio website (public site + content management admin dashboard)
**Tech stack:** Next.js, React, TypeScript, Tailwind CSS (frontend) + REST API (content management backend)
**MVP Goal:** 1 week (7 days) of development

The system is a **personal portfolio platform** that allows visitors to view personal information, skills, projects, blog posts, certificates, and contact information, while allowing the administrator (portfolio owner) to manage all of this content flexibly.

The system has two main areas:

1. **Public Website** – the publicly accessible site for visitors.
2. **Admin Management Dashboard** – the content management area (requires login).

### Problem Statement

Traditional resume formats and social media profiles are not enough to showcase technical projects, demonstrate design capabilities, or build a lasting professional impression. This project builds a centralized, professional platform to present work/projects, establish credibility, attract potential clients/employers, and provide an easy contact mechanism.

### Main Goals

* Build a modern, fast-loading, SEO-optimized personal portfolio website.
* Allow public users to explore information (projects, blog, skills, certificates).
* Allow the administrator to manage portfolio content flexibly (without editing code).
* Keep the system scalable and maintainable.

---

## 2. Project Scope

### In Scope

* Fully functional, responsive portfolio website.
* A self-built content management system (CMS) for easy updates.
* SEO-optimized pages (meta tags, structured data).
* Performance optimization achieving 90+ PageSpeed Insights scores.
* Cross-browser compatibility (Chrome, Firefox, Safari, Edge).
* Mobile responsiveness across all device sizes.
* Contact form with email integration.
* Project showcase with filtering/categorization.
* Blog system with markdown support.
* Social media integration.
* Analytics integration.

### Out of Scope

* E-commerce functionality.
* Public-facing user authentication systems (auth is admin-only).
* Complex database integrations beyond content management.
* Third-party payment processing.
* Advanced CRM integrations.
* Mobile application development.

### Phased Roadmap (long-term direction, beyond the MVP)

* **Phase 1 – Core Portfolio Foundation:** Navigation, Hero, About, Project showcase, Contact, responsive design, SSR, basic SEO.
* **Phase 2 – Enhanced UX:** Dark/light mode, smooth scroll, animations, testimonials, CMS for blog.
* **Phase 3 – Advanced Features:** GitHub/LinkedIn API integration, multi-language support, analytics, resume PDF export, newsletter subscription.

### Features Included in the 1-Week MVP

✅ Responsive navigation system
✅ Hero section introducing the owner
✅ About section with skills showcase
✅ Project showcase (static content initially)
✅ Contact form with email integration
✅ Dark/Light mode toggle
✅ Basic SEO
✅ Performance optimization
✅ Mobile responsiveness

### Features Deferred (Future Phases)

❌ Full CMS-backed blog system
❌ GitHub/LinkedIn API integration
❌ Multi-language support
❌ Advanced animations
❌ Newsletter subscription
❌ PDF resume export
❌ Analytics integration
❌ Testimonials section

**Post-MVP enhancement roadmap:** Week 2-3 blog/CMS → Week 4 API integrations (GitHub, LinkedIn) → Week 5 advanced features & analytics → Week 6+ multi-language support and additional features.

---

## 3. Public Features (Public Website)

### Landing

* Purpose: introduce the portfolio owner, display key highlights.
* Features: view social media links, send a contact message, view/download resume.

### About

* View personal information.
* Download resume.

### Blogs

* View blog list.
* View blog detail.
* (Extension) search, tag filtering, RSS feed.

### Projects

* View project list.
* View project detail (with case study, technologies used, demo/GitHub links).
* (Extension) filter and categorize by technology/status.

### Skills

* Display skills list (grouped by category, level).

### Certificates

* Display certificates list.
* View certificate detail.

### Other UX Features (extension/proposed in the SRS)

* Dark/light mode with persisted preference.
* Smooth scrolling, animations, micro-interactions.
* Keyboard navigation (accessibility).
* Clear loading states and error handling.

---

## 4. Admin Features (Management Area)

All admin APIs require authentication (JWT) — see `AI_ARCHITECTURE.md` for details.

### Profile Management

* Update profile information (bio, skills, experience, education, profile image, resume, social links).

### Social Media Management

* List social accounts.
* Add / Update / Delete social accounts.

### Contact Management

* View contact messages.
* Manage contact status (unread / read / replied), internal notes.
* Delete contacts.

### Skill Management (Full CRUD)

* Create / Update / Delete / View skills.

### Blog Management (Full CRUD)

* Create / Update / Delete / View blogs (draft/published), blog statistics.

### Project Management (Full CRUD)

* Create / Update / Delete / View projects, manage project document attachments, project statistics.

### Certificate Management (Full CRUD)

* Create / Update / Delete / View certificates.

### File Upload & Media Management

* General upload, avatar upload, project image upload, document upload.
* Manage/delete media, list media files.

### Dashboard & Analytics

* Overview statistics (blogs, projects, contacts, skills, certifications, storage usage).
* Recent activities.

---

## 5. Key Non-Functional Requirements (summarized from the SRS)

* **Performance:** PageSpeed 90+ (mobile & desktop), First Contentful Paint < 1.5s, lazy loading for images, use Next.js Image + CDN.
* **Scalability:** Support 1000+ concurrent users, up to 500 blog posts and 100 projects, efficient caching, horizontal scaling via serverless.
* **Security:** HTTPS across the system, validate/sanitize input, rate limiting for forms, comply with OWASP.
* **Usability:** Responsive from 320px → 4K, meet WCAG 2.1 AA standards, support major browsers (99% feature parity), max 3-click navigation to any content.
* **Reliability:** 99.9% uptime, graceful error handling, automated backup & recovery, system health monitoring.
* **Maintainability:** Comprehensive logging/monitoring, use TypeScript, follow coding standards, minimum 80% test coverage.
* **Compliance:** GDPR for contact data, cookie consent, support data deletion/export requests, audit logs.

---

## 6. Project Status & Timeline

The project was condensed from an 8-week plan down to a **1-week (7-day) MVP**, following a flexible 6-hour/day schedule (3-hour morning session + 1-hour break + 3-hour afternoon session, no fixed clock times).

| Day | Focus |
|---|---|
| 1 | Environment setup, Next.js initialization, basic layout & navigation, Tailwind setup |
| 2 | Hero section, About section (skills, experience), basic responsiveness |
| 3 | Project showcase structure (static data), project detail page, image optimization |
| 4 | Contact form + validation, email integration, basic animations & smooth scroll |
| 5 | Dark/light mode, responsive & cross-browser optimization, lazy loading |
| 6 | Content finalization, SEO (meta tags, structured data), testing & bug fixes |
| 7 | Final QA, production deployment, handover documentation |

**Key milestones:** Day 2 – basic layout/navigation complete; Day 4 – core functionality demo ready; Day 6 – feature-complete beta; Day 7 – production deployment.

**MVP success criteria:** fully functional responsive website, working contact form with successful email delivery, mobile/desktop compatibility, basic SEO, deployed to production, documented source code.

---

## 7. Risk Management (summary)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Technical integration failure | Medium | High | Thorough API testing, fallback implementations |
| Scope creep | High (due to compressed timeline) | High | Strict adherence to the MVP list, document excluded features for later |
| Performance optimization challenges | Low | Medium | Regular performance audits throughout development |
| Content migration issues | Medium | Medium | Create templates & content import scripts |
| Design approval delays | Medium | Medium | Involve stakeholders early, iterative design approval |
| Third-party service dependencies | Low | Medium | Choose reliable providers, implement graceful degradation |
| Browser compatibility | Low | Low | Regular cross-browser testing, standard CSS framework/polyfills |

---

## 8. How AI Should Understand This Project (guidance for code generation)

When generating code or proposing solutions, AI should:

* Treat this as a **content management portfolio system**.
* Clearly separate **Public** (reading public content) and **Admin** (CRUD content, requires authentication) responsibilities.
* Prioritize the **MVP first, expand later** — do not arbitrarily add features that were excluded from the MVP (full blog CMS, GitHub/LinkedIn APIs, multi-language, etc.) unless explicitly requested.
* Keep business logic reusable, with clear separation between controller/service/repository (see `AI_ARCHITECTURE.md`).
* Prioritize maintainability and clean architecture.
* Follow the specific coding rules in `AI_RULES.md` and the technical architecture in `AI_ARCHITECTURE.md`.

---

## 9. Related Source Documents

This file was synthesized from the following source documents in `docs/`:

* `software_requirements_specification.mdx` – detailed functional & non-functional requirements.
* `project_proposal.mdx`, `project_management_plan.mdx` – scope, timeline, budget, risks.
* `project_update_summary.md` – history of project plan updates.
* `api-documentation.md`, `api-implementation-guide.md`, `openapi-spec.yaml` – API technical details (synthesized in `AI_ARCHITECTURE.md`).
* `development_rules.md`, `daily_checklist.md` – development rules (synthesized in `AI_RULES.md`).