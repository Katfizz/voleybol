import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const { logout, user } = useAuth();

    return (
        <nav style={{ 
            padding: '1rem 2rem', 
            backgroundColor: '#343a40', 
            color: '#fff',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    VoleyApp
                </Link>
                
                <div style={{ display: 'flex', gap: '15px', marginLeft: '20px' }}>
                    <Link to="/profile" style={{ color: '#adb5bd', textDecoration: 'none' }}>Mi Perfil</Link>
                    <Link to="/categories" style={{ color: '#adb5bd', textDecoration: 'none' }}>Categorías</Link>
                    
                    {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
                        <Link to="/register-user" style={{ color: '#adb5bd', textDecoration: 'none' }}>Usuarios</Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#ced4da' }}>{user?.email}</span>
                <button 
                    onClick={logout} 
                    style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};
