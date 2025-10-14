# Portfolio API Documentation

## Overview

This document provides comprehensive API documentation for the Portfolio Admin System. The API supports full CRUD operations for managing blogs, projects, skills, certifications, contacts, and user content through a secure admin interface.

## Base Information

- **Base URL**: `https://your-domain.com/api`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **API Version**: v1

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Pagination](#pagination)
4. [Endpoints](#endpoints)
   - [Authentication & User Management](#authentication--user-management)
   - [Blog Management](#blog-management)
   - [Project Management](#project-management)
   - [Skills Management](#skills-management)
   - [Certifications Management](#certifications-management)
   - [Contact Management](#contact-management)
   - [About Page Management](#about-page-management)
   - [File Upload & Media Management](#file-upload--media-management)
   - [Dashboard & Analytics](#dashboard--analytics)

## Authentication

### JWT Bearer Token Authentication

All admin endpoints require authentication via JWT Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Expiry

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

### Authentication Flow

1. Login with credentials to receive access and refresh tokens
2. Include access token in all subsequent requests
3. Use refresh token to get new access token when expired
4. Logout to invalidate tokens

## Error Handling

### Standard Error Response Format

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

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Common Error Codes

- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token expired
- `VALIDATION_ERROR` - Request validation failed
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_ENTRY` - Resource already exists
- `FILE_TOO_LARGE` - Uploaded file exceeds size limit
- `INVALID_FILE_TYPE` - File type not allowed

## Pagination

### Request Parameters

```
?page=1&limit=10&sort=createdAt&order=desc
```

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order - `asc` or `desc` (default: desc)

### Response Format

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

## Endpoints

## Authentication & User Management

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Logout

```http
POST /api/auth/logout
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Get Current User

```http
GET /api/auth/me
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Update User Profile

```http
PUT /api/auth/me
```

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Refresh Token

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

## Blog Management

### List Blogs

```http
GET /api/blogs?page=1&limit=10&search=keyword&status=published&sort=createdAt&order=desc
```

**Query Parameters:**

- `search` (optional): Search in title and content
- `status` (optional): Filter by status (`draft`, `published`)
- `tags` (optional): Filter by tags (comma-separated)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "blog_id",
      "title": "Blog Title",
      "slug": "blog-title",
      "excerpt": "Blog excerpt...",
      "content": "Full blog content...",
      "status": "published",
      "tags": ["tech", "programming"],
      "featuredImage": "https://example.com/image.jpg",
      "publishedAt": "2025-01-01T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Get Single Blog

```http
GET /api/blogs/:id
```

### Create Blog

```http
POST /api/blogs
```

**Request Body:**

```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "Blog content here...",
  "excerpt": "Short description...",
  "status": "draft",
  "tags": ["tech", "programming"],
  "featuredImage": "https://example.com/image.jpg",
  "publishedAt": "2025-01-01T00:00:00Z"
}
```

### Update Blog

```http
PUT /api/blogs/:id
```

### Delete Blog

```http
DELETE /api/blogs/:id
```

### Bulk Delete Blogs

```http
POST /api/blogs/bulk-delete
```

**Request Body:**

```json
{
  "ids": ["blog_id_1", "blog_id_2", "blog_id_3"]
}
```

### Blog Statistics

```http
GET /api/blogs/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "published": 20,
    "draft": 5,
    "thisMonth": 3,
    "totalViews": 1250
  }
}
```

## Project Management

### List Projects

```http
GET /api/projects?page=1&limit=10&featured=true&status=active
```

**Query Parameters:**

- `featured` (optional): Filter featured projects
- `status` (optional): Filter by status (`active`, `archived`)
- `technology` (optional): Filter by technology

### Get Single Project

```http
GET /api/projects/:id
```

### Create Project

```http
POST /api/projects
```

**Request Body:**

```json
{
  "title": "Project Name",
  "description": "Project description...",
  "technologies": ["React", "Node.js", "MongoDB"],
  "liveUrl": "https://project-live-url.com",
  "githubUrl": "https://github.com/user/project",
  "images": ["https://example.com/image1.jpg"],
  "featured": false,
  "status": "active",
  "startDate": "2025-01-01",
  "endDate": "2025-02-01"
}
```

### Update Project

```http
PUT /api/projects/:id
```

### Delete Project

```http
DELETE /api/projects/:id
```

### Bulk Delete Projects

```http
POST /api/projects/bulk-delete
```

### Project Statistics

```http
GET /api/projects/stats
```

### Get Project Documents

```http
GET /api/projects/:id/documents
```

### Upload Project Document

```http
POST /api/projects/:id/documents
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: Document file
- `title`: Document title
- `description`: Document description

## Skills Management

### List Skills

```http
GET /api/skills?category=technical&level=expert
```

**Query Parameters:**

- `category` (optional): Filter by category
- `level` (optional): Filter by proficiency level

### Create Skill

```http
POST /api/skills
```

**Request Body:**

```json
{
  "name": "React.js",
  "category": "Frontend",
  "level": "expert",
  "yearsOfExperience": 3,
  "description": "Advanced React development...",
  "icon": "https://example.com/react-icon.svg"
}
```

### Update Skill

```http
PUT /api/skills/:id
```

### Delete Skill

```http
DELETE /api/skills/:id
```

### Bulk Delete Skills

```http
POST /api/skills/bulk-delete
```

## Certifications Management

### List Certifications

```http
GET /api/certifications?issuer=AWS&status=active
```

### Create Certification

```http
POST /api/certifications
```

**Request Body:**

```json
{
  "name": "AWS Certified Developer",
  "issuer": "Amazon Web Services",
  "issueDate": "2025-01-01",
  "expiryDate": "2028-01-01",
  "credentialId": "AWS-CERT-123",
  "credentialUrl": "https://aws.amazon.com/certification/verify",
  "description": "Certification description...",
  "logo": "https://example.com/aws-logo.png"
}
```

### Update Certification

```http
PUT /api/certifications/:id
```

### Delete Certification

```http
DELETE /api/certifications/:id
```

### Bulk Delete Certifications

```http
POST /api/certifications/bulk-delete
```

## Contact Management

### List Contacts

```http
GET /api/contacts?status=unread&sort=createdAt&order=desc
```

**Query Parameters:**

- `status` (optional): Filter by status (`read`, `unread`, `replied`)

### Get Single Contact

```http
GET /api/contacts/:id
```

### Update Contact Status

```http
PUT /api/contacts/:id
```

**Request Body:**

```json
{
  "status": "read",
  "notes": "Internal notes about this contact"
}
```

### Delete Contact

```http
DELETE /api/contacts/:id
```

### Submit Contact Form (Public Endpoint)

```http
POST /api/contacts
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'm interested in working with you...",
  "company": "Company Name (optional)",
  "phone": "+1234567890 (optional)"
}
```

**Rate Limit:** 5 submissions per hour per IP address

## About Page Management

### Get About Content

```http
GET /api/about
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bio": "Personal bio content...",
    "skills": ["Skill 1", "Skill 2"],
    "experience": "Experience description...",
    "education": "Education background...",
    "profileImage": "https://example.com/profile.jpg",
    "resume": "https://example.com/resume.pdf",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/username",
      "github": "https://github.com/username",
      "twitter": "https://twitter.com/username"
    }
  }
}
```

### Update About Content

```http
PUT /api/about
```

## File Upload & Media Management

### General File Upload

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: File to upload
- `type` (optional): File type context (`avatar`, `project`, `blog`, `document`)
- `alt` (optional): Alt text for images

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "file_id",
    "filename": "generated-filename.jpg",
    "originalName": "original-filename.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://cdn.example.com/files/generated-filename.jpg",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/generated-filename.jpg"
  }
}
```

### Upload Avatar

```http
POST /api/upload/avatar
Content-Type: multipart/form-data
```

### Upload Project Images

```http
POST /api/upload/project-images
Content-Type: multipart/form-data
```

### Upload Documents

```http
POST /api/upload/documents
Content-Type: multipart/form-data
```

### Delete File

```http
DELETE /api/upload/:id
```

### List Media Files

```http
GET /api/media?type=image&page=1&limit=20
```

**Query Parameters:**

- `type` (optional): Filter by file type (`image`, `document`, `video`)
- `search` (optional): Search in filename

## Dashboard & Analytics

### Dashboard Statistics

```http
GET /api/dashboard/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "blogs": {
      "total": 25,
      "published": 20,
      "draft": 5
    },
    "projects": {
      "total": 15,
      "active": 12,
      "featured": 5
    },
    "contacts": {
      "total": 50,
      "unread": 5,
      "thisMonth": 8
    },
    "skills": {
      "total": 20
    },
    "certifications": {
      "total": 8,
      "active": 6
    },
    "storage": {
      "used": "1.2 GB",
      "total": "10 GB",
      "percentage": 12
    }
  }
}
```

### Recent Activities

```http
GET /api/dashboard/recent?limit=10
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "activity_id",
      "type": "blog_created",
      "description": "New blog post 'Getting Started with React' created",
      "resourceId": "blog_id",
      "resourceType": "blog",
      "createdAt": "2025-10-13T10:30:00Z"
    }
  ]
}
```

## Rate Limiting

### Rate Limits by Endpoint Type

- **Authentication**: 5 attempts per 15 minutes per IP
- **Contact Form**: 5 submissions per hour per IP
- **File Upload**: 20 uploads per hour per user
- **General API**: 100 requests per minute per user
- **Bulk Operations**: 10 operations per minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## File Upload Specifications

### File Size Limits

- **Images**: 5 MB maximum
- **Documents**: 10 MB maximum
- **Videos**: 50 MB maximum

### Allowed File Types

**Images:**

- JPEG, PNG, WebP, GIF
- SVG (for icons only)

**Documents:**

- PDF, DOC, DOCX
- TXT, MD

**Archives:**

- ZIP (for project files)

### Image Processing

- Automatic compression for web optimization
- Thumbnail generation (150x150, 300x300)
- WebP conversion for modern browsers
- EXIF data removal for privacy

## Security Considerations

### Authentication Security

- JWT tokens with secure random secrets
- Token rotation on refresh
- Secure HTTP-only cookies for refresh tokens
- Password hashing with bcrypt (minimum 12 rounds)

### Input Validation

- All inputs sanitized against XSS attacks
- SQL injection prevention through parameterized queries
- File upload validation (type, size, content)
- Rate limiting to prevent abuse

### Data Privacy

- GDPR compliance for contact forms
- Data retention policies
- Secure file storage with access controls
- Regular security audits

## Development Guidelines

### API Versioning

- Version in URL path: `/api/v1/`
- Maintain backward compatibility
- Deprecation notices with migration timeline

### Response Consistency

- Always use consistent response format
- Include success/error status
- Provide meaningful error messages
- Use appropriate HTTP status codes

### Database Considerations

- Use database transactions for multi-step operations
- Implement soft deletes for important data
- Regular backups and disaster recovery
- Database indexing for performance

### Monitoring & Logging

- Request/response logging
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Testing

### API Testing Checklist

- [ ] Unit tests for all endpoints
- [ ] Integration tests for complete workflows
- [ ] Load testing for performance validation
- [ ] Security testing for vulnerabilities
- [ ] Error handling validation
- [ ] Rate limiting verification

### Test Data Requirements

- Sample data for all resource types
- Test file uploads of various types and sizes
- Authentication test scenarios
- Edge case validation

---

**Last Updated**: October 13, 2025  
**API Version**: v1.0.0  
**Contact**: admin@yourportfolio.com
