import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { format } from "date-fns";

import { eventService } from '../services/event.service';
import { categoryService } from '../services/category.service';
import { EventForm, type EventFormValues } from '../components/events/EventForm';
import { type Category } from '../types/category.types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditEventPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [initialData, setInitialData] = useState<Partial<EventFormValues> | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [cats, eventData] = await Promise.all([
                categoryService.getAll(),
                id ? eventService.getById(parseInt(id)) : Promise.resolve(null)
            ]);
            
            setCategories(cats);

            if (eventData) {
                const dateObj = new Date(eventData.date_time);
                setInitialData({
                    name: eventData.name,
                    type: eventData.type,
                    location: eventData.location,
                    description: eventData.description || '',
                    date: dateObj,
                    time: format(dateObj, 'HH:mm'),
                    categoryIds: eventData.categories?.map(c => c.id) || []
                });
            }
        } catch {
            toast.error('Error al cargar datos');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onSubmit = async (data: EventFormValues) => {
        if (!id) return;
        try {
            // Combinar fecha y hora
            const dateStr = format(data.date, "yyyy-MM-dd");
            const dateTime = `${dateStr}T${data.time}:00`;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { date, time, ...eventData } = data;

            await eventService.update(parseInt(id), { 
                ...eventData, 
                date_time: new Date(dateTime).toISOString() 
            });
            
            toast.success('Evento actualizado exitosamente');
            navigate('/events');
        } catch {
            toast.error('Error al actualizar el evento');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="flex justify-center p-4 md:p-8">
            <Card className="w-full max-w-3xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Editar Evento</CardTitle>
                </CardHeader>
                <CardContent>
                    {initialData && (
                        <EventForm 
                            categories={categories} 
                            defaultValues={initialData} 
                            onSubmit={onSubmit} 
                            onCancel={() => navigate('/events')} 
                            submitLabel="Actualizar Evento"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}