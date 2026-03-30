-- AlterTable
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'other';
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "stamp_icon" TEXT DEFAULT 'sparkles';
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "enrollment_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "programs_enrollment_code_key" ON "programs"("enrollment_code");
