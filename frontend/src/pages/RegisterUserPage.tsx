import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AxiosError } from 'axios';
import { toast } from "sonner";

import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { cn } from "@/lib/utils";

// Componentes UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Esquema de validación con Zod
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterUserPage() {
    const { user: currentUser, isLoading } = useAuth();
    const navigate = useNavigate();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'PLAYER',
            full_name: '',
            phone: '',
            address: '',
            representative_data: { full_name: '', phone: '', relationship: '' }
        },
    });

    // Protección de ruta
    useEffect(() => {
        if (!isLoading && currentUser && !['ADMIN', 'COACH'].includes(currentUser.role)) {
            navigate('/');
        }
    }, [currentUser, isLoading, navigate]);

    // Lógica para detectar menor de edad
    const watchedRole = form.watch("role");
    const watchedBirthDate = form.watch("birth_date");
    
    const isMinor = () => {
        if (!watchedBirthDate) return false;
        const today = new Date();
        let age = today.getFullYear() - watchedBirthDate.getFullYear();
        const m = today.getMonth() - watchedBirthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < watchedBirthDate.getDate())) {
            age--;
        }
        return age < 18;
    };

    const showRepresentativeData = watchedRole === 'PLAYER' && isMinor();

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const dataToSend: any = { ...data };
            
            // Formatear fecha para el backend (YYYY-MM-DD)
            if (data.birth_date) {
                dataToSend.birth_date = format(data.birth_date, "yyyy-MM-dd");
            }

            // Limpiar datos no necesarios
            if (!showRepresentativeData) {
                delete dataToSend.representative_data;
            }

            await userService.createUser(dataToSend);
            toast.success(`Usuario ${data.email} creado exitosamente.`);
            form.reset();
            window.scrollTo(0, 0);
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            toast.error(axiosError.response?.data?.msg || 'Error al registrar usuario');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="flex justify-center p-4 md:p-8">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Registrar Nuevo Usuario</CardTitle>
                    <CardDescription>
                        Complete los datos para dar de alta un nuevo miembro en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* Datos de Cuenta */}
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
                                            <FormLabel>Contraseña</FormLabel>
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
                                                {currentUser?.role === 'ADMIN' && (
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

                            {/* Datos del Jugador */}
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

                                    {/* Datos de Contacto */}
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

                                    {/* Datos del Representante (Condicional) */}
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

                            <CardFooter className="px-0 pt-4 flex justify-between">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => navigate(-1)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-primary">
                                    Registrar Usuario
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
