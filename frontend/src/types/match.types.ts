import { type Category } from './category.types';

export interface Set {
    id: number;
    set_number: number;
    home_score: number;
    away_score: number;
    winner_category_id?: number;
}

export interface Match {
    id: number;
    event_id: number;
    home_category_id: number;
    away_category_id: number;
    home_sets_won: number;
    away_sets_won: number;
    winner_category_id?: number;
    homeCategory?: Category;
    awayCategory?: Category;
    winnerCategory?: Category;
    sets?: Set[];
}

export interface CreateMatchDTO {
    home_category_id: number;
    away_category_id: number;
}