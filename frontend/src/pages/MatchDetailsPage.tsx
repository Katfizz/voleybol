import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";

import { matchService } from '../services/match.service';
import { type Match } from '../types/match.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MatchDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [match, setMatch] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadMatch(parseInt(id));
        }
    }, [id]);

    const loadMatch = async (matchId: number) => {
        try {
            const data = await matchService.getById(matchId);
            setMatch(data);
        } catch {
            toast.error('Error al cargar el partido');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando detalles del partido...</div>;
    if (!match) return null;

    const isWinner = (categoryId: number) => match.winner_category_id === categoryId;

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>

            <Card>
                <CardHeader className="text-center border-b bg-muted/10 pb-8">
                    <CardDescription className="mb-2 uppercase tracking-widest text-xs font-bold">Resultado Final</CardDescription>
                    <div className="flex justify-between items-center gap-4 md:gap-12">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center">
                            <CardTitle className={cn("text-2xl md:text-3xl mb-2", isWinner(match.home_category_id) && "text-primary")}>
                                {match.homeCategory?.name}
                            </CardTitle>
                            {isWinner(match.home_category_id) && <Badge variant="secondary"><Trophy className="h-3 w-3 mr-1"/> Ganador</Badge>}
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center px-4">
                            <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter">
                                {match.home_sets_won} - {match.away_sets_won}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center">
                            <CardTitle className={cn("text-2xl md:text-3xl mb-2", isWinner(match.away_category_id) && "text-primary")}>
                                {match.awayCategory?.name}
                            </CardTitle>
                            {isWinner(match.away_category_id) && <Badge variant="secondary"><Trophy className="h-3 w-3 mr-1"/> Ganador</Badge>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <h3 className="text-lg font-semibold mb-4 text-center">Detalle de Sets</h3>
                    <div className="space-y-2 max-w-md mx-auto">
                        {match.sets && match.sets.length > 0 ? (
                            match.sets.map((set) => (
                                <div key={set.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                                    <span className="font-bold text-muted-foreground w-12">Set {set.set_number}</span>
                                    <span className="font-mono text-lg font-medium">{set.home_score} - {set.away_score}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground italic">No hay sets registrados.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}