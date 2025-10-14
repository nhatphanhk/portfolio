# Portfolio API Implementation Guide

## Overview

This guide provides detailed implementation instructions for building the Portfolio Admin API, including database schema, middleware setup, security configurations, and deployment considerations.

## Table of Contents

1. [Tech Stack Recommendations](#tech-stack-recommendations)
2. [Database Schema](#database-schema)
3. [Project Structure](#project-structure)
4. [Authentication Implementation](#authentication-implementation)
5. [Middleware Setup](#middleware-setup)
6. [File Upload Configuration](#file-upload-configuration)
7. [Environment Configuration](#environment-configuration)
8. [Security Best Practices](#security-best-practices)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)
11. [Monitoring & Logging](#monitoring--logging)

## Tech Stack Recommendations

### Backend Framework

- **Node.js + Express.js** - Fast, lightweight, great ecosystem
- **Next.js API Routes** - If integrating with existing Next.js frontend
- **NestJS** - For larger applications requiring more structure

### Database

- **PostgreSQL** - Recommended for production (ACID compliance, JSON support)
- **MongoDB** - Alternative for document-based data
- **SQLite** - For development/testing

### Authentication

- **JWT** with **refresh tokens**
- **bcrypt** for password hashing
- **express-rate-limit** for rate limiting

### File Storage

- **AWS S3** / **Cloudflare R2** - Production file storage
- **Multer** - File upload middleware
- **Sharp** - Image processing

### Validation & Security

- **Joi** or **Yup** - Request validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-validator** - Input sanitization

## Database Schema

### PostgreSQL Schema

```sql
-- Users table
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

-- Blogs table
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

-- Projects table
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

-- Skills table
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

-- Certifications table
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

-- Contacts table
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

-- Documents table (for project files)
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

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files table
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

-- Indexes for performance
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

## Project Structure

```
src/
├── controllers/           # Route handlers
│   ├── authController.js
│   ├── blogController.js
│   ├── projectController.js
│   ├── skillController.js
│   ├── certificationController.js
│   ├── contactController.js
│   ├── uploadController.js
│   └── dashboardController.js
├── middleware/           # Custom middleware
│   ├── auth.js          # JWT authentication
│   ├── validation.js    # Request validation
│   ├── rateLimit.js     # Rate limiting
│   ├── upload.js        # File upload handling
│   └── errorHandler.js  # Error handling
├── models/              # Database models
│   ├── User.js
│   ├── Blog.js
│   ├── Project.js
│   ├── Skill.js
│   ├── Certification.js
│   ├── Contact.js
│   └── Document.js
├── routes/              # API routes
│   ├── auth.js
│   ├── blogs.js
│   ├── projects.js
│   ├── skills.js
│   ├── certifications.js
│   ├── contacts.js
│   ├── upload.js
│   └── dashboard.js
├── services/            # Business logic
│   ├── authService.js
│   ├── emailService.js
│   ├── fileService.js
│   └── notificationService.js
├── utils/               # Utility functions
│   ├── database.js
│   ├── jwt.js
│   ├── validation.js
│   ├── fileUtils.js
│   └── helpers.js
├── config/              # Configuration
│   ├── database.js
│   ├── jwt.js
│   ├── upload.js
│   └── cors.js
└── tests/               # Test files
    ├── auth.test.js
    ├── blogs.test.js
    └── projects.test.js
```

## Authentication Implementation

### JWT Configuration

```javascript
// config/jwt.js
module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'portfolio-api',
  audience: 'portfolio-admin',
};
```

### Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_MISSING',
        message: 'Access token is required',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
        },
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid access token',
      },
    });
  }
};

module.exports = { authenticateToken };
```

### Password Hashing

```javascript
// utils/auth.js
const bcrypt = require('bcrypt');

const hashPassword = async password => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

## Middleware Setup

### Rate Limiting

```javascript
// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

const contactLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // 5 submissions
  'Too many contact submissions, please try again later'
);

const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // 20 uploads
  'Too many file uploads, please try again later'
);

module.exports = { authLimiter, contactLimiter, uploadLimiter };
```

### Request Validation

```javascript
// middleware/validation.js
const Joi = require('joi');

const validateRequest = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
          details: error.details,
        },
      });
    }
    next();
  };
};

// Validation schemas
const blogSchema = Joi.object({
  title: Joi.string().required().max(255),
  slug: Joi.string()
    .required()
    .max(255)
    .pattern(/^[a-z0-9-]+$/),
  content: Joi.string().required(),
  excerpt: Joi.string().max(500),
  status: Joi.string().valid('draft', 'published').default('draft'),
  tags: Joi.array().items(Joi.string()),
  featuredImage: Joi.string().uri(),
  publishedAt: Joi.date().iso(),
});

module.exports = { validateRequest, blogSchema };
```

### Error Handling

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
    timestamp: new Date().toISOString(),
  };

  // Specific error types
  if (err.name === 'ValidationError') {
    error.error.code = 'VALIDATION_ERROR';
    error.error.message = err.message;
    return res.status(422).json(error);
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    error.error.code = 'DUPLICATE_ENTRY';
    error.error.message = 'Resource already exists';
    return res.status(409).json(error);
  }

  if (err.name === 'MulterError') {
    error.error.code = 'FILE_UPLOAD_ERROR';
    error.error.message = err.message;
    return res.status(400).json(error);
  }

  res.status(500).json(error);
};

module.exports = errorHandler;
```

## File Upload Configuration

### Multer Setup

```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    archive: ['application/zip'],
  };

  const fileType = req.body.type || 'image';
  const allowed = allowedMimes[fileType] || allowedMimes.image;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Allowed types: ${allowed.join(', ')}`),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 files per request
  },
});

module.exports = upload;
```

### Image Processing

```javascript
// services/fileService.js
const sharp = require('sharp');
const path = require('path');

const processImage = async (inputPath, outputPath, options = {}) => {
  const { width = 800, height = 600, quality = 80, format = 'webp' } = options;

  await sharp(inputPath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toFile(outputPath);

  return outputPath;
};

const createThumbnail = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize(150, 150, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 70 })
    .toFile(outputPath);

  return outputPath;
};

module.exports = { processImage, createThumbnail };
```

## Environment Configuration

### Environment Variables

```bash
# .env
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

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=portfolio-files

# Email Service (for contact forms)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for caching and rate limiting)
REDIS_URL=redis://localhost:6379

# Security
CORS_ORIGIN=http://localhost:3000,https://yourportfolio.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Configuration Files

```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

## Security Best Practices

### Security Headers

```javascript
// app.js
const helmet = require('helmet');
const cors = require('cors');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

### Input Sanitization

```javascript
// utils/sanitization.js
const DOMPurify = require('isomorphic-dompurify');

const sanitizeHtml = html => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: [],
  });
};

const sanitizeString = str => {
  return str.trim().replace(/[<>]/g, '');
};

module.exports = { sanitizeHtml, sanitizeString };
```

## Testing Strategy

### Test Configuration

```javascript
// tests/setup.js
const { Pool } = require('pg');

const testDb = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: false,
});

beforeAll(async () => {
  // Create test database schema
  await testDb.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  // Run migrations
});

afterAll(async () => {
  await testDb.end();
});

beforeEach(async () => {
  // Clean test data
  await testDb.query('TRUNCATE TABLE users, blogs, projects CASCADE');
});

module.exports = testDb;
```

### Sample Tests

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  test('POST /api/auth/login - valid credentials', async () => {
    const userData = {
      email: 'admin@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(userData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe(userData.email);
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
```

## Deployment Guide

### Docker Configuration

```dockerfile
# Dockerfile
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

### Production Deployment

```bash
# deployment/deploy.sh
#!/bin/bash

# Build and deploy script
echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Run database migrations
npm run migrate

# Build application (if applicable)
npm run build

# Restart service
pm2 restart portfolio-api

echo "Deployment completed!"
```

### PM2 Configuration

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'portfolio-api',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## Monitoring & Logging

### Logging Configuration

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'portfolio-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

### Health Check Endpoint

```javascript
// routes/health.js
const express = require('express');
const pool = require('../config/database');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
    },
  };

  try {
    await pool.query('SELECT 1');
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

### Performance Monitoring

```javascript
// middleware/monitoring.js
const responseTime = require('response-time');
const logger = require('../utils/logger');

const performanceMonitoring = responseTime((req, res, time) => {
  logger.info('Request processed', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${time.toFixed(2)}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
});

module.exports = performanceMonitoring;
```

## Additional Considerations

### Database Migrations

```javascript
// migrations/001_initial_schema.js
exports.up = async client => {
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      -- ... rest of schema
    );
  `);
};

exports.down = async client => {
  await client.query(`
    DROP TABLE IF EXISTS users CASCADE;
  `);
};
```

### Backup Strategy

```bash
#!/bin/bash
# backup/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"

# File backup
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" uploads/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

This implementation guide provides a complete foundation for building your portfolio API with production-ready practices, security measures, and scalability considerations.

---

**Last Updated**: October 13, 2025  
**Guide Version**: 1.0.0
