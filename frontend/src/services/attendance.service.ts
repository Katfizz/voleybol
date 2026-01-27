import api from '../api/axios';
import type { Attendance, CreateAttendanceDTO, AttendanceReport } from '../types/attendance.types';

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
    },
    delete: async (id: number) => {
        const response = await api.delete<{ ok: boolean; msg: string }>(`/attendance/${id}`);
        return response.data;
    },
    getReport: async (categoryId: number) => {
        const response = await api.get<{ ok: boolean; report: AttendanceReport }>(`/attendance/report/category/${categoryId}`);
        return response.data.report;
    },
    downloadReportExcel: async (categoryId: number, categoryName: string) => {
        const response = await api.get(`/attendance/report/category/${categoryId}/excel`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_asistencia_${categoryName.replace(/\s+/g, '_')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};