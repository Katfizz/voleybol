-- DropForeignKey
ALTER TABLE "player_stats" DROP CONSTRAINT "player_stats_player_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_profile_id_fkey" FOREIGN KEY ("player_profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
