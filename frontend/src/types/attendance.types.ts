export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface Attendance {
    id: number;
    event_id: number;
    player_profile_id: number;
    date: string;
    status: AttendanceStatus;
    notes?: string;
    player_profile?: {
        full_name: string;
        position: string;
    };
    recorded_by?: {
        email: string;
    };
}

export interface CreateAttendanceDTO {
    date: string;
    attendances: {
        player_profile_id: number;
        status: AttendanceStatus;
        notes?: string;
    }[];
}