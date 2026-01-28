import { useNavigate } from "react-router-dom";
import { Trophy, Trash2, Edit } from "lucide-react";
import { type Match } from "@/types/match.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchCardProps {
    match: Match;
    isAdminOrCoach?: boolean;
    onDelete?: (id: number) => void;
    onEdit?: (match: Match) => void;
}

export function MatchCard({ match, isAdminOrCoach, onDelete, onEdit }: MatchCardProps) {
    const navigate = useNavigate();
    const isWinner = (categoryId: number) => match.winner_category_id === categoryId;
    const visibleSets = match.sets?.slice(0, 5);
    const hiddenSetsCount = (match.sets?.length || 0) - 5;

    return (
        <Card
            className="group relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary/50"
            onClick={() => navigate(`/matches/${match.id}`)}
        >
            {isAdminOrCoach && (
                <div className="absolute top-0 right-0 flex gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-1 rounded-bl-lg border-b border-l shadow-sm">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onEdit?.(match); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete?.(match.id); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <CardHeader className="pb-2 pt-8">
                <div className="grid grid-cols-3 items-center gap-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-end min-w-0 pr-1">
                        <div
                            className={cn(
                                "font-bold text-base md:text-lg truncate w-full text-right",
                                isWinner(match.home_category_id) ? "text-primary" : "text-foreground/80"
                            )}
                            title={match.homeCategory?.name}
                        >
                            {match.homeCategory?.name}
                        </div>
                        {match.winner_category_id ? (
                            <Badge variant="secondary" className={cn("mt-1 flex-shrink-0 scale-90 origin-right transition-opacity", !isWinner(match.home_category_id) && "opacity-0 invisible")}>
                                <Trophy className="h-3 w-3 mr-1" /> <span className="text-[10px]">Ganador</span>
                            </Badge>
                        ) : <div className="h-6" />}
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center justify-center px-2 py-1 bg-muted/40 rounded-lg min-w-[70px] border border-muted-foreground/10 self-center">
                        <div className="text-2xl md:text-3xl font-black font-mono tracking-tighter leading-none">
                            {match.home_sets_won} - {match.away_sets_won}
                        </div>
                        <span className="text-[9px] text-muted-foreground uppercase font-black mt-1 tracking-widest leading-none">Sets</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-start min-w-0 pl-1">
                        <div
                            className={cn(
                                "font-bold text-base md:text-lg truncate w-full text-left",
                                isWinner(match.away_category_id) ? "text-primary" : "text-foreground/80"
                            )}
                            title={match.awayCategory?.name}
                        >
                            {match.awayCategory?.name}
                        </div>
                        {match.winner_category_id ? (
                            <Badge variant="secondary" className={cn("mt-1 flex-shrink-0 scale-90 origin-left transition-opacity", !isWinner(match.away_category_id) && "opacity-0 invisible")}>
                                <Trophy className="h-3 w-3 mr-1" /> <span className="text-[10px]">Ganador</span>
                            </Badge>
                        ) : <div className="h-6" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {/* Sets Details */}
                {match.sets && match.sets.length > 0 ? (
                    <div className="flex justify-center gap-1.5 mt-2 flex-wrap pb-2">
                        {visibleSets?.map((set) => (
                            <Badge key={set.id} variant="outline" className="text-[10px] sm:text-xs font-mono px-1.5 py-0 bg-background/50 border-muted-foreground/20">
                                {set.home_score}-{set.away_score}
                            </Badge>
                        ))}
                        {hiddenSetsCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono px-1.5 py-0">+{hiddenSetsCount}</Badge>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <span className="text-[11px] text-muted-foreground/60 uppercase font-semibold tracking-wider italic">
                            Pendiente de resultado
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}