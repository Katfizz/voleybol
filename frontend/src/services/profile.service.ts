import api from '../api/axios';
import { type User } from '../types';

export const profileService = {
    getProfile: async (): Promise<User> => {
        const { data } = await api.get<{ ok: boolean, profile: User }>('/profile');
        return data.profile;
    },

    updateProfile: async (profileData: any) => {
        const { data } = await api.put<{ ok: boolean, profile: User }>('/profile', profileData);
        return data.profile;
    }
};