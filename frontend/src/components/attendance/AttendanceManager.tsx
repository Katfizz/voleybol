import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Check, X, AlertCircle, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { attendanceService } from "@/services/attendance.service";
import { type Category } from "@/types/category.types";
import { type AttendanceStatus } from "@/types/attendance.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AttendanceManagerProps {
    eventId: number;
    eventDate: string;
    categories: Category[];
    isAdminOrCoach: boolean;
}

interface AttendanceState {
    status?: AttendanceStatus;
    notes: string;
    recordedBy?: string;
}

export function AttendanceManager({ eventId, eventDate, categories, isAdminOrCoach }: AttendanceManagerProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Mapa de ID de jugador -> Estado de asistencia
    const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceState>>({});
    const [isConflictOpen, setIsConflictOpen] = useState(false);
    const [conflictMessage, setConflictMessage] = useState("");

    // Obtener todos los jugadores únicos de las categorías del evento
    const players = categories.flatMap(c => c.playerProfiles || []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const loadAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const dateStr = format(new Date(eventDate), "yyyy-MM-dd");
            const data = await attendanceService.getByEvent(eventId, dateStr);
            
            const newMap: Record<number, AttendanceState> = {};
            data.forEach(record => {
                newMap[record.player_profile_id] = {
                    status: record.status,
                    notes: record.notes || "",
                    recordedBy: record.recorded_by?.email
                };
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
            const attendances = Object.entries(attendanceMap).map(([id, data]) => ({
                player_profile_id: parseInt(id),
                status: data.status!,
                notes: data.notes
            })).filter(a => a.status);

            await attendanceService.record(eventId, {
                date: dateStr,
                attendances
            });
            toast.success("Asistencia guardada correctamente");
            loadAttendance(); // Recargar para asegurar consistencia
        } catch (error) {
            const err = error as AxiosError<{ error: { message: string } }>;
            if (err.response?.status === 409) {
                setConflictMessage(err.response.data.error?.message || "Ya existen registros de asistencia para estos jugadores.");
                setIsConflictOpen(true);
            } else {
                toast.error("Error al guardar asistencia");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleOverwrite = async () => {
        setIsConflictOpen(false);
        setSaving(true);
        try {
            const dateStr = format(new Date(eventDate), "yyyy-MM-dd");
            
            // 1. Obtener las asistencias actuales para saber cuáles borrar
            const currentRecords = await attendanceService.getByEvent(eventId, dateStr);
            
            // 2. Filtrar las que corresponden a los jugadores que estamos intentando guardar
            // (Borramos cualquier registro existente de los jugadores en nuestra lista actual)
            const recordsToDelete = currentRecords.filter(r => attendanceMap[r.player_profile_id] !== undefined);
            
            // 3. Eliminar los registros conflictivos
            await Promise.all(recordsToDelete.map(r => attendanceService.delete(r.id)));

            // 4. Volver a intentar guardar (ahora no debería haber conflicto)
            const attendances = Object.entries(attendanceMap).map(([id, data]) => ({
                player_profile_id: parseInt(id),
                status: data.status!,
                notes: data.notes
            })).filter(a => a.status);

            await attendanceService.record(eventId, { date: dateStr, attendances });
            
            toast.success("Asistencia actualizada correctamente");
            loadAttendance();
        } catch {
            toast.error("Error al sobrescribir la asistencia");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = (playerId: number) => {
        if (!isAdminOrCoach) return;
        
        const current = attendanceMap[playerId] || { notes: "" };
        const currentStatus = current.status;

        const statusCycle: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'EXCUSED'];
        const nextIndex = currentStatus ? (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length : 0;
        
        setAttendanceMap(prev => ({
            ...prev,
            [playerId]: { ...current, status: statusCycle[nextIndex] }
        }));
    };

    const handleNoteChange = (playerId: number, note: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [playerId]: { ...(prev[playerId] || { status: undefined }), notes: note }
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
                                className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-medium">{player.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{player.position || 'Sin posición'}</p>
                                    </div>
                                    <div 
                                        onClick={() => toggleStatus(player.id)}
                                        className={cn("cursor-pointer", isAdminOrCoach ? "hover:opacity-80" : "pointer-events-none")}
                                    >
                                        {getStatusBadge(attendanceMap[player.id]?.status)}
                                    </div>
                                </div>
                                
                                <Input 
                                    placeholder="Notas (opcional)..." 
                                    value={attendanceMap[player.id]?.notes || ""}
                                    onChange={(e) => handleNoteChange(player.id, e.target.value)}
                                    className="h-8 text-xs"
                                    disabled={!isAdminOrCoach}
                                />
                                {attendanceMap[player.id]?.recordedBy && (
                                    <p className="text-[10px] text-muted-foreground text-right mt-1">
                                        Registrado por: {attendanceMap[player.id]?.recordedBy}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No hay jugadores asignados a los equipos de este evento.</p>
                    )}
                </div>
            </CardContent>

            <ConfirmDialog 
                open={isConflictOpen}
                onOpenChange={setIsConflictOpen}
                onConfirm={handleOverwrite}
                title="Asistencia ya registrada"
                description={`${conflictMessage} ¿Deseas sobrescribir estos registros con los nuevos datos?`}
                confirmText="Sobrescribir"
            />
        </Card>
    );
}