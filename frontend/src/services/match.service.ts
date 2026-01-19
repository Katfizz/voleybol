import api from '../api/axios';
import { type Match, type CreateMatchDTO } from '../types/match.types';

export const matchService = {
    getAll: async () => {
        const response = await api.get<{ ok: boolean; matches: Match[] }>('/matches');
        return response.data.matches;
    },
    getById: async (id: number) => {
        const response = await api.get<{ ok: boolean; match: Match }>(`/matches/${id}`);
        return response.data.match;
    },
    create: async (eventId: number, data: CreateMatchDTO) => {
        const response = await api.post<{ ok: boolean; match: Match }>(`/events/${eventId}/matches`, data);
        return response.data.match;
    },
    updateResults: async (id: number, sets: { set_number: number, home_score: number, away_score: number }[]) => {
        const response = await api.put<{ ok: boolean; match: Match }>(`/matches/${id}/results`, { sets });
        return response.data.match;
    },
    delete: async (id: number) => {
        const response = await api.delete<{ ok: boolean; msg: string }>(`/matches/${id}`);
        return response.data;
    }
};