import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // Si ya está autenticado, redirigir al home y reemplazar la entrada en el historial
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/'); // Redirigir al home/perfil después del login exitoso
        } catch (err) {
            const axiosError = err as AxiosError<{ msg: string }>;
            setError(axiosError.response?.data?.msg || 'Error al iniciar sesión');
        }
    };

    // Si estamos cargando/verificando sesión, no mostramos el formulario aún
    if (isLoading) return <div>Cargando...</div>;

    // Si ya está autenticado, no mostramos el formulario.
    // El useEffect se encargará de redirigir en breve.
    if (isAuthenticated) {
        return null; 
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '10px 20px' }}>Ingresar</button>
            </form>
        </div>
    );
}