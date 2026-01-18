import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Search, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

import { categoryService } from '../services/category.service';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type Category, type CreateCategoryDTO } from '../types/category.types';
import { type User } from '../types/user.types';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
    const { user: currentUser } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para edición y asignación
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<CreateCategoryDTO>();

    const isAdminOrCoach = currentUser?.role === 'ADMIN' || currentUser?.role === 'COACH';

    const loadData = useCallback(async () => {
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
            toast.error('Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, [isAdminOrCoach]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar la categoría');
        }
    };

    const handleAssignPlayer = async (categoryId: number, playerId: number) => {
        try {
            await categoryService.assignPlayer(categoryId, playerId);
            loadData();
            toast.success('Jugador asignado correctamente');
        } catch (err) {
            console.error(err);
            toast.error('Error al asignar jugador.');
        }
    };

    const handleRemovePlayer = async (categoryId: number, playerId: number) => {
        try {
            await categoryService.removePlayer(categoryId, playerId);
            loadData();
            toast.success('Jugador desasignado');
        } catch (err) {
            console.error(err);
            toast.error('Error al desasignar jugador');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este equipo?')) return;
        try {
            await categoryService.delete(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success('Categoría eliminada');
        } catch (err) {
            console.error(err);
            toast.error('Error al eliminar');
        }
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setValue('name', category.name);
        setValue('description', category.description || '');
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        reset();
    };

    // Filtrado de categorías
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Trophy className="h-8 w-8" /> Equipos y Categorías
                </h2>
                
                {/* Buscador */}
                <div className="w-full md:w-1/3">
                    <InputGroup>
                        <InputGroupAddon>
                            <Search className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput 
                            placeholder="Buscar equipo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            {/* Formulario de Creación/Edición (Solo Admin/Coach) */}
            {isAdminOrCoach && (
                <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-primary">
                        {editingCategory ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-full md:w-1/3">
                            <InputGroup>
                                <InputGroupInput 
                                    {...register('name', { required: true })} 
                                    placeholder="Nombre del equipo (Ej: Sub-18 Femenino)" 
                                />
                            </InputGroup>
                        </div>
                        <div className="w-full md:w-1/2">
                            <InputGroup>
                                <InputGroupTextarea 
                                    {...register('description')} 
                                    placeholder="Descripción breve del equipo..." 
                                    className="min-h-[42px] h-[42px] py-2"
                                />
                            </InputGroup>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-primary">
                                {editingCategory ? 'Guardar' : <><Plus className="mr-2 h-4 w-4" /> Crear</>}
                            </Button>
                            {editingCategory && (
                                <Button type="button" variant="outline" onClick={cancelEdit}>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Categorías */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                        <CategoryCard 
                            key={category.id}
                            category={category}
                            isAdminOrCoach={isAdminOrCoach}
                            availablePlayers={availablePlayers}
                            onEdit={startEdit}
                            onDelete={handleDeleteCategory}
                            onAssignPlayer={handleAssignPlayer}
                            onRemovePlayer={handleRemovePlayer}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No se encontraron equipos que coincidan con tu búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
}