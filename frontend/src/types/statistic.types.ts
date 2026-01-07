export interface PlayerStats {
    id: number;
    matchId: number;
    playerProfileId: number;
    kills: number;
    blocks: number;
    aces: number;
    digs: number;
    assists: number;
    errors: number;
}

export interface RecordStatsDTO {
    kills?: number;
    blocks?: number;
    aces?: number;
    digs?: number;
    assists?: number;
    errors?: number;
}