export interface Announcement {
    id: number;
    title: string;
    content: string;
    valid_from: string;
    valid_until?: string | null;
    created_at: string;
    author_id: number;
    author?: {
        email: string;
        profile?: {
            full_name: string;
        }
    };
}

export interface CreateAnnouncementDTO {
    title: string;
    content: string;
    valid_until?: string | null;
}