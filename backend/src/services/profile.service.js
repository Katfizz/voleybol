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
  // 1. Buscar al usuario por su ID, seleccionando campos seguros.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true, // Asegúrate de que tu modelo User tenga createdAt
      updatedAt: true, // y updatedAt
    },
  });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // 2. Si el usuario es un 'PLAYER', buscar y adjuntar su perfil.
  if (user.role === Role.PLAYER) {
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: user.id },
      // Puedes seleccionar campos específicos si lo deseas
    });
    // Devolvemos el usuario junto con su perfil de jugador (o null si no existe)
    return { ...user, playerProfile: playerProfile || null };
  }

  // 3. Para otros roles, devolver solo la información del usuario.
  return user;
};

module.exports = {
  getProfile,
};
