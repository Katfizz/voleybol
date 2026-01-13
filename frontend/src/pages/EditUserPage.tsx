import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type Role, type RegisterUserDTO } from '../types';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RegisterUserDTO>({
        defaultValues: {
            role: 'PLAYER',
            representative_data: { full_name: '', phone: '', relationship: '' }
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                            formData.birth_date = new Date(user.profile.birth_date).toISOString().split('T')[0];
                        }
                        if (user.profile.contact_data) {
                            formData.phone = user.profile.contact_data.phone;
                            formData.address = user.profile.contact_data.address;
                        }
                        if (user.profile.representative_data) {
                            formData.representative_data = user.profile.representative_data;
                        }
                    }
                    reset(formData);
                } catch (err) {
                    setError('Error al cargar el usuario');
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        }
    }, [id, reset]);

    const availableRoles: Role[] = currentUser?.role === 'ADMIN' ? ['ADMIN', 'COACH', 'PLAYER'] : ['PLAYER'];
    const role = watch('role');
    const birthDate = watch('birth_date');

    const isMinor = () => {
        if (!birthDate) return false;
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age < 18;
    };

    const showRepresentativeData = role === 'PLAYER' && isMinor();

    const onSubmit: SubmitHandler<RegisterUserDTO> = async (data) => {
        setError('');
        setSuccess('');
        try {
            const dataToSend = { ...data };
            if (!showRepresentativeData) delete dataToSend.representative_data;
            if (!dataToSend.password) delete dataToSend.password; // No enviar si está vacía

            if (id) {
                await userService.updateUser(parseInt(id), dataToSend);
                setSuccess('Usuario actualizado exitosamente.');
                setTimeout(() => navigate('/users'), 1500);
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            setError(axiosError.response?.data?.msg || 'Error al actualizar usuario');
        }
    };

    if (authLoading || loading) return <div>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Editar Usuario</h2>
            {success && <div style={{ color: 'green', marginBottom: '1rem', padding: '10px', border: '1px solid green' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', border: '1px solid red' }}>{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input type="email" {...register("email", { required: "El email es requerido" })} style={{ width: '100%', padding: '8px' }} />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña (dejar en blanco para mantener la actual):</label>
                    <input type="password" {...register("password", { minLength: { value: 6, message: "Mínimo 6 caracteres" } })} style={{ width: '100%', padding: '8px' }} />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password.message}</span>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rol:</label>
                    <select {...register("role")} style={{ width: '100%', padding: '8px' }}>
                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {role === 'PLAYER' && (
                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Perfil del Jugador</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre Completo:</label>
                            <input type="text" {...register("full_name", { required: role === 'PLAYER' })} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Posición:</label>
                            <select {...register("position", { required: role === 'PLAYER' })} style={{ width: '100%', padding: '8px' }}>
                                <option value="">Seleccione una posición</option>
                                <option value="Setter">Armador (Setter)</option>
                                <option value="Outside Hitter">Punta (Outside Hitter)</option>
                                <option value="Opposite Hitter">Opuesto (Opposite Hitter)</option>
                                <option value="Middle Blocker">Central (Middle Blocker)</option>
                                <option value="Libero">Líbero</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento:</label>
                            <input type="date" {...register("birth_date", { required: role === 'PLAYER' })} style={{ width: '100%', padding: '8px' }} />
                        </div>

                        {showRepresentativeData && (
                            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4>Datos del Representante</h4>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label>Nombre:</label>
                                    <input type="text" {...register("representative_data.full_name", { required: showRepresentativeData })} style={{ width: '100%', padding: '8px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Teléfono:</label>
                                        <input type="tel" {...register("representative_data.phone", { required: showRepresentativeData })} style={{ width: '100%', padding: '8px' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Parentesco:</label>
                                        <input type="text" {...register("representative_data.relationship", { required: showRepresentativeData })} style={{ width: '100%', padding: '8px' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Datos de Contacto</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Teléfono:</label>
                            <input type="tel" {...register("phone")} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Dirección:</label>
                            <input type="text" {...register("address")} style={{ width: '100%', padding: '8px' }} />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Actualizar</button>
                    <button type="button" onClick={() => navigate('/users')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}