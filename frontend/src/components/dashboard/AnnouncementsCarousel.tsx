import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Megaphone, Calendar, User } from "lucide-react";
import { type Announcement } from "@/types/announcement.types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AnnouncementsCarouselProps {
    announcements: Announcement[];
}

export function AnnouncementsCarousel({ announcements }: AnnouncementsCarouselProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    if (announcements.length === 0) return null;

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> Tablón de Anuncios
            </h3>
            <Carousel className="w-full flex flex-col flex-1" opts={{ align: "start", loop: true }}>
                <CarouselContent className="flex-1 -ml-1">
                    {announcements.map((announcement) => (
                        <CarouselItem key={announcement.id} className="basis-full pl-1 h-full">
                            <div className="h-full">
                                <Card 
                                    className="h-full cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary flex flex-col"
                                    onClick={() => setSelectedAnnouncement(announcement)}
                                >
                                    <CardContent className="p-6 flex flex-col h-full justify-between">
                                        <div>
                                            <h4 className="font-bold text-base mb-2 line-clamp-1">{announcement.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                                {announcement.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(announcement.created_at), "d MMM", { locale: es })}
                                            </span>
                                            {announcement.valid_until && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1">
                                                    Expira: {format(new Date(announcement.valid_until), "dd/MM")}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-3">
                    <CarouselPrevious className="static translate-y-0 h-8 w-8" />
                    <CarouselNext className="static translate-y-0 h-8 w-8" />
                </div>
            </Carousel>

            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-start gap-2">
                            <Megaphone className="h-5 w-5 text-primary mt-1 shrink-0" />
                            {selectedAnnouncement?.title}
                        </DialogTitle>
                        <DialogDescription className="flex flex-col gap-1 pt-2">
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {selectedAnnouncement && format(new Date(selectedAnnouncement.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                </span>
                                {selectedAnnouncement?.author?.profile?.full_name && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {selectedAnnouncement.author.profile.full_name}
                                    </span>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto pr-2">
                        {selectedAnnouncement?.content}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}