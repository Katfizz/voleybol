import { useState, type FormEvent } from 'react';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type Role, type RegisterUserDTO } from '../types';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterUserPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<RegisterUserDTO>({
        email: '',
        password: '',
        role: 'PLAYER', // Valor por defecto
        full_name: '',
        position: '',
        birth_date: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Determinar qué roles puede crear el usuario actual
    const availableRoles: Role[] = currentUser?.role === 'ADMIN' 
        ? ['ADMIN', 'COACH', 'PLAYER'] 
        : ['PLAYER']; // COACH solo puede crear PLAYER

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await userService.createUser(formData);
            setSuccess(`Usuario ${formData.email} creado exitosamente.`);
            // Limpiar formulario
            setFormData({ email: '', password: '', role: 'PLAYER', full_name: '', position: '', birth_date: '', phone: '', address: '' });
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            setError(axiosError.response?.data?.msg || 'Error al registrar usuario');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Registrar Nuevo Usuario</h2>
            
            {success && <div style={{ color: 'green', marginBottom: '1rem', padding: '10px', border: '1px solid green' }}>{success}</div>}
            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', border: '1px solid red' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email: <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña: <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rol: <span style={{color: 'red'}}>*</span></label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        {availableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Campos adicionales solo para PLAYER */}
                {formData.role === 'PLAYER' && (
                    <div style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Perfil del Jugador</h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre Completo: <span style={{color: 'red'}}>*</span></label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                required={formData.role === 'PLAYER'}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Posición: <span style={{color: 'red'}}>*</span></label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                required={formData.role === 'PLAYER'}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="">Seleccione una posición</option>
                                <option value="Setter">Armador (Setter)</option>
                                <option value="Outside Hitter">Punta (Outside Hitter)</option>
                                <option value="Opposite Hitter">Opuesto (Opposite Hitter)</option>
                                <option value="Middle Blocker">Central (Middle Blocker)</option>
                                <option value="Libero">Líbero</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento: <span style={{color: 'red'}}>*</span></label>
                            <input
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                required={formData.role === 'PLAYER'}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Datos de Contacto</h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                style={{ width: '100%', padding: '8px' }}
                                placeholder="+54 9 ..."
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Dirección:</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
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
