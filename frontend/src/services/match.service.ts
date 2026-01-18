import api from '../api/axios';
import { type Match } from '../types/match.types';

export const matchService = {
    getAll: async () => {
        const response = await api.get<{ ok: boolean; matches: Match[] }>('/matches');
        return response.data.matches;
    },
    delete: async (id: number) => {
        const response = await api.delete<{ ok: boolean; msg: string }>(`/matches/${id}`);
        return response.data;
    }
};