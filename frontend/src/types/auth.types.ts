import { type User } from './user.types';

export interface LoginResponse {
    ok: boolean;
    msg?: string;
    user: User;
    token: string;
}