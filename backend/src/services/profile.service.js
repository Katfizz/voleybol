const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');
const { Role } = require('@prisma/client');

/**
 * Obtiene la información del perfil completo de un usuario por su ID.
 * Excluye la contraseña y añade el perfil de jugador si el rol es PLAYER.
 * @param {string} userId - El ID del usuario autenticado.
 * @returns {Promise<object>} El perfil del usuario.
 */
const getProfile = async (userId) => {
    // Hacemos una única consulta para obtener el usuario y su perfil si existe.
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true, // Corregido: usar snake_case
            updated_at: true,
            profile: {
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

    if (!user) {
        throw new AppError('Usuario no encontrado', 404);
    }

    // La estructura de la respuesta es consistente.
    // Si el usuario no es PLAYER, el campo 'profile' será null automáticamente.
    return user;
};

module.exports = {
  getProfile,
};
