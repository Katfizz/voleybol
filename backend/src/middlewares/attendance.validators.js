const { body, param, query } = require('express-validator');
const { validateFields } = require('./validate-fields');

const validateEventId = [
    param('eventId')
        .isInt({ min: 1 })
        .withMessage('El ID del evento debe ser un número entero positivo.'),
    validateFields
];

const validateRecordAttendance = [
    body('date')
        .exists().withMessage('La fecha es obligatoria.')
        .isISO8601().withMessage('La fecha debe tener formato YYYY-MM-DD.'),
    body('attendances')
        .isArray({ min: 1 })
        .withMessage('Debe enviar un arreglo de asistencias con al menos un registro.'),
    body('attendances.*.player_profile_id')
        .isInt({ min: 1 })
        .withMessage('El ID del perfil de jugador debe ser un entero positivo.'),
    body('attendances.*.status')
        .isIn(['PRESENT', 'ABSENT', 'EXCUSED'])
        .withMessage('El estado debe ser PRESENT, ABSENT o EXCUSED.'),
    body('attendances.*.notes')
        .optional()
        .isString()
        .withMessage('Las notas deben ser texto.'),
    validateFields
];

const validateGetAttendance = [
    query('date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de filtro debe tener formato YYYY-MM-DD.'),
    validateFields
];

const validateAttendanceId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del registro de asistencia debe ser un número entero positivo.'),
    validateFields
];

module.exports = {
    validateEventId,
    validateRecordAttendance,
    validateGetAttendance,
    validateAttendanceId
};