const attendanceService = require('../services/attendance.service');

/**
 * Registra la asistencia masiva para un evento.
 */
const recordAttendance = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { date, attendances } = req.body;
        const { id: recorderId } = req.user; // Obtenemos el ID del usuario autenticado

        // attendances debe ser un array: [{ player_profile_id: 1, status: 'PRESENT', notes: '' }, ...]
        const results = await attendanceService.recordEventAttendance(eventId, date, attendances, recorderId);

        res.status(200).json({ ok: true, msg: 'Asistencia registrada exitosamente.', results });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene la asistencia de un evento.
 */
const getAttendance = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { date } = req.query; // Opcional: ?date=2024-08-20

        const attendance = await attendanceService.getEventAttendance(eventId, date);

        res.status(200).json({ ok: true, attendance });
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina un registro de asistencia.
 */
const deleteAttendance = async (req, res, next) => {
    try {
        const { id } = req.params;
        await attendanceService.deleteAttendance(id);
        res.status(200).json({ ok: true, msg: 'Registro de asistencia eliminado.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    recordAttendance,
    getAttendance,
    deleteAttendance
};