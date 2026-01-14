import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { Label } from "@/components/ui/label";

// Definimos la estructura de los datos del formulario
interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError('');
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch (err: any) {
            // Si el backend devuelve un mensaje de error, lo mostramos
            setError(err.response?.data?.msg || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu correo y contraseña para acceder
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            {/* Campo Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    {...register("email", { required: "El email es requerido" })}
                                />
                                {errors.email && (
                                    <span className="text-red-500 text-xs">{errors.email.message}</span>
                                )}
                            </div>

                            {/* Campo Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password", { required: "La contraseña es requerida" })}
                                />
                                {errors.password && (
                                    <span className="text-red-500 text-xs">{errors.password.message}</span>
                                )}
                            </div>
                            
                            {/* Mensaje de Error General */}
                            {error && (
                                <div className="p-2 text-sm text-red-500 bg-red-50 rounded border border-red-200 text-center">
                                    {error}
                                </div>
                            )}
                            
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Cargando...' : 'Ingresar'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        Sistema de Gestión de Voleibol
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}