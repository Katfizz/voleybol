import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { AxiosError } from 'axios';
import { toast } from "sonner";

import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { UserForm, type UserFormValues } from '../components/users/UserForm';

// Componentes UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterUserPage() {
    const { user: currentUser, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formKey, setFormKey] = useState(0);

    // Protección de ruta
    useEffect(() => {
        if (!isLoading && currentUser && !['ADMIN', 'COACH'].includes(currentUser.role)) {
            navigate('/');
        }
    }, [currentUser, isLoading, navigate]);

    const onSubmit = async (data: UserFormValues) => {
        try {
            const dataToSend: Record<string, unknown> = { ...data };
            
            // Formatear fecha para el backend (YYYY-MM-DD)
            if (data.birth_date) {
                dataToSend.birth_date = format(data.birth_date, "yyyy-MM-dd");
            }

            // Limpieza de datos
            if (data.role !== 'PLAYER') {
                delete dataToSend.representative_data;
                delete dataToSend.position;
                delete dataToSend.birth_date;
            } else if (data.birth_date) {
                // Verificar si es menor para limpiar representative_data si es mayor
                const today = new Date();
                let age = today.getFullYear() - data.birth_date.getFullYear();
                const m = today.getMonth() - data.birth_date.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < data.birth_date.getDate())) {
                    age--;
                }
                if (age >= 18) {
                    delete dataToSend.representative_data;
                }
            }

            await userService.createUser(dataToSend as any);
            toast.success(`Usuario ${data.email} creado exitosamente.`);
            setFormKey(prev => prev + 1); // Reiniciar formulario
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
                    <UserForm 
                        key={formKey}
                        onSubmit={onSubmit} 
                        currentUserRole={currentUser?.role}
                        onCancel={() => navigate(-1)}
                        submitLabel="Registrar Usuario"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
