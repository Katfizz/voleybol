import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { format } from "date-fns";

import { UserForm, type UserFormValues } from '../components/users/UserForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [initialData, setInitialData] = useState<Partial<UserFormValues> | undefined>(undefined);

    // Protección de ruta
    useEffect(() => {
        if (!authLoading && currentUser && !['ADMIN', 'COACH'].includes(currentUser.role)) {
            navigate('/');
        }
    }, [currentUser, authLoading, navigate]);

    // Cargar datos del usuario
    useEffect(() => {
        if (id) {
            const loadUser = async () => {
                try {
                    const user = await userService.getUser(parseInt(id));
                    
                    // Mapear datos del usuario al formulario
                    const formData: any = {
                        email: user.email,
                        role: user.role,
                        password: '', // Contraseña vacía por defecto (no cambiar)
                    };

                    if (user.profile) {
                        formData.full_name = user.profile.full_name;
                        formData.position = user.profile.position;
                        if (user.profile.birth_date) {
                            formData.birth_date = new Date(user.profile.birth_date);
                        }
                        if (user.profile.contact_data) {
                            formData.phone = user.profile.contact_data.phone;
                            formData.address = user.profile.contact_data.address;
                        }
                        if (user.profile.representative_data) {
                            formData.representative_data = user.profile.representative_data;
                        }
                    }
                    setInitialData(formData);
                } catch {
                    toast.error('Error al cargar el usuario');
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        }
    }, [id]);

    const onSubmit = async (data: UserFormValues) => {
        try {
            const dataToSend: any = { ...data };
            
            // Formatear fecha para el backend
            if (data.birth_date) {
                dataToSend.birth_date = format(data.birth_date, "yyyy-MM-dd");
            }

            if (!dataToSend.password)  delete dataToSend.password; // No enviar si está vacía

            if (id) {
                await userService.updateUser(parseInt(id), dataToSend);
                toast.success('Usuario actualizado exitosamente.');
                setTimeout(() => navigate('/users'), 1500);
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            toast.error(axiosError.response?.data?.msg || 'Error al actualizar usuario');
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="flex justify-center p-4 md:p-8">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">Editar Usuario</CardTitle>
                    <CardDescription>
                        Modifique los datos del usuario seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {initialData && (
                        <UserForm 
                            defaultValues={initialData}
                            onSubmit={onSubmit} 
                            isEditMode={true}
                            currentUserRole={currentUser?.role}
                            onCancel={() => navigate('/users')}
                            submitLabel="Actualizar Usuario"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}