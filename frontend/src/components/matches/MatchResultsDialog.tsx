import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { type Match } from "@/types/match.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

interface MatchResultsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    match: Match | null;
    onSubmit: (matchId: number, sets: { set_number: number, home_score: number, away_score: number }[]) => Promise<void>;
}

export function MatchResultsDialog({ open, onOpenChange, match, onSubmit }: MatchResultsDialogProps) {
    const form = useForm<{ sets: { home_score: number; away_score: number }[] }>({
        defaultValues: { sets: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sets"
    });

    useEffect(() => {
        if (match && open) {
            const existingSets = match.sets?.map(s => ({
                home_score: s.home_score,
                away_score: s.away_score
            })) || [{ home_score: 0, away_score: 0 }]; // Al menos un set por defecto

            form.reset({ sets: existingSets });
        }
    }, [match, open, form]);

    const handleSubmit = async (data: { sets: { home_score: number; away_score: number }[] }) => {
        if (!match) return;
        const formattedSets = data.sets.map((set, index) => ({
            set_number: index + 1,
            home_score: Number(set.home_score),
            away_score: Number(set.away_score)
        }));
        await onSubmit(match.id, formattedSets);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Resultados del Partido</DialogTitle>
                    <DialogDescription>
                        {match?.homeCategory?.name} vs {match?.awayCategory?.name}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2">
                                    <div className="w-8 pb-2 text-sm font-bold text-muted-foreground">
                                        S{index + 1}
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`sets.${index}.home_score`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Local</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`sets.${index}.away_score`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Visitante</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mb-0.5 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => append({ home_score: 0, away_score: 0 })}>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Set
                        </Button>

                        <DialogFooter>
                            <Button type="submit">Guardar Resultados</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}