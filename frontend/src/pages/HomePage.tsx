import { useEffect, useState, useCallback } from 'react';
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcement.service';
import { categoryService } from '../services/category.service';
import { matchService } from '../services/match.service';
import { profileService } from '../services/profile.service';
import { type Announcement, type CreateAnnouncementDTO } from '../types/announcement.types';
import { type Category } from '../types/category.types';
import { type Match } from '../types/match.types';
import { type User } from '../types/user.types';
import { Button } from "@/components/ui/button";
import { CreateAnnouncementDialog } from '../components/announcements/CreateAnnouncementDialog';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TopTeamsCarousel } from '../components/dashboard/TopTeamsCarousel';
import { RecentMatchesCard } from '../components/dashboard/RecentMatchesCard';
import { AnnouncementsCarousel } from '../components/dashboard/AnnouncementsCarousel';
import { PlayerProfileSummary } from '../components/dashboard/PlayerProfileSummary';

interface TopTeam extends Category {
    stats: {
        wins: number;
        losses: number;
        winRate: number;
    };
}

export default function HomePage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [topTeams, setTopTeams] = useState<TopTeam[]>([]);
    const [recentMatches, setRecentMatches] = useState<Match[]>([]);
    const [playerData, setPlayerData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const canManage = user?.role === 'ADMIN' || user?.role === 'COACH';
    const isPlayer = user?.role === 'PLAYER';

    const loadDashboardData = useCallback(async () => {
        try {
            const announcementsPromise = announcementService.getActive();
            const categoriesPromise = categoryService.getAll();
            const matchesPromise = matchService.getAll();
            const profilePromise = user?.role === 'PLAYER' ? profileService.getProfile() : Promise.resolve(null);

            const [announcementsData, categoriesData, matchesData, profileResult] = await Promise.all([
                announcementsPromise,
                categoriesPromise,
                matchesPromise,
                profilePromise
            ]);

            if (profileResult) {
                setPlayerData(profileResult);
            }

            setAnnouncements(announcementsData);

            // Procesar Top Teams (Lógica simple en frontend por ahora)
            const teamsWithStats = categoriesData.map(cat => {
                const teamMatches = matchesData.filter(m => m.home_category_id === cat.id || m.away_category_id === cat.id);
                const wins = teamMatches.filter(m => m.winner_category_id === cat.id).length;
                const losses = teamMatches.length - wins;
                const winRate = teamMatches.length > 0 ? Math.round((wins / teamMatches.length) * 100) : 0;
                return { ...cat, stats: { wins, losses, winRate } };
            });
            
            // Ordenar por victorias y tomar los top 3
            const sortedTeams = teamsWithStats.sort((a, b) => b.stats.wins - a.stats.wins).slice(0, 3);
            setTopTeams(sortedTeams);

            // Procesar Partidos Recientes (últimos 10)
            const sortedMatches = matchesData
                .filter(m => m.event?.date_time)
                .sort((a, b) => new Date(b.event!.date_time).getTime() - new Date(a.event!.date_time).getTime())
                .slice(0, 10);
            setRecentMatches(sortedMatches);

        } catch {
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        document.title = 'Dashboard - VoleyApp';
        loadDashboardData();
    }, [loadDashboardData]);

    // Función para recargar solo anuncios después de crear/editar
    const refreshAnnouncements = async () => {
        const data = await announcementService.getActive();
        setAnnouncements(data);
    };

    const handleCreateOrUpdate = async (data: CreateAnnouncementDTO) => {
        try {
            if (editingAnnouncement) {
                await announcementService.update(editingAnnouncement.id, data);
                toast.success("Anuncio actualizado");
            } else {
                await announcementService.create(data);
                toast.success("Anuncio publicado");
            }
            setEditingAnnouncement(undefined);
            refreshAnnouncements();
        } catch {
            toast.error("Error al guardar el anuncio");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await announcementService.delete(deleteId);
            setAnnouncements(prev => prev.filter(a => a.id !== deleteId));
            toast.success("Anuncio eliminado");
        } catch {
            toast.error("Error al eliminar el anuncio");
        } finally {
            setDeleteId(null);
        }
    };

    // Nota: La edición de anuncios desde el carrusel requeriría pasar la función openEdit al componente,
    // pero por simplicidad visual en el carrusel, la gestión completa podría estar en una vista dedicada o
    // agregar un botón de "Gestionar Anuncios" si es admin.
    // Por ahora, mantenemos la creación.

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Hola, {(playerData?.profile?.full_name || user?.profile?.full_name)?.split(' ')[0] || 'Usuario'} 👋</h1>
                    <p className="text-muted-foreground">Aquí tienes un resumen de la actividad del club.</p>
                </div>
                
                {canManage && (
                    <Button onClick={() => { setEditingAnnouncement(undefined); setIsCreateOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Publicar Anuncio
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Cargando dashboard...</div>
            ) : (
                <div className="space-y-8">
                    {/* Sección Superior: Anuncios y Top Teams */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <AnnouncementsCarousel announcements={announcements} />
                        <TopTeamsCarousel teams={topTeams} />
                    </div>

                    {/* Sección Principal: Grid de Contenido */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className={isPlayer ? "md:col-span-2" : "md:col-span-3"}>
                            <RecentMatchesCard matches={recentMatches} />
                        </div>

                        {/* Columna Derecha: Perfil (Solo Player) o Info Extra */}
                        {isPlayer && (playerData || user) && (
                            <div className="md:col-span-1">
                                <PlayerProfileSummary user={playerData || user!} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreateAnnouncementDialog 
                open={isCreateOpen} 
                onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setEditingAnnouncement(undefined);
                }}
                initialData={editingAnnouncement ? {
                    title: editingAnnouncement.title,
                    content: editingAnnouncement.content,
                    valid_until: editingAnnouncement.valid_until ? new Date(editingAnnouncement.valid_until) : null
                } : undefined}
                onSubmit={handleCreateOrUpdate}
            />

            <ConfirmDialog 
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="¿Eliminar anuncio?"
                description="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                variant="destructive"
            />
        </div>
    );
}