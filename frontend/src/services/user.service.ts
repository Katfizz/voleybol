import api from '../api/axios';
import { type User, type RegisterUserDTO } from '../types';

export const userService = {
    createUser: async (userData: RegisterUserDTO): Promise<User> => {
        const { data } = await api.post<{ ok: boolean, user: User }>('/users', userData);
        return data.user;
    }
};