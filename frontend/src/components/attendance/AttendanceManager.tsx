import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Check, X, AlertCircle, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { attendanceService } from "@/services/attendance.service";
import { type Category } from "@/types/category.types";
import { type AttendanceStatus } from "@/types/attendance.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AttendanceManagerProps {
    eventId: number;
    eventDate: string;
    categories: Category[];
    isAdminOrCoach: boolean;
}

export function AttendanceManager({ eventId, eventDate, categories, isAdminOrCoach }: AttendanceManagerProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Mapa de ID de jugador -> Estado de asistencia
    const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({});

    // Obtener todos los jugadores únicos de las categorías del evento
    const players = categories.flatMap(c => c.playerProfiles || []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const loadAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const dateStr = format(new Date(eventDate), "yyyy-MM-dd");
            const data = await attendanceService.getByEvent(eventId, dateStr);
            
            const newMap: Record<number, AttendanceStatus> = {};
            data.forEach(record => {
                newMap[record.player_profile_id] = record.status;
            });
            setAttendanceMap(newMap);
        } catch {
            toast.error("Error al cargar asistencia");
        } finally {
            setLoading(false);
        }
    }, [eventDate, eventId]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const dateStr = format(new Date(eventDate), "yyyy-MM-dd");
            const attendances = Object.entries(attendanceMap).map(([id, status]) => ({
                player_profile_id: parseInt(id),
                status
            }));

            await attendanceService.record(eventId, {
                date: dateStr,
                attendances
            });
            toast.success("Asistencia guardada correctamente");
        } catch {
            toast.error("Error al guardar asistencia");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = (playerId: number, currentStatus?: AttendanceStatus) => {
        if (!isAdminOrCoach) return;
        
        const statusCycle: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'EXCUSED'];
        const nextIndex = currentStatus ? (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length : 0;
        
        setAttendanceMap(prev => ({
            ...prev,
            [playerId]: statusCycle[nextIndex]
        }));
    };

    const getStatusBadge = (status?: AttendanceStatus) => {
        switch (status) {
            case 'PRESENT': return <Badge className="bg-green-500 hover:bg-green-600"><Check className="w-3 h-3 mr-1" /> Presente</Badge>;
            case 'ABSENT': return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Ausente</Badge>;
            case 'EXCUSED': return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Justificado</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground">Sin registrar</Badge>;
        }
    };

    if (loading) return <div className="text-center py-4">Cargando lista de jugadores...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Control de Asistencia</CardTitle>
                {isAdminOrCoach && (
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {players.length > 0 ? (
                        players.map(player => (
                            <div 
                                key={player.id} 
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    isAdminOrCoach ? "cursor-pointer hover:bg-accent" : ""
                                )}
                                onClick={() => toggleStatus(player.id, attendanceMap[player.id])}
                            >
                                <div>
                                    <p className="font-medium">{player.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{player.position || 'Sin posición'}</p>
                                </div>
                                <div>
                                    {getStatusBadge(attendanceMap[player.id])}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No hay jugadores asignados a los equipos de este evento.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}