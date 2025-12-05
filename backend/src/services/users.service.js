const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');
const { Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const createUser = async (userData, requestingUser) => {
    const { email, password, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError('Ya existe un usuario con este email', 400);
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const createdUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                role,
            }
        });

        if (user.role === Role.PLAYER) {
            const { profile } = userData;
            if (!profile) {
                throw new AppError('El perfil es requerido para el rol de jugador', 400);
            }
            
            const { full_name, birthDate, contact_data, representative_data } = profile;
            await tx.playerProfile.create({
                data: {
                    user: {
                        connect: { id: user.id }
                    },
                    full_name: full_name,
                    birth_date: birthDate ? new Date(birthDate) : undefined,
                    contact_data: contact_data || undefined, // Guardar el objeto JSON directamente
                    representative_data: representative_data || undefined // Guardar el objeto JSON directamente
                }
            });
        }
        
        return user; // Devolvemos el usuario completo de la transacción
    });

    // ¡Esta es la corrección clave!
    // Después de la transacción, volvemos a consultar el usuario por su ID para obtener
    // el objeto completo con todas las relaciones anidadas correctamente formateadas.
    const userWithProfile = await prisma.user.findUnique({
        where: { id: createdUser.id },
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true, // Asegurarse de que este campo esté en el modelo User
            profile: {
                // Incluimos el perfil y sus datos anidados
                select: {
                    id: true,
                    full_name: true,
                    birth_date: true,
                    position: true,
                    contact_data: true,
                    representative_data: true,
                },
            },
        },
    });

    return userWithProfile;
}

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            profile: {
                select: {
                    id: true,
                    full_name: true,
                    birth_date: true,
                    position: true,
                    contact_data: true,
                    representative_data: true
                }
            }
        }
    });
};

const getUserById = async (id) => {
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new AppError('El ID de usuario debe ser un número', 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
            profile: { // Usar el nombre de relación correcto 'profile'
                select: {
                    id: true,
                    full_name: true,
                    birth_date: true,
                    position: true,
                    contact_data: true,
                    representative_data: true,
                }
            }
        }
    });

    if (!user) {
        throw new AppError('Usuario no encontrado', 404);
    }
    return user;
};

const updateUser = async (id, userData, requestingUser) => {
    const { email, password, role, profile } = userData;

    const userToUpdate = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!userToUpdate) {
        throw new AppError('Usuario no encontrado', 404);
    }

    // Authorization checks
    if (requestingUser.id !== userToUpdate.id && requestingUser.role !== Role.ADMIN) {
        throw new AppError('No tienes permiso para actualizar este usuario', 403);
    }

    // Only ADMIN can change roles
    if (role && role !== userToUpdate.role && requestingUser.role !== Role.ADMIN) {
        throw new AppError('Solo un administrador puede cambiar el rol de un usuario', 403);
    }

    // Only ADMIN can update other ADMINs or COACHs
    if (userToUpdate.role === Role.ADMIN || userToUpdate.role === Role.COACH) {
        if (requestingUser.id !== userToUpdate.id && requestingUser.role !== Role.ADMIN) {
            throw new AppError('No tienes permiso para actualizar este tipo de usuario', 403);
        }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
        let hashedPassword;
        if (password) {
            const salt = bcrypt.genSaltSync();
            hashedPassword = bcrypt.hashSync(password, salt);
        }

        const user = await tx.user.update({
            where: { id: parseInt(id) },
            data: {
                email: email || undefined,
                password_hash: hashedPassword || undefined,
                role: role || undefined,
            }
        });

        const finalRole = role || userToUpdate.role;

        if (finalRole === Role.PLAYER) {
            if (!profile) {
                // No hacer nada si no se envían datos del perfil para actualizar
            } else {
                const { firstName, lastName, birthDate, contact, representativeData, position } = profile;
                await tx.playerProfile.upsert({
                    where: { user_id: user.id },
                    update: {
                        full_name: (firstName && lastName) ? `${firstName} ${lastName}` : undefined,
                        birth_date: birthDate ? new Date(birthDate) : undefined,
                        contact_data: contact || undefined,
                        representative_data: representativeData || undefined,
                        position: position || undefined,
                    },
                    create: {
                        user: { connect: { id: user.id } },
                        full_name: (firstName && lastName) ? `${firstName} ${lastName}` : 'N/A',
                    }
                });
            }
        } else if (userToUpdate.role === Role.PLAYER && finalRole !== Role.PLAYER) {
            // If the user was a PLAYER and is now something else, delete their profile.
            await tx.playerProfile.deleteMany({ // Corregido aquí también
                where: { user_id: user.id }
            });
        }

        return user;
    });

    return await getUserById(updatedUser.id);
};

const deleteUser = async (id, requestingUser) => {
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new AppError('El ID de usuario debe ser un número', 400);
    }

    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToDelete) {
        throw new AppError('Usuario no encontrado', 404);
    }

    // Only ADMIN can delete users
    if (requestingUser.role !== Role.ADMIN) {
        throw new AppError('No tienes permiso para eliminar usuarios', 403);
    }

    // Prevent ADMIN from deleting themselves
    if (userToDelete.id === requestingUser.id) {
        throw new AppError('No puedes eliminar tu propia cuenta de administrador', 403);
    }
    
    await prisma.$transaction(async (tx) => {
        // Delete associated player profile first if it exists
        await tx.playerProfile.deleteMany({
            where: { user_id: userId }
        });

        await tx.user.delete({
            where: { id: userId }
        });
    });


    return { message: 'Usuario eliminado exitosamente' };
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
