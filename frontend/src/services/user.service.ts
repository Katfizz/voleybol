import api from '../api/axios';
import { type User, type RegisterUserDTO, type UserPayload } from '../types';

export const userService = {
    createUser: async (userData: RegisterUserDTO): Promise<User> => {
        // Creamos una copia para no modificar el objeto original del formulario
        const payload: UserPayload = {
            email: userData.email,
            password: userData.password,
            role: userData.role
        };

        // Si es jugador, reestructuramos los datos para cumplir con las validaciones estrictas del backend
        if (userData.role === 'PLAYER') {
            payload.profile = {
                full_name: userData.full_name,
                position: userData.position,
                birth_date: userData.birth_date,
                contact_data: {
                    phone: userData.phone,
                    address: userData.address
                },
                representative_data: userData.representative_data
            };
        }

        const { data } = await api.post<{ ok: boolean, user: User }>('/users', payload);
        return data.user;
    },

    getUsers: async (): Promise<User[]> => {
        const { data } = await api.get<{ ok: boolean, users: User[] }>('/users');
        return data.users;
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    getUser: async (id: number): Promise<User> => {
        const { data } = await api.get<{ ok: boolean, user: User }>(`/users/${id}`);
        return data.user;
    },

    updateUser: async (id: number, userData: Partial<RegisterUserDTO>): Promise<User> => {
        const payload: UserPayload = {
            email: userData.email,
            role: userData.role
        };
        
        if (userData.password) {
            payload.password = userData.password;
        }

        // Estructura para PLAYER (similar a createUser)
        if (userData.role === 'PLAYER') {
            payload.profile = {
                full_name: userData.full_name,
                position: userData.position,
                birth_date: userData.birth_date,
                contact_data: {
                    phone: userData.phone,
                    address: userData.address
                },
                representative_data: userData.representative_data
            };
        }
        const { data } = await api.put<{ ok: boolean, user: User }>(`/users/${id}`, payload);
        return data.user;
    }
};