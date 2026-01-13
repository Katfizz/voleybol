export interface Category {
    id: number;
    name: string;
    description?: string;
    _count?: {
        playerProfiles: number;
        coaches: number;
    };
    playerProfiles?: {
        id: number;
        full_name: string;
        position?: string;
        user?: { id: number; email: string };
    }[];
    coaches?: {
        id: number;
        email: string;
        role: string;
    }[];
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
}