export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export interface AttendanceRecord {
    player_profile_id: number;
    status: AttendanceStatus;
    notes?: string;
}

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
    attendances: AttendanceRecord[];
}

export interface PlayerAttendanceReport {
    player_id: number;
    full_name: string;
    position: string;
    stats: {
        present: number;
        absent: number;
        excused: number;
        total: number;
        rate: number;
    };
}

export interface AttendanceReport {
    category: {
        id: number;
        name: string;
        total_events: number;
    };
    players: PlayerAttendanceReport[];
}