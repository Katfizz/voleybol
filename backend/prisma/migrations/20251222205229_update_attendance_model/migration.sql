/*
  Warnings:

  - A unique constraint covering the columns `[player_profile_id,event_id,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "attendances_player_profile_id_event_id_key";

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "attendances_player_profile_id_event_id_date_key" ON "attendances"("player_profile_id", "event_id", "date");
