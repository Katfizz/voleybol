import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { eventService } from '../services/event.service';
import { type Event } from '../types/event.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

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
                    </div>
                    <CardDescription className="flex flex-col gap-1 mt-2 text-base">
                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(event.date_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}</span>
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{event.description || "Sin descripción adicional."}</p>
                    
                    {/* Aquí irán los partidos y asistencia en el futuro */}
                    <div className="mt-8 p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
                        Próximamente: Gestión de Partidos y Asistencia
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}