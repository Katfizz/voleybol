import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Category } from "@/types/category.types";
import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createMatchSchema = z.object({
  home_category_id: z.string().min(1, "Seleccione equipo local"),
  away_category_id: z.string().min(1, "Seleccione equipo visitante"),
}).refine(data => data.home_category_id !== data.away_category_id, {
    message: "Los equipos deben ser diferentes",
    path: ["away_category_id"],
});

type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

interface CreateMatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onSubmit: (data: { home_category_id: number, away_category_id: number }) => Promise<void>;
}

export function CreateMatchDialog({ open, onOpenChange, categories, onSubmit }: CreateMatchDialogProps) {
    const form = useForm<CreateMatchFormValues>({
        resolver: zodResolver(createMatchSchema),
        defaultValues: {
            home_category_id: "",
            away_category_id: "",
        }
    });

    const handleSubmit = async (data: CreateMatchFormValues) => {
        await onSubmit({
            home_category_id: parseInt(data.home_category_id),
            away_category_id: parseInt(data.away_category_id),
        });
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Programar Partido</DialogTitle>
                    <DialogDescription>
                        Selecciona los equipos que se enfrentarán en este evento.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="home_category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipo Local</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar equipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    <span className="block truncate max-w-[280px]" title={cat.name}>
                                                        {cat.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="away_category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipo Visitante</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar equipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    <span className="block truncate max-w-[280px]" title={cat.name}>
                                                        {cat.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Crear Partido</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}