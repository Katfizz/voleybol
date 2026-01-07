export interface Announcement {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    expiresAt?: string; // Opcional, para la lógica de anuncios activos
    isActive?: boolean;
}

export interface CreateAnnouncementDTO {
    title: string;
    content: string;
    expiresAt?: string;
}