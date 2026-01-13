export type Role = 'ADMIN' | 'COACH' | 'PLAYER';

export interface UserProfile {
    id: number;
    full_name: string;
    position?: string;
    birth_date?: string;
    categories?: { id: number; name: string }[];
    contact_data?: { phone?: string; address?: string };
    representative_data?: { full_name: string; phone: string; relationship: string };
}

export interface User {
    id: number;
    email: string;
    role: Role;
    profile?: UserProfile;
}