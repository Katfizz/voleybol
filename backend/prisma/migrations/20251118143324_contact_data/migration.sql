/*
  Warnings:

  - You are about to drop the column `contact_info` on the `player_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "player_profiles" DROP COLUMN "contact_info",
ADD COLUMN     "contact_data" JSONB,
ADD COLUMN     "representative_data" JSONB;
