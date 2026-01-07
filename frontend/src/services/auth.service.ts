import api from '../api/axios';
import { type LoginResponse, type User } from '../types';

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // Petición al backend
        const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
        
        // Si el login es exitoso, guardamos la sesión
        if (data.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    }
};
