import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Megaphone, Calendar, Edit, Trash2, User } from "lucide-react";
import { type Announcement } from "@/types/announcement.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
    announcement: Announcement;
    currentUserId?: number;
    currentUserRole?: string;
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: number) => void;
}

export function AnnouncementCard({ announcement, currentUserId, currentUserRole, onEdit, onDelete }: AnnouncementCardProps) {
    const isAuthor = announcement.author_id === currentUserId;
    const isAdmin = currentUserRole === 'ADMIN';
    const canManage = isAdmin || isAuthor;

    return (
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1 pr-8">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            {announcement.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(announcement.created_at), "d 'de' MMMM", { locale: es })}
                            </span>
                            {announcement.author?.profile?.full_name && (
                                <span className="flex items-center gap-1">
                                    • <User className="h-3 w-3" /> {announcement.author.profile.full_name}
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    {canManage && (
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(announcement)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(announcement.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                </p>
            </CardContent>
            {announcement.valid_until && (
                <CardFooter className="pt-0 pb-3">
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Válido hasta: {format(new Date(announcement.valid_until), "dd/MM/yyyy")}
                    </Badge>
                </CardFooter>
            )}
        </Card>
    );
}