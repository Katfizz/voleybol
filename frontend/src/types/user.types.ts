export type Role = 'ADMIN' | 'COACH' | 'PLAYER';

export interface UserProfile {
    id: number;
    full_name: string;
    position?: string;
    birth_date?: string;
}

export interface User {
    id: number;
    email: string;
    role: Role;
    profile?: UserProfile;
}