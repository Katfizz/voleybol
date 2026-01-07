export interface Match {
    id: number;
    eventId: number;
    opponent: string;
    homeScore: number;
    awayScore: number;
    isFinished: boolean;
    // Aquí podrías agregar en el futuro:
    // sets: MatchSet[];
}

// Lo que envías al backend para crear un partido (POST /events/:id/matches)
export interface CreateMatchDTO {
    opponent: string;
    // Si tu backend pide hora específica para el partido, agrégala aquí
}

// Lo que envías para registrar el marcador (PUT /matches/:id/results)
export interface RecordResultsDTO {
    homeScore: number;
    awayScore: number;
}