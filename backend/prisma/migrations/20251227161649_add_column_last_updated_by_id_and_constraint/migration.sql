-- AlterTable
ALTER TABLE "player_stats" ADD COLUMN     "last_updated_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
