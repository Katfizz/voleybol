export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface Attendance {
    id: number;
    eventId: number;
    userProfileId: number; // Vinculado al perfil del jugador/usuario
    status: AttendanceStatus;
    date: string;
}

export interface RecordAttendanceDTO {
    userProfileId: number;
    status: AttendanceStatus;
}