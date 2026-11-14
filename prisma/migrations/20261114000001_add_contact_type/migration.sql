-- Contacts and visitor-gate logs were told apart by the magic subject 'Visitor Log', which a
-- real sender could type. A dedicated enum column makes the distinction explicit.
-- Idempotent like the previous migrations (deployed databases may be synced with `db push`).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContactType') THEN
    CREATE TYPE "ContactType" AS ENUM ('MESSAGE', 'VISITOR_LOG');
  END IF;
END $$;

ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "type" "ContactType" NOT NULL DEFAULT 'MESSAGE';

-- Backfill rows written by /api/visitor before the column existed
UPDATE "contacts" SET "type" = 'VISITOR_LOG' WHERE "subject" = 'Visitor Log' AND "type" = 'MESSAGE';

CREATE INDEX IF NOT EXISTS "contacts_type_idx" ON "contacts"("type");
