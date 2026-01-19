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
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/matches/${match.id}`)}>
             {isAdminOrCoach && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={(e) => { e.stopPropagation(); onEdit?.(match); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete?.(match.id); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <CardHeader className="pb-2 pt-6">
                <div className="flex justify-between items-center gap-4">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className={cn("font-bold text-lg truncate max-w-[120px] mx-auto", isWinner(match.home_category_id) && "text-primary")} title={match.homeCategory?.name}>
                            {match.homeCategory?.name}
                        </div>
                        {isWinner(match.home_category_id) && <Badge variant="secondary" className="mt-1"><Trophy className="h-3 w-3 mr-1"/> Ganador</Badge>}
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center min-w-[80px]">
                        <div className="text-3xl font-black font-mono tracking-tighter">
                            {match.home_sets_won} - {match.away_sets_won}
                        </div>
                        <span className="text-xs text-muted-foreground uppercase font-bold">Sets</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className={cn("font-bold text-lg truncate max-w-[120px] mx-auto", isWinner(match.away_category_id) && "text-primary")} title={match.awayCategory?.name}>
                            {match.awayCategory?.name}
                        </div>
                        {isWinner(match.away_category_id) && <Badge variant="secondary" className="mt-1"><Trophy className="h-3 w-3 mr-1"/> Ganador</Badge>}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Sets Details */}
                {match.sets && match.sets.length > 0 ? (
                    <div className="flex justify-center gap-2 mt-2 flex-wrap">
                        {visibleSets?.map((set) => (
                            <Badge key={set.id} variant="outline" className="text-sm font-mono">
                                {set.home_score}-{set.away_score}
                            </Badge>
                        ))}
                        {hiddenSetsCount > 0 && (
                            <Badge variant="secondary" className="text-sm font-mono">+{hiddenSetsCount}</Badge>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-sm text-muted-foreground italic">
                        Sin resultados registrados
                    </div>
                )}
            </CardContent>
        </Card>
    );
}