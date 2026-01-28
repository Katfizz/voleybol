import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, Shield, Zap, HandHelping, Activity, AlertTriangle, Eye, Search } from "lucide-react";
import { type PlayerStatsData } from "@/types/statistic.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlayerStatsCardProps {
    data: PlayerStatsData;
}

export function PlayerStatsCard({ data }: PlayerStatsCardProps) {
    const { summary, history } = data;
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredHistory = useMemo(() => {
        if (!historySearchTerm) return history;
        return history.filter(item =>
            item.match?.event?.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            item.match?.homeCategory?.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            item.match?.awayCategory?.name.toLowerCase().includes(historySearchTerm.toLowerCase())
        );
    }, [history, historySearchTerm]);

    const statItems = [
        { label: "Puntos", value: summary.totals.points, icon: Trophy, color: "text-yellow-500" },
        { label: "Ataques (Kills)", value: summary.totals.kills, icon: Target, color: "text-red-500" },
        { label: "Bloqueos", value: summary.totals.blocks, icon: Shield, color: "text-blue-500" },
        { label: "Aces", value: summary.totals.aces, icon: Zap, color: "text-purple-500" },
        { label: "Asistencias", value: summary.totals.assists, icon: HandHelping, color: "text-green-500" },
        { label: "Defensas (Digs)", value: summary.totals.digs, icon: Activity, color: "text-orange-500" },
        { label: "Errores", value: summary.totals.errors, icon: AlertTriangle, color: "text-gray-500" },
    ];

    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex justify-between items-center">
                        Estadísticas de Temporada
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-sm font-normal"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            {summary.matches_played} Partidos Jugados
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statItems.map((item) => (
                            <div key={item.label} className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                                <item.icon className={`h-5 w-5 mb-2 ${item.color}`} />
                                <span className="text-2xl font-bold">{item.value}</span>
                                <span className="text-xs text-muted-foreground text-center">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">
                                    Prom: {summary.averages[item.label === "Puntos" ? "points" : 
                                        item.label === "Ataques (Kills)" ? "kills" :
                                        item.label === "Bloqueos" ? "blocks" :
                                        item.label === "Aces" ? "aces" :
                                        item.label === "Asistencias" ? "assists" :
                                        item.label === "Defensas (Digs)" ? "digs" : "errors"]}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Historial de Partidos</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por evento o equipo..."
                            value={historySearchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHistorySearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-3">
                        {filteredHistory && filteredHistory.length > 0 ? (
                            filteredHistory.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/matches/${item.match_id}`)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-xs text-muted-foreground truncate max-w-[250px]">
                                            {item.match?.event?.name || "Partido"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {item.match?.event?.date_time ? format(new Date(item.match.event.date_time), "dd/MM/yyyy", { locale: es }) : "-"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-sm font-medium truncate text-right flex-1">{item.match?.homeCategory?.name}</span>
                                        <span className="text-xl font-black font-mono tracking-widest">
                                            {item.match?.home_sets_won} - {item.match?.away_sets_won}
                                        </span>
                                        <span className="text-sm font-medium truncate text-left flex-1">{item.match?.awayCategory?.name}</span>
                                    </div>

                                    <div className="text-xs text-muted-foreground grid grid-cols-4 gap-2 bg-muted/20 p-2 rounded">
                                        <div className="flex flex-col items-center"><span className="font-bold text-foreground text-base">{item.points}</span><span className="text-[10px] uppercase">PTS</span></div>
                                        <div className="flex flex-col items-center"><span className="font-bold text-foreground text-base">{item.kills}</span><span className="text-[10px] uppercase">Kills</span></div>
                                        <div className="flex flex-col items-center"><span className="font-bold text-foreground text-base">{item.blocks}</span><span className="text-[10px] uppercase">Blk</span></div>
                                        <div className="flex flex-col items-center"><span className="font-bold text-foreground text-base">{item.aces}</span><span className="text-[10px] uppercase">Ace</span></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">{historySearchTerm ? "No se encontraron partidos." : "No hay historial disponible."}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}