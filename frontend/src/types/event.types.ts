import { type Category } from './category.types';
import { type Match } from './match.types';

export type EventType = 'MATCH' | 'PRACTICE' | 'TOURNAMENT';

export interface Event {
    id: number;
    name: string;
    type: EventType;
    date_time: string; // ISO string
    location: string;
    description?: string;
    categories?: Category[];
    matches?: Match[];
    _count?: {
        matches: number;
    };
}

export interface CreateEventDTO {
    name: string;
    type: EventType;
    date_time: string;
    location: string;
    description?: string;
    categoryIds?: number[];
}