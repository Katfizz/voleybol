const prisma = require('../db/prisma');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * Registra o actualiza la asistencia de múltiples jugadores para un evento y fecha específicos.
 * @param {string} eventId - ID del evento.
 * @param {string|Date} date - Fecha de la asistencia (YYYY-MM-DD).
 * @param {Array<object>} attendanceList - Lista de objetos { player_profile_id, status, notes }.
 * @param {number} registrarId - ID del usuario que registra la asistencia.
 * @returns {Promise<Array<object>>} Los registros de asistencia procesados.
 */
const recordEventAttendance = async (eventId, date, attendanceList, registrarId) => {
    const id = parseInt(eventId, 10);
    const attendanceDate = new Date(date); // Asegura formato fecha

    // 1. Verificar que el evento exista
    const event = await prisma.event.findUnique({
        where: { id },
        include: { categories: { select: { id: true } } }
    });
    if (!event) {
        throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
    }

    // Validar que la fecha de asistencia no sea anterior a la fecha del evento
    const eventDate = new Date(event.date_time);
    eventDate.setUTCHours(0, 0, 0, 0);
    if (attendanceDate < eventDate) {
        throw new BadRequestError('La fecha de asistencia no puede ser anterior a la fecha del evento.');
    }

    // 2. Validar que los perfiles de jugador existan
    const playerProfileIds = [...new Set(attendanceList.map(a => parseInt(a.player_profile_id, 10)))];
    const foundProfiles = await prisma.playerProfile.findMany({
        where: { id: { in: playerProfileIds } },
        select: { id: true }
    });

    if (foundProfiles.length !== playerProfileIds.length) {
        const foundIds = new Set(foundProfiles.map(p => p.id));
        const missingIds = playerProfileIds.filter(pid => !foundIds.has(pid));
        throw new BadRequestError(`Los siguientes IDs de perfil de jugador no existen: ${missingIds.join(', ')}.`);
    }

    // Validar que los jugadores pertenezcan a las categorías del evento
    const eventCategoryIds = event.categories.map(c => c.id);
    const unassociatedPlayers = await prisma.playerProfile.findMany({
        where: {
            id: { in: playerProfileIds },
            NOT: {
                categories: { some: { id: { in: eventCategoryIds } } }
            }
        },
        select: { full_name: true }
    });

    if (unassociatedPlayers.length > 0) {
        const names = unassociatedPlayers.map(p => p.full_name).join(', ');
        throw new BadRequestError(`Los siguientes jugadores no están asignados a este evento: ${names}.`);
    }

    // Verificar si ya existe asistencia registrada para alguno de los jugadores en esa fecha
    const existingAttendances = await prisma.attendance.findMany({
        where: {
            event_id: id,
            date: attendanceDate,
            player_profile_id: { in: playerProfileIds }
        },
        include: { player_profile: { select: { full_name: true } } }
    });

    if (existingAttendances.length > 0) {
        const names = existingAttendances.map(a => a.player_profile.full_name).join(', ');
        throw new ConflictError(`Ya se registró asistencia para los siguientes jugadores en esta fecha: ${names}.`);
    }

    // 3. Procesar las asistencias en una transacción
    return prisma.$transaction(async (tx) => {
        const results = [];

        for (const record of attendanceList) {
            const { player_profile_id, status, notes } = record;
            const playerId = parseInt(player_profile_id, 10);

            // Upsert: Crea si no existe, actualiza si ya existe (basado en el @@unique del schema)
            const entry = await tx.attendance.upsert({
                where: {
                    player_profile_id_event_id_date: {
                        player_profile_id: playerId,
                        event_id: id,
                        date: attendanceDate
                    }
                },
                update: {
                    status,
                    notes,
                    recorded_by_id: registrarId
                },
                create: {
                    event_id: id,
                    player_profile_id: playerId,
                    date: attendanceDate,
                    status,
                    notes,
                    recorded_by_id: registrarId
                }
            });
            results.push(entry);
        }

        return results;
    });
};

/**
 * Obtiene la asistencia de un evento, opcionalmente filtrada por fecha.
 * @param {string} eventId - ID del evento.
 * @param {string} [date] - Fecha opcional (YYYY-MM-DD).
 */
const getEventAttendance = async (eventId, date) => {
    const id = parseInt(eventId, 10);
    const whereClause = { event_id: id };

    if (date) {
        whereClause.date = new Date(date);
    }

    return prisma.attendance.findMany({
        where: whereClause,
        include: {
            player_profile: { select: { full_name: true, position: true } },
            recorded_by: { select: { email: true } } // Incluimos info de quién registró
        },
        orderBy: { player_profile: { full_name: 'asc' } }
    });
};

/**
 * Elimina un registro de asistencia por su ID.
 * @param {string} attendanceId - ID del registro de asistencia.
 */
const deleteAttendance = async (attendanceId) => {
    const id = parseInt(attendanceId, 10);

    const record = await prisma.attendance.findUnique({ where: { id } });

    if (!record) {
        throw new NotFoundError(`No se encontró el registro de asistencia con ID ${id}.`);
    }

    return prisma.attendance.delete({ where: { id } });
};

module.exports = {
    recordEventAttendance,
    getEventAttendance,
    deleteAttendance
};