/*
  Warnings:

  - You are about to drop the `statistics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'TOURNAMENT';

-- DropForeignKey
ALTER TABLE "statistics" DROP CONSTRAINT "statistics_event_id_fkey";

-- DropForeignKey
ALTER TABLE "statistics" DROP CONSTRAINT "statistics_player_profile_id_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "statistics";

-- CreateTable
CREATE TABLE "player_stats" (
    "id" SERIAL NOT NULL,
    "player_profile_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "aces" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "digs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practices" (
    "event_id" INTEGER NOT NULL,
    "objective" TEXT,
    "notes" TEXT,
    "drills" JSONB,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "home_category_id" INTEGER NOT NULL,
    "away_category_id" INTEGER NOT NULL,
    "home_sets_won" INTEGER NOT NULL DEFAULT 0,
    "away_sets_won" INTEGER NOT NULL DEFAULT 0,
    "winner_category_id" INTEGER,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "set_number" INTEGER NOT NULL,
    "home_score" INTEGER NOT NULL,
    "away_score" INTEGER NOT NULL,
    "winner_category_id" INTEGER,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_player_profile_id_match_id_key" ON "player_stats"("player_profile_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "sets_match_id_set_number_key" ON "sets"("match_id", "set_number");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToCategory_AB_unique" ON "_EventToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToCategory_B_index" ON "_EventToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "events_name_key" ON "events"("name");

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_profile_id_fkey" FOREIGN KEY ("player_profile_id") REFERENCES "player_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_category_id_fkey" FOREIGN KEY ("home_category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_category_id_fkey" FOREIGN KEY ("away_category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_category_id_fkey" FOREIGN KEY ("winner_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_winner_category_id_fkey" FOREIGN KEY ("winner_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToCategory" ADD CONSTRAINT "_EventToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToCategory" ADD CONSTRAINT "_EventToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
