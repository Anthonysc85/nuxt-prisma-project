/*
  Warnings:

  - You are about to drop the column `providerId` on the `Account` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "providerId",
ADD COLUMN     "provider" TEXT NOT NULL;
