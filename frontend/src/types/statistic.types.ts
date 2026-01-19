import { type Match } from './match.types';

export interface Statistic {
    id: number;
    match_id: number;
    player_profile_id: number;
    points: number;
    kills: number;
    errors: number;
    aces: number;
    blocks: number;
    assists: number;
    digs: number;
    player_profile?: {
        full_name: string;
        position: string;
    };
}

export interface CreateStatisticDTO {
    stats: {
        player_profile_id: number;
        points?: number;
        kills?: number;
        errors?: number;
        aces?: number;
        blocks?: number;
        assists?: number;
        digs?: number;
    }[];
}

export interface PlayerStatsSummary {
    matches_played: number;
    totals: {
        points: number;
        kills: number;
        blocks: number;
        aces: number;
        assists: number;
        digs: number;
        errors: number;
    };
    averages: Record<string, number>;
}

export interface PlayerStatsHistoryItem extends Statistic {
    match: Match;
}

export interface PlayerStatsData {
    summary: PlayerStatsSummary;
    history: PlayerStatsHistoryItem[];
}