import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {  type Category } from "@/types/category.types";

interface TopTeam extends Category {
    stats: {
        wins: number;
        losses: number;
        winRate: number;
    };
}

interface TopTeamsCarouselProps {
    teams: TopTeam[];
}

export function TopTeamsCarousel({ teams }: TopTeamsCarouselProps) {
    if (teams.length === 0) return null;

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Mejores Equipos
            </h3>
            <Carousel className="w-full group relative flex-1" opts={{ loop: true }}>
                <CarouselContent className="h-full">
                    {teams.map((team, index) => (
                        <CarouselItem key={team.id} className="basis-full h-full">
                            <div className="p-1 h-full">
                                <Card className="h-full flex flex-col justify-center">
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                        <div className="relative mb-4">
                                            <Trophy className={`h-12 w-12 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-lg mb-1 truncate w-full" title={team.name}>{team.name}</h4>
                                        <div className="flex items-center gap-4 text-sm mt-2">
                                            <div className="flex items-center gap-1 text-green-600">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="font-bold">{team.stats.wins}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-red-500">
                                                <TrendingDown className="h-4 w-4" />
                                                <span className="font-bold">{team.stats.losses}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-2">{team.stats.winRate}% Victorias</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm" />
            </Carousel>
        </div>
    );
}