import api from '../api/axios';
import { type Announcement, type CreateAnnouncementDTO } from '../types/announcement.types';

export const announcementService = {
    getActive: async () => {
        const response = await api.get<{ ok: boolean; announcements: Announcement[] }>('/announcements');
        return response.data.announcements;
    },
    getAll: async () => {
        const response = await api.get<{ ok: boolean; announcements: Announcement[] }>('/announcements/all');
        return response.data.announcements;
    },
    create: async (data: CreateAnnouncementDTO) => {
        const response = await api.post<{ ok: boolean; announcement: Announcement }>('/announcements', data);
        return response.data.announcement;
    },
    update: async (id: number, data: Partial<CreateAnnouncementDTO>) => {
        const response = await api.put<{ ok: boolean; announcement: Announcement }>(`/announcements/${id}`, data);
        return response.data.announcement;
    },
    delete: async (id: number) => {
        const response = await api.delete<{ ok: boolean; msg: string }>(`/announcements/${id}`);
        return response.data;
    }
};