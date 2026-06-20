# AI_ARCHITECTURE.md

> Technical architecture of the Portfolio system. Read alongside `AI_CONTEXT.md` (goals/scope) and `AI_RULES.md` (coding rules) before generating code.

---

## 1. High-Level Architecture

```
Client (Browser)
       |
Frontend Application (Next.js / React / TypeScript / Tailwind)
       |
Backend API (REST, JWT auth)
       |
Database (PostgreSQL recommended)
```

### Recommended Tech Stack

| Component | Primary Choice | Alternatives |
|---|---|---|
| Frontend | Next.js + React + TypeScript + Tailwind CSS | — |
| Backend framework | Node.js + Express.js | Next.js API Routes (if integrated with the frontend) / NestJS (for larger systems needing more structure) |
| Database | PostgreSQL (recommended for production — ACID, JSON support) | MongoDB (document-based) / SQLite (dev/test) |
| Authentication | JWT (access + refresh token) | — |
| Password hashing | bcrypt (minimum 12 rounds) | — |
| Rate limiting | express-rate-limit | — |
| File storage | AWS S3 / Cloudflare R2 (production) | Local disk (dev) |
| Upload middleware | Multer | — |
| Image processing | Sharp | — |
| Validation | Joi / Yup / express-validator | — |
| Security headers | helmet, cors | — |
| Cache / rate-limit store | Redis | — |
| Logging | winston | — |
| Deployment | Vercel (frontend), Docker + PM2 (backend) | — |

---

## 2. Application Layers

### Frontend Layer

**Responsibilities:**

* Render UI.
* Handle user interaction.
* Call backend APIs.
* Manage application state.
* **Does not** contain business logic.

**Suggested directory structure:**

```
src/
 ├── components/   # Shared UI components
 ├── pages/        # or app/ with App Router
 ├── features/     # feature-specific logic
 ├── services/     # API calls
 ├── hooks/        # custom hooks
 └── utils/
```

(See the full structure in `AI_RULES.md` section 2.)

### Backend Layer

**Responsibilities:**

* Business logic.
* Authentication / Authorization.
* Data validation.
* CRUD operations.
* Database access **only** through the repository/data access layer.

**Suggested directory structure:**

```
src/
├── controllers/   # Route handlers (request/response only)
│   ├── authController.js
│   ├── blogController.js
│   ├── projectController.js
│   ├── skillController.js
│   ├── certificationController.js
│   ├── contactController.js
│   ├── uploadController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── validation.js    # Request validation
│   ├── rateLimit.js     # Rate limiting
│   ├── upload.js        # File upload handling
│   └── errorHandler.js  # Centralized error handling
├── models/               # Database models/entities
│   ├── User.js
│   ├── Blog.js
│   ├── Project.js
│   ├── Skill.js
│   ├── Certification.js
│   ├── Contact.js
│   └── Document.js
├── routes/
│   ├── auth.js
│   ├── blogs.js
│   ├── projects.js
│   ├── skills.js
│   ├── certifications.js
│   ├── contacts.js
│   ├── upload.js
│   └── dashboard.js
├── services/             # Business logic
│   ├── authService.js
│   ├── emailService.js
│   ├── fileService.js
│   └── notificationService.js
├── utils/
│   ├── database.js
│   ├── jwt.js
│   ├── validation.js
│   ├── fileUtils.js
│   └── helpers.js
├── config/
│   ├── database.js
│   ├── jwt.js
│   ├── upload.js
│   └── cors.js
└── tests/
    ├── auth.test.js
    ├── blogs.test.js
    └── projects.test.js
```

**Backend layering principle (3-layer):**

```
Controller  → only receives requests, calls the service, returns the response
Service     → contains all business logic
Repository  → interacts directly with the database
```

DTOs are used to transfer data between layers and between client–server.

---

## 3. Domain Modules & Data Flow

### Profile Module

```
Admin → Profile API → Profile Service → Database
```

### Blog Module (standard CRUD pattern, applied to all modules)

```
Admin Create Blog
        |
        v
Blog Controller
        |
        v
Blog Service
        |
        v
Blog Repository
        |
        v
Database
```

The same CRUD pattern applies to: **Projects, Skills, Certificates, Social Media, Certifications, Contacts** (Contact is Read/Update/Delete only from the admin side).

### Public Data Flow (e.g. Projects page)

```
Visitor
 |
Open Projects Page
 |
Call Project API
 |
Get Project Data
 |
Render UI
```

### Admin Data Flow (e.g. generic CRUD)

```
Admin
 |
Dashboard
 |
CRUD API
 |
Business Service
 |
Database Update
```

### Mandatory Architecture Rules

* Frontend should not contain business logic.
* Backend handles validation.
* Database access only through the repository/data layer.
* Keep modules independent (loose coupling).
* Avoid duplicated code across modules.

---

## 4. Database Schema (PostgreSQL)

```sql
-- Users (admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    tags JSONB DEFAULT '[]',
    featured_image TEXT,
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies JSONB DEFAULT '[]',
    live_url TEXT,
    github_url TEXT,
    images JSONB DEFAULT '[]',
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience INTEGER,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url TEXT,
    description TEXT,
    logo TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    notes TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents (attachments for a Project)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About page content
CREATE TABLE about_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bio TEXT,
    skills JSONB DEFAULT '[]',
    experience TEXT,
    education TEXT,
    profile_image TEXT,
    resume_url TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files (general)
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type VARCHAR(50), -- 'avatar', 'project', 'blog', 'document'
    alt_text TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## 5. API Design

### General Information

* **Base URL:** `https://your-domain.com/api` (production) / `http://localhost:3000/api/v1` (dev)
* **Auth:** JWT Bearer Token (`Authorization: Bearer <token>`)
* **Content-Type:** `application/json` (except uploads, which use `multipart/form-data`)
* **API Version:** v1

### Standard Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**With pagination:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2025-10-13T10:30:00Z"
}
```

### HTTP Status Codes

`200` Success · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Validation Error · `429` Rate Limit Exceeded · `500` Internal Server Error

### Standard Error Codes

`INVALID_CREDENTIALS` · `TOKEN_EXPIRED` · `TOKEN_MISSING` · `TOKEN_INVALID` · `USER_NOT_FOUND` · `VALIDATION_ERROR` · `RESOURCE_NOT_FOUND` · `DUPLICATE_ENTRY` · `FILE_TOO_LARGE` · `INVALID_FILE_TYPE` · `RATE_LIMIT_EXCEEDED` · `FILE_UPLOAD_ERROR` · `INTERNAL_ERROR`

### Standard Pagination Parameters

```
?page=1&limit=10&sort=createdAt&order=desc
```

* `page` (default 1) · `limit` (default 10, max 100) · `sort` (default `createdAt`) · `order` (`asc`/`desc`, default `desc`)

### Main Endpoint List

#### Authentication & User Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns access + refresh token |
| POST | `/api/auth/logout` | Logout, invalidates tokens |
| GET | `/api/auth/me` | Get current user info |
| PUT | `/api/auth/me` | Update user info |
| POST | `/api/auth/refresh` | Refresh access token using refresh token |

#### Blog Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs` | List blogs (supports `search`, `status`, `tags`, pagination) |
| GET | `/api/blogs/:id` | Get a single blog |
| POST | `/api/blogs` | Create a blog |
| PUT | `/api/blogs/:id` | Update a blog |
| DELETE | `/api/blogs/:id` | Delete a blog |
| POST | `/api/blogs/bulk-delete` | Bulk delete blogs (`{ "ids": [...] }`) |
| GET | `/api/blogs/stats` | Blog statistics |

#### Project Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List projects (`featured`, `status`, `technology`) |
| GET | `/api/projects/:id` | Get project detail |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| POST | `/api/projects/bulk-delete` | Bulk delete projects |
| GET | `/api/projects/stats` | Project statistics |
| GET | `/api/projects/:id/documents` | List documents for a project |
| POST | `/api/projects/:id/documents` | Upload a document for a project (multipart) |

#### Skills Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/skills` | List skills (`category`, `level`) |
| POST | `/api/skills` | Create a skill |
| PUT | `/api/skills/:id` | Update a skill |
| DELETE | `/api/skills/:id` | Delete a skill |
| POST | `/api/skills/bulk-delete` | Bulk delete skills |

#### Certifications Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/certifications` | List certifications (`issuer`, `status`) |
| POST | `/api/certifications` | Create a certification |
| PUT | `/api/certifications/:id` | Update a certification |
| DELETE | `/api/certifications/:id` | Delete a certification |
| POST | `/api/certifications/bulk-delete` | Bulk delete certifications |

#### Contact Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/contacts` | List contacts (`status`, sorting) — admin |
| GET | `/api/contacts/:id` | Get contact detail — admin |
| PUT | `/api/contacts/:id` | Update status/notes — admin |
| DELETE | `/api/contacts/:id` | Delete a contact — admin |
| POST | `/api/contacts` | **Public** — Submit the contact form. Rate limit: 5 per hour per IP |

#### About Page Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/about` | Get About content |
| PUT | `/api/about` | Update About content — admin |

#### File Upload & Media

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | General file upload (`type`: avatar/project/blog/document) |
| POST | `/api/upload/avatar` | Upload avatar |
| POST | `/api/upload/project-images` | Upload project images |
| POST | `/api/upload/documents` | Upload documents |
| DELETE | `/api/upload/:id` | Delete a file |
| GET | `/api/media` | List media (`type`, `search`) |

#### Dashboard & Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Overview statistics (blogs, projects, contacts, skills, certifications, storage) |
| GET | `/api/dashboard/recent` | Recent activities |

### Rate Limiting

| Endpoint type | Limit |
|---|---|
| Authentication | 5 attempts / 15 minutes / IP |
| Contact Form | 5 submissions / hour / IP |
| File Upload | 20 uploads / hour / user |
| General API | 100 requests / minute / user |
| Bulk Operations | 10 operations / minute / user |

Response headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### File Upload — Limits & Rules

* **Size:** Images max 5MB · Documents max 10MB · Videos max 50MB.
* **Allowed formats:**
  * Images: JPEG, PNG, WebP, GIF, SVG (icons only).
  * Documents: PDF, DOC, DOCX, TXT, MD.
  * Archives: ZIP (for project files).
* **Automatic image processing:** web-optimized compression, thumbnail generation (150x150, 300x300), WebP conversion, EXIF metadata removal for privacy.

---

## 6. Authentication & Technical Security

### JWT Configuration

* Access token: expires after **15 minutes**.
* Refresh token: expires after **7 days**.
* `issuer: 'portfolio-api'`, `audience: 'portfolio-admin'`.

**Authentication flow:**

1. Login with email/password → receive `accessToken` + `refreshToken`.
2. Send `accessToken` in the `Authorization` header on every subsequent request.
3. When the access token expires → use the `refreshToken` to get a new access token via `POST /api/auth/refresh`.
4. Logout → invalidate the token (delete/blacklist the refresh token).

### Authentication Middleware (sample)

```javascript
// middleware/auth.js
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_MISSING', message: 'Access token is required' },
    });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired' },
      });
    }
    return res.status(403).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Invalid access token' },
    });
  }
};
```

### Password Handling

```javascript
const bcrypt = require('bcrypt');
const hashPassword = async password => bcrypt.hash(password, 12); // minimum 12 rounds
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);
```

### Security Headers (helmet + cors)

* Content-Security-Policy restricting `defaultSrc`, `styleSrc`, `imgSrc`, `scriptSrc` to trusted sources only.
* HSTS enabled with `maxAge` of 1 year, including subdomains, with preload.
* CORS allows only origins declared via `CORS_ORIGIN` (comma-separated list), `credentials: true`.

### Input Sanitization

* Sanitize HTML using DOMPurify (whitelist of safe tags: `p, br, strong, em, ul, ol, li, h1-h6`, no attributes allowed).
* Trim and strip `<` `>` characters from raw string input.
* Validate request bodies with a schema (Joi) before processing — return `422 VALIDATION_ERROR` when invalid.

### Other Security Measures

* JWT secrets should be random, sufficiently strong, and stored in environment variables.
* Refresh tokens stored hashed, or as HTTP-only cookies.
* Soft deletes for important data.
* Audit logging for write/update operations on sensitive data.
* Comply with OWASP, GDPR (especially the `contacts` table: allow deletion on request, avoid retaining more data than necessary).

---

## 7. Environment Variables

```bash
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=username
DB_PASSWORD=password

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secure-access-token-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# AWS S3 (if used)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=portfolio-files

# Email Service (for contact forms)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (caching & rate limiting)
REDIS_URL=redis://localhost:6379

# Security
CORS_ORIGIN=http://localhost:3000,https://yourportfolio.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

> **Security note:** Never commit a `.env` file containing real values to git. Use `.env.local` for local development and validate environment variables on application startup.

---

## 8. Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/portfolio
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### Deployment Process

```bash
git pull origin main
npm ci --production
npm run migrate
npm run build
pm2 restart portfolio-api
```

* **Frontend (Next.js):** recommended deployment via **Vercel** (per the MVP plan, Day 7).
* **Backend:** run via **PM2** (cluster mode, leveraging multi-core CPUs).

### Backup

```bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" uploads/

# Keep the last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

---

## 9. Monitoring & Logging

* Use `winston` for structured logging (JSON, with timestamp, error stack).
* Log errors separately (`logs/error.log`) and combined logs (`logs/combined.log`); log to console only outside production.
* **Health check endpoint** (`GET /health`): checks service status + database connection, returns `200` when healthy, `503` on error.
* **Performance monitoring middleware:** records method, URL, status code, response time, user agent, and IP for each request.
* Monitor: request/response logging, error tracking & alerting, performance monitoring, security event logging.

---

## 10. Non-Functional Requirements the Architecture Must Satisfy

* PageSpeed 90+ on both mobile/desktop, FCP < 1.5s.
* Support 1000+ concurrent users; handle up to 500 blogs / 100 projects.
* Sensible caching for static & dynamic content; scale horizontally via serverless architecture when needed.
* HTTPS mandatory across the system.
* Target uptime of 99.9%; have fallback mechanisms in place for errors.
* TypeScript across the entire codebase to ensure type safety.
* API versioning via URL path (`/api/v1/`), maintain backward compatibility, provide deprecation notices for breaking changes.

---

## 11. Source References

This file synthesizes: `api-documentation.md`, `api-implementation-guide.md`, `openapi-spec.yaml`, and the architecture sections of `software_requirements_specification.mdx`.