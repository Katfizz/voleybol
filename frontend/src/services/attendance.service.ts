import api from '../api/axios';
import type { Attendance, CreateAttendanceDTO } from '../types/attendance.types';

export const attendanceService = {
    getByEvent: async (eventId: number, date?: string) => {
        let url = `/attendance/event/${eventId}`;
        if (date) url += `?date=${date}`;
        const response = await api.get<{ ok: boolean; attendance: Attendance[] }>(url);
        return response.data.attendance;
    },
    record: async (eventId: number, data: CreateAttendanceDTO) => {
        const response = await api.post<{ ok: boolean; msg: string }>(`/attendance/event/${eventId}`, data);
        return response.data;
    }
};