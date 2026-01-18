import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { type User } from '../types/user.types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { UsersTable } from '../components/users/UsersTable';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (err) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await userService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            toast.success('Usuario eliminado');
        } catch (err) {
            toast.error('Error al eliminar usuario');
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading) return <div className="p-8 text-center">Cargando usuarios...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
                    <p className="text-muted-foreground">Gestiona los miembros del club, entrenadores y administradores.</p>
                </div>
                <Button onClick={() => navigate('/register-user')} className="bg-primary">
                    <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Listado de Miembros</CardTitle>
                    <CardDescription>
                        Total: {filteredUsers.length} usuarios registrados.
                    </CardDescription>
                    <div className="pt-2 w-full md:w-1/3">
                        <InputGroup>
                            <InputGroupAddon>
                                <Search className="h-4 w-4" />
                            </InputGroupAddon>
                            <InputGroupInput 
                                placeholder="Buscar por nombre o email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                </CardHeader>
                <CardContent>
                    <UsersTable users={filteredUsers} onDelete={handleDelete} />
                </CardContent>
            </Card>
        </div>
    );
}