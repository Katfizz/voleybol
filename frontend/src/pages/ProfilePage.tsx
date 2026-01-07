import { useEffect, useState } from 'react';
import { profileService } from '../services/profile.service';
import { type User } from '../types';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Llamamos al backend para obtener los datos frescos
                const userData = await profileService.getProfile();
                setUser(userData);
            } catch (err) {
                console.error("Error cargando perfil:", err);
                setError('No se pudo cargar la información del perfil.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Cargando perfil...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!user) return <div style={{ padding: '20px' }}>No se encontró el usuario.</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Mi Perfil</h1>
                <button 
                    onClick={logout}
                    style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>

            <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px', 
                marginTop: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h3>Información de Cuenta</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rol:</strong> <span style={{ backgroundColor: '#e2e3e5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>{user.role}</span></p>

                <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ccc' }} />

                <h3>Datos del Jugador</h3>
                {user.profile ? (
                    <div>
                        <p><strong>Nombre Completo:</strong> {user.profile.full_name}</p>
                        <p><strong>Posición:</strong> {user.profile.position || 'No definida'}</p>
                        <p><strong>Fecha de Nacimiento:</strong> {user.profile.birth_date ? new Date(user.profile.birth_date).toLocaleDateString() : 'No registrada'}</p>
                    </div>
                ) : (
                    <div style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
                        ⚠️ Tu perfil de jugador aún no está configurado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
