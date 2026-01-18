import api from '../api/axios';
import { type Event, type CreateEventDTO } from '../types/event.types';

export const eventService = {
    getAll: async () => {
        const response = await api.get<{ ok: boolean; events: Event[] }>('/events');
        return response.data.events;
    },
    getById: async (id: number) => {
        const response = await api.get<{ ok: boolean; event: Event }>(`/events/${id}`);
        return response.data.event;
    },
    create: async (data: CreateEventDTO) => {
        const response = await api.post<{ ok: boolean; event: Event }>('/events', data);
        return response.data.event;
    },
    update: async (id: number, data: Partial<CreateEventDTO>) => {
        const response = await api.put<{ ok: boolean; event: Event }>(`/events/${id}`, data);
        return response.data.event;
    },
    delete: async (id: number) => {
        const response = await api.delete<{ ok: boolean; msg: string }>(`/events/${id}`);
        return response.data;
    }
};