import { type UserProfile } from './user.types';

export interface Category {
    id: number;
    name: string;
    players?: UserProfile[];
    coaches?: UserProfile[];
}

export interface CreateCategoryDTO {
    name: string;
}