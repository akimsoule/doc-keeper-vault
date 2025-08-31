/*
  Warnings:

  - You are about to drop the column `archived` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."documents" DROP COLUMN "archived",
DROP COLUMN "archivedAt";
