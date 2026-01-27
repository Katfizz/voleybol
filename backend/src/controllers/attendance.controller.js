const attendanceService = require('../services/attendance.service');
const reportService = require('../services/report.service');

/**
 * Registra la asistencia masiva para un evento.
 */
const recordAttendance = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { date, attendances } = req.body;
        const { id: recorderId } = req.user;

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
        const { date } = req.query;

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

/**
 * Obtiene un reporte de asistencia por categoría.
 */
const getAttendanceReport = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const report = await attendanceService.getCategoryAttendanceReport(categoryId);
        res.status(200).json({ ok: true, report });
    } catch (error) {
        next(error);
    }
};

/**
 * Genera y descarga un reporte de asistencia en Excel.
 */
const exportAttendanceToExcel = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const reportData = await attendanceService.getCategoryAttendanceReport(categoryId);

        const buffer = await reportService.generateAttendanceExcel(reportData);

        const filename = `reporte_asistencia_${reportData.category.name.replace(/\s+/g, '_')}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.status(200).send(buffer);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    recordAttendance,
    getAttendance,
    deleteAttendance,
    getAttendanceReport,
    exportAttendanceToExcel
};