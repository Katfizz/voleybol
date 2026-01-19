import api from '../api/axios';
import type { Statistic, CreateStatisticDTO, PlayerStatsData } from '../types/statistic.types';

export const statisticService = {
    getByMatch: async (matchId: number) => {
        const response = await api.get<{ ok: boolean; stats: Statistic[] }>(`/statistics/match/${matchId}`);
        return response.data.stats;
    },
    record: async (matchId: number, data: CreateStatisticDTO) => {
        const response = await api.post<{ ok: boolean; msg: string }>(`/statistics/match/${matchId}`, data);
        return response.data;
    },
    getPlayerStats: async (playerProfileId: number): Promise<PlayerStatsData> => {
        const response = await api.get<{ ok: boolean; summary: any; history: any[] }>(`/statistics/player/${playerProfileId}`);
        return { summary: response.data.summary, history: response.data.history };
    }
};