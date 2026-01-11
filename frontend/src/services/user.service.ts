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
    }
};