export type UserRole = 'ADMIN' | 'COACH' | 'PLAYER';

export interface PlayerProfile {
    id: number;
    userId: number; // ID del usuario, crucial para la navegación
    full_name: string;
    position?: string;
    birth_date?: string;
    contact_data?: {
        phone?: string;
        address?: string;
    };
    representative_data?: {
        full_name?: string;
        phone?: string;
        relationship?: string;
    };
    user?: User; // El objeto User anidado es opcional
}

export interface User {
    id: number;
    email: string;
    role: UserRole;
    profile?: PlayerProfile;
    _count?: {
        categories: number;
    };
}