const prisma = require('../db/prisma');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * Crea un nuevo anuncio.
 */
const createAnnouncement = async (userId, data) => {
    const { title, content, valid_from, valid_until } = data;

    // Verificar si ya existe un anuncio idéntico (mismo título y contenido)
    const existingAnnouncement = await prisma.announcement.findFirst({
        where: { title, content }
    });

    if (existingAnnouncement) {
        throw new ConflictError('Ya existe un anuncio con el mismo título y contenido.');
    }

    // Si no se envía valid_from, se asume "ahora"
    const fromDate = valid_from ? new Date(valid_from) : new Date();
    let untilDate = null;

    if (valid_until) {
        untilDate = new Date(valid_until);
        if (untilDate <= fromDate) {
            throw new BadRequestError('La fecha de fin (valid_until) debe ser posterior a la fecha de inicio (valid_from).');
        }
    }

    return prisma.announcement.create({
        data: {
            author_id: userId,
            title,
            content,
            valid_from: fromDate,
            valid_until: untilDate
        }
    });
};

/**
 * Obtiene solo los anuncios activos (vigentes) para mostrar a los usuarios.
 */
const getActiveAnnouncements = async () => {
    const now = new Date();
    return prisma.announcement.findMany({
        where: {
            // 1. Que ya haya empezado (valid_from <= now)
            valid_from: { lte: now },
            // 2. Y que no haya terminado (valid_until >= now O valid_until es null)
            OR: [
                { valid_until: { gte: now } },
                { valid_until: null }
            ]
        },
        orderBy: { valid_from: 'desc' }, // Los más recientes primero
        include: {
            author: {
                select: {
                    email: true,
                    profile: { select: { full_name: true } }
                }
            }
        }
    });
};

/**
 * Obtiene TODOS los anuncios (para administración).
 */
const getAllAnnouncements = async () => {
    return prisma.announcement.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            author: {
                select: {
                    email: true,
                    profile: { select: { full_name: true } }
                }
            }
        }
    });
};

/**
 * Obtiene un anuncio por su ID.
 */
const getAnnouncementById = async (id) => {
    const announcementId = parseInt(id, 10);
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
            author: {
                select: {
                    email: true,
                    profile: { select: { full_name: true } }
                }
            }
        }
    });

    if (!announcement) {
        throw new NotFoundError('Anuncio no encontrado.');
    }

    return announcement;
};

/**
 * Actualiza un anuncio existente.
 */
const updateAnnouncement = async (id, userId, userRole, data) => {
    const announcementId = parseInt(id, 10);
    const { title, content, valid_from, valid_until } = data;

    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

    if (!announcement) {
        throw new NotFoundError('Anuncio no encontrado.');
    }

    // Validación de permisos: ADMIN o el autor
    if (userRole !== 'ADMIN' && announcement.author_id !== userId) {
        throw new BadRequestError('No tienes permiso para editar este anuncio.');
    }

    // Lógica de fechas para asegurar consistencia
    let newFrom = announcement.valid_from;
    let newUntil = announcement.valid_until;

    if (valid_from) {
        newFrom = new Date(valid_from);
    }
    // valid_until puede venir como null explícitamente para quitar la fecha de fin
    if (valid_until !== undefined) {
        newUntil = valid_until ? new Date(valid_until) : null;
    }

    if (newUntil && newUntil <= newFrom) {
        throw new BadRequestError('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    return prisma.announcement.update({
        where: { id: announcementId },
        data: {
            title,
            content,
            valid_from: valid_from ? newFrom : undefined,
            valid_until: valid_until !== undefined ? newUntil : undefined
        }
    });
};

/**
 * Elimina un anuncio.
 * Solo permite borrar si eres ADMIN o el autor del anuncio.
 */
const deleteAnnouncement = async (id, userId, userRole) => {
    const announcementId = parseInt(id, 10);
    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });

    if (!announcement) {
        throw new NotFoundError('Anuncio no encontrado.');
    }

    // Validación de permisos
    if (userRole !== 'ADMIN' && announcement.author_id !== userId) {
        throw new BadRequestError('No tienes permiso para eliminar este anuncio.');
    }

    return prisma.announcement.delete({ where: { id: announcementId } });
};

module.exports = {
    createAnnouncement,
    getActiveAnnouncements,
    getAllAnnouncements,
    deleteAnnouncement,
    getAnnouncementById,
    updateAnnouncement
};