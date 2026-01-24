import { type User, type UserRole, type RepresentativeData } from './user.types';

export interface LoginResponse {
    ok: boolean;
    msg?: string;
    user: User;
    token: string;
}

export interface RegisterUserDTO {
    email: string;
    password: string;
    role: UserRole;
    // Campos adicionales para PLAYER
    full_name?: string;
    position?: string;
    birth_date?: string;
    phone?: string;
    address?: string;
    representative_data?: RepresentativeData;
}

export interface LoginCredentials {
    email: string;
    password: string;
}