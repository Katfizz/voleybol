import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";

import { eventService } from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import { type Event } from '../types/event.types';
import { EventCard } from '../components/events/EventCard';
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdminOrCoach = user?.role === 'ADMIN' || user?.role === 'COACH';

    const loadEvents = useCallback(async () => {
        try {
            const data = await eventService.getAll();
            setEvents(data);
        } catch {
            toast.error('Error al cargar los eventos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;
        try {
            await eventService.delete(id);
            setEvents(events.filter(e => e.id !== id));
            toast.success('Evento eliminado');
        } catch {
            toast.error('Error al eliminar el evento');
        }
    };

    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Cargando calendario...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <CalendarIcon className="h-8 w-8" /> Calendario de Eventos
                </h2>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <InputGroup className="w-full md:w-64">
                        <InputGroupAddon>🔍</InputGroupAddon>
                        <InputGroupInput placeholder="Buscar evento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </InputGroup>
                    {isAdminOrCoach && (
                        <Button onClick={() => navigate('/events/new')} className="bg-primary shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            isAdminOrCoach={isAdminOrCoach}
                            onEdit={(e) => navigate(`/events/${e.id}/edit`)}
                            onDelete={handleDelete}
                            onClick={() => navigate(`/events/${event.id}`)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No hay eventos programados.
                    </div>
                )}
            </div>
        </div>
    );
}