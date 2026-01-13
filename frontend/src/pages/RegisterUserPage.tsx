import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type Role, type RegisterUserDTO } from '../types';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterUserPage() {
    const { user: currentUser, isLoading } = useAuth();
    const navigate = useNavigate();
    
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RegisterUserDTO>({
        defaultValues: {
            role: 'PLAYER',
            representative_data: {
                full_name: '',
                phone: '',
                relationship: ''
            }
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Protección de ruta: Solo ADMIN y COACH pueden acceder
    useEffect(() => {
        if (!isLoading && currentUser && !['ADMIN', 'COACH'].includes(currentUser.role)) {
            navigate('/');
        }
    }, [currentUser, isLoading, navigate]);

    // Determinar qué roles puede crear el usuario actual
    const availableRoles: Role[] = currentUser?.role === 'ADMIN' 
        ? ['ADMIN', 'COACH', 'PLAYER'] 
        : ['PLAYER']; // COACH solo puede crear PLAYER

    const role = watch('role');
    const birthDate = watch('birth_date');

    // Calcular si es menor de edad (menor de 18 años)
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
            // Preparamos los datos. Si no es menor, eliminamos representative_data para no enviarlo vacío
            const dataToSend = { ...data };
            if (!showRepresentativeData) {
                delete dataToSend.representative_data;
            }

            await userService.createUser(dataToSend);
            setSuccess(`Usuario ${data.email} creado exitosamente.`);
            // Limpiar formulario
            reset();
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            setError(axiosError.response?.data?.msg || 'Error al registrar usuario');
        }
    };

    if (isLoading) return <div>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Registrar Nuevo Usuario</h2>
            
            {success && <div style={{ color: 'green', marginBottom: '1rem', padding: '10px', border: '1px solid green' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', border: '1px solid red' }}>{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email: <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="email"
                        {...register("email", { required: "El email es requerido" })}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña: <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="password"
                        {...register("password", { required: "La contraseña es requerida", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password.message}</span>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rol: <span style={{color: 'red'}}>*</span></label>
                    <select
                        {...register("role")}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Campos adicionales solo para PLAYER */}
                {role === 'PLAYER' && (
                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Perfil del Jugador</h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre Completo: <span style={{color: 'red'}}>*</span></label>
                            <input
                                type="text"
                                {...register("full_name", { required: role === 'PLAYER' ? "El nombre es requerido" : false })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                            {errors.full_name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.full_name.message}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Posición: <span style={{color: 'red'}}>*</span></label>
                            <select
                                {...register("position", { required: role === 'PLAYER' ? "La posición es requerida" : false })}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="">Seleccione una posición</option>
                                <option value="Setter">Armador (Setter)</option>
                                <option value="Outside Hitter">Punta (Outside Hitter)</option>
                                <option value="Opposite Hitter">Opuesto (Opposite Hitter)</option>
                                <option value="Middle Blocker">Central (Middle Blocker)</option>
                                <option value="Libero">Líbero</option>
                            </select>
                            {errors.position && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.position.message}</span>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento: <span style={{color: 'red'}}>*</span></label>
                            <input
                                type="date"
                                {...register("birth_date", { required: role === 'PLAYER' ? "La fecha de nacimiento es requerida" : false })}
                                style={{ width: '100%', padding: '8px' }}
                            />
                            {errors.birth_date && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.birth_date.message}</span>}
                        </div>

                        {/* Campos del Representante (Solo si es menor de edad) */}
                        {showRepresentativeData && (
                            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '1rem', border: '1px dashed #ccc' }}>
                                <h4 style={{ marginTop: 0, color: '#d63384', fontSize: '0.95rem' }}>
                                    ⚠️ El jugador es menor de edad. Datos del Representante requeridos:
                                </h4>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nombre del Representante: <span style={{color: 'red'}}>*</span></label>
                                    <input
                                        type="text"
                                        {...register("representative_data.full_name", { required: showRepresentativeData ? "Requerido" : false })}
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                    {errors.representative_data?.full_name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.representative_data.full_name.message}</span>}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ marginBottom: '1rem', flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Teléfono: <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="tel"
                                            {...register("representative_data.phone", { required: showRepresentativeData ? "Requerido" : false })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                        {errors.representative_data?.phone && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.representative_data.phone.message}</span>}
                                    </div>
                                    <div style={{ marginBottom: '1rem', flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Parentesco: <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="text"
                                            {...register("representative_data.relationship", { required: showRepresentativeData ? "Requerido" : false })}
                                            style={{ width: '100%', padding: '8px' }}
                                            placeholder="Padre, Madre..."
                                        />
                                        {errors.representative_data?.relationship && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.representative_data.relationship.message}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Datos de Contacto</h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
                            <input
                                type="tel"
                                {...register("phone")}
                                style={{ width: '100%', padding: '8px' }}
                                placeholder="+54 9 ..."
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Dirección:</label>
                            <input
                                type="text"
                                {...register("address")}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                        Registrar Usuario
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#ccc', border: 'none' }}
                    >
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
}
