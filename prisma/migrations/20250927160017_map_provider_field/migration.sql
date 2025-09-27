/*
  Warnings:

  - You are about to drop the column `provider` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,userId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Account_provider_providerId_key";

-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "provider";

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_userId_key" ON "public"."Account"("providerId", "userId");
