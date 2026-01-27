import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, BarChart2 } from "lucide-react";
import { toast } from "sonner";

import { matchService } from '../services/match.service';
import { eventService } from '../services/event.service';
import { statisticService } from '../services/statistic.service';
import { useAuth } from '../context/AuthContext';
import { type Match } from '../types/match.types';
import { type Statistic, type CreateStatisticDTO } from '../types/statistic.types';
import { type User } from '../types/user.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MatchStatsTable } from '../components/matches/MatchStatsTable';
import { MatchStatisticsDialog } from '../components/matches/MatchStatisticsDialog';

export default function MatchDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [match, setMatch] = useState<Match | null>(null);
    const [stats, setStats] = useState<Statistic[]>([]);
    const [homePlayers, setHomePlayers] = useState<User[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<User[]>([]);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdminOrCoach = user?.role === 'ADMIN' || user?.role === 'COACH';

    const loadData = useCallback(async (matchId: number) => {
        try {
            const [matchData, statsData] = await Promise.all([
                matchService.getById(matchId),
                statisticService.getByMatch(matchId)
            ]);
            setMatch(matchData);
            setStats(statsData);

            // Cargar jugadores del evento para el formulario
            if (matchData.event_id) {
                const eventData = await eventService.getById(matchData.event_id);
                if (eventData.categories) {
                    // Filtrar jugadores por categoría (equipo)
                    const homeCat = eventData.categories.find(c => c.id === matchData.home_category_id);
                    const awayCat = eventData.categories.find(c => c.id === matchData.away_category_id);

                    // Extraer usuarios de los perfiles
                    if (homeCat && homeCat.playerProfiles) {
                        setHomePlayers(homeCat.playerProfiles.map(p => ({ id: p.id, profile: p }) as unknown as User));
                    }
                    if (awayCat && awayCat.playerProfiles) {
                        setAwayPlayers(awayCat.playerProfiles.map(p => ({ id: p.id, profile: p }) as unknown as User));
                    }
                }
            }
        } catch {
            toast.error('Error al cargar el partido');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id, loadData]);

    const handleSaveStats = async (data: CreateStatisticDTO) => {
        if (!match) return;
        try {
            await statisticService.record(match.id, data);
            toast.success("Estadísticas guardadas");
            loadData(match.id);
        } catch {
            toast.error("Error al guardar estadísticas");
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando detalles del partido...</div>;
    if (!match) return null;

    const isWinner = (categoryId: number) => match.winner_category_id === categoryId;
    const homeStats = stats.filter(s => homePlayers.some(p => p.id === s.player_profile_id));
    const awayStats = stats.filter(s => awayPlayers.some(p => p.id === s.player_profile_id));

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                {isAdminOrCoach && (
                    <Button onClick={() => setIsStatsOpen(true)}>
                        <BarChart2 className="mr-2 h-4 w-4" /> Gestionar Estadísticas
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="text-center border-b bg-muted/10 pb-8">
                    <CardDescription className="mb-2 uppercase tracking-widest text-xs font-bold">Resultado Final</CardDescription>
                    <div className="grid grid-cols-3 items-center gap-2 md:gap-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-end text-right min-w-0">
                            <CardTitle className={cn("text-xl md:text-2xl mb-2 truncate w-full", isWinner(match.home_category_id) && "text-primary")} title={match.homeCategory?.name}>
                                {match.homeCategory?.name}
                            </CardTitle>
                            {isWinner(match.home_category_id) && <Badge variant="secondary" className="whitespace-nowrap"><Trophy className="h-3 w-3 mr-1" /> Ganador</Badge>}
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-xl p-3 md:p-4 border border-primary/20">
                            <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter leading-none">
                                {match.home_sets_won} - {match.away_sets_won}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">SETS</span>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-start text-left min-w-0">
                            <CardTitle className={cn("text-xl md:text-2xl mb-2 truncate w-full", isWinner(match.away_category_id) && "text-primary")} title={match.awayCategory?.name}>
                                {match.awayCategory?.name}
                            </CardTitle>
                            {isWinner(match.away_category_id) && <Badge variant="secondary" className="whitespace-nowrap"><Trophy className="h-3 w-3 mr-1" /> Ganador</Badge>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <h3 className="text-lg font-semibold mb-4 text-center">Detalle de Sets</h3>
                    <div className="space-y-2 max-w-md mx-auto max-h-[300px] overflow-y-auto pr-2">
                        {match.sets && match.sets.length > 0 ? (
                            match.sets.map((set) => (
                                <div key={set.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                                    <span className="font-bold text-muted-foreground w-12">Set {set.set_number}</span>
                                    <span className="font-mono text-lg font-medium">{set.home_score} - {set.away_score}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground italic">No hay sets registrados.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sección de Estadísticas */}
            <div className="mt-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" /> Estadísticas del Partido
                </h3>
                <MatchStatsTable stats={homeStats} teamName={match.homeCategory?.name || "Local"} />
                <MatchStatsTable stats={awayStats} teamName={match.awayCategory?.name || "Visitante"} />
            </div>

            <MatchStatisticsDialog
                open={isStatsOpen}
                onOpenChange={setIsStatsOpen}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
                homeTeamName={match.homeCategory?.name || "Local"}
                awayTeamName={match.awayCategory?.name || "Visitante"}
                existingStats={stats}
                onSubmit={handleSaveStats}
            />
        </div>
    );
}