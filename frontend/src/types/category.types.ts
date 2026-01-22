import { type PlayerProfile, type User } from './user.types';

export interface Category {
    id: number;
    name: string;
    description?: string;
    playerProfiles?: PlayerProfile[];
    coaches?: User[];
    _count?: {
        playerProfiles: number;
        coaches?: number;
    };
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

export interface AssignPlayerDTO {
    playerId: number;
}

export interface AssignCoachDTO {
    coachId: number;
}