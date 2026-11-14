-- Tables that were added to schema.prisma after the previous migration (blog view tracking
-- and AI content translations). Written idempotently, like the previous migration, because
-- deployed databases synced with `prisma db push` already contain them and
-- `prisma migrate deploy` must still succeed there.

-- CreateTable
CREATE TABLE IF NOT EXISTS "blog_views" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "content_translations" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "excerpt" TEXT,
    "content" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_views_blogId_idx" ON "blog_views"("blogId");
CREATE INDEX IF NOT EXISTS "blog_views_identifier_idx" ON "blog_views"("identifier");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_views_blogId_identifier_key" ON "blog_views"("blogId", "identifier");
CREATE INDEX IF NOT EXISTS "content_translations_entityType_entityId_locale_idx" ON "content_translations"("entityType", "entityId", "locale");
CREATE UNIQUE INDEX IF NOT EXISTS "content_translations_entityType_entityId_locale_key" ON "content_translations"("entityType", "entityId", "locale");

-- AddForeignKey (ADD CONSTRAINT has no IF NOT EXISTS, so guard it)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blog_views_blogId_fkey') THEN
    ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_blogId_fkey"
      FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
