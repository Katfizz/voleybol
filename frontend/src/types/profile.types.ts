import { type User } from './user.types';

export interface ProfileResponse {
    ok: boolean;
    user: User;
}