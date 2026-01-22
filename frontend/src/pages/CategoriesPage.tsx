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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CategoriesPage() {
    const { user: currentUser } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para edición y asignación
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<'CATEGORY' | 'PLAYER' | 'COACH'>('CATEGORY');
    const [playerToRemove, setPlayerToRemove] = useState<{catId: number, pId: number} | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<CreateCategoryDTO>();

    const isAdminOrCoach = currentUser?.role === 'ADMIN' || currentUser?.role === 'COACH';

    const loadData = useCallback(async () => {
        try {
            const [cats, users] = await Promise.all([
                categoryService.getAll(),
                isAdminOrCoach ? userService.getUsers() : Promise.resolve([])
            ]);
            setCategories(cats);
            // Filtramos usuarios que son PLAYER o COACH para la lista de asignación
            if (isAdminOrCoach) {
                setAvailablePlayers(users.filter(u => u.role === 'PLAYER' || u.role === 'COACH'));
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

    const handleAssignCoach = async (categoryId: number, coachId: number) => {
        try {
            await categoryService.assignCoach(categoryId, coachId);
            loadData();
            toast.success('Entrenador asignado correctamente');
        } catch (err) {
            console.error(err);
            toast.error('Error al asignar entrenador.');
        }
    };

    const handleRemoveCoach = async (categoryId: number, coachId: number) => {
        setPlayerToRemove({ catId: categoryId, pId: coachId });
        setDeleteType('COACH');
        setIsDeleteDialogOpen(true);
    };

    const handleRemovePlayer = async (categoryId: number, playerId: number) => {
        setPlayerToRemove({ catId: categoryId, pId: playerId });
        setDeleteType('PLAYER');
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteCategory = async (id: number) => {
        setDeleteId(id);
        setDeleteType('CATEGORY');
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteType === 'CATEGORY' && deleteId) {
                await categoryService.delete(deleteId);
                setCategories(prev => prev.filter(c => c.id !== deleteId));
                toast.success('Categoría eliminada');
            } else if (deleteType === 'PLAYER' && playerToRemove) {
                await categoryService.removePlayer(playerToRemove.catId, playerToRemove.pId);
                loadData();
                toast.success('Jugador desasignado');
            } else if (deleteType === 'COACH' && playerToRemove) {
                await categoryService.removeCoach(playerToRemove.catId, playerToRemove.pId);
                loadData();
                toast.success('Entrenador desasignado');
            }
        } catch (err) {
            console.error(err);
            toast.error(deleteType === 'CATEGORY' ? 'Error al eliminar' : 'Error al desasignar miembro');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
            setPlayerToRemove(null);
        }
    }

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
                            onAssignCoach={handleAssignCoach}
                            onRemoveCoach={handleRemoveCoach}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No se encontraron equipos que coincidan con tu búsqueda.
                    </div>
                )}
            </div>

            <ConfirmDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                title={deleteType === 'CATEGORY' ? "¿Eliminar equipo?" : "¿Desasignar miembro?"}
                description={deleteType === 'CATEGORY' ? "Esta acción eliminará el equipo permanentemente." : "¿Estás seguro de que quieres quitar a este miembro del equipo?"}
                confirmText="Eliminar"
                variant="destructive"
            />
        </div>
    );
}