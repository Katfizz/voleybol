import { type Match } from './match.types';

export type EventType = 'MATCH' | 'PRACTICE';

export interface Event {
    id: number;
    name: string;
    type: EventType;
    date_time: string;
    location: string;
    description?: string;
    matches?: Match[]; // Relación opcional con partidos
}