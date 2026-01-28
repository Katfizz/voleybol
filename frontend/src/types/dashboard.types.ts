import { type Category } from "./category.types";

export interface TopTeam extends Category {
    stats: {
        wins: number;
        losses: number;
        winRate: number;
    };
}
