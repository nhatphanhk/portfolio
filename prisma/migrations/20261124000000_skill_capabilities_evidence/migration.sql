-- Skills become evidence-backed: no 1-5 level, but "what I can do" capabilities, proof
-- (courses, certificates, images, links, PDFs) and a learning journal.
-- Idempotent like the previous migrations (deployed databases may be synced with `db push`).

-- New skill categories for non-work skills
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'SOFT_SKILL';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'FOREIGN_LANGUAGE';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'DESIGN_ART';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'MUSIC';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'SPORTS_HEALTH';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'LIFE_SKILL';
ALTER TYPE "SkillCategory" ADD VALUE IF NOT EXISTS 'BUSINESS';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SkillStatus') THEN
    CREATE TYPE "SkillStatus" AS ENUM ('LEARNING', 'ACHIEVED', 'PAUSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EvidenceType') THEN
    CREATE TYPE "EvidenceType" AS ENUM ('COURSE', 'CERTIFICATE', 'IMAGE', 'LINK', 'DOCUMENT', 'PROJECT');
  END IF;
END $$;

ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "status" "SkillStatus" NOT NULL DEFAULT 'ACHIEVED';
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "achievedAt" TIMESTAMP(3);
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "skills_slug_key" ON "skills"("slug");
CREATE INDEX IF NOT EXISTS "skills_status_idx" ON "skills"("status");

CREATE TABLE IF NOT EXISTS "skill_capabilities" (
  "id" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "statement" TEXT NOT NULL,
  "description" TEXT,
  "achievedAt" TIMESTAMP(3),
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "skill_capabilities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "skill_capabilities_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "skill_capabilities_skillId_idx" ON "skill_capabilities"("skillId");

CREATE TABLE IF NOT EXISTS "skill_evidences" (
  "id" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "capabilityId" TEXT,
  "type" "EvidenceType" NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "fileUrl" TEXT,
  "provider" TEXT,
  "issuedAt" TIMESTAMP(3),
  "description" TEXT,
  "certificationId" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "skill_evidences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "skill_evidences_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "skill_evidences_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "skill_capabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "skill_evidences_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "skill_evidences_skillId_idx" ON "skill_evidences"("skillId");
CREATE INDEX IF NOT EXISTS "skill_evidences_capabilityId_idx" ON "skill_evidences"("capabilityId");
CREATE INDEX IF NOT EXISTS "skill_evidences_certificationId_idx" ON "skill_evidences"("certificationId");

CREATE TABLE IF NOT EXISTS "skill_logs" (
  "id" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "title" TEXT NOT NULL,
  "note" TEXT,
  "hours" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "skill_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "skill_logs_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "skill_logs_skillId_date_idx" ON "skill_logs"("skillId", "date");
