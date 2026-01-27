import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { type Match } from "@/types/match.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentMatchesCardProps {
    matches: Match[];
}

export function RecentMatchesCard({ matches }: RecentMatchesCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" /> Últimos Partidos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="max-h-[300px] pr-4">
                    {matches.length > 0 ? (
                        <div className="space-y-4">
                            {matches.map((match) => (
                                <div key={match.id} className="flex flex-col gap-2 border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{match.event?.date_time ? format(new Date(match.event.date_time), "dd MMM", { locale: es }) : "-"}</span>
                                        <Badge variant="outline" className="text-[10px] h-5 max-w-[150px] truncate" title={match.event?.name}>
                                            {match.event?.name}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 font-medium text-sm">
                                        <span className={`truncate text-right ${match.winner_category_id === match.home_category_id ? 'text-primary font-bold' : ''}`}>
                                            {match.homeCategory?.name}
                                        </span>
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                            {match.home_sets_won} - {match.away_sets_won}
                                        </span>
                                        <span className={`truncate text-left ${match.winner_category_id === match.away_category_id ? 'text-primary font-bold' : ''}`}>
                                            {match.awayCategory?.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8 text-sm">No hay partidos recientes.</div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}