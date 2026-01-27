import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, MapPin, Trophy, Users, Edit, Trash2 } from "lucide-react";
import { type Event } from "@/types/event.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
    event: Event;
    onClick?: () => void;
    isAdminOrCoach?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (id: number) => void;
}

export function EventCard({ event, onClick, isAdminOrCoach, onEdit, onDelete }: EventCardProps) {
    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'MATCH': return 'destructive'; // Rojo para partidos
            case 'PRACTICE': return 'secondary'; // Gris/Azul para prácticas
            case 'TOURNAMENT': return 'default'; // Negro/Primario para torneos
            default: return 'outline';
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'MATCH': return 'Partido';
            case 'PRACTICE': return 'Práctica';
            case 'TOURNAMENT': return 'Torneo';
            default: return type;
        }
    };
    const isPastEvent = new Date(event.date_time) < new Date();

    return (
        <Card
            className="group hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary relative"
            onClick={onClick}
        >
            {isAdminOrCoach && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {!isPastEvent && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={(e) => { e.stopPropagation(); onEdit?.(event); }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                        <Badge variant={getBadgeVariant(event.type)} className="mb-1">
                            {getTypeName(event.type)}
                        </Badge>
                        <CardTitle className="text-lg leading-tight line-clamp-2 break-words" title={event.name}>
                            {event.name}
                        </CardTitle>
                    </div>
                    <div className="text-center bg-muted/30 p-2 rounded-md min-w-[60px] shrink-0">
                        <span className="block text-xs font-bold uppercase text-muted-foreground">
                            {format(new Date(event.date_time), "MMM", { locale: es })}
                        </span>
                        <span className="block text-2xl font-bold">
                            {format(new Date(event.date_time), "dd/yyyy")}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(new Date(event.date_time), "EEEE, HH:mm 'hs'", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                </div>
                {event._count && event._count.matches > 0 && (
                    <div className="flex items-center gap-2 text-primary font-medium mt-2">
                        <Trophy className="h-4 w-4" />
                        <span>{event._count.matches} Partidos programados</span>
                    </div>
                )}
                {event.categories && event.categories.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4" />
                        <span className="truncate" title={event.categories.map(c => c.name).join(", ")}>
                            {event.categories.map(c => c.name).join(", ")}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}