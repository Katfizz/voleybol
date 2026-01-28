import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Activity, TrendingUp, TrendingDown, UserCog, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '../context/AuthContext';

import { categoryService } from '../services/category.service';
import { matchService } from '../services/match.service';
import { type Category } from '../types/category.types';
import { type Match } from '../types/match.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MatchCard } from '../components/matches/MatchCard';
import { TeamPerformanceChart } from '../components/categories/TeamPerformanceChart';

export default function CategoryDetailsPage() {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isAdminOrCoach = user?.role === 'ADMIN' || user?.role === 'COACH';
    const [category, setCategory] = useState<Category | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async (categoryId: number) => {
        try {
            const [catData, allMatches] = await Promise.all([
                categoryService.getById(categoryId),
                matchService.getAll()
            ]);
            setCategory(catData);

            // Filtrar partidos donde participa este equipo
            const teamMatches = allMatches.filter((m: Match) =>
                m.home_category_id === categoryId || m.away_category_id === categoryId
            );

            // Obtener detalles completos (incluyendo sets) para los partidos filtrados
            const detailedMatches = await Promise.all(
                teamMatches.map((m: Match) => matchService.getById(m.id))
            );
            setMatches(detailedMatches);
        } catch {
            toast.error('Error al cargar los detalles del equipo');
            navigate('/categories');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id, loadData]);

    const stats = useMemo(() => {
        if (!category) return { played: 0, wins: 0, losses: 0, winRate: 0, pastMatches: [] };

        const now = new Date();
        const pastMatches = matches.filter(m => m.event?.date_time && new Date(m.event.date_time) < now);

        const played = pastMatches.length;
        const wins = pastMatches.filter(m => m.winner_category_id === category.id).length;
        const losses = pastMatches.filter(m => m.winner_category_id && m.winner_category_id !== category.id).length;
        const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;

        return { played, wins, losses, winRate, pastMatches };
    }, [matches, category]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return <div className="p-8 text-center">Cargando equipo...</div>;
    if (!category) return null;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/categories')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a equipos
            </Button>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-primary flex items-start gap-2" title={category.name}>
                        <Trophy className="h-8 w-8 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 break-words">{category.name}</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 line-clamp-2 break-words">{category.description || "Sin descripción"}</p>
                </div>
                {isAdminOrCoach && (
                    <Button variant="outline" onClick={() => navigate(`/reports/attendance`)} className="gap-2">
                        <BarChart2 className="h-4 w-4" /> Reporte de Asistencia
                    </Button>
                )}
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid gap-4 md:grid-cols-7 mb-8">
                {/* Columna Izquierda: Tarjetas Numéricas */}
                <div className="md:col-span-4 grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partidos</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.played}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Victorias</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Derrotas</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Efectividad</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.winRate}%</div>
                            <p className="text-xs text-muted-foreground">de victorias</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Columna Derecha: Gráfico */}
                <div className="md:col-span-3">
                    <TeamPerformanceChart matches={stats.pastMatches} categoryId={category.id} />
                </div>
            </div>

            <Tabs defaultValue="roster" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="roster">Plantilla</TabsTrigger>
                    <TabsTrigger value="matches">Partidos</TabsTrigger>
                </TabsList>

                <TabsContent value="roster" className="mt-6 space-y-6">
                    {category.coaches && category.coaches.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCog className="h-5 w-5" /> Entrenadores
                                </CardTitle>
                                <CardDescription>Cuerpo técnico asignado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.coaches.map((coach) => (
                                        <div
                                            key={coach.id}
                                            className="flex items-center space-x-4 p-4 border rounded-lg"
                                        >
                                            <Avatar>
                                                <AvatarFallback>{getInitials(coach.profile?.full_name || coach.email)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{coach.profile?.full_name || coach.email}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Entrenador</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" /> Jugadores
                            </CardTitle>
                            <CardDescription>Lista de jugadores registrados en esta categoría.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {category.playerProfiles && category.playerProfiles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.playerProfiles.map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => {
                                                const userId = player.user?.id || player.userId;
                                                if (userId) navigate(`/players/${userId}`);
                                            }}
                                        >
                                            <Avatar>
                                                <AvatarImage src="" />
                                                <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{player.full_name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{player.position || "Sin posición"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay jugadores asignados a este equipo.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="matches" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.length > 0 ? (
                            matches.map(match => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                Este equipo aún no ha jugado partidos.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}