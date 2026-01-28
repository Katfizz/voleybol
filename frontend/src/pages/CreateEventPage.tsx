import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { format } from "date-fns";

import { eventService } from '../services/event.service';
import { categoryService } from '../services/category.service';
import { EventForm, type EventFormValues } from '../components/events/EventForm';
import { type Category } from '../types/category.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch {
            toast.error('Error al cargar los equipos');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: EventFormValues) => {
        try {
            // Combinar fecha y hora en un string ISO
            const dateStr = format(data.date, "yyyy-MM-dd");
            const dateTime = `${dateStr}T${data.time}:00`;

            await eventService.create({
                ...data,
                date_time: new Date(dateTime).toISOString(),
            });

            toast.success('Evento creado exitosamente');
            navigate('/events');
        } catch {
            toast.error('Error al crear el evento');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="flex justify-center p-4 md:p-8">
            <Card className="w-full max-w-3xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Nuevo Evento</CardTitle>
                    <CardDescription>Programa un partido, práctica o torneo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EventForm categories={categories} onSubmit={onSubmit} onCancel={() => navigate('/events')} />
                </CardContent>
            </Card>
        </div>
    );
}