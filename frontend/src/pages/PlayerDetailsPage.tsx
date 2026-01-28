import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { userService } from '../services/user.service';
import { statisticService } from '../services/statistic.service';
import { type User } from '../types/user.types';
import { type PlayerStatsData } from '../types/statistic.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlayerStatsCard } from '../components/users/PlayerStatsCard';

export default function PlayerDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<PlayerStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async (userId: number) => {
        try {
            const userData = await userService.getUser(userId);
            setUser(userData);

            if (userData.profile?.id) {
                try {
                    const statsData = await statisticService.getPlayerStats(userData.profile.id);
                    setStats(statsData);
                } catch (error) {
                    console.log("No se pudieron cargar las estadísticas o no existen", error);
                }
            }
        } catch {
            toast.error('Error al cargar el perfil del jugador');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id, loadData]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
    if (!user) return null;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Columna Izquierda: Info Básica */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-2xl">{getInitials(user.profile?.full_name || user.email)}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{user.profile?.full_name || "Usuario"}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                        <div className="mt-2">
                            <Badge variant="secondary">{user.profile?.position || "Sin posición"}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            {user.profile?.birth_date && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(user.profile.birth_date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                                </div>
                            )}
                            {user.profile?.contact_data?.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{user.profile.contact_data.phone}</span>
                                </div>
                            )}
                            {user.profile?.contact_data?.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{user.profile.contact_data.address}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Columna Derecha: Estadísticas */}
                <div className="md:col-span-2 space-y-6">
                    {stats ? (
                        <PlayerStatsCard data={stats} />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No hay estadísticas disponibles para este jugador.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
