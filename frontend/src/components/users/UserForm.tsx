import { useForm, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Esquema dinámico según el modo (edición o creación)
const getUserSchema = (isEditMode: boolean) => z.object({
  email: z.string().email("Email inválido"),
  password: isEditMode 
    ? z.string().optional() 
    : z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "COACH", "PLAYER"]),
  full_name: z.string().optional(),
  position: z.string().optional(),
  birth_date: z.date().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  representative_data: z.object({
    full_name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  // Validar contraseña en edición solo si se escribe algo
  if (isEditMode && data.password && data.password.length > 0 && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La contraseña debe tener al menos 6 caracteres",
        path: ['password'],
      });
  }

  // Validaciones condicionales para PLAYER
  if (data.role === 'PLAYER') {
    if (!data.full_name || data.full_name.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre es requerido para jugadores",
        path: ['full_name'],
      });
    }
    if (!data.position) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La posición es requerida",
        path: ['position'],
      });
    }
    if (!data.birth_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de nacimiento es requerida",
        path: ['birth_date'],
      });
    }
  }
});

export type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;

interface UserFormProps {
    defaultValues?: Partial<UserFormValues>;
    onSubmit: (data: UserFormValues) => Promise<void>;
    isEditMode?: boolean;
    currentUserRole?: string;
    onCancel: () => void;
    submitLabel?: string;
}

export function UserForm({ 
    defaultValues, 
    onSubmit, 
    isEditMode = false, 
    currentUserRole, 
    onCancel,
    submitLabel = "Guardar"
}: UserFormProps) {
    const schema = getUserSchema(isEditMode);
    // Normalize incoming defaultValues.birth_date when it's a string like "YYYY-MM-DD"
    // to a Date constructed in local time. This prevents off-by-one day issues caused
    // by parsing date-only ISO strings as UTC (which can shift the day in local TZ).
    const normalizedDefaultValues: Partial<UserFormValues> | undefined = defaultValues
        ? {
              ...defaultValues,
              birth_date: defaultValues.birth_date
                  ? typeof defaultValues.birth_date === "string"
                      ? // If the string is a simple date (yyyy-MM-dd), parse it into local Date
                        /^\d{4}-\d{2}-\d{2}$/.test(defaultValues.birth_date)
                          ? parse(defaultValues.birth_date, "yyyy-MM-dd", new Date())
                          : // Otherwise, try to construct Date from the string (may include time/offset)
                            new Date(defaultValues.birth_date)
                      : defaultValues.birth_date
                  : undefined,
          }
        : undefined;

    const form = useForm<UserFormValues>({
        resolver: zodResolver(schema),
        defaultValues: normalizedDefaultValues || {
            role: 'PLAYER',
            full_name: '',
            phone: '',
            address: '',
            representative_data: { full_name: '', phone: '', relationship: '' },
            password: ''
        },
    });

    const watchedRole = useWatch({ control: form.control, name: "role" }) as
        | UserFormValues["role"]
        | undefined;

    const watchedBirthDate = useWatch({ control: form.control, name: "birth_date" }) as
        | UserFormValues["birth_date"]
        | undefined;

    const isMinor = useMemo(() => {
        if (!watchedBirthDate) return false;
        const today = new Date();
        let age = today.getFullYear() - watchedBirthDate.getFullYear();
        const m = today.getMonth() - watchedBirthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < watchedBirthDate.getDate())) {
            age--;
        }
        return age < 18;
    }, [watchedBirthDate]);

    const showRepresentativeData = watchedRole === "PLAYER" && isMinor;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="usuario@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña {isEditMode && "(Dejar en blanco para mantener)"}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un rol" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currentUserRole === 'ADMIN' && (
                                        <>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="COACH">Entrenador</SelectItem>
                                        </>
                                    )}
                                    <SelectItem value="PLAYER">Jugador</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchedRole === 'PLAYER' && (
                    <div className="space-y-4 border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium">Perfil del Jugador</h3>
                        
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Posición</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione posición" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Setter">Armador (Setter)</SelectItem>
                                                <SelectItem value="Outside Hitter">Punta (Outside Hitter)</SelectItem>
                                                <SelectItem value="Opposite Hitter">Opuesto (Opposite Hitter)</SelectItem>
                                                <SelectItem value="Middle Blocker">Central (Middle Blocker)</SelectItem>
                                                <SelectItem value="Libero">Líbero</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="birth_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Nacimiento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Seleccione una fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    captionLayout="dropdown"
                                                    startMonth={new Date(1900, 0)}
                                                    endMonth={new Date(new Date().getFullYear(), 11)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+54 9 ..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Calle 123..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {showRepresentativeData && (
                            <div className="bg-muted/50 p-4 rounded-lg border border-dashed border-primary/30 mt-4">
                                <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                    ⚠️ Jugador menor de edad - Datos del Representante
                                </h4>
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="representative_data.full_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre del Representante</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="representative_data.phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Teléfono</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="representative_data.relationship"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Parentesco</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Padre, Madre..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel}
                        disabled={form.formState.isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
}