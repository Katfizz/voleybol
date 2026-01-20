import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, UserPlus, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Category } from "@/types/category.types";
import { type User } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CategoryCardProps {
    category: Category;
    isAdminOrCoach: boolean;
    availablePlayers: User[];
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
    onAssignPlayer: (categoryId: number, playerId: number) => void;
    onRemovePlayer: (categoryId: number, playerId: number) => void;
}

export function CategoryCard({
    category,
    isAdminOrCoach,
    availablePlayers,
    onEdit,
    onDelete,
    onAssignPlayer,
    onRemovePlayer
}: CategoryCardProps) {
    const [selectedPlayer, setSelectedPlayer] = useState<string>("");
    const navigate = useNavigate();
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const filteredPlayers = useMemo(() => {
        return availablePlayers.filter(player => 
            !category.playerProfiles?.some(p => p.user?.id === player.id)
        );
    }, [availablePlayers, category.playerProfiles]);

    const handleAssign = () => {
        if (selectedPlayer) {
            onAssignPlayer(category.id, parseInt(selectedPlayer));
            setSelectedPlayer("");
        }
    };

    return (
        <Card className={cn(
            "group relative transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/20 h-fit cursor-pointer",
            isSelectOpen ? "z-50 rounded-b-none" : "hover:z-50 hover:rounded-b-none"
        )}
        onClick={() => navigate(`/categories/${category.id}`)}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-primary truncate pr-2">{category.name}</CardTitle>
                    {isAdminOrCoach && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-md p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => {
                                e.stopPropagation();
                                onEdit(category);
                            }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => {
                                e.stopPropagation();
                                onDelete(category.id);
                            }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <CardDescription className="truncate">
                    {category.description || "Sin descripción"}
                </CardDescription>
            </CardHeader>
            
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="flex gap-1 items-center">
                        <Users className="h-3 w-3" />
                        Plantilla
                    </Badge>
                    <Badge variant="outline">
                        {category._count?.playerProfiles || 0} Jugadores
                    </Badge>
                </div>

                {/* Sección Expandible */}
                <div className={cn(
                    "absolute left-[-1px] right-[-1px] bg-card border-x border-b rounded-b-xl shadow-lg z-10 px-6",
                    "transition-all duration-500 ease-in-out overflow-hidden",
                    "top-[calc(100%-1px)]",
                    isSelectOpen ? "max-h-[300px] py-4" : "max-h-0 py-0 group-hover:max-h-[300px] group-hover:py-4"
                )}
                onClick={(e) => e.stopPropagation()} // Evitar navegación al hacer clic en el área expandible
                >
                    <div className="pt-2 border-t space-y-3">
                        
                        {/* Lista de Jugadores con Scroll */}
                        <div className="max-h-[150px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            {category.playerProfiles && category.playerProfiles.length > 0 ? (
                                category.playerProfiles.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const userId = p.user?.id || p.userId;
                                            if (userId) navigate(`/players/${userId}`);
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{p.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{p.position || 'N/A'}</span>
                                        </div>
                                        {isAdminOrCoach && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const userId = p.user?.id || p.userId;
                                                    if (userId) onRemovePlayer(category.id, userId);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4 italic">No hay jugadores asignados.</p>
                            )}
                        </div>

                        {/* Agregar Jugador */}
                        {isAdminOrCoach && (
                            <div className="flex gap-2 pt-2">
                                <Select 
                                    value={selectedPlayer} 
                                    onValueChange={setSelectedPlayer}
                                    onOpenChange={setIsSelectOpen}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Agregar jugador..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredPlayers.length > 0 ? (
                                            filteredPlayers.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.profile?.full_name || p.email}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-muted-foreground text-center">No hay jugadores disponibles...</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button 
                                    size="icon" 
                                    className="h-9 w-9 shrink-0" 
                                    onClick={handleAssign}
                                    disabled={!selectedPlayer}
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
