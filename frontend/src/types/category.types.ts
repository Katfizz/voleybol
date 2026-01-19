import { type PlayerProfile } from './user.types';

export interface Category {
    id: number;
    name: string;
    description?: string;
    playerProfiles?: PlayerProfile[];
    _count?: {
        playerProfiles: number;
    };
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;