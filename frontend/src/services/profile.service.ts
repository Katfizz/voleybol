import api from '../api/axios';
import { type ProfileResponse, type User } from '../types';

export const profileService = {
    getProfile: async (): Promise<User> => {
        const { data } = await api.get<ProfileResponse>('/profile');
        return data.user;
    },

    updateProfile: async (profileData: any) => {
        const { data } = await api.put<ProfileResponse>('/profile', profileData);
        return data.user;
    }
};