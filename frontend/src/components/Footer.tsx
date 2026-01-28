import { Trophy } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                        <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">VoleyApp</span>
                </div>
                
                <p className="text-xs text-muted-foreground text-center md:text-right">
                    &copy; {new Date().getFullYear()} Club de Voleibol. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}