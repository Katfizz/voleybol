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
        const token = localStorage.getItem('token');

        if (!userStr || !token) return null;

        try {
            // Decodificar el payload del JWT para verificar la fecha de expiración
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token no tiene 3 partes');
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Añadir padding '=' si es necesario para que atob funcione correctamente
            const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

            const jsonPayload = decodeURIComponent(window.atob(paddedBase64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const { exp } = JSON.parse(jsonPayload);

            // Verificar si el token ha expirado (exp está en segundos, Date.now() en ms)
            if (exp && Date.now() >= exp * 1000) {
                console.warn("La sesión ha expirado.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return null;
            }

            return JSON.parse(userStr) as User;
        } catch (error) {
            console.error("Error al validar la sesión:", error);
            // Si falla la decodificación (por ejemplo, token opaco o formato extraño),
            // pero tenemos usuario en localStorage, intentamos mantener la sesión viva
            // y dejamos que el backend decida con un 401 si el token es inválido.
            return JSON.parse(userStr) as User;
        }
    }
};