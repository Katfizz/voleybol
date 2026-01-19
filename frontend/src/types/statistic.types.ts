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