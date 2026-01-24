import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Clock, Save, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { attendanceService } from "../../services/attendance.service";
import { type Category } from "../../types/category.types";
import { type AttendanceRecord, type AttendanceStatus } from "../../types/attendance.types";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AttendanceManagerProps {
    eventId: number;
    eventDate: string | Date;
    categories: Category[];
    isAdminOrCoach: boolean;
}

export function AttendanceManager({ eventId, eventDate, categories, isAdminOrCoach }: AttendanceManagerProps) {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(
        format(new Date(eventDate), "yyyy-MM-dd")
    );
    const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceRecord>>({});
    const [loading, setLoading] = useState(false);

    // Validar que las categorías tengan jugadores
    const hasPlayers = useMemo(() => categories.some(c => c.playerProfiles && c.playerProfiles.length > 0), [categories]);

    const loadAttendance = useCallback(async () => {
        setLoading(true);
        try {
            // Asumimos que el servicio acepta un parámetro de fecha opcional
            const response = await attendanceService.getByEvent(eventId, selectedDate) as { attendance?: AttendanceRecord[] } | AttendanceRecord[];
            
            const map: Record<number, AttendanceRecord> = {};
            // La respuesta puede venir como { attendance: [...] } o directamente el array
            let records: AttendanceRecord[] = [];
            
            if ('attendance' in response && Array.isArray(response.attendance)) {
                records = response.attendance;
            } else if (Array.isArray(response)) {
                records = response;
            }
            
            records.forEach((record) => {
                    map[record.player_profile_id] = {
                        player_profile_id: record.player_profile_id,
                        status: record.status,
                        notes: record.notes
                    };
                });
            setAttendanceMap(map);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar la asistencia");
        } finally {
            setLoading(false);
        }
    }, [eventId, selectedDate]);

    useEffect(() => {
        if (open && eventId) {
            loadAttendance();
        }
    }, [open, eventId, loadAttendance]);

    const handleStatusChange = (playerId: number, status: AttendanceStatus) => {
        setAttendanceMap(prev => ({
            ...prev,
            [playerId]: {
                player_profile_id: playerId,
                status,
                notes: prev[playerId]?.notes
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Filtrar usuarios fantasma: Solo enviar datos de jugadores que están actualmente en las categorías del evento
            const validPlayerIds = new Set<number>();
            categories.forEach(cat => {
                cat.playerProfiles?.forEach(p => validPlayerIds.add(p.id));
            });

            const attendances = Object.values(attendanceMap).filter(record => 
                validPlayerIds.has(record.player_profile_id)
            );

            if (attendances.length === 0) {
                toast.info("No hay registros válidos para guardar");
                setLoading(false);
                return;
            }

            await attendanceService.record(eventId, {
                date: selectedDate,
                attendances
            });
            toast.success("Asistencia guardada correctamente");
            setOpen(false);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.msg || "Error al guardar la asistencia";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!isAdminOrCoach) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto gap-2">
                    <Users className="h-4 w-4" />
                    Gestionar Asistencia
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Check className="h-6 w-6 text-primary" /> 
                        Control de Asistencia
                    </DialogTitle>
                    <DialogDescription>
                        Registra la asistencia por equipo. Selecciona la fecha correspondiente si el evento dura varios días.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-4 border-b">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="attendance-date" className="font-medium whitespace-nowrap">Fecha de Asistencia:</Label>
                        <div className="relative">
                            <Input 
                                id="attendance-date"
                                type="date" 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-auto pl-10"
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    {!hasPlayers && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                            <AlertCircle className="h-4 w-4" />
                            <span>No hay jugadores asignados a los equipos de este evento.</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden bg-background">
                    {categories.length > 0 ? (
                        <Tabs defaultValue={categories[0].id.toString()} className="h-full flex flex-col">
                            <div className="px-6 pt-4 pb-2 border-b">
                                <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 gap-2 flex-wrap">
                                    {categories.map(category => (
                                        <TabsTrigger 
                                            key={category.id} 
                                            value={category.id.toString()}
                                            className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2"
                                        >
                                            {category.name}
                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                {category.playerProfiles?.length || 0}
                                            </Badge>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {categories.map(category => (
                                <TabsContent key={category.id} value={category.id.toString()} className="flex-1 overflow-hidden mt-0 p-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-6 space-y-3">
                                            {category.playerProfiles && category.playerProfiles.length > 0 ? (
                                                category.playerProfiles.map(player => {
                                                    const status = attendanceMap[player.id]?.status;
                                                    return (
                                                        <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 border">
                                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                                        {getInitials(player.full_name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium leading-none">{player.full_name}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">{player.position || "Sin posición"}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant={status === 'PRESENT' ? 'default' : 'ghost'}
                                                                    className={cn("h-8 px-3 transition-all", status === 'PRESENT' ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" : "hover:bg-green-100 hover:text-green-700")}
                                                                    onClick={() => handleStatusChange(player.id, 'PRESENT')}
                                                                    title="Presente"
                                                                >
                                                                    <Check className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Presente</span>
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant={status === 'ABSENT' ? 'destructive' : 'ghost'}
                                                                    className={cn("h-8 px-3 transition-all", status === 'ABSENT' ? "shadow-sm" : "hover:bg-red-100 hover:text-red-700")}
                                                                    onClick={() => handleStatusChange(player.id, 'ABSENT')}
                                                                    title="Ausente"
                                                                >
                                                                    <X className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Ausente</span>
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant={status === 'EXCUSED' ? 'secondary' : 'ghost'}
                                                                    className={cn("h-8 px-3 transition-all", status === 'EXCUSED' ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 shadow-sm" : "hover:bg-yellow-50 hover:text-yellow-700")}
                                                                    onClick={() => handleStatusChange(player.id, 'EXCUSED')}
                                                                    title="Justificado"
                                                                >
                                                                    <Clock className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Justif.</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                                    <Users className="h-10 w-10 mb-2 opacity-20" />
                                                    <p>No hay jugadores asignados a este equipo.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                            <p>Este evento no tiene equipos asignados.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-muted/10">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="min-w-[140px]">
                        {loading ? (
                            <>Guardando...</>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
