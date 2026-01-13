import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { categoryService } from '../services/category.service';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type Category, type CreateCategoryDTO } from '../types/category.types';
import { type User } from '../types/user.types';

export default function CategoriesPage() {
    const { user: currentUser } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para edición y asignación
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [assigningToCategory, setAssigningToCategory] = useState<number | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateCategoryDTO>();
    const { register: registerAssign, handleSubmit: handleSubmitAssign } = useForm<{ playerId: string }>();

    const isAdminOrCoach = currentUser?.role === 'ADMIN' || currentUser?.role === 'COACH';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cats, users] = await Promise.all([
                categoryService.getAll(),
                isAdminOrCoach ? userService.getUsers() : Promise.resolve([])
            ]);
            setCategories(cats);
            // Filtramos solo los usuarios que son PLAYER para la lista de asignación
            if (isAdminOrCoach) {
                setAvailablePlayers(users.filter(u => u.role === 'PLAYER'));
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit: SubmitHandler<CreateCategoryDTO> = async (data) => {
        if (!isAdminOrCoach) return;
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, data);
                setEditingCategory(null);
            } else {
                await categoryService.create(data);
            }
            reset();
            loadData(); // Recargar para ver cambios
        } catch (err) {
            console.error(err);
            alert('Error al guardar la categoría');
        }
    };

    const onAssignPlayer = async (data: { playerId: string }) => {
        if (!assigningToCategory || !data.playerId) return;
        try {
            await categoryService.assignPlayer(assigningToCategory, parseInt(data.playerId));
            setAssigningToCategory(null);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Error al asignar jugador. Verifica que no esté ya asignado o que el ID sea correcto.');
        }
    };

    const handleRemovePlayer = async (categoryId: number, playerId: number) => {
        if (!window.confirm('¿Desasignar a este jugador de la categoría?')) return;
        try {
            // Nota: El backend espera el ID del usuario (playerId), no del perfil.
            // En category.types.ts, playerProfiles tiene user: { id, email }. Usamos user.id.
            await categoryService.removePlayer(categoryId, playerId);
            loadData();
        } catch (err) {
            console.error(err);
            alert('Error al desasignar jugador');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('¿Eliminar esta categoría?')) return;
        try {
            await categoryService.delete(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setValue('name', category.name);
        setValue('description', category.description || '');
        window.scrollTo(0, 0);
    };

    if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Equipos y Categorías</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Formulario de Creación/Edición (Solo Admin/Coach) */}
            {isAdminOrCoach && (
                <div style={{ marginBottom: '2rem', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre</label>
                            <input 
                                {...register('name', { required: 'El nombre es obligatorio' })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="Ej: Sub-18 Femenino"
                            />
                            {errors.name && <span style={{ color: 'red', fontSize: '0.8em' }}>{errors.name.message}</span>}
                        </div>
                        <div style={{ flex: 2, minWidth: '300px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción</label>
                            <input 
                                {...register('description')}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="Descripción opcional"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {editingCategory ? 'Actualizar' : 'Crear'}
                            </button>
                            {editingCategory && (
                                <button type="button" onClick={() => { setEditingCategory(null); reset(); }} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Categorías */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {categories.map(category => (
                    <div key={category.id} style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '15px', backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{category.name}</h3>
                                {isAdminOrCoach && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => startEdit(category)} style={{ fontSize: '0.8em', padding: '3px 8px', cursor: 'pointer' }}>✏️</button>
                                        <button onClick={() => handleDeleteCategory(category.id)} style={{ fontSize: '0.8em', padding: '3px 8px', cursor: 'pointer', color: 'red' }}>🗑️</button>
                                    </div>
                                )}
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9em', margin: 0 }}>{category.description || 'Sin descripción'}</p>
                        </div>

                        <div style={{ padding: '15px', backgroundColor: '#fcfcfc' }}>
                            <h4 style={{ fontSize: '0.9em', textTransform: 'uppercase', color: '#888', marginTop: 0 }}>Plantilla ({category._count?.playerProfiles || 0})</h4>
                            
                            {/* Lista de Jugadores */}
                            {category.playerProfiles && category.playerProfiles.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0', fontSize: '0.95em' }}>
                                    {category.playerProfiles.map(p => (
                                        <li key={p.id} style={{ padding: '4px 0', borderBottom: '1px dashed #eee', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>
                                                <strong>{p.full_name}</strong> <span style={{ color: '#888', fontSize: '0.85em' }}>({p.position || 'N/A'})</span>
                                            </span>
                                            {isAdminOrCoach && p.user && (
                                                <button 
                                                    onClick={() => handleRemovePlayer(category.id, p.user!.id)}
                                                    style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.8em' }}
                                                    title="Desasignar jugador"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ fontSize: '0.9em', color: '#999', fontStyle: 'italic' }}>No hay jugadores asignados.</p>
                            )}

                            {/* Formulario para asignar jugador (Solo Admin/Coach) */}
                            {isAdminOrCoach && (
                                <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                    {assigningToCategory === category.id ? (
                                        <form onSubmit={handleSubmitAssign(onAssignPlayer)} style={{ display: 'flex', gap: '5px' }}>
                                            <select {...registerAssign('playerId')} style={{ flex: 1, padding: '5px', fontSize: '0.9em' }}>
                                                <option value="">Seleccionar jugador...</option>
                                                {availablePlayers.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.profile?.full_name || p.email}
                                                    </option>
                                                ))}
                                            </select>
                                            <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.9em' }}>Add</button>
                                            <button type="button" onClick={() => setAssigningToCategory(null)} style={{ padding: '5px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '3px' }}>✕</button>
                                        </form>
                                    ) : (
                                        <button 
                                            onClick={() => setAssigningToCategory(category.id)}
                                            style={{ width: '100%', padding: '6px', backgroundColor: '#e9ecef', border: '1px dashed #ced4da', color: '#495057', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9em' }}
                                        >
                                            + Asignar Jugador
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}