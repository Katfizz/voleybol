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

    const newUser = await prisma.$transaction(async (tx) => {
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
            
            const { firstName, lastName, birthDate, contact, representativeData } = profile;
            await tx.playerProfile.create({
                data: {
                    user: {
                        connect: { id: user.id }
                    },
                    full_name: `${firstName} ${lastName}`,
                    birth_date: birthDate ? new Date(birthDate) : null,
                    contact_data: contact ? { create: contact } : undefined,
                    representative_data: representativeData ? { create: representativeData } : undefined
                }
            });
        }
        
        // Devolver el usuario sin la contraseña
        const { password_hash, ...userResponse } = user;
        return userResponse;
    });

    return newUser;
}

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
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
        include: {
            playerProfile: true
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            playerProfile: true
        }
    });

    if (!user) {
        throw new AppError('Usuario no encontrado', 404);
    }
    return user;
};

const updateUser = async (id, userData, requestingUser) => {
    const { email, password, role, full_name, birth_date, contact_info, position } = userData;

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
            await tx.playerProfile.upsert({
                where: { userId: user.id },
                update: {
                    full_name: full_name || undefined,
                    birth_date: birth_date ? new Date(birth_date) : undefined,
                    contact_info: contact_info || undefined,
                    position: position || undefined,
                },
                create: {
                    userId: user.id,
                    full_name: full_name || 'N/A',
                    birth_date: birth_date ? new Date(birth_date) : null,
                    contact_info: contact_info || null,
                    position: position || null,
                }
            });
        } else if (userToUpdate.role === Role.PLAYER && finalRole !== Role.PLAYER) {
            // If the user was a PLAYER and is now something else, delete their profile.
            await tx.playerProfile.deleteMany({
                where: { userId: user.id }
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
            where: { userId: userId }
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
