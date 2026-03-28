/*
  Warnings:

  - You are about to drop the column `is_easy_apply` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "availability_status" TEXT NOT NULL DEFAULT 'available',
ADD COLUMN     "categories_of_interest" TEXT,
ADD COLUMN     "graduation_year" INTEGER,
ADD COLUMN     "major" TEXT;

-- AlterTable
ALTER TABLE "student_skills" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "ai_match_score" DOUBLE PRECISION,
ADD COLUMN     "estimated_delivery_days" INTEGER,
ADD COLUMN     "proposed_budget" TEXT;

-- AlterTable
ALTER TABLE "task_skills" ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "years_of_experience" INTEGER;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "is_easy_apply",
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "certificate_issuer" TEXT,
ADD COLUMN     "certificate_name" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "experience_level" TEXT,
ADD COLUMN     "internship_department" TEXT,
ADD COLUMN     "internship_duration" TEXT,
ADD COLUMN     "internship_is_paid" TEXT,
ADD COLUMN     "positions" INTEGER,
ADD COLUMN     "preferred_major" TEXT,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "work_type" TEXT;
