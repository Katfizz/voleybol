import { type User, type Role } from './user.types';

export interface LoginResponse {
    ok: boolean;
    msg?: string;
    user: User;
    token: string;
}

export interface RegisterUserDTO {
    email: string;
    password: string;
    role: Role;
    // Campos adicionales para PLAYER
    full_name?: string;
    position?: string;
    birth_date?: string;
    phone?: string;
    address?: string;
}