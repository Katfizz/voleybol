const prisma = require('../db/prisma');
const { ForbiddenError, ConflictError, NotFoundError, AppError } = require('../utils/errors');
const { Role } = require('@prisma/client');

/**
 * Crea una nueva categoría.
 * @param {object} categoryData - Datos de la categoría (name, description).
 * @param {object} requestingUser - Usuario que realiza la solicitud.
 * @returns {Promise<object>} La categoría creada.
 */
const createCategory = async (categoryData, requestingUser) => {
    const { name, description } = categoryData;

    if (requestingUser.role !== Role.ADMIN && requestingUser.role !== Role.COACH) {
        throw new ForbiddenError('No tienes permiso para crear categorías.');
    }

    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
        throw new ConflictError(`La categoría '${name}' ya existe.`);
    }

    return prisma.category.create({
        data: { name, description },
    });
};

/**
 * Asigna un jugador a una categoría.
 * @param {string} categoryId - El ID de la categoría.
 * @param {string} playerId - El ID del usuario (jugador) a asignar.
 * @param {object} requestingUser - Usuario que realiza la solicitud.
 * @returns {Promise<object>} La categoría actualizada con la lista de perfiles de jugadores.
 */
const assignPlayerToCategory = async (categoryId, playerId, requestingUser) => {
    const catId = parseInt(categoryId, 10);
    const pId = parseInt(playerId, 10);

    if (requestingUser.role !== Role.ADMIN && requestingUser.role !== Role.COACH) {
        throw new ForbiddenError('No tienes permiso para asignar jugadores.');
    }

    // Validar que el usuario a asignar tenga un perfil de jugador
    const playerProfile = await prisma.playerProfile.findUnique({ where: { user_id: pId } });
    if (!playerProfile) {
        throw new NotFoundError(`No se encontró un perfil de jugador para el usuario con ID ${pId}.`);
    }

    // Conectar el perfil del jugador a la categoría
    return prisma.category.update({
        where: { id: catId },
        data: {
            playerProfiles: {
                connect: { id: playerProfile.id },
            },
        },
        include: {
            playerProfiles: {
                include: {
                    user: { select: { id: true, email: true } } // Incluir datos básicos del usuario
                }
            },
        },
    });
};

/**
 * Obtiene todas las categorías.
 * @returns {Promise<Array<object>>} Un arreglo de todas las categorías.
 */
const getAllCategories = async () => {
    return prisma.category.findMany({
        include: {
            _count: { // Contar cuántos jugadores y coaches hay en cada categoría
                select: { playerProfiles: true, coaches: true },
            },
        },
    });
};

/**
 * Obtiene una categoría por su ID.
 * @param {string} categoryId - El ID de la categoría.
 * @returns {Promise<object>} La categoría encontrada.
 */
const getCategoryById = async (categoryId) => {
    const id = parseInt(categoryId, 10);
    const category = await prisma.category.findUnique({
        where: { id },
        include: { // Incluir los perfiles de jugadores y los coaches asociados
            playerProfiles: { include: { user: { select: { id: true, email: true, role: true } } } },
            coaches: { select: { id: true, email: true, role: true } },
        },
    });

    if (!category) {
        throw new NotFoundError(`No se encontró una categoría con el ID ${id}.`);
    }
    return category;
};

/**
 * Actualiza una categoría.
 * @param {string} categoryId - El ID de la categoría a actualizar.
 * @param {object} dataToUpdate - Los datos a actualizar (name, description).
 * @returns {Promise<object>} La categoría actualizada.
 */
const updateCategory = async (categoryId, dataToUpdate) => {
    const id = parseInt(categoryId, 10);
    return prisma.category.update({
        where: { id },
        data: dataToUpdate,
    });
};

/**
 * Elimina una categoría por su ID.
 * @param {string} categoryId - El ID de la categoría a eliminar.
 */
const deleteCategory = async (categoryId) => {
    const id = parseInt(categoryId, 10);
    return prisma.category.delete({ where: { id } });
};

module.exports = {
    createCategory,
    assignPlayerToCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};