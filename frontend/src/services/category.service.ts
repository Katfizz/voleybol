import api from '../api/axios';
import { type Category, type CreateCategoryDTO, type UpdateCategoryDTO } from '../types/category.types';

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<{ ok: boolean, categories: Category[] }>('/categories');
        return data.categories;
    },
    getById: async (id: number) => {
        const response = await api.get<{ ok: boolean; category: Category }>(`/categories/${id}`);
        return response.data.category;
    },
    create: async (categoryData: CreateCategoryDTO): Promise<Category> => {
        const { data } = await api.post<{ ok: boolean, category: Category }>('/categories', categoryData);
        return data.category;
    },

    update: async (id: number, categoryData: UpdateCategoryDTO): Promise<Category> => {
        const { data } = await api.put<{ ok: boolean, category: Category }>(`/categories/${id}`, categoryData);
        return data.category;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },

    assignPlayer: async (categoryId: number, playerId: number): Promise<void> => {
        await api.post(`/categories/${categoryId}/players`, { playerId });
    },

    removePlayer: async (categoryId: number, playerId: number): Promise<void> => {
        await api.delete(`/categories/${categoryId}/players/${playerId}`);
    }
};