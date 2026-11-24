-- First-party page-view tracking (no cookies, no raw IP; see PageView in schema.prisma).
-- Idempotent like the previous migrations (deployed databases may be synced with `db push`).

CREATE TABLE IF NOT EXISTS "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrerHost" TEXT,
    "country" TEXT,
    "device" TEXT NOT NULL,
    "browser" TEXT,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "page_views_createdAt_idx" ON "page_views"("createdAt");
CREATE INDEX IF NOT EXISTS "page_views_path_createdAt_idx" ON "page_views"("path", "createdAt");
