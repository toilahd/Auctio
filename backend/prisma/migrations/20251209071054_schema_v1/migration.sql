/*
  Warnings:

  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_parentId_idx";

-- DropIndex
DROP INDEX "Category_slug_idx";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "slug";
