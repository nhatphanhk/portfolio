-- Run this SQL in your database (e.g. Supabase SQL Editor, Neon Console, or psql)
-- to fix the ColumnNotFound (seriesId) and TableDoesNotExist (blog_series, site_content) errors.

-- 1. Alter Enum SkillCategory
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'LANGUAGE';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'FRAMEWORK';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'DATABASE';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'CLOUD';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'IAC';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'MONITORING';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'VERSION_CONTROL';

-- 2. Alter blogs table
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "seriesId" TEXT;
ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "seriesOrder" INTEGER DEFAULT 0;

-- 3. Alter experiences table
ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "achievements" TEXT;
ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "techStack" TEXT;

-- 4. Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "bio" TEXT,
    "bio2" TEXT,
    "location" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "resumeUrl" TEXT,
    "avatarUrl" TEXT,
    "careerObjective" TEXT,
    "softSkills" TEXT,
    "interests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- 5. Create education table
CREATE TABLE IF NOT EXISTS "education" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "gpa" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- 6. Create achievements table
CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- 7. Create spoken_languages table
CREATE TABLE IF NOT EXISTS "spoken_languages" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spoken_languages_pkey" PRIMARY KEY ("id")
);

-- 8. Create activities table
CREATE TABLE IF NOT EXISTS "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- 9. Create blog_series table
CREATE TABLE IF NOT EXISTS "blog_series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_series_pkey" PRIMARY KEY ("id")
);

-- 10. Create site_content table
CREATE TABLE IF NOT EXISTS "site_content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "label" TEXT,
    "grp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- 11. Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "blog_series_slug_key" ON "blog_series"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "site_content_key_key" ON "site_content"("key");

-- 12. Add foreign key relation
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blogs_seriesId_fkey') THEN
        ALTER TABLE "blogs" ADD CONSTRAINT "blogs_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "blog_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
