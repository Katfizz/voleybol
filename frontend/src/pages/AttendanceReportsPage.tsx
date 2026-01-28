import { useEffect, useState, useCallback } from 'react';
import { toast } from "sonner";
import { BarChart2, Users, FileText, Download, ArrowRight } from "lucide-react";

import { attendanceService } from '../services/attendance.service';
import { categoryService } from '../services/category.service';
import { type Category } from '../types/category.types';
import { type AttendanceReport } from '../types/attendance.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// ... (rest of imports)

export default function AttendanceReportsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [report, setReport] = useState<AttendanceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchingReport, setFetchingReport] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch {
            toast.error('Error al cargar equipos');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = useCallback(async (id: number) => {
        setFetchingReport(true);
        try {
            const data = await attendanceService.getReport(id);
            setReport(data);
        } catch {
            toast.error('Error al generar el reporte');
        } finally {
            setFetchingReport(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            loadReport(parseInt(selectedCategoryId));
        }
    }, [selectedCategoryId, loadReport]);

    const exportToExcel = async () => {
        if (!report) return;
        try {
            await attendanceService.downloadReportExcel(report.category.id, report.category.name);
            toast.success('Reporte Excel generado correctamente');
        } catch {
            toast.error('Error al generar el reporte Excel');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                        <BarChart2 className="h-8 w-8" /> Reportes de Asistencia
                    </h1>
                    <p className="text-muted-foreground mt-1">Consulta y exporta el historial de participación de tus equipos.</p>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger className="w-full md:w-[250px] bg-background truncate">
                            <SelectValue placeholder="Selecciona un equipo" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[300px]">
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()} title={cat.name} className="truncate">
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {report && (
                        <Button variant="outline" onClick={exportToExcel} className="shrink-0">
                            <Download className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Exportar</span>
                        </Button>
                    )}
                </div>
            </div>

            {fetchingReport ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">Generando reporte...</p>
                </div>
            ) : report ? (
                <div className="space-y-6">
                    {/* Resumen del equipo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-primary/5 border-primary/10">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider">Equipo</CardDescription>
                                <CardTitle className="text-2xl truncate" title={report.category.name}>{report.category.name}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider">Total de Eventos</CardDescription>
                                <CardTitle className="text-2xl">{report.category.total_events}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="text-xs font-bold uppercase tracking-wider">Jugadores Registrados</CardDescription>
                                <CardTitle className="text-2xl text-primary">{report.players.length}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card className="shadow-sm border-0 bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" /> Estadísticas por Jugador
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[250px]">Jugador</TableHead>
                                        <TableHead className="hidden md:table-cell">Posición</TableHead>
                                        <TableHead className="text-center">Asistencias</TableHead>
                                        <TableHead className="text-right">Efectividad</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.players.map((player) => (
                                        <TableRow key={player.player_id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{player.full_name}</span>
                                                    <span className="md:hidden text-xs text-muted-foreground">{player.position || "-"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="outline">{player.position || "N/A"}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                                                        {player.stats.present} P
                                                    </Badge>
                                                    <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                                                        {player.stats.absent} A
                                                    </Badge>
                                                    <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">
                                                        {player.stats.excused} J
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-mono font-bold">{player.stats.rate}%</span>
                                                    <div className="h-1.5 w-24 bg-muted overflow-hidden rounded-full">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${player.stats.rate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/20 rounded-2xl border border-dashed">
                    <div className="bg-background p-4 rounded-full shadow-sm border">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No se ha seleccionado ningún equipo</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Selecciona una categoría arriba para generar el reporte de asistencias interactivo.</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary animate-bounce rotate-[-90deg] hidden md:block" />
                </div>
            )}
        </div>
    );
}
