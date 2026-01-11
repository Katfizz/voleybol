import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function HomePage() {
    const { user } = useAuth();
    useEffect(() => {
        document.title = 'Panel de Desarrollo';
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Panel de Desarrollo</h1>
            <p>Bienvenido, <strong>{user?.email}</strong> ({user?.role})</p>
            <p>Usa este menú para navegar por las funcionalidades implementadas:</p>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginTop: '20px' }}>
                <Link to="/profile" style={linkStyle}>👤 Mi Perfil</Link>
                
                {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                    <Link to="/users" style={linkStyle}>👥 Gestionar Usuarios</Link>
                )}
            </nav>
        </div>
    );
}

const linkStyle = {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    fontWeight: 'bold' as const
};