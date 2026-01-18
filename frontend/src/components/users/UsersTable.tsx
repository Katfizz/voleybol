import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { type User } from '../../types/user.types';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UsersTableProps {
    users: User[];
    onDelete: (id: number) => void;
}

export function UsersTable({ users, onDelete }: UsersTableProps) {
    const navigate = useNavigate();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'destructive';
            case 'COACH': return 'default';
            case 'PLAYER': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Avatar>
                                <AvatarImage src="" alt={user.profile?.full_name} />
                                <AvatarFallback>{getInitials(user.profile?.full_name || user.email)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                            {user.profile?.full_name || <span className="text-muted-foreground italic">Sin perfil</span>}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}