import { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { type User } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar la lista de usuarios.');
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;

        try {
            await userService.deleteUser(id);
            // Actualizamos la lista localmente filtrando el usuario eliminado
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        } catch (err) {
            console.error("Error eliminando usuario:", err);
            alert('Error al eliminar el usuario. Verifica que tengas permisos.');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Cargando usuarios...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Lista de Usuarios</h2>
                <Link 
                    to="/register-user" 
                    style={{ 
                        padding: '10px 15px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '4px' 
                    }}
                >
                    + Nuevo Usuario
                </Link>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Rol</th>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Posición</th>
                        <th style={thStyle}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdStyle}>{user.email}</td>
                            <td style={tdStyle}>
                                <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    backgroundColor: user.role === 'ADMIN' ? '#d4edda' : user.role === 'COACH' ? '#fff3cd' : '#e2e3e5',
                                    fontSize: '0.85em'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={tdStyle}>{user.profile?.full_name || <span style={{ color: '#999' }}>-</span>}</td>
                            <td style={tdStyle}>{user.profile?.position || <span style={{ color: '#999' }}>-</span>}</td>
                            <td style={tdStyle}>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={currentUser?.id === user.id} // Evita eliminarse a sí mismo
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: currentUser?.id === user.id ? '#ccc' : '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentUser?.id === user.id ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const thStyle = { padding: '12px 15px', borderBottom: '2px solid #dee2e6' };
const tdStyle = { padding: '10px 15px' };
