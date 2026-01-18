import { format } from "date-fns";
import { Mail, Phone, MapPin, Calendar, User as UserIcon, Shield, LogOut } from "lucide-react";
import { type User } from '../../types/user.types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserProfileProps {
    user: User;
    onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'destructive';
            case 'COACH': return 'default';
            case 'PLAYER': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                        <AvatarImage src="" alt={user.profile?.full_name} />
                        <AvatarFallback className="text-2xl">
                            {getInitials(user.profile?.full_name || user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-2">
                        <CardTitle className="text-3xl font-bold">
                            {user.profile?.full_name || 'Usuario sin nombre'}
                        </CardTitle>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge variant={getRoleBadgeVariant(user.role)} className="px-3 py-1">
                                {user.role}
                            </Badge>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </span>
                        </div>
                    </div>
                    <div className="md:ml-auto">
                            <Button variant="destructive" onClick={onLogout} size="sm">
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6 space-y-8">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-primary" /> Información Personal
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Fecha de Nacimiento:</span>
                                <span>
                                    {user.profile?.birth_date 
                                        ? format(new Date(user.profile.birth_date), "dd/MM/yyyy") 
                                        : 'No registrada'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Posición:</span>
                                <span>{user.profile?.position || 'No definida'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" /> Contacto
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Teléfono:</span>
                                <span>{user.profile?.contact_data?.phone || 'No registrado'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Dirección:</span>
                                <span>{user.profile?.contact_data?.address || 'No registrada'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Datos del Representante (si existen) */}
                {user.profile?.representative_data && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" /> Datos del Representante
                            </h3>
                            <div className="bg-muted/30 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="block font-medium text-muted-foreground">Nombre</span>
                                    <span>{user.profile.representative_data.full_name}</span>
                                </div>
                                <div>
                                    <span className="block font-medium text-muted-foreground">Relación</span>
                                    <span>{user.profile.representative_data.relationship}</span>
                                </div>
                                <div>
                                    <span className="block font-medium text-muted-foreground">Teléfono</span>
                                    <span>{user.profile.representative_data.phone}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}