const prisma = require('../db/prisma');
const { NotFoundError } = require('../utils/errors');

/**
 * Registra o actualiza la asistencia de múltiples jugadores para un evento y fecha específicos.
 * @param {string} eventId - ID del evento.
 * @param {string|Date} date - Fecha de la asistencia (YYYY-MM-DD).
 * @param {Array<object>} attendanceList - Lista de objetos { player_profile_id, status, notes }.
 * @returns {Promise<Array<object>>} Los registros de asistencia procesados.
 */
const recordEventAttendance = async (eventId, date, attendanceList) => {
    const id = parseInt(eventId, 10);
    const attendanceDate = new Date(date); // Asegura formato fecha

    // 1. Verificar que el evento exista
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
        throw new NotFoundError(`No se encontró un evento con el ID ${id}.`);
    }

    // 2. Procesar las asistencias en una transacción
    return prisma.$transaction(async (tx) => {
        const results = [];

        for (const record of attendanceList) {
            const { player_profile_id, status, notes } = record;

            // Upsert: Crea si no existe, actualiza si ya existe (basado en el @@unique del schema)
            const entry = await tx.attendance.upsert({
                where: {
                    player_profile_id_event_id_date: {
                        player_profile_id,
                        event_id: id,
                        date: attendanceDate
                    }
                },
                update: {
                    status,
                    notes
                },
                create: {
                    event_id: id,
                    player_profile_id,
                    date: attendanceDate,
                    status,
                    notes
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
            player_profile: { select: { full_name: true, position: true } }
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