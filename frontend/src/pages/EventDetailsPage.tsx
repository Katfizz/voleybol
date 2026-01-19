import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, ArrowLeft, Plus, Edit } from "lucide-react";
import { toast } from "sonner";

import { eventService } from '../services/event.service';
import { matchService } from '../services/match.service';
import { useAuth } from '../context/AuthContext';
import { type Event } from '../types/event.types';
import { type Match } from '../types/match.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from '../components/matches/MatchCard';
import { CreateMatchDialog } from '../components/matches/CreateMatchDialog';
import { MatchResultsDialog } from '../components/matches/MatchResultsDialog';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AttendanceManager } from '../components/attendance/AttendanceManager';

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
    const [deleteMatchId, setDeleteMatchId] = useState<number | null>(null);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [isResultsOpen, setIsResultsOpen] = useState(false);

    const isAdminOrCoach = user?.role === 'ADMIN' || user?.role === 'COACH';

    const loadEvent = useCallback(async (eventId: number) => {
        try {
            const data = await eventService.getById(eventId);
            setEvent(data);
        } catch {
            toast.error('Error al cargar el evento');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (id) {
            loadEvent(parseInt(id));
        }
    }, [id, loadEvent]);

    const handleCreateMatch = async (data: { home_category_id: number, away_category_id: number }) => {
        if (!event) return;
        try {
            await matchService.create(event.id, data);
            toast.success("Partido programado exitosamente");
            loadEvent(event.id); // Recargar para ver el nuevo partido
        } catch {
            toast.error("Error al programar el partido");
        }
    };

    const handleDeleteMatch = async () => {
        if (!deleteMatchId || !event) return;
        try {
            await matchService.delete(deleteMatchId);
            toast.success("Partido eliminado");
            loadEvent(event.id);
        } catch {
            toast.error("Error al eliminar el partido");
        } finally {
            setDeleteMatchId(null);
        }
    };

    const handleEditResults = (match: Match) => {
        setEditingMatch(match);
        setIsResultsOpen(true);
    };

    const handleUpdateResults = async (matchId: number, sets: { set_number: number, home_score: number, away_score: number }[]) => {
        if (!event) return;
        try {
            await matchService.updateResults(matchId, sets);
            toast.success("Resultados actualizados");
            loadEvent(event.id);
        } catch {
            toast.error("Error al actualizar resultados");
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (!event) return null;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al calendario
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="mb-2">{event.type}</Badge>
                            <CardTitle className="text-3xl">{event.name}</CardTitle>
                        </div>
                        {isAdminOrCoach && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => navigate(`/events/${event.id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                {(event.type === 'MATCH' || event.type === 'TOURNAMENT') && (
                                    <Button onClick={() => setIsCreateMatchOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" /> Agregar Partido
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    <CardDescription className="flex flex-col gap-1 mt-2 text-base">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(event.date_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}</span>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground break-words whitespace-pre-wrap">{event.description || "Sin descripción adicional."}</p>
                    
                    {/* Lista de Partidos */}
                    {(event.type === 'MATCH' || event.type === 'TOURNAMENT') && (
                        <div className="mt-8 space-y-4">
                            <h3 className="text-xl font-semibold">Partidos Programados</h3>
                            {event.matches && event.matches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {event.matches.map(match => (
                                        <MatchCard 
                                            key={match.id} 
                                            match={match} 
                                            isAdminOrCoach={isAdminOrCoach}
                                            onDelete={(id) => setDeleteMatchId(id)}
                                            onEdit={handleEditResults}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                                    No hay partidos programados para este evento.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gestión de Asistencia */}
                    <div className="mt-8">
                        <AttendanceManager 
                            eventId={event.id} 
                            eventDate={event.date_time} 
                            categories={event.categories || []} 
                            isAdminOrCoach={isAdminOrCoach}
                        />
                    </div>
                </CardContent>
            </Card>

            <CreateMatchDialog 
                open={isCreateMatchOpen} 
                onOpenChange={setIsCreateMatchOpen} 
                categories={event.categories || []} 
                onSubmit={handleCreateMatch} 
            />

            <MatchResultsDialog
                open={isResultsOpen}
                onOpenChange={setIsResultsOpen}
                match={editingMatch}
                onSubmit={handleUpdateResults}
            />

            <ConfirmDialog 
                open={!!deleteMatchId} 
                onOpenChange={(open) => !open && setDeleteMatchId(null)}
                onConfirm={handleDeleteMatch}
                title="¿Eliminar partido?"
                description="Esta acción eliminará el partido y sus resultados."
                confirmText="Eliminar"
                variant="destructive"
            />
        </div>
    );
}