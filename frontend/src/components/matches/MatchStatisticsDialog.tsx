import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { type Statistic, type CreateStatisticDTO } from "@/types/statistic.types";
import { type User } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type StatValues = {
    points: number | string;
    kills: number | string;
    blocks: number | string;
    aces: number | string;
    assists: number | string;
    digs: number | string;
    errors: number | string;
};

type MatchStatsFormValues = {
    stats: Record<string, StatValues>;
};

interface MatchStatisticsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    homePlayers: User[];
    awayPlayers: User[];
    homeTeamName: string;
    awayTeamName: string;
    existingStats: Statistic[];
    onSubmit: (data: CreateStatisticDTO) => Promise<void>;
}

export function MatchStatisticsDialog({
    open, onOpenChange, homePlayers, awayPlayers, homeTeamName, awayTeamName, existingStats, onSubmit
}: MatchStatisticsDialogProps) {
    const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MatchStatsFormValues>();

    useEffect(() => {
        if (open) {
            // Pre-llenar el formulario con datos existentes
            const statsData: Record<string, StatValues> = {};
            existingStats.forEach(stat => {
                statsData[stat.player_profile_id] = {
                    points: stat.points,
                    kills: stat.kills,
                    blocks: stat.blocks,
                    aces: stat.aces,
                    assists: stat.assists,
                    digs: stat.digs,
                    errors: stat.errors
                };
            });
            reset({ stats: statsData });
        }
    }, [open, existingStats, reset]);

    const onFormSubmit = async (data: MatchStatsFormValues) => {
        // Transformar datos del formulario al formato DTO
        const statsArray = [];
        if (data.stats) {
            for (const [playerId, stats] of Object.entries(data.stats)) {
                // Solo agregar si tiene al menos un valor
                if (Object.values(stats).some(val => val !== "" && val !== undefined)) {
                    statsArray.push({
                        player_profile_id: parseInt(playerId),
                        points: Number(stats.points) || 0,
                        kills: Number(stats.kills) || 0,
                        blocks: Number(stats.blocks) || 0,
                        aces: Number(stats.aces) || 0,
                        assists: Number(stats.assists) || 0,
                        digs: Number(stats.digs) || 0,
                        errors: Number(stats.errors) || 0,
                    });
                }
            }
        }
        await onSubmit({ stats: statsArray });
        onOpenChange(false);
    };

    const currentPlayers = activeTab === 'home' ? homePlayers : awayPlayers;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Registrar Estadísticas</DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4">
                    <div className="flex gap-2 mb-4 bg-muted/50 p-1 rounded-lg">
                        <Button
                            variant={activeTab === 'home' ? "default" : "ghost"}
                            onClick={() => setActiveTab('home')}
                            className="flex-1 truncate shadow-none rounded-md h-9"
                            title={homeTeamName}
                        >
                            <span className="truncate block">{homeTeamName}</span>
                        </Button>
                        <Button
                            variant={activeTab === 'away' ? "default" : "ghost"}
                            onClick={() => setActiveTab('away')}
                            className="flex-1 truncate shadow-none rounded-md h-9"
                            title={awayTeamName}
                        >
                            <span className="truncate block">{awayTeamName}</span>
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-auto px-6">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead className="w-[180px]">Jugador</TableHead>
                                    <TableHead className="text-center w-20">PTS</TableHead>
                                    <TableHead className="text-center w-20">Kills</TableHead>
                                    <TableHead className="text-center w-20">Blk</TableHead>
                                    <TableHead className="text-center w-20">Ace</TableHead>
                                    <TableHead className="text-center w-20">Ast</TableHead>
                                    <TableHead className="text-center w-20">Dig</TableHead>
                                    <TableHead className="text-center w-20">Err</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentPlayers.map(player => (
                                    <TableRow key={player.id}>
                                        <TableCell className="font-medium truncate max-w-[180px]" title={player.profile?.full_name}>
                                            {player.profile?.full_name}
                                        </TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.points`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.kills`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.blocks`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.aces`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.assists`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.digs`)} /></TableCell>
                                        <TableCell><Input type="number" min="0" className="w-16 h-8 text-center" {...register(`stats.${player.id}.errors`)} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter className="p-6 border-t bg-muted/5">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" /> Guardar Estadísticas
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}