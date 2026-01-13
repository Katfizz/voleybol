import api from '../api/axios';
import { type User, type RegisterUserDTO } from '../types';

export const userService = {
    createUser: async (userData: RegisterUserDTO): Promise<User> => {
        // Creamos una copia para no modificar el objeto original del formulario
        let payload: any = { ...userData };

        // Si es jugador, reestructuramos los datos para cumplir con las validaciones estrictas del backend
        if (userData.role === 'PLAYER') {
            payload = {
                email: userData.email,
                password: userData.password,
                role: userData.role,
                profile: {
                    full_name: userData.full_name,
                    position: userData.position,
                    birthDate: userData.birth_date, // El backend espera camelCase aquí
                    contact_data: {
                        phone: userData.phone,
                        address: userData.address
                    },
                    representative_data: userData.representative_data
                }
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
        let payload: any = { ...userData };

        // Estructura para PLAYER (similar a createUser)
        if (userData.role === 'PLAYER') {
            // El backend espera firstName y lastName separados para actualizar el perfil
            const nameParts = (userData.full_name || '').trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            payload = {
                email: userData.email,
                password: userData.password, // Puede ir vacío si no se cambia
                role: userData.role,
                profile: {
                    firstName,
                    lastName,
                    position: userData.position,
                    birthDate: userData.birth_date,
                    contact: { // El backend espera 'contact'
                        phone: userData.phone,
                        address: userData.address
                    },
                    representativeData: userData.representative_data // El backend espera camelCase
                }
            };
        }
        const { data } = await api.put<{ ok: boolean, user: User }>(`/users/${id}`, payload);
        return data.user;
    }
};