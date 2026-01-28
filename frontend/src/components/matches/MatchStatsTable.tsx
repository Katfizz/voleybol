import { type Statistic } from "@/types/statistic.types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface MatchStatsTableProps {
    stats: Statistic[];
    teamName: string;
}

export function MatchStatsTable({ stats, teamName }: MatchStatsTableProps) {
    if (stats.length === 0) {
        return (
            <div className="border rounded-md overflow-hidden">
                <div className="bg-muted/50 p-2 font-semibold text-center border-b truncate px-4" title={teamName}>
                    {teamName}
                </div>
                <div className="text-center text-muted-foreground py-8 italic">No hay estadísticas registradas.</div>
            </div>
        );
    }

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="bg-muted/50 p-2 font-semibold text-center border-b truncate px-4" title={teamName}>
                {teamName}
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-center" title="Puntos Totales">PTS</TableHead>
                        <TableHead className="text-center" title="Ataques (Kills)">K</TableHead>
                        <TableHead className="text-center" title="Bloqueos">BLK</TableHead>
                        <TableHead className="text-center" title="Aces (Saques)">ACE</TableHead>
                        <TableHead className="text-center" title="Asistencias">AST</TableHead>
                        <TableHead className="text-center" title="Defensas (Digs)">DIG</TableHead>
                        <TableHead className="text-center" title="Errores">ERR</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stats.map((stat) => (
                        <TableRow key={stat.id}>
                            <TableCell className="font-medium">{stat.player_profile?.full_name}</TableCell>
                            <TableCell className="text-center font-bold">{stat.points}</TableCell>
                            <TableCell className="text-center">{stat.kills}</TableCell>
                            <TableCell className="text-center">{stat.blocks}</TableCell>
                            <TableCell className="text-center">{stat.aces}</TableCell>
                            <TableCell className="text-center">{stat.assists}</TableCell>
                            <TableCell className="text-center">{stat.digs}</TableCell>
                            <TableCell className="text-center text-destructive font-medium">{stat.errors}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}