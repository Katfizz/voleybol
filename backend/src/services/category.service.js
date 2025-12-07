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

    // Verificación explícita de que la categoría existe.
    const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
    if (!categoryExists) {
        throw new NotFoundError(`La categoría con ID ${catId} no existe.`);
    }

    // Usar una actualización anidada para que Prisma maneje la conexión de forma atómica.
    // Si no encuentra un playerProfile con el user_id: pId, la operación fallará.
    try {
        return await prisma.category.update({
            where: { id: catId },
            data: {
                playerProfiles: {
                    connect: { user_id: pId },
                },
            },
            include: {
                playerProfiles: {
                    include: {
                        user: { select: { id: true, email: true } }, // Incluir datos básicos del usuario
                    },
                },
            },
        });
    } catch (error) {
        // Capturamos el error de Prisma si no encuentra el perfil y devolvemos un mensaje más claro.
        throw new NotFoundError(`No se pudo asignar el jugador. Asegúrate de que el jugador con ID ${pId} existe y tiene un perfil de jugador.`);
    }
};

/**
 * Asigna un coach a una categoría.
 * Un ADMIN puede asignar a cualquier coach.
 * Un COACH solo puede asignarse a sí mismo.
 * @param {string} categoryId - El ID de la categoría.
 * @param {string} coachId - El ID del usuario (coach) a asignar, proveniente del body.
 * @param {object} requestingUser - El usuario autenticado que realiza la solicitud.
 * @returns {Promise<object>} La categoría actualizada con la lista de coaches.
 */
const assignCoachToCategory = async (categoryId, coachId, requestingUser) => {
    const catId = parseInt(categoryId, 10);
    const cId = parseInt(coachId, 10);

    // Regla de negocio: Un COACH solo puede asignarse a sí mismo.
    if (requestingUser.role === Role.COACH && requestingUser.id !== cId) {
        throw new ForbiddenError('No tienes permiso para asignar a otros coaches. Solo puedes asignarte a ti mismo.');
    }

    // Verificamos que el usuario a asignar sea realmente un COACH
    const coachToAssign = await prisma.user.findFirst({ where: { id: cId, role: Role.COACH } });
    if (!coachToAssign) {
        throw new NotFoundError(`El usuario con ID ${cId} no existe o no tiene el rol de COACH.`);
    }

    try {
        return await prisma.category.update({
            where: { id: catId },
            data: {
                coaches: {
                    connect: { id: cId }, // Conectar el coach a la categoría
                },
            },
            include: { coaches: true }, // Devolver la lista actualizada de coaches
        });
    } catch (error) {
        throw new NotFoundError(`No se pudo asignar el coach. Asegúrate de que la categoría con ID ${catId} exista.`);
    }
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

    // Primero, verificamos si la categoría existe.
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new NotFoundError(`No se encontró una categoría con el ID ${id} para eliminar.`);
    }

    return prisma.category.delete({ where: { id } }); // Si existe, la eliminamos.
};

/**
 * Desasigna un jugador de una categoría.
 * @param {string} categoryId - El ID de la categoría.
 * @param {string} playerId - El ID del usuario (jugador) a desasignar.
 * @param {object} requestingUser - Usuario que realiza la solicitud.
 * @returns {Promise<object>} La categoría actualizada.
 */
const removePlayerFromCategory = async (categoryId, playerId, requestingUser) => {
    const catId = parseInt(categoryId, 10);
    const pId = parseInt(playerId, 10);

    if (requestingUser.role !== Role.ADMIN && requestingUser.role !== Role.COACH) {
        throw new ForbiddenError('No tienes permiso para desasignar jugadores.');
    }

    try {
        return await prisma.category.update({
            where: { id: catId },
            data: {
                playerProfiles: {
                    disconnect: { user_id: pId },
                },
            },
        });
    } catch (error) {
        throw new NotFoundError(`No se pudo desasignar. La categoría con ID ${catId} o el jugador con ID ${pId} no existen o no están asignados.`);
    }
};

/**
 * Desasigna un coach de una categoría.
 * @param {string} categoryId - El ID de la categoría.
 * @param {string} coachId - El ID del usuario (coach) a desasignar.
 * @param {object} requestingUser - Usuario que realiza la solicitud.
 * @returns {Promise<object>} La categoría actualizada.
 */
const removeCoachFromCategory = async (categoryId, coachId, requestingUser) => {
    const catId = parseInt(categoryId, 10);
    const cId = parseInt(coachId, 10);

    if (requestingUser.role !== Role.ADMIN && requestingUser.role !== Role.COACH) {
        throw new ForbiddenError('No tienes permiso para desasignar coaches.');
    }

    // Un COACH solo puede desasignarse a sí mismo.
    if (requestingUser.role === Role.COACH && requestingUser.id !== cId) {
        throw new ForbiddenError('No tienes permiso para desasignar a otros coaches.');
    }

    try {
        return await prisma.category.update({
            where: { id: catId },
            data: {
                coaches: {
                    disconnect: { id: cId },
                },
            },
        });
    } catch (error) {
        throw new NotFoundError(`No se pudo desasignar. La categoría con ID ${catId} o el coach con ID ${cId} no existen o no están asignados.`);
    }
};

module.exports = {
    createCategory,
    assignPlayerToCategory,
    assignCoachToCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    removePlayerFromCategory,
    removeCoachFromCategory,
};