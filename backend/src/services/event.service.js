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

    if (categoryIds && categoryIds.length > 0) {
        // 1. Validación: Asegurarse de que todas las categorías proporcionadas existan.
        const foundCategories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true },
        });

        if (foundCategories.length !== categoryIds.length) {
            const foundCategoryIds = new Set(foundCategories.map(c => c.id));
            const notFoundIds = categoryIds.filter(id => !foundCategoryIds.has(id));
            throw new BadRequestError(`Las siguientes categorías no existen: ${notFoundIds.join(', ')}.`);
        }

        // 2. Validación: Un equipo no puede tener dos eventos a la misma hora.
        const conflictingEvent = await prisma.event.findFirst({
            where: {
                date_time: date_time,
                categories: {
                    some: { id: { in: categoryIds } }
                }
            },
            include: {
                categories: {
                    where: { id: { in: categoryIds } },
                    select: { name: true }
                }
            }
        });

        if (conflictingEvent) {
            const conflictingCategoryNames = conflictingEvent.categories.map(c => c.name).join(', ');
            throw new ConflictError(`Conflicto de horario: El/los equipo(s) '${conflictingCategoryNames}' ya participa(n) en otro evento a la misma hora.`);
        }
    }

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

    return prisma.event.create({
        data,
        include: { categories: true, practice: true }, // Devolver el evento con sus relaciones
    });
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
            matches: { // Incluir los partidos asociados con detalles de los equipos
                include: {
                    homeCategory: { select: { id: true, name: true } },
                    awayCategory: { select: { id: true, name: true } },
                }
            },
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

    // Validación: Verificar conflicto de horario antes de actualizar.
    // Solo se ejecuta si se actualiza la fecha o las categorías.
    if (dataToUpdate.date_time || dataToUpdate.categoryIds) {
        const eventToUpdate = await prisma.event.findUnique({ where: { id } });
        if (!eventToUpdate) {
            throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
        }

        const checkDateTime = dataToUpdate.date_time || eventToUpdate.date_time;
        const checkCategoryIds = dataToUpdate.categoryIds || (await prisma.event.findUnique({ where: { id }, select: { categories: { select: { id: true } } } })).categories.map(c => c.id);

        if (checkCategoryIds.length > 0) {
            const conflictingEvent = await prisma.event.findFirst({
                where: {
                    id: { not: id }, // Excluir el evento actual de la búsqueda
                    date_time: checkDateTime,
                    categories: {
                        some: { id: { in: checkCategoryIds } }
                    }
                },
                include: {
                    categories: { where: { id: { in: checkCategoryIds } }, select: { name: true } }
                }
            });

            if (conflictingEvent) {
                const conflictingCategoryNames = conflictingEvent.categories.map(c => c.name).join(', ');
                throw new ConflictError(`Conflicto de horario: El/los equipo(s) '${conflictingCategoryNames}' ya participa(n) en otro evento a la misma hora.`);
            }
        }
    }

    const { categoryIds, ...restOfData } = dataToUpdate;

    const prismaData = { ...restOfData };

    // Si se proporciona `categoryIds`, se usa `set` para reemplazar las categorías existentes.
    if (categoryIds) {
        if (!Array.isArray(categoryIds)) {
            throw new BadRequestError('categoryIds debe ser un arreglo de IDs.');
        }
        prismaData.categories = {
            set: categoryIds.map(catId => ({ id: catId })),
        };
    }

    try {
        return await prisma.event.update({
            where: { id },
            data: prismaData,
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

    // 1. Verificar que el evento exista, sea del tipo correcto y obtener sus categorías.
    const event = await prisma.event.findUnique({
        where: { id },
        include: { categories: { select: { id: true } } }
    });

    if (!event) {
        throw new NotFoundError(`El evento con ID ${id} no existe.`);
    }
    if (event.type !== EventType.MATCH && event.type !== EventType.TOURNAMENT) {
        throw new BadRequestError(`No se pueden añadir partidos a un evento de tipo '${event.type}'.`);
    }

    // 2. Validar que los equipos del partido pertenezcan al evento.
    const eventCategoryIds = event.categories.map(c => c.id);
    if (!eventCategoryIds.includes(home_category_id) || !eventCategoryIds.includes(away_category_id)) {
        throw new BadRequestError('Ambos equipos (local y visitante) deben estar previamente asignados al evento.');
    }

    // 3. Crear el partido.
    return prisma.match.create({
        data: {
            event: { connect: { id } },
            homeCategory: { connect: { id: home_category_id } },
            awayCategory: { connect: { id: away_category_id } },
        },
        // Seleccionamos explícitamente los campos a devolver para una respuesta más limpia.
        select: {
            id: true,
            home_category_id: true,
            away_category_id: true,
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