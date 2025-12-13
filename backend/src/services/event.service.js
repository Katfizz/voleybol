const prisma = require('../db/prisma');
const { NotFoundError, ConflictError, AppError, BadRequestError } = require('../utils/errors');
const { EventType } = require('@prisma/client');

/**
 * Crea un nuevo evento.
 * Si el tipo es PRACTICE, también crea los detalles de la práctica.
 * Asocia el evento a las categorías proporcionadas.
 * @param {object} eventData - Datos del evento.
 * @returns {Promise<object>} El evento creado.
 */
const createEvent = async (eventData) => {
    const { name, type, date_time, location, description, categoryIds, practice } = eventData;

    const existingEvent = await prisma.event.findUnique({ where: { name } });
    if (existingEvent) {
        throw new ConflictError(`Un evento con el nombre '${name}' ya existe.`);
    }

    try {
        const data = {
            name,
            type,
            date_time,
            location,
            description,
            // Conectar con las categorías si se proporcionan IDs
            categories: categoryIds ? {
                connect: categoryIds.map(id => ({ id }))
            } : undefined,
            // Crear la práctica anidada si el tipo es PRACTICE
            practice: type === EventType.PRACTICE ? {
                create: practice || {}, // Crea la práctica con los datos proporcionados o un objeto vacío
            } : undefined,
        };

        return await prisma.event.create({
            data,
            include: { categories: true, practice: true }, // Devolver el evento con sus relaciones
        });
    } catch (error) {
        // Captura errores si, por ejemplo, un ID de categoría no existe
        throw new AppError('Error al crear el evento. Asegúrate de que todas las categorías existan.', 400);
    }
};

/**
 * Obtiene todos los eventos.
 * @returns {Promise<Array<object>>} Un arreglo de todos los eventos.
 */
const getAllEvents = async () => {
    return prisma.event.findMany({
        orderBy: { date_time: 'asc' }, // Ordenar por fecha ascendente
        include: {
            categories: { select: { id: true, name: true } },
            _count: { select: { matches: true } },
        }
    });
};

/**
 * Obtiene un evento por su ID.
 * @param {string} eventId - El ID del evento.
 * @returns {Promise<object>} El evento encontrado.
 */
const getEventById = async (eventId) => {
    const id = parseInt(eventId, 10);
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            categories: true,
            practice: true,
            matches: true, // Incluir los partidos asociados
        }
    });

    if (!event) {
        throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
    }
    return event;
};

/**
 * Actualiza un evento.
 * @param {string} eventId - El ID del evento a actualizar.
 * @param {object} dataToUpdate - Los datos a actualizar.
 * @returns {Promise<object>} El evento actualizado.
 */
const updateEvent = async (eventId, dataToUpdate) => {
    const id = parseInt(eventId, 10);
    try {
        return await prisma.event.update({
            where: { id },
            data: dataToUpdate,
        });
    } catch (error) {
        if (error.code === 'P2025') { // Código de Prisma para "Record to update not found"
            throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
        }
        throw error;
    }
};

/**
 * Elimina un evento por su ID.
 * @param {string} eventId - El ID del evento a eliminar.
 */
const deleteEvent = async (eventId) => {
    const id = parseInt(eventId, 10);
    try {
        return await prisma.event.delete({ where: { id } });
    } catch (error) {
        if (error.code === 'P2025') { // Código de Prisma para "Record to delete not found"
            throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
        }
        throw error;
    }
};

/**
 * Crea un nuevo partido dentro de un evento existente.
 * @param {string} eventId - El ID del evento contenedor.
 * @param {object} matchData - Datos del partido (home_category_id, away_category_id).
 * @returns {Promise<object>} El partido creado.
 */
const createMatch = async (eventId, matchData) => {
    const id = parseInt(eventId, 10);
    const { home_category_id, away_category_id } = matchData;

    // 1. Verificar que el evento contenedor exista y sea del tipo correcto.
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
        throw new NotFoundError(`El evento con ID ${id} no existe.`);
    }
    if (event.type !== EventType.MATCH && event.type !== EventType.TOURNAMENT) {
        throw new BadRequestError(`No se pueden añadir partidos a un evento de tipo '${event.type}'.`);
    }

    // 2. Verificar que ambas categorías existan.
    const categories = await prisma.category.findMany({
        where: { id: { in: [home_category_id, away_category_id] } },
    });
    if (categories.length !== 2) {
        throw new NotFoundError('Una o ambas categorías especificadas no existen.');
    }

    // 3. Crear el partido.
    return prisma.match.create({
        data: {
            event: { connect: { id } },
            homeCategory: { connect: { id: home_category_id } },
            awayCategory: { connect: { id: away_category_id } },
        },
        include: {
            homeCategory: { select: { id: true, name: true } },
            awayCategory: { select: { id: true, name: true } },
        }
    });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    createMatch,
};