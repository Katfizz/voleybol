import { type User } from "@/types/user.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User as UserIcon } from "lucide-react";

interface PlayerProfileSummaryProps {
    user: User;
}

export function PlayerProfileSummary({ user }: PlayerProfileSummaryProps) {
    const navigate = useNavigate();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <Card className="h-full bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <UserIcon className="h-5 w-5" /> Mi Perfil
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-background shadow-sm mb-3">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl">{getInitials(user.profile?.full_name || user.email)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{user.profile?.full_name || "Usuario"}</h3>
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                <Badge variant="secondary" className="mb-4">{user.profile?.position || "Sin posición"}</Badge>
                
                <Button variant="outline" className="w-full mt-auto" onClick={() => navigate('/profile')}>
                    Ver Perfil Completo
                </Button>
            </CardContent>
        </Card>
    );
}