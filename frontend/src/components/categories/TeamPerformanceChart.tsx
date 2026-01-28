import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Match } from "@/types/match.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TeamPerformanceChartProps {
    matches: Match[];
    categoryId: number;
}

export function TeamPerformanceChart({ matches, categoryId }: TeamPerformanceChartProps) {
    // Procesar partidos para obtener datos cronológicos
    const data = matches
        .filter(m => m.event?.date_time) // Asegurar que existe fecha
        .sort((a, b) => new Date(a.event!.date_time).getTime() - new Date(b.event!.date_time).getTime())
        .map(m => {
            const isHome = m.home_category_id === categoryId;
            const opponent = isHome ? m.awayCategory?.name : m.homeCategory?.name;
            const setsWon = isHome ? m.home_sets_won : m.away_sets_won;
            const setsLost = isHome ? m.away_sets_won : m.home_sets_won;
            
            return {
                date: format(new Date(m.event!.date_time), "dd/MM", { locale: es }),
                fullDate: format(new Date(m.event!.date_time), "dd 'de' MMMM", { locale: es }),
                opponent,
                setsWon,
                setsLost,
                result: m.winner_category_id === categoryId ? "Victoria" : "Derrota"
            };
        });

    if (data.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Rendimiento</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm min-h-[200px]">
                    Sin partidos jugados
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Rendimiento de Temporada</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                <div className="flex flex-col">
                                                    <span className="uppercase text-muted-foreground text-[10px]">Fecha</span>
                                                    <span className="font-bold">{item.fullDate}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="uppercase text-muted-foreground text-[10px]">Resultado</span>
                                                    <span className={`font-bold ${item.result === 'Victoria' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {item.result}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 border-t my-1"></div>
                                                <div className="flex flex-col">
                                                    <span className="uppercase text-muted-foreground text-[10px]">Oponente</span>
                                                    <span className="font-medium">{item.opponent}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="uppercase text-muted-foreground text-[10px]">Sets</span>
                                                    <span className="font-mono font-bold">
                                                        {item.setsWon} - {item.setsLost}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Legend />
                        <Bar dataKey="setsWon" name="Sets Ganados" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="setsLost" name="Sets Perdidos" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}